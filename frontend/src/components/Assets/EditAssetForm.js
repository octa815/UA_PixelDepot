// src/components/Assets/EditAssetForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AssetForm.module.css';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { ASSET_TYPES } from '../../utils/helpers';
import * as assetService from '../../services/assetService';

// Recibe el asset a editar como prop
function EditAssetForm({ assetToEdit }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: ASSET_TYPES[0],
  });
  const [imagenDescriptiva, setImagenDescriptiva] = useState(null); // Nuevo archivo de imagen opcional
  const [archivoAsset, setArchivoAsset] = useState(null); // Nuevo archivo de asset opcional
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar datos iniciales del asset cuando el componente se monta o assetToEdit cambia
  useEffect(() => {
    if (assetToEdit) {
      setFormData({
        titulo: assetToEdit.titulo || '',
        descripcion: assetToEdit.descripcion || '',
        tipo: assetToEdit.tipo || ASSET_TYPES[0],
      });
      // No precargamos los archivos, el usuario debe seleccionarlos si quiere cambiarlos
       setImagenDescriptiva(null);
       setArchivoAsset(null);
    }
  }, [assetToEdit]);

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

    if (!formData.titulo || !formData.tipo) {
      setError('El título y el tipo son obligatorios.');
      return;
    }

    setLoading(true);

    // Crear objeto FormData SOLO si hay archivos nuevos, o enviar JSON si no los hay
    // O siempre enviar FormData y que el backend ignore campos vacíos/null
    const data = new FormData();
    data.append('titulo', formData.titulo);
    data.append('descripcion', formData.descripcion);
    data.append('tipo', formData.tipo);
    if (imagenDescriptiva) {
      data.append('imagenDescriptiva', imagenDescriptiva);
    }
    if (archivoAsset) {
      data.append('archivo', archivoAsset);
    }

    // Si no hay archivos nuevos, podrías enviar JSON:
    // const dataToSend = { ...formData };
    // let useFormData = imagenDescriptiva || archivoAsset;

    try {
        // Usa assetService.updateAsset, pasando el ID
      const updatedAsset = await assetService.updateAsset(assetToEdit._id, data); // O dataToSend si es JSON
      navigate(`/assets/${updatedAsset._id}`, { state: { message: '¡Asset actualizado con éxito!' } });
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || err.error || 'Error al actualizar el asset. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!assetToEdit) {
      return <p>Cargando datos del asset...</p> // O un spinner
  }

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
        <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required disabled={loading} className={styles.selectInput}>
          {ASSET_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="descripcion" className={styles.label}>Descripción</label>
        <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Detalles sobre el asset..." disabled={loading} rows="5" className={styles.textareaInput} />
      </div>

      <Input
        label="Nueva imagen descriptiva (Opcional)"
        type="file"
        id="imagenDescriptiva"
        name="imagenDescriptiva"
        onChange={handleImageChange}
        disabled={loading}
        accept="image/jpeg, image/png, image/svg+xml"
      />
       {/* Muestra imagen actual o nombre del nuevo archivo */}
       {imagenDescriptiva && <p className={styles.fileName}>Nuevo archivo: {imagenDescriptiva.name}</p>}
       {!imagenDescriptiva && assetToEdit.imagenDescriptiva && <p className={styles.fileName}>Imagen actual: {assetToEdit.imagenDescriptiva.split('/').pop()}</p>}


      <Input
        label="Nuevo archivo del asset (Opcional)"
        type="file"
        id="archivoAsset"
        name="archivoAsset"
        onChange={handleAssetFileChange}
        disabled={loading}
      />
      {/* Muestra nombre del archivo actual o del nuevo */}
      {archivoAsset && <p className={styles.fileName}>Nuevo archivo: {archivoAsset.name}</p>}
      {!archivoAsset && assetToEdit.archivo && <p className={styles.fileName}>Archivo actual: {assetToEdit.archivo.split('/').pop()}</p>}


      <Button type="submit" variant="primary" size="large" disabled={loading} className={styles.submitButton}>
        {loading ? 'Actualizando...' : 'Guardar cambios'}
      </Button>
    </form>
  );
}

export default EditAssetForm;