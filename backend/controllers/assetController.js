// backend/controllers/assetController.js
import asyncHandler from 'express-async-handler';
import Asset from '../models/Asset.js';
import User from '../models/User.js'; // Para popular autor
import path from 'path';
import fs from 'fs'; // File system para borrar archivos

// @desc    Crear (subir) un nuevo asset
// @route   POST /api/assets
// @access  Private
const createAsset = asyncHandler(async (req, res) => {
    console.log('Archivos recibidos por multer:', req.files);
  // Los archivos están en req.files gracias a upload.fields en uploadMiddleware
  const { titulo, descripcion, tipo } = req.body;
  const imagenFile = req.files?.imagenDescriptiva?.[0];
  const assetFile = req.files?.archivo?.[0];

  // Validaciones
  if (!titulo || !tipo) {
      res.status(400);
      throw new Error('Título y Tipo son obligatorios.');
  }
   if (!imagenFile) {
      res.status(400);
      throw new Error('Falta la imagen descriptiva.');
  }
  if (!assetFile) {
      res.status(400);
      throw new Error('Falta el archivo del asset.');
  }


  try {
        // Crear el asset en la BD, guardando las rutas relativas
        const asset = new Asset({
          titulo,
          tipo,
          descripcion,
          // Guarda la ruta relativa desde la raíz del servidor o una base común
          imagenDescriptiva: `uploads/images/${imagenFile.filename}`,
          archivo: `uploads/assets/${assetFile.filename}`,
          autor: req.user._id, // ID del usuario logueado (viene de 'protect' middleware)
        });

        const createdAsset = await asset.save();

        // Populamos el autor antes de enviarlo de vuelta
        const populatedAsset = await Asset.findById(createdAsset._id).populate('autor', 'nombre email');

        res.status(201).json(populatedAsset);

    } catch (error) {
         // Si hay un error al guardar en BD, borramos los archivos subidos para no dejar basura
        if (imagenFile) fs.unlink(imagenFile.path, (err) => { if(err) console.error("Error borrando imagen tras fallo:", err)});
        if (assetFile) fs.unlink(assetFile.path, (err) => { if(err) console.error("Error borrando archivo tras fallo:", err)});

        res.status(400); // Bad request (probablemente error de validación)
        throw new Error(error.message || 'Error al crear el asset.');
    }
});

// @desc    Obtener todos los assets (con filtros, paginación, ordenación)
// @route   GET /api/assets
// @access  Public (o Private si solo usuarios logueados pueden verlos)
const getAssets = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 12; // Assets por página
  const page = parseInt(req.query.page) || 1; // Página actual

  // Filtros
  const keyword = req.query.search
    ? {
        // Búsqueda por título (insensible a mayúsculas/minúsculas)
        titulo: {
          $regex: req.query.search,
          $options: 'i',
        },
      }
    : {};

   const typeFilter = req.query.type
    ? {
        // Filtrar por tipo(s). req.query.type puede ser string o array si se pasa múltiple
        tipo: { $in: Array.isArray(req.query.type) ? req.query.type : [req.query.type] }
      }
    : {};

    // Combinar filtros
    const filters = { ...keyword, ...typeFilter };


  // Ordenación
  const sortOptions = {};
  const sortBy = req.query.sortBy || 'createdAt'; // Campo por defecto
  const order = req.query.order === 'asc' ? 1 : -1; // Orden por defecto descendente
  sortOptions[sortBy] = order;


  try {
    const count = await Asset.countDocuments(filters); // Contar total de documentos que coinciden con filtros
    const assets = await Asset.find(filters)
      .populate('autor', 'nombre email') // Obtener nombre y email del autor
      .limit(pageSize)
      .skip(pageSize * (page - 1)) // Saltar documentos de páginas anteriores
      .sort(sortOptions); // Aplicar ordenación

    res.json({
      assets,
      page,
      totalPages: Math.ceil(count / pageSize), // Calcular total de páginas
      totalAssets: count, // Opcional: devolver el número total
    });
  } catch (error) {
      res.status(500);
      throw new Error('Error al obtener los assets.');
  }
});

// @desc    Obtener un asset por ID
// @route   GET /api/assets/:id
// @access  Public (o Private)
const getAssetById = asyncHandler(async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('autor', 'nombre email');

    if (asset) {
      res.json(asset);
    } else {
      res.status(404);
      throw new Error('Asset no encontrado.');
    }
  } catch (error) {
      if (error.kind === 'ObjectId') {
          res.status(404);
          throw new Error('Asset no encontrado (ID inválido).');
      }
      res.status(500);
      throw new Error('Error al obtener el asset.');
  }
});

