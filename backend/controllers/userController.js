// backend/controllers/userController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Asset from '../models/Asset.js'; // Para obtener los assets del usuario

// @desc    Obtener perfil del usuario logueado
// @route   GET /api/users/me
// @access  Private (requiere token)
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user es establecido por el middleware 'protect'
  const user = req.user;
  if (user) {
    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      // No enviamos la contraseña
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado.');
  }
});

// @desc    Actualizar perfil del usuario logueado
// @route   PUT /api/users/me
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.nombre = req.body.nombre || user.nombre;

    // Solo actualiza el email si se proporciona y es diferente
    if (req.body.email && req.body.email !== user.email) {
        // Verifica si el nuevo email ya está en uso por otro usuario
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
            res.status(400);
            throw new Error('El nuevo email ya está registrado por otro usuario.');
        }
        user.email = req.body.email;
    }


    // Opcional: Actualizar contraseña si se proporciona
    if (req.body.password) {
       // Aquí necesitarías validaciones adicionales: contraseña actual, complejidad, etc.
       // Por simplicidad, asumiremos que si viene 'password', se actualiza.
       // ¡ASEGÚRATE DE VALIDAR CORRECTAMENTE EN UN CASO REAL!
      //   if (req.body.password.length < 8) {
      //       res.status(400);
      //       throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
      //   }
       user.password = req.body.password; // El hash se hará automáticamente en pre-save
    }

    try {
        const updatedUser = await user.save();
        res.json({
          _id: updatedUser._id,
          nombre: updatedUser.nombre,
          email: updatedUser.email,
          // No devolvemos el token aquí, solo al hacer login
        });
    } catch (error) {
         // Captura errores de validación o duplicados al guardar
         res.status(400); // Bad Request
         throw new Error(error.message || 'Error al actualizar el perfil.');
    }

  } else {
    res.status(404);
    throw new Error('Usuario no encontrado.');
  }
});

// @desc    Obtener los assets subidos por el usuario logueado
// @route   GET /api/users/me/assets
// @access  Private
const getMyAssets = asyncHandler(async (req, res) => {
    // TODO: Añadir paginación/filtrado si es necesario para esta ruta también
    const assets = await Asset.find({ autor: req.user._id })
                                .sort({ createdAt: -1 }) // Ordenar por más reciente por defecto
                                .populate('autor', 'nombre email'); // Opcional: traer datos del autor

    res.json({ assets }); // Devuelve un objeto con la clave 'assets' como espera el frontend
});

// @desc    Obtener todos los usuarios (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  // Aquí deberías tener el middleware 'admin' ejecutado antes
  const users = await User.find({}).select('-password'); // Excluye contraseñas
  res.json(users);
});

// @desc    Eliminar un usuario (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  // Aquí deberías tener el middleware 'admin' ejecutado antes
  const user = await User.findById(req.params.id);

  if (user) {
    // Opcional: Evitar que un admin se borre a sí mismo
    if (req.user._id.toString() === user._id.toString()) {
        res.status(400);
        throw new Error('No puedes eliminar tu propia cuenta de administrador.');
    }

    // Opcional: ¿Qué hacer con los assets del usuario? ¿Borrarlos? ¿Reasignarlos?
    // Por ahora, solo borramos el usuario.
    // await Asset.deleteMany({ autor: user._id }); // ¡CUIDADO! Esto borraría todos sus assets.

    await user.deleteOne();
    res.json({ message: 'Usuario eliminado con éxito.' });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado.');
  }
});

export { getUserProfile, updateUserProfile, getMyAssets, getUsers, deleteUser};