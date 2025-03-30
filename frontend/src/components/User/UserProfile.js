// src/components/User/UserProfile.js
import React, { useState, useEffect } from 'react';
import styles from './UserProfile.module.css';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { useAuth } from '../../hooks/useAuth';

// mode: 'view' or 'edit'
function UserProfile({ mode = 'view' }) {
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [profileData, setProfileData] = useState({ nombre: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        nombre: user.nombre || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleEditToggle = () => {
      setIsEditing(!isEditing);
      setError('');
      setSuccess('');
      // Restaura los datos originales si se cancela la edición
      if (isEditing && user) {
           setProfileData({ nombre: user.nombre || '', email: user.email || '' });
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validaciones
    if (!profileData.nombre || !profileData.email) {
        setError('Nombre y Email no pueden estar vacíos.');
        setLoading(false);
        return;
    }

    try {
      await updateUserProfile(profileData);
      setSuccess('¡Perfil actualizado con éxito!');
      setIsEditing(false); // Vuelve al modo vista después de guardar
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || err.error || 'Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
      return <p>Cargando perfil...</p>; // O un spinner
  }

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.title}>{isEditing ? 'Editar perfil' : 'Mi perfil'}</h2>

        {error && <p className={`message error ${styles.formMessage}`}>{error}</p>}
        {success && <p className={`message success ${styles.formMessage}`}>{success}</p>}

      {isEditing ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nombre de usuario"
            type="text"
            id="profile-nombre"
            name="nombre"
            value={profileData.nombre}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <Input
            label="Email"
            type="email"
            id="profile-email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            required
            disabled={loading} // Opcional: permitir cambiar email?
          />
          {/* Opcional: Campos para cambiar contraseña */}
          {/* <Input label="Nueva Contraseña (opcional)" type="password" ... /> */}
          {/* <Input label="Confirmar Nueva Contraseña" type="password" ... /> */}

          <div className={styles.buttonGroup}>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
             <Button type="button" variant="secondary" onClick={handleEditToggle} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.viewMode}>
          <p className={styles.field}><strong className={styles.fieldLabel}>Nombre:</strong> {user.nombre}</p>
          <p className={styles.field}><strong className={styles.fieldLabel}>Email:</strong> {user.email}</p>
          {/* Mostrar más info si la hay */}
          <Button onClick={handleEditToggle} variant="secondary" className={styles.editButton}>
            Editar perfil
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserProfile;