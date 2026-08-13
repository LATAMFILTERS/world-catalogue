import { KC_SYSTEMS, KC_SYSTEM_DETAILS, KC_TECHNOLOGIES, KC_INDUSTRIES, KC_INDUSTRY_DETAILS } from '@/lib/knowledge-center-data';

const systemBySlug = new Map(KC_SYSTEMS.map((item) => [item.slug, item]));
const technologyBySlug = new Map(KC_TECHNOLOGIES.map((item) => [item.slug, item]));

export const PUBLIC_SYSTEMS = [
  { ...systemBySlug.get('air-intake-protection')!, title: 'Air Intake & Airflow Protection Systems', description: 'Protection of engine intake, cabin air, compressed-air drying, and airflow integrity through coordinated contamination control.', technologies: ['MACROCORE™', 'MICROKAPPA™', 'DRYCORE™', 'INTEKCORE™'], standards: ['ISO 5011', 'ISO 11155', 'ISO 8573-1'] },
  { ...systemBySlug.get('fuel-cleanliness-protection')!, title: 'Fuel Cleanliness Protection Systems', technologies: ['SYNTAPORE™', 'TURBOCORE™'] },
  { ...systemBySlug.get('cooling-system-protection')!, title: 'Cooling System Protection', technologies: ['THERMACORE™'] },
  { ...systemBySlug.get('lubrication-protection')!, title: 'Lube/Oil Protection Systems', technologies: ['SYNTRAX™'] },
  { ...systemBySlug.get('hydraulic-protection')!, title: 'Hydraulic Protection Systems', technologies: ['NANOFORCE™'] },
];

export const PUBLIC_SYSTEM_DETAILS = KC_SYSTEM_DETAILS;

const canonicalOrder = ['macrocore', 'microkappa', 'drycore', 'intekcore', 'syntapore', 'turbocore', 'thermacore', 'syntrax', 'nanoforce', 'marineclean', 'duractech'] as const;
export const PUBLIC_TECHNOLOGIES = canonicalOrder.map((slug) => technologyBySlug.get(slug)!).filter(Boolean);

const baseIndustries = KC_INDUSTRIES.map((item) => ({ ...item }));
export const PUBLIC_INDUSTRIES = [
  { slug: 'agriculture', title: 'Agriculture', icon: '🌾', dust: 'High', description: 'Crop dust, soil, chaff, hydraulic contamination, and seasonal fuel-storage exposure.' },
  { slug: 'automotive', title: 'Automotive', icon: '🚗', dust: 'Moderate', description: 'Passenger and light-duty vehicle filtration across intake, cabin, lubrication, fuel, and cooling systems.' },
  { slug: 'bus-coach', title: 'Bus & Coach / Urban Mobility', icon: '🚌', dust: 'Moderate', description: 'High-cycle urban duty, cabin air quality, soot loading, and fleet reliability requirements.' },
  ...baseIndustries.filter((item) => !['agriculture'].includes(item.slug)),
];

export const PUBLIC_INDUSTRY_DETAILS = KC_INDUSTRY_DETAILS;
export const PUBLIC_TAXONOMY_COUNTS = {
  systems: PUBLIC_SYSTEMS.length,
  technologies: PUBLIC_TECHNOLOGIES.length,
  industries: PUBLIC_INDUSTRIES.length,
} as const;

const oldTechPath = (...parts: string[]) => `/knowledge-center/technologies/${parts.join('')}`;
export const LEGACY_PUBLIC_REDIRECTS: Record<string, string> = {
  '/knowledge-center/systems/cabin-air-protection': '/knowledge-center/systems/air-intake-protection/',
  [oldTechPath('synte', 'pore')]: '/knowledge-center/technologies/syntapore/',
  [oldTechPath('hydro', 'core')]: '/knowledge-center/technologies/syntapore/',
  [oldTechPath('turbo', 'cor')]: '/knowledge-center/technologies/turbocore/',
  [oldTechPath('hydro', 'core-series')]: '/knowledge-center/technologies/turbocore/',
  [oldTechPath('dura', 'tech')]: '/knowledge-center/technologies/duractech/',
};
