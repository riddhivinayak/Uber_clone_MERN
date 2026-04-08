const socketIo = require('socket.io');
const userModel = require('./models/user.models');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: [ 'GET', 'POST' ]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);


        socket.on('join', async (data) => {
            const { userId, userType } = data;
            console.log(`Join event - userId: ${userId}, userType: ${userType}, socketId: ${socket.id}`);

            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
                console.log(`User ${userId} joined with socketId ${socket.id}`);
            } else if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
                console.log(`Captain ${userId} joined with socketId ${socket.id}`);
            }
        });


        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;
            console.log(`Location update - userId: ${userId}, location:`, location);

            if (!location || !location.lat || !location.lng) {
                console.log(`Invalid location data for captain ${userId}`);
                return socket.emit('error', { message: 'Invalid location data' });
            }

            await captainModel.findByIdAndUpdate(userId, {
                location: {
                    lat: location.lat,
                    lng: location.lng
                }
            });
            console.log(`Captain ${userId} location updated to lat: ${location.lat}, lng: ${location.lng}`);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {
    console.log(`Sending message to socketId: ${socketId}, event: ${messageObject.event}`);
    console.log('Message data:', messageObject.data);

    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
        console.log(`Message sent successfully to ${socketId}`);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };