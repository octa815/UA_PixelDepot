// src/pages/LoginPage.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import LoginForm from '../components/Auth/LoginForm';
import styles from './LoginPage.module.css';

function LoginPage() {
   const location = useLocation();
   const message = location.state?.message; // Mensaje opcional (ej. desde registro)

  return (
    <MainLayout>
      <div className={styles.loginContainer}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        {message && <p className={`message success ${styles.infoMessage}`}>{message}</p>}
        <LoginForm />
        <p className={styles.registerLink}>
          ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </MainLayout>
  );
}

export default LoginPage;