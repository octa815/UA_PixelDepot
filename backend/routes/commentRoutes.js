import express from 'express';
import { createComment, getCommentsByAsset, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Crear un comentario
router.post('/', protect, createComment);

// Obtener comentarios de un asset
router.get('/:assetId', getCommentsByAsset);

// Eliminar un comentario
router.delete('/:id', protect, deleteComment);

export default router;