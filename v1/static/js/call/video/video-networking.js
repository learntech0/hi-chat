var videoBody = document.querySelector('body');
const videoCallLightBox = document.querySelector('.video-call-lightbox');
const showVideoCallLightBox = () => { 
    videoCallLightBox.style.display = "block";
    videoCallLightBox.classList.add('show'); 
}
const hideVideoCallLightBox = () => { 
    videoCallLightBox.classList.remove('show'); 
    videoCallLightBox.style.display = "none";
}

var my_uid;
var _peer_list = {};

var callContainer = document.querySelector('.video-call-lightbox .call-container');
var localVideoContainer = document.querySelector('.local-video-wrapper');
var callName = document.querySelector('.video-call-lightbox .call-details h5');

// var startVideoCallBtn = document.querySelector('.conversation-buttons #video-call');
var acceptVideoCallBtn = document.querySelector('.video-call-lightbox #btn-call');
var endVideoCallBtn = document.querySelector('.video-call-lightbox #btn-end-call');

var camera_allowed=false;
var mediaConstraints = { audio: true, video: true };

target_user = url.searchParams.get('user_id');

// startVideoCallBtn.addEventListener('click', function() {
//     startCamera();
// });

function startCamera() {
    navigator.mediaDevices.getUserMedia(mediaConstraints)
    .then((stream) => {
        localVideo.srcObject = stream;
        camera_allowed=true;
        localVideo.volume = 0;
        localVideo.muted = 0;
        setAudioMuteState(audioMuted);                
        setVideoMuteState(videoMuted);
    })
    .catch((e) => {
        console.log("Error! Unable to start video! ", e);
        // document.getElementById("permission_alert").style.display = "block";
    });

    showVideoCallLightBox();

    callName.innerText = targetname;
    localVideoContainer.removeAttribute('hidden');

    socket.emit('video-call-request', {
        'sender_name': currentname,
        'sender_id': current_user, 
        'target_id': target_user, 
        'room': current_user+'|-|'+target_user 
    });
}


socket.on('video-call-request', (request) => {
    if (request.target_id == current_user) {
        acceptVideoCallBtn.removeAttribute('hidden');
        callName.innerText = request.sender_name;
        console.log('Call request from: ' + request.sender_id)
        showVideoCallLightBox();
        acceptVideoCallBtn.addEventListener('click', () => {
            localVideoContainer.removeAttribute('hidden');
            navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then((stream) => {
                localVideo.srcObject = stream;
                camera_allowed=true;
                localVideo.volume = 0;
                localVideo.muted = 0;
                setAudioMuteState(audioMuted);                
                setVideoMuteState(videoMuted);
            })
            .catch((e) => {
                console.log("Error! Unable to start video! ", e);
                // document.getElementById("permission_alert").style.display = "block";
            });
            socket.emit('video-call-accepted', {
                'sender_id': request.target_id, 
                'target_id': request.sender_id, 
                'room': request.room
            });
            socket.emit("join-video-call", {"room_id": request.room});
            acceptVideoCallBtn.setAttribute('hidden','hidden'); 
            callContainer.setAttribute('hidden','hidden'); 
            videoGrid.removeAttribute('hidden');
            muteVideoBtn.removeAttribute('hidden');
            muteVidAudioBtn.removeAttribute('hidden');
        });
        endVideoCallBtn.addEventListener('click', () => {
            socket.emit("video-call-declined", {
                'sender_id': request.target_id, 
                'target_id': request.sender_id
            });
            hideVideoCallLightBox();
        });
    } else if (request.sender_id == current_user) {
        endVideoCallBtn.addEventListener('click', () => {
            socket.emit("video-call-cancelled", {
                'sender_id': request.sender_id, 
                'target_id': request.target_id
            });
            hideVideoCallLightBox();
        });
    } else { return }
});

socket.on('video-call-accepted', (response) => {
    if (response.target_id == current_user) {
        socket.emit("join-video-call", {"room_id": response.room});
        callContainer.setAttribute('hidden','hidden'); 
        videoGrid.removeAttribute('hidden');
        muteVideoBtn.removeAttribute('hidden');
        muteVidAudioBtn.removeAttribute('hidden');
    } else { return }
});

socket.on('video-call-declined', (response) => {
    if (response.target_id == current_user) {
        hideVideoCallLightBox();
    } else { return }
});

socket.on('video-call-cancelled', (request) => {
    if (request.target_id == current_user) {
        hideVideoCallLightBox();
    } else { return }
});


socket.on("user-video-connect", (data) => {
    console.log("user-connect ", data);
    callContainer.setAttribute('hidden','hidden'); 
    videoGrid.removeAttribute('hidden');
    let peer_id = data["user_id"];
    let display_name = data["name"];
    _peer_list[peer_id] = undefined; // add new user to user list
    addVideoElement(peer_id, display_name);
});

socket.on("user-video-disconnect", (data) => {
    console.log("user-disconnect ", data);
    let peer_id = data["user_id"];
    closeConnection(peer_id);
    removeVideoElement(peer_id);
});

socket.on("user-video-list", (data) => {
    console.log("user list recvd ", data);
    my_uid = data["my_id"];
    if("list" in data) {   // not the first to connect to room, existing user list recieved
        let recvd_list = data["list"];  
        // add existing users to user list
        for(peer_id in recvd_list) {
            display_name = recvd_list[peer_id];
            _peer_list[peer_id] = undefined;
            addVideoElement(peer_id, display_name);
        } 
        start_webrtc();
    } 
    endVideoCallBtn.addEventListener('click', () => {
        socket.emit("video-call-ended", {
            'sender_id': my_uid, 
            'target_id': peer_id
        });
        window.location.replace(currentUrl);
    });   
});

socket.on("video-call-ended", (response) => {
    if (response.target_id == current_user) {
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
function sendViaServer(data){socket.emit("video-data", data);}

socket.on("video-data", (msg) => {
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

        let local_stream = localVideo.srcObject;
        local_stream.getTracks().forEach((track) => {_peer_list[peer_id].addTrack(track, local_stream);});
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
        let local_stream = localVideo.srcObject;
        local_stream.getTracks().forEach((track) => {_peer_list[peer_id].addTrack(track, local_stream);});
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
        getVideoObj(peer_id).srcObject = event.streams[0];
    }
}