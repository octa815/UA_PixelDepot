import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AssetList from '../components/Assets/AssetList';
import FilterPanel from '../components/Assets/FilterPanel';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import * as assetService from '../services/assetService';
import styles from './BrowseAssetsPage.module.css';
// import Pagination from '../components/Common/Pagination';

function BrowseAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.getAll('type') || [],
    sortBy: searchParams.get('sortBy') || 'fechaSubida',
    order: searchParams.get('order') || 'desc',
  });
  // const [totalPages, setTotalPages] = useState(1);

  const fetchAssets = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
        const paramsToSend = {};
        for(const key in currentFilters) {
            const value = currentFilters[key];
            if(value !== '' && value !== null && (!Array.isArray(value) || value.length > 0)) {
                 if (Array.isArray(value)) {
                    paramsToSend[key] = value;
                 } else {
                    paramsToSend[key] = value;
                 }
            }
        }
      const response = await assetService.getAssets(paramsToSend);
      setAssets(response.assets || response || []);
      // setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError("No se pudieron cargar los assets. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

   const updateURLParams = useCallback((newFilters) => {
       const newSearchParams = new URLSearchParams();
       if (newFilters.search) newSearchParams.set('search', newFilters.search);
       if (newFilters.sortBy) newSearchParams.set('sortBy', newFilters.sortBy);
       if (newFilters.order) newSearchParams.set('order', newFilters.order);
       (newFilters.type || []).forEach(t => newSearchParams.append('type', t));
       setSearchParams(newSearchParams, { replace: true });
   }, [setSearchParams]);

  useEffect(() => {
       const initialFilters = {
            search: searchParams.get('search') || '',
            type: searchParams.getAll('type') || [],
            sortBy: searchParams.get('sortBy') || 'fechaSubida',
            order: searchParams.get('order') || 'desc',
        };
       setFilters(initialFilters);
       fetchAssets(initialFilters);
  }, [searchParams, fetchAssets]);


  const handleFilterChange = (newFilters) => {
      setFilters(newFilters);
      updateURLParams(newFilters);
  };

  const categories = [
    { name: '2D', label: 'Assets 2D', image: '/images/categories/categoria2d.jpg' },
    { name: '3D', label: 'Assets 3D', image: '/images/categories/categoria3d.jpg' },
    { name: 'Audio', label: 'Audio', image: '/images/categories/audio.jpg' },
    { name: 'Video', label: 'Video', image: '/images/categories/video.jpg' },
    { name: 'Codigo', label: 'Código', image: '/images/categories/codigo.jpeg' },
  ];
  // Ejemplo de categorías del mockup:
  // const categories = [
  //   { name: 'Vehiculos', label: 'Coches y vehículos', image: '/images/mockup/coches.jpg' },
  //   { name: 'Criaturas', label: 'Personajes y criaturas', image: '/images/mockup/criaturas.jpg' },
  //   { name: 'Arquitectura', label: 'Arquitectura', image: '/images/mockup/arquitectura.jpg' },
  //   { name: 'Tecnologia', label: 'Tecnología', image: '/images/mockup/tecnologia.jpg' },
  //   { name: 'Animacion', label: 'Animación', image: '/images/mockup/animacion.jpg' },
  // ];

  return (
    <MainLayout>
      <h1 className={styles.pageTitle}>Página de categorías</h1>
      
      <div className={styles.browseLayout}>
        {/* Columna de Filtros */}
        <div className={styles.filterColumn}>
          {/* Los "botones" visuales de filtro han sido eliminados */}
          {/* Ahora FilterPanel se renderiza directamente */}
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Columna de Resultados */}
        <div className={styles.resultsColumn}>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => {
              const isSelected = filters.type?.includes(cat.name);
              return (
                <div
                  key={cat.name}
                  className={`${styles.categoryCard} ${isSelected ? styles.activeCard : ''}`}
                  onClick={() => {
                    const currentTypes = filters.type || [];
                    const newTypes = isSelected
                      ? currentTypes.filter(t => t !== cat.name)
                      : [...currentTypes, cat.name];
                    handleFilterChange({ ...filters, type: newTypes });
                  }}
                >
                  <img src={cat.image} alt={cat.label} className={styles.categoryImage} />
                  <span className={styles.categoryLabel}>{cat.label}</span>
                </div>
              );
            })}
          </div>
                  
          {filters.search && filters.search.trim() !== '' && (
            <p className={styles.searchTerm}>Resultados para: "{filters.search}"</p>
          )}

          {loading && <div className={styles.centeredStatus}><LoadingSpinner /></div>}
          {error && <p className={`message error ${styles.centeredStatus}`}>{error}</p>}
          {!loading && !error && (
             <>
                {assets.length > 0 ? (
                    <AssetList assets={assets} />
                ) : (
                    <p className={styles.centeredStatus}>
                        No se encontraron assets con los filtros actuales.
                    </p>
                )}
                {/* {totalPages > 1 && ( <Pagination ... /> )} */}
             </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default BrowseAssetsPage;