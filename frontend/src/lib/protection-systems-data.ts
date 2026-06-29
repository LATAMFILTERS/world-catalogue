/**
 * protection-systems-data.ts
 * ELIMFILTERS — Product Experience Platform v1.0
 *
 * Authoritative registry for all 7 Protection Systems.
 * Each system is the parent of Engineering Centers, Technology Centers,
 * Product Families, and individual Products.
 *
 * ABSOLUTE RULE: No fabricated data. Unverified fields = "DOCUMENTATION PENDING"
 */

export type ProtectionSystemKey =
  | 'air-intake'
  | 'fuel-cleanliness'
  | 'lubrication'
  | 'hydraulic'
  | 'cooling-system'
  | 'cabin-air'
  | 'compressed-air';

export interface ProtectionSystem {
  readonly key: ProtectionSystemKey;
  readonly name: string;
  readonly slug: string;
  readonly tagline: string;
  readonly overview: string;
  readonly engineeringPrinciple: string;
  readonly heroImage: string;
  readonly heroColor: string; // accent color for the system
  readonly primaryTechnologies: string[]; // technology slugs
  readonly supportingTechnologies: string[]; // technology slugs
  readonly productFamilies: string[]; // family slugs
  readonly hdPrefix: string; // HD product code prefix
  readonly ldPrefix: string | null; // LD product code prefix (null if HD only)
  readonly relatedStandards: string[];
  readonly relatedIndustries: string[]; // industry slugs
  readonly relatedSystems: ProtectionSystemKey[]; // cross-system links
}

