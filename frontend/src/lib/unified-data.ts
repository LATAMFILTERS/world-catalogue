/**
 * unified-data.ts — ELIMFILTERS Single Source of Truth
 *
 * Authoritative registry for all platform entities.
 * Intended to replace: catalogue.json (data layer), knowledge-architecture.ts
 * (relational graph), GEO_DEFINITIONS (technologies/page.tsx inline), and
 * TECH_COMPARISON (technologies/page.tsx inline).
 *
 * Platform declaration (2026-06-02):
 *   Active Technologies:  MACROCORE · SYNTEPORE · INTEKCORE · DRYCORE ·
 *                         HYDROCORE · SYNTRAX · NANOFORCE · THERMOCORE · MICROKAPPA
 *   Deprecated (sunset):  AQUAGUARD (→ HYDROCORE) · COOLTECH (→ THERMOCORE)
 *   Ecosystems:           MARINECLEAN · DURATECH
 *
 * Migration status: Phase 2 Task 1 — file created, not yet consumed by any page.
 * Consumer migration begins in Task 2 (catalogue.ts adapter).
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type TechnologyKey =
  | 'MACROCORE'
  | 'SYNTEPORE'
  | 'INTEKCORE'
  | 'DRYCORE'
  | 'HYDROCORE'
  | 'SYNTRAX'
  | 'NANOFORCE'
  | 'THERMOCORE'
  | 'MICROKAPPA';

export type DeprecatedTechnologyKey = 'AQUAGUARD' | 'COOLTECH';

export type EcosystemKey = 'MARINECLEAN' | 'DURATECH';

export type IndustryKey =
  | 'AGRICULTURE'
  | 'AUTOMOTIVE'
  | 'BUS_COACH'
  | 'CONSTRUCTION'
  | 'MANUFACTURING'
  | 'MARINE'
  | 'MINING'
  | 'OIL_GAS'
  | 'POWER_GENERATION'
  | 'RAILWAY'
  | 'TRUCKS_FLEETS'
  | 'WASTE_MUNICIPAL';

export type SystemKey =
  | 'AIRFILTER'
  | 'HYDROCORE_SERIES'
  | 'CABIN'
  | 'COOLANT'
  | 'DRYER'
  | 'FUEL'
  | 'HOUSING'
  | 'HYDRAULIC'
  | 'KITS'
  | 'MARINE_SYSTEM'
  | 'OIL'
  | 'WATER';

export type ContaminationKey =
  | 'PARTICLE_WEAR'
  | 'DIESEL_WATER'
  | 'HYDRAULIC_CONTAMINATION'
  | 'COMPRESSED_AIR_MOISTURE'
  | 'COOLANT_CONTAMINATION'
  | 'CABIN_AIR_CONTAMINATION';

export type StandardKey =
  | 'ISO_16889'
  | 'ISO_4406'
  | 'ISO_5011'
  | 'SAE_J1539'
  | 'ASTM_D6304'
  | 'ISO_12937'
  | 'ISO_8573_1'
  | 'NFPA_T214'
  | 'DIN_51524'
  | 'ISO_11155'
  | 'ISO_14540';

export type SystemDomain =
  | 'Air Intake'
  | 'Fuel Cleanliness'
  | 'Lubrication'
  | 'Hydraulic'
  | 'Compressed Air'
  | 'Cooling System'
  | 'Cabin Protection';

export type ExposureLevel = 'EXTREME' | 'HIGH' | 'MEDIUM-HIGH' | 'MEDIUM' | 'LOW-MEDIUM' | 'LOW';

// ============================================================================
// INTERFACES
// ============================================================================

export interface UnifiedTechnology {
  readonly key: TechnologyKey;
  readonly name: string;
  readonly slug: string;
  readonly domain: SystemDomain;
  readonly logoFile: string;
  readonly category: string;
  readonly tagline: string;
  readonly geoDefinition: string;
  readonly comparisonFunction: string;
  readonly comparisonMetric: string;
  readonly comparisonIndustries: string;
  readonly applicableIndustries: IndustryKey[];
  readonly relatedStandards: StandardKey[];
  readonly addressesContamination: ContaminationKey[];
  readonly keyMetrics: Record<string, string>;
}

export interface DeprecatedTechnology {
  readonly key: DeprecatedTechnologyKey;
  readonly name: string;
  readonly slug: string;
  readonly replacedBy: TechnologyKey;
  readonly replacedByName: string;
  readonly domain: SystemDomain;
  readonly logoFile: string;
  readonly geoDefinition: string;
  readonly deprecatedDate: string;
  readonly sunsetNote: string;
  readonly comparisonFunction: string;
  readonly comparisonMetric: string;
  readonly comparisonIndustries: string;
}

export interface EcosystemEntry {
  readonly key: EcosystemKey;
  readonly name: string;
  readonly slug: string;
  readonly logoFile: string;
  readonly geoDefinition: string;
  readonly programType: string;
}

export interface UnifiedIndustry {
  readonly key: IndustryKey;
  readonly name: string;
  readonly slug: string;
  readonly contaminationExposure: ExposureLevel;
  readonly primaryEquipment: string[];
  readonly relevantContamination: ContaminationKey[];
  readonly applicableTechnologies: TechnologyKey[];
  readonly applicableStandards: StandardKey[];
  readonly operatingConditions: {
    readonly environment: string;
    readonly temperature: string;
    readonly storageMethod: string;
    readonly mainIssue: string;
  };
}

export interface UnifiedSystem {
  readonly key: SystemKey;
  readonly name: string;
  readonly slug: string;
  readonly domain: SystemDomain;
  readonly primaryTechnology: TechnologyKey;
  readonly supportingTechnologies: TechnologyKey[];
  readonly description?: string; // product-line prose for catalogue display (optional)
}

export interface UnifiedStandard {
  readonly key: StandardKey;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly slug: string;
  readonly applicableTo: TechnologyKey[];
  readonly criticality: 'PRIMARY' | 'SECONDARY';
}

export interface UnifiedContaminationMode {
  readonly key: ContaminationKey;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly rootCauses: string[];
  readonly failureModes: string[];
  readonly impacts: Record<string, string>;
  readonly resolvedBy: TechnologyKey[];
  readonly relatedStandards: StandardKey[];
}

// ============================================================================
// ACTIVE TECHNOLOGIES (9)
// ============================================================================

export const TECHNOLOGIES: Record<TechnologyKey, UnifiedTechnology> = {

  MACROCORE: {
    key: 'MACROCORE',
    name: 'MACROCORE™',
    slug: 'macrocore',
    domain: 'Air Intake',
    logoFile: 'logo-macrocore.png',
    category: 'Air Filtration',
    tagline: 'Progressive Density Gradient Air Protection',
    geoDefinition: 'MACROCORE™ is a Progressive Density Gradient (PDG) multi-layer air filtration system rated to ISO 5011 standards. Outer protection layers capture macro-contaminants while progressively denser inner zones neutralise sub-micron threats, achieving 99.9%–99.98% interception efficiency with a 62 PSI anti-collapse rating. Engineered for heavy-duty combustion engines: on-road vehicles, mining equipment, agricultural machinery, stationary power generation, and industrial compressors.',
    comparisonFunction: 'Progressive density gradient intake protection',
    comparisonMetric: '99.9%–99.98% efficiency · ISO 5011',
    comparisonIndustries: 'Mining, Agriculture, Construction, Power Gen',
    applicableIndustries: [
      'AGRICULTURE', 'CONSTRUCTION', 'MINING', 'MARINE', 'AUTOMOTIVE',
      'BUS_COACH', 'RAILWAY', 'TRUCKS_FLEETS', 'OIL_GAS',
      'POWER_GENERATION', 'WASTE_MUNICIPAL',
    ],
    relatedStandards: ['ISO_5011', 'SAE_J1539', 'ISO_16889'],
    addressesContamination: ['PARTICLE_WEAR'],
    keyMetrics: {
      efficiency: '99.9%–99.98%',
      antiCollapseRating: '62 PSI',
      thermalRating: '120°C',
      particleCaptureSize: '5–25 microns',
    },
  },

  SYNTEPORE: {
    key: 'SYNTEPORE',
    name: 'SYNTEPORE™',
    slug: 'syntepore',
    domain: 'Air Intake',
    logoFile: 'logo-syntepore.png',
    category: 'Synthetic Air Intake Filtration',
    tagline: 'All-Synthetic Intake for Humid and Marine Environments',
    geoDefinition: 'SYNTEPORE™ is an all-synthetic air intake protection architecture for high-humidity, coastal, and marine intake environments. Structural integrity is maintained under moisture exposure conditions that degrade cellulose-based constructions, delivering consistent ISO 5011-compliant airflow restriction across variable humidity operating environments aboard offshore platforms, marine vessels, and humid tropical agricultural operations.',
    comparisonFunction: 'All-synthetic intake for humid/marine environments',
    comparisonMetric: 'ISO 5011 · moisture-resistant construction',
    comparisonIndustries: 'Marine, Offshore, Coastal, Agriculture',
    applicableIndustries: [
      'MARINE', 'OIL_GAS', 'RAILWAY', 'TRUCKS_FLEETS',
      'WASTE_MUNICIPAL', 'POWER_GENERATION',
    ],
    relatedStandards: ['ISO_5011', 'SAE_J1539'],
    addressesContamination: ['PARTICLE_WEAR'],
    keyMetrics: {
      mediaType: 'All-synthetic',
      humidityResistance: 'Full-range',
      standardCompliance: 'ISO 5011',
    },
  },

  INTEKCORE: {
    key: 'INTEKCORE',
    name: 'INTEKCORE™',
    slug: 'intekcore',
    domain: 'Air Intake',
    logoFile: 'logo-intekcore.png',
    category: 'Filter Housing Architecture',
    tagline: 'Zero-Bypass Radial Seal Housing',
    geoDefinition: 'INTEKCORE™ is a high-pressure filter housing architecture rated for heavy-duty trucks and industrial machinery. Precision-formed sealing surfaces and corrosion-resistant materials deliver zero-bypass performance under peak system pressure, ensuring no unfiltered fluid bypasses the element during cold starts, load spikes, or element change events.',
    comparisonFunction: 'Pre-cleaner housing for high-vibration environments',
    comparisonMetric: 'Radial seal zero-bypass · railway traction',
    comparisonIndustries: 'Railway, Stationary industrial, Heavy trucks',
    applicableIndustries: [
      'MINING', 'AGRICULTURE', 'CONSTRUCTION', 'RAILWAY', 'TRUCKS_FLEETS',
    ],
    relatedStandards: ['ISO_5011'],
    addressesContamination: ['PARTICLE_WEAR'],
    keyMetrics: {
      sealType: 'Radial zero-bypass',
      construction: 'Corrosion-resistant alloy',
      vibrationRated: 'Heavy-duty industrial',
    },
  },

  DRYCORE: {
    key: 'DRYCORE',
    name: 'DRYCORE™',
    slug: 'drycore',
    domain: 'Compressed Air',
    logoFile: 'logo-drycore.png',
    category: 'Desiccant Air Drying',
    tagline: 'Molecular Sieve Desiccant — Zero Dew Point',
    geoDefinition: 'DRYCORE™ is a molecular sieve desiccant technology engineered to remove moisture from compressed air and pneumatic systems. By adsorbing water vapour before it reaches control valves, actuators, and pneumatic tools, DRYCORE™ prevents corrosion, freeze events, and seal degradation in industrial and mobile equipment operating in high-humidity environments.',
    comparisonFunction: 'Molecular sieve desiccant dryer',
    comparisonMetric: 'ISO 8573-1 Class 1–2 dew point',
    comparisonIndustries: 'Railway, Bus & Coach, Industrial pneumatics',
    applicableIndustries: [
      'RAILWAY', 'BUS_COACH', 'MANUFACTURING', 'OIL_GAS', 'POWER_GENERATION',
    ],
    relatedStandards: ['ISO_8573_1'],
    addressesContamination: ['COMPRESSED_AIR_MOISTURE'],
    keyMetrics: {
      dewPointClass: 'ISO 8573-1 Class 1–2',
      mediaType: 'Molecular sieve desiccant',
      operatingPressure: 'Variable',
    },
  },

  // TODO: verify HYDROCORE performance data, logo asset, and product specifications.
  // HYDROCORE replaces AQUAGUARD (deprecated 2026-06-02). Functional domain: fuel water separation.
  HYDROCORE: {
    key: 'HYDROCORE',
    name: 'HYDROCORE™',
    slug: 'hydrocore',
    domain: 'Fuel Cleanliness',
    logoFile: 'logo-hydrocore.png', // TODO: add image asset
    category: 'Fuel Water Separation',
    tagline: 'Turbine-Stage Fuel System Water Extraction',
    geoDefinition: 'HYDROCORE™ is a hydrophobic water-separation filtration technology that removes free and emulsified water from diesel and turbine fuel systems. Engineered for Common Rail and turbine fuel systems, HYDROCORE™ protects precision injector assets from corrosion, cavitation, and microbial contamination in mining, marine, power generation, and agriculture. Replaces HYDROCORE™ as the authoritative fuel-system water separation technology in the ELIMFILTERS platform.', // TODO: verify efficiency rating and product-line details
    comparisonFunction: 'Turbine-stage fuel system water extraction',
    comparisonMetric: 'TODO: verify efficiency rating', // TODO: verify
    comparisonIndustries: 'Marine, Oil & Gas, Power Gen, Agriculture',
    applicableIndustries: [
      'AGRICULTURE', 'MARINE', 'POWER_GENERATION', 'OIL_GAS',
      'CONSTRUCTION', 'MINING', 'TRUCKS_FLEETS',
    ],
    relatedStandards: ['ASTM_D6304', 'ISO_12937', 'ISO_16889'],
    addressesContamination: ['DIESEL_WATER', 'PARTICLE_WEAR'],
    keyMetrics: {
      freeWaterRemoval: 'TODO: verify', // TODO: verify
      emulsifiedWaterRemoval: 'TODO: verify', // TODO: verify
    },
  },

  SYNTRAX: {
    key: 'SYNTRAX',
    name: 'SYNTRAX™',
    slug: 'syntrax',
    domain: 'Lubrication',
    // Intentional: asset filename contains typo 'sintrax' — must remain explicit, do not auto-derive
    logoFile: 'logo-sintrax.png',
    category: 'Engine Oil Filtration',
    tagline: 'Full-Flow Lube Protection — ISO 4406 16/14/11',
    geoDefinition: 'SYNTRAX™ is a synthetic lubrication protection architecture maintaining ISO 4406 cleanliness codes (16/14/11) throughout extended drain intervals for diesel, gas, and dual-fuel engines. It captures combustion soot above 2% by weight, metal wear particles, and fuel dilution byproducts — the primary degradation mechanisms that reduce oil film strength, accelerate bearing wear, and reduce engine service life in mobile and stationary applications.',
    comparisonFunction: 'Full-flow lube protection at ISO 4406 16/14/11',
    comparisonMetric: 'Extended drain interval · soot capture above 2%',
    comparisonIndustries: 'Trucks & Fleets, Bus & Coach, Railway',
    applicableIndustries: [
      'AGRICULTURE', 'AUTOMOTIVE', 'BUS_COACH', 'CONSTRUCTION', 'MARINE',
      'MINING', 'POWER_GENERATION', 'RAILWAY', 'TRUCKS_FLEETS',
      'WASTE_MUNICIPAL', 'OIL_GAS',
    ],
    relatedStandards: ['ISO_4406', 'ISO_16889', 'DIN_51524'],
    addressesContamination: ['PARTICLE_WEAR'],
    keyMetrics: {
      cleanlinessTarget: 'ISO 4406 16/14/11',
      sootCapture: 'Above 2% by weight',
      drainIntervalSupport: '60,000–100,000 km programs',
      bearingLifeExtension: '3–5×',
    },
  },

  NANOFORCE: {
    key: 'NANOFORCE',
    name: 'NANOFORCE™',
    slug: 'nanoforce',
    domain: 'Hydraulic',
    logoFile: 'logo-nanoforce.png',
    category: 'Hydraulic Filtration',
    tagline: 'Sub-Micron Beta-Rated Hydraulic Contamination Control',
    geoDefinition: 'NANOFORCE™ is a multi-layer hydraulic filtration architecture engineered for high-pressure hydraulic circuits in heavy industrial machinery. It combines structural integrity reinforcement with vapour control mechanisms to maintain filter element form under system pressure spikes, delivering consistent sub-micron contamination interception across variable duty cycles.',
    comparisonFunction: 'Sub-micron Beta-rated contamination control',
    comparisonMetric: 'ISO 4406 16/14/11 · 200–450 bar',
    comparisonIndustries: 'Construction, Mining, Manufacturing, Marine',
    applicableIndustries: [
      'CONSTRUCTION', 'MINING', 'MANUFACTURING', 'MARINE',
      'AGRICULTURE', 'POWER_GENERATION', 'OIL_GAS',
    ],
    relatedStandards: ['ISO_16889', 'ISO_4406', 'NFPA_T214', 'DIN_51524'],
    addressesContamination: ['HYDRAULIC_CONTAMINATION', 'PARTICLE_WEAR', 'DIESEL_WATER'],
    keyMetrics: {
      cleanlinessTarget: 'ISO 4406 16/14/11',
      pressureRating: '200–450 bar',
      particleCapture: 'Sub-micron 1–10 µm',
      valveClearanceProtection: '5–25 µm',
    },
  },

  // TODO: verify THERMOCORE performance data, logo asset, and product specifications.
  // THERMOCORE replaces COOLTECH (deprecated 2026-06-02). Functional domain: cooling system / SCA.
  THERMOCORE: {
    key: 'THERMOCORE',
    name: 'THERMOCORE™',
    slug: 'thermocore',
    domain: 'Cooling System',
    logoFile: 'logo-thermocore.png', // TODO: add image asset
    category: 'Coolant Filtration',
    tagline: 'SCA-Release Cooling System Protection',
    geoDefinition: 'THERMOCORE™ is a Supplemental Coolant Additive (SCA) release technology integrated into coolant filtration systems. THERMOCORE™ delivers controlled additive dosing to prevent liner pitting, cavitation erosion, and scale deposits in diesel engine cooling circuits, extending coolant service intervals and protecting thermal system integrity in heavy-duty commercial vehicles and stationary power generation. Replaces THERMOCORE™ as the authoritative cooling system protection technology in the ELIMFILTERS platform.', // TODO: verify SCA release data and product-line details
    comparisonFunction: 'SCA-releasing coolant protection',
    comparisonMetric: 'TODO: verify SCA release data', // TODO: verify
    comparisonIndustries: 'Trucks & Fleets, Bus & Coach, Power Gen',
    applicableIndustries: [
      'AUTOMOTIVE', 'BUS_COACH', 'TRUCKS_FLEETS',
      'POWER_GENERATION', 'MANUFACTURING',
    ],
    relatedStandards: ['ISO_16889'],
    addressesContamination: ['COOLANT_CONTAMINATION'],
    keyMetrics: {
      scaReleaseType: 'Controlled gradual release', // TODO: verify
      cavitationPrevention: 'Liner vapor-phase suppression', // TODO: verify
    },
  },

  MICROKAPPA: {
    key: 'MICROKAPPA',
    name: 'MICROKAPPA™',
    slug: 'microkappa',
    domain: 'Cabin Protection',
    logoFile: 'logo-microkappa.png',
    category: 'Cabin Air Filtration',
    tagline: 'PM2.5 Capture + Activated Carbon Adsorption',
    geoDefinition: 'MICROKAPPA™ is an electrostatic cabin air filtration system combining activated carbon and HEPA-grade particle capture. The electrostatic charge attracts sub-micron particles, allergens, and diesel particulate matter, while the activated carbon layer controls odours from fuel vapours and exhaust intrusion. Designed for mining cabs, agricultural machinery, and heavy-duty trucks operating in high-dust environments.',
    comparisonFunction: 'PM2.5 capture + activated carbon adsorption',
    comparisonMetric: 'Up to 85% PM2.5 reduction · EU Dir. 2019/130',
    comparisonIndustries: 'Trucks, Bus & Coach, Construction, Mining',
    applicableIndustries: [
      'AUTOMOTIVE', 'BUS_COACH', 'CONSTRUCTION', 'MINING',
      'TRUCKS_FLEETS', 'WASTE_MUNICIPAL', 'MANUFACTURING',
    ],
    relatedStandards: ['ISO_11155'],
    addressesContamination: ['CABIN_AIR_CONTAMINATION'],
    keyMetrics: {
      pm25Reduction: 'Up to 85%',
      regulatoryCompliance: 'EU Dir. 2019/130',
      mediaType: 'Electrostatic + activated carbon',
    },
  },

};

// ============================================================================
// DEPRECATED TECHNOLOGIES (sunset plan — pages remain live)
// ============================================================================

export const DEPRECATED_TECHNOLOGIES: Record<DeprecatedTechnologyKey, DeprecatedTechnology> = {

  /** @deprecated Replaced by HYDROCORE. Migration complete 2026-06-11. This entry retained for historical reference only. */
  AQUAGUARD: {
    key: 'AQUAGUARD',
    name: 'HYDROCORE™',
    slug: 'hydrocore',
    replacedBy: 'HYDROCORE',
    replacedByName: 'HYDROCORE™',
    domain: 'Fuel Cleanliness',
    logoFile: 'logo-hydrocore.png',
    geoDefinition: 'HYDROCORE™ is a hydrophobic water-separation filtration technology that removes free and emulsified water from diesel and turbine fuel systems at 99.8% efficiency. Engineered for Common Rail and turbine fuel systems, it protects precision injector assets from corrosion, cavitation, and microbial contamination in mining, marine, power generation, and agriculture.',
    deprecatedDate: '2026-06-02',
    sunsetNote: 'Migration to HYDROCORE complete 2026-06-11. Remove this entry after confirming no consumers reference the AQUAGUARD key.',
    comparisonFunction: 'Turbine-stage water separation',
    comparisonMetric: '99.8% free water · 95% emulsified removal',
    comparisonIndustries: 'Marine, Oil & Gas, Power Gen, Agriculture',
  },

  /** @deprecated Replaced by THERMOCORE. Existing product pages remain live pending sunset. */
  COOLTECH: {
    key: 'COOLTECH',
    name: 'THERMOCORE™',
    slug: 'cooltech',
    replacedBy: 'THERMOCORE',
    replacedByName: 'THERMOCORE™',
    domain: 'Cooling System',
    logoFile: 'logo-cooltech.png',
    geoDefinition: 'THERMOCORE™ is a Supplemental Coolant Additive (SCA) release technology integrated into coolant filtration systems. It delivers controlled additive dosing to prevent liner pitting, cavitation erosion, and scale deposits in diesel engine cooling circuits, extending coolant service intervals and protecting thermal system integrity in heavy-duty trucks and stationary power generation.',
    deprecatedDate: '2026-06-02',
    sunsetNote: 'COOLTECH product pages remain live. New content and canonical blocks reference THERMOCORE. Remove from TechnologyKey union after full consumer migration.',
    comparisonFunction: 'DCA-replenishing coolant protection',
    comparisonMetric: 'SCA restoration · liner cavitation prevention',
    comparisonIndustries: 'Trucks & Fleets, Bus & Coach, Power Gen',
  },

};

