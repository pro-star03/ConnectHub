import api from './api';

// Analytics & Metrics
export const getDashboardStats = () => api.get('/admin/dashboard');
export const getSystemHealth = () => api.get('/admin/health');
export const getActivity = () => api.get('/admin/activity');

// User Management
export const getUsers = () => api.get('/admin/users');
export const toggleUserVerification = (userId) => api.put(`/admin/users/${userId}/verify`);
export const updateUserRole = (userId, role) => api.put(`/admin/users/${userId}/role`, { role });
export const adminResetPassword = (userId, password) => api.put(`/admin/users/${userId}/reset-password`, { password });
export const blockUser = (userId) => api.put(`/admin/users/${userId}/block`);
export const unblockUser = (userId) => api.put(`/admin/users/${userId}/unblock`);
export const adminDeleteUser = (userId) => api.delete(`/admin/users/${userId}`);

// Post & Content Moderation
export const getPosts = () => api.get('/admin/posts');
export const togglePinPost = (postId) => api.put(`/admin/posts/${postId}/pin`);
export const adminDeletePost = (postId) => api.delete(`/admin/posts/${postId}`);

// Stories Moderation
export const getAdminStories = (params = {}) => api.get('/admin/stories', { params });
export const adminDeleteStory = (storyId) => api.delete(`/admin/stories/${storyId}`);

// Reports & Safety
export const getReports = () => api.get('/admin/reports');
export const resolveReport = (id, status) => api.put(`/admin/reports/${id}/resolve`, { status });
export const dismissReport = (id) => api.put(`/admin/reports/${id}/dismiss`);

// Feedback & Support
export const getFeedback = () => api.get('/admin/feedback');
export const resolveFeedback = (id, status) => api.put(`/admin/feedback/${id}/resolve`, { status });

// Settings & Platform Controls
export const getAdminSettings = () => api.get('/admin/settings');
export const updateAdminSettings = (data) => api.put('/admin/settings', data);
