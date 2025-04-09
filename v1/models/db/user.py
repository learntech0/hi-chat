
from sqlalchemy import or_
from v1.models.user import User
from v1.models.contact import Contact


def query_contact_users(user_id, query):
    contact_users = (
        User.query.join(Contact, or_(Contact.user_id == User.user_id, Contact.contact_id == User.user_id))
        .filter((Contact.user_id == user_id))
        .filter(User.user_id != user_id)
        .filter(User.username.ilike(f'%{query}%') if query else True)
        .all()
    )
    return contact_users