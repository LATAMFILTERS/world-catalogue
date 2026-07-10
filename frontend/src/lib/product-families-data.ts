/**
 * product-families-data.ts
 * ELIMFILTERS — Product Experience Platform v1.0
 *
 * Authoritative registry for Product Families.
 * Each family belongs to a Protection System and anchors one technology.
 * Safety air elements are consolidated publicly under Secondary / Safety Air Elements.
 *
 * HD/LD coding rules enforced per doctrine:
 *   HD Air:      EA1XXXX   LD Air:      EA3XXXX
 *   HD Cabin:    EC1XXXX   LD Cabin:    EC3XXXX
 *   HD Fuel:     EF9XXXX   LD Fuel:     EF3XXXX
 *   HD Lube:     EL8XXXX   LD Lube:     EL3XXXX
 *   HD Hydraulic: EH6XXXX  (no LD)
 *   HD Coolant:  EW7XXXX   (no LD)
 *   HD Air Dryer: ED4XXXX  (no LD)
 *
 * ABSOLUTE RULE: No fabricated data. Unverified = "DOCUMENTATION PENDING"
 */

export type FamilyKey =
  | 'primary-air'
  | 'secondary-air'
  | 'safety-elements'
  | 'air-cleaner-housings'
  | 'primary-fuel'
  | 'secondary-fuel'
  | 'fuel-water-separators'
  | 'oil-filters'
  | 'hydraulic-filters'
  | 'coolant-filters'
  | 'cabin-filters'
  | 'air-dryer-filters';

export type DutyClass = 'HD' | 'LD' | 'HD+LD';

