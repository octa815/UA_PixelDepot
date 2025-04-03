// frontend/src/pages/AssetDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Añade useLocation
import MainLayout from '../components/Layout/MainLayout';
import AssetDetail from '../components/Assets/AssetDetail';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import * as assetService from '../services/assetService';

function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Para leer el mensaje de estado opcional
  const successMessage = location.state?.message; // Mensaje de éxito al crear/actualizar

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayMessage, setDisplayMessage] = useState(successMessage || ''); // Estado para mostrar mensaje

  console.log(`[Detail Page] Renderizando para ID: ${id}`); // Log al renderizar

  const fetchAsset = useCallback(async () => {
    console.log(`[Detail Page] useEffect: Iniciando fetch para ID: ${id}`); // Log inicio fetch
    setLoading(true);
    setError(null);
    // Limpia el mensaje después de un tiempo o al re-cargar
    if (displayMessage) setTimeout(() => setDisplayMessage(''), 3000);

    try {
      const fetchedAsset = await assetService.getAssetById(id);
      console.log('[Detail Page] useEffect: Fetch exitoso, datos recibidos:', fetchedAsset); // Log datos recibidos
      setAsset(fetchedAsset);
    } catch (err) {
      console.error(`[Detail Page] useEffect: ERROR en fetch para ID ${id}:`, err); // Log error fetch
      setError("No se pudo cargar el asset o no existe.");
    } finally {
      console.log('[Detail Page] useEffect: Fetch finalizado, setLoading(false)'); // Log fin fetch
      setLoading(false);
    }
  }, [id, displayMessage]); // Añade displayMessage a dependencias si limpias el timeout

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]); // fetchAsset ya tiene 'id' en sus dependencias

  // Manejador de borrado (se pasa a AssetDetail)
  const handleDelete = async (assetId) => {
      if (window.confirm("¿Estás seguro de que quieres borrar este asset? Esta acción no se puede deshacer.")) {
          try {
              console.log(`[Detail Page] Iniciando borrado para ID: ${assetId}`);
              await assetService.deleteAsset(assetId);
              console.log(`[Detail Page] Borrado OK. Navegando a /dashboard`);
              // Navega al dashboard con un mensaje de éxito
              navigate('/dashboard', { state: { message: 'Asset borrado con éxito.' } });
          } catch (err) {
              console.error(`[Detail Page] ERROR al borrar asset ${assetId}:`, err);
              setError(err.message || "Error al borrar el asset.");
              // Limpia el error después de un tiempo
              setTimeout(() => setError(null), 4000);
          }
      }
  };

  console.log(`[Detail Page] Preparando para renderizar. Loading: ${loading}, Error: ${error}, Asset: ${!!asset}`); // Log antes de return

  return (
    <MainLayout>
      {/* Muestra mensaje de éxito/error temporalmente */}
      {displayMessage && <p className="message success" style={{ textAlign: 'center', marginTop: '10px' }}>{displayMessage}</p>}
      {error && <p className="message error" style={{ textAlign: 'center', marginTop: '10px' }}>{error}</p>}

      {loading && <LoadingSpinner />}

      {!loading && !error && asset && (
        // Pasamos la función handleDelete al componente hijo
        <AssetDetail asset={asset} onDelete={handleDelete} />
      )}

      {!loading && !error && !asset && (
         // Mensaje si no hay loading, no hay error, pero tampoco hay asset (después del fetch)
         <p style={{ textAlign: 'center', marginTop: '20px' }}>Asset no encontrado.</p>
      )}
    </MainLayout>
  );
}

export default AssetDetailPage;