const voiceCallLightBox = document.querySelector('.voice-call-lightbox');
const showVoiceCallLightBox = () => { 
    voiceCallLightBox.style.display = "block";
    voiceCallLightBox.classList.add('show'); 
}
const hideVoiceCallLightBox = () => { 
    voiceCallLightBox.classList.remove('show'); 
    voiceCallLightBox.style.display = "none";
}

var my_uid;
var _peer_list = {};

var callName = document.querySelector('.voice-call-lightbox .call-details h5');

// var startAudioCallBtn = document.querySelector('.conversation-buttons #voice-call');
var acceptAudioCallBtn = document.querySelector('.voice-call-lightbox #btn-call');
var endAudioCallBtn = document.querySelector('.voice-call-lightbox #btn-end-call');

target_user = url.searchParams.get('user_id');

// startAudioCallBtn.addEventListener('click', function() {
//     startVoiceCall();
// });

function startVoiceCall() {
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
        localAudio.srcObject = stream;
        localAudio.volume = 0;
        localAudio.muted = 0;  
        setAudioMuteState(audioMuted);                
    })
    .catch((e) => {
        console.log("Error! Unable to start microphone! ", e);
        // document.getElementById("permission_alert").style.display = "block";
    });

    showVoiceCallLightBox();

    callName.innerText = targetname;

    socket.emit('audio-call-request', {
        'sender_name': currentname, 
        'sender_id': current_user_id, 
        'target_id': target_user, 
        'room': current_user_id+'|-|'+target_user 
    });
}


socket.on('audio-call-request', (request) => {
    if (request.target_id == current_user_id) {
        acceptAudioCallBtn.removeAttribute('hidden');
        callName.innerText = request.sender_name;
        console.log('Call request from: ' + request.sender_id)
        showVoiceCallLightBox();
        acceptAudioCallBtn.addEventListener('click', () => {
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                localAudio.srcObject = stream;
                localAudio.volume = 0;
                localAudio.muted = 0; 
                setAudioMuteState(audioMuted);                
            })
            .catch((e) => {
                console.log("Error! Unable to start microphone! ", e);
                // document.getElementById("permission_alert").style.display = "block";
            });
            socket.emit('audio-call-accepted', {
                'sender_id': request.target_id, 
                'target_id': request.sender_id, 
                'room': request.room
            });
            socket.emit("join-audio-call", {"room_id": request.room});
            acceptAudioCallBtn.setAttribute('hidden','hidden'); 
            muteAudioBtn.removeAttribute('hidden');
        });
        endAudioCallBtn.addEventListener('click', () => {
            socket.emit("audio-call-declined", {
                'sender_id': request.target_id, 
                'target_id': request.sender_id
            });
            hideVoiceCallLightBox();
        });
    } else if (request.sender_id == current_user_id) {
        endAudioCallBtn.addEventListener('click', () => {
            socket.emit("audio-call-cancelled", {
                'sender_id': request.sender_id, 
                'target_id': request.target_id
            });
            hideVoiceCallLightBox();
        });
    } else { return }
});

socket.on('audio-call-accepted', (response) => {
    if (response.target_id == current_user_id) {
        socket.emit("join-audio-call", {"room_id": response.room});
        muteAudioBtn.removeAttribute('hidden');
    } else { return }
});

socket.on('audio-call-declined', (response) => {
    if (response.target_id == current_user_id) {
        hideVoiceCallLightBox();
    } else { return }
});

socket.on('audio-call-cancelled', (request) => {
    if (request.target_id == current_user_id) {
        hideVoiceCallLightBox();
    } else { return }
});


socket.on("user-audio-connect", (data) => {
    console.log("user-connect ", data);
    let peer_id = data["user_id"];
    let display_name = data["name"];
    _peer_list[peer_id] = undefined; // add new user to user list
    addAudioElement(peer_id, display_name);
});

socket.on("user-audio-disconnect", (data) => {
    console.log("user-disconnect ", data);
    let peer_id = data["user_id"];
    closeConnection(peer_id);
    removeAudioElement(peer_id);
});

socket.on("user-audio-list", (data) => {
    console.log("user list recvd ", data);
    my_uid = data["my_id"];
    if("list" in data) {   // not the first to connect to room, existing user list recieved
        let recvd_list = data["list"];  
        // add existing users to user list
        for(peer_id in recvd_list) {
            display_name = recvd_list[peer_id];
            _peer_list[peer_id] = undefined;
            addAudioElement(peer_id, display_name);
        } 
        start_webrtc();
    } 
    endAudioCallBtn.addEventListener('click', () => {
        socket.emit("audio-call-ended", {
            'sender_id': my_uid, 
            'target_id': peer_id
        });
        window.location.replace(currentUrl);
    });   
});

