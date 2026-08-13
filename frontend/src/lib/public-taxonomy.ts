import {
  KC_SYSTEMS,
  KC_SYSTEM_DETAILS,
  KC_TECHNOLOGIES,
  KC_INDUSTRIES,
  KC_INDUSTRY_DETAILS,
} from '@/lib/knowledge-center-data';

/**
 * Public taxonomy contract for ELIMFILTERS.
 * This file is the single source of truth used by public, indexable surfaces.
 * Internal/legacy registries may retain historical records, but must not leak
 * conflicting system, technology, or industry definitions to crawlers.
 */

const systemBySlug = new Map(KC_SYSTEMS.map((item) => [item.slug, item]));
const technologyBySlug = new Map(KC_TECHNOLOGIES.map((item) => [item.slug, item]));

export const PUBLIC_SYSTEMS = [
  {
    ...systemBySlug.get('air-intake-protection')!,
    title: 'Air Intake & Airflow Protection Systems',
    description:
      'Protection of engine intake, cabin air, compressed-air drying, and airflow integrity through coordinated contamination control.',
    technologies: ['MACROCORE™', 'MICROKAPPA™', 'DRYCORE™', 'INTEKCORE™'],
    standards: ['ISO 5011', 'ISO 11155', 'ISO 8573-1'],
  },
  {
    ...systemBySlug.get('fuel-cleanliness-protection')!,
    title: 'Fuel Cleanliness Protection Systems',
    technologies: ['HYDROCORE™', 'HYDROCORE/SERIES™'],
  },
  {
    ...systemBySlug.get('cooling-system-protection')!,
    title: 'Cooling System Protection',
    technologies: ['THERMACORE™'],
  },
  {
    ...systemBySlug.get('lubrication-protection')!,
    title: 'Lube/Oil Protection Systems',
    technologies: ['SYNTRAX™'],
  },
  {
    ...systemBySlug.get('hydraulic-protection')!,
    title: 'Hydraulic Protection Systems',
    technologies: ['NANOFORCE™'],
  },
];

export const PUBLIC_SYSTEM_DETAILS = KC_SYSTEM_DETAILS;

const canonicalTechnology = (
  sourceSlug: string,
  overrides: Partial<(typeof KC_TECHNOLOGIES)[number]>,
) => ({ ...technologyBySlug.get(sourceSlug)!, ...overrides });

export const PUBLIC_TECHNOLOGIES = [
  canonicalTechnology('macrocore', { name: 'MACROCORE™', domain: 'Air Intake & Airflow Protection Systems' }),
  canonicalTechnology('microkappa', { name: 'MICROKAPPA™', domain: 'Air Intake & Airflow Protection Systems', relatedSystems: ['air-intake-protection'] }),
  canonicalTechnology('drycore', { name: 'DRYCORE™', domain: 'Air Intake & Airflow Protection Systems', relatedSystems: ['air-intake-protection'] }),
  canonicalTechnology('intekcore', { name: 'INTEKCORE™', domain: 'Air Intake & Airflow Protection Systems' }),
  canonicalTechnology('syntrax', { name: 'SYNTRAX™', domain: 'Lube/Oil Protection Systems' }),
  canonicalTechnology('nanoforce', { name: 'NANOFORCE™', domain: 'Hydraulic Protection Systems' }),
  canonicalTechnology('hydrocore', {
    name: 'HYDROCORE™',
    domain: 'Fuel Cleanliness Protection Systems',
    worksWith: ['HYDROCORE/SERIES™'],
  }),
  canonicalTechnology('turbocore', {
    slug: 'hydrocore-series',
    name: 'HYDROCORE/SERIES™',
    domain: 'Fuel Cleanliness Protection Systems',
    tagline: 'Turbine-style FH/FG fuel-water separation architecture for heavy-duty diesel applications.',
    worksWith: ['HYDROCORE™'],
  }),
  canonicalTechnology('thermacore', { name: 'THERMACORE™', domain: 'Cooling System Protection' }),
  canonicalTechnology('marineclean', { name: 'MARINECLEAN™' }),
  canonicalTechnology('duratech', {
    slug: 'duractech',
    name: 'DURACTECH™',
    tagline: 'Consolidated severe-duty filtration kit architecture for coordinated maintenance events.',
    worksWith: ['MACROCORE™', 'SYNTRAX™', 'HYDROCORE™', 'NANOFORCE™'],
  }),
];

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

export const LEGACY_PUBLIC_REDIRECTS: Record<string, string> = {
  '/knowledge-center/systems/cabin-air-protection': '/knowledge-center/systems/air-intake-protection/',
  '/knowledge-center/technologies/turbocore': '/knowledge-center/technologies/hydrocore-series/',
  '/knowledge-center/technologies/duratech': '/knowledge-center/technologies/duractech/',
  '/knowledge-center/technologies/syntepore': '/knowledge-center/technologies/hydrocore/',
};
