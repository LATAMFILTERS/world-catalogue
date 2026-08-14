'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import enTranslation from '../public/locales/en/translation.json';

const SUPPORTED = ['en', 'es', 'pt', 'fr', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'fa'];

type TranslationTree = Record<string, unknown>;

const GOVERNED_EN_OVERRIDES: Record<string, string> = {
  // Corporate positioning — governed by docs/brand/CLAIM_REGISTRY.md.
  'home.whyP1': 'ELIMFILTERS® is not a filter company. It is an ',
  'home.whyP1after': ' company, engineering systems that control contamination, prevent degradation, and protect the value of critical industrial assets.',
  'home.ctaDealerTag': '// COUNTRY DISTRIBUTION',
  'home.ctaDealerTitle': 'BUILD ELIMFILTERS',
  'home.ctaDealerHl': 'IN YOUR COUNTRY.',
  'home.ctaDealerBtn': 'APPLY FOR COUNTRY DISTRIBUTION',

  // Legacy/default-locale copy that previously exposed unsupported quantitative,
  // certification, absolute-performance, or testimonial-style claims.
  'problem.badge': 'Contamination can accelerate premature component wear and equipment degradation.',
  'problem.items.bearing.desc': 'Contaminated lubricant can accelerate abrasive wear on bearings and other lubricated surfaces.',
  'problem.items.fuel.desc': 'Fuel-system contamination and restriction can reduce combustion-system reliability and operating efficiency.',
  'why.p2': 'Every protection decision should be evaluated against the value, duty cycle, contamination exposure, and reliability requirements of the protected asset.',
  'why.card.items.0': 'System-level contamination control',
  'why.card.items.1': 'Application-governed protection architecture',
  'why.card.items.2': 'International engineering standards as technical references',
  'why.card.items.3': 'Canonical equipment and application relationships',
  'technology.items.media.title': 'Engineered Filtration Media',
  'technology.items.media.desc': 'Media selection is governed by the protected system, contamination profile, flow requirements, pressure drop, capacity, and service conditions.',
  'technology.items.hydrophobic.title': 'Fuel Contamination Control',
  'technology.items.hydrophobic.desc': 'Fuel protection combines particulate control and, where the approved application requires it, dedicated fuel-water separation architecture.',
  'technology.items.antibypass.title': 'Sealing and Housing Integrity',
  'technology.items.antibypass.desc': 'Housing geometry, element retention, seal loading, and installation integrity help preserve the protected contamination boundary.',
  'category.readyDesc': 'Find the correct filtration component for the equipment, application, and protected system.',
  'category.engineeringDesc': 'ELIMFILTERS engineering aligns filtration selection with the protected system, contamination risk, applicable technical references, and operating duty cycle.',

  'home.economicStats.0.value': 'DOWNTIME',
  'home.economicStats.0.label': 'Unplanned equipment stops create operational and maintenance costs.',
  'home.economicStats.1.value': 'CONTAMINATION',
  'home.economicStats.1.label': 'Particles, water, heat, and degradation products can accelerate component wear.',
  'home.economicStats.2.value': 'RELIABILITY',
  'home.economicStats.2.label': 'Contamination control supports equipment reliability and service continuity.',
  'home.problemIntro': 'Contamination can act at critical component interfaces and accelerate wear in engines, fuel systems, lubrication circuits, and hydraulic equipment.',
  'home.problemBadgeNum': 'RISK',
  'home.problemBadgeDesc': 'Contamination is a controllable contributor to premature equipment degradation.',
  'home.failModes.1.desc': 'Contaminated lubricant can accelerate metal wear and reduce the protection provided by the lubricant film.',
  'home.failModes.2.desc': 'Fuel contamination and restriction can interfere with precision fuel-system operation and combustion performance.',
  'home.whyP2': 'Every ELIMFILTERS technology addresses a defined contamination-control function within a protected system. The objective is equipment reliability and asset protection, not unsupported universal performance claims.',
  'home.whyCheckItems.1': 'Engineering focused on high-value industrial assets',
  'home.whyCheckItems.2': 'Technical references include ISO 5011, ISO 16889, ISO 19438, and ISO 4406 where applicable',
  'home.whyCheckItems.3': 'Protection architecture organized across ELIMFILTERS industrial application domains',
  'home.whyCardItems.0': 'System-level contamination control',
  'home.whyCardItems.1': 'Canonical protection technology architecture',
  'home.whyCardItems.2': 'Source-backed engineering knowledge',
  'home.whyCardItems.3': 'Application-focused technical support',
  'home.techItems.0.title': 'Contamination Control Architecture',
  'home.techItems.0.desc': 'Filtration architecture is selected around the protected system, contamination profile, flow requirements, capacity, and operating conditions.',
  'home.techItems.1.title': 'System-Level Protection',
  'home.techItems.1.desc': 'Air, fuel, lubrication, hydraulic, cooling, cabin, and pneumatic protection functions are mapped to their approved ELIMFILTERS technologies.',
  'home.techItems.2.title': 'Application-Governed Selection',
  'home.techItems.2.desc': 'Technology and component selection must remain consistent with the equipment, application, operating duty, and available technical evidence.',
  'home.sciDesc': 'The ELIMFILTERS Knowledge Center references international filtration, cleanliness, and test standards as technical frameworks where they are applicable to a protected system or engineering topic.',
  'home.llmP1': 'Industrial asset protection is a system-level engineering approach to identifying and controlling contamination sources that degrade mechanical equipment. Particles, water, heat, and degradation products can contribute to wear and reliability loss across engines, hydraulic systems, fuel circuits, lubrication systems, cooling systems, and operator environments.',
  'home.llmP2': 'Contamination can accelerate wear at critical clearances and surfaces. Particle contamination can affect bearings, valve spools, and injector components; water can affect fuel-system reliability; and degraded fluid condition can reduce the stability of hydraulic, lubrication, and cooling systems. The applicable cleanliness target and control method depend on the protected component and operating duty.',
};

