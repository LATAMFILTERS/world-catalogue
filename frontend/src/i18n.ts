'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import enTranslation from '../public/locales/en/translation.json';

const SUPPORTED = ['en', 'es', 'pt', 'fr', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'fa'];

function updateStrategicCopy() {
  // Corporate positioning — governed by docs/brand/CLAIM_REGISTRY.md.
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

  // Default-locale evidence policy. These overrides intentionally replace
  // legacy quantitative or absolute marketing claims that are not present in
  // the approved Claim Registry. They keep the public SSR/crawler surface
  // aligned with governed engineering language without mutating archived copy.
  i18n.addResource('en', 'translation', 'problem.badge', 'Contamination can accelerate premature component wear and equipment degradation.');
  i18n.addResource('en', 'translation', 'problem.items.bearing.desc', 'Contaminated lubricant can accelerate abrasive wear on bearings and other lubricated surfaces.');
  i18n.addResource('en', 'translation', 'problem.items.fuel.desc', 'Fuel-system contamination and restriction can reduce combustion-system reliability and operating efficiency.');

  i18n.addResource('en', 'translation', 'why.p2', 'Every protection decision should be evaluated against the value, duty cycle, contamination exposure, and reliability requirements of the protected asset.');
  i18n.addResource('en', 'translation', 'why.card.items.0', 'System-level contamination control');
  i18n.addResource('en', 'translation', 'why.card.items.1', 'Application-governed protection architecture');
  i18n.addResource('en', 'translation', 'why.card.items.2', 'International engineering standards as technical references');
  i18n.addResource('en', 'translation', 'why.card.items.3', 'Canonical equipment and application relationships');

  i18n.addResource('en', 'translation', 'technology.items.media.title', 'Engineered Filtration Media');
  i18n.addResource('en', 'translation', 'technology.items.media.desc', 'Media selection is governed by the protected system, contamination profile, flow requirements, pressure drop, capacity, and service conditions.');
  i18n.addResource('en', 'translation', 'technology.items.hydrophobic.title', 'Fuel Contamination Control');
  i18n.addResource('en', 'translation', 'technology.items.hydrophobic.desc', 'Fuel protection combines particulate control and, where the approved application requires it, dedicated fuel-water separation architecture.');
  i18n.addResource('en', 'translation', 'technology.items.antibypass.title', 'Sealing and Housing Integrity');
  i18n.addResource('en', 'translation', 'technology.items.antibypass.desc', 'Housing geometry, element retention, seal loading, and installation integrity help preserve the protected contamination boundary.');

  i18n.addResource('en', 'translation', 'category.readyDesc', 'Find the correct filtration component for the equipment, application, and protected system.');
  i18n.addResource('en', 'translation', 'category.engineeringDesc', 'ELIMFILTERS engineering aligns filtration selection with the protected system, contamination risk, applicable technical references, and operating duty cycle.');

  i18n.addResource('en', 'translation', 'home.economicStats.0.value', 'DOWNTIME');
  i18n.addResource('en', 'translation', 'home.economicStats.0.label', 'Unplanned equipment stops create operational and maintenance costs.');
  i18n.addResource('en', 'translation', 'home.economicStats.1.value', 'CONTAMINATION');
  i18n.addResource('en', 'translation', 'home.economicStats.1.label', 'Particles, water, heat, and degradation products can accelerate component wear.');
  i18n.addResource('en', 'translation', 'home.economicStats.2.value', 'RELIABILITY');
  i18n.addResource('en', 'translation', 'home.economicStats.2.label', 'Contamination control supports equipment reliability and service continuity.');

  i18n.addResource('en', 'translation', 'home.problemIntro', 'Contamination can act at critical component interfaces and accelerate wear in engines, fuel systems, lubrication circuits, and hydraulic equipment.');
  i18n.addResource('en', 'translation', 'home.problemBadgeNum', 'RISK');
  i18n.addResource('en', 'translation', 'home.problemBadgeDesc', 'Contamination is a controllable contributor to premature equipment degradation.');
  i18n.addResource('en', 'translation', 'home.failModes.1.desc', 'Contaminated lubricant can accelerate metal wear and reduce the protection provided by the lubricant film.');
  i18n.addResource('en', 'translation', 'home.failModes.2.desc', 'Fuel contamination and restriction can interfere with precision fuel-system operation and combustion performance.');

  i18n.addResource('en', 'translation', 'home.whyP2', 'Every ELIMFILTERS technology addresses a defined contamination-control function within a protected system. The objective is equipment reliability and asset protection, not unsupported universal performance claims.');
  i18n.addResource('en', 'translation', 'home.whyCheckItems.1', 'Engineering focused on high-value industrial assets');
  i18n.addResource('en', 'translation', 'home.whyCheckItems.2', 'Technical references include ISO 5011, ISO 16889, ISO 19438, and ISO 4406 where applicable');
  i18n.addResource('en', 'translation', 'home.whyCheckItems.3', 'Protection architecture organized across ELIMFILTERS industrial application domains');

  i18n.addResource('en', 'translation', 'home.whyCardItems.0', 'System-level contamination control');
  i18n.addResource('en', 'translation', 'home.whyCardItems.1', 'Canonical protection technology architecture');
  i18n.addResource('en', 'translation', 'home.whyCardItems.2', 'Source-backed engineering knowledge');
  i18n.addResource('en', 'translation', 'home.whyCardItems.3', 'Application-focused technical support');

  i18n.addResource('en', 'translation', 'home.techItems.0.title', 'Contamination Control Architecture');
  i18n.addResource('en', 'translation', 'home.techItems.0.desc', 'Filtration architecture is selected around the protected system, contamination profile, flow requirements, capacity, and operating conditions.');
  i18n.addResource('en', 'translation', 'home.techItems.1.title', 'System-Level Protection');
  i18n.addResource('en', 'translation', 'home.techItems.1.desc', 'Air, fuel, lubrication, hydraulic, cooling, cabin, and pneumatic protection functions are mapped to their approved ELIMFILTERS technologies.');
  i18n.addResource('en', 'translation', 'home.techItems.2.title', 'Application-Governed Selection');
  i18n.addResource('en', 'translation', 'home.techItems.2.desc', 'Technology and component selection must remain consistent with the equipment, application, operating duty, and available technical evidence.');

  i18n.addResource('en', 'translation', 'home.sciDesc', 'The ELIMFILTERS Knowledge Center references international filtration, cleanliness, and test standards as technical frameworks where they are applicable to a protected system or engineering topic.');
  i18n.addResource('en', 'translation', 'home.llmP1', 'Industrial asset protection is a system-level engineering approach to identifying and controlling contamination sources that degrade mechanical equipment. Particles, water, heat, and degradation products can contribute to wear and reliability loss across engines, hydraulic systems, fuel circuits, lubrication systems, cooling systems, and operator environments.');
  i18n.addResource('en', 'translation', 'home.llmP2', 'Contamination can accelerate wear at critical clearances and surfaces. Particle contamination can affect bearings, valve spools, and injector components; water can affect fuel-system reliability; and degraded fluid condition can reduce the stability of hydraulic, lubrication, and cooling systems. The applicable cleanliness target and control method depend on the protected component and operating duty.');
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
