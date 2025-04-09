from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, current_user
from v1.models.chat import Chat


chat_bp = Blueprint('chat', __name__, url_prefix='/api')


@chat_bp.get('/chat/<string:user_id>')
@jwt_required()
def get_chats(user_id):

    messages = ( 
        Chat.query.filter(
            (
                (Chat.sender_id == current_user.user_id) & (Chat.receiver_id == user_id)
            )
            | (
                (Chat.sender_id == user_id) & (Chat.receiver_id == current_user.user_id)
            )
        ).order_by(Chat.id).all()    
    )

    message_list = []

    for message in messages:

        message_data = {
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'time': message.time.strftime('%Y-%m-%d_%H:%M'),
        }

        if message.message:
            message_data['message'] = message.message

        if message.filename:
            message_data['file'] = message.filename

        message_list.append(message_data)
        
    return jsonify({"chats": message_list}), 200