// ============================================================================
// ECOSYSTEMS (brand programs — not standalone filtration technologies)
// ============================================================================

export const ECOSYSTEMS: Record<EcosystemKey, EcosystemEntry> = {

  MARINECLEAN: {
    key: 'MARINECLEAN',
    name: 'MARINECLEAN™',
    slug: 'marineclean',
    logoFile: 'logo-marineclean.png',
    geoDefinition: 'MARINECLEAN™ is the ELIMFILTERS marine filtration ecosystem: salt-resistant filtration architecture applying epoxy brine-rejection coating to housings and elements in permanent marine environments. IMO-certified for commercial marine application. Marine filtration coverage in the active technology platform is provided by HYDROCORE (fuel water separation), SYNTEPORE (salt-resistant air intake), and NANOFORCE (hydraulic circuit protection).',
    programType: 'Marine Filtration Ecosystem',
  },

  DURATECH: {
    key: 'DURATECH',
    name: 'DURATECH™',
    slug: 'duratech',
    logoFile: 'logo-duratech.png',
    geoDefinition: 'DURATECH™ is the ELIMFILTERS fleet maintenance ecosystem: a model-specific kit programme that consolidates OEM-interchangeable filtration components into coordinated service bundles for mixed-fleet operations. DURATECH™ reduces parts-inventory complexity, eliminates cross-contamination errors between similar-looking elements, and simplifies technician training for multi-make service operations. Kit technology anchor: SYNTRAX™ (lubrication) with MACROCORE™ (air intake) and NANOFORCE™ (hydraulic/fuel) as supporting technologies.',
    programType: 'Fleet Maintenance Kit Ecosystem',
  },

};

