// src/components/Assets/EditAssetForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AssetForm.module.css';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { ASSET_TYPES, getImageUrl } from '../../utils/helpers'; // Importa getImageUrl
import * as assetService from '../../services/assetService';

function EditAssetForm({ assetToEdit }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: ASSET_TYPES[0],
  });
  const [imagenDescriptivaFile, setImagenDescriptivaFile] = useState(null);
  const [archivoAssetFile, setArchivoAssetFile] = useState(null);
  // --- NUEVO ESTADO PARA NUEVAS IMÁGENES ADICIONALES ---
  const [nuevasImagenesAdicionales, setNuevasImagenesAdicionales] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (assetToEdit) {
      setFormData({
        titulo: assetToEdit.titulo || '',
        descripcion: assetToEdit.descripcion || '',
        tipo: assetToEdit.tipo || ASSET_TYPES[0],
      });
      setImagenDescriptivaFile(null);
      setArchivoAssetFile(null);
      setNuevasImagenesAdicionales([]); // Resetear al cargar
    }
  }, [assetToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleImageChange = (e) => {
    setImagenDescriptivaFile(e.target.files[0]);
    setError('');
  };

  const handleAssetFileChange = (e) => {
    setArchivoAssetFile(e.target.files[0]);
    setError('');
  };

  // --- NUEVO HANDLER PARA NUEVAS IMÁGENES ADICIONALES ---
  const handleNuevasImagenesAdicionalesChange = (e) => {
    setNuevasImagenesAdicionales([...e.target.files]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    data.append('titulo', formData.titulo);
    data.append('descripcion', formData.descripcion);
    data.append('tipo', formData.tipo);

    if (imagenDescriptivaFile) {
      data.append('imagenDescriptiva', imagenDescriptivaFile);
    }
    if (archivoAssetFile) {
      data.append('archivo', archivoAssetFile);
    }
    // --- AÑADIR NUEVAS IMÁGENES ADICIONALES AL FORMDATA SI EXISTEN ---
    if (nuevasImagenesAdicionales.length > 0) {
      for (let i = 0; i < nuevasImagenesAdicionales.length; i++) {
        data.append('imagenesAdicionales', nuevasImagenesAdicionales[i]);
      }
      console.log(`Frontend: [Edit Submit] ${nuevasImagenesAdicionales.length} nuevas imágenes adicionales añadidas.`);
    }
    // Si no se añaden nuevas, el backend no debería tocar el array existente de imagenesAdicionales.

    try {
      const updatedAsset = await assetService.updateAsset(assetToEdit._id, data);
      navigate(`/assets/${updatedAsset._id}`, { state: { message: '¡Asset actualizado con éxito!' } });
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || err.error || 'Error al actualizar el asset. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!assetToEdit) {
    return <p>Cargando datos del asset...</p>;
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

      <p className={styles.currentFilesTitle}>Imagen descriptiva principal actual:</p>
      {assetToEdit.imagenDescriptiva && (
        <img src={getImageUrl(assetToEdit.imagenDescriptiva)} alt="Principal actual" className={styles.currentImagePreview} />
      )}
      <Input
        label="Nueva imagen descriptiva principal (Opcional, reemplaza la actual)"
        type="file"
        id="imagenDescriptiva" // Asegúrate que el id sea único si es necesario
        name="imagenDescriptivaFile" // Cambiado para evitar conflicto de nombre con el string del assetToEdit
        onChange={handleImageChange}
        disabled={loading}
        accept="image/jpeg, image/png, image/svg+xml, image/webp"
      />
      {imagenDescriptivaFile && <p className={styles.fileName}>Nuevo archivo: {imagenDescriptivaFile.name}</p>}


      {/* --- MOSTRAR IMÁGENES ADICIONALES ACTUALES Y NUEVO INPUT --- */}
      <p className={styles.currentFilesTitle}>Imágenes adicionales actuales:</p>
      {assetToEdit.imagenesAdicionales && assetToEdit.imagenesAdicionales.length > 0 ? (
        <div className={styles.currentThumbnails}>
          {assetToEdit.imagenesAdicionales.map((imgUrl, index) => (
            <img key={index} src={getImageUrl(imgUrl)} alt={`Adicional ${index + 1}`} className={styles.thumbnailPreview} />
          ))}
        </div>
      ) : (
        <p className={styles.fileName}>No hay imágenes adicionales actualmente.</p>
      )}
      <Input
        label="Nuevas imágenes adicionales (Opcional, reemplazarán a las actuales)"
        type="file"
        id="nuevasImagenesAdicionales"
        name="nuevasImagenesAdicionales"
        onChange={handleNuevasImagenesAdicionalesChange}
        disabled={loading}
        accept="image/jpeg, image/png, image/svg+xml, image/webp"
        multiple
      />
      {nuevasImagenesAdicionales.length > 0 && (
        <div className={styles.fileNamePreview}>
          <p>{nuevasImagenesAdicionales.length} nuevas imágenes adicionales seleccionadas:</p>
          <ul>
            {Array.from(nuevasImagenesAdicionales).map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      {/* --- FIN SECCIÓN IMÁGENES ADICIONALES --- */}

      <p className={styles.currentFilesTitle}>Archivo principal actual:</p>
      {assetToEdit.archivo && <p className={styles.fileName}>{assetToEdit.archivo.split('/').pop()}</p>}
      <Input
        label="Nuevo archivo del asset (Opcional, reemplaza el actual)"
        type="file"
        id="archivoAsset" // Asegúrate que el id sea único
        name="archivoAssetFile" // Cambiado
        onChange={handleAssetFileChange}
        disabled={loading}
      />
      {archivoAssetFile && <p className={styles.fileName}>Nuevo archivo: {archivoAssetFile.name}</p>}

      <Button type="submit" variant="primary" size="large" disabled={loading} className={styles.submitButton}>
        {loading ? 'Actualizando...' : 'Guardar cambios'}
      </Button>
    </form>
  );
}

export default EditAssetForm;