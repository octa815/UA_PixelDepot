// backend/controllers/authController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js'; // Necesitamos crear este util

// @desc    Registrar un nuevo usuario e iniciar sesión
// @route   POST /api/registro
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { nombre, email, password } = req.body;
  
    if (!nombre || !email || !password) {
      res.status(400);
      throw new Error('Por favor, proporciona nombre, email y contraseña.');
    }
  
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('El usuario con este email ya existe.');
    }
  
    const user = await User.create({
      nombre,
      email,
      password,
    });
  
    if (user) {
      // ¡CAMBIO AQUÍ! Generamos token y devolvemos datos como en el login
      const token = generateToken(user._id);
      res.status(201).json({
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        token: token, // Devolvemos el token
        // message: 'Usuario registrado con éxito.' // Mensaje opcional
      });
    } else {
      res.status(400);
      throw new Error('Datos de usuario inválidos.');
    }
  });

// @desc    Autenticar (login) usuario y obtener token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Por favor, proporciona email y contraseña.');
  }

  // Buscar usuario por email
  const user = await User.findOne({ email });

  // Verificar si el usuario existe y la contraseña coincide
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      token: token, // Devuelve el token al frontend
      message: 'Inicio de sesión exitoso.', // Mensaje opcional
    });
  } else {
    res.status(401); // No autorizado
    throw new Error('Email o contraseña incorrectos.');
  }
});

export { registerUser, loginUser };