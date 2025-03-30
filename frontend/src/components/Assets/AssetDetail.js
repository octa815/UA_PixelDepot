// src/components/Assets/AssetDetail.js
import React from 'react';
import styles from './AssetDetail.module.css';
import { formatDate, getImageUrl, ASSET_TYPES } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import Button from '../Common/Button';
import * as assetService from '../../services/assetService'; // Para la URL de descarga

function AssetDetail({ asset, onDelete }) {
  const { user, isAuthenticated } = useAuth();

  if (!asset) {
    return <p>Asset no encontrado.</p>;
  }

  const imageUrl = getImageUrl(asset.imagenDescriptiva);
  const isOwner = isAuthenticated && user && asset.autor && user._id === asset.autor._id; // Comprueba si el usuario es el autor

  const handleDownload = () => {
    if (!isAuthenticated) {
      // Opcional: Mostrar mensaje o redirigir a login
      alert("Necesitas iniciar sesión para descargar assets.");
      return;
    }
    // Obtiene la URL de descarga (AJUSTA ESTO a tu backend)
    const downloadUrl = assetService.getAssetDownloadUrl(asset._id);
    // Abre la URL en una nueva pestaña (o inicia descarga directa si el backend lo configura)
    window.open(downloadUrl, '_blank');

    // Opcional: Podrías llamar a una API para registrar la descarga
    // assetService.registerDownload(asset._id);
  };

  return (
    <article className={styles.detailContainer}>
      <div className={styles.imageColumn}>
        <img
            src={imageUrl}
            alt={asset.titulo}
            className={styles.mainImage}
            onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }} // CAMBIA RUTA
        />
      </div>

      <div className={styles.infoColumn}>
        <h1 className={styles.title}>{asset.titulo}</h1>

        <div className={styles.metaInfo}>
            <span className={styles.metaItem}><strong>Tipo:</strong> {asset.tipo || 'N/A'}</span>
            <span className={styles.metaItem}><strong>Subido:</strong> {formatDate(asset.fechaSubida)}</span>
             {asset.autor && (
                <span className={styles.metaItem}>
                    <strong>Autor:</strong>
                    {/* Opcional: Enlace al perfil del autor si existe */}
                    {/* <Link to={`/users/${asset.autor._id}`}>{asset.autor.nombre}</Link> */}
                    {' '}{asset.autor.nombre || 'Desconocido'}
                </span>
             )}
             {/* Añadir Likes/Descargas si existen en el modelo */}
             {/* <span className={styles.metaItem}><strong>Descargas:</strong> {asset.downloadCount || 0}</span> */}
        </div>

        <div className={styles.description}>
          <h3 className={styles.sectionTitle}>Descripción</h3>
          <p>{asset.descripcion || 'No hay descripción disponible.'}</p>
        </div>

        <div className={styles.actions}>
             {/* Botón de Descarga */}
              {/* Ajusta la lógica según si el archivo se descarga directamente o es un enlace */}
              {asset.archivo && ( // Solo muestra si hay archivo asociado
                    <Button onClick={handleDownload} variant="primary" disabled={!isAuthenticated}>
                        {isAuthenticated ? 'Descargar Asset' : 'Descargar (Requiere Login)'}
                    </Button>
              )}


          {/* Botones de Editar/Borrar (solo para el dueño) */}
          {isOwner && (
            <div className={styles.ownerActions}>
              <Link to={`/assets/${asset._id}/edit`}>
                <Button variant="secondary" size="small">Editar</Button>
              </Link>
              {/* //TODO: Añadir confirmación antes de borrar */}
              <Button onClick={() => onDelete(asset._id)} variant="danger" size="small">
                Borrar
              </Button>
            </div>
          )}
        </div>

         {/* Opcional: Sección de comentarios */}
         {/* <div className={styles.comments}>
             <h3 className={styles.sectionTitle}>Comentarios</h3>
             {/* Componente de comentarios aquí */}
         {/* </div> */}
      </div>
    </article>
  );
}

export default AssetDetail;