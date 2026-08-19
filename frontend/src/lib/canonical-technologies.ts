export const CANONICAL_TECHNOLOGIES = {
  macrocore: {
    slug: 'macrocore',
    name: 'MACROCORE™',
    domain: 'air-intake',
    role: 'Primary and secondary engine air filtration',
  },
  microkappa: {
    slug: 'microkappa',
    name: 'MICROKAPPA™',
    domain: 'air-intake',
    role: 'Cabin air filtration',
  },
  syntrax: {
    slug: 'syntrax',
    name: 'SYNTRAX™',
    domain: 'lubrication',
    role: 'Lubrication and oil filtration',
  },
  syntapore: {
    slug: 'syntapore',
    name: 'SYNTAPORE™',
    domain: 'fuel-cleanliness',
    role: 'Primary and secondary spin-on/cartridge fuel filtration',
  },
  nanoforce: {
    slug: 'nanoforce',
    name: 'NANOFORCE™',
    domain: 'hydraulic',
    role: 'Hydraulic filtration',
  },
  thermacore: {
    slug: 'thermacore',
    name: 'THERMACORE™',
    domain: 'cooling-system',
    role: 'Cooling-system filtration',
  },
  intekcore: {
    slug: 'intekcore',
    name: 'INTEKCORE™',
    domain: 'air-intake',
    role: 'Air-cleaner housings and sealing architecture',
  },
  drycore: {
    slug: 'drycore',
    name: 'DRYCORE™',
    domain: 'air-intake',
    role: 'Pneumatic brake-system air dryer filtration',
  },
  hydrocore: {
    slug: 'hydrocore',
    name: 'HYDROCORE™',
    domain: 'fuel-cleanliness',
    role: 'Fuel/water separation across approved spin-on, cartridge, FH and FG architectures',
  },
} as const;

export type TechnologySlug = keyof typeof CANONICAL_TECHNOLOGIES;
export type CanonicalTechnology = (typeof CANONICAL_TECHNOLOGIES)[TechnologySlug];

export const CANONICAL_TECHNOLOGY_LIST = Object.values(CANONICAL_TECHNOLOGIES);

export function isCanonicalTechnology(value: string): value is TechnologySlug {
  return value in CANONICAL_TECHNOLOGIES;
}

export function getCanonicalTechnology(slug: string): CanonicalTechnology | undefined {
  return isCanonicalTechnology(slug) ? CANONICAL_TECHNOLOGIES[slug] : undefined;
}
