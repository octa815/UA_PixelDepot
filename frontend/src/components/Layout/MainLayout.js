// src/components/Layout/MainLayout.js
import React from 'react';
import Header from '../Common/Header';
import styles from './MainLayout.module.css';

function MainLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.container}> {/* Contenedor para centrar contenido */}
          {children}
        </div>
      </main>
      {/* <Footer /> */} {/* Descomenta si creas un Footer */}
    </div>
  );
}

export default MainLayout;