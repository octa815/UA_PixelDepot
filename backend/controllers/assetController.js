// backend/controllers/assetController.js
import asyncHandler from 'express-async-handler';
import Asset from '../models/Asset.js';
// --- AÑADE import de cloudinary ---
import { uploadStream, cloudinary } from '../config/cloudinary.js';
// --- BORRA fs y path si ya no se usan ---
// import path from 'path';
// import fs from 'fs';

const createAsset = asyncHandler(async (req, res) => {
  console.log('--- Inicio Petición POST /api/assets ---');
  console.log('Body recibido:', req.body);
  console.log('Archivos recibidos en memoria:', req.files ? Object.keys(req.files) : 'Ninguno');

  const { titulo, descripcion, tipo } = req.body;
  const imagenFile = req.files?.imagenDescriptiva?.[0];
  const assetFile = req.files?.archivo?.[0];

  if (!titulo || !tipo) { res.status(400); throw new Error('Título y Tipo obligatorios.'); }
  if (!imagenFile) { res.status(400); throw new Error('Falta imagen descriptiva.'); }
  if (!assetFile) { res.status(400); throw new Error('Falta archivo del asset.'); }

  let imagenUrl = '';
  let archivoUrl = '';
  let cloudinaryImagenPublicId = null;
  let cloudinaryArchivoPublicId = null;
  let cloudinaryArchivoResourceType = 'raw';

  try {
        console.log('[Paso 1] Iniciando subida de IMAGEN a Cloudinary...');
        if (imagenFile) {
            const imageOptions = { folder: `molamazo/${tipo}/images`, resource_type: 'image' };
            const imageResult = await uploadStream(imagenFile.buffer, imageOptions);
            imagenUrl = imageResult.secure_url;
            cloudinaryImagenPublicId = imageResult.public_id;
            console.log('[Paso 2] Imagen subida OK:', imagenUrl);
        } else { console.log('[Paso 2] No se subió imagen.'); }

        console.log('[Paso 3] Iniciando subida de ARCHIVO a Cloudinary...');
        if (assetFile) {
            if (assetFile.mimetype.startsWith('image/')) cloudinaryArchivoResourceType = 'image';
            else if (assetFile.mimetype.startsWith('video/')) cloudinaryArchivoResourceType = 'video';
            else if (assetFile.mimetype.startsWith('audio/')) cloudinaryArchivoResourceType = 'video'; // O 'raw'

            const fileOptions = { folder: `molamazo/${tipo}/files`, resource_type: cloudinaryArchivoResourceType };
            const fileResult = await uploadStream(assetFile.buffer, fileOptions);
            archivoUrl = fileResult.secure_url;
            cloudinaryArchivoPublicId = fileResult.public_id;
            console.log('[Paso 4] Archivo subido OK:', archivoUrl);
        } else { console.log('[Paso 4] No se subió archivo principal.'); }

        console.log('[Paso 5] Creando documento del Asset en MongoDB...');
        const asset = new Asset({
          titulo, tipo, descripcion,
          imagenDescriptiva: imagenUrl, // URL Cloudinary
          archivo: archivoUrl,          // URL Cloudinary
          autor: req.user._id,
          // Guarda estos si quieres poder borrar de Cloudinary después
          // cloudinaryImagenPublicId: cloudinaryImagenPublicId,
          // cloudinaryArchivoPublicId: cloudinaryArchivoPublicId,
          // cloudinaryArchivoResourceType: cloudinaryArchivoResourceType,
        });
        const createdAsset = await asset.save();
        console.log('[Paso 6] Asset guardado en MongoDB OK:', createdAsset._id);

        const populatedAsset = await Asset.findById(createdAsset._id).populate('autor', 'nombre email');
        console.log('[Paso 7] Asset populado OK, enviando respuesta 201...');
        res.status(201).json(populatedAsset);

    } catch (error) {
        console.error('!!!! ERROR CAPTURADO en createAsset !!!!:', error);
        // Intenta borrar de Cloudinary si algo ya se subió
        if (cloudinaryImagenPublicId) {
            console.warn(`Intentando borrar imagen ${cloudinaryImagenPublicId} de Cloudinary tras error.`);
            cloudinary.uploader.destroy(cloudinaryImagenPublicId, { resource_type: 'image' }).catch(err => console.error("Error borrando imagen de Cloudinary:", err));
        }
        if (cloudinaryArchivoPublicId) {
            console.warn(`Intentando borrar archivo ${cloudinaryArchivoPublicId} (${cloudinaryArchivoResourceType}) de Cloudinary tras error.`);
            cloudinary.uploader.destroy(cloudinaryArchivoPublicId, { resource_type: cloudinaryArchivoResourceType }).catch(err => console.error("Error borrando archivo de Cloudinary:", err));
        }
        res.status(400).json({ message: error.message || 'Error al crear el asset.' });
    }
});

