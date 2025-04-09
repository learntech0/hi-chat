from datetime import datetime
from v1 import db

class TokenBlocklist(db.Model):
    __tablename__ = 'token_blocklist'
    id = db.Column(db.Integer(), primary_key=True)
    jti = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime(), default=datetime.now())

    def __repr__(self):
        return f"<Token {self.jti}>"
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()