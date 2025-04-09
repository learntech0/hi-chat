import os
from v1 import socketio, create_app
from dotenv import load_dotenv

load_dotenv()

app = create_app()

# app.app_context().push()    
# db.drop_all()
# db.create_all()

if __name__ == "__main__":
    host = os.getenv('HOST')
    port = os.getenv('PORT')
    print(" * Running server")
    if not host:
        host = '0.0.0.0'
    if not port:
        port = '5000'
    socketio.run(app, debug=True, host=host, port=port)