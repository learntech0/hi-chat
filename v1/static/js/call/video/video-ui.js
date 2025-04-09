var videoGrid = document.querySelector('.video-call-lightbox #video-grid');

var localVideo = document.getElementById("local-video");
var muteVidAudioBtn = document.querySelector(".video-call-lightbox #btn-mute-audio");
var muteVideoBtn = document.getElementById("btn-mute-video");
var muteVidAudioIcon = document.querySelector(".video-call-lightbox #audio-mute-icon");
var muteVideoIcon = document.getElementById("video-mute-icon");
var audioMuted = false;
var videoMuted = false;

localVideo.onloadeddata = ()=>{console.log("W, H: ", localVideo.videoWidth, ", ", localVideo.videoHeight);};

muteVidAudioBtn.addEventListener("click", (event)=>{
    audioMuted = !audioMuted;
    setAudioMuteState(audioMuted);        
});    
muteVideoBtn.addEventListener("click", (event)=>{
    videoMuted = !videoMuted;
    setVideoMuteState(videoMuted);        
});    


function makeVideoElement(element_id, display_name) {
    let wrapper_div = document.createElement("div");
    let video_wrapper = document.createElement("div");
    let video = document.createElement("video");
    let name_text = document.createElement("div");

    wrapper_div.id = "div_" + element_id;
    video.id = "video_" + element_id;

    wrapper_div.className = "shadow video-item";
    video_wrapper.className = "video-wrapper";
    name_text.className = "display-name";
    
    video.autoplay = true;    
    name_text.innerText = display_name;

    video_wrapper.appendChild(video);
    wrapper_div.appendChild(video_wrapper);
    wrapper_div.appendChild(name_text);

    return wrapper_div;
}

function addVideoElement(element_id, display_name) {        
    videoGrid.appendChild(makeVideoElement(element_id, display_name));
}
function removeVideoElement(element_id) {    
    let video = getVideoObj(element_id);
    if(video.srcObject){
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    video.removeAttribute("srcObject");
    video.removeAttribute("src");

    document.getElementById("div_" + element_id).remove();
}

function getVideoObj(element_id) {
    return document.getElementById("vid_" + element_id);
}

function setAudioMuteState(flag) {
    let local_stream = localVideo.srcObject;
    local_stream.getAudioTracks().forEach((track)=>{track.enabled = !flag;});
    // switch button icon
    muteVidAudioIcon.innerText = (flag)? "mic_off": "mic";
}
function setVideoMuteState(flag) {
    let local_stream = localVideo.srcObject;
    local_stream.getVideoTracks().forEach((track)=>{track.enabled = !flag;});
    // switch button icon
    muteVideoIcon.innerText = (flag)? "videocam_off": "videocam";
}
