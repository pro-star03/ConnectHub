const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // Map userId to socketId

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: '*', // For development, allow all
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('register', (userId) => {
        if (userId) {
          userSockets.set(userId, socket.id);
          console.log(`User ${userId} registered with socket ${socket.id}`);
        }
      });

      socket.on('disconnect', () => {
        for (const [userId, socketId] of userSockets.entries()) {
          if (socketId === socket.id) {
            userSockets.delete(userId);
            console.log(`User ${userId} disconnected`);
            break;
          }
        }
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  getSocketId: (userId) => {
    return userSockets.get(userId?.toString());
  }
};
