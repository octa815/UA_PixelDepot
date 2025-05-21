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
  const imagenesAdicionalesFiles = req.files?.imagenesAdicionales; // Array de archivos

  if (!titulo || !tipo) { res.status(400); throw new Error('Título y Tipo obligatorios.'); }
  if (!imagenFile) { res.status(400); throw new Error('Falta imagen descriptiva principal.'); }
  if (!assetFile) { res.status(400); throw new Error('Falta archivo del asset.'); }

  let imagenPrincipalUrl = '';
  let archivoUrl = '';
  let urlsImagenesAdicionales = []; // Array para guardar URLs de imágenes adicionales

  // IDs públicos para posible rollback en Cloudinary
  let cloudinaryImagenPrincipalPublicId = null;
  let cloudinaryArchivoPublicId = null;
  let cloudinaryImagenesAdicionalesPublicIds = [];
  let cloudinaryArchivoResourceType = 'raw';


  try {
    console.log('[Paso 1] Iniciando subida de IMAGEN PRINCIPAL a Cloudinary...');
    const imageOptionsPrincipal = { folder: `molamazo/${tipo}/images/main`, resource_type: 'image' }; // Subcarpeta para principal
    const imageResultPrincipal = await uploadStream(imagenFile.buffer, imageOptionsPrincipal);
    imagenPrincipalUrl = imageResultPrincipal.secure_url;
    cloudinaryImagenPrincipalPublicId = imageResultPrincipal.public_id;
    console.log('[Paso 2] Imagen principal subida OK:', imagenPrincipalUrl);

    // --- INICIO: Subida de Imágenes Adicionales ---
    if (imagenesAdicionalesFiles && imagenesAdicionalesFiles.length > 0) {
      console.log(`[Paso 2.1] Iniciando subida de ${imagenesAdicionalesFiles.length} IMÁGENES ADICIONALES a Cloudinary...`);
      for (const file of imagenesAdicionalesFiles) {
        const imageOptionsAdicional = { folder: `molamazo/${tipo}/images/additional`, resource_type: 'image' }; // Subcarpeta
        const result = await uploadStream(file.buffer, imageOptionsAdicional);
        urlsImagenesAdicionales.push(result.secure_url);
        cloudinaryImagenesAdicionalesPublicIds.push(result.public_id);
        console.log(`[Paso 2.2] Imagen adicional subida OK: ${result.secure_url}`);
      }
    } else {
      console.log('[Paso 2.1] No hay imágenes adicionales para subir.');
    }
    // --- FIN: Subida de Imágenes Adicionales ---

    console.log('[Paso 3] Iniciando subida de ARCHIVO PRINCIPAL a Cloudinary...');
    if (assetFile.mimetype.startsWith('image/')) cloudinaryArchivoResourceType = 'image';
    else if (assetFile.mimetype.startsWith('video/')) cloudinaryArchivoResourceType = 'video';
    else if (assetFile.mimetype.startsWith('audio/')) cloudinaryArchivoResourceType = 'video';

    const fileOptions = { folder: `molamazo/${tipo}/files`, resource_type: cloudinaryArchivoResourceType };
    const fileResult = await uploadStream(assetFile.buffer, fileOptions);
    archivoUrl = fileResult.secure_url;
    cloudinaryArchivoPublicId = fileResult.public_id;
    console.log('[Paso 4] Archivo principal subido OK:', archivoUrl);

    console.log('[Paso 5] Creando documento del Asset en MongoDB...');
    const asset = new Asset({
      titulo,
      tipo,
      descripcion,
      imagenDescriptiva: imagenPrincipalUrl, // URL Cloudinary de la imagen principal
      imagenesAdicionales: urlsImagenesAdicionales, // Array de URLs de Cloudinary
      archivo: archivoUrl, // URL Cloudinary del archivo principal
      autor: req.user._id,
      // Cloudinary IDs para posible gestión futura (ej. al borrar o actualizar)
      // cloudinaryImagenPrincipalPublicId,
      // cloudinaryArchivoPublicId,
      // cloudinaryArchivoResourceType,
      // cloudinaryImagenesAdicionalesPublicIds, // Podrías guardar esto también
    });
    const createdAsset = await asset.save();
    console.log('[Paso 6] Asset guardado en MongoDB OK:', createdAsset._id);

    const populatedAsset = await Asset.findById(createdAsset._id).populate('autor', 'nombre email');
    console.log('[Paso 7] Asset populado OK, enviando respuesta 201...');
    res.status(201).json(populatedAsset);

  } catch (error) {
    console.error('!!!! ERROR CAPTURADO en createAsset !!!!:', error);
    // Intenta borrar de Cloudinary si algo ya se subió
    if (cloudinaryImagenPrincipalPublicId) {
      console.warn(`Intentando borrar imagen principal ${cloudinaryImagenPrincipalPublicId} de Cloudinary tras error.`);
      cloudinary.uploader.destroy(cloudinaryImagenPrincipalPublicId, { resource_type: 'image' }).catch(err => console.error("Error borrando imagen principal de Cloudinary:", err));
    }
    if (cloudinaryImagenesAdicionalesPublicIds.length > 0) {
      console.warn(`Intentando borrar ${cloudinaryImagenesAdicionalesPublicIds.length} imágenes adicionales de Cloudinary tras error.`);
      for (const publicId of cloudinaryImagenesAdicionalesPublicIds) {
        cloudinary.uploader.destroy(publicId, { resource_type: 'image' }).catch(err => console.error(`Error borrando imagen adicional ${publicId} de Cloudinary:`, err));
      }
    }
    if (cloudinaryArchivoPublicId) {
      console.warn(`Intentando borrar archivo ${cloudinaryArchivoPublicId} (${cloudinaryArchivoResourceType}) de Cloudinary tras error.`);
      cloudinary.uploader.destroy(cloudinaryArchivoPublicId, { resource_type: cloudinaryArchivoResourceType }).catch(err => console.error("Error borrando archivo principal de Cloudinary:", err));
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
  console.log('--- Inicio Petición PUT /api/assets/:id ---');
  console.log('ID del Asset:', req.params.id);
  console.log('Body recibido:', req.body);
  console.log('Archivos recibidos en memoria:', req.files ? Object.keys(req.files) : 'Ninguno');

  const { titulo, descripcion, tipo } = req.body;
  const imagenFile = req.files?.imagenDescriptiva?.[0]; // Nueva imagen principal (opcional)
  const assetFile = req.files?.archivo?.[0];           // Nuevo archivo principal (opcional)
  const imagenesAdicionalesFiles = req.files?.imagenesAdicionales; // Nuevas imágenes adicionales (opcional)

  const asset = await Asset.findById(req.params.id);

  if (!asset) {
      res.status(404);
      throw new Error('Asset no encontrado.');
  }
  if (asset.autor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('No autorizado para modificar este asset.');
  }

  // Guardamos URLs/IDs originales para posible borrado en Cloudinary si se reemplazan
  const oldImagenPrincipalUrl = asset.imagenDescriptiva;
  const oldArchivoUrl = asset.archivo;
  // const oldImagenesAdicionalesUrls = [...asset.imagenesAdicionales]; // Copia para referencia

  // Podrías guardar los public_id en el modelo Asset para facilitar el borrado
  // const oldImagenPrincipalPublicId = asset.cloudinaryImagenPrincipalPublicId;
  // const oldArchivoPublicId = asset.cloudinaryArchivoPublicId;
  // const oldArchivoResourceType = asset.cloudinaryArchivoResourceType;
  // const oldImagenesAdicionalesPublicIds = asset.cloudinaryImagenesAdicionalesPublicIds || [];


  try {
      // Actualizar campos de texto
      asset.titulo = titulo !== undefined ? titulo : asset.titulo;
      asset.tipo = tipo !== undefined ? tipo : asset.tipo;
      asset.descripcion = descripcion !== undefined ? descripcion : asset.descripcion;

      // Si se subió una NUEVA imagen principal
      if (imagenFile) {
          console.log('[Update] Subiendo nueva imagen principal...');
          const imageOptionsPrincipal = { folder: `molamazo/${asset.tipo}/images/main`, resource_type: 'image' };
          const imageResultPrincipal = await uploadStream(imagenFile.buffer, imageOptionsPrincipal);
          asset.imagenDescriptiva = imageResultPrincipal.secure_url;
          // asset.cloudinaryImagenPrincipalPublicId = imageResultPrincipal.public_id;
          console.log('[Update] Nueva imagen principal subida:', asset.imagenDescriptiva);
          // Opcional: Borrar la imagen principal antigua de Cloudinary si tienes su public_id
          // if (oldImagenPrincipalPublicId) {
          //   await cloudinary.uploader.destroy(oldImagenPrincipalPublicId, { resource_type: 'image' });
          //   console.log('[Update] Imagen principal antigua borrada de Cloudinary.');
          // }
      }

      // Si se subieron NUEVAS imágenes adicionales
      if (imagenesAdicionalesFiles && imagenesAdicionalesFiles.length > 0) {
          console.log(`[Update] Subiendo ${imagenesAdicionalesFiles.length} nuevas imágenes adicionales...`);
          const nuevasUrlsImagenesAdicionales = [];
          // const nuevosPublicIdsImagenesAdicionales = [];

          // Opcional: Borrar TODAS las imágenes adicionales antiguas de Cloudinary si vas a reemplazar el array completo
          // Si guardaste los public_ids:
          // if (oldImagenesAdicionalesPublicIds.length > 0) {
          //    console.log('[Update] Borrando imágenes adicionales antiguas de Cloudinary...');
          //    for (const publicId of oldImagenesAdicionalesPublicIds) {
          //        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
          //    }
          //    asset.cloudinaryImagenesAdicionalesPublicIds = []; // Limpiar array de IDs
          // }

          for (const file of imagenesAdicionalesFiles) {
              const imageOptionsAdicional = { folder: `molamazo/${asset.tipo}/images/additional`, resource_type: 'image' };
              const result = await uploadStream(file.buffer, imageOptionsAdicional);
              nuevasUrlsImagenesAdicionales.push(result.secure_url);
              // nuevosPublicIdsImagenesAdicionales.push(result.public_id);
              console.log(`[Update] Imagen adicional subida: ${result.secure_url}`);
          }
          asset.imagenesAdicionales = nuevasUrlsImagenesAdicionales; // Reemplaza el array con las nuevas
          // asset.cloudinaryImagenesAdicionalesPublicIds = nuevosPublicIdsImagenesAdicionales;
      }
      // Si no se envían imagenesAdicionalesFiles, el array asset.imagenesAdicionales no se modifica.
      // Si quieres permitir borrar imágenes específicas del array sin subir nuevas, necesitarías
      // una lógica diferente (ej. recibir un array de URLs a mantener, o IDs a borrar).

      // Si se subió un NUEVO archivo principal
      if (assetFile) {
          console.log('[Update] Subiendo nuevo archivo principal...');
          let resourceType = 'raw';
          if (assetFile.mimetype.startsWith('image/')) resourceType = 'image';
          else if (assetFile.mimetype.startsWith('video/')) resourceType = 'video';
          else if (assetFile.mimetype.startsWith('audio/')) resourceType = 'video';

          const fileOptions = { folder: `molamazo/${asset.tipo}/files`, resource_type: resourceType };
          const fileResult = await uploadStream(assetFile.buffer, fileOptions);
          asset.archivo = fileResult.secure_url;
          // asset.cloudinaryArchivoPublicId = fileResult.public_id;
          // asset.cloudinaryArchivoResourceType = resourceType;
          console.log('[Update] Nuevo archivo principal subido:', asset.archivo);
          // Opcional: Borrar el archivo principal antiguo de Cloudinary
          // if (oldArchivoPublicId) {
          //    await cloudinary.uploader.destroy(oldArchivoPublicId, { resource_type: oldArchivoResourceType });
          //    console.log('[Update] Archivo principal antiguo borrado de Cloudinary.');
          // }
      }

      const updatedAsset = await asset.save();
      console.log('[Update] Asset actualizado en MongoDB OK:', updatedAsset._id);
      const populatedAsset = await Asset.findById(updatedAsset._id).populate('autor', 'nombre email');
      console.log('[Update] Asset populado OK, enviando respuesta 200...');
      res.json(populatedAsset);

  } catch (error) {
      console.error('!!!! ERROR CAPTURADO en updateAsset !!!!:', error);
      // Aquí no intentamos hacer rollback de Cloudinary en update porque es más complejo
      // determinar qué se subió en esta petición vs lo que ya existía.
      // Se podría mejorar con una gestión de transacciones o marcando los archivos subidos
      // en esta operación específica.
      res.status(400).json({ message: error.message || 'Error al actualizar el asset.' });
  }
});

