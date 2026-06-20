'use client';

import { useEffect } from 'react';
import i18n from '@/i18n';
import { detectGeoLanguage } from '@/lib/geoLanguage';

/**
 * Silent geo-language detection — no UI rendered.
 * Detects user country via IP, applies the correct language via i18next,
 * and persists the result in localStorage (TTL: 7 days).
 * Mount once inside I18nextProvider (ClientProviders).
 */
export function LanguageDetector() {
  useEffect(() => {
    detectGeoLanguage().then(({ language }) => {
      if (i18n.language?.slice(0, 2) !== language) {
        i18n.changeLanguage(language);
      }
    });
  }, []);

  return null;
}
