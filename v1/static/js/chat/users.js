var delayTimer;  // Variable to store the timer ID
// Function to append user data to the ul element
function appendUserData(user_data) {
    var userList = $('#users-container');

    // Create a new list item for each user
    var listItem = $('<li>');
    listItem.html(`
        <a href="chat?user_id=${user_data.user_id}">
            <img class="content-message-image" src="/static/images/profile/${user_data.profile}" alt="">
            <span class="content-message-info">
                <span class="content-message-name">${user_data.name}</span>
                <span class="content-message-text">${user_data.latest_chat ? $('<div>').text(user_data.latest_chat.message).html() : ''}</span>
            </span>
            <span class="content-message-more">
                <!-- <span class="content-message-unread">4</span> -->
                <span class="content-message-time">${user_data.latest_chat ? user_data.latest_chat.time : ''}</span>
            </span>
        </a>
    `);

    // Append the new list item to the existing ul
    userList.append(listItem);
}

// Function to fetch data from the server
function fetchData(q) {
    $.ajax({
        url: '/get_users',
        type: 'GET',
        dataType: 'json',
        data: { query: q },  // Pass the query parameter to the backend
        success: function(usersData) {
            // Clear the existing list
            $('#users-container').empty();

            // Loop through usersData and append each user to the list
            usersData.users.forEach(function(user_data) {
                appendUserData(user_data);
            });
        },
        error: function(error) {
            console.error('Error fetching data:', error);
        }
    });
}

// Event listener for the input field
$('#searchInput').on('input', function() {
    var query = $(this).val();

    // Check if the input field has data
    if (query.trim() !== '') {
        // If there is data, fetch users based on the query with a delay
        clearTimeout(delayTimer);  // Clear any existing timer
        delayTimer = setTimeout(function() {
            fetchData(query);
        }, 500);
    } else {
        // If no data, fetch all users immediately
        clearTimeout(delayTimer);  // Clear any existing timer
        fetchData('');
    }
});

// Event listener for the form submit
$('#searchButton').click(function() {
    // Fetch data immediately when the submit button is clicked
    fetchData($('#searchInput').val().trim());
});

// Initial call to fetch all users
fetchData('');


// // Function to handle form submission using AJAX
// function submitForm() {
//     var form = $('#updateAccountForm')[0];
//     var formData = new FormData(form);

//     $.ajax({
//         type: 'POST',
//         url: '/users',
//         data: formData,
//         contentType: false,
//         processData: false,
//         success: function(response) {
//             // Handle success, e.g., show a success message
//             console.log(response);
//         },
//         error: function(error) {
//             // Handle error, e.g., show an error message
//             console.error('Error:', error);
//         }
//     });
// }

// // Event listener for the update button
// $('#updateButton').click(function() {
//     submitForm();
// });