// --- deleteAsset --- (Quitado manejo de archivos locales, opcional añadir borrado Cloudinary)
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset no encontrado.');
  }

  // Verifica si el usuario autenticado es el autor del asset
  if (asset.autor.toString() !== req.user._id.toString()) {
    res.status(403); // Forbidden
    throw new Error('No autorizado para eliminar este asset.');
  }

  try {
    // --- Lógica para extraer public_ids de las URLs de Cloudinary (EJEMPLO, AJUSTAR A TU CASO) ---
    // Esto es una suposición de cómo podrían ser tus URLs y cómo extraer el ID.
    // Idealmente, guarda los public_id en el modelo Asset al subir.

    const getPublicIdFromUrl = (url, resourceType = 'image') => {
        if (!url || !url.includes('cloudinary.com')) return null;
        try {
            const parts = url.split('/');
            // Ejemplo: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/public_id.jpg
            // El public_id suele ser la última parte antes de la extensión, posiblemente con carpetas.
            // Esto es muy dependiente de tu estructura de Cloudinary.
            // Por ejemplo, si tus carpetas son `molamazo/${tipo}/images/main`
            // y el public_id es lo que sigue después, por ejemplo: `molamazo/2D/images/main/mi_imagen`
            let publicIdWithFolder = parts.slice(parts.indexOf(resource_type) + 2).join('/');
            if (publicIdWithFolder.includes('.')) {
                 publicIdWithFolder = publicIdWithFolder.substring(0, publicIdWithFolder.lastIndexOf('.'));
            }
            return publicIdWithFolder || null;
        } catch (e) {
            console.error("Error extrayendo public_id de URL:", url, e);
            return null;
        }
    };

    // Borrado de imagen principal
    if (asset.imagenDescriptiva) {
      const publicId = getPublicIdFromUrl(asset.imagenDescriptiva, 'image');
      if (publicId) {
        console.log(`Intentando borrar imagen principal de Cloudinary: ${publicId}`);
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
          .catch(err => console.error('Error borrando imagen principal de Cloudinary:', err));
      }
    }

    // Borrado de imágenes adicionales
    if (asset.imagenesAdicionales && asset.imagenesAdicionales.length > 0) {
      for (const imageUrl of asset.imagenesAdicionales) {
        const publicId = getPublicIdFromUrl(imageUrl, 'image');
        if (publicId) {
          console.log(`Intentando borrar imagen adicional de Cloudinary: ${publicId}`);
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
            .catch(err => console.error(`Error borrando imagen adicional ${publicId} de Cloudinary:`, err));
        }
      }
    }

    // Borrado de archivo principal
    if (asset.archivo) {
      // Determinar resource_type es más complejo sin guardarlo. Asumimos 'raw' como default.
      // Si guardaste el tipo al subir, úsalo.
      let resourceType = 'raw'; // O asset.cloudinaryArchivoResourceType si lo tenías
      if (asset.archivo.match(/\.(jpeg|jpg|png|gif|webp)$/i)) resourceType = 'image';
      else if (asset.archivo.match(/\.(mp4|mov|avi|mkv)$/i)) resourceType = 'video';
      else if (asset.archivo.match(/\.(mp3|wav|ogg)$/i)) resourceType = 'video'; // audio se trata como video en destroy

      const publicId = getPublicIdFromUrl(asset.archivo, resourceType);
      if (publicId) {
        console.log(`Intentando borrar archivo principal de Cloudinary: ${publicId} (tipo: ${resourceType})`);
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
          .catch(err => console.error(`Error borrando archivo principal ${publicId} de Cloudinary:`, err));
      }
    }
    // --- FIN LÓGICA CLOUDINARY ---

    await asset.deleteOne(); // Borra de la BD

    res.json({ message: 'Asset borrado con éxito.' });
  } catch (error) {
    console.error("Error borrando asset:", error);
    res.status(500).json({ message: 'Error al borrar el asset.' }); // Devuelve JSON en error
  }
});

