// src/components/Auth/LoginForm.js
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';
import Input from '../Common/Input';
import Button from '../Common/Button';

function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();


  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError(''); // Limpia errores al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(credentials);
      // ¡CAMBIO AQUÍ! Redirige siempre a la página principal '/'
      navigate('/');
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || err.error || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={`message error ${styles.errorMessage}`}>{error}</p>}
      <Input
        label="Email"
        type="email"
        id="login-email"
        name="email"
        value={credentials.email}
        onChange={handleChange}
        required
        placeholder="tu@email.com"
        disabled={loading}
      />
      <Input
        label="Contraseña"
        type="password"
        id="login-password"
        name="password"
        value={credentials.password}
        onChange={handleChange}
        required
        placeholder="Tu contraseña"
        disabled={loading}
      />
      <Button type="submit" variant="primary" size="large" disabled={loading} className={styles.submitButton}>
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
}

export default LoginForm;