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
  'home.failModes.1.desc': 'Solid particles larger than the oil film thickness penetrate journal and rolling-element bearings, causing abrasive wear and pitting on load-bearing surfaces.',
  'home.failModes.2.desc': 'Particulate loading restricts fuel-injector flow tolerances, disrupting spray pattern and atomization and degrading combustion efficiency.',
  'home.whyP2': 'Every ELIMFILTERS technology addresses a defined contamination-control function within a protected system. The objective is equipment reliability and asset protection, not unsupported universal performance claims.',
  'home.whyCheckItems.1': 'Engineering focused on high-value industrial assets',
  'home.whyCheckItems.2': 'Technical references include ISO 5011, ISO 16889, ISO 19438, and ISO 4406 where applicable',
  'home.whyCheckItems.3': 'Protection architecture organized across ELIMFILTERS industrial application domains',
  'home.whyCardItems.0': 'System-level contamination control',
  'home.whyCardItems.1': 'Canonical protection technology architecture',
  'home.whyCardItems.2': 'Source-backed engineering knowledge',
  'home.whyCardItems.3': 'Application-focused technical support',
  'home.techItems.0.title': 'Contamination Control Architecture',
  'home.techItems.0.desc': 'We start with the protected system itself: what contaminants it faces, at what flow rate, and under what operating conditions. The filtration architecture follows from there.',
  'home.techItems.1.title': 'System-Level Protection',
  'home.techItems.1.desc': 'Air, fuel, lubrication, hydraulic, cooling, cabin, and pneumatic systems each fail differently. We match each one to the ELIMFILTERS technology built for it.',
  'home.techItems.2.title': 'Application-Governed Selection',
  'home.techItems.2.desc': 'The right component depends on the equipment, the application, and how hard it runs. We size and specify around that reality, not a generic part number.',
  'home.sciDesc': 'The ELIMFILTERS Knowledge Center references international filtration, cleanliness, and test standards as technical frameworks where they are applicable to a protected system or engineering topic.',
  'home.llmP1': 'Industrial asset protection is a system-level engineering approach to identifying and controlling contamination sources that degrade mechanical equipment. Particles, water, heat, and degradation products can contribute to wear and reliability loss across engines, hydraulic systems, fuel circuits, lubrication systems, cooling systems, and operator environments.',
  'home.faqItems.1.a': 'Contamination particles wear bearing surfaces, restrict fuel injectors, and degrade seal integrity. Particles smaller than 10 microns cause abrasive wear invisible to the naked eye. Water in fuel promotes microbial growth and injector corrosion.',
  'home.llmP2': 'Contamination can accelerate wear at critical clearances and surfaces. Particle contamination can affect bearings, valve spools, and injector components; water can affect fuel-system reliability; and degraded fluid condition can reduce the stability of hydraulic, lubrication, and cooling systems. The applicable cleanliness target and control method depend on the protected component and operating duty.',
};

