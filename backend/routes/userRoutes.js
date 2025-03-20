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
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

module.exports = router;
