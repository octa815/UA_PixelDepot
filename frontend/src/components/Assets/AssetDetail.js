// frontend/src/components/Assets/AssetDetail.js
import React from 'react';
import styles from './AssetDetail.module.css';
import { formatDate, getImageUrl } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import Button from '../Common/Button';
import CommentSection from '../Comments/CommentSection';

function AssetDetail({ asset, onDelete }) {
  const { user, isAuthenticated } = useAuth();

  if (!asset) { return <p>Asset no encontrado.</p>; }

  const imageUrl = getImageUrl(asset.imagenDescriptiva); // Usa la URL de Cloudinary
  const isOwner = isAuthenticated && user && asset.autor && user._id === asset.autor._id;

  return (
    <article className={styles.detailContainer}>
      <div className={styles.imageColumn}>
        <img
            src={imageUrl}
            alt={asset.titulo}
            className={styles.mainImage}
        />
      </div>

      <div className={styles.infoColumn}>
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
             {asset.archivo && (
                <a
                    href={asset.archivo}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="primary" disabled={!isAuthenticated}>
                       {isAuthenticated ? 'Ver/Descargar Asset' : 'Ver/Descargar (Requiere Login)'}
                    </Button>
                </a>
             )}

            {isOwner && (
                <div className={styles.ownerActions}>
                  <Link to={`/assets/${asset._id}/edit`}><Button variant="secondary" size="small">Editar</Button></Link>
                  <Button onClick={() => onDelete(asset._id)} variant="danger" size="small">Borrar</Button>
                </div>
            )}
        </div>

        {/* Sección de comentarios */}
        <CommentSection assetId={asset._id} />
      </div>
    </article>
  );
}

export default AssetDetail;