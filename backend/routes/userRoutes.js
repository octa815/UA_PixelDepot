const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Ruta de Registro
router.post("/registro", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) return res.status(400).json({ mensaje: "El usuario ya existe" });

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const nuevoUsuario = new User({ nombre, email, password: passwordHash });
    await nuevoUsuario.save();

    res.json({ mensaje: "Usuario registrado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// GET: Obtener todos los usuarios
router.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await User.find({}, { password: 0 }); // Excluir contraseñas
    res.json(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
});

// PUT: Actualizar usuario
router.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    // Buscar el usuario por su ID
    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

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
    console.log(error);
    res.status(500).json({ mensaje: "Error al actualizar el usuario" });
  }
});

// DELETE: Eliminar usuario
router.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el usuario por su ID
    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    // Eliminar usuario
    await usuario.remove();

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al eliminar el usuario" });
  }
});


module.exports = router;
