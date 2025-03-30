// backend/server.js
import express from 'express';
import path from 'path'; // Necesario para trabajar con rutas de archivos
import { fileURLToPath } from 'url'; // <--- ASEGÚRATE QUE ESTA LÍNEA ESTÉ PRESENTE
import cors from 'cors';
import morgan from 'morgan'; // Logger de peticiones HTTP
import config from './config/index.js'; // Carga centralizada de config/.env
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import assetRoutes from './routes/assetRoutes.js';

// Conectar a la base de datos
connectDB();

const app = express();


// Middleware para logging en desarrollo
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Middleware para habilitar CORS
app.use(cors({
    origin: 'http://localhost:3000'
}));


// Middleware para parsear JSON y urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas de la API ---
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);


// --- Servir archivos estáticos (uploads) ---

// ******** BORRA ESTAS DOS LÍNEAS ********
// const __dirname = path.resolve();
// app.use('/uploads/images', express.static(path.join(__dirname, '/backend/uploads/images')));
// ******** FIN BORRAR LÍNEAS ********


// ******** AÑADE ESTAS LÍNEAS EN SU LUGAR ********
const __filename = fileURLToPath(import.meta.url); // Obtiene la ruta del archivo actual (server.js)
const __dirname = path.dirname(__filename); // Obtiene el directorio que contiene server.js (tu carpeta backend)

console.log(`[INFO] Sirviendo imágenes desde ruta estática: ${path.join(__dirname, 'uploads/images')}`); // Log para confirmar
// Sirve archivos estáticos desde la carpeta uploads/images DENTRO de __dirname (backend)
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));
// ******** FIN AÑADIR LÍNEAS ********

// NO servimos /uploads/assets directamente, usamos la ruta de descarga


// --- Manejo de Errores ---
app.use(notFound);
app.use(errorHandler);


// Iniciar el servidor
app.listen(config.port, () => {
  console.log(`Servidor corriendo en modo ${config.nodeEnv} en el puerto ${config.port}`);
});