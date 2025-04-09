import os
from flask import Flask
from flask_migrate import Migrate
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from v1.config.config import Config, DevelopmentConfig, ProductionConfig

# extensions
socketio = SocketIO()
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()
login_manager = LoginManager()
login_manager.login_view = 'auth_view.login'
login_manager.login_message_category = 'info'
mail = Mail()

def create_app():
    app = Flask(__name__)
    
    # Determine environment and load the correct config
    env = os.getenv('FLASK_ENV', 'production').lower()
    if env == "development":
        app.config.from_object(DevelopmentConfig)
    else:
        app.config.from_object(ProductionConfig)

    # initialize extensions
    socketio.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)

    # import blueprints
    from v1.routes.chat.users import user_bp
    from v1.routes.chat.chat import chat_bp
    from v1.routes.chat.recent_chats import recent_chats_bp
    from v1.routes.chat.views import chat_view
    from v1.routes.group.groups import group_bp
    from v1.routes.group.views import group_view
    from v1.routes.contact.contacts import contact_bp
    from v1.routes.contact.views import contact_view
    from v1.routes.auth.auth import auth_bp
    from v1.routes.auth.views import auth_view
    from v1.errors.errors import errors
    from v1.utils.jwt import jwt_handler
    from v1.routes.routes import index_view
    from v1.server.message import message
    from v1.server.call import call

    # register blueprints
    app.register_blueprint(user_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(recent_chats_bp)
    app.register_blueprint(chat_view)
    app.register_blueprint(group_bp)
    app.register_blueprint(group_view)
    app.register_blueprint(contact_bp)
    app.register_blueprint(contact_view)
    app.register_blueprint(auth_bp)
    app.register_blueprint(auth_view)
    app.register_blueprint(errors)
    app.register_blueprint(jwt_handler)
    app.register_blueprint(index_view)
    app.register_blueprint(message)
    app.register_blueprint(call)

    return app
