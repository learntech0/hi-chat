// start: Sidebar
document.querySelector('.chat-sidebar-profile-toggle').addEventListener('click', function(e) {
    e.preventDefault()
    this.parentElement.classList.toggle('active')
})

document.addEventListener('click', function(e) {
    if(!e.target.matches('.chat-sidebar-profile, .chat-sidebar-profile *')) {
        document.querySelector('.chat-sidebar-profile').classList.remove('active')
    }
})
// end: Sidebar

// Settings

const lightBox = document.querySelector('.setting-lightbox'),
closeBtn = lightBox.querySelector('.lightbox');

const showLightBox = () => {
    lightBox.classList.add('show');
    localStorage.setItem("setting", 'show');
}
const hideLightBox = () => {
    lightBox.classList.remove('show');
    localStorage.setItem("setting", 'hide');
}

const loadDataFromLocalstorage = () => {
    const setting = localStorage.getItem("setting");
    if (setting == 'show') {
        lightBox.classList.add('show');
    } else {
        lightBox.classList.remove('show');
    }
}

loadDataFromLocalstorage();

document.querySelectorAll('[data-toggle]').forEach(function(item) {
    item.addEventListener('click', function(e) {
        e.preventDefault()
        document.querySelectorAll('.setting-preview .setting').forEach(function(i) {
            i.classList.remove('active')
        })
        document.querySelector(this.dataset.toggle).classList.add('active')
    })
})

const sidebar = document.querySelector('.chat-sidebar-menu'),
user = sidebar.querySelector('.user'),
group = sidebar.querySelector('.group'),
contact = sidebar.querySelector('.contact'),
setting = sidebar.querySelector('.setting');
var hidesetting = document.querySelector('.setting-lightbox .buttons');

document.addEventListener("DOMContentLoaded", () => {
    if (lightBox.classList.contains('show')) {
        setting.classList.add('active');
    } else {
        addActive();
    }
});

function addActive() {
    if (pageName.startsWith('user') | pageName.startsWith('chat')) {
        user.classList.add('active');
    } else if (pageName.startsWith('group')) {
        group.classList.add('active');
    } else if (pageName.startsWith('contact')) {
        contact.classList.add('active');
    } else if (pageName.startsWith('setting')) {
        setting.classList.add('active');
    }
}

setting.addEventListener('click', () =>{
    sidebar.querySelectorAll('li').forEach(function(item) {
        if (item.classList.contains('active')) {
            item.classList.remove('active');
        }
    });
    setting.classList.add('active');
});

hidesetting.addEventListener('click', () =>{
    setting.classList.remove('active');
    addActive();
});


const wrapper = document.querySelector(".setting-lightbox .wrapper"),
editBtn = wrapper.querySelector(".edit-rofile button"),
deleteBtn = wrapper.querySelector(".delete-rofile button"),
fileInput = wrapper.querySelector("input");

editBtn.addEventListener("click", () => fileInput.click());
deleteBtn.addEventListener("click", () => submitProfile());

function submitProfile() {
    var file = fileInput.files[0];
    var formData = new FormData();
    formData.append("file", file);

    $.ajax({
        type: 'POST',
        url: '/upload_profile',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            console.log(response);
            if (response.messages) {
                response.messages.forEach(function(message) {
                    alert(message);
                });
            }
        },
        error: function(error) {
            console.error('Error:', error);
        }
    });
    $("#profileDisplay").modal('hide');
}

fileInput.addEventListener("change", e => {
    let file = e.target.files[0];
    if(!file) return;
    $("#profileDisplay").modal('show');
    document.querySelector('.modal img').src = URL.createObjectURL(file);
});