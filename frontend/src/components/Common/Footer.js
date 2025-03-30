// src/components/Common/Footer.js
import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <p>&copy; {currentYear} PixelDepot Asset Hub. Todos los derechos reservados.</p>
        {/* Puedes añadir más enlaces o información aquí */}
        {/* <nav>
            <a href="/privacy">Política de Privacidad</a> |
            <a href="/terms">Términos de Servicio</a>
        </nav> */}
      </div>
    </footer>
  );
}

export default Footer;