const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // Map userId.toString() -> Set of socketIds

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      let registeredUserId = null;

      socket.on('register', async (userId) => {
        if (!userId) return;
        const uid = userId.toString();
        registeredUserId = uid;

        if (!userSockets.has(uid)) {
          userSockets.set(uid, new Set());
        }
        userSockets.get(uid).add(socket.id);

        // Broadcast user came online if this is their first connection
        if (userSockets.get(uid).size === 1) {
          io.emit('userOnline', { userId: uid });
          try {
            const User = require('./models/User');
            await User.findByIdAndUpdate(uid, { isOnline: true, lastSeen: new Date() });
          } catch (e) {
            // non-blocking
          }
        }

        // Send current online user IDs to the newly registered socket
        socket.emit('onlineUsersList', Array.from(userSockets.keys()));
      });

      // Typing indicators
      socket.on('typing', ({ receiverId }) => {
        if (!registeredUserId || !receiverId) return;
        const targetSockets = userSockets.get(receiverId.toString());
        if (targetSockets) {
          for (const sId of targetSockets) {
            io.to(sId).emit('userTyping', { senderId: registeredUserId });
          }
        }
      });

      socket.on('stopTyping', ({ receiverId }) => {
        if (!registeredUserId || !receiverId) return;
        const targetSockets = userSockets.get(receiverId.toString());
        if (targetSockets) {
          for (const sId of targetSockets) {
            io.to(sId).emit('userStopTyping', { senderId: registeredUserId });
          }
        }
      });

      socket.on('disconnect', async () => {
        if (registeredUserId && userSockets.has(registeredUserId)) {
          const sockets = userSockets.get(registeredUserId);
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(registeredUserId);
            io.emit('userOffline', { userId: registeredUserId, lastSeen: new Date() });
            try {
              const User = require('./models/User');
              await User.findByIdAndUpdate(registeredUserId, { isOnline: false, lastSeen: new Date() });
            } catch (e) {
              // non-blocking
            }
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
    if (!userId) return null;
    const set = userSockets.get(userId.toString());
    if (set && set.size > 0) {
      return Array.from(set)[0];
    }
    return null;
  },

  emitToUser: (userId, event, payload) => {
    if (!userId || !io) return;
    const set = userSockets.get(userId.toString());
    if (set && set.size > 0) {
      for (const socketId of set) {
        io.to(socketId).emit(event, payload);
      }
    }
  },

  isUserOnline: (userId) => {
    if (!userId) return false;
    const set = userSockets.get(userId.toString());
    return !!(set && set.size > 0);
  },

  getOnlineUserIds: () => {
    return Array.from(userSockets.keys());
  }
};
