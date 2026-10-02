'use client';

import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { localeFromPath } from '@/i18n-locales';
import { applyLanguageInPlace } from '@/lib/apply-language';
import { setLanguagePreference, type SiteLang } from '@/lib/language-preference';
import { HREFLANG, languageHref } from '@/lib/localized-routes';

const OPTIONS: readonly { lang: SiteLang; name: string }[] = [
  { lang: 'en', name: 'English' },
  { lang: 'es', name: 'Español' },
  { lang: 'pt', name: 'Português' },
];

const CSS = `
.ef-lang{position:relative;display:inline-block;font-family:var(--font-display),'Chakra Petch','Arial Narrow',sans-serif}
.ef-lang>summary{list-style:none;display:inline-flex;align-items:center;gap:.4rem;cursor:pointer;color:rgba(255,255,255,.78);font-weight:700;font-size:.74rem;letter-spacing:.1em;padding:.4rem .5rem;min-height:36px;border-radius:2px;user-select:none;-webkit-tap-highlight-color:transparent}
.ef-lang>summary::-webkit-details-marker{display:none}
.ef-lang>summary:hover,.ef-lang[open]>summary{color:#fff12d}
.ef-lang>summary:focus-visible{outline:2px solid #fff12d;outline-offset:2px}
.ef-lang svg{display:block;flex:none}
.ef-lang-list{position:absolute;top:calc(100% + 6px);right:0;z-index:300;min-width:11rem;margin:0;padding:.3rem 0;list-style:none;background:rgba(8,8,8,.98);border:1px solid rgba(255,255,255,.16);box-shadow:0 12px 32px rgba(0,0,0,.55)}
.ef-lang-list a{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.65rem .95rem;color:rgba(255,255,255,.82);text-decoration:none;font-weight:600;font-size:.88rem;letter-spacing:.03em;white-space:nowrap}
.ef-lang-list a:hover{background:rgba(255,241,45,.08);color:#fff}
.ef-lang-list a:focus-visible{outline:2px solid #fff12d;outline-offset:-2px}
.ef-lang-list a[aria-current="true"]{color:#fff12d}
`;

/**
 * Globe menu (English / Español / Português) with plain links, no flags.
 * - Page with a published /es/ and /pt/ version: each option links to that version.
 * - Any other page: the option keeps the English URL and the page is translated in place.
 * The choice is stored (localStorage + cookie) and wins over the country-based detector.
 * Built on <details>, so it opens and navigates without JavaScript.
 */
export function LanguageMenu({ style }: { style?: CSSProperties }) {
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const ref = useRef<HTMLDetailsElement>(null);
  // The language actually on screen. A visitor switched by country to a language outside the
  // menu (fr, it, ...) sees that code, with no option marked.
  const current = localeFromPath(pathname) ?? ((i18n.language || 'en').slice(0, 2).toLowerCase());

  useEffect(() => {
    const close = (refocus = false) => {
      const details = ref.current;
      if (!details?.open) return;
      details.open = false;
      if (refocus) details.querySelector('summary')?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const onSelect = (event: MouseEvent<HTMLAnchorElement>, lang: SiteLang) => {
    setLanguagePreference(lang);
    // Follow the link only when it leads to another URL: the /es/ or /pt/ version of this page,
    // or the English one. On the target URL itself, or on a page with no localized version,
    // stay put and translate in place when the language on screen differs.
    const target = languageHref(pathname, lang);
    const trim = (path: string) => path.replace(/\/+$/, '') || '/';
    if (target && trim(target) !== trim(pathname ?? '/')) return;
    event.preventDefault();
    if (ref.current) ref.current.open = false;
    if (lang !== current) void applyLanguageInPlace(lang);
  };

  return (
    <details
      ref={ref}
      className="ef-lang"
      style={style}
      onBlur={(event) => {
        if (ref.current?.open && !ref.current.contains(event.relatedTarget as Node | null)) ref.current.open = false;
      }}
    >
      <style>{CSS}</style>
      <summary aria-label={t('a11y.language', 'Language')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M2.5 12h19" />
          <path d="M12 2.5c2.6 2.7 3.9 5.9 3.9 9.5s-1.3 6.8-3.9 9.5c-2.6-2.7-3.9-5.9-3.9-9.5s1.3-6.8 3.9-9.5Z" />
        </svg>
        <span aria-hidden="true">{current.toUpperCase()}</span>
      </summary>
      <ul className="ef-lang-list">
        {OPTIONS.map(({ lang, name }) => (
          <li key={lang}>
            <a
              href={languageHref(pathname, lang) ?? pathname ?? '/'}
              hrefLang={HREFLANG[lang]}
              lang={HREFLANG[lang]}
              aria-current={lang === current ? 'true' : undefined}
              onClick={(event) => onSelect(event, lang)}
            >
              <span>{name}</span>
              {lang === current && <span aria-hidden="true">✓</span>}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
