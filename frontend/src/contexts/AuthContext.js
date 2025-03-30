// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Añadir el token a las cabeceras por defecto de axios si no está ya interceptado
        // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const userData = await userService.getMe();
        setUser(userData);
      } catch (error) {
        console.error("Error validating token:", error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  const login = async (credentials) => {
    try {
      // Asumimos que authService.login devuelve { token, ...userData }
      // donde userData puede ser el objeto usuario completo o solo _id, nombre, email
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      // Si la respuesta ya tiene el usuario completo, úsalo.
      // Si no, podríamos necesitar llamar a userService.getMe() de nuevo,
      // pero es más eficiente si login devuelve los datos necesarios.
      // Asumamos que devuelve el usuario en una propiedad 'user' o directamente
      setUser(response.user || { _id: response._id, nombre: response.nombre, email: response.email });
      // Asegura que el token se use en futuras peticiones (si no usas interceptor)
      // axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
    } catch (error) {
      console.error("Login failed:", error);
      localStorage.removeItem('token'); // Limpia token si falla
      setUser(null);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      // ¡CAMBIO AQUÍ! Ahora esperamos que register devuelva { token, _id, nombre, email }
      const response = await authService.register(userData);
      // Si devuelve token, iniciamos sesión directamente
      if (response.token && response._id) {
         localStorage.setItem('token', response.token);
         setUser({ _id: response._id, nombre: response.nombre, email: response.email });
         // Asegura que el token se use en futuras peticiones (si no usas interceptor)
         // axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      } else {
          // Si no devuelve token (comportamiento antiguo), lanzamos error o manejamos diferente
          console.warn("Registro exitoso pero no se recibió token para inicio de sesión automático.");
          // Podrías lanzar un error para forzar el login manual si prefieres
          // throw new Error("Registro completado. Por favor, inicia sesión.");
      }
      // Devolvemos la respuesta por si el componente necesita el mensaje
      return response;

    } catch (error) {
      console.error("Registration failed:", error);
      localStorage.removeItem('token'); // Limpia por si acaso
      setUser(null);
      throw error;
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Limpia cabecera de axios si la estableciste manualmente
    // delete axios.defaults.headers.common['Authorization'];
  };

  const updateUserProfile = async (profileData) => {
      try {
          const updatedUser = await userService.updateProfile(profileData);
          setUser(updatedUser);
      } catch (error) {
          console.error("Profile update failed:", error);
          throw error;
      }
  };


  const authContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register, // register ahora intenta loguear
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children} {/* Renderiza children solo cuando no esté cargando el estado inicial */}
    </AuthContext.Provider>
  );
};