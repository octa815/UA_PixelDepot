// src/components/Common/Input.js
import React from 'react';
import styles from './Input.module.css';

// type: text, email, password, number, file, etc.
// size: 'small', 'medium', 'large'
function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error, // Mensaje de error a mostrar
  required = false,
  disabled = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  size = 'medium',
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`${styles.inputGroup} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={`${styles.label} ${labelClassName}`}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`${styles.input} ${styles[size]} ${error ? styles.errorInput : ''} ${inputClassName}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;

// También puedes crear componentes específicos como Select, Textarea usando la misma estructura