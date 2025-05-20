// backend/server.js
import express from 'express';
import path from 'path';   // <-- Necesario para construir rutas
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http'; // Use http
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

app.use(cors());


// Middlewares (morgan, cors, body-parser)
if (config.nodeEnv === 'development') { app.use(morgan('dev')); }
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas API ---
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/comments', commentRoutes);

// Serve frontend files
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendBuildPath));

  // For any other route, serve the frontend's index.html
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running... Set NODE_ENV=production to serve frontend.');
  });
}
// --- Servir archivos estáticos --- (Ya no es necesario para uploads si usas Cloudinary)
// app.use('/uploads/images', ...);

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Iniciar el Servidor HTTPS ---
const port = config.port || 5000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(
    `Server running in ${config.nodeEnv} mode on port ${port}`
  );
});
// ------------------------------