from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, current_user
from sqlalchemy import or_
from v1.utils.schemas import GroupSchema
from v1.models.group import UserGroup, Group
from v1.models.chat import Chat


group_bp = Blueprint('group', __name__, url_prefix='/api')


@group_bp.get('/groups')
@jwt_required()
def get_all_groups():

    id = current_user.user_id
    q = request.args.get('query', '').strip()
    page = request.args.get('page', default=1, type=int)
    per = request.args.get('per_page', default=8, type=int)

    groups = get_groups_for_user(id, q, page, per)

    result = GroupSchema().dump(groups.items, many=True)

    add_latest_chat_to_groups(result)

    return jsonify({"groups": result}), 200


def get_groups_for_user(user_id, query, page, per_page):
    base_query = UserGroup.query.filter_by(user_id=user_id)

    if query:
        base_query = base_query.join(Group).filter(Group.group_name.ilike(f'%{query}%'))

    user_groups = base_query.all()
    group_ids = [user_group.group_id for user_group in user_groups]
    groups = Group.query.filter(Group.group_id.in_(group_ids)).paginate(page=page, per_page=per_page)
    return groups


def add_latest_chat_to_groups(groups_data):
    for group_data in groups_data:
        latest_chat = get_latest_chat(group_data['group_id'])
        group_data['latest_chat'] = latest_chat

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
    

