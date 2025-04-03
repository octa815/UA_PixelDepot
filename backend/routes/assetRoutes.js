// backend/routes/assetRoutes.js
import express from 'express';
import {
  createAsset, getAssets, getAssetById, updateAsset, deleteAsset,
  // downloadAssetFile // Ya no se usa
} from '../controllers/assetController.js';
import { protect } from '../middleware/authMiddleware.js';
// --- IMPORTAR Y USAR uploadAssetFiles ---
import { uploadAssetFiles } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAssets)
  // --- Usa uploadAssetFiles ANTES del controlador ---
  .post(protect, uploadAssetFiles, createAsset);

router.route('/:id')
  .get(getAssetById)
   // --- Usa uploadAssetFiles ANTES del controlador ---
  .put(protect, uploadAssetFiles, updateAsset)
  .delete(protect, deleteAsset);

// --- BORRAR o COMENTAR ruta download ---
// router.get('/:id/download', protect, downloadAssetFile);

export default router;