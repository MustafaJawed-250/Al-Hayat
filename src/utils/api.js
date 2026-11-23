import axios from 'axios';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// Public
export const getMenu = (params) => api.get('/menu', { params });
export const getCategories = () => api.get('/menu/categories');
export const getMenuItem = (id) => api.get(`/menu/${id}`);
export const placeOrder = (data) => api.post('/orders', data);
export const getGallery = () => api.get('/gallery');
export const sendMessage = (data) => api.post('/messages', data);
export const getSiteSettings = () => api.get('/media/settings');

// Auth
export const loginAdmin = (password) => api.post('/auth/login', { password });
export const logoutAdmin = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// Admin – stats
export const getStats = () => api.get('/admin/stats');

// Admin – menu
export const adminGetMenu = (params = {}) => api.get('/menu', { params: { available: 'false', ...params } });
export const adminCreateItem = (data) => api.post('/menu', data);
export const adminUpdateItem = (id, data) => api.put(`/menu/${id}`, data);
export const adminDeleteItem = (id) => api.delete(`/menu/${id}`);

// Admin – categories
export const adminGetCategories = () => api.get('/admin/categories');
export const adminCreateCategory = (data) => api.post('/admin/categories', data);
export const adminUpdateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// Admin – orders
export const getOrders = (params) => api.get('/orders', { params });
export const confirmOrder = (id) => api.put(`/orders/${id}/confirm`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

// Admin – gallery
export const adminAddGallery = (data) => api.post('/gallery', data);
export const adminUpdateGallery = (id, data) => api.put(`/gallery/${id}`, data);
export const adminDeleteGallery = (id) => api.delete(`/gallery/${id}`);

// Admin – messages
export const getMessages = () => api.get('/messages');
export const markMessageRead = (id) => api.put(`/messages/${id}/read`);
export const deleteMessage = (id) => api.delete(`/messages/${id}`);

// Admin – media
export const getMedia = (params) => api.get('/media', { params });
export const uploadMedia = (formData) =>
  api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateMedia = (id, data) => api.put(`/media/${id}`, data);
export const deleteMedia = (id) => api.delete(`/media/${id}`);
export const updateSiteSetting = (key, data) => api.put(`/media/settings/${key}`, data);
