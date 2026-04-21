import React from 'react';
import { ResultCardProps } from '../../types/index';
import styles from './ResultCard.module.css';

export const ResultCard: React.FC<ResultCardProps> = ({
  sku,
  title,
  tags = [],
  specs = [],
  onClick
}) => {
  return (
    <div
      className={styles.container}
      onClick={onClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className={styles.header}>
        <span className={styles.sku}>{sku}</span>
        <h3 className={styles.title}>{title}</h3>
      </div>

      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag, i) => (
            <span key={i} className={`${styles.tag} ${styles[`tag-${tag.color}`]}`}>
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {specs.length > 0 && (
        <div className={styles.specsGrid}>
          {specs.map((spec, i) => (
            <div key={i} className={styles.specItem}>
              <span className={styles.specLabel}>{spec.label}</span>
              <span className={styles.specValue}>{spec.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
