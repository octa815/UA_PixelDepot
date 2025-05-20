// src/services/authService.js
import axios from 'axios'; // O usa fetch
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:5000/';
const API_URL = `${API_BASE_URL}/api/auth`;

// Añade un interceptor para incluir el token en las cabeceras si existe
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
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    // Asume que tu backend devuelve { token: '...', user: { ... } }
    return response.data;
  } catch (error) {
    // Lanza el error para manejarlo en el componente
    throw error.response?.data || error.message;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/registro`, userData);// Endpoint original
    // Asume que devuelve algo, quizás { message: '...', user: {...}, token: '...' } o solo un mensaje
     return response.data; // Devuelve la respuesta completa
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Opcional: Función para verificar token (ejemplo)
// export const verifyToken = async () => {
//   const token = localStorage.getItem('token');
//   if (!token) throw new Error("No token found");
//   try {
//     // Asume un endpoint /api/auth/verify o similar
//     const response = await axios.get(`${API_URL}/verify`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     return response.data.user; // Devuelve datos del usuario si es válido
//   } catch (error) {
//     throw error.response?.data || error.message;
//   }
// };

// Opcional: Logout en backend si es necesario
// export const logout = async () => {
//   try {
//     await axios.post(`${API_URL}/logout`);
//   } catch (error) {
//     console.error("Backend logout failed:", error);
//   }
// };