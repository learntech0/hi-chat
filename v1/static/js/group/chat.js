document.addEventListener('DOMContentLoaded', function() {
    // Retrieve access token from local storage
    const access_token = localStorage.getItem("access_token");

    // Function to send GET request with access token
    function getChats() {
        fetch(`/api/group/${target_uid}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Handle successful response
            console.log(data);
            if (data.error && data.error == 'token_expired') {
                newAccessToke();
                getChats();
            } 
        })
        .catch(error => {
            // Handle error
            console.error(error);
        });
    }

    // Call getChats function to fetch all chats
    getChats();
});