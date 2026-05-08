import React from 'react';
import { FilterChipProps } from '../../types/index';
import styles from './FilterChip.module.css';

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active = false,
  onRemove,
  disabled = false,
  onClick
}) => {
  return (
    <div
      className={`${styles.container} ${active ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
      onClick={!disabled ? onClick : undefined}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={!disabled ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <span className={styles.label}>{label}</span>

      {onRemove && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={styles.removeBtn}
          aria-label={`Remove ${label} filter`}
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default FilterChip;
