var delayTimer;  // Variable to store the timer ID
// Function to append user data to the ul element
function appendUserData(user_data) {
    var userList = $('#contacts-container');

    // Create a new list item for each user
    var listItem = $('<li>');
    listItem.html(`
        <a href="">
            <img class="content-message-image" src="/static/images/profile/${user_data.profile}" alt="">
            <span class="content-message-info">
                <span class="content-message-name">${user_data.contact_name}</span>
            </span>
        </a>
    `);

    // Append the new list item to the existing ul
    userList.append(listItem);
}

// Function to fetch data from the server
function fetchData(q) {
    $.ajax({
        url: '/get_contacts',
        type: 'GET',
        dataType: 'json',
        data: { query: q },  // Pass the query parameter to the backend
        success: function(usersData) {
            // Clear the existing list
            $('#contacts-container').empty();

            // Loop through usersData and append each user to the list
            usersData.contacts.forEach(function(user_data) {
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

