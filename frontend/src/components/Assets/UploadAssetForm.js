// src/components/Assets/UploadAssetForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AssetForm.module.css'; // Usar un CSS común para forms
import Input from '../Common/Input';
import Button from '../Common/Button';
import { ASSET_TYPES } from '../../utils/helpers';
import * as assetService from '../../services/assetService';

function UploadAssetForm() {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: ASSET_TYPES[0],
  });
  const [imagenDescriptiva, setImagenDescriptiva] = useState(null);
  const [archivoAsset, setArchivoAsset] = useState(null);
  // --- NUEVO ESTADO PARA IMÁGENES ADICIONALES ---
  const [imagenesAdicionales, setImagenesAdicionales] = useState([]); // Será un array de Files
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleImageChange = (e) => {
    setImagenDescriptiva(e.target.files[0]);
    setError('');
  };

  const handleAssetFileChange = (e) => {
    setArchivoAsset(e.target.files[0]);
    setError('');
  };

  // --- NUEVO HANDLER PARA IMÁGENES ADICIONALES ---
  const handleImagenesAdicionalesChange = (e) => {
    setImagenesAdicionales([...e.target.files]); // Guardar todos los archivos seleccionados
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log("Frontend: [Submit] Iniciando...");

    const data = new FormData();
    data.append('titulo', formData.titulo);
    data.append('descripcion', formData.descripcion);
    data.append('tipo', formData.tipo);

    if (imagenDescriptiva) data.append('imagenDescriptiva', imagenDescriptiva);
    if (archivoAsset) data.append('archivo', archivoAsset);

    // --- AÑADIR IMÁGENES ADICIONALES AL FORMDATA ---
    if (imagenesAdicionales.length > 0) {
      for (let i = 0; i < imagenesAdicionales.length; i++) {
        data.append('imagenesAdicionales', imagenesAdicionales[i]);
      }
      console.log(`Frontend: [Submit] ${imagenesAdicionales.length} imágenes adicionales añadidas a FormData.`);
    }
    // --- FIN AÑADIR IMÁGENES ---

    console.log("Frontend: [Submit] FormData creado. Llamando a assetService...");

    try {
      const uploadedAsset = await assetService.uploadAsset(data);
      console.log("Frontend: [Submit] Respuesta OK recibida:", uploadedAsset);

      if (uploadedAsset && uploadedAsset._id) {
        console.log(`Frontend: [Submit] Respuesta OK y tiene _id. Navegando a /assets/${uploadedAsset._id}`);
        navigate(`/assets/${uploadedAsset._id}`, { state: { message: '¡Asset subido con éxito!' } });
      } else {
        console.error("Frontend: [Submit] Respuesta del backend OK (201) pero falta _id:", uploadedAsset);
        setError("Error inesperado procesando la respuesta del servidor.");
        // setLoading se maneja en finally, pero si hay error y no se navega,
        // podría ser útil quitarlo aquí si el 'finally' no cubre todos los casos.
      }
    } catch (err) {
      console.error("Frontend: [Submit] ERROR en catch:", err);
      console.error("Frontend: [Submit] Error response:", err.response?.data);
      let errorMessage = 'Error al subir el asset. Inténtalo de nuevo.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      console.log("Frontend: [Submit] Ejecutando finally, setLoading(false)");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={`message error ${styles.errorMessage}`}>{error}</p>}

      <Input
        label="Título del asset"
        type="text"
        id="titulo"
        name="titulo"
        value={formData.titulo}
        onChange={handleChange}
        required
        placeholder="Ej: Personaje principal V.2"
        disabled={loading}
      />

      <div className={styles.inputGroup}>
        <label htmlFor="tipo" className={styles.label}>Tipo de asset <span className={styles.required}>*</span></label>
        <select
          id="tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          required
          disabled={loading}
          className={styles.selectInput}
        >
          {ASSET_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="descripcion" className={styles.label}>Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Detalles sobre el asset, uso, notas..."
          disabled={loading}
          rows="5"
          className={styles.textareaInput}
        />
      </div>

      <Input
        label="Imagen descriptiva principal (.jpg, .png, .svg)"
        type="file"
        id="imagenDescriptiva"
        name="imagenDescriptiva"
        onChange={handleImageChange}
        required
        disabled={loading}
        accept="image/jpeg, image/png, image/svg+xml, image/webp" // Añadido webp
      />
      {imagenDescriptiva && <p className={styles.fileName}>Archivo seleccionado: {imagenDescriptiva.name}</p>}

      {/* --- NUEVO INPUT PARA IMÁGENES ADICIONALES --- */}
      <Input
        label={`Imágenes adicionales para carrusel (hasta 10, opcional)`}
        type="file"
        id="imagenesAdicionales"
        name="imagenesAdicionales"
        onChange={handleImagenesAdicionalesChange}
        disabled={loading}
        accept="image/jpeg, image/png, image/svg+xml, image/webp" // Añadido webp
        multiple // Permite selección múltiple
      />
      {imagenesAdicionales.length > 0 && (
        <div className={styles.fileNamePreview}>
          <p>{imagenesAdicionales.length} imágenes adicionales seleccionadas:</p>
          <ul>
            {Array.from(imagenesAdicionales).map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      {/* --- FIN NUEVO INPUT --- */}

      <Input
        label="Archivo del asset (.fbx, .blend, .obj, .mp3, .wav, .mp4, .py, etc.)"
        type="file"
        id="archivoAsset"
        name="archivoAsset"
        onChange={handleAssetFileChange}
        required
        disabled={loading}
      />
      {archivoAsset && <p className={styles.fileName}>Archivo seleccionado: {archivoAsset.name}</p>}

      <Button type="submit" variant="primary" size="large" disabled={loading} className={styles.submitButton}>
        {loading ? 'Subiendo...' : 'Subir asset'}
      </Button>
    </form>
  );
}

export default UploadAssetForm;