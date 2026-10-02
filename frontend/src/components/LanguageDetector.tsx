'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import i18n from '@/i18n';
import { localeFromPath } from '@/i18n-locales';
import { applyLanguageInPlace } from '@/lib/apply-language';
import { detectGeoLanguage } from '@/lib/geoLanguage';
import { getLanguagePreference, setLanguagePreference, siteLangFromTag, type SiteLang } from '@/lib/language-preference';
import { languageHref } from '@/lib/localized-routes';

type Suggestable = Exclude<SiteLang, 'en'>;

const SUGGESTION: Record<Suggestable, { tag: string; label: string; question: string; accept: string; decline: string }> = {
  es: { tag: 'es', label: 'Idioma', question: '¿Prefiere ver esta página en español?', accept: 'Ver en español', decline: 'No, gracias' },
  pt: { tag: 'pt-BR', label: 'Idioma', question: 'Prefere ver esta página em português?', accept: 'Ver em português', decline: 'Não, obrigado' },
};

/**
 * Language policy on English URLs (never rendered on /es/ or /pt/ routes):
 *  1. A stored manual choice always wins: it is applied (redirect to the /es/ or /pt/ version of
 *     the page when one exists, otherwise the page is translated in place) and geolocation is
 *     not consulted.
 *  2. With no stored choice the page stays in English. If the visitor's country suggests Spanish
 *     or Portuguese we only offer the switch; answering either way is stored as the choice.
 */
export function LanguageDetector() {
  const pathname = usePathname();
  const [suggestion, setSuggestion] = useState<Suggestable | null>(null);

  useEffect(() => {
    if (localeFromPath(pathname)) return;
    let active = true;

    const preference = getLanguagePreference();
    if (preference) {
      const target = preference === 'en' ? null : languageHref(pathname, preference);
      if (target) {
        window.location.replace(`${target}${window.location.search}${window.location.hash}`);
      } else if (siteLangFromTag(i18n.language) !== preference) {
        void applyLanguageInPlace(preference);
      }
      return;
    }

    void detectGeoLanguage().then(({ language }) => {
      if (active && (language === 'es' || language === 'pt')) setSuggestion(language);
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  if (!suggestion || localeFromPath(pathname)) return null;
  const copy = SUGGESTION[suggestion];

  const choose = (lang: SiteLang) => {
    setLanguagePreference(lang);
    setSuggestion(null);
    const target = lang === 'en' ? null : languageHref(pathname, lang);
    if (target) window.location.assign(`${target}${window.location.search}${window.location.hash}`);
    else if (lang !== 'en') void applyLanguageInPlace(lang);
  };

  const button = { font: '700 0.74rem/1 var(--font-display), "Chakra Petch", Arial, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '0.7rem 1rem', cursor: 'pointer', minHeight: 40 };

  return (
    <section
      role="region"
      aria-label={copy.label}
      lang={copy.tag}
      style={{ position: 'fixed', top: 'calc(5rem + env(safe-area-inset-top, 0px))', right: '1rem', zIndex: 45, width: 'min(22rem, calc(100vw - 2rem))', background: 'rgba(8,8,8,0.98)', border: '1px solid rgba(255,241,45,0.35)', boxShadow: '0 14px 36px rgba(0,0,0,0.55)', padding: '1rem 1.1rem', color: '#fff', fontFamily: 'var(--font-body), Barlow, Arial, sans-serif' }}
    >
      <p style={{ margin: '0 0 0.85rem', fontSize: '1rem', lineHeight: 1.45, fontWeight: 600 }}>{copy.question}</p>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => choose(suggestion)} style={{ ...button, background: '#FFF12D', color: '#000', border: '1px solid #FFF12D' }}>{copy.accept}</button>
        <button type="button" onClick={() => choose('en')} style={{ ...button, background: 'transparent', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.22)' }}>{copy.decline}</button>
      </div>
    </section>
  );
}
