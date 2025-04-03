// src/pages/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AssetList from '../components/Assets/AssetList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button';
import { useAuth } from '../hooks/useAuth';
import * as userService from '../services/userService'; // Para obtener assets del usuario
import styles from './DashboardPage.module.css';

function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const message = location.state?.message; // Mensaje opcional (ej. desde borrado)

  const [myAssets, setMyAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetError, setAssetError] = useState(null);
  const [activeSection, setActiveSection] = useState("uploads"); // "uploads" o "downloads"

  const fetchMyAssets = useCallback(async () => {
    if (!user) return; // No hacer nada si no hay usuario
    setLoadingAssets(true);
    setAssetError(null);
    try {
      // Llama a la función del servicio para obtener los assets del usuario
      const response = await userService.getMyAssets(); // O assetService si lo tienes ahí
      setMyAssets(response.assets || response || []); // Ajusta según la respuesta
    } catch (err) {
      console.error("Error fetching user assets:", err);
      setAssetError("No se pudieron cargar tus assets.");
    } finally {
      setLoadingAssets(false);
    }
  }, [user]); // Depende del usuario

  useEffect(() => {
    fetchMyAssets();
  }, [fetchMyAssets]);

  if (!user) {
      return <MainLayout><p>Cargando datos de usuario...</p></MainLayout>; // O redirigir a login
  }

  return (
    <MainLayout>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.title}>Dashboard de {user.nombre}</h1>
        <div className={styles.headerActions}>
           <Link to="/upload">
             <Button variant="primary">Subir nuevo asset</Button>
           </Link>
           <Link to="/profile">
               <Button variant="secondary">Editar perfil</Button>
           </Link>
        </div>
      </div>

       {message && <p className={`message success ${styles.infoMessage}`}>{message}</p>}
      

        {/* Botones para cambiar entre secciones 
            <div className={styles.toggleButtons}>
        <button 
          className={activeSection === "uploads" ? styles.active : ""} 
          onClick={() => setActiveSection("uploads")}
        >
          Assets subidos
        </button>
        <button 
          className={activeSection === "downloads" ? styles.active : ""} 
          onClick={() => setActiveSection("downloads")}
        >
          Historial de descargas
        </button>
      </div>

       Renderizado condicional de secciones 
      {activeSection === "uploads" && (
        <section className={styles.assetsSection}>
          <h2 className={styles.sectionTitle}>Mis assets subidos</h2>
          {loadingAssets && <LoadingSpinner />}
          {assetError && <p className="message error">{assetError}</p>}
          {!loadingAssets && !assetError && myAssets.length > 0 ? (
            <AssetList assets={myAssets} />
          ) : (
            <p className={styles.noAssetsMessage}>
              Aún no has subido ningún asset. ¡<Link to="/upload">Empieza ahora</Link>!
            </p>
          )}
        </section>
      )}

      {activeSection === "downloads" && (
        <section className={styles.downloadSection}>
          <h2 className={styles.downloadTitle}>Historial de descargas</h2>
          {loadingAssets && <LoadingSpinner />}
          {assetError && <p className="message error">{assetError}</p>}
          {!loadingAssets && !assetError && myAssets.length > 0 ? (
            <AssetList assets={myAssets} />
          ) : (
            <p className={styles.noAssetsMessage}>
              Aún no has descargado ningún asset.
            </p>
          )}
        </section>
      )} */}


      <section className={styles.assetsSection}>
        <h2 className={styles.sectionTitle}>Mis assets subidos</h2>
        {loadingAssets && <LoadingSpinner />}
        {assetError && <p className="message error">{assetError}</p>}
        {!loadingAssets && !assetError && (
          <AssetList assets={myAssets} />
        )}
         {!loadingAssets && !assetError && myAssets.length === 0 && (
             <p className={styles.noAssetsMessage}>Aún no has subido ningún asset. ¡<Link to="/upload">Empieza ahora</Link>!</p>
         )}
      </section>

       {/* Podrías añadir más secciones, como assets descargados, favoritos, etc. */}

    </MainLayout>
  );
}

export default DashboardPage;