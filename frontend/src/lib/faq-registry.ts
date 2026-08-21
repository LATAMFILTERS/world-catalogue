import { getSystemEditorial } from './system-editorial';
import { getTechnologyEditorial } from './technology-editorial';
import { KC_STANDARDS } from './knowledge-center-data/standards-registry';

export type FAQSourceType = 'system' | 'technology' | 'standard' | 'search-demand';

export interface FAQRegistryEntry {
  readonly id: string;
  readonly category: string;
  readonly topic: string;
  readonly question: string;
  readonly answer: string;
  readonly sourceHref: string;
  readonly sourceType: FAQSourceType;
  readonly demandSignal?: 'gsc-observed';
  readonly lastReviewed: string;
}

const REVIEW_DATE = '2026-08-21';

const SYSTEMS = [
  ['air-intake', 'Air Intake & Airflow'],
  ['fuel-cleanliness', 'Fuel Cleanliness'],
  ['lubrication', 'Lubrication'],
  ['hydraulic', 'Hydraulic'],
  ['cooling-system', 'Cooling System'],
] as const;

const TECHNOLOGIES = [
  ['macrocore', 'MACROCORE™'],
  ['microkappa', 'MICROKAPPA™'],
  ['drycore', 'DRYCORE™'],
  ['intekcore', 'INTEKCORE™'],
  ['syntapore', 'SYNTAPORE™'],
  ['hydrocore', 'HYDROCORE™'],
  ['syntrax', 'SYNTRAX™'],
  ['nanoforce', 'NANOFORCE™'],
  ['thermacore', 'THERMACORE™'],
] as const;

// Questions observed in Google Search Console during the 28-day window ending
// 2026-08-18. Answers are deliberately conservative and terminology-led.
// Hermes may refresh this block from GSC, but must not invent performance claims,
// test results, certifications, service intervals or competitor comparisons.
const SEARCH_DEMAND_FAQS: readonly FAQRegistryEntry[] = [
  {
    id: 'gsc-iso-cleanliness-code',
    category: 'Engineering fundamentals',
    topic: 'ISO cleanliness code',
    question: 'How do you read an ISO cleanliness code?',
    answer: 'ISO 4406 expresses fluid particle contamination with three code numbers tied to particle-count ranges at defined particle sizes. Lower code numbers represent fewer particles. The target code must be selected for the sensitivity and operating requirements of the protected system rather than applied universally.',
    sourceHref: '/knowledge-center/glossary/',
    sourceType: 'search-demand',
    demandSignal: 'gsc-observed',
    lastReviewed: REVIEW_DATE,
  },
  {
    id: 'gsc-differential-pressure',
    category: 'Engineering fundamentals',
    topic: 'Differential pressure',
    question: 'What is differential pressure?',
    answer: 'Differential pressure, or ΔP, is the pressure difference between the upstream and downstream sides of a filter. It changes with flow, fluid condition and contaminant loading and is commonly used as one input for evaluating filter restriction and service condition.',
    sourceHref: '/knowledge-center/glossary/',
    sourceType: 'search-demand',
    demandSignal: 'gsc-observed',
    lastReviewed: REVIEW_DATE,
  },
  {
    id: 'gsc-service-interval',
    category: 'Maintenance fundamentals',
    topic: 'Service interval',
    question: 'What is a service interval?',
    answer: 'A service interval is the planned operating-time, distance or calendar period between defined maintenance actions. It should follow equipment guidance and be adjusted only when operating conditions and validated maintenance evidence support the change.',
    sourceHref: '/knowledge-center/glossary/',
    sourceType: 'search-demand',
    demandSignal: 'gsc-observed',
    lastReviewed: REVIEW_DATE,
  },
  {
    id: 'gsc-soot',
    category: 'Contamination fundamentals',
    topic: 'Soot',
    question: 'What is soot?',
    answer: 'Soot is fine carbonaceous particulate produced by incomplete combustion. In engine lubrication systems it can become part of the contaminant load carried by the oil, so soot condition must be considered together with oil quality, engine condition and the approved maintenance strategy.',
    sourceHref: '/knowledge-center/glossary/',
    sourceType: 'search-demand',
    demandSignal: 'gsc-observed',
    lastReviewed: REVIEW_DATE,
  },
  {
    id: 'gsc-depth-filtration',
    category: 'Filtration fundamentals',
    topic: 'Depth filtration',
    question: 'What is depth filtration?',
    answer: 'Depth filtration captures contaminants through the thickness and internal structure of a filter medium rather than relying only on its outer surface. Actual performance depends on the media architecture, contaminant, flow and validated product test data.',
    sourceHref: '/knowledge-center/glossary/',
    sourceType: 'search-demand',
    demandSignal: 'gsc-observed',
    lastReviewed: REVIEW_DATE,
  },
  {
    id: 'gsc-coalescing',
    category: 'Separation fundamentals',
    topic: 'Coalescing',
    question: 'What is coalescing?',
    answer: 'Coalescing is a separation mechanism in which small liquid droplets are brought together into larger droplets so they can be separated more effectively from a fluid or gas stream. The applicable mechanism and performance depend on the specific system and media design.',
    sourceHref: '/knowledge-center/glossary/',
    sourceType: 'search-demand',
    demandSignal: 'gsc-observed',
    lastReviewed: REVIEW_DATE,
  },
  {
    id: 'gsc-bearing-clearance',
    category: 'Asset protection fundamentals',
    topic: 'Bearing clearance',
    question: 'What is bearing clearance?',
    answer: 'Bearing clearance is the designed gap between mating bearing surfaces that allows formation of a lubricating film under the intended operating conditions. Contamination, viscosity, load and temperature can affect the condition of that lubricated interface.',
    sourceHref: '/knowledge-center/glossary/',
    sourceType: 'search-demand',
    demandSignal: 'gsc-observed',
    lastReviewed: REVIEW_DATE,
  },
  {
    id: 'gsc-hydrodynamic-lubrication',
    category: 'Lubrication fundamentals',
    topic: 'Hydrodynamic lubrication',
    question: 'What is hydrodynamic lubrication?',
    answer: 'Hydrodynamic lubrication occurs when relative motion and fluid viscosity generate a pressure-supported lubricating film that separates moving surfaces. Film formation depends on operating speed, load, viscosity, geometry and temperature.',
    sourceHref: '/knowledge-center/glossary/',
    sourceType: 'search-demand',
    demandSignal: 'gsc-observed',
    lastReviewed: REVIEW_DATE,
  },
  {
    id: 'gsc-microbiological-contamination',
    category: 'Contamination fundamentals',
    topic: 'Microbiological contamination',
    question: 'What is microbiological contamination?',
    answer: 'Microbiological contamination is the presence and growth of microorganisms in a fluid system. In stored fuels, water availability and storage conditions can support microbial growth, so recurring contamination requires investigation of the complete storage and fuel-handling environment.',
    sourceHref: '/knowledge-center/glossary/',
    sourceType: 'search-demand',
    demandSignal: 'gsc-observed',
    lastReviewed: REVIEW_DATE,
  },
  {
    id: 'gsc-nas-value',
    category: 'Engineering fundamentals',
    topic: 'NAS cleanliness class',
    question: 'What is a NAS cleanliness value?',
    answer: 'NAS 1638 is a legacy particulate-cleanliness classification used for fluids. It should not be treated as interchangeable with ISO 4406 without an appropriate engineering conversion or specification context; the governing equipment or maintenance requirement should determine which cleanliness system is used.',
    sourceHref: '/knowledge-center/glossary/',
    sourceType: 'search-demand',
    demandSignal: 'gsc-observed',
    lastReviewed: REVIEW_DATE,
  },
];