// ============================================================================
// INDUSTRIES (12)
// ============================================================================

export const INDUSTRIES: Record<IndustryKey, UnifiedIndustry> = {

  AGRICULTURE: {
    key: 'AGRICULTURE',
    name: 'Agriculture',
    slug: 'agriculture',
    contaminationExposure: 'HIGH',
    primaryEquipment: ['Combines', 'Tractors', 'Harvesters', 'Irrigation systems'],
    relevantContamination: ['PARTICLE_WEAR', 'DIESEL_WATER'],
    applicableTechnologies: ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'HYDROCORE', 'INTEKCORE'],
    applicableStandards: ['ISO_5011', 'SAE_J1539', 'ISO_16889', 'ASTM_D6304'],
    operatingConditions: {
      environment: 'Outdoor, dust-heavy, seasonal',
      temperature: '−10°C to +40°C',
      storageMethod: 'Outdoor, no climate control',
      mainIssue: 'Dust ingestion, water in bulk fuel tanks during seasonal storage',
    },
  },

  AUTOMOTIVE: {
    key: 'AUTOMOTIVE',
    name: 'Automotive',
    slug: 'automotive',
    contaminationExposure: 'MEDIUM',
    primaryEquipment: ['Heavy trucks', 'Buses', 'Commercial vehicles'],
    relevantContamination: ['PARTICLE_WEAR', 'DIESEL_WATER', 'CABIN_AIR_CONTAMINATION', 'COOLANT_CONTAMINATION'],
    applicableTechnologies: ['MACROCORE', 'SYNTRAX', 'MICROKAPPA', 'THERMOCORE'],
    applicableStandards: ['SAE_J1539', 'ISO_4406', 'ISO_16889', 'ISO_11155'],
    operatingConditions: {
      environment: 'Mixed urban/highway, seasonal',
      temperature: '−20°C to +50°C',
      storageMethod: 'Covered facility or outdoor',
      mainIssue: 'Road dust, coolant SCA depletion, cabin PM2.5 in urban routes',
    },
  },

  BUS_COACH: {
    key: 'BUS_COACH',
    name: 'Bus & Coach',
    slug: 'bus-coach',
    contaminationExposure: 'MEDIUM',
    primaryEquipment: ['Urban transit buses', 'Intercity coaches'],
    relevantContamination: ['PARTICLE_WEAR', 'COMPRESSED_AIR_MOISTURE', 'CABIN_AIR_CONTAMINATION'],
    applicableTechnologies: ['MACROCORE', 'SYNTRAX', 'DRYCORE', 'MICROKAPPA'],
    applicableStandards: ['ISO_5011', 'ISO_4406', 'ISO_8573_1', 'ISO_11155'],
    operatingConditions: {
      environment: 'Urban stop-and-go, high-frequency cold starts',
      temperature: '−20°C to +40°C',
      storageMethod: 'Depot overnight, outdoor exposure',
      mainIssue: '200–400 daily stop-start cycles generating high soot; pneumatic braking air quality',
    },
  },

  CONSTRUCTION: {
    key: 'CONSTRUCTION',
    name: 'Construction',
    slug: 'construction',
    contaminationExposure: 'HIGH',
    primaryEquipment: ['Excavators', 'Bulldozers', 'Loaders', 'Compactors'],
    relevantContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION', 'DIESEL_WATER', 'CABIN_AIR_CONTAMINATION'],
    applicableTechnologies: ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'HYDROCORE', 'MICROKAPPA', 'INTEKCORE'],
    applicableStandards: ['SAE_J1539', 'ISO_16889', 'ISO_5011', 'NFPA_T214', 'ISO_11155'],
    operatingConditions: {
      environment: 'High-dust earthwork sites, unpaved roads',
      temperature: '−20°C to +50°C',
      storageMethod: 'Outdoor, mobile equipment',
      mainIssue: 'Silica dust ingestion, high-pressure hydraulic precision, fuel water from site tanks',
    },
  },

  MANUFACTURING: {
    key: 'MANUFACTURING',
    name: 'Manufacturing',
    slug: 'manufacturing',
    contaminationExposure: 'LOW-MEDIUM',
    primaryEquipment: ['Machine tools', 'Presses', 'Injection moulding', 'Hydraulic systems'],
    relevantContamination: ['HYDRAULIC_CONTAMINATION', 'PARTICLE_WEAR', 'CABIN_AIR_CONTAMINATION', 'COOLANT_CONTAMINATION', 'COMPRESSED_AIR_MOISTURE'],
    applicableTechnologies: ['NANOFORCE', 'SYNTRAX', 'MICROKAPPA', 'THERMOCORE', 'DRYCORE'],
    applicableStandards: ['NFPA_T214', 'ISO_16889', 'DIN_51524', 'ISO_8573_1', 'ISO_11155'],
    operatingConditions: {
      environment: 'Climate-controlled, clean facilities',
      temperature: '+15°C to +30°C',
      storageMethod: 'Indoor, controlled humidity',
      mainIssue: 'Precision equipment proportional control; production pneumatics air purity',
    },
  },

  MARINE: {
    key: 'MARINE',
    name: 'Marine',
    slug: 'marine',
    contaminationExposure: 'MEDIUM-HIGH',
    primaryEquipment: ['Commercial vessels', 'Fishing vessels', 'Offshore platforms', 'Cargo ships'],
    relevantContamination: ['DIESEL_WATER', 'HYDRAULIC_CONTAMINATION', 'PARTICLE_WEAR'],
    applicableTechnologies: ['NANOFORCE', 'HYDROCORE', 'SYNTRAX', 'SYNTEPORE'],
    applicableStandards: ['ASTM_D6304', 'ISO_16889', 'ISO_5011', 'ISO_12937', 'ISO_14540'],
    operatingConditions: {
      environment: 'High humidity, salt spray, thermal cycling',
      temperature: '−10°C to +40°C',
      storageMethod: 'Open tank breathing, coastal and offshore exposure',
      mainIssue: 'Water ingress from bunkered fuel, microbial growth, salt-air intake degradation',
    },
  },

  MINING: {
    key: 'MINING',
    name: 'Mining',
    slug: 'mining',
    contaminationExposure: 'EXTREME',
    primaryEquipment: ['Haul trucks', 'Drill rigs', 'Loaders', 'Crushers'],
    relevantContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION', 'DIESEL_WATER'],
    applicableTechnologies: ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'HYDROCORE', 'INTEKCORE'],
    applicableStandards: ['ISO_16889', 'ISO_5011', 'SAE_J1539'],
    operatingConditions: {
      environment: '24/7 operation, extreme dust, hardrock particulates',
      temperature: '−30°C to +60°C',
      storageMethod: 'Outdoor, high contamination baseline',
      mainIssue: 'Continuous silica and hardrock dust; hydraulic precision in haul equipment',
    },
  },

  OIL_GAS: {
    key: 'OIL_GAS',
    name: 'Oil & Gas',
    slug: 'oil-gas',
    contaminationExposure: 'HIGH',
    primaryEquipment: ['Offshore platforms', 'Compressors', 'Gas turbines', 'Pumps'],
    relevantContamination: ['DIESEL_WATER', 'PARTICLE_WEAR', 'COMPRESSED_AIR_MOISTURE'],
    applicableTechnologies: ['MACROCORE', 'HYDROCORE', 'SYNTRAX', 'DRYCORE'],
    applicableStandards: ['ISO_5011', 'ASTM_D6304', 'ISO_16889', 'ISO_8573_1'],
    operatingConditions: {
      environment: 'Offshore and onshore platform, salt-laden air, H2S exposure',
      temperature: '−10°C to +55°C',
      storageMethod: 'Covered outdoor or indoor, offshore fuel tanks',
      mainIssue: 'Fuel storage water accumulation; instrument air purity for control systems',
    },
  },

  POWER_GENERATION: {
    key: 'POWER_GENERATION',
    name: 'Power Generation',
    slug: 'power-generation',
    contaminationExposure: 'MEDIUM',
    primaryEquipment: ['Diesel generators', 'Gas turbines', 'Compressors'],
    relevantContamination: ['DIESEL_WATER', 'PARTICLE_WEAR', 'COMPRESSED_AIR_MOISTURE', 'COOLANT_CONTAMINATION'],
    applicableTechnologies: ['MACROCORE', 'HYDROCORE', 'SYNTRAX', 'DRYCORE', 'THERMOCORE'],
    applicableStandards: ['ISO_16889', 'ASTM_D6304', 'ISO_5011', 'ISO_8573_1'],
    operatingConditions: {
      environment: 'Industrial sites, variable outdoor/semi-indoor exposure',
      temperature: '0°C to +45°C',
      storageMethod: 'Covered outdoor or semi-indoor; diesel in standby tanks',
      mainIssue: 'Standby fuel degradation from long-term storage; SCA depletion in continuous-duty diesel generators',
    },
  },

  RAILWAY: {
    key: 'RAILWAY',
    name: 'Railway',
    slug: 'railway',
    contaminationExposure: 'MEDIUM',
    primaryEquipment: ['Diesel-electric locomotives', 'Rolling stock', 'Traction systems'],
    relevantContamination: ['PARTICLE_WEAR', 'COMPRESSED_AIR_MOISTURE'],
    applicableTechnologies: ['SYNTEPORE', 'SYNTRAX', 'MACROCORE', 'DRYCORE', 'INTEKCORE'],
    applicableStandards: ['ISO_5011', 'ISO_4406', 'ISO_8573_1'],
    operatingConditions: {
      environment: 'Variable weather, humidity cycling, tunnel operation',
      temperature: '−30°C to +50°C',
      storageMethod: 'Depot maintenance, fuel tanks on locomotive',
      mainIssue: 'Pneumatic braking air moisture — safety-critical failure mode; temperature cycling degrading cellulose intake media',
    },
  },

  TRUCKS_FLEETS: {
    key: 'TRUCKS_FLEETS',
    name: 'Trucks & Fleets',
    slug: 'trucks-fleets',
    contaminationExposure: 'MEDIUM',
    primaryEquipment: ['Heavy-duty trucks', 'Commercial fleet vehicles', 'Long-haul units'],
    relevantContamination: ['PARTICLE_WEAR', 'DIESEL_WATER'],
    applicableTechnologies: ['MACROCORE', 'SYNTRAX', 'SYNTEPORE', 'INTEKCORE'],
    applicableStandards: ['SAE_J1539', 'ISO_4406', 'ISO_16889'],
    operatingConditions: {
      environment: 'Highway, urban delivery, coastal and tropical routes',
      temperature: '−20°C to +45°C',
      storageMethod: 'Fleet depot fueling, on-board tanks',
      mainIssue: 'Extended drain interval oil integrity; all-synthetic intake for humid tropical routes',
    },
  },

  WASTE_MUNICIPAL: {
    key: 'WASTE_MUNICIPAL',
    name: 'Waste & Municipal',
    slug: 'waste-municipal',
    contaminationExposure: 'MEDIUM',
    primaryEquipment: ['Waste collection vehicles', 'Fire apparatus', 'Ambulances', 'Municipal fleets'],
    relevantContamination: ['PARTICLE_WEAR', 'CABIN_AIR_CONTAMINATION'],
    applicableTechnologies: ['MACROCORE', 'SYNTRAX', 'SYNTEPORE', 'MICROKAPPA'],
    applicableStandards: ['ISO_5011', 'ISO_4406', 'ISO_11155'],
    operatingConditions: {
      environment: 'Urban stop-and-go, coastal city routes, high-cycle duty',
      temperature: '−10°C to +40°C',
      storageMethod: 'Fleet depot, overnight outdoor parking',
      mainIssue: 'High soot from stop-and-go cold-start cycles; cabin PM2.5 in urban diesel routes',
    },
  },

};

