import axios from 'axios';

// Create a base Axios instance
const api = axios.create({
  baseURL: '/api', // This uses the proxy we set up in vite.config.js
});

// Interceptor to attach the JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
