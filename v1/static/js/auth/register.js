
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('#register-form');

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting traditionally

        // Validate password and confirm password fields
        const password = document.querySelector('#password').value;
        const confirmPassword = document.querySelector('#confirm_password').value;

        if (password !== confirmPassword) {
            swalToast('error', 'Passwords do not match');
            return;
        }

        // Get form data
        const formData = new FormData(registerForm);
        const formDataObject = {};
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        // Call registerUser function with form data
        registerUser(formDataObject);
    });
});

function registerUser(formData) {
    fetch('/api/register', {
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
        //     throw new Error('Failed to register user');
        // }
        return response.json();
    })
    .then(data => {
        // Handle successful registration
        console.log(data);

        if (data.message) {
            swalToast('success', data.message);
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