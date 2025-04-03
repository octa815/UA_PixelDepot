// frontend/src/components/Assets/AssetDetail.js
import React from 'react';
import styles from './AssetDetail.module.css';
import { formatDate, getImageUrl } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import Button from '../Common/Button';
// BORRA: import * as assetService from '../../services/assetService';

function AssetDetail({ asset, onDelete }) {
  const { user, isAuthenticated } = useAuth();

  if (!asset) { return <p>Asset no encontrado.</p>; }

  const imageUrl = getImageUrl(asset.imagenDescriptiva); // Usa la URL de Cloudinary
  const isOwner = isAuthenticated && user && asset.autor && user._id === asset.autor._id;

  // BORRA: la función handleDownload

  return (
    <article className={styles.detailContainer}>
      <div className={styles.imageColumn}>
        <img
            src={imageUrl}
            alt={asset.titulo}
            className={styles.mainImage}
            // onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }} // onError sigue siendo útil por si Cloudinary falla
        />
      </div>

      <div className={styles.infoColumn}>
         {/* ... (titulo, metaInfo, description igual) ... */}
          <h1 className={styles.title}>{asset.titulo}</h1>
             <div className={styles.metaInfo}>
                <span className={styles.metaItem}><strong>Tipo:</strong> {asset.tipo || 'N/A'}</span>
                <span className={styles.metaItem}><strong>Subido:</strong> {formatDate(asset.fechaSubida)}</span>
                {asset.autor && (<span className={styles.metaItem}><strong>Autor:</strong>{' '}{asset.autor.nombre || 'Desconocido'}</span>)}
            </div>
            <div className={styles.description}>
                <h3 className={styles.sectionTitle}>Descripción</h3>
                <p>{asset.descripcion || 'No hay descripción disponible.'}</p>
            </div>

        <div className={styles.actions}>
             {/* --- CAMBIO: Enlace directo usando la URL del asset.archivo --- */}
             {asset.archivo && (
                <a
                    href={asset.archivo}      // <-- URL de Cloudinary/etc.
                    target="_blank"
                    rel="noopener noreferrer"
                    // className={styles.downloadLink} // Añade estilos si quieres
                >
                    <Button variant="primary" disabled={!isAuthenticated}>
                       {isAuthenticated ? 'Ver/Descargar Asset' : 'Ver/Descargar (Requiere Login)'}
                    </Button>
                </a>
             )}
             {/* --- FIN CAMBIO --- */}

            {/* Botones de Editar/Borrar (sin cambios) */}
            {isOwner && (
                <div className={styles.ownerActions}>
                  <Link to={`/assets/${asset._id}/edit`}><Button variant="secondary" size="small">Editar</Button></Link>
                  <Button onClick={() => onDelete(asset._id)} variant="danger" size="small">Borrar</Button>
                </div>
            )}
        </div>
      </div>
    </article>
  );
}

export default AssetDetail;