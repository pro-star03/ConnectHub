import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?._id) {
      const socketUrl = import.meta.env.DEV ? `${window.location.protocol}//${window.location.hostname}:5000` : '/';
      
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        newSocket.emit('register', user._id);
      });

      newSocket.on('onlineUsersList', (ids) => {
        if (Array.isArray(ids)) {
          setOnlineUserIds(new Set(ids.map(id => id.toString())));
        }
      });

      newSocket.on('userOnline', ({ userId }) => {
        if (userId) {
          setOnlineUserIds(prev => {
            const next = new Set(prev);
            next.add(userId.toString());
            return next;
          });
        }
      });

      newSocket.on('userOffline', ({ userId }) => {
        if (userId) {
          setOnlineUserIds(prev => {
            const next = new Set(prev);
            next.delete(userId.toString());
            return next;
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
      setOnlineUserIds(new Set());
    }
  }, [user?._id]);

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUserIds.has(userId.toString());
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUserIds, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};
