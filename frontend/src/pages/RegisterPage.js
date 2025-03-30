// src/pages/RegisterPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import RegisterForm from '../components/Auth/RegisterForm';
import styles from './RegisterPage.module.css';

function RegisterPage() {
  return (
    <MainLayout>
      <div className={styles.registerContainer}>
        <h1 className={styles.title}>Crear cuenta</h1>
        <RegisterForm />
        <p className={styles.loginLink}>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </MainLayout>
  );
}

export default RegisterPage;