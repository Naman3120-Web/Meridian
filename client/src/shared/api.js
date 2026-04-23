import axios from "axios";

const rawBase = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");
const API_URL = rawBase ? `${rawBase}/api` : "/api";

// Create a base Axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to attach the JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
