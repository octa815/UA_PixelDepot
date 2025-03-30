// backend/middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorios si no existen
const uploadsDir = path.join(path.resolve(), 'uploads'); // Asegúrate que la ruta sea correcta desde donde se ejecuta
const imagesDir = path.join(uploadsDir, 'images');
const assetsDir = path.join(uploadsDir, 'assets');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);


// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determina el directorio basado en el nombre del campo del formulario
    if (file.fieldname === 'imagenDescriptiva') {
      cb(null, imagesDir);
    } else if (file.fieldname === 'archivo') {
      cb(null, assetsDir);
    } else {
      cb(new Error('Campo de archivo no válido'), null); // Rechaza otros campos
    }
  },
  filename: function (req, file, cb) {
    // Genera un nombre de archivo único para evitar colisiones
    // Incluye timestamp y nombre original (sanitizado)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  },
});

// Filtro de archivos (opcional, para limitar tipos de archivo)
function fileFilter(req, file, cb) {
  // Ejemplo: Aceptar solo ciertos tipos de imágenes para 'imagenDescriptiva'
  if (file.fieldname === 'imagenDescriptiva') {
    const allowedImageTypes = /jpeg|jpg|png|gif|svg\+xml/; // Añade webp si quieres
    const mimetype = allowedImageTypes.test(file.mimetype);
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Solo se permiten archivos de imagen (jpeg, jpg, png, gif, svg)!'), false);
    }
  }
  // Para 'archivo', podrías ser más permisivo o añadir más validaciones si es necesario
  else if (file.fieldname === 'archivo') {
    // Aceptar cualquier cosa por ahora, o añadir validaciones
    cb(null, true);
  }
  else {
      cb(new Error('Campo de archivo no reconocido'), false);
  }
}

// Crear instancia de Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // Límite de tamaño de archivo (ej: 200MB) - ¡AJUSTA ESTO!
  fileFilter: fileFilter,
});

// Middleware específico para subir los dos archivos esperados en la creación/edición de assets
// 'imagenDescriptiva' es el campo para la imagen, 'archivo' para el asset principal
const uploadAssetFiles = upload.fields([
  { name: 'imagenDescriptiva', maxCount: 1 },
  { name: 'archivo', maxCount: 1 },
]);

export { uploadAssetFiles }; // Exporta el middleware configurado