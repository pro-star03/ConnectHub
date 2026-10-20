import api from './api';

export const getPosts = (params = {}) => api.get('/posts', { params });
export const getPostById = (postId) => api.get(`/posts/${postId}`);
export const createPost = (postData) => api.post('/posts', postData);
export const updatePost = (postId, data) => api.put(`/posts/${postId}`, data);
export const likePost = (postId) => api.post(`/posts/${postId}/like`);
export const unlikePost = (postId) => api.post(`/posts/${postId}/unlike`);
export const reactPost = (postId, type) => api.post(`/posts/${postId}/react`, { type });
export const votePoll = (postId, optionIndex) => api.post(`/posts/${postId}/poll/vote`, { optionIndex });
export const getSavedPosts = () => api.get('/posts/saved');
export const toggleSavePost = (postId) => api.post(`/posts/${postId}/save`);
export const deletePost = (postId) => api.delete(`/posts/${postId}`);
export const getTrendingTags = () => api.get('/posts/trending-tags');