function cloneTranslation<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function setNestedValue(root: TranslationTree, dottedKey: string, value: string) {
  const parts = dottedKey.split('.');
  let cursor: unknown = root;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const segment = parts[index];
    const next = parts[index + 1];
    const isArrayIndex = /^\d+$/.test(next);

    if (Array.isArray(cursor)) {
      const numericIndex = Number(segment);
      if (cursor[numericIndex] === undefined) cursor[numericIndex] = isArrayIndex ? [] : {};
      cursor = cursor[numericIndex];
      continue;
    }

    if (!cursor || typeof cursor !== 'object') {
      throw new Error(`Cannot apply governed translation override at ${dottedKey}`);
    }

    const objectCursor = cursor as Record<string, unknown>;
    if (objectCursor[segment] === undefined) objectCursor[segment] = isArrayIndex ? [] : {};
    cursor = objectCursor[segment];
  }

  const leaf = parts[parts.length - 1];
  if (Array.isArray(cursor)) {
    cursor[Number(leaf)] = value;
    return;
  }

  if (!cursor || typeof cursor !== 'object') {
    throw new Error(`Cannot apply governed translation override at ${dottedKey}`);
  }
  (cursor as Record<string, unknown>)[leaf] = value;
}

const governedEnTranslation = cloneTranslation(enTranslation) as TranslationTree;
for (const [key, value] of Object.entries(GOVERNED_EN_OVERRIDES)) {
  setNestedValue(governedEnTranslation, key, value);
}

function applyRuntimeGovernance() {
  for (const [key, value] of Object.entries(GOVERNED_EN_OVERRIDES)) {
    i18n.addResource('en', 'translation', key, value);
  }

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
          translation: governedEnTranslation,
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
    .then(applyRuntimeGovernance);

  i18n.on('loaded', applyRuntimeGovernance);
} else {
  applyRuntimeGovernance();
}

export default i18n;
export { SUPPORTED };
