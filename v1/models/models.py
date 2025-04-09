from uuid import uuid4
from datetime import datetime, timedelta
from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer as Serializer, SignatureExpired, BadSignature
from flask_login import UserMixin
from v1 import db, login_manager


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(64), unique=True, default=str(uuid4()))
    email = db.Column(db.String(60), unique=True, nullable=False)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(40))
    profile = db.Column(db.String(64), default='profile.jpg')
    status = db.Column(db.DateTime(), default=datetime.now())
    created_at = db.Column(db.DateTime(), default=datetime.now())
    verified = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<User {self.username}>"
    
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    @classmethod
    def get_username(cls, username):
        return cls.query.filter_by(username=username).first()
    
    @classmethod
    def get_email(cls, email):
        return cls.query.filter_by(email=email).first()
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def get_reset_token(self, max_age=1800):
        s = Serializer(current_app.config['SECRET_KEY'])
        expires = datetime.utcnow() + timedelta(seconds=max_age)
        expires_timestamp = int(expires.timestamp())
        token =  s.dumps({'user_id': self.user_id, 'exp': expires_timestamp})
        return token
    
    @staticmethod
    def verify_reset_token(token):
        s = Serializer(current_app.config['SECRET_KEY'])
        # decoded_token = s.loads(token)
        # print("Decoded Token:", decoded_token)
        try:
            data = s.loads(token)
            user_id = data['user_id']
            print(f"user_id:: {user_id}")
            current_timestamp = int(datetime.utcnow().timestamp())
            if 'exp' in data and data['exp'] < current_timestamp:
                print("Token has expired.")
                return None
        except SignatureExpired:
            print("Token has expired.")
            return None
        except BadSignature:
            print("Invalid token signature.")
            return None
        user = User.query.filter_by(user_id=user_id).first()
        return user

    def reg_date(self):
        return self.created_at.strftime('%Y-%m-%d')
    
class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime(), default=datetime.now())

    def __repr__(self):
        return f"<Token {self.jti}>"
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    
class Account(db.Model):
    __tablename__ = 'account'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    account_id = db.Column(db.String(64), unique=True, nullable=False)
    user_id = db.Column(db.String(64), db.ForeignKey('user.user_id'))
    is_active = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime(), default=datetime.now())
    updated_at = db.Column(db.DateTime(), default=datetime.now())

    def acc_reg_date(self):
        return self.created_at.strftime('%Y-%m-%d')

    def acc_update_date(self):
        return self.updated_at.strftime('%Y-%m-%d')
    
class Chat(db.Model):
    __tablename__ = 'chat'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    msg_id = db.Column(db.String(66), unique=True, nullable=False)
    incoming_msg_id = db.Column(db.String(64), db.ForeignKey('user.user_id'))
    outgoing_msg_id = db.Column(db.String(64), db.ForeignKey('user.user_id'))
    msg = db.Column(db.Text)
    filename = db.Column(db.String(64))
    time = db.Column(db.DateTime(), default=datetime.now())

class Group(db.Model):
    __tablename__ = 'group'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    group_id = db.Column(db.String(64), unique=True, nullable=False)
    group_name = db.Column(db.String(60))
    description = db.Column(db.String(255))
    profile = db.Column(db.String(64), default='profile.jpg')
    created_at = db.Column(db.DateTime(), default=datetime.now())
    invite_link = db.Column(db.String(255))

class UserGroup(db.Model):
    __tablename__ = 'usergroup'
    user_id = db.Column(db.String(64), db.ForeignKey('user.user_id'), primary_key=True)
    group_id = db.Column(db.String(64), db.ForeignKey('group.group_id'), primary_key=True)
    is_admin = db.Column(db.Boolean, default=False)

class Contact(db.Model):
    __tablename__ = 'contact'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(64), db.ForeignKey('user.user_id'))
    contact_id = db.Column(db.String(64), db.ForeignKey('user.user_id'))
    contact_name = db.Column(db.String(60))
    created_at = db.Column(db.DateTime(), default=datetime.now())