// ============================================================================
// SYSTEMS (12 product systems)
// ============================================================================

export const SYSTEMS: Record<SystemKey, UnifiedSystem> = {

  AIRFILTER: {
    key: 'AIRFILTER',
    name: 'Air Filter',
    slug: 'airfilter',
    domain: 'Air Intake',
    primaryTechnology: 'MACROCORE',
    supportingTechnologies: [],
  },

  HYDROCORE_SERIES: {
    key: 'HYDROCORE_SERIES',
    name: 'Hydrocore Series',
    slug: 'hydrocore-series',
    domain: 'Fuel Cleanliness',
    primaryTechnology: 'HYDROCORE',
    supportingTechnologies: [],
    description: "HYDROCORE/SERIES™ is ELIMFILTERS’ heavy-duty turbine fuel filter/water separator line, delivering three-stage asset protection: Stage 1 intercepts solid particles, Stage 2 coalesces and removes emulsified water, and Stage 3 provides a final polishing barrier. The FH 900FH and 1000FH models are designed for high-flow turbine fuel systems in power generation and large-scale mining operations.",
  },

  CABIN: {
    key: 'CABIN',
    name: 'Cabin Filter',
    slug: 'cabin',
    domain: 'Cabin Protection',
    primaryTechnology: 'MICROKAPPA',
    supportingTechnologies: [],
  },

  COOLANT: {
    key: 'COOLANT',
    name: 'Coolant Filter',
    slug: 'coolant',
    domain: 'Cooling System',
    primaryTechnology: 'THERMOCORE',
    supportingTechnologies: ['MICROKAPPA'],
  },

  DRYER: {
    key: 'DRYER',
    name: 'Air Dryer',
    slug: 'dryer',
    domain: 'Compressed Air',
    primaryTechnology: 'DRYCORE',
    supportingTechnologies: [],
  },

  FUEL: {
    key: 'FUEL',
    name: 'Fuel Filter',
    slug: 'fuel',
    domain: 'Fuel Cleanliness',
    primaryTechnology: 'SYNTEPORE',
    supportingTechnologies: ['HYDROCORE'],
  },

  HOUSING: {
    key: 'HOUSING',
    name: 'Filter Housing',
    slug: 'housing',
    domain: 'Air Intake',
    primaryTechnology: 'INTEKCORE',
    supportingTechnologies: ['MACROCORE'],
  },

  HYDRAULIC: {
    key: 'HYDRAULIC',
    name: 'Hydraulic Filter',
    slug: 'hydraulic',
    domain: 'Hydraulic',
    primaryTechnology: 'NANOFORCE',
    supportingTechnologies: [],
  },

  // DURATECH Ecosystem — SYNTRAX anchor per owner decision (2026-06-02)
  KITS: {
    key: 'KITS',
    name: 'Filter Kits',
    slug: 'kits',
    domain: 'Lubrication',
    primaryTechnology: 'SYNTRAX',
    supportingTechnologies: ['MACROCORE', 'NANOFORCE'],
  },

  // MARINECLEAN Ecosystem — HYDROCORE + SYNTEPORE anchor per owner decision (2026-06-02)
  MARINE_SYSTEM: {
    key: 'MARINE_SYSTEM',
    name: 'Marine Filter',
    slug: 'marine',
    domain: 'Fuel Cleanliness',
    primaryTechnology: 'HYDROCORE',
    supportingTechnologies: ['SYNTEPORE', 'NANOFORCE'],
  },

  OIL: {
    key: 'OIL',
    name: 'Lube Oil Filter',
    slug: 'oil',
    domain: 'Lubrication',
    primaryTechnology: 'SYNTRAX',
    supportingTechnologies: [],
  },

  WATER: {
    key: 'WATER',
    name: 'Fuel Water Separator',
    slug: 'water',
    domain: 'Fuel Cleanliness',
    primaryTechnology: 'HYDROCORE',
    supportingTechnologies: [],
  },

};

