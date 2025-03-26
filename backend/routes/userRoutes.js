const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {setUser,getUsers,updateUser,delUser,getUser} = require("../controllers/userController");
const router = express.Router();

// Ruta de Registro
router.post("/registro", setUser);

// GET: Obtener todos los usuarios
router.get("/usuarios", getUsers);

router.route("/usuarios/:id").put(updateUser).delete(delUser).get(getUser);


module.exports = router;
