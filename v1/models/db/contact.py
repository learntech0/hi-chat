from flask import jsonify
from v1.models.user import User
from v1.models.contact import Contact


# Function to get contacts for a given user_id
def get_contacts(user_id):
    
    user = User.query.filter_by(user_id=user_id).first()

    if user:
        contact_list = []
        contacts = Contact.query.filter_by(user_id=user_id).all()

        for contact in contacts:
            user_contact = User.query.filter_by(user_id=contact.contact_id).first()

            contact_data = {
                'contact_id': contact.contact_id,
                'contact_name': contact.contact_name,
                'created_at': contact.created_at,
                'profile': user_contact.profile
            }

            contact_list.append(contact_data)

        return jsonify({'user_id': user_id, 'contacts': contact_list})

    else:
        return jsonify({'error': 'User not found'}), 404