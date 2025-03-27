const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  fotoPrincipal: { type: String, required: true }, // URL de la imagen
  archivoAssetPrincipal: { type: String, required: true }, // URL del archivo principal
  etiquetas: { type: [String], default: [] }, // Lista de etiquetas
  subassets: { type: [String], default: [] } // Lista de archivos subassets (URLs o rutas)
});

module.exports = mongoose.model("Asset", AssetSchema);