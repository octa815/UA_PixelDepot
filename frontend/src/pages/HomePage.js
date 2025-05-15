// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import MainLayout from '../components/Layout/MainLayout';
import AssetList from '../components/Assets/AssetList';
import * as assetService from '../services/assetService';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import LoadingSpinner from '../components/Common/LoadingSpinner';

// Importa los estilos de BrowseAssetsPage para las tarjetas de categoría
import categoryStyles from './BrowseAssetsPage.module.css';

// Define o importa las categorías aquí
const categories = [
  {
    name: '2D',
    label: 'Assets 2D',
    image: '/images/categories/categoria2d.jpg', // Asegúrate que estas rutas sean accesibles desde public/
  },
  {
    name: '3D',
    label: 'Assets 3D',
    image: '/images/categories/categoria3d.jpg',
  },
  {
    name: 'Audio',
    label: 'Audio',
    image: '/images/categories/audio.jpg',
  },
  {
    name: 'Video',
    label: 'Video',
    image: '/images/categories/video.jpg',
  },
  {
    name: 'Codigo',
    label: 'Codigo',
    image: '/images/categories/codigo.jpeg',
  },
];

function HomePage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // Hook para navegación

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { limit: 6, sortBy: 'fechaSubida', order: 'desc' };
        const fetchedAssets = await assetService.getAssets(params);
        setAssets(fetchedAssets.assets || fetchedAssets);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError("No se pudieron cargar los assets.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  if (authLoading) {
    return <MainLayout><LoadingSpinner /></MainLayout>;
  }

  const handleCategoryClick = (categoryName) => {
    navigate(`/browse?type=${encodeURIComponent(categoryName)}`);
  };

  return (
    <MainLayout>
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

      {/* Sección de Categorías */}
      <section className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>Explorar por Categoría</h2>
        <div className={categoryStyles.categoryGrid}> {/* Usa la clase de BrowseAssetsPage.module.css */}
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={categoryStyles.categoryCard} // Usa la clase de BrowseAssetsPage.module.css
              onClick={() => handleCategoryClick(cat.name)}
            >
              {/* Si la imagen no carga, puedes poner un placeholder o asegurar que la ruta sea correcta */}
              {cat.image ? (
                <img src={cat.image} alt={cat.label} className={categoryStyles.categoryImage} />
              ) : (
                <div className={categoryStyles.placeholderImage}>Sin imagen</div>
              )}
              <span className={categoryStyles.categoryLabel}>{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

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
      </section>
    </MainLayout>
  );
}

export default HomePage;