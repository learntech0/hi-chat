from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, current_user
from v1.models.contact import Contact
from v1.models.user import User


contact_bp = Blueprint('contact', __name__, url_prefix='/api')


@contact_bp.get('/get_contacts')
@jwt_required()
def get_user_contacts():

    query = request.args.get('query', '').strip()
    page = request.args.get('page', default=1, type=int)
    per = request.args.get('per_page', default=8, type=int)

    contact_list = []
    contacts = (Contact.query.filter_by(user_id=current_user.user_id)
        .filter(User.username.ilike(f'%{query}%') if query else True)
        .paginate(page=page, per_page=per)
    )
    for contact in contacts:
        user_contact = User.query.filter_by(user_id=contact.contact_id).first()

        contact_data = {
            'user_id': contact.contact_id,
            'username': user_contact.username,
            'email': user_contact.email,
            'name': contact.contact_name,
            'profile': user_contact.profile
        }

        contact_list.append(contact_data)

    return jsonify({'user_id': current_user.user_id, 'contacts': contact_list})
    