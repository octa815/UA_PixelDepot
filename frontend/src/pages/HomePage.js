// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import MainLayout from '../components/Layout/MainLayout'; // Usar el layout
import AssetList from '../components/Assets/AssetList'; // Componente para mostrar assets
import * as assetService from '../services/assetService'; // Servicio para assets
import { useAuth } from '../hooks/useAuth'; // Hook de autenticación
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner'; // Indicador de carga

function HomePage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, loading: authLoading } = useAuth(); // Obtiene estado de autenticación

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener solo algunos assets destacados para la home, ej: los 6 más recientes
        const params = { limit: 6, sortBy: 'fechaSubida', order: 'desc' };
        const fetchedAssets = await assetService.getAssets(params); // Llama a tu API
        setAssets(fetchedAssets.assets || fetchedAssets); // Ajusta según la respuesta de tu API
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError("No se pudieron cargar los assets.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Espera a que la autenticación termine de cargar antes de mostrar contenido sensible
  if (authLoading) {
    return <MainLayout><LoadingSpinner /></MainLayout>;
  }

  return (
    <MainLayout> {/* Envuelve el contenido con el layout principal */}
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>PixelDepot Asset Hub</h1>
        <p className={styles.heroSubtitle}>
          Tu plataforma centralizada para descubrir y gestionar assets de videojuegos.
        </p>
        {!isAuthenticated && (
            <div className={styles.ctaButtons}>
                <Link to="/register" className={styles.ctaButtonPrimary}>¡Regístrate ahora!</Link>
                <Link to="/login" className={styles.ctaButtonSecondary}>Iniciar sesión</Link>
            </div>
        )}
         {isAuthenticated && (
            <Link to="/browse" className={styles.ctaButtonPrimary}>Explorar todos los assets</Link>
         )}
      </div>

      <section className={styles.featuredAssets}>
        <h2 className={styles.sectionTitle}>Assets destacados</h2>
        {loading && <LoadingSpinner />}
        {error && <p className="message error">{error}</p>}
        {!loading && !error && assets.length === 0 && (
          <p>No hay assets destacados disponibles en este momento.</p>
        )}
        {!loading && !error && assets.length > 0 && (
          <AssetList assets={assets} />
        )}
        {!loading && !error && assets.length > 0 && (
           <div className={styles.viewAllLinkContainer}>
               <Link to="/browse" className={styles.viewAllLink}>Ver todos los assets →</Link>
           </div>
        )}
      </section>

      {/* Puedes añadir más secciones aquí (categorías, etc.) */}

    </MainLayout>
  );
}

export default HomePage;