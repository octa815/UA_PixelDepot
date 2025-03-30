// src/pages/UploadAssetPage.js
import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import UploadAssetForm from '../components/Assets/UploadAssetForm';
import styles from './UploadAssetPage.module.css';

function UploadAssetPage() {
  return (
    <MainLayout>
      <div className={styles.uploadContainer}>
        <h1 className={styles.title}>Subir nuevo asset</h1>
        <UploadAssetForm />
      </div>
    </MainLayout>
  );
}

export default UploadAssetPage;