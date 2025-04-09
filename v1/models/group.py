from uuid import uuid4
from datetime import datetime
from v1 import db

class Group(db.Model):
    __tablename__ = 'group'
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    group_id = db.Column(db.String(64), unique=True, default=str(uuid4()))
    group_name = db.Column(db.String(60))
    description = db.Column(db.String(255))
    profile = db.Column(db.String(64), default='default.png')
    created_at = db.Column(db.DateTime(), default=datetime.now())
    invite_link = db.Column(db.String(255))

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

class UserGroup(db.Model):
    __tablename__ = 'usergroup'
    user_id = db.Column(db.String(), db.ForeignKey('user.user_id'), primary_key=True)
    group_id = db.Column(db.String(), db.ForeignKey('group.group_id'), primary_key=True)
    is_admin = db.Column(db.Boolean, default=False)

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()