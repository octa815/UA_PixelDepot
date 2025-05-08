import asyncHandler from 'express-async-handler';
import Comment from '../models/Comment.js';
import Asset from '../models/Asset.js';

// Crear un nuevo comentario
const createComment = asyncHandler(async (req, res) => {
  const { content, assetId } = req.body;

  if (!content || !assetId) {
    res.status(400);
    throw new Error('El contenido y el ID del asset son obligatorios.');
  }

  const asset = await Asset.findById(assetId);
  if (!asset) {
    res.status(404);
    throw new Error('Asset no encontrado.');
  }

  const comment = await Comment.create({
    content,
    author: req.user._id, // Usuario autenticado
    asset: assetId,
  });

  res.status(201).json(comment);
});

// Obtener comentarios de un asset
const getCommentsByAsset = asyncHandler(async (req, res) => {
  const { assetId } = req.params;

  const comments = await Comment.find({ asset: assetId }).populate('author', 'nombre email');
  res.json(comments);
});

// Eliminar un comentario
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  if (!comment) {
    res.status(404);
    throw new Error('Comentario no encontrado.');
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('No autorizado para eliminar este comentario.');
  }

  await comment.remove();
  res.json({ message: 'Comentario eliminado.' });
});

export { createComment, getCommentsByAsset, deleteComment };