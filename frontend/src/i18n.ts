'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import enTranslation from '../public/locales/en/translation.json';

const SUPPORTED = ['en', 'es', 'pt', 'fr', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'fa'];

function updateStrategicCopy() {
  i18n.addResource('en', 'translation', 'home.whyP1', 'ELIMFILTERS® is not a filter company. It is an ');
  i18n.addResource('en', 'translation', 'home.whyP1after', ' company, engineering systems that control contamination, prevent degradation, and protect the value of critical industrial assets.');

  i18n.addResource('en', 'translation', 'home.ctaDealerTag', '// COUNTRY DISTRIBUTION');
  i18n.addResource('en', 'translation', 'home.ctaDealerTitle', 'BUILD ELIMFILTERS');
  i18n.addResource('en', 'translation', 'home.ctaDealerHl', 'IN YOUR COUNTRY.');
  i18n.addResource('en', 'translation', 'home.ctaDealerBtn', 'APPLY FOR COUNTRY DISTRIBUTION');

  i18n.addResource('es', 'translation', 'home.ctaDealerTag', '// DISTRIBUCIÓN POR PAÍS');
  i18n.addResource('es', 'translation', 'home.ctaDealerTitle', 'DESARROLLA ELIMFILTERS');
  i18n.addResource('es', 'translation', 'home.ctaDealerHl', 'EN TU PAÍS.');
  i18n.addResource('es', 'translation', 'home.ctaDealerBtn', 'SOLICITAR DISTRIBUCIÓN NACIONAL');
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
      resources: {
        en: {
          translation: enTranslation,
        },
      },
      partialBundledLanguages: true,
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
    .then(updateStrategicCopy);

  i18n.on('loaded', updateStrategicCopy);
} else {
  updateStrategicCopy();
}

export default i18n;
export { SUPPORTED };