export interface ProductFamily {
  readonly key: FamilyKey;
  readonly name: string;
  readonly slug: string;
  readonly protectionSystem: string;
  readonly primaryTechnology: string;
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

export const PRODUCT_FAMILIES: Record<FamilyKey, ProductFamily> = {

  'primary-air': {
    key: 'primary-air',
    name: 'Primary Air',
    slug: 'primary-air',
    protectionSystem: 'air-intake',
    primaryTechnology: 'macrocore',
    dutyClass: 'HD+LD',
    hdPrefix: 'EA1',
    ldPrefix: 'EA3',
    purpose: 'Primary air filtration elements protect the combustion chamber from particulate ingestion. They are the main contamination barrier in the intake system, installed upstream of the engine air intake. Primary elements carry the full contaminant loading and are the primary service-interval component in the air intake system.',
    engineering: 'Primary air elements use MACROCORE™ progressive density gradient construction. Outer pleat zones capture coarse particles (>25 µm); inner zones intercept fine and sub-micron contamination. The graduated density distributes contaminant loading across the full media depth, extending service intervals beyond single-density cellulose elements.',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 5011', 'SAE J1539'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: ['DOCUMENTATION PENDING'],
    heroImage: '/images/mecanica-air.avif',
  },

  'secondary-air': {
    key: 'secondary-air',
    name: 'Secondary / Safety Air Elements',
    slug: 'secondary-air',
    protectionSystem: 'air-intake',
    primaryTechnology: 'macrocore',
    dutyClass: 'HD+LD',
    hdPrefix: 'EA1',
    ldPrefix: 'EA3',
    purpose: 'Secondary / safety air elements are installed downstream of the primary element as the final safety barrier in heavy-duty air intake systems. They protect the engine if the primary element is damaged, improperly seated, overloaded, or removed during service, preventing unfiltered air from reaching the intake tract.',
    engineering: 'Secondary / safety elements use high-efficiency fine-fibre construction designed to capture residual contamination that passes through a compromised primary element. Their role is protective redundancy, not routine dust loading; the primary element remains the main service-interval component.',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 5011'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: ['DOCUMENTATION PENDING'],
    heroImage: '/images/air-filter1.avif',
  },

  'safety-elements': {
    key: 'safety-elements',
    name: 'Safety Elements',
    slug: 'safety-elements',
    protectionSystem: 'air-intake',
    primaryTechnology: 'macrocore',
    dutyClass: 'HD',
    hdPrefix: 'EA1',
    ldPrefix: null,
    purpose: 'Safety elements provide emergency engine protection during primary element replacement events on heavy-duty equipment operating in extreme contamination environments. They prevent unmetered contaminated air from entering the intake tract during the brief window when the primary element is removed for service.',
    engineering: 'DOCUMENTATION PENDING',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 5011'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: [],
    heroImage: '/images/air-filters-lab.avif',
  },

  'air-cleaner-housings': {
    key: 'air-cleaner-housings',
    name: 'Air Cleaner Housings',
    slug: 'air-cleaner-housings',
    protectionSystem: 'air-intake',
    primaryTechnology: 'intekcore',
    dutyClass: 'HD',
    hdPrefix: 'EA1',
    ldPrefix: null,
    purpose: 'Air cleaner housings provide the structural enclosure for primary and secondary air elements. INTEKCORE™ housings use precision radial seal geometry that eliminates bypass at the element-to-housing interface — the most common source of unfiltered air ingress in field-assembled intake systems.',
    engineering: 'INTEKCORE™ housing architecture uses corrosion-resistant alloy construction with precision-machined sealing surfaces. Radial seal geometry ensures consistent sealing force distribution around the full element circumference regardless of technician torque variation during installation.',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 5011'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: [],
    heroImage: '/images/intekcore(fn).avif',
  },

  'primary-fuel': {
    key: 'primary-fuel',
    name: 'Primary Fuel',
    slug: 'primary-fuel',
    protectionSystem: 'fuel-cleanliness',
    primaryTechnology: 'hydrocore',
    dutyClass: 'HD+LD',
    hdPrefix: 'EF9',
    ldPrefix: 'EF3',
    purpose: 'Primary fuel filters remove particulate contamination from diesel fuel before it enters the injection system. They are the first stage of fuel cleanliness protection, capturing sediment, rust, and coarse contamination from the fuel supply before the fuel reaches the secondary filter and injection circuit.',
    engineering: 'DOCUMENTATION PENDING',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 16889', 'ASTM D6304'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: ['DOCUMENTATION PENDING'],
    heroImage: '/images/fuel-filter.avif',
  },

  'secondary-fuel': {
    key: 'secondary-fuel',
    name: 'Secondary Fuel',
    slug: 'secondary-fuel',
    protectionSystem: 'fuel-cleanliness',
    primaryTechnology: 'hydrocore',
    dutyClass: 'HD+LD',
    hdPrefix: 'EF9',
    ldPrefix: 'EF3',
    purpose: 'Secondary fuel filters provide final-stage precision filtration immediately upstream of the high-pressure injection pump. They capture sub-micron contamination and emulsified water that passed through the primary stage, ensuring that only clean, dry fuel enters the HPCR injection system operating at 1,800–2,500 bar.',
    engineering: 'HYDROCORE™ hydrophobic media construction rejects water molecules at the media surface. Fuel penetrates the synthetic fibre matrix; water molecules are repelled and coalesce at the upstream face, falling by gravity to a collection bowl. Particle interception efficiency is rated at 2 µm for injector clearance protection.',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 16889', 'ASTM D6304', 'ISO 12937'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: ['DOCUMENTATION PENDING'],
    heroImage: '/images/fuelfilter-hero.avif',
  },

  'fuel-water-separators': {
    key: 'fuel-water-separators',
    name: 'Fuel Water Separators',
    slug: 'fuel-water-separators',
    protectionSystem: 'fuel-cleanliness',
    primaryTechnology: 'hydrocore',
    dutyClass: 'HD',
    hdPrefix: 'EF9',
    ldPrefix: null,
    purpose: 'Fuel water separators remove free, emulsified, and dissolved water from diesel fuel in high-volume heavy-duty fuel systems. The HYDROCORE™ series provides advanced water separation for fuel systems in power generation, large-scale mining, and marine applications.',
    engineering: 'HYDROCORE™ water separation architecture: Stage 1 — primary separation removes bulk free water and coarse particles; Stage 2 — graduated coalescence merges emulsified droplets for gravity separation; Stage 3 — hydrophobic barrier intercepts remaining dissolved water.',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 16332', 'ASTM D6304'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: [],
    heroImage: '/images/fuellseparator-hero.avif',
  },

  'oil-filters': {
    key: 'oil-filters',
    name: 'Oil Filters',
    slug: 'oil-filters',
    protectionSystem: 'lubrication',
    primaryTechnology: 'syntrax',
    dutyClass: 'HD+LD',
    hdPrefix: 'EL8',
    ldPrefix: 'EL3',
    purpose: 'Oil filters maintain engine lubricant within ISO 4406 cleanliness targets throughout the full drain interval. They capture combustion soot, metal wear particles, and fuel dilution byproducts — the three primary mechanisms of oil degradation and lubricant film breakdown in diesel, gas, and dual-fuel engines.',
    engineering: 'SYNTRAX™ full-flow lube filtration operates on the entire oil volume every engine cycle. High-capacity composite media maintains rated efficiency across the extended drain intervals (60,000–100,000 km programs) specified by OEM manufacturers. Anti-drain back valves prevent dry-start events. Bypass valves protect bearings during cold-start high-viscosity conditions.',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 4406', 'ISO 16889', 'DIN 51524'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: ['DOCUMENTATION PENDING'],
    heroImage: '/images/oil-ld.avif',
  },

  'hydraulic-filters': {
    key: 'hydraulic-filters',
    name: 'Hydraulic Filters',
    slug: 'hydraulic-filters',
    protectionSystem: 'hydraulic',
    primaryTechnology: 'nanoforce',
    dutyClass: 'HD',
    hdPrefix: 'EH6',
    ldPrefix: null,
    purpose: 'Hydraulic filters maintain fluid cleanliness in high-pressure hydraulic circuits operating at 200–450 bar. They protect servo valves, proportional valves, and hydraulic actuators with internal clearances of 5–25 µm from contamination-induced wear, stiction, and metering failure.',
    engineering: 'NANOFORCE™ multi-layer hydraulic media is Beta-rated per ISO 16889 multi-pass test. Structural reinforcement prevents media collapse under system pressure spikes. Thermal stability maintains rated efficiency across hydraulic fluid temperature range from cold-start to continuous operating temperature.',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 16889', 'ISO 4406', 'NFPA T2.14', 'DIN 51524'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: [],
    heroImage: '/images/hidraulic.avif',
  },

  'coolant-filters': {
    key: 'coolant-filters',
    name: 'Coolant Filters',
    slug: 'coolant-filters',
    protectionSystem: 'cooling-system',
    primaryTechnology: 'thermacore',
    dutyClass: 'HD',
    hdPrefix: 'EW7',
    ldPrefix: null,
    purpose: 'Coolant filters remove corrosion products and scale from diesel engine cooling circuits, and deliver controlled SCA (Supplemental Coolant Additive) restoration to prevent liner pitting, cavitation erosion, and scale deposits. They extend coolant service intervals and protect thermal system integrity in heavy-duty commercial vehicles.',
    engineering: 'THERMACORE™ SCA-release construction integrates a controlled-dissolution additive package matched to coolant volume and service interval. Particulate media removes corrosion and scale debris before they circulate through the cooling circuit and deposit on heat transfer surfaces.',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 16889', 'ASTM D6210'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: [],
    heroImage: '/images/coolant-filters.avif',
  },

  'cabin-filters': {
    key: 'cabin-filters',
    name: 'Cabin Filters',
    slug: 'cabin-filters',
    protectionSystem: 'cabin-air',
    primaryTechnology: 'microkappa',
    dutyClass: 'HD+LD',
    hdPrefix: 'EC1',
    ldPrefix: 'EC3',
    purpose: 'Cabin filters protect the operator environment in heavy-duty equipment operating in high-dust, high-exhaust industrial sites. They remove PM2.5, silica dust, diesel exhaust particulate, allergens, and fuel vapour from the cabin intake air stream, maintaining ILO-compliant air quality for operators in mining, construction, and agricultural equipment.',
    engineering: 'MICROKAPPA™ electrostatic filtration charges the media to attract sub-micron particles including PM2.5 beyond purely mechanical efficiency. Activated carbon adsorbs fuel vapours, NOx, and exhaust odour molecules. Multi-layer construction ensures particle retention across the full service life as electrostatic charge depletes.',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 11155', 'EU Dir. 2019/130'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: ['DOCUMENTATION PENDING'],
    heroImage: '/images/cabin-hero.avif',
  },

  'air-dryer-filters': {
    key: 'air-dryer-filters',
    name: 'Air Dryer Filters',
    slug: 'air-dryer-filters',
    protectionSystem: 'compressed-air',
    primaryTechnology: 'drycore',
    dutyClass: 'HD',
    hdPrefix: 'ED4',
    ldPrefix: null,
    purpose: 'Air dryer filters remove moisture from compressed air in pneumatic braking systems (railway, bus) and instrument air systems (industrial). Moisture in pneumatic braking air is a safety-critical contamination source — freeze events and valve corrosion cause brake actuation failure. DRYCORE™ air dryer elements deliver ISO 8573-1 Class 1–2 dew point performance.',
    engineering: 'DRYCORE™ molecular sieve desiccant adsorbs water vapour at the molecular level — achieving dew points far below freezing in a single pass. Regular cartridge replacement or regeneration maintains rated performance. For railway applications, DRYCORE™ elements are rated to UIC 641 brake system air quality requirements.',
    construction: 'DOCUMENTATION PENDING',
    applicableStandards: ['ISO 8573-1'],
    hdProducts: ['DOCUMENTATION PENDING'],
    ldProducts: [],
    heroImage: '/images/airdryer-hero.avif',
  },

};

export const PRODUCT_FAMILY_LIST = Object.values(PRODUCT_FAMILIES).filter(f => f.key !== 'safety-elements');

export function getFamilyBySlug(slug: string): ProductFamily | undefined {
  return PRODUCT_FAMILY_LIST.find(f => f.slug === slug);
}

export function getFamiliesByProtectionSystem(systemSlug: string): ProductFamily[] {
  return PRODUCT_FAMILY_LIST.filter(f => f.protectionSystem === systemSlug);
}
