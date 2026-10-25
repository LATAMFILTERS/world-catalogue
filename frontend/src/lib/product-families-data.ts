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
    purpose: 'Primary engine-air elements carry the normal particulate load in the intake path, reducing dust transport toward the turbocharger, cylinders and combustion circuit while supporting the engine’s required airflow.',
    engineering: 'MACROCORE™ primary filtration combines the specified media architecture, effective filtration area and sealing geometry to manage dust retention, contaminant-holding capacity and intake restriction. Performance and replacement limits require evidence for the actual element and installation.',
    construction: pending, hdProducts: [pending], ldProducts: [pending], heroImage: 'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/fleetguard/page-1/01-20/EA33603.png',
    ...relationships('primary-air'),
  },
  'secondary-air': {
    key: 'secondary-air', name: 'Secondary / Safety Air Elements', slug: 'secondary-air', dutyClass: 'HD+LD', hdPrefix: 'EA1', ldPrefix: 'EA3',
    purpose: 'Secondary or safety engine-air elements, where specified by the intake design, provide an additional downstream contamination barrier during primary-element servicing or loss of primary-element integrity. They are not intended to carry normal dust loading.',
    engineering: 'The MACROCORE™ secondary stage depends on correct downstream placement, media specification, independent sealing and housing fit. A safety element is not a replacement for the primary stage; contamination or damage requires assessment under the equipment manufacturer’s service procedure.',
    construction: pending, hdProducts: [pending], ldProducts: [pending], heroImage: '/images/secondaryfilter.avif',
    ...relationships('secondary-air'),
  },
  'air-cleaner-housings': {
    key: 'air-cleaner-housings', name: 'Air Cleaner Housings', slug: 'air-cleaner-housings', dutyClass: 'HD', hdPrefix: 'EA1', ldPrefix: null,
    purpose: 'Air-cleaner housings establish the mechanical intake boundary: they retain the approved filter elements, route engine airflow and preserve the seals needed to prevent unfiltered air bypass.',
    engineering: 'INTEKCORE™ addresses housing geometry, inlet/outlet orientation, element retention, gasket compression, cover closure and service access. Match the complete assembly to required airflow and allowable restriction; a housing is not itself a particulate-filter medium.',
    construction: pending, hdProducts: [pending], ldProducts: [], heroImage: 'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/fleetguard/page-1/01-20/EA22580-INTEKCORE-approved-opt.png',
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
    purpose: 'Cabin-air elements condition incoming HVAC ventilation air by capturing dust, pollen and airborne particles; odor or selected-gas adsorption applies only to validated activated-carbon configurations.',
    engineering: 'MICROKAPPA™ is the cabin HVAC media architecture. Selection must consider particulate-media configuration, any specified adsorption layer, actual blower airflow, pressure loss, housing sealing and installation direction. Cabin filtration is not respiratory protection or a universal exhaust-gas barrier.',
    construction: pending, hdProducts: [pending], ldProducts: [pending], heroImage: 'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/fleetguard/page-1/01-20/EC10025.png',
    ...relationships('cabin-filters'),
  },
  'fuel-turbine': {
    key: 'fuel-turbine', name: 'Turbine Fuel Separation', slug: 'fuel-turbine', dutyClass: 'HD', hdPrefix: 'ET9', ldPrefix: null,
    purpose: 'Turbine Series FH and FG fuel-separation housings and dedicated replacement elements for approved turbine-style fuel/water separation architecture.',
    engineering: 'TURBOCORE™ exclusively governs the turbine-style FH/FG housing and element architecture. Element family and micron grade must be selected separately: 2010 = 500-series, 2020 = 1000-series, and 2040 = 900-series. Each family may use 2, 10 or 30 µm grades where approved; 2 µm is final filtration, 10 µm secondary filtration, and 30 µm primary filtration. Historical SM/TM/PM suffixes map to 2/10/30 µm. The 2010/2020/2040 number never defines the micron rating by itself. HYDROCORE™ remains reserved for standard non-turbine fuel/water separators.',
    construction: pending, hdProducts: [pending], ldProducts: [], heroImage: '/images/TURBOCORE-hero.avif',
    ...relationships('fuel-turbine'),
  },
  'air-dryer-filters': {
    key: 'air-dryer-filters', name: 'Air Dryer Filters', slug: 'air-dryer-filters', dutyClass: 'HD', hdPrefix: 'ED4', ldPrefix: null,
    purpose: 'Air-dryer cartridges control moisture in approved compressed-air circuits so the downstream pneumatic system receives air conditioned for its operating requirements.',
    engineering: 'DRYCORE™ addresses the validated dryer-cartridge configuration, desiccant capacity, air flow, purge cycle and sealing interfaces. Control of moisture exposure depends on the complete compressor, dryer and pneumatic installation, not on the cartridge alone.',
    construction: pending, hdProducts: [pending], ldProducts: [], heroImage: 'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/fleetguard/page-1/01-20/ED43571.png',
    ...relationships('air-dryer-filters'),
  },
};

export const PRODUCT_FAMILY_LIST = Object.values(PRODUCT_FAMILIES);
export function getFamilyBySlug(slug: string): ProductFamily | undefined { return PRODUCT_FAMILY_LIST.find((family) => family.slug === slug); }
export function getFamiliesByProtectionSystem(systemSlug: string): ProductFamily[] { return PRODUCT_FAMILY_LIST.filter((family) => family.protectionSystem === systemSlug); }
