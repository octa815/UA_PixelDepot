// backend/middleware/uploadMiddleware.js
import multer from 'multer';

// --- CAMBIO: Usar almacenamiento en memoria ---
const storage = multer.memoryStorage();
// --- FIN CAMBIO ---

// Filtro de archivos (igual, pero sin usar path si no es necesario)
function fileFilter(req, file, cb) {
  if (file.fieldname === 'imagenDescriptiva') {
    // Simplificado: Confiar más en mimetype si está disponible
    const allowedImageTypes = /jpeg|jpg|png|gif|svg\+xml|webp/;
    if (allowedImageTypes.test(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Solo se permiten archivos de imagen (jpeg, jpg, png, gif, svg, webp)!'), false);
    }
  } else if (file.fieldname === 'archivo') {
    cb(null, true); // Aceptar otros tipos para 'archivo'
  } else {
      cb(new Error('Campo de archivo no reconocido'), false);
  }
}

// Crear instancia de Multer
const upload = multer({
  storage: storage, // <-- Usa memoryStorage
  limits: { fileSize: 50 * 1024 * 1024 }, // Límite (ej: 50MB) ¡AJUSTA!
  fileFilter: fileFilter,
});

// Middleware (igual)
const uploadAssetFiles = upload.fields([
  { name: 'imagenDescriptiva', maxCount: 1 },
  { name: 'archivo', maxCount: 1 },
]);

export { uploadAssetFiles };