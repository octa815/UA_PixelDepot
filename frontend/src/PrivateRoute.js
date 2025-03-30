// src/utils/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/Common/LoadingSpinner'; // Muestra carga mientras verifica

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation(); // Para redirigir de vuelta después del login

  if (loading) {
    // Muestra un indicador de carga mientras se verifica el estado de autenticación
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><LoadingSpinner /></div>;
  }

  if (!isAuthenticated) {
    // Redirige al login, guardando la ubicación actual para volver
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, renderiza el componente hijo
  return children;
}

export default PrivateRoute;