const { v4: uuidv4 } = require('uuid');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

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
const handleSocket = async (io) => {
    try {
        io.on('connection', async (socket) => {
            console.log('new socket connected');
            io.emit('connectedUsers', connectedUsers);

            socket.on('disconnect', (reason) => {
                console.log('disconnected', reason);
                delete connectedUsers[socket];
                io.emit('connectedUsers', connectedUsers);
            });

            socket.on('disconnectSocket', () => {
                console.log('disconnecting socket');
                delete connectedUsers[socket];
                socket.disconnect();
            });

            socket.on('message', async (data) => {
                const { jwtToken, payload } = data;
                console.log('new new msg');
                const user = await jwt.verify(jwtToken, process.env.JWT_SECRET);

                connectedUsers[socket.id] = user.email;
                socket.broadcast.emit('connectedUsers', connectedUsers);
                const message = await createMessage(
                    user.id,
                    user.email,
                    payload,
                );
                await socket.broadcast.emit('message', message);
            });
        });
    } catch (err) {
        console.log(err.message);
    }
};

module.exports = handleSocket;
