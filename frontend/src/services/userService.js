import api from './api';

export const getUserProfile = (userId) => api.get(`/users/${userId}`);
export const updateUserProfile = (userId, userData) => api.put(`/users/${userId}`, userData);
export const followUser = (userId) => api.post(`/users/${userId}/follow`);
export const unfollowUser = (userId) => api.post(`/users/${userId}/unfollow`);
export const getSuggestedUsers = () => api.get('/users/suggestions');
export const searchUsers = (query) => api.get(`/users/search?q=${query}`);
export const deactivateAccount = () => api.post('/users/deactivate');
export const deleteAccount = () => api.delete('/users/delete');
export const changePassword = (data) => api.put('/users/change-password', data);
export const submitFeedback = (data) => api.post('/users/feedback', data);
