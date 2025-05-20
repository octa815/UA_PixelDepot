// frontend/src/services/userService.js
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? ''
  : process.env.REACT_APP_API_BASE_URL || 'https://localhost:5000';

const USERS_API_ENDPOINT = `${API_BASE_URL}/api/users`; // e.g., /api/users o https://localhost:5000/api/users

export const getMe = async () => {
  try {
    const response = await axios.get(`${USERS_API_ENDPOINT}/me`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error.response?.data || error.message;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(`${USERS_API_ENDPOINT}/me`, profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error.response?.data || error.message;
  }
};

export const changePassword = async (passwordData) => {
    try {
        const response = await axios.post(`${USERS_API_ENDPOINT}/me/change-password`, passwordData);
        return response.data;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error.response?.data || error.message;
    }
};

export const getMyAssets = async (params = {}) => {
  try {
    const response = await axios.get(`${USERS_API_ENDPOINT}/me/assets`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching user assets:", error);
    throw error.response?.data || error.message;
  }
};