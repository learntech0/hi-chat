from datetime import datetime
from v1 import db

class Contact(db.Model):
    __tablename__ = 'contact'
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(), db.ForeignKey('user.user_id'))
    contact_id = db.Column(db.String(), db.ForeignKey('user.user_id'))
    contact_name = db.Column(db.String(60))
    created_at = db.Column(db.DateTime(), default=datetime.now())

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()