const getAssets = asyncHandler(async (req, res) => {
  console.log('[Backend GET /api/assets] Petición recibida. Query params:', req.query); // Log inicio y query params

  const pageSize = parseInt(req.query.limit) || 12;
  const page = parseInt(req.query.page) || 1;
  const keyword = req.query.search ? { titulo: { $regex: req.query.search, $options: 'i' } } : {};
  const typeFilter = req.query.type ? { tipo: { $in: Array.isArray(req.query.type) ? req.query.type : [req.query.type] } } : {};
  const filters = { ...keyword, ...typeFilter };
  const sortOptions = {};
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;
  sortOptions[sortBy] = order;

  console.log('[Backend GET /api/assets] Filtros aplicados:', JSON.stringify(filters));
  console.log('[Backend GET /api/assets] Opciones de orden:', JSON.stringify(sortOptions));
  console.log(`[Backend GET /api/assets] Página: ${page}, Límite: ${pageSize}`);

  try {
    console.log('[Backend GET /api/assets] Contando documentos...');
    const count = await Asset.countDocuments(filters); // <-- Posible punto de cuelgue/error
    console.log(`[Backend GET /api/assets] Total de assets encontrados (count): ${count}`);

    console.log('[Backend GET /api/assets] Realizando find()...');
    const assets = await Asset.find(filters)
      .populate('autor', 'nombre email') // <-- Posible punto de cuelgue/error (si hay refs inválidas)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sortOptions); // <-- Posible punto de cuelgue/error
    console.log(`[Backend GET /api/assets] Número de assets obtenidos en esta página: ${assets.length}`);

    console.log('[Backend GET /api/assets] Enviando respuesta 200 OK...');
    res.json({ // Envía respuesta OK
      assets,
      page,
      totalPages: Math.ceil(count / pageSize),
      totalAssets: count,
    });

  } catch (error) {
      // --- Log y respuesta explícita en CATCH ---
      console.error('[Backend GET /api/assets] !!!! ERROR CAPTURADO !!!!:', error);
      res.status(500).json({ message: error.message || 'Error al obtener los assets.' }); // Envía respuesta de error
      // Ya no usamos throw aquí porque enviamos la respuesta JSON
  }
});

// --- getAssetById --- (Usa la versión con logs y try/catch mejorado que te di antes)
const getAssetById = asyncHandler(async (req, res) => {
     const assetId = req.params.id;
     console.log(`[Backend GET /api/assets/:id] Petición recibida para ID: ${assetId}`);
     try {
       console.log(`[Backend GET /api/assets/:id] Buscando en BD...`);
       const asset = await Asset.findById(assetId).populate('autor', 'nombre email');
       console.log(`[Backend GET /api/assets/:id] Resultado de búsqueda: ${asset ? 'Encontrado' : 'NO Encontrado'}`);
       if (asset) {
         console.log(`[Backend GET /api/assets/:id] Enviando respuesta 200 OK...`);
         res.json(asset);
       } else {
         console.log(`[Backend GET /api/assets/:id] Enviando respuesta 404 Not Found...`);
         res.status(404); throw new Error('Asset no encontrado.');
       }
     } catch (error) {
       console.error(`[Backend GET /api/assets/:id] !!!! ERROR CAPTURADO para ID ${assetId} !!!!:`, error);
       if (error.kind === 'ObjectId' || error.name === 'CastError') {
          console.log(`[Backend GET /api/assets/:id] Enviando respuesta 404 por ID inválido...`);
          res.status(404).json({ message: 'Asset no encontrado (ID inválido).' });
       } else {
          console.log(`[Backend GET /api/assets/:id] Enviando respuesta 500 Internal Server Error...`);
          res.status(500).json({ message: error.message || 'Error al obtener el asset.' });
       }
     }
   });


