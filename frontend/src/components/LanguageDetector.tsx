'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import i18n from '@/i18n';
import { localeFromPath } from '@/i18n-locales';
import { applyLanguageInPlace } from '@/lib/apply-language';
import { detectGeoLanguage, GEO_AUTO_LANGUAGES } from '@/lib/geoLanguage';
import { getLanguagePreference, siteLangFromTag } from '@/lib/language-preference';
import { languageHref } from '@/lib/localized-routes';

/**
 * Language policy on English URLs. Renders nothing, and does nothing on /es/ or /pt/ routes.
 *  1. A stored manual choice (globe menu) always wins: it is applied (redirect to the /es/ or
 *     /pt/ version of the page when one exists, otherwise the page is translated in place) and
 *     geolocation is not consulted.
 *  2. With no stored choice, the visitor's country picks the language, but only among
 *     GEO_AUTO_LANGUAGES (es, pt); any other country stays in English. A choice made while
 *     the country lookup is still in flight wins over its result.
 */
export function LanguageDetector() {
  const pathname = usePathname();

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

    void detectGeoLanguage().then(async ({ language }) => {
      const current = i18n.language?.slice(0, 2) || 'en';
      if (!active || !GEO_AUTO_LANGUAGES.includes(language) || current === language || getLanguagePreference()) return;

      try {
        await i18n.loadLanguages(language);
        if (active && !getLanguagePreference()) await i18n.changeLanguage(language);
      } catch {
        if (active && current !== 'en' && !getLanguagePreference()) await i18n.changeLanguage('en');
      }
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
}
