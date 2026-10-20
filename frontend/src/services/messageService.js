import api from './api';

export const getConversations = () => api.get('/messages/conversations');
export const getMessages = (userId) => api.get(`/messages/${userId}`);
export const sendMessage = (receiverId, message, media = '') => api.post('/messages', { receiverId, message, media });
export const markConversationRead = (userId) => api.put(`/messages/read/${userId}`);