function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[™®]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function getFAQRegistry(): FAQRegistryEntry[] {
  const entries: FAQRegistryEntry[] = [];

  for (const [slug, label] of SYSTEMS) {
    const editorial = getSystemEditorial(slug);
    if (!editorial) continue;
    editorial.faq.forEach((faq, index) => {
      entries.push({
        id: `system-${slug}-${index + 1}`,
        category: 'Protection systems',
        topic: label,
        question: faq.question,
        answer: faq.answer,
        sourceHref: `/systems/${slug}/`,
        sourceType: 'system',
        lastReviewed: REVIEW_DATE,
      });
    });
  }

  for (const [slug, label] of TECHNOLOGIES) {
    const editorial = getTechnologyEditorial(slug);
    if (!editorial) continue;
    editorial.faq.forEach((faq, index) => {
      entries.push({
        id: `technology-${slug}-${index + 1}`,
        category: 'Filtration technologies',
        topic: label,
        question: faq.question,
        answer: faq.answer,
        sourceHref: `/technologies/${slug}/`,
        sourceType: 'technology',
        lastReviewed: REVIEW_DATE,
      });
    });
  }

  for (const standard of KC_STANDARDS) {
    if (!standard.faqs?.length) continue;
    standard.faqs.forEach((faq, index) => {
      entries.push({
        id: `standard-${standard.slug}-${index + 1}`,
        category: 'Standards',
        topic: standard.code,
        question: faq.question,
        answer: faq.answer,
        sourceHref: `/knowledge-center/standards/${standard.slug}/`,
        sourceType: 'standard',
        lastReviewed: REVIEW_DATE,
      });
    });
  }

  entries.push(...SEARCH_DEMAND_FAQS);

  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = normalizeQuestion(entry.question);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getFAQCategories(): Array<{ category: string; entries: FAQRegistryEntry[] }> {
  const grouped = new Map<string, FAQRegistryEntry[]>();
  for (const entry of getFAQRegistry()) {
    const bucket = grouped.get(entry.category) || [];
    bucket.push(entry);
    grouped.set(entry.category, bucket);
  }
  return Array.from(grouped, ([category, entries]) => ({ category, entries }));
}
