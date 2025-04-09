from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, current_user
from sqlalchemy import or_
from v1.utils.schemas import UserSchema
from v1.models.user import User
from v1.models.chat import Chat
from v1.models.contact import Contact


user_bp = Blueprint('user', __name__, url_prefix='/api')


@user_bp.get('/users')
@jwt_required()
def get_all_users():

    id = current_user.user_id
    q = request.args.get('query', '').strip()
    page = request.args.get('page', default=1, type=int)
    per = request.args.get('per_page', default=8, type=int)

    users = query_contact_users(id, q, page, per)

    result = UserSchema().dump(users.items, many=True)

    add_latest_chat_to_users(result)

    return jsonify({"users": result}), 200


def query_contact_users(user_id, query, page, per_page):
    contact_users = (
        User.query.join(Contact, or_(Contact.user_id == User.user_id, Contact.contact_id == User.user_id))
        .filter((Contact.user_id == user_id))
        .filter(User.user_id != user_id)
        .filter(User.username.ilike(f'%{query}%') if query else True)
        .paginate(page=page, per_page=per_page)
    )
    return contact_users


def add_latest_chat_to_users(users_data):
    for user_data in users_data:
        latest_chat = get_latest_chat(user_data['user_id'])
        user_data['latest_chat'] = latest_chat

def get_latest_chat(user_id):
    latest_chat = (
        Chat.query.filter(
            or_(
                (Chat.sender_id == user_id),
                (Chat.receiver_id == user_id)
            )
        )
        .order_by(Chat.time.desc())
        .first()
    )
    if latest_chat:
        return {
            'message': latest_chat.message,
            'time': latest_chat.time.strftime('%H:%M')
        }
    else:
        return None
    