// ============================================================================
// STANDARDS (11)
// Note: ISO_16889 corrected from "Cleanliness Coding System" to "Beta Ratio Test Method"
// Note: ISO_4406 corrected from "Legacy Cleanliness Code" to "Particle Count Cleanliness Code"
// ============================================================================

export const STANDARDS: Record<StandardKey, UnifiedStandard> = {

  ISO_16889: {
    key: 'ISO_16889',
    code: 'ISO 16889',
    name: 'Multi-Pass Filter Test Method',
    description: 'Beta ratio test method for hydraulic and lube oil filter elements — establishes filtration efficiency (β) and dirt-holding capacity under multi-pass conditions.',
    slug: 'iso-16889',
    applicableTo: ['MACROCORE', 'NANOFORCE', 'MICROKAPPA', 'SYNTRAX', 'HYDROCORE'],
    criticality: 'PRIMARY',
  },

  ISO_4406: {
    key: 'ISO_4406',
    code: 'ISO 4406',
    name: 'Particle Count Cleanliness Code',
    description: 'Three-number cleanliness code classifying particle counts per millilitre at 4, 6, and 14 micron thresholds in hydraulic and lube oil fluids. Current standard — not legacy.',
    slug: 'iso-4406',
    applicableTo: ['NANOFORCE', 'SYNTRAX'],
    criticality: 'PRIMARY',
  },

  ISO_5011: {
    key: 'ISO_5011',
    code: 'ISO 5011',
    name: 'Air Filter Performance Test',
    description: 'Standardised test procedure for measuring efficiency, restriction, and dust-holding capacity of air intake filters for internal combustion engines.',
    slug: 'iso-5011',
    applicableTo: ['MACROCORE', 'SYNTEPORE', 'INTEKCORE'],
    criticality: 'PRIMARY',
  },

  SAE_J1539: {
    key: 'SAE_J1539',
    code: 'SAE J1539',
    name: 'Air Intake Cleanliness for Diesel Engines',
    description: 'SAE standard defining contamination classification and test procedures for air intake systems on diesel engines in on-road and off-road applications.',
    slug: 'sae-j1539',
    applicableTo: ['MACROCORE', 'SYNTEPORE'],
    criticality: 'PRIMARY',
  },

  ASTM_D6304: {
    key: 'ASTM_D6304',
    code: 'ASTM D6304',
    name: 'Karl Fischer Water Content in Petroleum',
    description: 'Coulometric Karl Fischer titration method for determining water content in petroleum products and fuels — basis for free water threshold compliance in diesel fuel systems.',
    slug: 'astm-d6304',
    applicableTo: ['NANOFORCE', 'HYDROCORE', 'SYNTRAX'],
    criticality: 'PRIMARY',
  },

  ISO_12937: {
    key: 'ISO_12937',
    code: 'ISO 12937',
    name: 'Water in Petroleum Products — Karl Fischer Method',
    description: 'ISO procedure for water content determination in petroleum products by Karl Fischer titration — applicable to fuel system water separation performance validation.',
    slug: 'iso-12937',
    applicableTo: ['HYDROCORE'],
    criticality: 'SECONDARY',
  },

  ISO_8573_1: {
    key: 'ISO_8573_1',
    code: 'ISO 8573-1',
    name: 'Compressed Air Purity Classes',
    description: 'Defines compressed air quality classes for particles, water, and oil content — Class 1–2 dew point targets are the benchmark for pneumatic brake systems and instrument air.',
    slug: 'iso-8573-1',
    applicableTo: ['DRYCORE'],
    criticality: 'PRIMARY',
  },

  NFPA_T214: {
    key: 'NFPA_T214',
    code: 'NFPA T2.14',
    name: 'Hydraulic Fluid Power Cleanliness',
    description: 'Minimum cleanliness requirement ISO 18/16/13 for proportional and servo valve hydraulic systems in machine tool applications.',
    slug: 'nfpa-t214',
    applicableTo: ['NANOFORCE', 'SYNTRAX'],
    criticality: 'PRIMARY',
  },

  DIN_51524: {
    key: 'DIN_51524',
    code: 'DIN 51524',
    name: 'Hydraulic Fluid Requirements',
    description: 'German standard defining viscosity grades, performance requirements, and contamination limits for hydraulic fluids in industrial and mobile equipment.',
    slug: 'din-51524',
    applicableTo: ['NANOFORCE', 'SYNTRAX'],
    criticality: 'SECONDARY',
  },

  ISO_11155: {
    key: 'ISO_11155',
    code: 'ISO 11155',
    name: 'Cabin Air Filtration Systems',
    description: 'Specifies performance requirements for heating, ventilating, and air conditioning cabin filtration systems in road vehicles — basis for PM2.5 and occupational exposure compliance.',
    slug: 'iso-11155',
    applicableTo: ['MICROKAPPA'],
    criticality: 'PRIMARY',
  },

  ISO_14540: {
    key: 'ISO_14540',
    code: 'ISO 14540',
    name: 'Marine Diesel Fuel Specifications',
    description: 'Specifies quality requirements for residual marine diesel fuels including water content, particle count, and contamination limits for marine engine protection.',
    slug: 'iso-14540',
    applicableTo: ['HYDROCORE'],
    criticality: 'SECONDARY',
  },

};

