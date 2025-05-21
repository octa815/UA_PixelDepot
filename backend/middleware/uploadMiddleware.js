// backend/middleware/uploadMiddleware.js
import multer from 'multer';

// Usar almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro de archivos
function fileFilter(req, file, cb) {
  // Permitir imágenes para imagenDescriptiva e imagenesAdicionales
  if (file.fieldname === 'imagenDescriptiva' || file.fieldname === 'imagenesAdicionales') {
    const allowedImageTypes = /jpeg|jpg|png|gif|svg\+xml|webp/;
    if (allowedImageTypes.test(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Solo se permiten archivos de imagen (jpeg, jpg, png, gif, svg, webp)!'), false);
    }
  } else if (file.fieldname === 'archivo') {
    cb(null, true); // Aceptar cualquier tipo para 'archivo' (el principal del asset)
  } else {
    cb(new Error('Campo de archivo no reconocido'), false);
  }
}

// Crear instancia de Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Límite (ej: 50MB) ¡AJUSTA SEGÚN NECESIDAD!
  fileFilter: fileFilter,
});

// Middleware para manejar los diferentes campos de archivo
const uploadAssetFiles = upload.fields([
  { name: 'imagenDescriptiva', maxCount: 1 }, // Imagen principal
  { name: 'archivo', maxCount: 1 },           // Archivo principal del asset
  { name: 'imagenesAdicionales', maxCount: 10 } // Nuevo: hasta 10 imágenes adicionales
]);

export { uploadAssetFiles };