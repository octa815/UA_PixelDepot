// backend/routes/assetRoutes.js
import express from 'express';
import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  downloadAssetFile,
} from '../controllers/assetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAssetFiles } from '../middleware/uploadMiddleware.js'; // Middleware para subida

const router = express.Router();

// Rutas para obtener assets (públicas o privadas según decidas)
router.route('/')
  .get(getAssets) // GET /api/assets (con filtros, etc.)
  // Para crear, requiere protección Y el middleware de subida ANTES del controlador
  .post(protect, uploadAssetFiles, createAsset); // POST /api/assets

// Rutas para un asset específico por ID
router.route('/:id')
  .get(getAssetById) // GET /api/assets/:id
  // Para actualizar, requiere protección Y el middleware de subida (por si cambian archivos)
  .put(protect, uploadAssetFiles, updateAsset) // PUT /api/assets/:id
  // Para borrar, solo requiere protección
  .delete(protect, deleteAsset); // DELETE /api/assets/:id

// Ruta específica para descargar el archivo principal (requiere protección)
router.get('/:id/download', protect, downloadAssetFile); // GET /api/assets/:id/download

export default router;