// ============================================================================
// CONTAMINATION MODES (6)
// Updates from knowledge-architecture.ts:
//   PARTICLE_WEAR.resolvedBy: removed DURATECH, added SYNTRAX
//   DIESEL_WATER.resolvedBy: removed AQUAGUARD, added HYDROCORE
//   HYDRAULIC_CONTAMINATION.resolvedBy: removed AQUAGUARD, added HYDROCORE
//   New modes: COMPRESSED_AIR_MOISTURE, COOLANT_CONTAMINATION, CABIN_AIR_CONTAMINATION
// ============================================================================

export const CONTAMINATION_MODES: Record<ContaminationKey, UnifiedContaminationMode> = {

  PARTICLE_WEAR: {
    key: 'PARTICLE_WEAR',
    name: 'Particle Wear in Engines',
    slug: 'particle-wear',
    description: 'Abrasive particle-induced wear through two-body, three-body, and adhesive mechanisms in engine oil, fuel, and air intake systems.',
    rootCauses: ['AIR_INTAKE_INGESTION', 'FUEL_CONTAMINATION', 'INTERNAL_GENERATION', 'OIL_CIRCULATION'],
    failureModes: ['TWO_BODY_WEAR', 'THREE_BODY_WEAR', 'ADHESIVE_WEAR', 'BEARING_SPALLING', 'RING_STICKING'],
    impacts: {
      oilConsumption: '+15–40%',
      engineBlowBy: '+5–10%',
      fuelEconomy: '−5–12%',
      compressionDrop: '−10–25%',
      equipmentAvailability: '−15–25%',
    },
    resolvedBy: ['MACROCORE', 'NANOFORCE', 'SYNTRAX'],
    relatedStandards: ['ISO_16889', 'ISO_4406', 'SAE_J1539'],
  },

  DIESEL_WATER: {
    key: 'DIESEL_WATER',
    name: 'Diesel Water Contamination',
    slug: 'diesel-water',
    description: 'Free, emulsified, and dissolved water in diesel fuel systems causing injector corrosion, microbial growth, and fuel system degradation.',
    rootCauses: ['ATMOSPHERIC_BREATHING', 'CONDENSATION', 'STORAGE_CORROSION', 'TRANSFER_CONTAMINATION'],
    failureModes: ['INJECTOR_STICTION', 'FUEL_DELIVERY_CORROSION', 'MICROBIAL_GROWTH', 'FUEL_GUM_FORMATION', 'LUBRICITY_LOSS'],
    impacts: {
      hardStarting: '+5–15 seconds',
      fuelConsumption: '+3–8%',
      injectorCleaningFrequency: '2,000–3,000 hours',
      equipmentAvailability: '−12–18%',
    },
    resolvedBy: ['NANOFORCE', 'HYDROCORE', 'SYNTRAX'],
    relatedStandards: ['ASTM_D6304', 'ISO_12937', 'ISO_4406'],
  },

  HYDRAULIC_CONTAMINATION: {
    key: 'HYDRAULIC_CONTAMINATION',
    name: 'Hydraulic System Contamination',
    slug: 'hydraulic-system',
    description: 'Particle and water contamination in pressurised hydraulic circuits causing valve stiction, pump wear, and actuator failure.',
    rootCauses: ['MANUFACTURING_RESIDUE', 'SEAL_DEGRADATION', 'EXTERNAL_INGESTION', 'INTERNAL_GENERATION', 'PUMP_WEAR'],
    failureModes: ['VALVE_SPOOL_STICTION', 'ORIFICE_BLOCKAGE', 'PUMP_SWASHPLATE_STICTION', 'SEAL_EXTRUSION', 'HEAT_EXCHANGER_BLOCKAGE'],
    impacts: {
      systemPressureIncrease: '+10–30%',
      heatGeneration: '+5–15 kW',
      fluidTemperature: '+20–30°C',
      equipmentAvailability: '−15–30%',
      unplannedMaintenance: '1–2 per 500 hours',
    },
    resolvedBy: ['NANOFORCE', 'HYDROCORE', 'SYNTRAX', 'MICROKAPPA'],
    relatedStandards: ['ISO_16889', 'ISO_4406', 'NFPA_T214', 'DIN_51524'],
  },

  COMPRESSED_AIR_MOISTURE: {
    key: 'COMPRESSED_AIR_MOISTURE',
    name: 'Compressed Air Moisture',
    slug: 'compressed-air-moisture',
    description: 'Water vapour and condensed water in compressed air systems causing corrosion, freeze events, valve failure, and actuator seal degradation.',
    rootCauses: ['ATMOSPHERIC_HUMIDITY', 'COMPRESSOR_CONDENSATION', 'TEMPERATURE_CYCLING'],
    failureModes: ['VALVE_CORROSION', 'ACTUATOR_FREEZE', 'BRAKE_CIRCUIT_FAILURE', 'INSTRUMENT_AIR_CONTAMINATION'],
    impacts: {
      valveServiceLife: '−40–60%',
      brakeResponseTime: '+15–30%',
      maintenanceFrequency: '3× baseline',
    },
    resolvedBy: ['DRYCORE'],
    relatedStandards: ['ISO_8573_1'],
  },

  COOLANT_CONTAMINATION: {
    key: 'COOLANT_CONTAMINATION',
    name: 'Coolant System Contamination',
    slug: 'coolant-contamination',
    description: 'SCA depletion and scale/liner-pitting contamination in diesel engine cooling circuits causing liner cavitation erosion and corrosion.',
    rootCauses: ['SCA_DEPLETION', 'CAVITATION_NUCLEATION', 'SCALE_FORMATION', 'CORROSIVE_INGRESS'],
    failureModes: ['LINER_PITTING', 'CAVITATION_EROSION', 'SCALE_DEPOSIT', 'CORROSIVE_DEGRADATION'],
    impacts: {
      linerRebuildFrequency: '3× without SCA control',
      coolantServiceInterval: '−50% without controlled release',
      engineReconditioning: '$12,000+ per event (liner replacement)',
    },
    resolvedBy: ['THERMOCORE'],
    relatedStandards: ['ISO_16889'],
  },

  CABIN_AIR_CONTAMINATION: {
    key: 'CABIN_AIR_CONTAMINATION',
    name: 'Cabin Air Contamination',
    slug: 'cabin-air-contamination',
    description: 'Diesel exhaust particulate, silica dust, and ambient PM2.5 infiltrating operator cabs — occupational health and regulatory compliance concern.',
    rootCauses: ['DIESEL_EXHAUST_INTRUSION', 'DUST_INGRESS', 'HVAC_RECIRCULATION', 'WINDOW_SEAL_DEGRADATION'],
    failureModes: ['PM2_5_OVEREXPOSURE', 'SILICA_DUST_EXPOSURE', 'DIESEL_EXHAUST_CARCINOGEN_EXPOSURE'],
    impacts: {
      pm25Reduction: 'Up to 85% with MICROKAPPA',
      regulatoryRisk: 'EU Dir. 2019/130 non-compliance above threshold',
      operatorHealthRisk: 'IARC Group 1 carcinogen (diesel exhaust)',
    },
    resolvedBy: ['MICROKAPPA'],
    relatedStandards: ['ISO_11155'],
  },

};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/** Returns all active technologies applicable to a given industry. */
export function getTechnologyByIndustry(industryKey: IndustryKey): UnifiedTechnology[] {
  return INDUSTRIES[industryKey].applicableTechnologies.map((key) => TECHNOLOGIES[key]);
}

