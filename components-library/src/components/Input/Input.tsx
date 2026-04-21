import React from 'react';
import { InputProps } from '../../types/index';
import styles from './Input.module.css';

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  size = 'md',
  disabled = false,
  ...props
}) => {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}

      <div className={`${styles.container} ${size ? styles[size] : ''}`}>
        {icon && <span className={styles.iconLeft}>{icon}</span>}

        <input
          className={`${styles.input} ${error ? styles.error : ''} ${disabled ? styles.disabled : ''}`}
          disabled={disabled}
          {...props}
        />
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default Input;
