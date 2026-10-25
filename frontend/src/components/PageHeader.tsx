'use client';
import { reviewedCopyKey } from '@/lib/reviewed-copy-key';

import Link from '@/components/LocalizedLink';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import { localeFromPath } from '@/i18n-locales';
import { siteLangFromTag } from '@/lib/language-preference';
import { LanguageMenu } from './LanguageMenu';

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
  Automotive: 'Automotive',
  'Bus Coach': 'Bus & Coach',
  Construction: 'Construction Filtration Systems',
  Manufacturing: 'Manufacturing',
  Marine: 'Marine Filtration Systems',
  Mining: 'Mining Filtration Systems',
  'Oil Gas': 'Oil & Gas Filtration Systems',
  'Power Generation': 'Power Generation Filtration Systems',
  Railway: 'Railway',
  'Trucks Fleets': 'Trucks & Fleets',
  'Waste Municipal': 'Waste & Municipal',
};

const INDUSTRY_TRANSLATED_LABELS: Record<'es' | 'pt', Record<string, string>> = {
  es: {
    Agriculture: 'Agricultura',
    Automotive: 'Automotriz',
    'Bus Coach': 'Autobuses',
    Construction: 'Construcción',
    Manufacturing: 'Manufactura',
    Marine: 'Marina',
    Mining: 'Minería',
    'Oil Gas': 'Petróleo y gas',
    'Power Generation': 'Generación eléctrica',
    Railway: 'Ferrocarriles',
    'Trucks Fleets': 'Camiones y flotas',
    'Waste Municipal': 'Residuos y servicios municipales',
  },
  pt: {
    Agriculture: 'Sistemas de filtração agrícola',
    Automotive: 'Automotivo',
    'Bus Coach': 'Ônibus e rodoviários',
    Construction: 'Construção',
    Manufacturing: 'Manufatura',
    Marine: 'Marítimo',
    Mining: 'Sistemas de filtração para mineração',
    'Oil Gas': 'Petróleo e gás',
    'Power Generation': 'Geração de energia',
    Railway: 'Ferrovias',
    'Trucks Fleets': 'Caminhões e frotas',
    'Waste Municipal': 'Resíduos e serviços municipais',
  },
};

export function PageHeader({ breadcrumbs, currentPage }: PageHeaderProps) {
  const { t, i18n } = useTranslation();
  const language = siteLangFromTag(i18n.resolvedLanguage || i18n.language);
  const locale = localeFromPath(usePathname()) ?? (language === 'en' ? null : language);
  const homeHref = locale ? `/${locale}/` : '/';
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < SCROLL_HIDE_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const localizeLabel = (label: string) => {
    const key = PAGE_KEYS[label.trim().toLowerCase()];
    return t(key ?? reviewedCopyKey(label), { defaultValue: label });
  };

  const industryLabel = currentPage ? INDUSTRY_BREADCRUMB_LABELS[currentPage] : undefined;
  const trail: Breadcrumb[] = [{ label: t('category.home', { defaultValue: 'HOME' }), href: homeHref }];

  if (industryLabel) {
    trail.push({ label: locale === 'es' ? 'Industrias' : locale === 'pt' ? 'Indústrias' : 'Industries', href: locale ? `/${locale}/industries/` : '/industries/' });
    trail.push({ label: (locale === 'es' || locale === 'pt') && currentPage ? INDUSTRY_TRANSLATED_LABELS[locale][currentPage] ?? industryLabel : industryLabel });
  } else {
    if (breadcrumbs) {
      trail.push(...breadcrumbs.map((crumb) => ({ ...crumb, label: localizeLabel(crumb.label) })));
    }

    if (currentPage) {
      trail.push({ label: localizeLabel(currentPage) });
    }
  }

  return (
    <>
    <div style={{ position: 'fixed', top: 'calc(1rem + env(safe-area-inset-top, 0px))', right: 'clamp(0.75rem, 4vw, 4rem)', zIndex: 51, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '0 0.2rem' }}>
      <LanguageMenu />
    </div>
    <nav
      aria-label={t('a11y.breadcrumb', 'Breadcrumb')}
      style={{
        position: 'fixed',
        top: '1.5rem',
        left: 'clamp(1.25rem, 6vw, 6rem)',
        right: 'calc(clamp(0.75rem, 4vw, 4rem) + 5.5rem)',
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
    </>
  );
}