/** Returns all industries that list a given technology as applicable. */
export function getIndustriesByTechnology(techKey: TechnologyKey): UnifiedIndustry[] {
  return (Object.values(INDUSTRIES) as UnifiedIndustry[]).filter((ind) =>
    ind.applicableTechnologies.includes(techKey)
  );
}

/** Returns contamination modes addressed by a given technology. */
export function getContaminationByTechnology(techKey: TechnologyKey): UnifiedContaminationMode[] {
  return TECHNOLOGIES[techKey].addressesContamination.map((key) => CONTAMINATION_MODES[key]);
}

/** Returns standards applicable to a given technology. */
export function getStandardsByTechnology(techKey: TechnologyKey): UnifiedStandard[] {
  return TECHNOLOGIES[techKey].relatedStandards.map((key) => STANDARDS[key]);
}

/** Returns active technologies that resolve a given contamination mode. */
export function getTechnologiesByContamination(contaminationKey: ContaminationKey): UnifiedTechnology[] {
  return CONTAMINATION_MODES[contaminationKey].resolvedBy.map((key) => TECHNOLOGIES[key]);
}

/** Returns all systems for a given domain. */
export function getSystemsByDomain(domain: SystemDomain): UnifiedSystem[] {
  return (Object.values(SYSTEMS) as UnifiedSystem[]).filter((sys) => sys.domain === domain);
}

