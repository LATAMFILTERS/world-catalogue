/**
 * Authoritative registry for the five ELIMFILTERS protection domains.
 * Cabin filtration and compressed-air drying are represented as product
 * families inside Air Intake & Airflow Protection, matching the public
 * information architecture.
 */

export type ProtectionSystemKey =
  | 'air-intake'
  | 'fuel-cleanliness'
  | 'lubrication'
  | 'hydraulic'
  | 'cooling-system';

export interface ProtectionSystem {
  readonly key: ProtectionSystemKey;
  readonly name: string;
  readonly slug: string;
  readonly tagline: string;
  readonly overview: string;
  readonly engineeringPrinciple: string;
  readonly heroImage: string;
  readonly heroColor: string;
  readonly primaryTechnologies: string[];
  readonly supportingTechnologies: string[];
  readonly productFamilies: string[];
  readonly hdPrefix: string;
  readonly ldPrefix: string | null;
  readonly relatedStandards: string[];
  readonly relatedIndustries: string[];
  readonly relatedSystems: ProtectionSystemKey[];
}

export const PROTECTION_SYSTEMS: Record<ProtectionSystemKey, ProtectionSystem> = {
  'air-intake': {
    key: 'air-intake',
    name: 'Air Intake & Airflow Protection',
    slug: 'air-intake',
    tagline: 'Contamination interception across engine intake, operator air, housings, and compressed-air drying.',
    overview: 'Air Intake & Airflow Protection is the first defense layer in any contamination control strategy. It combines engine air filtration, secondary safety protection, operator-cabin air quality, air-cleaner housings, and air-dryer elements within one coordinated airflow protection domain.',
    engineeringPrinciple: 'Progressive media density, controlled sealing, electrostatic capture, adsorption, and desiccant drying are applied according to the protected airflow path. Each family addresses a distinct contamination boundary while remaining part of one airflow protection architecture.',
    heroImage: '/images/carcasa.jd.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['macrocore'],
    supportingTechnologies: ['intekcore', 'microkappa', 'drycore'],
    productFamilies: ['primary-air', 'secondary-air', 'air-cleaner-housings', 'cabin-filters', 'air-dryer-filters'],
    hdPrefix: 'EA1',
    ldPrefix: 'EA3',
    relatedStandards: ['ISO 5011', 'SAE J1539', 'ISO 11155', 'ISO 8573-1', 'EU Dir. 2019/130'],
    relatedIndustries: ['mining', 'agriculture', 'construction', 'trucks-fleets', 'power-generation', 'marine', 'oil-gas', 'railway', 'bus-coach', 'manufacturing', 'waste-municipal'],
    relatedSystems: ['fuel-cleanliness', 'lubrication', 'cooling-system'],
  },

  'fuel-cleanliness': {
    key: 'fuel-cleanliness',
    name: 'Fuel Cleanliness Protection',
    slug: 'fuel-cleanliness',
    tagline: 'Water and particle elimination before the high-pressure injection circuit.',
    overview: 'Fuel Cleanliness Protection defends high-pressure injection systems by controlling particulate contamination and water before fuel reaches precision pumps and injectors.',
    engineeringPrinciple: 'SYNTEPORE™ controls particulate contamination, HYDROCORE™ provides fuel-water separation, and TURBOCORE™ supports Turbine FH and FG fuel-separation systems.',
    heroImage: '/images/fuellseparator-hero.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['syntepore', 'hydrocore', 'turbocore'],
    supportingTechnologies: [],
    productFamilies: ['primary-fuel', 'secondary-fuel', 'fuel-water-separators'],
    hdPrefix: 'EF9',
    ldPrefix: 'EF3',
    relatedStandards: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
    relatedIndustries: ['mining', 'agriculture', 'power-generation', 'marine', 'oil-gas', 'construction', 'trucks-fleets'],
    relatedSystems: ['air-intake', 'lubrication'],
  },

  lubrication: {
    key: 'lubrication',
    name: 'Lubrication Protection',
    slug: 'lubrication',
    tagline: 'Oil cleanliness maintained across the service interval.',
    overview: 'Lubrication Protection controls soot, wear debris, and oxidation byproducts before oil returns to critical bearings and lubricated interfaces.',
    engineeringPrinciple: 'Full-flow composite media balances efficiency, contaminant capacity, pressure drop, and valve integrity across changing viscosity and temperature conditions.',
    heroImage: '/images/oil-hand.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['syntrax'],
    supportingTechnologies: [],
    productFamilies: ['oil-filters'],
    hdPrefix: 'EL8',
    ldPrefix: 'EL3',
    relatedStandards: ['ISO 4406', 'ISO 16889'],
    relatedIndustries: ['trucks-fleets', 'mining', 'agriculture', 'construction', 'power-generation', 'marine', 'bus-coach', 'railway'],
    relatedSystems: ['air-intake', 'fuel-cleanliness', 'cooling-system'],
  },

  hydraulic: {
    key: 'hydraulic',
    name: 'Hydraulic Protection',
    slug: 'hydraulic',
    tagline: 'Contamination control in high-pressure hydraulic circuits.',
    overview: 'Hydraulic Protection maintains fluid cleanliness around the tolerance requirements of pumps, valves, actuators, and servo controls.',
    engineeringPrinciple: 'Beta-rated media, collapse-resistant construction, and thermal stability are matched to flow, pressure, critical particle size, and duty cycle.',
    heroImage: '/images/hidraulic.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['nanoforce'],
    supportingTechnologies: [],
    productFamilies: ['hydraulic-filters'],
    hdPrefix: 'EH6',
    ldPrefix: null,
    relatedStandards: ['ISO 16889', 'ISO 4406', 'NFPA T2.14', 'DIN 51524'],
    relatedIndustries: ['construction', 'mining', 'manufacturing', 'marine', 'agriculture'],
    relatedSystems: ['lubrication', 'fuel-cleanliness'],
  },

  'cooling-system': {
    key: 'cooling-system',
    name: 'Cooling System Protection',
    slug: 'cooling-system',
    tagline: 'Coolant cleanliness, additive control, and thermal-system protection.',
    overview: 'Cooling System Protection controls corrosion products, scale debris, and coolant additive condition in heavy-duty engine cooling circuits.',
    engineeringPrinciple: 'Controlled additive release and particulate removal protect wet liners, heat-transfer surfaces, seals, and coolant passages across the service interval.',
    heroImage: '/images/coolant-hero.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['thermacore'],
    supportingTechnologies: [],
    productFamilies: ['coolant-filters'],
    hdPrefix: 'EW7',
    ldPrefix: null,
    relatedStandards: ['ASTM D6210'],
    relatedIndustries: ['trucks-fleets', 'bus-coach', 'power-generation', 'mining', 'construction'],
    relatedSystems: ['lubrication', 'air-intake'],
  },
};

export const PROTECTION_SYSTEM_LIST = Object.values(PROTECTION_SYSTEMS);

export function getProtectionSystemBySlug(slug: string): ProtectionSystem | undefined {
  return PROTECTION_SYSTEM_LIST.find((system) => system.slug === slug);
}
