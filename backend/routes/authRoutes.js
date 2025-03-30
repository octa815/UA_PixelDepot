// backend/routes/authRoutes.js
import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// POST /api/registro (Endpoint original del frontend) -> lo mapeamos a registerUser
router.post('/registro', registerUser);

// POST /api/auth/login (Endpoint original del frontend) -> lo mapeamos a loginUser
router.post('/auth/login', loginUser);


export default router;