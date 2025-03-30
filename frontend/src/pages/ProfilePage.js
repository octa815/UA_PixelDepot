// src/pages/ProfilePage.js
import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import UserProfile from '../components/User/UserProfile';
// import styles from './ProfilePage.module.css'; // Puedes crear si necesitas estilos específicos

function ProfilePage() {
  return (
    <MainLayout>
      {/* Puedes añadir un contenedor si quieres limitar el ancho */}
      {/* <div className={styles.profileContainer}> */}
        <UserProfile mode="edit" /> {/* Carga directamente en modo edición */}
      {/* </div> */}

       {/* Opcional: Sección para cambiar contraseña */}
       {/* <ChangePasswordForm /> */}

       {/* Opcional: Sección para borrar cuenta */}
        {/* <DeleteAccountSection /> */}
    </MainLayout>
  );
}

export default ProfilePage;