// --- downloadAssetFile --- (Devuelve mensaje indicando que no aplica)
const downloadAssetFile = asyncHandler(async (req, res) => {
    console.warn(`Intento de descarga vía backend para asset ${req.params.id}. No aplicable con URLs externas.`);
    res.status(404).json({ message: 'Ruta de descarga no disponible. Use el enlace directo del asset.' });
});

const likeAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset no encontrado');
  }

  const userId = req.user._id;

  // Comprueba si el usuario ya dio like
  const alreadyLikedIndex = asset.likes.findIndex(like => like.toString() === userId.toString());

  if (alreadyLikedIndex > -1) {
    // Si ya dio like, quitar el like
    asset.likes.splice(alreadyLikedIndex, 1);
  } else {
    // Si no dio like, añadirlo
    asset.likes.push(userId);
    // Y si había dado dislike, quitar el dislike
    const alreadyDislikedIndex = asset.dislikes.findIndex(dislike => dislike.toString() === userId.toString());
    if (alreadyDislikedIndex > -1) {
      asset.dislikes.splice(alreadyDislikedIndex, 1);
    }
  }

  const updatedAsset = await asset.save();
  // Devolver el asset actualizado con la información de likes/dislikes y autor populado
  const populatedAsset = await Asset.findById(updatedAsset._id).populate('autor', 'nombre email');
  res.json(populatedAsset);
});

// @desc    Dar dislike/quitar dislike a un asset
// @route   PUT /api/assets/:id/dislike
// @access  Private
const dislikeAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset no encontrado');
  }

  const userId = req.user._id;

  // Comprueba si el usuario ya dio dislike
  const alreadyDislikedIndex = asset.dislikes.findIndex(dislike => dislike.toString() === userId.toString());

  if (alreadyDislikedIndex > -1) {
    // Si ya dio dislike, quitar el dislike
    asset.dislikes.splice(alreadyDislikedIndex, 1);
  } else {
    // Si no dio dislike, añadirlo
    asset.dislikes.push(userId);
    // Y si había dado like, quitar el like
    const alreadyLikedIndex = asset.likes.findIndex(like => like.toString() === userId.toString());
    if (alreadyLikedIndex > -1) {
      asset.likes.splice(alreadyLikedIndex, 1);
    }
  }

  const updatedAsset = await asset.save();
  // Devolver el asset actualizado con la información de likes/dislikes y autor populado
  const populatedAsset = await Asset.findById(updatedAsset._id).populate('autor', 'nombre email');
  res.json(populatedAsset);
});

export { createAsset, getAssets, getAssetById, updateAsset, deleteAsset, downloadAssetFile, likeAsset, dislikeAsset };