// @desc:   Post an user
// @route:  POST /api/users
// @access: Private
const setUser = async (req, res) => {
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
};

// @desc:   Get all users
// @route:  GET /api/users
// @access: Private
const getUser = async (req, res) => {
  try {
    const usuarios = await User.find({}, { password: 0 }); // Excluir contraseñas
    res.json(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
}

// @desc:   update user
// @route:  PUT /api/users/:id
// @access: Private
const updateUser = async (req, res) => {
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
}

// @desc:   delete user
// @route:  DELETE /api/users/:id
// @access: Private
const delUser = async (req, res) => {
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
}
  

module.exports = { getUsers,setUser,updateUser,delUser };   // Exportar funciones de controlador