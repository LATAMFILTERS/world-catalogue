'use client';

import { useTranslation } from 'react-i18next';
import styles from './AboutIndustrialTheme.module.css';
import '@/i18n';

const ITEMS = [
  { href: '/about/#who-we-are', en: 'Who We Are', es: 'Quiénes Somos' },
  { href: '/about/leadership/', en: 'Leadership', es: 'Liderazgo' },
  { href: '/about/#engineering-philosophy', en: 'Engineering Philosophy', es: 'Filosofía de Ingeniería' },
];

export function AboutSubnav() {
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');

  return (
    <nav
      className={styles.aboutIndustrialNav}
      aria-label={isSpanish ? 'Navegación interna de Acerca de' : 'About internal navigation'}
      style={{
        position: 'relative',
        zIndex: 5,
        borderBottom: '1px solid #deded9',
        background: '#ffffff',
      }}
    >
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 clamp(1.25rem, 6vw, 6rem)',
        display: 'flex',
        gap: '0.35rem',
        flexWrap: 'wrap',
      }}>
        {ITEMS.map((item) => (
          <a key={item.href} href={item.href} style={{
            color: '#292925',
            background: 'transparent',
            borderLeft: '1px solid #e4e4df',
            borderRight: '1px solid #e4e4df',
            textDecoration: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '0.76rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '0.9rem 1rem',
          }}>
            {isSpanish ? item.es : item.en}
          </a>
        ))}
      </div>
    </nav>
  );
}
