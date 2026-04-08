import axios from 'axios';
import useStore from '../store/useStore';
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add JWT token if available
api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (store_id, name, phone, email, password) => {
    const response = await api.post('/auth/register', { store_id, name, phone, email, password });
    return response.data;
  },
  calibrate: async (step_length_meters) => {
    const response = await api.post('/auth/calibrate', { step_length_meters });
    return response.data;
  }
};

export default api;
