import api from './api';

export const getPosts = () => api.get('/posts');
export const getPostById = (postId) => api.get(`/posts/${postId}`);
export const createPost = (postData) => api.post('/posts', postData);
export const likePost = (postId) => api.post(`/posts/${postId}/like`);
export const unlikePost = (postId) => api.post(`/posts/${postId}/unlike`);
export const getSavedPosts = () => api.get('/users/me/saved'); // Need to check if user saved posts route exists, if not, we use save toggle
export const toggleSavePost = (postId) => api.post(`/posts/${postId}/save`);
export const deletePost = (postId) => api.delete(`/posts/${postId}`);
