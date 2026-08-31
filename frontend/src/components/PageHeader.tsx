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

const INDUSTRY_BREADCRUMB_LABELS: Record<string, string> = {
  Agriculture: 'Agricultural Filtration Systems',
  Automotive: 'Automotive Filtration Systems',
  'Bus Coach': 'Bus & Coach Filtration Systems',
  Construction: 'Construction Filtration Systems',
  Manufacturing: 'Manufacturing Filtration Systems',
  Marine: 'Marine Filtration Systems',
  Mining: 'Mining Filtration Systems',
  'Oil Gas': 'Oil & Gas Filtration Systems',
  'Power Generation': 'Power Generation Filtration Systems',
  Railway: 'Railway Filtration Systems',
  'Trucks Fleets': 'Truck Fleets Filtration Systems',
  'Waste Municipal': 'Waste & Municipal Filtration Systems',
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

  const industryLabel = currentPage ? INDUSTRY_BREADCRUMB_LABELS[currentPage] : undefined;
  const trail: Breadcrumb[] = [{ label: t('category.home', { defaultValue: 'HOME' }), href: '/' }];

  if (industryLabel) {
    trail.push({ label: 'INDUSTRY', href: '/industries/' });
    trail.push({ label: industryLabel });
  } else {
    if (breadcrumbs) {
      trail.push(...breadcrumbs.map((crumb) => ({ ...crumb, label: localizeLabel(crumb.label) })));
    }

    if (currentPage) {
      trail.push({ label: localizeLabel(currentPage) });
    }
  }

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        position: 'fixed',
        top: '1.5rem',
        left: 'clamp(1.25rem, 6vw, 6rem)',
        right: 'clamp(1.25rem, 6vw, 6rem)',
        zIndex: 50,
        opacity: atTop ? 1 : 0,
        transform: atTop ? 'translateY(0)' : 'translateY(-8px)',
        pointerEvents: atTop ? 'auto' : 'none',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        fontFamily: 'var(--font-display)',
        fontSize: '0.68rem',
        letterSpacing: '0.14em',
        fontWeight: 700,
        textShadow: '0 1px 6px rgba(0,0,0,0.85)',
      }}
    >
      <ol style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        flexWrap: 'wrap',
        minWidth: 0,
      }}>
        {trail.map((crumb, idx) => (
          <li key={`${crumb.label}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
            {crumb.href ? (
              <Link href={crumb.href} style={{
                color: 'rgba(255,255,255,0.62)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }} onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.62)')}>
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" style={{ color: '#FFF12D', overflowWrap: 'anywhere' }}>{crumb.label}</span>
            )}
            {idx < trail.length - 1 && (
              <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>→</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
