import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5218/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('novapay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('novapay_token');
      localStorage.removeItem('novapay_user');
      window.dispatchEvent(new Event('auth_state_changed'));
    }
    return Promise.reject(error);
  }
);
