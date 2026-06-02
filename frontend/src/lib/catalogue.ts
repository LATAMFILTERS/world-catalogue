import catalogueData from '../../catalogue.json';
import { TECHNOLOGIES, DEPRECATED_TECHNOLOGIES, ECOSYSTEMS } from './unified-data';

export interface CatalogueItem {
  name: string;
  file: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  benefits?: string[];
  techTags?: string[];
  stats: {
    percentages?: string[];
    ratings?: string[];
  };
  cta: string;
  videoBody?: string[];
  engineeringBody?: string;
}

export const catalogue = {
  industries: catalogueData.industries as CatalogueItem[],
  products: catalogueData.products as CatalogueItem[],
  technologies: catalogueData.technologies as CatalogueItem[],
};

export function getSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function getItemBySlug(
  category: 'industries' | 'products' | 'technologies',
  slug: string
): CatalogueItem | undefined {
  return catalogue[category].find((item) => getSlug(item.name) === slug);
}

export const CATEGORY_LABELS: Record<string, string> = {
  industries: 'INDUSTRY',
  products: 'SYSTEM',
  technologies: 'TECHNOLOGY',
};

export const CATEGORY_URLS: Record<string, string> = {
  industries: '/industries',
  products: '/systems',
  technologies: '/technologies',
};

export const CATEGORY_ICONS: Record<string, string[]> = {
  Agriculture: ['🌾'],
  Automotive: ['🚗'],
  'Bus Coach': ['🚌'],
  Construction: ['🏗'],
  Manufacturing: ['🏭'],
  Marine: ['⚓'],
  Mining: ['⛏'],
  'Oil Gas': ['🛢'],
  'Power Generation': ['⚡'],
  Railway: ['🚂'],
  'Trucks Fleets': ['🚛'],
  'Waste Municipal': ['♻'],
};

// Logo lookup derived from unified-data.ts (computed once at module load)
const _techLogoBySlug: Record<string, string> = {
  // 'aquaguard-series' is a System slug in unified-data.ts, not a Technology slug.
  // Map it to the deprecated AQUAGUARD technology logo so display pages continue working.
  'aquaguard-series': DEPRECATED_TECHNOLOGIES.AQUAGUARD.logoFile,
  ...Object.fromEntries(Object.values(TECHNOLOGIES).map((t) => [t.slug, t.logoFile])),
  ...Object.fromEntries(Object.values(DEPRECATED_TECHNOLOGIES).map((t) => [t.slug, t.logoFile])),
  ...Object.fromEntries(Object.values(ECOSYSTEMS).map((e) => [e.slug, e.logoFile])),
};

export function getTechLogoFile(name: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return _techLogoBySlug[slug] ?? 'logo-elimfilters.png';
}