// @desc    Actualizar un asset
// @route   PUT /api/assets/:id
// @access  Private
const updateAsset = asyncHandler(async (req, res) => {
   const { titulo, descripcion, tipo } = req.body;
   const imagenFile = req.files?.imagenDescriptiva?.[0];
   const assetFile = req.files?.archivo?.[0];

  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset no encontrado.');
  }

  // Verificar si el usuario logueado es el autor del asset
  if (asset.autor.toString() !== req.user._id.toString()) {
    res.status(403); // Forbidden
    throw new Error('No tienes permiso para editar este asset.');
  }

  // --- SIMPLIFICAR RUTAS ANTIGUAS ---
  const oldImagePath = asset.imagenDescriptiva ? path.join(path.resolve(), asset.imagenDescriptiva) : null; // Quitamos 'backend'
  const oldAssetPath = asset.archivo ? path.join(path.resolve(), asset.archivo) : null; // Quitamos 'backend'
  // --- FIN SIMPLIFICAR ---

  // Actualizar campos
  asset.titulo = titulo || asset.titulo;
  asset.tipo = tipo || asset.tipo;
  asset.descripcion = descripcion !== undefined ? descripcion : asset.descripcion; // Permite borrar descripción

  let imageUpdated = false;
  let assetFileUpdated = false;

  if (imagenFile) {
      asset.imagenDescriptiva = `uploads/images/${imagenFile.filename}`;
      imageUpdated = true;
  }
  if (assetFile) {
      asset.archivo = `uploads/assets/${assetFile.filename}`;
      assetFileUpdated = true;
  }

  try {
        const updatedAsset = await asset.save();

        // Si se guardó correctamente, borrar archivos antiguos si fueron reemplazados
        if (imageUpdated && oldImagePath && fs.existsSync(oldImagePath)) {
            fs.unlink(oldImagePath, (err) => { if(err) console.error("Error borrando imagen antigua:", err)});
        }
         if (assetFileUpdated && oldAssetPath && fs.existsSync(oldAssetPath)) {
            fs.unlink(oldAssetPath, (err) => { if(err) console.error("Error borrando archivo antiguo:", err)});
        }


        const populatedAsset = await Asset.findById(updatedAsset._id).populate('autor', 'nombre email');
        res.json(populatedAsset);

   } catch (error) {
         // Si hay un error al guardar, borrar los NUEVOS archivos subidos si los hubo
        if (imageUpdated && imagenFile) fs.unlink(imagenFile.path, (err) => { if(err) console.error("Error borrando nueva imagen tras fallo:", err)});
        if (assetFileUpdated && assetFile) fs.unlink(assetFile.path, (err) => { if(err) console.error("Error borrando nuevo archivo tras fallo:", err)});

        res.status(400); // Bad request
        throw new Error(error.message || 'Error al actualizar el asset.');
   }
});

// @desc    Borrar un asset
// @route   DELETE /api/assets/:id
// @access  Private
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset no encontrado.');
  }

  // Verificar propiedad
  if (asset.autor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('No tienes permiso para borrar este asset.');
  }

   // --- SIMPLIFICAR RUTAS A BORRAR ---
   const imagePath = asset.imagenDescriptiva ? path.join(path.resolve(), asset.imagenDescriptiva) : null; // Quitamos 'backend'
   const assetPath = asset.archivo ? path.join(path.resolve(), asset.archivo) : null; // Quitamos 'backend'
   // --- FIN SIMPLIFICAR ---

  try {
    // Primero intenta borrar el registro de la BD
    await asset.deleteOne(); // Usar deleteOne() en Mongoose 6+

    // Si se borró de la BD, borra los archivos físicos
    if (imagePath && fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => { if(err) console.error("Error borrando imagen:", err)});
    }
    if (assetPath && fs.existsSync(assetPath)) {
        fs.unlink(assetPath, (err) => { if(err) console.error("Error borrando archivo:", err)});
    }

    res.json({ message: 'Asset borrado con éxito.' });

  } catch (error) {
    res.status(500);
    throw new Error('Error al borrar el asset.');
  }
});


// @desc    Descargar el archivo principal de un asset
// @route   GET /api/assets/:id/download
// @access  Private (o Public si cualquiera puede descargar, pero el PDF indica que no)
const downloadAssetFile = asyncHandler(async (req, res) => {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
        res.status(404);
        throw new Error('Asset no encontrado.');
    }

     // El archivo principal se guarda en la propiedad 'archivo'
    if (!asset.archivo) {
        res.status(404);
        throw new Error('El archivo principal para este asset no está disponible.');
    }

    // Construye la ruta completa al archivo en el servidor
    const filePath = path.join(path.resolve(), 'backend', asset.archivo);

    // Verifica si el archivo existe
    if (fs.existsSync(filePath)) {
        // Opcional: Incrementar contador de descargas
        // asset.downloadCount = (asset.downloadCount || 0) + 1;
        // await asset.save();

        // Envía el archivo para descarga
        // res.download() establece automáticamente cabeceras como Content-Disposition
        res.download(filePath, (err) => {
            if (err) {
                console.error("Error al enviar archivo para descarga:", err);
                // Evita enviar respuesta si ya se envió parte del archivo
                if (!res.headersSent) {
                    res.status(500).send('No se pudo descargar el archivo.');
                }
            }
        });
    } else {
        console.error(`Archivo no encontrado en el servidor: ${filePath}`);
        res.status(404);
        throw new Error('Archivo del asset no encontrado en el servidor.');
    }
});


export {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  downloadAssetFile,
};