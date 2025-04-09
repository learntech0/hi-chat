from uuid import uuid4
from datetime import datetime
from v1 import db

class Chat(db.Model):
    __tablename__ = 'chat'
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    message_id = db.Column(db.String(64), unique=True, default=str(uuid4()))
    sender_id = db.Column(db.String(), db.ForeignKey('user.user_id'))
    receiver_id = db.Column(db.String())
    message = db.Column(db.Text)
    filename = db.Column(db.String(64))
    time = db.Column(db.DateTime(), default=datetime.now())

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()