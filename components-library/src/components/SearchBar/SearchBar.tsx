import React from 'react';
import { SearchBarProps } from '../../types/index';
import styles from './SearchBar.module.css';

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search filters...',
  onClear,
  disabled = false,
  ariaLabel = 'Search filters'
}) => {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <span className={styles.icon} aria-hidden="true">
        🔍
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
        disabled={disabled}
        aria-label={ariaLabel}
      />

      {value && !disabled && (
        <button
          onClick={handleClear}
          className={styles.clearBtn}
          aria-label="Clear search"
          type="button"
          tabIndex={0}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
