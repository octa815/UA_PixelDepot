// src/components/Common/Button.js
import React from 'react';
import styles from './Button.module.css';

// variant: 'primary', 'secondary', 'danger', 'ghost'
// size: 'small', 'medium', 'large'
function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '', // Para añadir clases adicionales
  ...props // Resto de props como aria-label, etc.
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;