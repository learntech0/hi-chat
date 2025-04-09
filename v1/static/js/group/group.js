target_group = url.searchParams.get('group_id');

if (target_group != null) {

    var protocol = window.location.protocol;
    var socket = io.connect(protocol + '//' + document.domain + ':' + location.port);
    var currentDate = null;
    var currentUser = null;
    var currentListItem = null;

    $(document).ready(fetchMessages());

    function fetchMessages() {
        $.ajax({
            url: '/get_group_messages',
            type: 'GET',
            data: { group_id: target_group },
            success: function(messagesData) {

                // Iterate through the data and insert messages into the HTML
                messagesData.messages.forEach(function(message) {

                    var timeParts = message.time.split('_');
                    time = timeParts[1];
                    date = timeParts[0];

                    // Check if the user or date has changed
                    if (message.sender.id !== currentUser || date !== currentDate) {
                        // If the user or date has changed, create a new list item with date divider
                        var dateDivider = '';
                        if (date !== currentDate) {
                            dateDivider = `<div class="coversation-divider"><span>${date}</span></div>`;
                        }
    
                        // Determine if the message is outgoing or incoming
                        var messageClass = (message.sender.id === current_user_id) ? 'outgoing' : 'incoming';
    
                        // Create a new list item with date divider and outgoing/incoming class
                        var messageItem = $(`
                            ${dateDivider}
                            <li class="conversation-item ${messageClass}">
                                <div class="conversation-item-side">
                                    <img class="conversation-item-image" src="/static/images/profile/${message.sender.profile}" alt="">
                                </div>
                                <div class="conversation-item-content"></div>
                            </li>
                        `);
    
                        // Append the new list item to the message-wrapper
                        $('#messages-container').append(messageItem);
    
                        // Update the current user, date, and list item
                        currentUser = message.sender.id;
                        currentDate = date;
                        currentListItem = messageItem;
                    }
    
                    // Create message-item-wrapper div
                    var messageWrapperDiv = $(`
                        <div class="conversation-item-wrapper">
                            <div class="conversation-item-text">
                                <p></p>
                                <div class="conversation-item-time">${time}</div>
                            </div>
                            <div class="conversation-item-dropdown">
                                <button type="button" class="conversation-item-dropdown-toggle"><i class="ri-more-2-line"></i></button>
                                <ul class="conversation-item-dropdown-list">
                                    <li><a href="#"><i class="ri-share-forward-line"></i> Forward</a></li>
                                    <li><a href="#"><i class="ri-delete-bin-line"></i> Delete</a></li>
                                </ul>
                            </div>
                        </div>
                    `);

                    var pElement = messageWrapperDiv.find('.conversation-item-text p');
                    
                    if (message.file) {
                        var parts = message.file.split('.');
                        if (parts.length > 1) {
                            file_ext = parts[parts.length - 1].toLowerCase();
                            if (['jpg', 'png', 'jpeg'].includes(file_ext)) {
                                pElement.html(`<img src="static/files/images/${message.file}"><br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                            } else if(['docx', 'xlsx', 'pptx'].includes(file_ext)){
                                // var convertedHtml = convertDocxToHtml('static/files/documents/${message.file}');
                                pElement.html(`<i class="ri-error-warning-line"></i> ${file_ext} file currently not supported!<br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                            } else if(['pdf', 'txt'].includes(file_ext)){
                                pElement.html(`<iframe src="static/files/documents/${message.file}"></iframe><br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                            } else {
                                pElement.html(`<iframe src="static/files/documents/${message.file}"></iframe><br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                            }
                        } else {
                            pElement.html(`Unsupported file!<br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                        }
                    } else {
                        pElement.html(`${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                    }
                    currentListItem.find('.conversation-item-content').append(messageWrapperDiv);
                    scrollToBottom();  
                });
            },
            error: function(error) {
                console.error('Error fetching messages:', error);
            },
        });

    }

        
    socket.on('message', (message) => {
        var blob = new Blob([message.file], { type: 'application/octet-stream' });
        file = URL.createObjectURL(blob);

        var timeParts = message.time.split('_');
        time = timeParts[1];
        date = timeParts[0];

        // Check if the user or date has changed
        if (message.sender_id !== currentUser || date !== currentDate) {
            // If the user or date has changed, create a new list item with date divider
            var dateDivider = '';
            if (date !== currentDate) {
                dateDivider = `<div class="coversation-divider"><span>${message.sender_profile}</span></div>`;
            }

            // Determine if the message is outgoing or incoming
            var messageClass = (message.sender_id === current_user_id) ? 'outgoing' : 'incoming';

            // Create a new list item with date divider and outgoing/incoming class
            var messageItem = $(`
                ${dateDivider}
                <li class="conversation-item ${messageClass}">
                    <div class="conversation-item-side">
                        <img class="conversation-item-image" src="/static/images/profile/${message.profile}" alt="">
                    </div>
                    <div class="conversation-item-content"></div>

                </li>
            `);

            // Append the new list item to the message-wrapper
            $('#messages-container').append(messageItem);

            // Update the current user, date, and list item
            currentUser = message.sender_id;
            currentDate = date;
            currentListItem = messageItem;
        }

        // Create message-item-wrapper div
        var messageWrapperDiv = $(`
            <div class="conversation-item-wrapper">
                <div class="conversation-item-text">
                    <p></p>
                    <div class="conversation-item-time">${time}</div>
                </div>
                <div class="conversation-item-dropdown">
                    <button type="button" class="conversation-item-dropdown-toggle"><i class="ri-more-2-line"></i></button>
                    <ul class="conversation-item-dropdown-list">
                        <li><a href="#"><i class="ri-share-forward-line"></i> Forward</a></li>
                        <li><a href="#"><i class="ri-delete-bin-line"></i> Delete</a></li>
                    </ul>
                </div>
            </div>
        `);

        var pElement = messageWrapperDiv.find('.conversation-item-text p');

        if (message.file) {
            var parts = message.original_filename.split('.');
            if (parts.length > 1) {
                file_ext = parts[parts.length - 1].toLowerCase();
                if (['jpg', 'png', 'jpeg'].includes(file_ext)) {
                    pElement.html(`<img src="${file}" alt="image"><br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                } else if(['docx', 'xlsx', 'pptx'].includes(file_ext)){
                    // var convertedHtml = convertDocxToHtml('static/files/documents/${message.file}');
                    pElement.html(`<i class="ri-error-warning-line"></i> ${file_ext} file currently not supported!<br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                } else if(['pdf', 'txt'].includes(file_ext)){
                    // pElement.html(`<iframe src="${file}"></iframe><br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                    pElement.html(`<i class="ri-information-line"></i> waiting for this file!<br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                } else {
                    // pElement.html(`<iframe src="${file}"></iframe><br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                    pElement.html(`<i class="ri-information-line"></i> waiting for this file!<br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
                }
            } else {
                pElement.html(`<i class="ri-error-warning-line"></i> unsupported file!<br>${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
            }
        } else {
            pElement.html(`${$('<div>').text(message.message).html().replace(/\n/g, '<br>')}`);
        }
        currentListItem.find('.conversation-item-content').append(messageWrapperDiv);
    });

    const attachment = document.querySelector('.conversation-attachment');
    var inputFile = attachment.querySelector('ul input');
    var attachFile = attachment.querySelector('ul li');
    attachFile.addEventListener('click', () => inputFile.click());

    inputFile.addEventListener('change', e => {
        let file = inputFile.files[0];
        if (file) {
            document.querySelector('form textarea').removeAttribute("required");
        }
    });

    function submitForm() {     
        var form = $('#chatForm');
        var message = form.find("textarea[name='msg']").val();
        var file = inputFile.files[0];

        const timestamp = Date.now();
        const date = new Date(timestamp);
        const formattedDate = date.toISOString().split('T')[0];
        const hours = date.getHours();
        const minutes = date.getMinutes();
        let time = `${formattedDate}_${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

        if (message.trim() !== "") {
            // Check if a file is selected
            if (file) {
                // Read the file as a blob
                var reader = new FileReader();
                reader.onloadend = function () {
                    var fileBlob = reader.result;
                    // Emit the message with the file blob
                    socket.emit('message', {
                        'sender_id': current_user_id,
                        'sender_profile': user_details.profile,
                        'receiver_id': target_group,
                        'message': message,
                        'file': fileBlob,
                        'original_filename': file.name,
                        'time': time
                    });
                };
                reader.readAsArrayBuffer(file);
            } else {
                // No file, just send the rest of the data
                socket.emit('message', {
                    'sender_id': current_user_id,
                    'sender_profile': user_details.profile,
                    'receiver_id': target_group,
                    'message': message,
                    'time': time
                });
            }

            // Clear textarea
            form.find("textarea[name='msg']").val('');
        } else {
            if (file) {
                // Read the file as a blob
                var reader = new FileReader();
                reader.onloadend = function () {
                    var fileBlob = reader.result;
                    // Emit the message with the file blob
                    socket.emit('message', {
                        'sender_id': current_user_id,
                        'receiver_id': target_group,
                        'file': fileBlob,
                        'original_filename': file.name,
                        'date': formattedDate,
                        'time': time
                    });
                };
                reader.readAsArrayBuffer(file);
            }
        }
    }

    // start: Coversation
    document.querySelectorAll('.conversation-item-dropdown-toggle').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault()
            if(this.parentElement.classList.contains('active')) {
                this.parentElement.classList.remove('active')
            } else {
                document.querySelectorAll('.conversation-item-dropdown').forEach(function(i) {
                    i.classList.remove('active')
                })
                this.parentElement.classList.add('active')
            }
        })
    })

    document.addEventListener('click', function(e) {
        if(!e.target.matches('.conversation-item-dropdown, .conversation-item-dropdown *')) {
            document.querySelectorAll('.conversation-item-dropdown').forEach(function(i) {
                i.classList.remove('active')
            })
        }
    })

    // start: attachment
    document.querySelector('.conversation-attachment-toggle').addEventListener('click', function(e) {
        e.preventDefault()
        this.parentElement.classList.toggle('active')
    })

    document.addEventListener('click', function(e) {
        if(!e.target.matches('.conversation-attachment, .conversation-attachment *')) {
            document.querySelector('.conversation-attachment').classList.remove('active')
        }
    })
    // end: attachment

    inputField = document.querySelector(".conversation-form-input");
    const initialHeight = inputField.scrollHeight;

    inputField.addEventListener("input", () => {
        // Adjust the height of the input field based on its content
        inputField.style.height = `${initialHeight}px`;
        inputField.style.height = `${inputField.scrollHeight}px`;
    });

    chatBox = document.querySelector(".conversation-main");

    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    var copyBtn = document.getElementById("copy-link");
    var iviteText = document.getElementById("invite-link");

    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(iviteText.innerText);
        copyBtn.innerText = "copied";
    });

    // var startVideoCallBtn = document.querySelector('.conversation-buttons #video-call');

    // startVideoCallBtn.addEventListener('click', () => {
    //     startCamera();
    // });

    var startAudioCallBtn = document.querySelector('.conversation-buttons #voice-call');

    startAudioCallBtn.addEventListener('click', () => {
        startVoiceCall();
    });

} else {
    function handleMediaQuery(mq) {
        var conversationDefaultSm = document.querySelector('.conversation-default.sm');
        if (mq.matches) {
            conversationDefaultSm.style.display = 'flex';
        } else {
            conversationDefaultSm.style.display = 'none';
        }
    }
    var mediaQuery = window.matchMedia('(max-width: 767px)');
    handleMediaQuery(mediaQuery);
    mediaQuery.addListener(handleMediaQuery);
}