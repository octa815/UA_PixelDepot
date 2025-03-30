// src/components/User/UserMenu.js
import React from 'react';
import styles from './UserMenu.module.css';
import { Link } from 'react-router-dom'; // O usar botones con onClick

function UserMenu({ onLogout, onDashboard, onProfile }) {
  return (
    <div className={styles.userMenu}>
      <Link to="/dashboard" onClick={onDashboard} className={styles.menuItem}>
        Mi dashboard
      </Link>
      <Link to="/profile" onClick={onProfile} className={styles.menuItem}>
        Editar perfil
      </Link>
      <button onClick={onLogout} className={`${styles.menuItem} ${styles.logoutButton}`}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default UserMenu;