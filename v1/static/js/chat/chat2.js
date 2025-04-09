target_user = url.searchParams.get('user_id');

if (target_user != null) {
    var protocol = window.location.protocol;
    var socket = io.connect(protocol + '//' + document.domain + ':' + location.port);

    $(document).ready(emitMessage());
    function emitMessage() {
        
        // Update the HTML content with the fetched messages
        var messagesContainer = $('#messages-container');

        socket.on('message', function (message) {
            // Append a new <p> element for each message
            var blob = new Blob([message.file], { type: 'application/octet-stream' });
            file = URL.createObjectURL(blob);
            if (message.sender_id == current_user && message.receiver_id == target_user) {
                var msgItem = $('<li class="conversation-item outgoing">');
                msgItem.html(` 
                    <!-- <div class="conversation-item-side">
                        <img class="conversation-item-image" src="{{ url_for('static', filename='images/profile/' + current_user.profile) }}" alt="">
                    </div> -->
                    <div class="conversation-item-content">
                        <div class="conversation-item-wrapper">
                            <div class="conversation-item-box">
                                <div class="conversation-item-text">
                                    <p></p>
                                    <div class="conversation-item-time">${message.time}</div>
                                </div>
                                <div class="conversation-item-dropdown">
                                    <button type="button" class="conversation-item-dropdown-toggle"><i class="ri-more-2-line"></i></button>
                                    <ul class="conversation-item-dropdown-list">
                                        <li><a href=""><i class="ri-share-forward-line"></i> Forward</a></li>
                                        <li><a href=""><i class="ri-delete-bin-line"></i> Delete</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            } else if (message.sender_id == target_user && message.receiver_id == current_user) {
                var msgItem = $('<li class="conversation-item incoming">');
                msgItem.html(`
                    <!-- <div class="conversation-item-side">
                        <img class="conversation-item-image" src="{{ url_for('static', filename='images/profile/' + incoming_user.profile) }}" alt="">
                    </div> -->
                    <div class="conversation-item-content">
                        <div class="conversation-item-wrapper">
                            <div class="conversation-item-box">
                                <div class="conversation-item-text">
                                    <p></p>
                                    <div class="conversation-item-time">${message.time}</div>
                                </div>
                                <div class="conversation-item-dropdown">
                                    <button type="button" class="conversation-item-dropdown-toggle"><i class="ri-more-2-line"></i></button>
                                    <ul class="conversation-item-dropdown-list">
                                        <li><a href=""><i class="ri-share-forward-line"></i> Forward</a></li>
                                        <li><a href=""><i class="ri-delete-bin-line"></i> Delete</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            } else {
                return
            }
            var pElement = msgItem.find('.conversation-item-text p');
            if (message.file) {
                var parts = message.original_filename.split('.');
                if (parts.length > 1) {
                    file_ext = parts[parts.length - 1].toLowerCase();
                    if (['jpg', 'png', 'jpeg'].includes(file_ext)) {
                        pElement.html(`<img src="${file}" alt="image"><br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                    } else if(['docx', 'xlsx', 'pptx'].includes(file_ext)){
                        // var convertedHtml = convertDocxToHtml('static/files/documents/${message.file}');
                        pElement.html(`<i class="ri-error-warning-line"></i> ${file_ext} file currently not supported!<br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                    } else if(['pdf', 'txt'].includes(file_ext)){
                        // pElement.html(`<iframe src="${file}"></iframe><br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                        pElement.html(`<i class="ri-information-line"></i> waiting for this file!<br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                    } else {
                        // pElement.html(`<iframe src="${file}"></iframe><br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                        pElement.html(`<i class="ri-information-line"></i> waiting for this file!<br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                    }
                } else {
                    pElement.html(`<i class="ri-error-warning-line"></i> unsupported file!<br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                }
            } else {
                pElement.html(`${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
            }
            messagesContainer.append(msgItem);
        });

        // Call the initial fetchMessages function
        fetchMessages();      
    }

    function fetchMessages() {
        $.ajax({
            url: '/get_messages',
            type: 'GET',
            data: { user_id: target_user },
            success: function(messagesData) {
                // Update the HTML content with the fetched messages
                var messagesContainer = $('#messages-container');

                messagesData.forEach(function(message) {
                    // Append a new <p> element for each message
                    if (message.sender_id == current_user) {
                        var msgItem = $('<li class="conversation-item outgoing">');
                        msgItem.html(`       
                            <!-- <div class="conversation-item-side">
                                <img class="conversation-item-image" src="{{ url_for('static', filename='images/profile/' + current_user.profile) }}" alt="">
                            </div> -->
                            <div class="conversation-item-content">
                                <div class="conversation-item-wrapper">
                                    <div class="conversation-item-box">
                                        <div class="conversation-item-text">
                                            <p></p>
                                            <div class="conversation-item-time">${message.time}</div>
                                        </div>
                                        <div class="conversation-item-dropdown">
                                            <button type="button" class="conversation-item-dropdown-toggle"><i class="ri-more-2-line"></i></button>
                                            <ul class="conversation-item-dropdown-list">
                                                <li><a href=""><i class="ri-share-forward-line"></i> Forward</a></li>
                                                <li><a href=""><i class="ri-delete-bin-line"></i> Delete</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>  
                        `);
                    } else {
                        var msgItem = $('<li class="conversation-item incoming">');
                        msgItem.html(`
                            <!-- <div class="conversation-item-side">
                                <img class="conversation-item-image" src="{{ url_for('static', filename='images/profile/' + incoming_user.profile) }}" alt="">
                            </div> -->
                            <div class="conversation-item-content">
                                <div class="conversation-item-wrapper">
                                    <div class="conversation-item-box">
                                        <div class="conversation-item-text">
                                            <p></p>
                                            <div class="conversation-item-time">${message.time}</div>
                                        </div>
                                        <div class="conversation-item-dropdown">
                                            <button type="button" class="conversation-item-dropdown-toggle"><i class="ri-more-2-line"></i></button>
                                            <ul class="conversation-item-dropdown-list">
                                                <li><a href=""><i class="ri-share-forward-line"></i> Forward</a></li>
                                                <li><a href=""><i class="ri-delete-bin-line"></i> Delete</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `);  
                    }  
                    var pElement = msgItem.find('.conversation-item-text p');
                    if (message.file) {
                        var parts = message.file.split('.');
                        if (parts.length > 1) {
                            file_ext = parts[parts.length - 1].toLowerCase();
                            if (['jpg', 'png', 'jpeg'].includes(file_ext)) {
                                pElement.html(`<img src="static/files/images/${message.file}"><br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                            } else if(['docx', 'xlsx', 'pptx'].includes(file_ext)){
                                // var convertedHtml = convertDocxToHtml('static/files/documents/${message.file}');
                                pElement.html(`<i class="ri-error-warning-line"></i> ${file_ext} file currently not supported!<br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                            } else if(['pdf', 'txt'].includes(file_ext)){
                                pElement.html(`<iframe src="static/files/documents/${message.file}"></iframe><br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                            } else {
                                pElement.html(`<iframe src="static/files/documents/${message.file}"></iframe><br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                            }
                        } else {
                            pElement.html(`Unsupported file!<br>${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                        }
                    } else {
                        pElement.html(`${$('<div>').text(message.msg).html().replace(/\n/g, '<br>')}`);
                    }
                    messagesContainer.append(msgItem);
                    scrollToBottom();  
                });
            },
            error: function(error) {
                console.error('Error fetching messages:', error);
            },
        });
    }


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
        var sender_id = form.find("input[name='sender_id']").val();
        var receiver_id = form.find("input[name='receiver_id']").val();
        var msg = form.find("textarea[name='msg']").val();
        var file = inputFile.files[0];

        const timestamp = Date.now();
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        let time = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

        if (msg.trim() !== "") {
            // Check if a file is selected
            if (file) {
                // Read the file as a blob
                var reader = new FileReader();
                reader.onloadend = function () {
                    var fileBlob = reader.result;
                    // Emit the message with the file blob
                    socket.emit('message', {
                        'sender_id': sender_id,
                        'receiver_id': receiver_id,
                        'msg': msg,
                        'file': fileBlob,
                        'original_filename': file.name,
                        'time': time
                    });
                };
                reader.readAsArrayBuffer(file);
            } else {
                // No file, just send the rest of the data
                socket.emit('message', {
                    'sender_id': sender_id,
                    'receiver_id': receiver_id,
                    'msg': msg,
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
                        'sender_id': sender_id,
                        'receiver_id': receiver_id,
                        'msg': '',
                        'file': fileBlob,
                        'original_filename': file.name,
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