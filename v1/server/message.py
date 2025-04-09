import array
import hashlib
import os
from os.path import splitext
from datetime import datetime
from uuid import uuid4
from flask import Blueprint, current_app
from flask_socketio import emit

from v1 import socketio
from v1.config.config import get_env
from v1.models.chat import Chat

message = Blueprint('message_server', __name__)

@socketio.on('message')
def handle_message(data):
    time = datetime.now()
    # Access data from the FormData object
    sender_id = data.get('sender_id')
    receiver_id = data.get('receiver_id')
    message = data.get('message')

    # Handle the file data
    file_data = data.get('file')
    if file_data:
        # Convert the ArrayBuffer back to a bytes object
        file_bytes = array.array('B', file_data).tobytes()

        # Generate a unique identifier for the file based on its content
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        
        # Extract the original file extension
        _, file_extension = splitext(data.get('original_filename', 'unknown'))

        # Combine the hash and extension to create the new file name
        filename = f"{file_hash[:16]}{file_extension}"
        print(file_extension)

        if file_extension.lower() in ['.jpg', '.png', '.jpeg']:
            with open(os.path.join(current_app.root_path, get_env('PICTURE_UPLOAD_FOLDER'), filename), 'wb') as f:
                f.write(file_bytes)
        else:
            with open(os.path.join(current_app.root_path, get_env('FILE_UPLOAD_FOLDER'), filename), 'wb') as f:
                f.write(file_bytes)

        message = Chat(
            message_id=str(uuid4()),
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message,
            filename=filename,
            time=time
        )
        message.save()
        
    else:
        if message != "":
            message = Chat(
                message_id=str(uuid4()),
                sender_id=sender_id,
                receiver_id=receiver_id,
                message=message,
                time=time
            )
            message.save()
            
    data['time'] = time.strftime("%Y-%m-%d_%H:%M")

    emit('message', data, broadcast=True)