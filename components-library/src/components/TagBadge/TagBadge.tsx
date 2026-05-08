import React from 'react';
import { TagBadgeProps } from '../../types/index';
import styles from './TagBadge.module.css';

export const TagBadge: React.FC<TagBadgeProps> = ({
  label,
  color = 'primary',
  size = 'md',
  variant = 'filled'
}) => {
  const colorClass = color === 'gold' ? 'primary' : color;
  const variantClass = variant === 'filled' ? styles.filled : styles.outline;

  return (
    <span className={`${styles.container} ${styles[size]} ${styles[colorClass]} ${variantClass}`}>
      {label}
    </span>
  );
};

export default TagBadge;
