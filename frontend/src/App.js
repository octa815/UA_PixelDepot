// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssetDetailPage from './pages/AssetDetailPage';
import UploadAssetPage from './pages/UploadAssetPage';
import EditAssetPage from './pages/EditAssetPage'; // Si la creas
import BrowseAssetsPage from './pages/BrowseAssetsPage'; // Página para explorar
import ProfilePage from './pages/ProfilePage'; // Página para editar perfil
import NotFoundPage from './pages/NotFoundPage'; // Página 404
import PrivateRoute from './utils/PrivateRoute'; // Componente para rutas protegidas

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/browse" element={<BrowseAssetsPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />

        {/* Rutas Privadas (Requieren Login) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
         <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage /> {/* Página para editar perfil */}
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UploadAssetPage />
            </PrivateRoute>
          }
        />
         <Route
          path="/assets/:id/edit"
          element={
            <PrivateRoute>
              <EditAssetPage /> {/* Página para editar asset */}
            </PrivateRoute>
          }
        />

        {/* Ruta Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;