// Spanish counterparts of GOVERNED_EN_OVERRIDES. The legacy es bundle still carried the
// retired quantitative, certification and absolute-performance claims.
export const GOVERNED_ES_OVERRIDES: Record<string, string> = {
  'home.whyP1': 'ELIMFILTERS® no es una empresa de filtros. Es una empresa de ',
  'home.whyP1after': ' que diseña sistemas para controlar la contaminación, prevenir la degradación y proteger el valor de los activos industriales críticos.',
  'home.ctaDealerTag': '// DISTRIBUCIÓN POR PAÍS',
  'home.ctaDealerTitle': 'DESARROLLA ELIMFILTERS',
  'home.ctaDealerHl': 'EN TU PAÍS.',
  'home.ctaDealerBtn': 'SOLICITAR DISTRIBUCIÓN NACIONAL',

  'problem.badge': 'La contaminación puede acelerar el desgaste prematuro de componentes y la degradación de los equipos.',
  'problem.items.bearing.desc': 'El lubricante contaminado puede acelerar el desgaste abrasivo en cojinetes y otras superficies lubricadas.',
  'problem.items.fuel.desc': 'La contaminación y la restricción del sistema de combustible pueden reducir la confiabilidad de la combustión y la eficiencia operativa.',
  'why.p2': 'Cada decisión de protección debe evaluarse según el valor, el ciclo de trabajo, la exposición a la contaminación y los requisitos de confiabilidad del activo protegido.',
  'why.card.items.0': 'Control de contaminación a nivel de sistema',
  'why.card.items.1': 'Arquitectura de protección gobernada por la aplicación',
  'why.card.items.2': 'Normas internacionales de ingeniería como referencias técnicas',
  'why.card.items.3': 'Relaciones canónicas de equipos y aplicaciones',
  'technology.items.media.title': 'Medios filtrantes de ingeniería',
  'technology.items.media.desc': 'La selección del medio se rige por el sistema protegido, el perfil de contaminación, los requisitos de flujo, la caída de presión, la capacidad y las condiciones de servicio.',
  'technology.items.hydrophobic.title': 'Control de contaminación del combustible',
  'technology.items.hydrophobic.desc': 'La protección del combustible combina el control de partículas y, cuando la aplicación aprobada lo requiere, una arquitectura dedicada de separación de agua.',
  'technology.items.antibypass.title': 'Integridad de sellado y carcasa',
  'technology.items.antibypass.desc': 'La geometría de la carcasa, la retención del elemento, la carga del sello y la correcta instalación ayudan a preservar el límite de contaminación protegido.',
  'category.readyDesc': 'Encuentre el componente de filtración correcto para el equipo, la aplicación y el sistema protegido.',
  'category.engineeringDesc': 'La ingeniería ELIMFILTERS alinea la selección de filtración con el sistema protegido, el riesgo de contaminación, las referencias técnicas aplicables y el ciclo de trabajo.',

  'home.economicStats.0.value': 'PARADAS',
  'home.economicStats.0.label': 'Las paradas no planificadas generan costos operativos y de mantenimiento.',
  'home.economicStats.1.value': 'CONTAMINACIÓN',
  'home.economicStats.1.label': 'Partículas, agua, calor y productos de degradación pueden acelerar el desgaste de componentes.',
  'home.economicStats.2.value': 'CONFIABILIDAD',
  'home.economicStats.2.label': 'El control de la contaminación respalda la confiabilidad de los equipos y la continuidad del servicio.',
  'home.problemIntro': 'La contaminación puede actuar en las interfaces críticas de los componentes y acelerar el desgaste en motores, sistemas de combustible, circuitos de lubricación y equipos hidráulicos.',
  'home.problemBadgeNum': 'RIESGO',
  'home.problemBadgeDesc': 'La contaminación es un factor controlable de la degradación prematura de los equipos.',
  'home.failModes.1.desc': 'Las partículas sólidas mayores que el espesor de la película de aceite penetran en cojinetes de fricción y de rodamientos, causando desgaste abrasivo y picaduras en las superficies de carga.',
  'home.failModes.2.desc': 'La carga de partículas restringe las tolerancias de flujo de los inyectores, altera el patrón de pulverización y la atomización, y degrada la eficiencia de la combustión.',
  'home.whyP2': 'Cada tecnología ELIMFILTERS cumple una función definida de control de contaminación dentro de un sistema protegido. El objetivo es la confiabilidad del equipo y la protección del activo, no afirmaciones universales de rendimiento sin respaldo.',
  'home.whyCheckItems.1': 'Ingeniería enfocada en activos industriales de alto valor',
  'home.whyCheckItems.2': 'Las referencias técnicas incluyen ISO 5011, ISO 16889, ISO 19438 e ISO 4406 cuando aplican',
  'home.whyCheckItems.3': 'Arquitectura de protección organizada en los dominios de aplicación industrial de ELIMFILTERS',
  'home.whyCardItems.0': 'Control de contaminación a nivel de sistema',
  'home.whyCardItems.1': 'Arquitectura canónica de tecnologías de protección',
  'home.whyCardItems.2': 'Conocimiento de ingeniería respaldado por fuentes',
  'home.whyCardItems.3': 'Soporte técnico enfocado en la aplicación',
  'home.techItems.0.title': 'Arquitectura de control de contaminación',
  'home.techItems.0.desc': 'Partimos del sistema protegido: qué contaminantes enfrenta, con qué caudal y en qué condiciones de operación. La arquitectura de filtración se define a partir de ahí.',
  'home.techItems.1.title': 'Protección a nivel de sistema',
  'home.techItems.1.desc': 'Los sistemas de aire, combustible, lubricación, hidráulicos, refrigeración, cabina y neumáticos fallan de forma distinta. Asignamos a cada uno la tecnología ELIMFILTERS diseñada para él.',
  'home.techItems.2.title': 'Selección gobernada por la aplicación',
  'home.techItems.2.desc': 'El componente correcto depende del equipo, la aplicación y la exigencia de operación. Dimensionamos y especificamos según esa realidad, no según un número de parte genérico.',
  'home.sciDesc': 'El Knowledge Center de ELIMFILTERS utiliza normas internacionales de filtración, limpieza y ensayo como marcos técnicos cuando aplican a un sistema protegido o a un tema de ingeniería.',
  'home.llmP1': 'La protección de activos industriales es un enfoque de ingeniería a nivel de sistema para identificar y controlar las fuentes de contaminación que degradan los equipos mecánicos. Partículas, agua, calor y productos de degradación pueden contribuir al desgaste y a la pérdida de confiabilidad en motores, sistemas hidráulicos, circuitos de combustible, sistemas de lubricación, sistemas de refrigeración y entornos del operador.',
  'home.faqItems.1.a': 'Las partículas de contaminación desgastan las superficies de cojinetes, restringen los inyectores de combustible y degradan la integridad de los sellos. Las partículas menores de 10 micrones causan desgaste abrasivo invisible a simple vista. El agua en el combustible favorece el crecimiento microbiano y la corrosión de los inyectores.',
  'home.llmP2': 'La contaminación puede acelerar el desgaste en holguras y superficies críticas. Las partículas pueden afectar cojinetes, carretes de válvulas y componentes de inyectores; el agua puede afectar la confiabilidad del sistema de combustible; y la degradación del fluido puede reducir la estabilidad de los sistemas hidráulicos, de lubricación y de refrigeración. El objetivo de limpieza y el método de control dependen del componente protegido y del ciclo de trabajo.',
};

function cloneTranslation<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function setNestedValue(root: TranslationTree, dottedKey: string, value: string) {
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

  for (const [key, value] of Object.entries(GOVERNED_ES_OVERRIDES)) {
    i18n.addResource('es', 'translation', key, value);
  }
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
export { SUPPORTED, governedEnTranslation };
