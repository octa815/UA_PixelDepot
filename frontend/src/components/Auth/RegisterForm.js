// src/components/Auth/RegisterForm.js
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterForm.module.css';
import Input from '../Common/Input';
import Button from '../Common/Button';

function RegisterForm() {
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ... (Validaciones que dejaste o quitaste antes)

    // Validar que las contraseñas coincidan (si no lo quitaste)
    if (userData.password !== userData.confirmPassword) {
       setError('Las contraseñas no coinciden.');
       return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = userData;
      // Ahora register (del contexto) intenta loguear también
      await register(dataToSend);
      // ¡CAMBIO AQUÍ! Redirige a la página principal '/'
      navigate('/');
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || err.error || 'Error al registrar el usuario. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={`message error ${styles.errorMessage}`}>{error}</p>}
      <Input
        label="Nombre de Usuario"
        type="text"
        id="register-nombre"
        name="nombre"
        value={userData.nombre}
        onChange={handleChange}
        required
        placeholder="Tu nombre o alias"
        disabled={loading}
      />
      <Input
        label="Email"
        type="email"
        id="register-email"
        name="email"
        value={userData.email}
        onChange={handleChange}
        required
        placeholder="tu@email.com"
        disabled={loading}
      />
      <Input
        label="Contraseña"
        type="password"
        id="register-password"
        name="password"
        value={userData.password}
        onChange={handleChange}
        required
        placeholder="Mínimo 8 caracteres"
        disabled={loading}
        aria-describedby="password-hint"
      />
       <p id="password-hint" className={styles.hint}>Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (@$!%*?&).</p>
      <Input
        label="Confirmar Contraseña"
        type="password"
        id="register-confirmPassword"
        name="confirmPassword"
        value={userData.confirmPassword}
        onChange={handleChange}
        required
        placeholder="Repite la contraseña"
        disabled={loading}
      />
      <Button type="submit" variant="primary" size="large" disabled={loading} className={styles.submitButton}>
        {loading ? 'Registrando...' : 'Registrarse'}
      </Button>
    </form>
  );
}

export default RegisterForm;