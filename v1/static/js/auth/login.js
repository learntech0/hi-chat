// login.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('#login-form');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting traditionally

        // Get form data
        const formData = new FormData(loginForm);
        const formDataObject = {};
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        // Call loginUser function with form data
        loginUser(formDataObject);
    });
});

function loginUser(formData) {
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        // if (response.ok) {
        //     return response.json();
        // } else {
        //     throw new Error('Failed to login');
        // }
        return response.json();
    })
    .then(data => {
        // Handle successful login
        console.log(data);

        if (data.message) {
            swalToast('success', data.message);
            localStorage.setItem("access_token", data.tokens.access);
            localStorage.setItem("refresh_token", data.tokens.refresh);
            
            console.log(`tokens: {
                access: ${data.tokens.access}, 
                refresh: ${data.tokens.refresh}
            }`);
        } 
        else if (data.error) {
            swalToast('warning', data.error);
        }
    })
    .catch(error => {
        // Handle error
        console.error(error);
    });
}
