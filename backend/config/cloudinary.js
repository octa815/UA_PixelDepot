// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import config from './index.js'; // Para leer variables de entorno

cloudinary.config({
  cloud_name: config.cloudinaryCloudName, // Lee desde tu config/index.js
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
  secure: true, // Usa HTTPS
});

// Función helper para subir desde buffer (útil para memoryStorage de multer)
const uploadStream = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });
        stream.end(buffer);
    });
};


export { cloudinary, uploadStream };