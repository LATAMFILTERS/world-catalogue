export const CANONICAL_TECHNOLOGIES = {
  macrocore: {
    slug: 'macrocore',
    name: 'MACROCOREâ„¢',
    domain: 'air-intake',
    role: 'Primary and secondary engine air filtration',
  },
  microkappa: {
    slug: 'microkappa',
    name: 'MICROKAPPAâ„¢',
    domain: 'air-intake',
    role: 'Cabin air filtration',
  },
  syntrax: {
    slug: 'syntrax',
    name: 'SYNTRAXâ„¢',
    domain: 'lubrication',
    role: 'Lubrication and oil filtration',
  },
  syntapore: {
    slug: 'syntapore',
    name: 'SYNTAPOREâ„¢',
    domain: 'fuel-cleanliness',
    role: 'Primary and secondary spin-on/cartridge fuel filtration',
  },
  nanoforce: {
    slug: 'nanoforce',
    name: 'NANOFORCEâ„¢',
    domain: 'hydraulic',
    role: 'Hydraulic filtration',
  },
  thermacore: {
    slug: 'thermacore',
    name: 'THERMACOREâ„¢',
    domain: 'cooling-system',
    role: 'Cooling-system filtration',
  },
  intekcore: {
    slug: 'intekcore',
    name: 'INTEKCOREâ„¢',
    domain: 'air-intake',
    role: 'Air-cleaner housings and sealing architecture',
  },
  drycore: {
    slug: 'drycore',
    name: 'DRYCOREâ„¢',
    domain: 'air-intake',
    role: 'Pneumatic brake-system air dryer filtration',
  },
  hydrocore: {
    slug: 'hydrocore',
    name: 'HYDROCOREâ„¢',
    domain: 'fuel-cleanliness',
    role: 'Fuel/water separation for approved standard non-turbine separators, including drain and transparent-bowl configurations',
  },
  turbocore: {
    slug: 'turbocore',
    name: 'TURBOCOREâ„¢',
    domain: 'fuel-cleanliness',
    role: 'Turbine-style fuel/water separation exclusively for FH and FG series systems',
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

