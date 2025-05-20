// backend/server.js
import express from 'express';
import path from 'path';   // <-- Necesario para construir rutas
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/index.js';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

// --- Calcula __dirname de forma fiable ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --------------------------------------

connectDB();
const app = express();

// --- Configuración HTTPS ---
// const httpsOptions = {
//   key: fs.readFileSync(path.join(__dirname, 'ssl', 'private-key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.pem'))
//   // Si usaste mkcert, los nombres serían algo como 'localhost+2-key.pem' y 'localhost+2.pem'
// };
// --------------------------

// Middlewares (morgan, cors, body-parser)
if (config.nodeEnv === 'development') { app.use(morgan('dev')); }
app.use(cors({ origin: 'https://localhost:3000' })); // <-- CAMBIAR A HTTPS y puerto frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas API ---
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/comments', commentRoutes);

// Serve frontend files
if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => 
    res.sendFile(
      path.join(__dirname, '../','frontend','build', 'index.html')
    )
  )
}else{
  app.get('/', (req, res) => {
    res.send('Por favor activa producción');
  });
}
// --- Servir archivos estáticos --- (Ya no es necesario para uploads si usas Cloudinary)
// app.use('/uploads/images', ...);

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Iniciar el Servidor HTTPS ---
const httpsPort = config.port || 5001; // Usa el puerto de .env o 5001 por defecto para HTTPS

https.createServer(httpsOptions, app).listen(httpsPort, () => { // <-- Cambiado a https.createServer
  console.log(`Servidor HTTPS corriendo en modo ${config.nodeEnv} en el puerto ${httpsPort}`);
});
// ------------------------------