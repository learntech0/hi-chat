// // Get the current URL
// var currentURL = window.location.href;

// // Get the host (domain)
// var host = window.location.host;

// // Get the pathname (path after the domain)
// var pathname = window.location.pathname;

// // Get the search parameters (query string)
// var search = window.location.search;

// // Combine them to get the URL without the fragment
// var fullURL = host + pathname + search;

// // Log the results
// console.log("Full URL: " + fullURL);
// console.log("Host: " + host);
// console.log("Pathname: " + pathname);
// console.log("Search: " + search);

var currentUrl = window.location.href;
var url = new URL(currentUrl);

var urlParts = currentUrl.split('/');

var pageName = urlParts[urlParts.length - 1];

var target_uid = urlParts[urlParts.length - 1];

console.log("Current page name:", pageName);

let user_details;
var target_user;
var current_user_id;

// socketio 
var protocol = window.location.protocol;
var socket = io.connect(protocol + '//' + document.domain + ':' + location.port);

function removeUserDetails() {
    localStorage.removeItem("user_details");
}

var user_details_str = localStorage.getItem("user_details");
if (user_details_str !== null) {
    user_details = JSON.parse(user_details_str);
    current_user_id = user_details.user_id
    console.log(current_user_id);
} else {
    saveUserDetails();
}

function saveUserDetails() {
    fetch('/get_user_details')
    .then(response => response.json())
    .then(data => {
        var user_details = {
            "user_id": data.user_details.user_id,
            "username": data.user_details.username,
            "email": data.user_details.email,
            "profile": data.user_details.profile
        };
        localStorage.setItem("user_details", JSON.stringify(user_details));
        console.log(user_details);
    })
    .catch(error => {
        console.error('Error fetching user details: ', error);
    });
}