// backend/models/Asset.js
import mongoose from 'mongoose';

// Tipos de assets permitidos según el PDF
const ASSET_TYPES = ['2D', '3D', 'Audio', 'Video', 'Código', 'Otros'];

const assetSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio.'],
      trim: true,
    },
    tipo: {
      type: String,
      required: [true, 'El tipo de asset es obligatorio.'],
      enum: {
          values: ASSET_TYPES,
          message: 'El tipo de asset "{VALUE}" no es válido.'
      }
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    imagenDescriptiva: { // Guardará la RUTA al archivo de imagen en el servidor
      type: String,
      required: [true, 'La imagen descriptiva es obligatoria.'],
    },
    // --- NUEVO CAMPO PARA IMÁGENES ADICIONALES DEL CARRUSEL ---
    imagenesAdicionales: [{ // Array de URLs de Cloudinary
      type: String,
    }],
    archivo: { // Guardará la RUTA al archivo principal del asset
      type: String,
      required: [true, 'El archivo del asset es obligatorio.'],
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Referencia al modelo User
    },
    // --- NUEVOS CAMPOS PARA LIKES/DISLIKES ---
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Referencia a usuarios que dieron like
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Referencia a usuarios que dieron dislike
    }],
    fechaSubida: { // Gestionado por timestamps, pero podemos mantenerlo si se quiere explícito
        type: Date,
        default: Date.now,
    },
    // Campos opcionales mencionados en el PDF/frontend
    // downloadCount: {
    //     type: Number,
    //     default: 0,
    // },
    // likes: [{ // Array de usuarios que han dado like
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }]
  },
  {
    timestamps: true, // Añade createdAt y updatedAt
  }
);

// Índice para buscar por título o descripción (opcional pero mejora rendimiento)
// assetSchema.index({ titulo: 'text', descripcion: 'text' });

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;