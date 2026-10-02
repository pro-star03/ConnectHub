import api from './api';

export const getComments = (postId) => api.get(`/comments/${postId}`);
export const addComment = (postId, text) => api.post('/comments', { postId, text });
export const replyToComment = (commentId, text) => api.post(`/comments/${commentId}/reply`, { text });
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);
