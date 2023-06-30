const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// get username and room from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// console.log(username, room);

// check if username and room is null then alert user and redirect user to index page
if (checkUsernameAndRoom(username, room)) {
    alert("Please enter Username and Room");
    window.location = '../index.html';
}

const socket = io();

// fires event joinRoom to server
socket.emit('joinRoom', { username, room });

// get room and users info from server and display to client
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// listens message from server and gets message and type and display to client 
socket.on('message', ({ message, type }) => {

    outputMessage(message, type);

    // scroll down functionality to see latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// message submit listener
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get message text from message input form
    let msg = e.target.elements.msg.value;

    // trims the spaces in left and right of message
    msg = msg.trim();

    // check if message is null then return false
    if (!msg) {
        return false;
    }

    // Sends/emits message to server
    socket.emit('chatMessage', msg);

    // clear input of message field
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// add message to DOM
function outputMessage(message, type) {

    const div = document.createElement('div');
    div.classList.add('message', type);
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                     <p class="text">
                         ${message.text}
                     </p>`;
    chatMessages.appendChild(div);
}

// add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// add users to DOM
function outputUsers(users) {

    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        // check if username is same as current username then add class current-user
        if (li.innerText === username) {
            li.classList.add('current-user');
        }
        userList.appendChild(li);
    });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {

    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        window.location = '../index.html';
    } else {
    }

});

// function to check if username and room is null
function checkUsernameAndRoom(username, room) {
    
    if (username === "" || room === "") {
        return true;
    }
}