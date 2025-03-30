// backend/middleware/errorMiddleware.js
import config from '../config/index.js';

// Middleware para manejar rutas no encontradas (404)
const notFound = (req, res, next) => {
  const error = new Error(`No encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pasa el error al siguiente middleware (errorHandler)
};

// Middleware para manejar errores generales
const errorHandler = (err, req, res, next) => {
  // A veces, un error puede venir con un código de estado 200, lo cambiamos a 500 si es el caso
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Manejo de errores específicos de Mongoose (ej: ID inválido)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404; // Not Found
    message = 'Recurso no encontrado (ID inválido).';
  }

  // Manejo de errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    // Extrae los mensajes de error de validación
    const errors = Object.values(err.errors).map(el => el.message);
    message = `Error de validación: ${errors.join('. ')}`;
  }

  // Manejo de errores de clave duplicada (ej: email ya existe)
  if (err.code === 11000) {
      statusCode = 400;
      const field = Object.keys(err.keyValue)[0];
      message = `El valor proporcionado para el campo '${field}' ya existe.`;
  }


  res.status(statusCode).json({
    message: message,
    // Mostramos el stack trace solo en desarrollo
    stack: config.nodeEnv === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };