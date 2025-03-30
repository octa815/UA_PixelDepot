// src/pages/EditAssetPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import EditAssetForm from '../components/Assets/EditAssetForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import * as assetService from '../services/assetService';
import styles from './EditAssetPage.module.css'; // Puedes crear estilos específicos o reutilizar Upload

function EditAssetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Para verificar permisos
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssetToEdit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedAsset = await assetService.getAssetById(id);
      // Verifica si el usuario actual es el autor del asset
      if (!user || !fetchedAsset.autor || user._id !== fetchedAsset.autor._id) {
          setError("No tienes permiso para editar este asset.");
          setAsset(null); // Limpia el asset si no hay permiso
      } else {
         setAsset(fetchedAsset);
      }
    } catch (err) {
      console.error(`Error fetching asset ${id} for edit:`, err);
      setError("No se pudo cargar el asset para editar o no existe.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchAssetToEdit();
  }, [fetchAssetToEdit]);

  return (
    <MainLayout>
      <div className={styles.editContainer}>
        <h1 className={styles.title}>Editar asset</h1>
        {loading && <LoadingSpinner />}
        {error && <p className="message error" style={{ textAlign: 'center' }}>{error}</p>}
        {!loading && !error && asset && (
           <EditAssetForm assetToEdit={asset} />
        )}
         {!loading && !error && !asset && !error && ( // Caso donde no se carga por permisos pero no es un error de fetch
             <p style={{ textAlign: 'center', marginTop: '20px' }}>No se puede editar el asset.</p>
         )}
      </div>
    </MainLayout>
  );
}

export default EditAssetPage;