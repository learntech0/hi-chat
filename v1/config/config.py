import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

database_url = os.getenv('POSTGRES_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    FLASK_JWT_SECRET_KEY = os.getenv('FLASK_JWT_SECRET_KEY')
    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = os.getenv('MAIL_PORT')
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS')
    # MAIL_USE_SSL = os.getenv('MAIL_USE_SSL')
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER')

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///db.sqlite3')

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = database_url

def get_env(var_name):
    try:
        return os.getenv(var_name)
    except KeyError:
        raise KeyError("Set the {} environment variable".format(var_name))