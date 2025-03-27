const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Import the User model

// @desc:   Login de usuario
// @route:  POST /api/auth/login
// @access: Público
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Verificar que se envíen email y contraseña
  if (!email || !password) {
    res.status(400);
    throw new Error("Por favor, proporciona un email y una contraseña");
  }

  // Buscar al usuario por email
  const usuario = await User.findOne({ email });
  if (!usuario) {
    res.status(401);
    throw new Error("Credenciales inválidas");
  }

  // Verificar la contraseña
  const esPasswordCorrecto = await bcrypt.compare(password, usuario.password);
  if (!esPasswordCorrecto) {
    res.status(401);
    throw new Error("Credenciales inválidas");
  }

  // Responder con éxito
  res.json({
    mensaje: "Login exitoso",
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
    },
  });
});

// @desc:   Post an user
// @route:  POST /api/users
// @access: Private
const setUser = asyncHandler(async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      res.status(400);
      throw new Error("El usuario ya existe");
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const nuevoUsuario = new User({ nombre, email, password: passwordHash });
    await nuevoUsuario.save();

    res.json({ mensaje: "Usuario registrado correctamente" });
  } catch (error) {
    next(error); // Pasar el error al middleware
  }
});

// @desc:   Get all users
// @route:  GET /api/users
// @access: Private
const getUsers = asyncHandler(async (req, res, next) => {
  try {
    const usuarios = await User.find({}, { password: 0 }); // Excluir contraseñas
    res.json(usuarios);
  } catch (error) {
    next(error); // Pasar el error al middleware
  }
});

// @desc:   Get a user by ID
// @route:  GET /api/users/:id
// @access: Private
const getUser = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Buscar el usuario por su ID
    const usuario = await User.findById(id, { password: 0 }); // Excluir contraseña
    if (!usuario) {
      res.status(404);
      throw new Error("Usuario no encontrado");
    }

    res.json(usuario);
  } catch (error) {
    next(error); // Pasar el error al middleware
  }
});

// @desc:   Update user
// @route:  PUT /api/users/:id
// @access: Private
const updateUser = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    // Buscar el usuario por su ID
    const usuario = await User.findById(id);
    if (!usuario) {
      res.status(404);
      throw new Error("Usuario no encontrado");
    }

    // Verificar si se quiere actualizar la contraseña
    if (password) {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(password, salt);
    }

    // Actualizar los campos del usuario
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;

    await usuario.save();

    res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (error) {
    next(error); // Pasar el error al middleware
  }
});

// @desc:   Delete user
// @route:  DELETE /api/users/:id
// @access: Private
const delUser = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Buscar el usuario por su ID
    const usuario = await User.findById(id);
    if (!usuario) {
      res.status(404);
      throw new Error("Usuario no encontrado");
    }

    // Eliminar usuario
    await usuario.deleteOne();

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    next(error); // Pasar el error al middleware
  }
});

module.exports = { getUsers, setUser, updateUser, delUser, getUser, loginUser };