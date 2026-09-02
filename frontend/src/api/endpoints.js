import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  updatePassword: (data) => api.put('/auth/password', data),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStores: (params) => api.get('/admin/stores', { params }),
  createStore: (data) => api.post('/admin/stores', data),
  deleteStore: (id) => api.delete(`/admin/stores/${id}`),
};

export const storesAPI = {
  getStores: (params) => api.get('/stores', { params }),
  submitRating: (storeId, value) => api.post(`/stores/${storeId}/ratings`, { value }),
};

export const ownerAPI = {
  getDashboard: () => api.get('/store-owner/dashboard'),
};
