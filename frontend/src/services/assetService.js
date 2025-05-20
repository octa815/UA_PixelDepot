// src/services/assetService.js
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:5000/';
const API_URL = `${API_BASE_URL}/api/assets`;

// Obtener assets (con filtros opcionales: tipo, búsqueda, paginación, etc.)
export const getAssets = async (params = {}) => {
  try {
    // Construye los query params si existen
    // Ejemplo: /api/assets?type=2D&search=character&limit=10&page=1&sortBy=fechaSubida&order=desc
    const response = await axios.get(API_URL, { params });
    // Asume que tu backend devuelve un objeto como { assets: [...], totalPages: X, currentPage: Y } o solo un array [...]
    return response.data;
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error.response?.data || error.message;
  }
};

// Obtener un asset por ID
export const getAssetById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    // Asume que devuelve el objeto del asset
    return response.data;
  } catch (error) {
    console.error(`Error fetching asset ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

// Subir un nuevo asset (usando FormData para archivos)
export const uploadAsset = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Importante para archivos
      },
    });
    // Asume que devuelve el asset creado
    return response.data;
  } catch (error) {
    console.error("Error uploading asset:", error);
    throw error.response?.data || error.message;
  }
};

// Actualizar un asset existente (puede necesitar FormData si se actualizan archivos)
export const updateAsset = async (id, assetData) => {
  // Detectar si se están enviando archivos para usar FormData
  let dataToSend = assetData;
  let headers = { 'Content-Type': 'application/json' };

  // Si assetData contiene instancias de File, usa FormData
  let hasFiles = false;
  if (assetData instanceof FormData) {
      hasFiles = true; // Si ya es FormData, asumimos que tiene archivos
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
        // Asegúrate de no añadir 'undefined' o 'null' si no es intencional
        if (assetData[key] !== null && assetData[key] !== undefined) {
           dataToSend.append(key, assetData[key]);
        }
      }
      headers = { 'Content-Type': 'multipart/form-data' };
  } else if (assetData instanceof FormData) {
     // Si ya es FormData, solo ajusta la cabecera
     headers = { 'Content-Type': 'multipart/form-data' };
  }


  try {
    // Usar PUT o PATCH según tu API
    const response = await axios.put(`${API_URL}/${id}`, dataToSend, { headers });
    // Asume que devuelve el asset actualizado
    return response.data;
  } catch (error) {
    console.error(`Error updating asset ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

// Borrar un asset por ID
export const deleteAsset = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    // Asume que devuelve un mensaje o nada
    return response.data;
  } catch (error) {
    console.error(`Error deleting asset ${id}:`, error);
    throw error.response?.data || error.message;
  }
};

// Opcional: Endpoint para descargar el archivo del asset
export const getAssetDownloadUrl = (id) => {
    // Esto podría ser un enlace directo si tu backend lo gestiona así,
    // o podría requerir una llamada API que devuelva una URL temporal o inicie la descarga.
    // Ejemplo simple (ajusta según tu backend):
    return `${API_URL}/${id}/download`;
};