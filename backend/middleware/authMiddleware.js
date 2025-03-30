// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import config from '../config/index.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Lee el token del header Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtiene el token quitando 'Bearer '
      token = req.headers.authorization.split(' ')[1];

      // Verifica el token usando el secreto
      const decoded = jwt.verify(token, config.jwtSecret);

      // Busca el usuario asociado al ID del token (excluyendo la contraseña)
      // y lo adjunta al objeto request (req.user)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
          res.status(401);
          throw new Error('Usuario no encontrado, token fallido');
      }

      next(); // Pasa al siguiente middleware o controlador
    } catch (error) {
      console.error('Error de autenticación:', error.message);
      res.status(401); // No autorizado
      // Diferencia entre token expirado y token inválido
      if (error.name === 'TokenExpiredError') {
          throw new Error('Token expirado, por favor inicia sesión de nuevo.');
      }
      throw new Error('No autorizado, token inválido.');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no se encontró token.');
  }
});

// --- NUEVO MIDDLEWARE ---
// Middleware para verificar si el usuario es administrador
const admin = (req, res, next) => {
    // En una app real, añadirías un campo 'isAdmin' al modelo User
    // y comprobarías: if (req.user && req.user.isAdmin)
    if (req.user) { // <-- ¡ESTO ES SOLO UN PLACEHOLDER! Permite a CUALQUIER usuario logueado pasar.
      // ¡IMPORTANTE! Cambia esto para verificar un rol de administrador real:
      // if (req.user && req.user.isAdmin) {
      //    next();
      // } else {
      //    res.status(403); // Forbidden
      //    throw new Error('No autorizado como administrador.');
      // }
       console.warn(`ADVERTENCIA: Ruta accedida sin verificación real de admin por ${req.user.email}`); // Log de advertencia
       next(); // <-- ¡BORRA ESTE next() CUANDO IMPLEMENTES LA VERIFICACIÓN REAL!
    } else {
      res.status(401); // No autorizado (si protect fallara por alguna razón)
      throw new Error('No autorizado.');
    }
  };
  // --- FIN NUEVO MIDDLEWARE ---

export { protect, admin }; // Exporta protect (y admin si lo usas)