from flask import Blueprint, request, session
from flask_login import current_user
from flask_socketio import emit, join_room

from v1 import socketio

call = Blueprint('call_server', __name__)


_users_in_room = {} # stores room wise user list
_room_of_sid = {} # stores room joined by an user
_name_of_sid = {} # stores display name of users
user_id_to_sid = {}


@socketio.on_error_default
def default_error_handler(e):
    print("Error: {}".format(e))
    socketio.stop()

# -------- video -------- #

@socketio.on('video-call-request')
def handle_call_request(request):
    sender_id = request.get('sender_id')
    target_id = request.get('target_id')
    room = request.get('room')
    print("Call request from: {}, to: {}, Room[{}]".format(sender_id, target_id, room))
    emit('video-call-request', request, broadcast=True)


@socketio.on('video-call-declined')
def handle_call_declined(response):
    sender_id = response.get('sender_id')
    target_id = response.get('target_id')
    print("Call request from: {}, to: {}, declined".format(target_id, sender_id))
    emit('video-call-declined', response, broadcast=True, include_self=False)


@socketio.on('video-call-cancelled')
def handle_call_cancelled(request):
    sender_id = request.get('sender_id')
    target_id = request.get('target_id')
    print("Call request from: {}, to: {}, cancelled by caller".format(target_id, sender_id))
    emit('video-call-cancelled', request, broadcast=True, include_self=False)


@socketio.on('video-call-accepted')
def handle_call_accepted(response):
    sender_id = response.get('sender_id')
    target_id = response.get('target_id')
    room = response.get('room')
    print("Call request from: {}, to: {}, Room[{}] accepted".format(target_id, sender_id, room))
    emit('video-call-accepted', response, broadcast=True, include_self=False)


@socketio.on("join-video-call")
def on_join_call(data):
    user_id = session.get('user_id')
    if user_id:
        room_id = data["room_id"]
        display_name = current_user.username
        
        # register user_id to the room
        join_room(room_id)
        _room_of_sid[user_id] = room_id
        user_id_to_sid[user_id] = request.sid
        _name_of_sid[request.sid] = display_name

        # broadcast to others in the room
        print("[{}] New member joined: {}[{}]".format(room_id, display_name, user_id))
        emit("user-video-connect", {"user_id": user_id, "name": display_name}, broadcast=True, include_self=False, room=room_id)
        
        # add to user list maintained on the server
        if room_id not in _users_in_room:
            _users_in_room[room_id] = [user_id]
            emit("user-video-list", {"my_id": user_id})  # send own id only
        else:
            usrlist = {u_id: _name_of_sid[user_id_to_sid[u_id]] for u_id in _users_in_room[room_id]}
            emit("user-video-list", {"list": usrlist, "my_id": user_id})  # send list of existing users to the new member
            if user_id not in usrlist:
                _users_in_room[room_id].append(user_id)  # add new member to user list maintained on the server
            else:
                pass

        print("\nusers: ", _users_in_room, "\n")
    else:
        # Handle case where user is not authenticated
        pass


@socketio.on("video-call-ended")
def on_call_ended(response):
    emit("video-call-ended", response, broadcast=True, include_self=False)


@socketio.on("disconnect")
def on_disconnect():
    sid = request.sid

    # Check if the disconnected socket has a corresponding user_id
    user_id = None
    for uid, socket_id in user_id_to_sid.items():
        if socket_id == sid:
            user_id = uid
            break

    if user_id:
        room_id = _room_of_sid.get(user_id)  # Use sid to get the room_id
        display_name = _name_of_sid.get(sid, "Unknown")  # Use sid to get the display_name

        print("[{}] Member left: {}[{}]".format(room_id, display_name, user_id))

        # Emit both audio and video disconnect events
        emit("user-video-disconnect", {"user_id": user_id}, broadcast=True, include_self=False, room=room_id)
        emit("user-audio-disconnect", {"user_id": user_id}, broadcast=True, include_self=False, room=room_id)

        # Check if room_id is valid before accessing _users_in_room
        if room_id and room_id in _users_in_room:
            _users_in_room[room_id].remove(user_id)
            if len(_users_in_room[room_id]) == 0:
                _users_in_room.pop(room_id)

            _room_of_sid.pop(user_id)
            _name_of_sid.pop(sid)
            user_id_to_sid.pop(user_id)  # Remove the user_id from the mapping
            
            print("\nusers: ", _users_in_room, "\n")
    else:
        # Handle cases where the user_id is not found
        pass


@socketio.on("video-data")
def on_data(data):
    sender_user_id = data['sender_id']
    target_user_id = data['target_id']

    # Use user_id_to_sid to get the corresponding socket ID
    sender_sid = user_id_to_sid.get(sender_user_id)
    target_sid = user_id_to_sid.get(target_user_id)

    if sender_sid and target_sid:
        if data["type"] != "new-ice-candidate":
            print('{} message from {} to {}'.format(data["type"], sender_user_id, target_user_id))
        socketio.emit('video-data', data, room=target_sid)
    else:
        # Handle cases where sender or target user is not found
        pass


# -------- audio -------- #
    
@socketio.on('audio-call-request')
def handle_call_request(request):
    sender_id = request.get('sender_id')
    target_id = request.get('target_id')
    room = request.get('room')
    print("Call request from: {}, to: {}, Room[{}]".format(sender_id, target_id, room))
    emit('audio-call-request', request, broadcast=True)


@socketio.on('audio-call-declined')
def handle_call_declined(response):
    sender_id = response.get('sender_id')
    target_id = response.get('target_id')
    print("Call request from: {}, to: {}, declined".format(target_id, sender_id))
    emit('audio-call-declined', response, broadcast=True, include_self=False)


@socketio.on('audio-call-cancelled')
def handle_call_cancelled(request):
    sender_id = request.get('sender_id')
    target_id = request.get('target_id')
    print("Call request from: {}, to: {}, cancelled by caller".format(target_id, sender_id))
    emit('audio-call-cancelled', request, broadcast=True, include_self=False)


@socketio.on('audio-call-accepted')
def handle_call_accepted(response):
    sender_id = response.get('sender_id')
    target_id = response.get('target_id')
    room = response.get('room')
    print("Call request from: {}, to: {}, Room[{}] accepted".format(target_id, sender_id, room))
    emit('audio-call-accepted', response, broadcast=True, include_self=False)


@socketio.on("join-audio-call")
def on_join_call(data):
    user_id = session.get('user_id')
    if user_id:
        room_id = data["room_id"]
        display_name = current_user.username
        
        # register user_id to the room
        join_room(room_id)
        _room_of_sid[user_id] = room_id
        user_id_to_sid[user_id] = request.sid
        _name_of_sid[request.sid] = display_name

        # broadcast to others in the room
        print("[{}] New member joined: {}[{}]".format(room_id, display_name, user_id))
        emit("user-audio-connect", {"user_id": user_id, "name": display_name}, broadcast=True, include_self=False, room=room_id)
        
        # add to user list maintained on the server
        if room_id not in _users_in_room:
            _users_in_room[room_id] = [user_id]
            emit("user-audio-list", {"my_id": user_id})  # send own id only
        else:
            usrlist = {u_id: _name_of_sid[user_id_to_sid[u_id]] for u_id in _users_in_room[room_id]}
            emit("user-audio-list", {"list": usrlist, "my_id": user_id})  # send list of existing users to the new member
            if user_id not in usrlist:
                _users_in_room[room_id].append(user_id)  # add new member to user list maintained on the server
            else:
                pass

        print("\nusers: ", _users_in_room, "\n")
    else:
        # Handle case where user is not authenticated
        pass


@socketio.on("audio-call-ended")
def on_call_ended(response):
    emit("audio-call-ended", response, broadcast=True, include_self=False)


@socketio.on("audio-data")
def on_data(data):
    sender_user_id = data['sender_id']
    target_user_id = data['target_id']

    # Use user_id_to_sid to get the corresponding socket ID
    sender_sid = user_id_to_sid.get(sender_user_id)
    target_sid = user_id_to_sid.get(target_user_id)

    if sender_sid and target_sid:
        if data["type"] != "new-ice-candidate":
            print('{} message from {} to {}'.format(data["type"], sender_user_id, target_user_id))
        socketio.emit('audio-data', data, room=target_sid)
    else:
        # Handle cases where sender or target user is not found
        pass

