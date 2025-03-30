// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import styles from './NotFoundPage.module.css';
import Button from '../components/Common/Button';

function NotFoundPage() {
  return (
    <MainLayout>
      <div className={styles.notFoundContainer}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.errorMessage}>Página no encontrada</h2>
        <p className={styles.description}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link to="/">
          <Button variant="primary" size="large">Volver al inicio</Button>
        </Link>
      </div>
    </MainLayout>
  );
}

export default NotFoundPage;