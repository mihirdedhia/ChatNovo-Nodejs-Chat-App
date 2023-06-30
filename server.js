const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages.js');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatNovo Bot';

// runs when client connects
io.on('connection', socket => {
    // console.log('new web socket connection...');

    // listens when user joins the room
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        // joins the current user to the room
        socket.join(user.room);

        // fires event to only current user and notify to only current user joined the room    
        socket.emit('message', { message: formatMessage(botName, `You have joined the Room "${user.room}"`), type: 'joined-notification' });

        // broadcasts when user joins the room
        socket.broadcast.to(user.room).emit('message', { message: formatMessage(botName, `A ${user.username} has joined the chat`), type: 'notification' });

        // fires event to all users and sends users and room info to all users
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // listens for chatMessage when user sends message
    socket.on('chatMessage', msg => {

        const user = getCurrentUser(socket.id);

        // fires event to only current user and sends message to only current user sending message
        socket.emit('message', { message: formatMessage(user.username, msg), type: 'outgoing' });

        // broadcasts/sends message to users
        socket.broadcast.to(user.room).emit('message', { message: formatMessage(user.username, msg), type: 'incoming' });
    });

    // runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        // notifies all users when user leaves the room
        if (user) {
            io.to(user.room).emit('message', { message: formatMessage(botName, `A ${user.username} has left the chat`), type: 'notification' });
        }

        // fires event to all users and sends users and room info to all users
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});


const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

