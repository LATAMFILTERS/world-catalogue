'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const SCROLL_HIDE_THRESHOLD = 60;

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: Breadcrumb[];
  currentPage?: string;
}

const PAGE_KEYS: Record<string, string> = {
  contact: 'nav.contact',
  about: 'nav.about',
  industries: 'nav.industries',
  systems: 'nav.systems',
  technologies: 'nav.technologies',
  distributors: 'nav.distributors',
};

export function PageHeader({ breadcrumbs, currentPage }: PageHeaderProps) {
  const { t } = useTranslation();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < SCROLL_HIDE_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const localizeLabel = (label: string) => {
    const key = PAGE_KEYS[label.trim().toLowerCase()];
    return key ? t(key, { defaultValue: label }) : label;
  };

  const trail: Breadcrumb[] = [{ label: t('category.home', { defaultValue: 'HOME' }), href: '/' }];

  if (breadcrumbs) {
    trail.push(...breadcrumbs.map((crumb) => ({ ...crumb, label: localizeLabel(crumb.label) })));
  }

  if (currentPage) {
    trail.push({ label: localizeLabel(currentPage) });
  }

  return (
    <div style={{
      position: 'fixed',
      top: '1.5rem',
      left: 'clamp(1.25rem, 6vw, 6rem)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      gap: '0.45rem',
      flexWrap: 'nowrap',
      opacity: atTop ? 1 : 0,
      transform: atTop ? 'translateY(0)' : 'translateY(-8px)',
      pointerEvents: atTop ? 'auto' : 'none',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
      fontFamily: 'var(--font-display)',
      fontSize: '0.68rem',
      letterSpacing: '0.14em',
      fontWeight: 700,
      textShadow: '0 1px 6px rgba(0,0,0,0.85)',
    }}>
      {trail.map((crumb, idx) => (
        <div key={`${crumb.label}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {crumb.href ? (
            <Link href={crumb.href} style={{
              color: 'rgba(255,255,255,0.62)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }} onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.62)')}>
              {crumb.label}
            </Link>
          ) : (
            <span style={{ color: '#FFF12D' }}>{crumb.label}</span>
          )}
          {idx < trail.length - 1 && (
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>→</span>
          )}
        </div>
      ))}
    </div>
  );
}
