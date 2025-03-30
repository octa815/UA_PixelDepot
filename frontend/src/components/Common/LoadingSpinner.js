// src/components/Common/LoadingSpinner.js
import React from 'react';
import styles from './LoadingSpinner.module.css';

function LoadingSpinner({ size = 'medium' }) {
  return <div className={`${styles.spinner} ${styles[size]}`} role="status" aria-label="Cargando..."></div>;
}

export default LoadingSpinner;