import api from './api';

export const reportPost = (postId, reason, description) => api.post('/reports', { reportedPost: postId, reason, description });
export const reportUser = (userId, reason, description) => api.post('/reports', { reportedUser: userId, reason, description });
