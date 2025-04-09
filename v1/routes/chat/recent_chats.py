from flask import Blueprint, jsonify, request
from sqlalchemy import or_
from v1.models.user import User
from v1.models.chat import Chat
from flask_jwt_extended import jwt_required, current_user

recent_chats_bp = Blueprint('recent_chats', __name__, url_prefix='/api')

@recent_chats_bp.route("/get_users", methods=['GET'])
@jwt_required()
def get_users():
    q = request.args.get('query', '').strip()
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=8, type=int)

    # Query users who have had a chat with the current user
    users_query = User.query.filter(
        or_(
            Chat.sender_id == current_user.user_id,
            Chat.receiver_id == current_user.user_id
        )
    ).distinct()

    if q:
        users_query = users_query.filter(or_(User.username.ilike(f'%{q}%'), User.name.ilike(f'%{q}%')))

    users = users_query.paginate(page=page, per_page=per_page)

    users_data = []

    if users:
        for user in users.items:
            latest_chat = (
                Chat.query.filter(
                    or_(
                        (Chat.sender_id == user.user_id) & (Chat.receiver_id == current_user.user_id),
                        (Chat.sender_id == current_user.user_id) & (Chat.receiver_id == user.user_id)
                    )
                )
                .order_by(Chat.id.desc())
                .first()
            )

            if latest_chat:
                message = latest_chat.message
                time = latest_chat.time.strftime('%Y-%m-%d_%H:%M')
                
                if latest_chat.sender_id == current_user.user_id:
                    if latest_chat.message and latest_chat.filename:
                        message = 'You: 📁 ' + message if len(message) < 60 else 'You: ' + message[:60] + '...'
                    elif latest_chat.message and not latest_chat.filename:
                        message = 'You: ' + message if len(message) < 60 else 'You: ' + message[:60] + '...'
                    else:
                        message = 'You: 📁 '
                else:
                    if latest_chat.message and latest_chat.filename:
                        message = '📁 ' + message if len(message) < 65 else message[:65] + '...'
                    elif latest_chat.message and not latest_chat.filename:
                        message = message if len(message) < 65 else message[:65] + '...'
                    else:
                        message = '📁'

                user_data = {
                    'user_id': user.user_id,
                    'username': user.username,
                    'profile': user.profile,
                    'latest_chat': {
                        'message': message,
                        'time': time
                    }
                }
                users_data.append(user_data)

        return jsonify({'users': users_data})
    
    return jsonify({'message': "No user found"})
