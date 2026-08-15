'use client';

import { useEffect } from 'react';
import i18n from '@/i18n';
import { detectGeoLanguage } from '@/lib/geoLanguage';

/**
 * Silent geo-language detection — no UI rendered.
 * English is the official/default language. A localized language is applied
 * only after its translation bundle has loaded, preventing partial bilingual
 * rendering while i18next is still fetching resources.
 */
export function LanguageDetector() {
  useEffect(() => {
    let active = true;

    void detectGeoLanguage().then(async ({ language }) => {
      if (!active) return;
      const current = i18n.language?.slice(0, 2) || 'en';
      if (current === language) return;

      try {
        await i18n.loadLanguages(language);
        if (active) await i18n.changeLanguage(language);
      } catch {
        if (active && current !== 'en') await i18n.changeLanguage('en');
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
