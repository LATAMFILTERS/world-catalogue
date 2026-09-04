import type { TechnologySlug } from './canonical-technologies';
import { FAMILY_RELATIONSHIPS } from './canonical-relationships';

export type FamilyKey = keyof typeof FAMILY_RELATIONSHIPS;
export type DutyClass = 'HD' | 'LD' | 'HD+LD';

export interface ProductFamily {
  readonly key: FamilyKey;
  readonly name: string;
  readonly slug: string;
  readonly protectionSystem: string;
  readonly primaryTechnology: TechnologySlug;
  readonly dutyClass: DutyClass;
  readonly hdPrefix: string | null;
  readonly ldPrefix: string | null;
  readonly purpose: string;
  readonly engineering: string;
  readonly construction: string;
  readonly applicableStandards: string[];
  readonly hdProducts: string[];
  readonly ldProducts: string[];
  readonly heroImage: string;
}

const pending = 'DOCUMENTATION PENDING';
const relationships = <K extends FamilyKey>(key: K) => {
  const rel = FAMILY_RELATIONSHIPS[key];
  return {
    protectionSystem: rel.system,
    primaryTechnology: rel.technology,
    applicableStandards: [...rel.standards],
  };
};

export const PRODUCT_FAMILIES: Record<FamilyKey, ProductFamily> = {
  'primary-air': {
    key: 'primary-air', name: 'Primary Air', slug: 'primary-air', dutyClass: 'HD+LD', hdPrefix: 'EA1', ldPrefix: 'EA3',
    purpose: 'Primary air elements are the main contamination barrier protecting the combustion chamber from particulate ingestion.',
    engineering: 'MACROCORE™ progressive-density media distributes contaminant loading through the full media depth while balancing efficiency, capacity, and restriction.',
    construction: pending, hdProducts: [pending], ldProducts: [pending], heroImage: '/images/mecanica-air.avif',
    ...relationships('primary-air'),
  },
  'secondary-air': {
    key: 'secondary-air', name: 'Secondary / Safety Air Elements', slug: 'secondary-air', dutyClass: 'HD+LD', hdPrefix: 'EA1', ldPrefix: 'EA3',
    purpose: 'Secondary and safety air elements form the final protective barrier downstream of the primary element when the primary is damaged, overloaded, incorrectly seated, or removed during service.',
    engineering: 'Fine-fibre safety media provides protective redundancy rather than routine dust loading. This single family replaces the former duplicate Safety Elements listing.',
    construction: pending, hdProducts: [pending], ldProducts: [pending], heroImage: '/images/secondaryfilter.avif',
    ...relationships('secondary-air'),
  },
  'air-cleaner-housings': {
    key: 'air-cleaner-housings', name: 'Air Cleaner Housings', slug: 'air-cleaner-housings', dutyClass: 'HD', hdPrefix: 'EA1', ldPrefix: null,
    purpose: 'Air cleaner housings provide the structural enclosure and sealing interface for primary and secondary air elements.',
    engineering: 'INTEKCORE™ housing architecture controls sealing geometry, structural integrity, airflow routing, and protection against bypass at the element-to-housing interface.',
    construction: pending, hdProducts: [pending], ldProducts: [], heroImage: '/images/intekcore(fn).avif',
    ...relationships('air-cleaner-housings'),
  },
  'primary-fuel': {
    key: 'primary-fuel', name: 'Primary Fuel', slug: 'primary-fuel', dutyClass: 'HD+LD', hdPrefix: 'EF9', ldPrefix: 'EF3',
    purpose: 'Primary fuel filters remove sediment, rust, and coarse particulate contamination before fuel reaches the final filtration stage and injection circuit.',
    engineering: 'SYNTAPORE™ media provides staged particulate interception matched to fuel-system cleanliness requirements and service conditions.',
    construction: pending, hdProducts: [pending], ldProducts: [pending], heroImage: '/images/fuel-filter.avif',
    ...relationships('primary-fuel'),
  },
  'secondary-fuel': {
    key: 'secondary-fuel', name: 'Secondary Fuel', slug: 'secondary-fuel', dutyClass: 'HD+LD', hdPrefix: 'EF9', ldPrefix: 'EF3',
    purpose: 'Secondary fuel filters provide final-stage particulate control immediately upstream of the high-pressure pump and injectors.',
    engineering: 'SYNTAPORE™ fine filtration controls the critical particle population that threatens precision injection clearances.',
    construction: pending, hdProducts: [pending], ldProducts: [pending], heroImage: '/images/hero-syntapore.avif',
    ...relationships('secondary-fuel'),
  },
  'fuel-water-separators': {
    key: 'fuel-water-separators', name: 'Fuel Water Separators', slug: 'fuel-water-separators', dutyClass: 'HD', hdPrefix: 'ES9', ldPrefix: null,
    purpose: 'Fuel-water separators remove free and emulsified water while supporting particulate control in diesel fuel systems.',
    engineering: 'HYDROCORE™ combines staged separation, droplet coalescence, water collection, and a final hydrophobic barrier for standard non-turbine spin-on and cartridge fuel/water separator applications.',
    construction: pending, hdProducts: [pending], ldProducts: [], heroImage: '/images/fuellseparator-hero.avif',
    ...relationships('fuel-water-separators'),
  },
  'oil-filters': {
    key: 'oil-filters', name: 'Oil Filters', slug: 'oil-filters', dutyClass: 'HD+LD', hdPrefix: 'EL8', ldPrefix: 'EL3',
    purpose: 'Oil filters control soot agglomerates, wear debris, and oxidation byproducts before lubricant returns to critical interfaces.',
    engineering: 'SYNTRAX™ full-flow composite media balances efficiency, contaminant capacity, pressure drop, and valve integrity across the service interval.',
    construction: pending, hdProducts: [pending], ldProducts: [pending], heroImage: '/images/oil-ld.avif',
    ...relationships('oil-filters'),
  },
  'hydraulic-filters': {
    key: 'hydraulic-filters', name: 'Hydraulic Filters', slug: 'hydraulic-filters', dutyClass: 'HD', hdPrefix: 'EH6', ldPrefix: null,
    purpose: 'Hydraulic filters maintain fluid cleanliness around the tolerance requirements of pumps, valves, actuators, and servo controls.',
    engineering: 'NANOFORCE™ uses Beta-rated media and collapse-resistant construction matched to flow, pressure, particle size, and duty cycle.',
    construction: pending, hdProducts: [pending], ldProducts: [], heroImage: '/images/hidraulic.avif',
    ...relationships('hydraulic-filters'),
  },
  'coolant-filters': {
    key: 'coolant-filters', name: 'Coolant Filters', slug: 'coolant-filters', dutyClass: 'HD', hdPrefix: 'EW7', ldPrefix: null,
    purpose: 'Coolant filters control corrosion products and scale while supporting coolant additive condition in heavy-duty cooling circuits.',
    engineering: 'THERMACORE™ combines controlled additive release with particulate removal to protect liners, seals, passages, and heat-transfer surfaces.',
    construction: pending, hdProducts: [pending], ldProducts: [], heroImage: '/images/coolant-filters.avif',
    ...relationships('coolant-filters'),
  },
  'cabin-filters': {
    key: 'cabin-filters', name: 'Cabin Filters', slug: 'cabin-filters', dutyClass: 'HD+LD', hdPrefix: 'EC1', ldPrefix: 'EC3',
    purpose: 'Cabin filters protect operator and passenger air from particulate, allergens, odors, and selected gaseous contaminants.',
    engineering: 'MICROKAPPA™ combines mechanical and electrostatic particle capture with adsorption layers where required by the application.',
    construction: pending, hdProducts: [pending], ldProducts: [pending], heroImage: '/images/cabin-hero.avif',
    ...relationships('cabin-filters'),
  },
  'fuel-turbine': {
    key: 'fuel-turbine', name: 'Turbine Fuel Separation', slug: 'fuel-turbine', dutyClass: 'HD', hdPrefix: 'ET9', ldPrefix: null,
    purpose: 'Turbine Series FH and FG fuel-separation housings and dedicated replacement elements for approved turbine-style fuel/water separation architecture.',
    engineering: 'TURBOCORE™ exclusively governs the turbine-style FH/FG housing and element architecture. Element family and micron grade must be selected separately: 2010 = 500-series, 2020 = 1000-series, and 2040 = 900-series. Each family may use 2, 10 or 30 µm grades where approved; 2 µm is final filtration, 10 µm secondary filtration, and 30 µm primary filtration. Historical SM/TM/PM suffixes map to 2/10/30 µm. The 2010/2020/2040 number never defines micronage by itself. HYDROCORE™ remains reserved for standard non-turbine fuel/water separators.',
    construction: pending, hdProducts: [pending], ldProducts: [], heroImage: '/images/fuellseparator-hero.avif',
    ...relationships('fuel-turbine'),
  },
  'air-dryer-filters': {
    key: 'air-dryer-filters', name: 'Air Dryer Filters', slug: 'air-dryer-filters', dutyClass: 'HD', hdPrefix: 'ED4', ldPrefix: null,
    purpose: 'Air dryer elements remove water vapor from pneumatic braking and instrument-air systems.',
    engineering: 'DRYCORE™ molecular-sieve desiccant adsorbs water vapor to protect valves, actuators, and pneumatic controls from corrosion and freeze events.',
    construction: pending, hdProducts: [pending], ldProducts: [], heroImage: '/images/airdryer-hero.avif',
    ...relationships('air-dryer-filters'),
  },
};

export const PRODUCT_FAMILY_LIST = Object.values(PRODUCT_FAMILIES);
export function getFamilyBySlug(slug: string): ProductFamily | undefined { return PRODUCT_FAMILY_LIST.find((family) => family.slug === slug); }
export function getFamiliesByProtectionSystem(systemSlug: string): ProductFamily[] { return PRODUCT_FAMILY_LIST.filter((family) => family.protectionSystem === systemSlug); }