/** Returns industries sorted by contamination exposure severity (EXTREME first). */
export function getIndustriesBySeverity(): UnifiedIndustry[] {
  const severityOrder: Record<ExposureLevel, number> = {
    EXTREME: 5, HIGH: 4, 'MEDIUM-HIGH': 3, MEDIUM: 2, 'LOW-MEDIUM': 1, LOW: 0,
  };
  return (Object.values(INDUSTRIES) as UnifiedIndustry[]).sort(
    (a, b) => (severityOrder[b.contaminationExposure] ?? 0) - (severityOrder[a.contaminationExposure] ?? 0)
  );
}

/** Returns deprecated technology entry with replacement pointer. */
export function getDeprecatedTechnology(key: DeprecatedTechnologyKey): DeprecatedTechnology {
  return DEPRECATED_TECHNOLOGIES[key];
}

/** Returns ecosystem entry. */
export function getEcosystem(key: EcosystemKey): EcosystemEntry {
  return ECOSYSTEMS[key];
}

/** Returns the full relational network for a given node. */
export function mapKnowledgeNetwork(
  nodeKey: TechnologyKey | IndustryKey | ContaminationKey,
  nodeType: 'technology' | 'industry' | 'contamination'
): Record<string, unknown> {
  if (nodeType === 'technology') {
    const tech = TECHNOLOGIES[nodeKey as TechnologyKey];
    if (!tech) return {};
    return {
      node: nodeKey,
      type: nodeType,
      connections: {
        standards: getStandardsByTechnology(nodeKey as TechnologyKey),
        contamination: getContaminationByTechnology(nodeKey as TechnologyKey),
        industries: getIndustriesByTechnology(nodeKey as TechnologyKey),
      },
    };
  }
  if (nodeType === 'contamination') {
    const mode = CONTAMINATION_MODES[nodeKey as ContaminationKey];
    if (!mode) return {};
    return {
      node: nodeKey,
      type: nodeType,
      connections: {
        resolvedBy: getTechnologiesByContamination(nodeKey as ContaminationKey),
        standards: mode.relatedStandards.map((k) => STANDARDS[k]),
        industries: (Object.values(INDUSTRIES) as UnifiedIndustry[]).filter((ind) =>
          ind.relevantContamination.includes(nodeKey as ContaminationKey)
        ),
      },
    };
  }
  if (nodeType === 'industry') {
    const industry = INDUSTRIES[nodeKey as IndustryKey];
    if (!industry) return {};
    return {
      node: nodeKey,
      type: nodeType,
      connections: {
        technologies: getTechnologyByIndustry(nodeKey as IndustryKey),
        contamination: industry.relevantContamination.map((k) => CONTAMINATION_MODES[k]),
        standards: industry.applicableStandards.map((k) => STANDARDS[k]),
      },
    };
  }
  return {};
}
