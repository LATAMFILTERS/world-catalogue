'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

const SUPPORTED = ['en', 'es', 'fr', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'fa'];

if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: SUPPORTED,
      nonExplicitSupportedLngs: true,
      load: 'languageOnly',
      backend: {
        loadPath: '/locales/{{lng}}/translation.json',
      },
      detection: {
        order: ['localStorage'],
        caches: ['localStorage'],
        lookupLocalStorage: 'elimfilters_lang',
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
export { SUPPORTED };
