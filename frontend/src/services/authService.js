// frontend/src/services/authService.js
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? ''
  : process.env.REACT_APP_API_BASE_URL || 'https://localhost:5000';

// Interceptor (ya lo tienes y está bien)
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export const login = async (credentials) => {
  try {
    // Ruta backend: /api/auth/login
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const register = async (userData) => {
  try {
    // Ruta backend: /api/registro
    const response = await axios.post(`${API_BASE_URL}/api/registro`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};