'use client';

import { createInstance } from 'i18next';
import esTranslation from '../public/locales/es/translation.json';
import { GOVERNED_ES_OVERRIDES, governedEnTranslation, setNestedValue } from './i18n';

// Dedicated, synchronously initialised Spanish instance for the published /es/ routes,
// so their static HTML is rendered in Spanish (the global instance stays English and
// keeps its runtime geo switching for every other route).
const governedEsTranslation = JSON.parse(JSON.stringify(esTranslation)) as Record<string, unknown>;
for (const [key, value] of Object.entries(GOVERNED_ES_OVERRIDES)) {
  setNestedValue(governedEsTranslation, key, value);
}

const i18nEs = createInstance();
void i18nEs.init({
  lng: 'es',
  fallbackLng: 'en',
  supportedLngs: ['es', 'en'],
  resources: {
    es: { translation: governedEsTranslation },
    en: { translation: governedEnTranslation },
  },
  initAsync: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export const isSpanishPath = (pathname: string | null | undefined) =>
  pathname === '/es' || Boolean(pathname?.startsWith('/es/'));

export default i18nEs;
