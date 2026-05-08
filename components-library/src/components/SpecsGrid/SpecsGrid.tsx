import React from 'react';
import { SpecsGridProps } from '../../types/index';
import styles from './SpecsGrid.module.css';

export const SpecsGrid: React.FC<SpecsGridProps> = ({
  items,
  columns = 2
}) => {
  if (items.length === 0) return null;

  return (
    <div className={`${styles.grid} ${styles[`cols-${columns}`]}`}>
      {items.map((item, i) => (
        <div key={i} className={styles.item}>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.value}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default SpecsGrid;
