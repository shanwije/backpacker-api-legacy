const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const connectedUsers = {};

function createMessage(userId, userName, messageText) {
    return {
        _id: uuidv4(),
        text: messageText,
        createdAt: new Date(),
        user: {
            _id: userId,
            name: userName,
            avatar: 'https://placeimg.com/140/140/any',
        },
    };
}
const handleSocket = (io) => {
    io.on('connection', (socket) => {
        const { user } = socket;
        console.log('new user connected, email :', user.email);

        // Object.keys(connectedUsers)
        //     .filter((k, i) => connectedUsers[k] === user.id)
        //     .forEach((k) => {
        //         connectedUsers[k].disconnect();
        //     });
        connectedUsers[socket.id] = user.id;
        socket.on('disconnect', (disconnectedSocket) => {
            console.log('disconnected', disconnectedSocket);
            delete connectedUsers[socket];
            io.emit('connectedUsers', connectedUsers);
        });

        socket.once('message', async (messageText) => {
            console.log('new msg');
            socket.broadcast.emit('connectedUsers', connectedUsers);
            const message = await createMessage(
                user.id,
                user.email,
                messageText,
            );
            await socket.broadcast.emit('message', message);
        });
        // }
    });
};

module.exports = handleSocket;
