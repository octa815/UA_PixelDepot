import axios from 'axios';

const API_URL = '/api/comments';

// Obtener comentarios de un asset
export const getCommentsByAsset = async (assetId) => {
  const response = await axios.get(`${API_URL}/${assetId}`);
  return response.data;
};

// Crear un nuevo comentario
export const createComment = async (commentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, commentData, config);
  return response.data;
};