// frontend/src/components/Assets/AssetDetail.js
import React, { useState } from 'react'; // Añadir useState si no estaba
import styles from './AssetDetail.module.css';
import { formatDate, getImageUrl } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import Button from '../Common/Button';
import CommentSection from '../Comments/CommentSection';
import Slider from "react-slick";
import * as assetService from '../../services/assetService'; // Importar assetService

// Recibe onAssetUpdate como prop
function AssetDetail({ asset, onDelete, onAssetUpdate }) {
  const { user, isAuthenticated } = useAuth();
  const [interactionError, setInteractionError] = useState(''); // Para errores de like/dislike

  if (!asset) { return <p>Asset no encontrado.</p>; }

  const carouselImages = [];
  if (asset.imagenDescriptiva) {
    carouselImages.push(getImageUrl(asset.imagenDescriptiva));
  }
  if (asset.imagenesAdicionales && asset.imagenesAdicionales.length > 0) {
    asset.imagenesAdicionales.forEach(imgUrl => {
      carouselImages.push(getImageUrl(imgUrl));
    });
  }
  if (carouselImages.length === 0) {
    carouselImages.push(getImageUrl(null));
  }

  const sliderSettings = {
    dots: true,
    infinite: carouselImages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    autoplay: carouselImages.length > 1,
    autoplaySpeed: 5000,
  };

  const isOwner = isAuthenticated && user && asset.autor && user._id === asset.autor._id;

  // --- LÓGICA PARA LIKES/DISLIKES ---
  const hasLiked = isAuthenticated && asset.likes && asset.likes.includes(user?._id);
  const hasDisliked = isAuthenticated && asset.dislikes && asset.dislikes.includes(user?._id);

  const handleLike = async () => {
    if (!isAuthenticated) {
      setInteractionError('Debes iniciar sesión para dar like.');
      setTimeout(() => setInteractionError(''), 3000);
      return;
    }
    setInteractionError('');
    try {
      const updatedAsset = await assetService.likeAsset(asset._id);
      onAssetUpdate(updatedAsset); // Actualizar el asset en la página padre
    } catch (err) {
      console.error("Error liking asset:", err);
      setInteractionError(err.message || 'Error al procesar el like.');
      setTimeout(() => setInteractionError(''), 3000);
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      setInteractionError('Debes iniciar sesión para dar dislike.');
      setTimeout(() => setInteractionError(''), 3000);
      return;
    }
    setInteractionError('');
    try {
      const updatedAsset = await assetService.dislikeAsset(asset._id);
      onAssetUpdate(updatedAsset); // Actualizar el asset en la página padre
    } catch (err) {
      console.error("Error disliking asset:", err);
      setInteractionError(err.message || 'Error al procesar el dislike.');
      setTimeout(() => setInteractionError(''), 3000);
    }
  };
  // --- FIN LÓGICA LIKES/DISLIKES ---


  return (
    <article className={styles.detailContainer}>
      <div className={styles.imageColumn}>
        {carouselImages.length > 0 ? (
          <Slider {...sliderSettings} className={styles.carousel}>
            {carouselImages.map((imgUrl, index) => (
              <div key={index} className={styles.carouselSlide}>
                <img
                  src={imgUrl}
                  alt={`${asset.titulo} - Imagen ${index + 1}`}
                  className={styles.mainImage}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <img
            src={getImageUrl(null)}
            alt="Sin imagen disponible"
            className={styles.mainImage}
          />
        )}
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

        {/* --- SECCIÓN DE LIKES/DISLIKES CON BOTONES --- */}
        <div className={styles.interactions}>
          <Button 
            onClick={handleLike} 
            disabled={!isAuthenticated} 
            className={`${styles.interactionButton} ${hasLiked ? styles.liked : ''}`}
            aria-pressed={hasLiked}
            title={hasLiked ? "Quitar like" : "Dar like"}
          >
            👍 {asset.likes ? asset.likes.length : 0}
          </Button>
          <Button 
            onClick={handleDislike} 
            disabled={!isAuthenticated} 
            className={`${styles.interactionButton} ${hasDisliked ? styles.disliked : ''}`}
            aria-pressed={hasDisliked}
            title={hasDisliked ? "Quitar dislike" : "Dar dislike"}
          >
            👎 {asset.dislikes ? asset.dislikes.length : 0}
          </Button>
        </div>
        {interactionError && <p className={`message error ${styles.interactionErrorMessage}`}>{interactionError}</p>}
        {/* --- FIN SECCIÓN LIKES/DISLIKES --- */}

        <div className={styles.actions}>
          {asset.archivo && (
            <a
              href={asset.archivo}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" disabled={!isAuthenticated}>
                {isAuthenticated ? 'Ver/Descargar asset' : 'Ver/Descargar (Requiere Login)'}
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
        <CommentSection assetId={asset._id} />
      </div>
    </article>
  );
}

export default AssetDetail;