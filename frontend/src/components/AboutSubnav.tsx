'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/i18n';

const ITEMS = [
  { href: '/about', en: 'Who We Are', es: 'Quiénes Somos' },
  { href: '/about/leadership', en: 'Leadership', es: 'Liderazgo' },
  { href: '/about/philosophy', en: 'Engineering Philosophy', es: 'Filosofía de Ingeniería' },
];

export function AboutSubnav() {
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const isSpanish = (i18n.resolvedLanguage || i18n.language || '').toLowerCase().startsWith('es');

  return (
    <nav aria-label={isSpanish ? 'Navegación de Acerca de' : 'About navigation'} style={{
      position: 'relative',
      zIndex: 5,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: '#050505',
    }}>
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 clamp(1.25rem, 6vw, 6rem)',
        display: 'flex',
        gap: '0.35rem',
        flexWrap: 'wrap',
      }}>
        {ITEMS.map((item) => {
          const active = item.href === '/about' ? pathname === '/about' || pathname === '/about/' : pathname?.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              color: active ? '#000' : 'rgba(255,255,255,0.75)',
              background: active ? '#FFF12D' : 'transparent',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              textDecoration: 'none',
              fontFamily: 'var(--font-display)',
              fontSize: '0.76rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0.9rem 1rem',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}>
              {isSpanish ? item.es : item.en}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