export const PROTECTION_SYSTEMS: Record<ProtectionSystemKey, ProtectionSystem> = {

  'air-intake': {
    key: 'air-intake',
    name: 'Air Intake Protection',
    slug: 'air-intake',
    tagline: 'Contamination interception before it reaches the combustion chamber.',
    overview: 'Air Intake Protection is the first defense layer in any contamination control strategy. Every combustion engine requires clean, metered air — any particulate matter that bypasses the intake system reaches the combustion chamber, accelerates cylinder liner and piston ring wear, and shortens engine service life. ELIMFILTERS Air Intake Protection systems are engineered to ISO 5011 standards, delivering 99.9%–99.98% particle interception across the contamination size ranges critical to heavy-duty engine protection.',
    engineeringPrinciple: 'Progressive Density Gradient (PDG) filtration creates layered interception zones. Outer media captures coarse particles (25 µm+) before they load the inner zones. Intermediate layers intercept mid-range particles. The final inner zone captures sub-micron contamination. This graduated architecture extends service life by distributing contaminant loading across the full media depth rather than concentrating it at the surface.',
    heroImage: '/images/mecanica-air.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['macrocore'],
    supportingTechnologies: ['intekcore'],
    productFamilies: ['primary-air', 'secondary-air', 'safety-elements', 'air-cleaner-housings'],
    hdPrefix: 'EA1',
    ldPrefix: 'EA3',
    relatedStandards: ['ISO 5011', 'SAE J1539', 'ISO 16889'],
    relatedIndustries: ['mining', 'agriculture', 'construction', 'trucks-fleets', 'power-generation', 'marine', 'oil-gas'],
    relatedSystems: ['fuel-cleanliness', 'lubrication'],
  },

  'fuel-cleanliness': {
    key: 'fuel-cleanliness',
    name: 'Fuel Cleanliness Protection',
    slug: 'fuel-cleanliness',
    tagline: 'Water and particle elimination before the high-pressure injection circuit.',
    overview: 'Fuel Cleanliness Protection defends the high-pressure common rail injection system — the most precision-sensitive component in any modern diesel engine. Modern HPCR injectors operate at 1,800–2,500 bar with internal tolerances of 1–3 µm. Free or emulsified water at these pressures causes hydraulic fracture, erosion, and microbial contamination. Particulate contamination at sub-micron levels causes progressive injector erosion and metering failure. ELIMFILTERS Fuel Cleanliness systems intercept both threats before the injection circuit.',
    engineeringPrinciple: 'Multi-stage fuel protection combines particle interception with hydrophobic water separation. Primary coalescing media forces emulsified water droplets to merge and fall by gravity to a collection chamber. Secondary hydrophobic barrier media repels remaining water molecules at contact — they cannot pass regardless of differential pressure. Particle media is rated to 2–30 µm depending on injection system sensitivity.',
    heroImage: '/images/fuellseparator-hero.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['syntepore', 'hydrocore', 'turbocore-series'],
    supportingTechnologies: [],
    productFamilies: ['primary-fuel', 'secondary-fuel', 'fuel-water-separators'],
    hdPrefix: 'EF9',
    ldPrefix: 'EF3',
    relatedStandards: ['ASTM D6304', 'ISO 12937', 'ISO 16332', 'ISO 16889'],
    relatedIndustries: ['mining', 'agriculture', 'power-generation', 'marine', 'oil-gas', 'construction', 'trucks-fleets'],
    relatedSystems: ['air-intake', 'lubrication'],
  },

  'lubrication': {
    key: 'lubrication',
    name: 'Lubrication Protection',
    slug: 'lubrication',
    tagline: 'Oil cleanliness maintained across extended service intervals.',
    overview: 'Lubrication Protection maintains engine oil within ISO 4406 cleanliness targets throughout the full service interval. Engine oil degrades through three mechanisms: combustion soot accumulation above 2% by weight reduces viscosity and film strength; metal wear particles from cylinder, bearing, and gear surfaces accelerate abrasive wear in a self-compounding cycle; and fuel dilution reduces lubricant viscosity. ELIMFILTERS Lubrication Protection systems intercept all three degradation mechanisms at the filter element before oil returns to the bearings.',
    engineeringPrinciple: 'Full-flow lube filtration operates on the entire oil volume every engine cycle. High-capacity cellulose-synthetic composite media captures soot, wear debris, and oxidation byproducts at rated efficiency across variable viscosity and temperature conditions. Anti-drain back valves prevent dry-start events. Bypass valves protect the lubrication circuit during cold-start high-viscosity conditions.',
    heroImage: '/images/oil-hand.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['syntrax'],
    supportingTechnologies: [],
    productFamilies: ['oil-filters'],
    hdPrefix: 'EL8',
    ldPrefix: 'EL3',
    relatedStandards: ['ISO 4406', 'ISO 16889', 'DIN 51524'],
    relatedIndustries: ['trucks-fleets', 'mining', 'agriculture', 'construction', 'power-generation', 'marine', 'bus-coach', 'railway'],
    relatedSystems: ['air-intake', 'fuel-cleanliness', 'cooling-system'],
  },

  'hydraulic': {
    key: 'hydraulic',
    name: 'Hydraulic Protection',
    slug: 'hydraulic',
    tagline: 'Sub-micron contamination control in high-pressure hydraulic circuits.',
    overview: 'Hydraulic Protection maintains fluid cleanliness in high-pressure hydraulic systems operating at 200–450 bar. Hydraulic control valves, servo valves, and proportional valves operate with internal clearances of 5–25 µm. Contamination particles within this size range cause valve wear, stiction, and metering failure — leading to equipment downtime and precision loss. ELIMFILTERS Hydraulic Protection systems are rated to ISO 4406 16/14/11 cleanliness targets across the full operating pressure and temperature range.',
    engineeringPrinciple: 'Beta-rated filtration media is rated at specific particle sizes using the ISO 16889 multi-pass test. Beta ratios of 200+ at the rated particle size ensure that less than 0.5% of particles at the rated size pass through the element. Structural reinforcement prevents media collapse under system pressure spikes. Thermal stability maintains rated efficiency across the full hydraulic fluid temperature range.',
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
    tagline: 'SCA restoration and scale prevention in diesel engine cooling circuits.',
    overview: 'Cooling System Protection maintains thermal integrity and liner protection in diesel engine cooling circuits. Supplemental Coolant Additives (SCA) deplete during service, exposing wet cylinder liners to cavitation erosion from pressure waves generated by combustion. Scale and corrosion deposits reduce heat transfer efficiency. ELIMFILTERS Cooling System Protection delivers controlled SCA restoration and particulate removal to maintain liner protection and heat transfer performance across the full coolant service interval.',
    engineeringPrinciple: 'SCA-release technology integrates a controlled-dissolution additive package into the filter element construction. As coolant flows through the element, SCAs dissolve at a controlled rate matched to coolant volume and service interval, maintaining additive concentration within the protection window without requiring separate dosing. Particulate media captures corrosion products and scale debris before they circulate through the cooling circuit.',
    heroImage: '/images/coolant-hero.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['thermacore'],
    supportingTechnologies: [],
    productFamilies: ['coolant-filters'],
    hdPrefix: 'EW7',
    ldPrefix: null,
    relatedStandards: ['ISO 16889', 'ASTM D6210'],
    relatedIndustries: ['trucks-fleets', 'bus-coach', 'power-generation', 'mining', 'construction'],
    relatedSystems: ['lubrication', 'air-intake'],
  },

  'cabin-air': {
    key: 'cabin-air',
    name: 'Cabin Air Protection',
    slug: 'cabin-air',
    tagline: 'PM2.5 and chemical contaminant interception at the operator cabin.',
    overview: 'Cabin Air Protection defends the operator environment in heavy-duty equipment operating in high-dust, high-exhaust industrial sites. Mining cabs, agricultural machinery, and construction equipment expose operators to PM2.5, silica dust, diesel exhaust particulate, and fuel vapour intrusion. ELIMFILTERS Cabin Air Protection removes particulate, allergens, and chemical contaminants from the cabin intake air stream, maintaining an ILO-compliant operator environment in the most demanding industrial settings.',
    engineeringPrinciple: 'Electrostatic filtration charges the filter media to attract oppositely-charged sub-micron particles — including PM2.5 — to the media surface at efficiencies beyond what purely mechanical filtration achieves at equivalent pressure drop. Activated carbon layers adsorb fuel vapours, NOx, and exhaust odour molecules. Multi-layer construction ensures mechanical particle retention as the electrostatic charge depletes over service life.',
    heroImage: '/images/cabin-hero.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['microkappa'],
    supportingTechnologies: [],
    productFamilies: ['cabin-filters'],
    hdPrefix: 'EC1',
    ldPrefix: 'EC3',
    relatedStandards: ['ISO 11155', 'EU Dir. 2019/130'],
    relatedIndustries: ['mining', 'construction', 'trucks-fleets', 'bus-coach', 'agriculture', 'waste-municipal'],
    relatedSystems: ['air-intake'],
  },

  'compressed-air': {
    key: 'compressed-air',
    name: 'Compressed Air Protection',
    slug: 'compressed-air',
    tagline: 'Moisture elimination from pneumatic braking and instrument air systems.',
    overview: 'Compressed Air Protection removes moisture from pneumatic systems in railway, bus, and industrial applications. Pneumatic braking systems are safety-critical — moisture in the air supply causes freeze events, valve corrosion, and actuator failure. Instrument air systems controlling process valves require dry, contaminant-free air per ISO 8573-1. ELIMFILTERS Compressed Air Protection delivers molecular-level moisture removal to Class 1–2 dew point performance.',
    engineeringPrinciple: 'Molecular sieve desiccant adsorbs water vapour from the compressed air stream at the molecular level — a fundamentally different mechanism from coalescing filters which only capture liquid water. The molecular sieve pellet bed captures water molecules at partial pressures below the saturation point, achieving dew points far below freezing. Regular desiccant replacement or regeneration cycles maintain rated performance across the system service life.',
    heroImage: '/images/airdryer-hero.avif',
    heroColor: '#FFF12D',
    primaryTechnologies: ['drycore'],
    supportingTechnologies: [],
    productFamilies: ['air-dryer-filters'],
    hdPrefix: 'ED4',
    ldPrefix: null,
    relatedStandards: ['ISO 8573-1'],
    relatedIndustries: ['railway', 'bus-coach', 'manufacturing', 'oil-gas', 'power-generation'],
    relatedSystems: ['air-intake'],
  },

};

export const PROTECTION_SYSTEM_LIST = Object.values(PROTECTION_SYSTEMS);

export function getProtectionSystemBySlug(slug: string): ProtectionSystem | undefined {
  return PROTECTION_SYSTEM_LIST.find(s => s.slug === slug);
}
