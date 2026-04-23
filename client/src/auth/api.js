import axios from "axios";
import useStore from "../store/useStore";

const rawBase = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");
const API_URL = rawBase ? `${rawBase}/api` : "/api";

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

// VERY IMPORTANT FIX: Render wipes the database periodically. If the backend says our token
// represents a user that no longer exists (401), we automatically delete our local session
// and force a logout so the user can easily register again!
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.needLogout
    ) {
      // Clear auth state globally from anywhere!
      useStore.getState().logout();
      // Optionally alert the user or redirect them home
      alert(
        "Your session expired because the database was updated! Please register again.",
      );
      window.location.href = "/register";
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  register: async (store_id, name, phone, email, password) => {
    const response = await api.post("/auth/register", {
      store_id,
      name,
      phone,
      email,
      password,
    });
    return response.data;
  },
  calibrate: async (step_length_meters) => {
    const response = await api.post("/auth/calibrate", { step_length_meters });
    return response.data;
  },
};

export default api;
