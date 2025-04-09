var audioGrid = document.querySelector('.voice-call-lightbox #audio-grid');

var localAudio = document.getElementById("local-audio");
var muteAudioBtn = document.querySelector(".voice-call-lightbox #btn-mute-audio");
var muteAudioIcon = document.querySelector(".voice-call-lightbox #audio-mute-icon");
var audioMuted = false;


muteAudioBtn.addEventListener("click", (event)=>{
    audioMuted = !audioMuted;
    setAudioMuteState(audioMuted);        
});        

function makeAudioElement(element_id, display_name) {
    let wrapper_div = document.createElement("div");
    let audio_wrapper = document.createElement("div");
    let audio = document.createElement("audio");
    let name_text = document.createElement("div");

    wrapper_div.id = "div_" + element_id;
    audio.id = "audio_" + element_id;

    wrapper_div.className = "shadow audio-item";
    audio_wrapper.className = "audio-wrapper";
    name_text.className = "display-name";
    
    audio.autoplay = true;    
    name_text.innerText = display_name;

    audio_wrapper.appendChild(audio);
    wrapper_div.appendChild(audio_wrapper);
    wrapper_div.appendChild(name_text);

    return wrapper_div;
}

function addAudioElement(element_id, display_name) {        
    audioGrid.appendChild(makeAudioElement(element_id, display_name));
}
function removeAudioElement(element_id) {    
    let audio = getAudioObj(element_id);
    if(audio.srcObject){
        audio.srcObject.getAudioTracks().forEach(track => track.stop());
    }
    audio.removeAttribute("srcObject");
    audio.removeAttribute("src");

    document.getElementById("div_" + element_id).remove();
}

function getAudioObj(element_id) {
    return document.getElementById("audio_" + element_id);
}

function setAudioMuteState(flag) {
    let local_stream = localAudio.srcObject;
    local_stream.getAudioTracks().forEach((track)=>{track.enabled = !flag;});
    // switch button icon
    muteAudioIcon.innerText = (flag)? "mic_off": "mic";
}
