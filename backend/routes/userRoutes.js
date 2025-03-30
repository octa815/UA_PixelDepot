// backend/routes/userRoutes.js
import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getMyAssets,
  getUsers,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; // Middleware de protección

const router = express.Router();

// Rutas que requieren autenticación (usando 'protect')
router.route('/me')
  .get(protect, getUserProfile)     // GET /api/users/me
  .put(protect, updateUserProfile); // PUT /api/users/me

router.get('/me/assets', protect, getMyAssets); // GET /api/users/me/assets

// --- NUEVAS RUTAS ---

// Ruta para obtener todos los usuarios (protegida y debería ser solo admin)
router.route('/')
  .get(protect, admin, getUsers); // GET /api/users

// Ruta para borrar un usuario por ID (protegida y debería ser solo admin)
router.route('/:id')
  .delete(protect, admin, deleteUser); // DELETE /api/users/:id


export default router;