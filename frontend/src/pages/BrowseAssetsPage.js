// src/pages/BrowseAssetsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // Para leer query params (search)
import MainLayout from '../components/Layout/MainLayout';
import AssetList from '../components/Assets/AssetList';
import FilterPanel from '../components/Assets/FilterPanel';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import * as assetService from '../services/assetService';
import styles from './BrowseAssetsPage.module.css';
// Opcional: Añadir paginación
// import Pagination from '../components/Common/Pagination';

function BrowseAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams(); // Hook para query params

  // Estado para filtros y paginación
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.getAll('type') || [], // getAll para múltiples tipos
    sortBy: searchParams.get('sortBy') || 'fechaSubida',
    order: searchParams.get('order') || 'desc',
    // page: parseInt(searchParams.get('page') || '1', 10),
    // limit: 12, // Assets por página
  });
  // const [totalPages, setTotalPages] = useState(1);

  // Función para obtener assets, usando useCallback para optimizar
  const fetchAssets = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);
    try {
        // Limpia filtros vacíos antes de enviar
        const paramsToSend = {};
        for(const key in currentFilters) {
            const value = currentFilters[key];
            if(value !== '' && value !== null && (!Array.isArray(value) || value.length > 0)) {
                // Manejo especial para arrays (ej: type)
                 if (Array.isArray(value)) {
                     // Si tu backend espera 'type=2D&type=3D', usa `getAll` al leer y envíalo así.
                     // Si espera 'type=2D,3D', únelo con comas. Ajusta según tu API.
                     // Aquí asumimos que puede manejar múltiples parámetros con el mismo nombre
                    value.forEach(v => {
                        // Esto requiere un manejo especial en setSearchParams si quieres que funcione bien
                        // Por simplicidad, podrías enviar como 'type=2D,3D' si tu backend lo soporta
                        paramsToSend[key] = paramsToSend[key] ? [...paramsToSend[key], v] : [v];
                    });
                 } else {
                    paramsToSend[key] = value;
                 }
            }
        }

        // console.log("Fetching with params:", paramsToSend);
      const response = await assetService.getAssets(paramsToSend);
      setAssets(response.assets || response || []); // Ajusta según tu API
      // setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error("Error fetching assets:", err);
      setError("No se pudieron cargar los assets. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []); // Dependencias vacías si no depende de props o estado externo aquí

   // Actualiza la URL cuando cambian los filtros
   const updateURLParams = useCallback((newFilters) => {
       const newSearchParams = new URLSearchParams();
       if (newFilters.search) newSearchParams.set('search', newFilters.search);
       if (newFilters.sortBy) newSearchParams.set('sortBy', newFilters.sortBy);
       if (newFilters.order) newSearchParams.set('order', newFilters.order);
       // if (newFilters.page > 1) newSearchParams.set('page', newFilters.page); // Solo si no es la página 1

       // Manejo de array 'type'
       (newFilters.type || []).forEach(t => newSearchParams.append('type', t));

       setSearchParams(newSearchParams, { replace: true }); // replace: true evita historial por cada filtro
   }, [setSearchParams]);


  // Efecto para cargar assets cuando los filtros cambian
  useEffect(() => {
      // Lee los filtros iniciales de la URL al montar
       const initialFilters = {
            search: searchParams.get('search') || '',
            type: searchParams.getAll('type') || [],
            sortBy: searchParams.get('sortBy') || 'fechaSubida',
            order: searchParams.get('order') || 'desc',
            // page: parseInt(searchParams.get('page') || '1', 10),
            // limit: 12,
        };
       setFilters(initialFilters); // Actualiza el estado local de filtros
       fetchAssets(initialFilters); // Carga inicial
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, fetchAssets]); // Depende de searchParams para reaccionar a cambios en URL (ej. búsqueda desde header)


  // Handler para cuando cambian los filtros en FilterPanel
  const handleFilterChange = (newFilters) => {
      // Reinicia la página a 1 si los filtros (excepto paginación) cambian
      // const filtersToCheck = { ...newFilters };
      // delete filtersToCheck.page;
      // if (JSON.stringify(filtersToCheck) !== JSON.stringify({...filters, page: undefined})) {
      //     newFilters.page = 1;
      // }
      setFilters(newFilters);
      updateURLParams(newFilters); // Actualiza la URL
      // fetchAssets(newFilters); // El useEffect ya se encarga de esto al cambiar searchParams
  };

  const categories = [
    {
      name: '2D',
      label: 'Assets 2D',
      image: '/images/categories/categoria2d.jpg',
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
  

  // Handler para paginación
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//        const newFilters = { ...filters, page: newPage };
//        setFilters(newFilters);
//        updateURLParams(newFilters);
//     //    fetchAssets(newFilters);
//     }
//   };

  return (
    <MainLayout>
      <h1 className={styles.pageTitle}>Explorar assets</h1>
      <div className={styles.browseLayout}>
        <div className={styles.filterColumn}>
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        </div>
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
                  <img src={cat.image} alt={cat.label} />
                  <span className={styles.categoryLabel}>{cat.label}</span>
                </div>
              );
            })}
          </div>

                  
          {/* Aquí podrías mostrar los filtros activos o el término de búsqueda */}
          {filters.search && <p className={styles.searchTerm}>Resultados para: "{filters.search}"</p>}

          {loading && <LoadingSpinner />}
          {error && <p className="message error">{error}</p>}
          {!loading && !error && (
             <>
                <AssetList assets={assets} />
                {/* {totalPages > 1 && (
                    <Pagination
                        currentPage={filters.page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )} */}
             </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default BrowseAssetsPage;