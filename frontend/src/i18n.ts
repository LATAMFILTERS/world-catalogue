'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

const SUPPORTED = ['en', 'es', 'pt', 'fr', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'fa'];

function updateHomeCopy() {
  i18n.addResource('en', 'translation', 'home.whyP1', 'ELIMFILTERS® is not a filter company. It is an ');
  i18n.addResource('en', 'translation', 'home.whyP1after', ' company, engineering systems that control contamination, prevent degradation, and protect the value of critical industrial assets.');
}

if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      supportedLngs: SUPPORTED,
      load: 'languageOnly',
      backend: {
        loadPath: '/locales/{{lng}}/translation.json',
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    })
    .then(updateHomeCopy);

  i18n.on('loaded', updateHomeCopy);
} else {
  updateHomeCopy();
}

export default i18n;
export { SUPPORTED };
