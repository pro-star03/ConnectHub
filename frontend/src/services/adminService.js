import api from './api';

export const getDashboardStats = () => api.get('/admin/dashboard');
export const getUsers = () => api.get('/admin/users');
export const blockUser = (userId) => api.put(`/admin/users/${userId}/block`);
export const unblockUser = (userId) => api.put(`/admin/users/${userId}/unblock`);
export const getReports = () => api.get('/admin/reports');
export const adminDeletePost = (postId) => api.delete(`/admin/posts/${postId}`);
export const getFeedback = () => api.get('/admin/feedback');
export const resolveFeedback = (id) => api.put(`/admin/feedback/${id}/resolve`);
export const getActivity = () => api.get('/admin/activity');
