var delayTimer;  // Variable to store the timer ID
// Function to append user data to the ul element
function appendGroupData(group_data) {
    var groupList = $('#groups-container');

    // Create a new list item for each user
    var listItem = $('<li>');
    listItem.html(`
        <a href="group?group_id=${group_data.group_id}">
            <img class="content-message-image" src="/static/images/profile/${group_data.profile}" alt="">
            <span class="content-message-info">
                <span class="content-message-name">${group_data.name}</span>
                <span class="content-message-text">${group_data.latest_chat ? $('<div>').text(group_data.latest_chat.message).html() : ''}</span>
            </span>
            <span class="content-message-more">
                <!-- <span class="content-message-unread">4</span> -->
                <span class="content-message-time">${group_data.latest_chat ? group_data.latest_chat.time : ''}</span>
            </span>
        </a>
    `);

    // Append the new list item to the existing ul
    groupList.append(listItem);
}

// Function to fetch data from the server
function fetchData(q) {
    $.ajax({
        url: '/get_groups',
        type: 'GET',
        dataType: 'json',
        data: { query: q },  // Pass the query parameter to the backend
        success: function(groupsData) {
            // Clear the existing list
            $('#groups-container').empty();

            // Loop through usersData and append each user to the list
            groupsData.groups.forEach(function(group_data) {
                appendGroupData(group_data);
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

// Initial call to fetch all groups
fetchData('');