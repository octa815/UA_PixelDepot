// frontend/src/pages/AssetDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AssetDetailComponent from '../components/Assets/AssetDetail'; // Renombrado para claridad
import LoadingSpinner from '../components/Common/LoadingSpinner';
import * as assetService from '../services/assetService';
// CommentSection ya está dentro de AssetDetailComponent

function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [asset, setAsset] = useState(null); // Este estado será actualizado por los likes/dislikes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayMessage, setDisplayMessage] = useState(successMessage || '');

  const fetchAsset = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (displayMessage && !location.state?.message) setTimeout(() => setDisplayMessage(''), 3000);

    try {
      const fetchedAsset = await assetService.getAssetById(id);
      setAsset(fetchedAsset);
    } catch (err) {
      console.error(`[Detail Page] useEffect: ERROR en fetch para ID ${id}:`, err);
      setError("No se pudo cargar el asset o no existe.");
      setAsset(null); // Asegurarse que el asset es null en caso de error
    } finally {
      setLoading(false);
    }
  }, [id, displayMessage, location.state?.message]); // displayMessage y location.state?.message para limpiar el mensaje

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]); // fetchAsset ya tiene 'id' en sus dependencias

  const handleDelete = async (assetId) => {
    if (window.confirm("¿Estás seguro de que quieres borrar este asset? Esta acción no se puede deshacer.")) {
      try {
        await assetService.deleteAsset(assetId);
        navigate('/dashboard', { state: { message: 'Asset borrado con éxito.' } });
      } catch (err) {
        setError(err.message || "Error al borrar el asset.");
        setTimeout(() => setError(null), 4000);
      }
    }
  };

  // --- NUEVA FUNCIÓN PARA ACTUALIZAR EL ASSET EN ESTA PÁGINA ---
  const handleAssetUpdate = (updatedAsset) => {
    setAsset(updatedAsset);
  };
  // --- FIN NUEVA FUNCIÓN ---

  if (loading) {
    return <MainLayout><LoadingSpinner /></MainLayout>;
  }

  // No mostrar error y "Asset no encontrado" al mismo tiempo
  if (error && !asset) {
    return <MainLayout><p className="message error" style={{ textAlign: 'center', marginTop: '20px' }}>{error}</p></MainLayout>;
  }
  
  if (!asset) {
    return <MainLayout><p style={{ textAlign: 'center', marginTop: '20px' }}>Asset no encontrado o no tienes permiso para verlo.</p></MainLayout>;
  }


  return (
    <MainLayout>
      {displayMessage && <p className="message success" style={{ textAlign: 'center', marginTop: '10px' }}>{displayMessage}</p>}
      {/* Si hay un error pero el asset se cargó (ej. error al borrar), igual mostrar el asset */}
      {error && asset && <p className="message error" style={{ textAlign: 'center', marginTop: '10px' }}>{error}</p>}
      
      <AssetDetailComponent 
        asset={asset} 
        onDelete={handleDelete}
        onAssetUpdate={handleAssetUpdate} // Pasar la función de actualización
      />
    </MainLayout>
  );
}

export default AssetDetailPage;