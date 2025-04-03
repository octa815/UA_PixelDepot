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
    setLoading(true);
    console.log("Frontend: [Submit] Iniciando..."); // Log Inicio

    // Crear FormData (como lo tenías antes de los cambios de URL)
    const data = new FormData();
    data.append('titulo', formData.titulo);
    data.append('descripcion', formData.descripcion);
    data.append('tipo', formData.tipo);
    // Asegúrate que imagenDescriptiva y archivoAsset sean los File objects del estado
    if (imagenDescriptiva) data.append('imagenDescriptiva', imagenDescriptiva);
    if (archivoAsset) data.append('archivo', archivoAsset);
    console.log("Frontend: [Submit] FormData creado. Llamando a assetService..."); // Log antes de llamar

    try {
      const uploadedAsset = await assetService.uploadAsset(data); // Llamada a la API
      console.log("Frontend: [Submit] Respuesta OK recibida:", uploadedAsset); // Log Respuesta

      // Verifica si la respuesta tiene el ID necesario para navegar
      if (uploadedAsset && uploadedAsset._id) {
          console.log(`Frontend: [Submit] Respuesta OK y tiene _id. Navegando a /assets/${uploadedAsset._id}`); // Log Navegación
          navigate(`/assets/${uploadedAsset._id}`, { state: { message: '¡Asset subido con éxito!' } });
          // NOTA: setLoading(false) se hará en finally, no es necesario aquí
      } else {
           // La respuesta fue exitosa (201) pero no trajo el _id esperado
           console.error("Frontend: [Submit] Respuesta del backend OK (201) pero falta _id:", uploadedAsset);
           setError("Error inesperado procesando la respuesta del servidor.");
           setLoading(false); // Detenemos carga aquí porque no navegaremos
      }
    } catch (err) {
      // Log detallado del error
      console.error("Frontend: [Submit] ERROR en catch:", err);
      console.error("Frontend: [Submit] Error response:", err.response?.data); // Muestra datos del error del backend si existen
      let errorMessage = 'Error al subir el asset. Inténtalo de nuevo.';
      // Intenta usar el mensaje del backend si existe
      if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
      } else if (err.message) {
          errorMessage = err.message;
      }
      setError(errorMessage);
      // setLoading(false) se hará en finally
    } finally {
      // Este bloque SIEMPRE se ejecuta, funcione o falle el try/catch
      console.log("Frontend: [Submit] Ejecutando finally, setLoading(false)");
      setLoading(false); // <-- Asegura que el indicador de carga se quite
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
        label="Imagen descriptiva (.jpg, .png, .svg)"
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
        label="Archivo del asset (.fbx, .blend, .obj, .mp3, .wav, .mp4, .py, etc.)"
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
        {loading ? 'Subiendo...' : 'Subir asset'}
      </Button>
    </form>
  );
}

export default UploadAssetForm;