socket.on("audio-call-ended", (response) => {
    if (response.target_id == current_user_id) {
        window.location.replace(currentUrl);
    } else { return }
});

function closeConnection(peer_id) {
    if(peer_id in _peer_list) {
        _peer_list[peer_id].onicecandidate = null;
        _peer_list[peer_id].ontrack = null;
        _peer_list[peer_id].onnegotiationneeded = null;

        delete _peer_list[peer_id]; // remove user from user list
    }
}

function log_user_list() {
    for(let key in _peer_list) {
        console.log(`${key}: ${_peer_list[key]}`);
    }
}

//---------------[ webrtc ]--------------------    

var PC_CONFIG = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302', 
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302'
            ]
        }
    ]
};

function log_error(e){console.log("[ERROR] ", e);}
function sendViaServer(data){socket.emit("audio-data", data);}

socket.on("audio-data", (msg) => {
    switch(msg["type"]) {
        case "offer":
            handleOfferMsg(msg);
            break;
        case "answer":
            handleAnswerMsg(msg);
            break;
        case "new-ice-candidate":
            handleNewICECandidateMsg(msg);
            break;
    }
});

function start_webrtc() {
    // send offer to all other members
    for(let peer_id in _peer_list) {
        invite(peer_id);
    }
}

function invite(peer_id) {
    if(_peer_list[peer_id]) {
        console.log("[Not supposed to happen!] Attempting to start a connection that already exists!");
    }
    else if(peer_id === my_uid) {
        console.log("[Not supposed to happen!] Trying to connect to self!");
    }
    else {
        console.log(`Creating peer connection for <${peer_id}> ...`);
        createPeerConnection(peer_id);

        let local_stream = localAudio.srcObject;
        local_stream.getAudioTracks().forEach((track) => {_peer_list[peer_id].addTrack(track, local_stream);});
    }
}

function createPeerConnection(peer_id) {
    _peer_list[peer_id] = new RTCPeerConnection(PC_CONFIG);

    _peer_list[peer_id].onicecandidate = (event) => {handleICECandidateEvent(event, peer_id)};
    _peer_list[peer_id].ontrack = (event) => {handleTrackEvent(event, peer_id)};
    _peer_list[peer_id].onnegotiationneeded = () => {handleNegotiationNeededEvent(peer_id)};
}

function handleNegotiationNeededEvent(peer_id) {
    _peer_list[peer_id].createOffer()
    .then((offer) => {
        return _peer_list[peer_id].setLocalDescription(offer);  
    })
    .then(() => {
        console.log(`sending offer to <${peer_id}> ...`);
        sendViaServer({
            "sender_id": my_uid,
            "target_id": peer_id,
            "type": "offer",
            "sdp": _peer_list[peer_id].localDescription
        });
    })
    .catch(log_error);
} 

function handleOfferMsg(msg) {   
    peer_id = msg['sender_id'];

    console.log(`offer recieved from <${peer_id}>`);
    
    createPeerConnection(peer_id);
    let desc = new RTCSessionDescription(msg['sdp']);
    _peer_list[peer_id].setRemoteDescription(desc)
    .then(() => {
        let local_stream = localAudio.srcObject;
        local_stream.getAudioTracks().forEach((track) => {_peer_list[peer_id].addTrack(track, local_stream);});
    })
    .then(() => {return _peer_list[peer_id].createAnswer();})
    .then((answer) => {
        return _peer_list[peer_id].setLocalDescription(answer);
    })
    .then(() => {
        console.log(`sending answer to <${peer_id}> ...`);
        sendViaServer({
            "sender_id": my_uid,
            "target_id": peer_id,
            "type": "answer",
            "sdp": _peer_list[peer_id].localDescription
        });
    })
    .catch(log_error);
}

function handleAnswerMsg(msg) {
    peer_id = msg['sender_id'];
    console.log(`answer recieved from <${peer_id}>`);
    let desc = new RTCSessionDescription(msg['sdp']);
    _peer_list[peer_id].setRemoteDescription(desc)
}

function handleICECandidateEvent(event, peer_id) {
    if(event.candidate){
        sendViaServer({
            "sender_id": my_uid,
            "target_id": peer_id,
            "type": "new-ice-candidate",
            "candidate": event.candidate
        });
    }
}

function handleNewICECandidateMsg(msg) {
    console.log(`ICE candidate recieved from <${peer_id}>`);
    var candidate = new RTCIceCandidate(msg.candidate);
    _peer_list[msg["sender_id"]].addIceCandidate(candidate)
    .catch(log_error);
}

function handleTrackEvent(event, peer_id) {
    console.log(`track event recieved from <${peer_id}>`);
    
    if(event.streams) {
        getAudioObj(peer_id).srcObject = event.streams[0];
    }
}