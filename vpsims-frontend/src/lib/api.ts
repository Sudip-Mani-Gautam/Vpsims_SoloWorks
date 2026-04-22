import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5164';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${API_BASE_URL}/api`,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vpsims_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 → logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vpsims_token');
      localStorage.removeItem('vpsims_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