// --- updateAsset --- (Adaptado para subir opcionalmente a Cloudinary)
const updateAsset = asyncHandler(async (req, res) => {
    console.log('Update Body:', req.body);
    console.log('Update Files:', req.files ? Object.keys(req.files) : 'Ninguno');
    const { titulo, descripcion, tipo } = req.body;
    const imagenFile = req.files?.imagenDescriptiva?.[0];
    const assetFile = req.files?.archivo?.[0];

    const asset = await Asset.findById(req.params.id);
    if (!asset) { res.status(404); throw new Error('Asset no encontrado.'); }
    if (asset.autor.toString() !== req.user._id.toString()) { res.status(403); throw new Error('No autorizado.'); }

    let newImageUrl = asset.imagenDescriptiva;
    let newArchivoUrl = asset.archivo;
    // Guarda IDs/Tipos antiguos si los vas a borrar de Cloudinary
    // const oldImagePublicId = asset.cloudinaryImagenPublicId;
    // const oldArchivoPublicId = asset.cloudinaryArchivoPublicId;
    // const oldArchivoResourceType = asset.cloudinaryArchivoResourceType;

    try {
        // Si se subió una NUEVA imagen
        if (imagenFile) {
            const imageOptions = { folder: `molamazo/${tipo || asset.tipo}/images`, resource_type: 'image' };
            const imageResult = await uploadStream(imagenFile.buffer, imageOptions);
            newImageUrl = imageResult.secure_url;
            // asset.cloudinaryImagenPublicId = imageResult.public_id; // Actualiza si guardas ID
            console.log('Nueva imagen subida a Cloudinary:', newImageUrl);
            // Opcional: Borrar imagen antigua de Cloudinary
            // if (oldImagePublicId) { await cloudinary.uploader.destroy(oldImagePublicId); }
        }

        // Si se subió un NUEVO archivo
        if (assetFile) {
            let resourceType = 'raw';
            if (assetFile.mimetype.startsWith('image/')) resourceType = 'image';
            if (assetFile.mimetype.startsWith('video/')) resourceType = 'video';
            if (assetFile.mimetype.startsWith('audio/')) resourceType = 'video';
            const fileOptions = { folder: `molamazo/${tipo || asset.tipo}/files`, resource_type: resourceType };
            const fileResult = await uploadStream(assetFile.buffer, fileOptions);
            newArchivoUrl = fileResult.secure_url;
            // asset.cloudinaryArchivoPublicId = fileResult.public_id; // Actualiza si guardas ID
            // asset.cloudinaryArchivoResourceType = resourceType; // Actualiza si guardas tipo
            console.log('Nuevo archivo subido a Cloudinary:', newArchivoUrl);
            // Opcional: Borrar archivo antiguo de Cloudinary
            // if (oldArchivoPublicId) { await cloudinary.uploader.destroy(oldArchivoPublicId, { resource_type: oldArchivoResourceType }); }
        }

        // Actualizar campos del asset en la BD
        asset.titulo = titulo !== undefined ? titulo : asset.titulo;
        asset.tipo = tipo !== undefined ? tipo : asset.tipo;
        asset.descripcion = descripcion !== undefined ? descripcion : asset.descripcion;
        asset.imagenDescriptiva = newImageUrl;
        asset.archivo = newArchivoUrl;

        const updatedAsset = await asset.save();
        const populatedAsset = await Asset.findById(updatedAsset._id).populate('autor', 'nombre email');
        res.json(populatedAsset);

   } catch (error) {
        console.error("Error en actualización/subida de asset:", error);
        res.status(400); throw new Error(error.message || 'Error al actualizar el asset.');
   }
});

// --- deleteAsset --- (Quitado manejo de archivos locales, opcional añadir borrado Cloudinary)
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) { res.status(404); throw new Error('Asset no encontrado.'); }
  if (asset.autor.toString() !== req.user._id.toString()) { res.status(403); throw new Error('No autorizado.'); }

  // Opcional: Obtener IDs/Tipos de Cloudinary si los guardaste en el modelo
  // const imagePublicId = asset.cloudinaryImagenPublicId;
  // const archivoPublicId = asset.cloudinaryArchivoPublicId;
  // const archivoResourceType = asset.cloudinaryArchivoResourceType || 'raw';

  try {
    await asset.deleteOne(); // Borra de la BD

    // --- Opcional: Borrar de Cloudinary ---
    // Lógica para llamar a cloudinary.uploader.destroy(...) si tienes los IDs
    // --- Fin Opcional ---

    res.json({ message: 'Asset borrado con éxito.' });
  } catch (error) {
    console.error("Error borrando asset:", error);
    res.status(500); throw new Error('Error al borrar el asset.');
  }
});


// --- downloadAssetFile --- (Devuelve mensaje indicando que no aplica)
const downloadAssetFile = asyncHandler(async (req, res) => {
    console.warn(`Intento de descarga vía backend para asset ${req.params.id}. No aplicable con URLs externas.`);
    res.status(404).json({ message: 'Ruta de descarga no disponible. Use el enlace directo del asset.' });
});

export { createAsset, getAssets, getAssetById, updateAsset, deleteAsset, downloadAssetFile };