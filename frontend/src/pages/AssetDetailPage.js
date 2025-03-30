// src/pages/AssetDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AssetDetail from '../components/Assets/AssetDetail';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import * as assetService from '../services/assetService';
// Opcional: Modal de confirmación
// import Modal from '../components/Common/Modal';
// import Button from '../components/Common/Button';

function AssetDetailPage() {
  const { id } = useParams(); // Obtiene el ID del asset de la URL
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchAsset = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedAsset = await assetService.getAssetById(id);
      setAsset(fetchedAsset);
    } catch (err) {
      console.error(`Error fetching asset ${id}:`, err);
      setError("No se pudo cargar el asset o no existe.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  const handleDelete = async (assetId) => {
      // TODO: Implementar confirmación (ej. usando un Modal)
      if (window.confirm("¿Estás seguro de que quieres borrar este asset? Esta acción no se puede deshacer.")) {
          try {
              await assetService.deleteAsset(assetId);
              navigate('/dashboard', { state: { message: 'Asset borrado con éxito.' } }); // Redirige al dashboard o a 'browse'
          } catch (err) {
              console.error(`Error deleting asset ${assetId}:`, err);
              setError(err.message || "Error al borrar el asset.");
              // Opcional: Mostrar el error en un toast o mensaje temporal
          }
      }
    //   setShowDeleteModal(true); // Abrir modal si usas uno
  };

//   const confirmDelete = async () => {
//       setShowDeleteModal(false);
//       try {
//           await assetService.deleteAsset(id);
//           navigate('/dashboard', { state: { message: 'Asset borrado con éxito.' }});
//       } catch (err) {
//            console.error(`Error deleting asset ${id}:`, err);
//            setError(err.message || "Error al borrar el asset.");
//       }
//   };


  return (
    <MainLayout>
      {loading && <LoadingSpinner />}
      {error && <p className="message error" style={{ textAlign: 'center', marginTop: '20px' }}>{error}</p>}
      {!loading && !error && asset && (
        <AssetDetail asset={asset} onDelete={handleDelete} />
      )}

       {/* Opcional: Modal de Confirmación */}
       {/* {showDeleteModal && (
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmar Borrado">
                <p>¿Estás seguro de que quieres borrar este asset? Esta acción no se puede deshacer.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <Button onClick={() => setShowDeleteModal(false)} variant="secondary">Cancelar</Button>
                    <Button onClick={confirmDelete} variant="danger">Borrar</Button>
                </div>
            </Modal>
        )} */}
    </MainLayout>
  );
}

export default AssetDetailPage;