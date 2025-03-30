// src/components/Assets/AssetCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AssetCard.module.css';
import { formatDate, getImageUrl } from '../../utils/helpers'; // Importa helpers

function AssetCard({ asset }) {
  if (!asset) return null; // No renderizar si no hay asset

  // Asegúrate de que asset.imagenDescriptiva exista y sea la ruta correcta
  const imageUrl = getImageUrl(asset.imagenDescriptiva);

  return (
    <Link to={`/assets/${asset._id}`} className={styles.cardLink}>
      <article className={styles.card}>
        <div className={styles.imageWrapper}>
          <img
            src={imageUrl}
            alt={asset.titulo || 'Asset preview'} // Usa el título como alt
            className={styles.image}
            loading="lazy" // Carga diferida para imágenes
            onError={(e) => {
              // Opcional: Cambiar a una imagen placeholder si la carga falla
              e.target.onerror = null; // Previene bucles infinitos si el placeholder también falla
              e.target.src = '/images/placeholder.png'; // CAMBIA ESTA RUTA
            }}
          />
           <span className={styles.assetType}>{asset.tipo || 'Desconocido'}</span>
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{asset.titulo || 'Sin título'}</h3>
          {/* Puedes añadir más info si quieres, como el autor o fecha */}
           <p className={styles.author}>Por: {asset.autor?.nombre || 'Desconocido'}</p> {/* Asume que el backend popula el autor */}
           <p className={styles.date}>Subido: {formatDate(asset.fechaSubida)}</p>
        </div>
      </article>
    </Link>
  );
}

export default AssetCard;