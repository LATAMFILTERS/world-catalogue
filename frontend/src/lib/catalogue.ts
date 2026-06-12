import catalogueData from '../../catalogue.json';

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

// Map technology name to logo file
export function getTechLogoFile(name: string): string {
  const logoMap: Record<string, string> = {
    'Hydracore Series': 'logo-hydrocore.png',
    Hydrocore: 'logo-hydrocore.png',
    Cooltech: 'logo-cooltech.png',
    Drycore: 'logo-drycore.png',
    Duratech: 'logo-duratech.png',
    Intekcore: 'logo-intekcore.png',
    Macrocore: 'logo-macrocore.png',
    Marineclean: 'logo-marineclean.png',
    Microkappa: 'logo-microkappa.png',
    Nanoforce: 'logo-nanoforce.png',
    Syntepore: 'logo-syntepore.png',
    Syntrax: 'logo-sintrax.png',
  };
  return logoMap[name] || 'logo-elimfilters.png';
}
