
document.addEventListener('DOMContentLoaded', function() {
    // Retrieve access token from local storage
    const access_token = localStorage.getItem("access_token");

    // Function to send GET request with access token
    function getUsers() {
        fetch('/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(response => {
            // if (response.ok) {
            //     return response.json();
            // } else {
            //     throw new Error('Failed to fetch users');
            // }
            return response.json();
        })
        .then(data => {
            // Handle successful response
            console.log(data);
            if (data.error && data.error == 'token_expired') {
                newAccessToke();
                getUsers();
            } 
        })
        .catch(error => {
            // Handle error
            console.error(error);
        });
    }

    // Call getUsers function to fetch all users
    getUsers();
});

function newAccessToke() {
    const refresh_token = localStorage.getItem("refresh_token");

    fetch('/api/refresh', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${refresh_token}`
        }
    })
    .then(response => {
        // if (response.ok) {
        //     return response.json();
        // } else {
        //     throw new Error('Failed to fetch users');
        // }
        return response.json();
    })
    .then(data => {
        // Handle successful response
        console.log(data);
        if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
        } 
    })
    .catch(error => {
        // Handle error
        console.error(error);
    });
}