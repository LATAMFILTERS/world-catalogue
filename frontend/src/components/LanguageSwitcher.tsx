'use client';

import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { localeFromPath } from '@/i18n-locales';
import { HREFLANG, LOCALIZED_ROUTES, localizedPath, type PageLang } from '@/lib/localized-routes';

const LANGS: readonly { lang: PageLang; label: string; name: string }[] = [
  { lang: 'en', label: 'EN', name: 'English' },
  { lang: 'es', label: 'ES', name: 'Español' },
  { lang: 'pt', label: 'PT', name: 'Português' },
];

const ARIA_LABEL: Record<PageLang, string> = { en: 'Language', es: 'Idioma', pt: 'Idioma' };

/** English route ('/' or '/path', no trailing slash) for the current URL. */
function englishRoute(pathname: string | null): string {
  const stripped = (pathname || '/').replace(/^\/(es|pt)(?=\/|$)/, '').replace(/\/+$/, '');
  return stripped || '/';
}

/**
 * EN / ES / PT switcher for routes that have published /es/ and /pt/ versions.
 * Renders nothing on any other route. Uses plain links (full load) so each language
 * page is served with its own static HTML, lang attribute and metadata.
 */
export function LanguageSwitcher({ style }: { style?: CSSProperties }) {
  const pathname = usePathname();
  const route = englishRoute(pathname);
  if (!LOCALIZED_ROUTES.includes(route)) return null;
  const current: PageLang = localeFromPath(pathname) ?? 'en';

  return (
    <nav aria-label={ARIA_LABEL[current]} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem', fontFamily: 'var(--font-display), Arial Narrow, sans-serif', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.12em', ...style }}>
      {LANGS.map(({ lang, label, name }, index) => (
        <span key={lang} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {index > 0 && <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.3)', padding: '0 0.2rem' }}>/</span>}
          {lang === current ? (
            <span aria-current="page" title={name} style={{ color: '#FFF12D', padding: '0.3rem 0.15rem' }}>{label}</span>
          ) : (
            <a href={localizedPath(route, lang)} hrefLang={HREFLANG[lang]} lang={HREFLANG[lang]} title={name} aria-label={name} style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none', padding: '0.3rem 0.15rem' }}>{label}</a>
          )}
        </span>
      ))}
    </nav>
  );
}
