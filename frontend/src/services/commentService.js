// frontend/src/services/commentService.js
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? ''
  : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const COMMENTS_API_ENDPOINT = `${API_BASE_URL}/api/comments`; // e.g., /api/comments

// Obtener comentarios de un asset
export const getCommentsByAsset = async (assetId) => {
  const response = await axios.get(`${COMMENTS_API_ENDPOINT}/${assetId}`); // Correcto: /api/comments/:assetId
  return response.data;
};

// Crear un nuevo comentario
export const createComment = async (commentData, token) => { // token ya se añade por el interceptor
  const config = {
    headers: {
      // Authorization: `Bearer ${token}`, // El interceptor ya lo hace
    },
  };
  const response = await axios.post(COMMENTS_API_ENDPOINT, commentData, config); // Correcto: POST /api/comments
  return response.data;
};