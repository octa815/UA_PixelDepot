// src/services/userService.js
import axios from 'axios';

const API_URL = '/api/users'; // Ajusta la URL base de tu API de usuarios

// Obtener datos del usuario logueado (requiere token)
export const getMe = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`);
    // Asume que devuelve el objeto del usuario
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error.response?.data || error.message;
  }
};

// Actualizar perfil del usuario logueado
export const updateProfile = async (profileData) => {
  try {
    // Usar PUT o PATCH según tu API
    const response = await axios.put(`${API_URL}/me`, profileData);
    // Asume que devuelve el usuario actualizado
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error.response?.data || error.message;
  }
};

// Opcional: Cambiar contraseña
export const changePassword = async (passwordData) => {
    try {
        // Endpoint específico para cambio de contraseña
        const response = await axios.post(`${API_URL}/me/change-password`, passwordData);
        return response.data; // Mensaje de éxito/error
    } catch (error) {
        console.error("Error changing password:", error);
        throw error.response?.data || error.message;
    }
};

// Opcional: Obtener assets subidos por el usuario logueado
export const getMyAssets = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/me/assets`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching user assets:", error);
    throw error.response?.data || error.message;
  }
};

// Opcional: Obtener un usuario por ID (si necesitas ver perfiles públicos)
// export const getUserById = async (id) => {
//   try {
//     const response = await axios.get(`${API_URL}/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching user ${id}:`, error);
//     throw error.response?.data || error.message;
//   }
// };