import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AssetList from '../components/Assets/AssetList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import { useAuth } from '../hooks/useAuth';
import * as userService from '../services/userService';
import styles from './DashboardPage.module.css';

// Un SVG simple para el icono de subida, puedes reemplazarlo con uno de una librería
const UploadIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#A0A0A0', marginBottom: '16px' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const message = location.state?.message;

  const [myAssets, setMyAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetError, setAssetError] = useState(null);

  const fetchMyAssets = useCallback(async () => {
    if (!user) return;
    setLoadingAssets(true);
    setAssetError(null);
    try {
      const response = await userService.getMyAssets();
      setMyAssets(response.assets || response || []);
    } catch (err) {
      console.error("Error fetching user assets:", err);
      setAssetError("No se pudieron cargar tus assets.");
    } finally {
      setLoadingAssets(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) { // Solo buscar assets si hay un usuario
      fetchMyAssets();
    } else {
      // Si no hay usuario, no hay assets que cargar, podrías limpiar el estado si es necesario
      setMyAssets([]);
      setLoadingAssets(false); // Importante para no quedar en estado de carga infinito
    }
  }, [user, fetchMyAssets]);


  if (!user) {
    // Puedes mostrar un spinner, un mensaje para iniciar sesión, o redirigir
    return (
      <MainLayout>
        <div className={styles.centerMessage}>
          <p>Por favor, <Link to="/login">inicia sesión</Link> para ver tu panel.</p>
        </div>
      </MainLayout>
    );
  }

  // Asumimos que el objeto user tiene estas propiedades
  const userAvatar = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=random&color=fff&size=128`;

  return (
    <MainLayout>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <img src={userAvatar} alt={user.nombre} className={styles.profileAvatar} />
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{user.nombre || "Usuario"}</h1>
            {/* Ubicación eliminada */}
            <Link to="/profile/edit" className={styles.editProfileButton}>
              Editar perfil
            </Link>
          </div>
        </div>

        {/* Pestañas eliminadas */}

        {message && <p className={`message success ${styles.infoMessage}`}>{message}</p>}

        {/* Sección de Assets Subidos (ahora es la única sección principal) */}
        <section className={styles.assetsSection}>
          <h2 className={styles.sectionTitle}>Assets subidos</h2> {/* Título de la sección */}
          {loadingAssets && <div className={styles.centerMessage}><LoadingSpinner /></div>}
          {assetError && <p className={`message error ${styles.centerMessage}`}>{assetError}</p>}
          
          {!loadingAssets && !assetError && myAssets.length > 0 && (
            <AssetList assets={myAssets} />
          )}

          {!loadingAssets && !assetError && myAssets.length === 0 && (
            <div className={styles.emptyState}>
              <UploadIcon />
              <h3 className={styles.emptyStateTitle}>Sube tu primer asset</h3>
              <p className={styles.emptyStateText}>
                Demuestra de lo que eres capaz. <br />
                Recoge feedback y sé parte de la comunidad.
              </p>
              <Link to="/upload">
                <Button variant="primary" className={styles.emptyStateButton}>Sube tu primer asset</Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

export default DashboardPage;