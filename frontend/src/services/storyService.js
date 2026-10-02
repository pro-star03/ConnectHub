import api from './api';

export const getActiveStories = () => api.get('/stories');
export const createStory = (storyData) => api.post('/stories', storyData);
export const deleteStory = (id) => api.delete(`/stories/${id}`);
export const viewStory = (id) => api.post(`/stories/${id}/view`);
