// frontend/src/services/assetService.js
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '' // Para producción, las llamadas son relativas al mismo host
  : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'; // Para desarrollo local

const ASSETS_API_ENDPOINT = `${API_BASE_URL}/api/assets`; // e.g., /api/assets o https://localhost:5000/api/assets

export const getAssets = async (params = {}) => {
  try {
    const response = await axios.get(ASSETS_API_ENDPOINT, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error.response?.data || error.message;
  }
};

export const getAssetById = async (id) => {
  try {
    const response = await axios.get(`${ASSETS_API_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching asset ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const uploadAsset = async (formData) => {
  try {
    const response = await axios.post(ASSETS_API_ENDPOINT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading asset:", error);
    throw error.response?.data || error.message;
  }
};

export const updateAsset = async (id, assetData) => {
  let dataToSend = assetData;
  let headers = { 'Content-Type': 'application/json' };
  let hasFiles = false;
  if (assetData instanceof FormData) {
      hasFiles = true;
  } else {
      for (const key in assetData) {
          if (assetData[key] instanceof File) {
              hasFiles = true;
              break;
          }
      }
  }

  if (hasFiles && !(assetData instanceof FormData)) {
      dataToSend = new FormData();
      for (const key in assetData) {
        if (assetData[key] !== null && assetData[key] !== undefined) {
           dataToSend.append(key, assetData[key]);
        }
      }
  }
  if (assetData instanceof FormData || (hasFiles && !(assetData instanceof FormData)) ) {
    headers = { 'Content-Type': 'multipart/form-data' };
  }

  try {
    const response = await axios.put(`${ASSETS_API_ENDPOINT}/${id}`, dataToSend, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error updating asset ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const deleteAsset = async (id) => {
  try {
    const response = await axios.delete(`${ASSETS_API_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting asset ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

export const getAssetDownloadUrl = (id) => {
    return `${ASSETS_API_ENDPOINT}/${id}/download`;
};