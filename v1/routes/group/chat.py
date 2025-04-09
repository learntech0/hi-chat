from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, current_user
from v1.models.chat import Chat
from v1.models.user import User


chat_bp = Blueprint('chat', __name__, url_prefix='/api')


@chat_bp.get('/group/<string:group_id>')
@jwt_required()
def get_chats(group_id):

    messages = Chat.query.filter(Chat.receiver_id == group_id).order_by(Chat.id).all() 

    message_list = []

    for message in messages:
        
        user = User.query.filter_by(user_id=message.sender_id).first()

        message_data = {
            'receiver_id': message.receiver_id,
            'time': message.time.strftime('%Y-%m-%d_%H:%M'),
            'sender': {
                'id': message.sender_id,
                'username': user.username,
                'profile': user.profile
            }
        }

        if message.message:
            message_data['message'] = message.message

        if message.filename:
            message_data['file'] = message.filename

        message_list.append(message_data)
        
    return jsonify({"messages": message_list}), 200