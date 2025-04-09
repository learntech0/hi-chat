import os
from v1 import socketio, create_app
from dotenv import load_dotenv

load_dotenv()

app = create_app()

if __name__ == "__main__":
    host = os.getenv('HOST', '0.0.0.0')
    port = os.getenv('PORT', '5000')
    print(" * Running server")
    socketio.run(app, host=host, port=port)