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
    tipo: ASSET_TYPES[0], // Valor inicial por defecto
  });
  const [imagenDescriptiva, setImagenDescriptiva] = useState(null); // Para el archivo de imagen
  const [archivoAsset, setArchivoAsset] = useState(null); // Para el archivo del asset
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.titulo || !formData.tipo || !imagenDescriptiva || !archivoAsset) {
      setError('Todos los campos (Título, Tipo, Imagen y Archivo del Asset) son obligatorios.');
      return;
    }

    setLoading(true);

    // Crear objeto FormData para enviar archivos
    const data = new FormData();
    data.append('titulo', formData.titulo);
    data.append('descripcion', formData.descripcion);
    data.append('tipo', formData.tipo);
    data.append('imagenDescriptiva', imagenDescriptiva); // El archivo de imagen
    data.append('archivo', archivoAsset); // El archivo del asset

    try {
      const uploadedAsset = await assetService.uploadAsset(data);
      // Redirige a la página del asset recién creado
      navigate(`/assets/${uploadedAsset._id}`, { state: { message: '¡Asset subido con éxito!' } });
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || err.error || 'Error al subir el asset. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={`message error ${styles.errorMessage}`}>{error}</p>}

      <Input
        label="Título del Asset"
        type="text"
        id="titulo"
        name="titulo"
        value={formData.titulo}
        onChange={handleChange}
        required
        placeholder="Ej: Personaje principal V.2"
        disabled={loading}
      />

      <div className={styles.inputGroup}> {/* Envuelve label y select */}
        <label htmlFor="tipo" className={styles.label}>Tipo de asset <span className={styles.required}>*</span></label>
        <select
          id="tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          required
          disabled={loading}
          className={styles.selectInput} // Reutiliza estilo de input o crea uno específico
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
          className={styles.textareaInput} // Reutiliza estilo de input o crea uno específico
        />
      </div>

      <Input
        label="Imagen Descriptiva (.jpg, .png, .svg)"
        type="file"
        id="imagenDescriptiva"
        name="imagenDescriptiva"
        onChange={handleImageChange}
        required
        disabled={loading}
        accept="image/jpeg, image/png, image/svg+xml" // Limita tipos de archivo
      />
       {imagenDescriptiva && <p className={styles.fileName}>Archivo seleccionado: {imagenDescriptiva.name}</p>}


      <Input
        label="Archivo del Asset (.fbx, .blend, .obj, .mp3, .wav, .mp4, .py, etc.)"
        type="file"
        id="archivoAsset"
        name="archivoAsset"
        onChange={handleAssetFileChange}
        required
        disabled={loading}
        // Puedes añadir 'accept' si quieres limitar, pero es complejo cubrir todos los tipos
      />
        {archivoAsset && <p className={styles.fileName}>Archivo seleccionado: {archivoAsset.name}</p>}


      <Button type="submit" variant="primary" size="large" disabled={loading} className={styles.submitButton}>
        {loading ? 'Subiendo...' : 'Subir Asset'}
      </Button>
    </form>
  );
}

export default UploadAssetForm;