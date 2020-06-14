const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const userIds = {};

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
        console.log('a user connected!');
        socket.on('message', async ({ messageText, token }) => {
            console.log('there a new msg', messageText);
            try {
                const user = await jwt.verify(token, process.env.JWT_SECRET);
                if (user && user.id) {
                    console.log('messageText', messageText);
                    userIds[socket.id] = user.id;
                    const message = createMessage(
                        userIds[socket.id],
                        user.email,
                        messageText,
                    );
                    console.log(message);
                    socket.broadcast.emit('message', message);
                } else {
                    console.log('error, jwt user not found');
                    socket.emit('error', 'no account found');
                }
            } catch (err) {
                console.log(err);
                socket.emit('error', err.message);
            }
        });
    });
};

module.exports = handleSocket;
