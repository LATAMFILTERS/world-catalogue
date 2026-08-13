import { KC_SYSTEMS, KC_SYSTEM_DETAILS, KC_TECHNOLOGIES, KC_INDUSTRIES, KC_INDUSTRY_DETAILS } from '@/lib/knowledge-center-data';

const systemBySlug = new Map(KC_SYSTEMS.map((item) => [item.slug, item]));
const technologyBySlug = new Map(KC_TECHNOLOGIES.map((item) => [item.slug, item]));

export const PUBLIC_SYSTEMS = [
  { ...systemBySlug.get('air-intake-protection')!, title: 'Air Intake & Airflow Protection Systems', description: 'Protection of engine intake, cabin air, compressed-air drying, and airflow integrity through coordinated contamination control.', technologies: ['MACROCORE™', 'MICROKAPPA™', 'DRYCORE™', 'INTEKCORE™'], standards: ['ISO 5011', 'ISO 11155', 'ISO 8573-1'] },
  { ...systemBySlug.get('fuel-cleanliness-protection')!, title: 'Fuel Cleanliness Protection Systems', technologies: ['SYNTAPORE™', 'TURBOCOR™'] },
  { ...systemBySlug.get('cooling-system-protection')!, title: 'Cooling System Protection', technologies: ['THERMACORE™'] },
  { ...systemBySlug.get('lubrication-protection')!, title: 'Lube/Oil Protection Systems', technologies: ['SYNTRAX™'] },
  { ...systemBySlug.get('hydraulic-protection')!, title: 'Hydraulic Protection Systems', technologies: ['NANOFORCE™'] },
];

export const PUBLIC_SYSTEM_DETAILS = KC_SYSTEM_DETAILS;

const canonicalTechnology = (sourceSlug: string, overrides: Partial<(typeof KC_TECHNOLOGIES)[number]>) => ({ ...technologyBySlug.get(sourceSlug)!, ...overrides });

export const PUBLIC_TECHNOLOGIES = [
  canonicalTechnology('macrocore', { name: 'MACROCORE™', domain: 'Air Intake & Airflow Protection Systems' }),
  canonicalTechnology('microkappa', { name: 'MICROKAPPA™', domain: 'Air Intake & Airflow Protection Systems', relatedSystems: ['air-intake-protection'] }),
  canonicalTechnology('drycore', { name: 'DRYCORE™', domain: 'Air Intake & Airflow Protection Systems', relatedSystems: ['air-intake-protection'] }),
  canonicalTechnology('intekcore', { name: 'INTEKCORE™', domain: 'Air Intake & Airflow Protection Systems' }),
  canonicalTechnology('syntrax', { name: 'SYNTRAX™', domain: 'Lube/Oil Protection Systems' }),
  canonicalTechnology('nanoforce', { name: 'NANOFORCE™', domain: 'Hydraulic Protection Systems' }),
  canonicalTechnology('syntepore', { slug: 'syntapore', name: 'SYNTAPORE™', domain: 'Fuel Cleanliness Protection Systems', tagline: 'Primary and secondary diesel fuel filtration technology for spin-on and cartridge filters.', worksWith: ['TURBOCOR™'] }),
  canonicalTechnology('turbocore', { slug: 'turbocor', name: 'TURBOCOR™', domain: 'Fuel Cleanliness Protection Systems', tagline: 'FH and FG turbine fuel filtration and water-separation technology covering 1000FH, 900FH and 500FG assemblies and 2010, 2040 and 2020 elements in 30, 10 and 2 micron grades.', worksWith: ['SYNTAPORE™'] }),
  canonicalTechnology('thermacore', { name: 'THERMACORE™', domain: 'Cooling System Protection' }),
  canonicalTechnology('marineclean', { name: 'MARINECLEAN™' }),
  canonicalTechnology('duratech', { slug: 'duractech', name: 'DURACTECH™', tagline: 'Consolidated severe-duty filtration kit architecture for coordinated maintenance events.', worksWith: ['MACROCORE™', 'SYNTRAX™', 'SYNTAPORE™', 'NANOFORCE™'] }),
];

const baseIndustries = KC_INDUSTRIES.map((item) => ({ ...item }));
export const PUBLIC_INDUSTRIES = [
  { slug: 'agriculture', title: 'Agriculture', icon: '🌾', dust: 'High', description: 'Crop dust, soil, chaff, hydraulic contamination, and seasonal fuel-storage exposure.' },
  { slug: 'automotive', title: 'Automotive', icon: '🚗', dust: 'Moderate', description: 'Passenger and light-duty vehicle filtration across intake, cabin, lubrication, fuel, and cooling systems.' },
  { slug: 'bus-coach', title: 'Bus & Coach / Urban Mobility', icon: '🚌', dust: 'Moderate', description: 'High-cycle urban duty, cabin air quality, soot loading, and fleet reliability requirements.' },
  ...baseIndustries.filter((item) => !['agriculture'].includes(item.slug)),
];
export const PUBLIC_INDUSTRY_DETAILS = KC_INDUSTRY_DETAILS;
export const PUBLIC_TAXONOMY_COUNTS = { systems: PUBLIC_SYSTEMS.length, technologies: PUBLIC_TECHNOLOGIES.length, industries: PUBLIC_INDUSTRIES.length } as const;
export const LEGACY_PUBLIC_REDIRECTS: Record<string, string> = {
  '/knowledge-center/systems/cabin-air-protection': '/knowledge-center/systems/air-intake-protection/',
  '/knowledge-center/technologies/syntepore': '/knowledge-center/technologies/syntapore/',
  '/knowledge-center/technologies/hydrocore': '/knowledge-center/technologies/syntapore/',
  '/knowledge-center/technologies/turbocore': '/knowledge-center/technologies/turbocor/',
  '/knowledge-center/technologies/hydrocore-series': '/knowledge-center/technologies/turbocor/',
  '/knowledge-center/technologies/duratech': '/knowledge-center/technologies/duractech/',
};
