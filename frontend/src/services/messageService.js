import api from './api';

export const getConversations = () => api.get('/messages/conversations');
export const getMessages = (userId) => api.get(`/messages/${userId}`);
export const sendMessage = (receiverId, message) => api.post('/messages', { receiverId, message });
