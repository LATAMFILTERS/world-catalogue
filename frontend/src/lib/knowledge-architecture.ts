/**
 * ELIMFILTERS Knowledge Architecture Map
 *
 * Defines relational structure between:
 * - Technologies (product systems)
 * - Standards (ISO, ASTM, SAE, DIN, NFPA)
 * - Contamination modes (failure mechanisms)
 * - Industries (application verticals)
 * - Comparison topics (OEM vs Aftermarket)
 * - Fleet optimization strategies
 *
 * AUTHORITATIVE SOURCE: technology domains, taglines and metrics must stay
 * consistent with frontend/src/app/technologies/[slug]/techPagesData.ts.
 *
 * This structure enables:
 * 1. Cross-linking between Knowledge System sections
 * 2. Recommendations based on user's technology/industry/problem
 * 3. Scalable addition of future content
 * 4. Educational pathway mapping
 */

// Type definitions for proper TypeScript indexing
type TechnologyRecord = Record<string, {
  id: string;
  name: string;
  category: string;
  tagline: string;
  slug: string;
  relatedStandards: string[];
  addressesContamination: string[];
  applicableIndustries: string[];
  comparisonTopics: string[];
  keyMetrics: Record<string, string>;
  description: string;
}>;

type StandardRecord = Record<string, {
  id: string;
  name: string;
  code: string;
  type?: string;
  slug: string;
  description: string;
  applicableTo: string[];
  relevantIndustries: string[];
  relatedContamination: string[];
  criticality: string;
}>;

type ContaminationRecord = Record<string, {
  id: string;
  name: string;
  slug: string;
  description: string;
  rootCauses: string[];
  failureModes: string[];
  impacts: Record<string, string>;
  resolvedBy: string[];
  relatedStandards: string[];
  applicableIndustries: string[];
}>;

type IndustryRecord = Record<string, {
  id: string;
  name: string;
  slug: string;
  contaminationExposure: string;
  primaryEquipment: string[];
  relevantContamination: string[];
  applicableTechnologies: string[];
  applicableStandards: string[];
  operatingConditions: Record<string, string>;
}>;

// ============================================================================
// TECHNOLOGY SYSTEMS
// Domains match techPagesData.ts — one primary protection domain per technology.
// ============================================================================

export const TECHNOLOGIES: TechnologyRecord = {
  MACROCORE: {
    id: 'macrocore',
    name: 'MACROCORE™',
    category: 'Air Intake Protection',
    tagline: 'Progressive Density Gradient Air Protection',
    slug: 'macrocore',
    relatedStandards: ['ISO_5011', 'SAE_J726', 'SAE_J1539'],
    addressesContamination: ['PARTICLE_WEAR'],
    applicableIndustries: ['AGRICULTURE', 'MINING', 'CONSTRUCTION', 'POWER_GENERATION', 'AUTOMOTIVE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      efficiency: '99.9%–99.98%',
      testStandard: 'ISO 5011',
      mediaArchitecture: 'Progressive Density Gradient (3 zones)',
    },
    description: 'Progressive density gradient multi-layer air intake filtration protecting engines from abrasive dust ingestion'
  },

  MICROKAPPA: {
    id: 'microkappa',
    name: 'MICROKAPPA™',
    category: 'Cabin Air Protection',
    tagline: 'Electrostatic HEPA Cabin Air Protection',
    slug: 'microkappa',
    relatedStandards: ['ISO_11155', 'DIN_71220'],
    addressesContamination: ['CABIN_AIR_EXPOSURE'],
    applicableIndustries: ['AGRICULTURE', 'MINING', 'CONSTRUCTION', 'AUTOMOTIVE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      mechanisms: 'Electrostatic + activated carbon + HEPA',
      targets: 'Allergens, odors, particulate (PM2.5/PM10)',
    },
    description: 'Three-mechanism cabin air filtration for occupant health protection in heavy-duty and passenger vehicle cabins'
  },

  SYNTEPORE: {
    id: 'syntepore',
    name: 'SYNTEPORE™',
    category: 'Fuel Cleanliness Protection',
    tagline: 'Precision Injector Guard for HPCR Systems',
    slug: 'syntepore',
    relatedStandards: ['ISO_12937', 'ASTM_D6304', 'ISO_4406'],
    addressesContamination: ['DIESEL_WATER', 'PARTICLE_WEAR'],
    applicableIndustries: ['AUTOMOTIVE', 'AGRICULTURE', 'CONSTRUCTION', 'POWER_GENERATION'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      application: 'Common Rail injection above 2,000 bar',
      mediaArchitecture: 'Progressive multi-layer synthetic',
    },
    description: 'Multi-layer fuel filtration intercepting sub-micron contamination before high-pressure Common Rail injectors'
  },

  SYNTRAX: {
    id: 'syntrax',
    name: 'SYNTRAX™',
    category: 'Lubrication Protection',
    tagline: 'AI-Engineered Engine Lube Oil Protection',
    slug: 'syntrax',
    relatedStandards: ['ISO_16889', 'ISO_4406', 'ISO_11171'],
    addressesContamination: ['PARTICLE_WEAR', 'VARNISH_FORMATION'],
    applicableIndustries: ['AGRICULTURE', 'MINING', 'CONSTRUCTION', 'AUTOMOTIVE', 'POWER_GENERATION'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      protects: 'Turbocharger bearings, crankshaft journals, valve train',
      mediaArchitecture: 'Multi-layer AI-calibrated matrix',
    },
    description: 'Multi-layer engine lubrication filtration intercepting sub-micron contamination before precision bearing surfaces'
  },

  NANOFORCE: {
    id: 'nanoforce',
    name: 'NANOFORCE™',
    category: 'Hydraulic Protection',
    tagline: 'Hydraulic Precision Guard',
    slug: 'nanoforce',
    relatedStandards: ['ISO_16889', 'ISO_4406', 'ISO_11171', 'NFPA_T2_14', 'DIN_51524'],
    addressesContamination: ['HYDRAULIC_CONTAMINATION', 'PARTICLE_WEAR', 'VARNISH_FORMATION'],
    applicableIndustries: ['CONSTRUCTION', 'MINING', 'MANUFACTURING', 'MARINE', 'AGRICULTURE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      operatingPressure: '200–450 bar sustained pulsation',
      mediaArchitecture: 'Multi-layer with vapor control and structural integrity systems',
    },
    description: 'Multi-layer hydraulic filtration engineered for high-pressure circuits, servo and proportional valve protection'
  },

  HYDROCORE: {
    id: 'hydrocore',
    name: 'HYDROCORE™',
    category: 'Fuel Cleanliness Protection',
    tagline: 'Fuel Water Separator',
    slug: 'hydrocore',
    relatedStandards: ['ASTM_D6304', 'ISO_12937'],
    addressesContamination: ['DIESEL_WATER'],
    applicableIndustries: ['MARINE', 'AGRICULTURE', 'POWER_GENERATION', 'AUTOMOTIVE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      waterSeparation: '99.8%',
      phases: 'Free, emulsified and dissolved water interception',
    },
    description: 'Hydrophobic water separation technology removing three-phase water contamination from fuel systems'
  },

  TURBOCORE: {
    id: 'turbocore',
    name: 'TURBOCORE™',
    category: 'Fuel Cleanliness Protection',
    tagline: 'Three-Stage Graduated Fuel Protection (Series FH)',
    slug: 'turbocore-series',
    relatedStandards: ['ISO_16332', 'ASTM_D6304', 'ISO_12937'],
    addressesContamination: ['DIESEL_WATER', 'PARTICLE_WEAR'],
    applicableIndustries: ['MARINE', 'POWER_GENERATION', 'MINING', 'AGRICULTURE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      stages: 'Water separation, sediment, sub-micron polishing',
      application: 'High-pressure fuel injection systems',
    },
    description: 'Three-stage graduated fuel protection intercepting water, sediment and sub-micron contamination before the injection circuit'
  },

  THERMACORE: {
    id: 'thermacore',
    name: 'THERMACORE™',
    category: 'Cooling System Protection',
    tagline: 'SCA Additive Release for Thermal Systems',
    slug: 'thermacore',
    relatedStandards: ['ASTM_D6210', 'ASTM_D3306'],
    addressesContamination: ['COOLANT_DEGRADATION'],
    applicableIndustries: ['AUTOMOTIVE', 'AGRICULTURE', 'MINING', 'POWER_GENERATION'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      mechanism: 'Controlled gradual SCA dosing',
      prevents: 'Liner cavitation, coolant chemistry drift',
    },
    description: 'Supplemental Coolant Additive release technology maintaining coolant chemistry and preventing cavitation erosion across the service interval'
  },

  DRYCORE: {
    id: 'drycore',
    name: 'DRYCORE™',
    category: 'Air Dryer Protection',
    tagline: 'Molecular Sieve Desiccant Dryer',
    slug: 'drycore',
    relatedStandards: ['ISO_8573_1'],
    addressesContamination: ['COMPRESSED_AIR_MOISTURE'],
    applicableIndustries: ['AUTOMOTIVE', 'MANUFACTURING', 'MINING', 'CONSTRUCTION'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      mechanism: 'Molecular sieve desiccant',
      protects: 'Air brake, suspension and control circuits',
    },
    description: 'Desiccant moisture removal for pneumatic systems preventing corrosion in air brake and control circuits'
  },

  INTEKCORE: {
    id: 'intekcore',
    name: 'INTEKCORE™',
    category: 'Filter Housing Systems',
    tagline: 'Heavy-Duty Filter Housing Systems',
    slug: 'intekcore',
    relatedStandards: [],
    addressesContamination: [],
    applicableIndustries: ['AUTOMOTIVE', 'MINING', 'CONSTRUCTION', 'AGRICULTURE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      rating: 'High-pressure rated, OEM-compatible',
      application: 'Heavy-duty trucks and industrial machinery',
    },
    description: 'Engineered filter housing systems protecting critical engine circuits in heavy-duty applications'
  },

  DURATECH: {
    id: 'duratech',
    name: 'DURATECH™',
    category: 'Fleet Maintenance Systems',
    tagline: 'Master Kit Consolidation',
    slug: 'duratech',
    relatedStandards: [],
    addressesContamination: [],
    applicableIndustries: ['AUTOMOTIVE', 'AGRICULTURE', 'CONSTRUCTION', 'MINING'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      model: 'Master kit with OEM interchangeability',
      application: 'Standardized multi-system service events across mixed-model fleets',
    },
    description: 'Master kit consolidation delivering single-source, fleet-ready filtration for standardized maintenance operations'
  },

  MARINECLEAN: {
    id: 'marineclean',
    name: 'MARINECLEAN™',
    category: 'Marine Filtration Systems',
    tagline: 'Salt-Resistant Marine Protection',
    slug: 'marineclean',
    relatedStandards: [],
    addressesContamination: ['DIESEL_WATER', 'HYDRAULIC_CONTAMINATION'],
    applicableIndustries: ['MARINE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      coating: 'Salt-resistant epoxy with brine rejection',
      certification: 'IMO certified for commercial marine',
    },
    description: 'Salt-resistant filtration for marine diesel fuel and hydraulic systems operating in saltwater environments'
  }
};

// ============================================================================
// STANDARDS
// ============================================================================

export const STANDARDS: StandardRecord = {
  ISO_16889: {
    id: 'iso_16889',
    code: 'ISO 16889',
    name: 'Multi-Pass Filter Performance Test',
    description: 'Multi-pass method measuring filtration ratio (Beta ratio) and retained capacity of hydraulic and lubrication filter elements',
    slug: 'iso-16889',
    applicableTo: ['NANOFORCE', 'SYNTRAX'],
    relevantIndustries: ['ALL'],
    relatedContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION'],
    criticality: 'PRIMARY'
  },

  ISO_4406: {
    id: 'iso_4406',
    code: 'ISO 4406',
    name: 'Fluid Cleanliness Code',
    description: 'Three-number cleanliness code counting particles ≥4µm, ≥6µm and ≥14µm per milliliter of fluid',
    slug: 'iso-4406',
    applicableTo: ['NANOFORCE', 'SYNTRAX', 'SYNTEPORE'],
    relevantIndustries: ['ALL'],
    relatedContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION'],
    criticality: 'PRIMARY'
  },

  ISO_11171: {
    id: 'iso_11171',
    code: 'ISO 11171',
    name: 'Particle Counter Calibration',
    description: 'Calibration of automatic particle counters for liquids — the measurement traceability chain underlying ISO 4406 codes and ISO 16889 Beta ratios',
    slug: 'iso-11171',
    applicableTo: ['NANOFORCE', 'SYNTRAX'],
    relevantIndustries: ['ALL'],
    relatedContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION'],
    criticality: 'PRIMARY'
  },

  ISO_5011: {
    id: 'iso_5011',
    code: 'ISO 5011',
    name: 'Air Filter Element Performance Test',
    description: 'Test methods for inlet air cleaning equipment: initial restriction, efficiency with ISO 12103-1 test dust, and dust-holding capacity',
    slug: 'iso-5011',
    applicableTo: ['MACROCORE'],
    relevantIndustries: ['ALL'],
    relatedContamination: ['PARTICLE_WEAR'],
    criticality: 'PRIMARY'
  },

  ISO_11155: {
    id: 'iso_11155',
    code: 'ISO 11155',
    name: 'Cabin Air Filter Test',
    description: 'Test methods for road vehicle cabin air filters: particulate (Part 1) and gaseous (Part 2) filtration performance',
    slug: 'iso-11155',
    applicableTo: ['MICROKAPPA'],
    relevantIndustries: ['AUTOMOTIVE', 'AGRICULTURE', 'MINING', 'CONSTRUCTION'],
    relatedContamination: ['CABIN_AIR_EXPOSURE'],
    criticality: 'PRIMARY'
  },

  DIN_71220: {
    id: 'din_71220',
    code: 'DIN 71220',
    name: 'Cabin Filter Test Method',
    description: 'German standard for testing motor vehicle cabin filters — particulate filtration performance',
    slug: 'din-71220',
    applicableTo: ['MICROKAPPA'],
    relevantIndustries: ['AUTOMOTIVE'],
    relatedContamination: ['CABIN_AIR_EXPOSURE'],
    criticality: 'SECONDARY'
  },

  ASTM_D6304: {
    id: 'astm_d6304',
    code: 'ASTM D6304',
    name: 'Karl Fischer Titration',
    description: 'Determination of water content in petroleum products by coulometric Karl Fischer titration',
    slug: 'astm-d6304',
    applicableTo: ['HYDROCORE', 'SYNTEPORE', 'TURBOCORE'],
    relevantIndustries: ['MARINE', 'AGRICULTURE', 'POWER_GENERATION'],
    relatedContamination: ['DIESEL_WATER'],
    criticality: 'PRIMARY'
  },

  ISO_12937: {
    id: 'iso_12937',
    code: 'ISO 12937',
    name: 'Water in Petroleum Products',
    description: 'Determination of water in petroleum products by coulometric Karl Fischer titration',
    slug: 'iso-12937',
    applicableTo: ['HYDROCORE', 'SYNTEPORE', 'TURBOCORE'],
    relevantIndustries: ['MARINE', 'AGRICULTURE', 'POWER_GENERATION'],
    relatedContamination: ['DIESEL_WATER'],
    criticality: 'PRIMARY'
  },

  ISO_16332: {
    id: 'iso_16332',
    code: 'ISO 16332',
    name: 'Fuel Filter Water Separation Test',
    description: 'Diesel engine fuel filter test method for water separation efficiency',
    slug: 'iso-16332',
    applicableTo: ['TURBOCORE', 'HYDROCORE'],
    relevantIndustries: ['MARINE', 'POWER_GENERATION', 'MINING'],
    relatedContamination: ['DIESEL_WATER'],
    criticality: 'PRIMARY'
  },

  SAE_J726: {
    id: 'sae_j726',
    code: 'SAE J726',
    name: 'Air Cleaner Test Code',
    description: 'SAE test code for air cleaner assemblies, companion to ISO 5011 element testing',
    slug: 'sae-j726',
    applicableTo: ['MACROCORE'],
    relevantIndustries: ['AGRICULTURE', 'CONSTRUCTION', 'AUTOMOTIVE'],
    relatedContamination: ['PARTICLE_WEAR'],
    criticality: 'SECONDARY'
  },

  SAE_J1539: {
    id: 'sae_j1539',
    code: 'SAE J1539',
    name: 'Air Induction System Integrity',
    description: 'Air induction system leak integrity — leaks downstream of the filter bypass even a perfect element',
    slug: 'sae-j1539',
    applicableTo: ['MACROCORE', 'INTEKCORE'],
    relevantIndustries: ['AGRICULTURE', 'CONSTRUCTION', 'AUTOMOTIVE'],
    relatedContamination: ['PARTICLE_WEAR'],
    criticality: 'SECONDARY'
  },

  NFPA_T2_14: {
    id: 'nfpa_t2_14',
    code: 'NFPA T2.14',
    name: 'Hydraulic Fluid Power Cleanliness',
    description: 'NFPA (National Fluid Power Association) recommended practice for hydraulic system cleanliness in proportional and servo applications',
    slug: 'nfpa-t2-14',
    applicableTo: ['NANOFORCE'],
    relevantIndustries: ['MANUFACTURING', 'CONSTRUCTION', 'MINING'],
    relatedContamination: ['HYDRAULIC_CONTAMINATION'],
    criticality: 'PRIMARY'
  },

  DIN_51524: {
    id: 'din_51524',
    code: 'DIN 51524',
    name: 'Hydraulic Fluid Requirements',
    description: 'German standard specifying minimum requirements for hydraulic pressure fluids (HL, HLP, HVLP)',
    slug: 'din-51524',
    applicableTo: ['NANOFORCE'],
    relevantIndustries: ['MANUFACTURING', 'CONSTRUCTION'],
    relatedContamination: ['HYDRAULIC_CONTAMINATION'],
    criticality: 'SECONDARY'
  },

  ISO_8573_1: {
    id: 'iso_8573_1',
    code: 'ISO 8573-1',
    name: 'Compressed Air Purity Classes',
    description: 'Compressed air purity classification for particles, water (pressure dew point) and oil content',
    slug: 'iso-8573-1',
    applicableTo: ['DRYCORE'],
    relevantIndustries: ['MANUFACTURING', 'AUTOMOTIVE'],
    relatedContamination: ['COMPRESSED_AIR_MOISTURE'],
    criticality: 'PRIMARY'
  },

  ASTM_D6210: {
    id: 'astm_d6210',
    code: 'ASTM D6210',
    name: 'Fully Formulated Coolant Specification',
    description: 'Specification for fully formulated glycol-based engine coolant for heavy-duty engines',
    slug: 'astm-d6210',
    applicableTo: ['THERMACORE'],
    relevantIndustries: ['AUTOMOTIVE', 'AGRICULTURE', 'MINING'],
    relatedContamination: ['COOLANT_DEGRADATION'],
    criticality: 'PRIMARY'
  },

  ASTM_D3306: {
    id: 'astm_d3306',
    code: 'ASTM D3306',
    name: 'Engine Coolant Specification',
    description: 'Specification for glycol-based engine coolants for automotive and light-duty service',
    slug: 'astm-d3306',
    applicableTo: ['THERMACORE'],
    relevantIndustries: ['AUTOMOTIVE'],
    relatedContamination: ['COOLANT_DEGRADATION'],
    criticality: 'SECONDARY'
  }
};

// ============================================================================
// CONTAMINATION MODES
// ============================================================================

export const CONTAMINATION_MODES: ContaminationRecord = {
  DIESEL_WATER: {
    id: 'diesel_water',
    name: 'Diesel Water Contamination',
    slug: 'diesel-water',
    description: 'Free, emulsified, and dissolved water in fuel systems',
    rootCauses: ['ATMOSPHERIC_BREATHING', 'CONDENSATION', 'STORAGE_CORROSION', 'TRANSFER_CONTAMINATION'],
    failureModes: ['INJECTOR_STICTION', 'FUEL_DELIVERY_CORROSION', 'MICROBIAL_GROWTH', 'FUEL_GUM_FORMATION', 'LUBRICITY_LOSS'],
    impacts: {
      hardStarting: '+5-15 seconds',
      fuelConsumption: '+3-8%',
      injectorCleaningFrequency: '2000-3000 hours',
      equipmentAvailability: '-12-18%'
    },
    resolvedBy: ['HYDROCORE', 'SYNTEPORE', 'TURBOCORE'],
    relatedStandards: ['ASTM_D6304', 'ISO_12937', 'ISO_16332'],
    applicableIndustries: ['MARINE', 'AGRICULTURE', 'POWER_GENERATION']
  },

  PARTICLE_WEAR: {
    id: 'particle_wear',
    name: 'Particle Wear in Engines',
    slug: 'particle-wear',
    description: 'Abrasive particle-induced wear through two-body, three-body and adhesive mechanisms',
    rootCauses: ['AIR_INTAKE_INGESTION', 'FUEL_CONTAMINATION', 'INTERNAL_GENERATION', 'OIL_CIRCULATION'],
    failureModes: ['TWO_BODY_WEAR', 'THREE_BODY_WEAR', 'ADHESIVE_WEAR', 'BEARING_SPALLING', 'RING_STICKING'],
    impacts: {
      oilConsumption: '+15-40%',
      engineBlowBy: '+5-10%',
      fuelEconomy: '-5-12%',
      compressionDrop: '-10-25%',
      equipmentAvailability: '-15-25%'
    },
    resolvedBy: ['MACROCORE', 'SYNTRAX', 'NANOFORCE'],
    relatedStandards: ['ISO_16889', 'ISO_4406', 'ISO_11171', 'ISO_5011', 'SAE_J1539'],
    applicableIndustries: ['AGRICULTURE', 'CONSTRUCTION', 'AUTOMOTIVE', 'MINING']
  },

  HYDRAULIC_CONTAMINATION: {
    id: 'hydraulic_contamination',
    name: 'Hydraulic System Contamination',
    slug: 'hydraulic-system',
    description: 'Pressurized fluid system failures from particle, water and thermal contamination',
    rootCauses: ['MANUFACTURING_RESIDUE', 'SEAL_DEGRADATION', 'EXTERNAL_INGESTION', 'INTERNAL_GENERATION', 'PUMP_WEAR'],
    failureModes: ['VALVE_SPOOL_STICTION', 'ORIFICE_BLOCKAGE', 'PUMP_SWASHPLATE_STICTION', 'SEAL_EXTRUSION', 'HEAT_EXCHANGER_BLOCKAGE'],
    impacts: {
      systemPressureIncrease: '+10-30%',
      heatGeneration: '+5-15 kW',
      fluidTemperature: '+20-30C',
      equipmentAvailability: '-15-30%',
      unplannedMaintenance: '1-2 per 500 hours'
    },
    resolvedBy: ['NANOFORCE'],
    relatedStandards: ['ISO_16889', 'ISO_4406', 'ISO_11171', 'NFPA_T2_14', 'DIN_51524'],
    applicableIndustries: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'MARINE']
  },

  VARNISH_FORMATION: {
    id: 'varnish_formation',
    name: 'Varnish Formation in Lube and Hydraulic Oil',
    slug: 'varnish-formation',
    description: 'Thermal and oxidative degradation producing insoluble deposits on bearing and valve surfaces',
    rootCauses: ['THERMAL_CYCLING', 'OXIDATION', 'ADDITIVE_DEPLETION', 'MICRO_DIESELING'],
    failureModes: ['SERVO_VALVE_STICTION', 'BEARING_DEPOSIT_BUILDUP', 'HEAT_EXCHANGER_FOULING', 'FILTER_PLUGGING'],
    impacts: {
      valveResponseDegradation: 'Progressive stiction',
      heatTransferLoss: 'Deposit-insulated surfaces',
      oilLifeReduction: 'Accelerated oxidation cascade'
    },
    resolvedBy: ['NANOFORCE', 'SYNTRAX'],
    relatedStandards: ['ISO_4406'],
    applicableIndustries: ['MANUFACTURING', 'POWER_GENERATION', 'CONSTRUCTION']
  },

  CABIN_AIR_EXPOSURE: {
    id: 'cabin_air_exposure',
    name: 'Cabin Air Particulate Exposure',
    slug: 'cabin-safety-systems',
    description: 'Operator exposure to particulate matter, allergens and gaseous contaminants inside vehicle cabins',
    rootCauses: ['AMBIENT_DUST', 'EXHAUST_INFILTRATION', 'POLLEN_ALLERGENS', 'RECIRCULATION_LOAD'],
    failureModes: ['OPERATOR_HEALTH_IMPACT', 'HVAC_FOULING', 'VISIBILITY_REDUCTION'],
    impacts: {
      pmExposure: 'PM2.5/PM10 above occupational thresholds without filtration',
      hvacLoad: 'Fouled evaporators reduce cooling capacity'
    },
    resolvedBy: ['MICROKAPPA'],
    relatedStandards: ['ISO_11155', 'DIN_71220'],
    applicableIndustries: ['AGRICULTURE', 'MINING', 'CONSTRUCTION', 'AUTOMOTIVE']
  },

  COOLANT_DEGRADATION: {
    id: 'coolant_degradation',
    name: 'Coolant Chemistry Degradation',
    slug: 'cooling-systems',
    description: 'SCA depletion and coolant chemistry drift enabling cavitation erosion and liner pitting',
    rootCauses: ['SCA_DEPLETION', 'THERMAL_CYCLING', 'TOPPING_DILUTION', 'ELECTROCHEMICAL_ACTIVITY'],
    failureModes: ['LINER_CAVITATION', 'LINER_PITTING', 'SILICATE_GEL_FORMATION', 'COOLANT_OIL_CROSS_CONTAMINATION'],
    impacts: {
      linerPerforation: 'Cavitation pitting can perforate liners between service intervals',
      crossContamination: 'Coolant-in-oil events cascade to bearing failure'
    },
    resolvedBy: ['THERMACORE'],
    relatedStandards: ['ASTM_D6210', 'ASTM_D3306'],
    applicableIndustries: ['AUTOMOTIVE', 'AGRICULTURE', 'MINING', 'POWER_GENERATION']
  },

  COMPRESSED_AIR_MOISTURE: {
    id: 'compressed_air_moisture',
    name: 'Compressed Air Moisture Contamination',
    slug: 'compressed-air-systems',
    description: 'Water vapor condensation in pneumatic circuits causing corrosion and valve failure',
    rootCauses: ['AMBIENT_HUMIDITY_COMPRESSION', 'THERMAL_CYCLING', 'DESICCANT_SATURATION'],
    failureModes: ['AIR_BRAKE_CORROSION', 'VALVE_FREEZING', 'CONTROL_CIRCUIT_FAILURE'],
    impacts: {
      brakeSystemRisk: 'Corroded air brake components compromise stopping performance',
      winterFailures: 'Condensed moisture freezes in valves below 0°C'
    },
    resolvedBy: ['DRYCORE'],
    relatedStandards: ['ISO_8573_1'],
    applicableIndustries: ['AUTOMOTIVE', 'MANUFACTURING', 'MINING']
  }
};

// ============================================================================
// INDUSTRIES / VERTICALS
// ============================================================================

export const INDUSTRIES: IndustryRecord = {
  AGRICULTURE: {
    id: 'agriculture',
    name: 'Agriculture',
    slug: 'agriculture',
    contaminationExposure: 'HIGH',
    primaryEquipment: ['COMBINES', 'TRACTORS', 'HARVESTERS', 'IRRIGATION_SYSTEMS'],
    relevantContamination: ['DIESEL_WATER', 'PARTICLE_WEAR', 'CABIN_AIR_EXPOSURE'],
    applicableTechnologies: ['MACROCORE', 'SYNTRAX', 'SYNTEPORE', 'HYDROCORE', 'MICROKAPPA', 'DURATECH'],
    applicableStandards: ['ISO_5011', 'SAE_J1539', 'ISO_16889', 'ASTM_D6304'],
    operatingConditions: {
      environment: 'Outdoor, dust-heavy, seasonal',
      temperature: '-10C to +40C',
      storageMethod: 'Outdoor, no climate control',
      mainIssue: 'Dust ingestion, water during harvesting'
    }
  },

  CONSTRUCTION: {
    id: 'construction',
    name: 'Construction',
    slug: 'construction',
    contaminationExposure: 'HIGH',
    primaryEquipment: ['EXCAVATORS', 'BULLDOZERS', 'LOADERS', 'COMPACTORS'],
    relevantContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION', 'CABIN_AIR_EXPOSURE'],
    applicableTechnologies: ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'MICROKAPPA', 'DURATECH'],
    applicableStandards: ['ISO_5011', 'SAE_J1539', 'ISO_16889', 'ISO_4406'],
    operatingConditions: {
      environment: 'High-dust earthwork sites, unpaved roads',
      temperature: '-20C to +50C',
      storageMethod: 'Outdoor, mobile equipment',
      mainIssue: 'Silica dust, soil contamination, high-pressure hydraulics'
    }
  },

  MINING: {
    id: 'mining',
    name: 'Mining',
    slug: 'mining',
    contaminationExposure: 'EXTREME',
    primaryEquipment: ['HAUL_TRUCKS', 'DRILL_RIGS', 'LOADERS', 'CRUSHERS'],
    relevantContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION', 'CABIN_AIR_EXPOSURE'],
    applicableTechnologies: ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'MICROKAPPA', 'THERMACORE', 'DURATECH'],
    applicableStandards: ['ISO_5011', 'ISO_16889', 'ISO_4406'],
    operatingConditions: {
      environment: '24/7 operation, extreme dust',
      temperature: '-30C to +60C',
      storageMethod: 'Outdoor, high contamination baseline',
      mainIssue: 'Continuous dust exposure, hardrock contamination, 24/7 duty'
    }
  },

  MARINE: {
    id: 'marine',
    name: 'Marine',
    slug: 'marine',
    contaminationExposure: 'MEDIUM-HIGH',
    primaryEquipment: ['FISHING_VESSELS', 'CARGO_SHIPS', 'NAVAL_EQUIPMENT'],
    relevantContamination: ['DIESEL_WATER', 'PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION'],
    applicableTechnologies: ['HYDROCORE', 'TURBOCORE', 'NANOFORCE', 'MARINECLEAN'],
    applicableStandards: ['ASTM_D6304', 'ISO_12937', 'ISO_16332', 'ISO_16889'],
    operatingConditions: {
      environment: 'High humidity, salt spray, thermal cycling',
      temperature: '-10C to +40C',
      storageMethod: 'Open tank breathing, coastal exposure',
      mainIssue: 'Water ingress, microbial growth, corrosion'
    }
  },

  AUTOMOTIVE: {
    id: 'automotive',
    name: 'Automotive',
    slug: 'automotive',
    contaminationExposure: 'MEDIUM',
    primaryEquipment: ['HEAVY_TRUCKS', 'BUSES', 'COMMERCIAL_VEHICLES'],
    relevantContamination: ['DIESEL_WATER', 'PARTICLE_WEAR', 'COMPRESSED_AIR_MOISTURE', 'COOLANT_DEGRADATION'],
    applicableTechnologies: ['MACROCORE', 'SYNTRAX', 'SYNTEPORE', 'HYDROCORE', 'DRYCORE', 'THERMACORE', 'MICROKAPPA', 'INTEKCORE', 'DURATECH'],
    applicableStandards: ['ISO_5011', 'ISO_4406', 'ISO_16889', 'ISO_8573_1', 'ASTM_D6210'],
    operatingConditions: {
      environment: 'Mixed urban/highway, seasonal',
      temperature: '-20C to +50C',
      storageMethod: 'Covered facility or outdoor',
      mainIssue: 'Road dust, occasional water exposure'
    }
  },

  MANUFACTURING: {
    id: 'manufacturing',
    name: 'Manufacturing',
    slug: 'manufacturing',
    contaminationExposure: 'LOW-MEDIUM',
    primaryEquipment: ['MACHINE_TOOLS', 'PRESSES', 'INJECTION_MOLDING', 'HYDRAULIC_SYSTEMS'],
    relevantContamination: ['HYDRAULIC_CONTAMINATION', 'VARNISH_FORMATION', 'COMPRESSED_AIR_MOISTURE'],
    applicableTechnologies: ['NANOFORCE', 'DRYCORE'],
    applicableStandards: ['NFPA_T2_14', 'ISO_16889', 'DIN_51524', 'ISO_8573_1'],
    operatingConditions: {
      environment: 'Climate-controlled, clean facilities',
      temperature: '15C to +30C',
      storageMethod: 'Indoor, controlled humidity',
      mainIssue: 'Precision equipment, proportional control, long fluid life'
    }
  },

  POWER_GENERATION: {
    id: 'power_generation',
    name: 'Power Generation',
    slug: 'power-generation',
    contaminationExposure: 'MEDIUM',
    primaryEquipment: ['DIESEL_GENERATORS', 'TURBINES', 'COMPRESSORS'],
    relevantContamination: ['DIESEL_WATER', 'PARTICLE_WEAR', 'VARNISH_FORMATION', 'COOLANT_DEGRADATION'],
    applicableTechnologies: ['MACROCORE', 'SYNTRAX', 'SYNTEPORE', 'HYDROCORE', 'TURBOCORE', 'THERMACORE'],
    applicableStandards: ['ISO_16889', 'ASTM_D6304', 'ISO_5011', 'ASTM_D6210'],
    operatingConditions: {
      environment: 'Industrial sites, variable exposure',
      temperature: '0C to +45C',
      storageMethod: 'Covered outdoor or semi-indoor',
      mainIssue: 'Fuel stability, long-term storage, continuous duty'
    }
  }
};

// ============================================================================
// COMPARISON TOPICS
// ============================================================================

export const COMPARISON_TOPICS = {
  OEM_VS_AFTERMARKET: {
    id: 'oem_vs_aftermarket',
    name: 'OEM vs Aftermarket Logic',
    slug: 'oem-vs-aftermarket',
    description: 'Performance analysis and specification alignment',
    relevantTechnologies: ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'SYNTEPORE', 'HYDROCORE', 'MICROKAPPA', 'DURATECH'],
    coverageAreas: [
      'Performance equivalence',
      'Specification compliance',
      'Warranty implications',
      'Cost-benefit analysis',
      'Longevity comparison'
    ]
  }
};

// ============================================================================
// FLEET OPTIMIZATION STRATEGIES
// ============================================================================

export const FLEET_OPTIMIZATION = {
  MAINTENANCE_STRATEGIES: {
    id: 'maintenance_strategies',
    name: 'Preventive Maintenance',
    description: 'Contamination-based maintenance scheduling',
    applicableTo: ['ALL_INDUSTRIES'],
    relevantMetrics: ['PARTICLE_COUNT', 'WATER_CONTENT', 'OIL_VISCOSITY', 'WEAR_METALS']
  },

  PERFORMANCE_TRACKING: {
    id: 'performance_tracking',
    name: 'Equipment Monitoring',
    description: 'Real-time contamination and performance tracking',
    applicableTo: ['HIGH_EXPOSURE_INDUSTRIES'],
    relevantMetrics: ['FUEL_CONSUMPTION', 'ENGINE_EFFICIENCY', 'COMPONENT_WEAR']
  },

  OPERATIONAL_EFFICIENCY: {
    id: 'operational_efficiency',
    name: 'Operational Efficiency',
    description: 'Optimization of equipment runtime and availability',
    applicableTo: ['ALL_INDUSTRIES'],
    relevantMetrics: ['DOWNTIME', 'MAINTENANCE_COST', 'FLUID_LIFE', 'COMPONENT_LIFE']
  }
};

// ============================================================================
// EDUCATIONAL PATHWAYS
// ============================================================================

export const EDUCATIONAL_PATHWAYS = {
  // New technician learning path
  TECHNICIAN_ONBOARDING: {
    name: 'Technician Onboarding',
    sequence: [
      { module: 'CONTAMINATION_FUNDAMENTALS', resources: ['STANDARDS', 'CONTAMINATION_MODES'] },
      { module: 'TECHNOLOGY_OVERVIEW', resources: ['TECHNOLOGIES', 'APPLICABLE_STANDARDS'] },
      { module: 'INDUSTRY_SPECIFIC', resources: ['INDUSTRIES', 'CONTAMINATION_EXPOSURE'] },
      { module: 'PREVENTIVE_MAINTENANCE', resources: ['FLEET_OPTIMIZATION', 'BEST_PRACTICES'] }
    ]
  },

  // Equipment operator learning path
  EQUIPMENT_OPERATOR: {
    name: 'Equipment Operator',
    sequence: [
      { module: 'CONTAMINATION_IMPACTS', resources: ['OPERATIONAL_IMPACT'] },
      { module: 'FILTER_SELECTION', resources: ['TECHNOLOGIES', 'INDUSTRY_SPECIFIC'] },
      { module: 'MAINTENANCE_INTERVALS', resources: ['FLEET_OPTIMIZATION', 'STANDARDS'] }
    ]
  },

  // Fleet manager learning path
  FLEET_MANAGER: {
    name: 'Fleet Manager',
    sequence: [
      { module: 'COST_ANALYSIS', resources: ['OPERATIONAL_IMPACT', 'PREVENTION_METHODS'] },
      { module: 'FLEET_STRATEGY', resources: ['FLEET_OPTIMIZATION', 'INDUSTRIES'] },
      { module: 'COMPLIANCE', resources: ['STANDARDS', 'APPLICABLE_REGULATIONS'] }
    ]
  }
};

// ============================================================================
// HELPER FUNCTIONS FOR QUERYING ARCHITECTURE
// ============================================================================

export function getTechnologyByIndustry(industryId: string) {
  const industry = INDUSTRIES[industryId];
  if (!industry) return [];
  return industry.applicableTechnologies.map(id => TECHNOLOGIES[id]);
}

export function getContaminationByTechnology(techId: string) {
  const tech = TECHNOLOGIES[techId];
  if (!tech) return [];
  return tech.addressesContamination.map(id => CONTAMINATION_MODES[id]);
}

export function getStandardsByTechnology(techId: string) {
  const tech = TECHNOLOGIES[techId];
  if (!tech) return [];
  return tech.relatedStandards.map(id => STANDARDS[id]);
}

export function getRelatedTechnologies(contaminationId: string): typeof TECHNOLOGIES {
  const contamination = CONTAMINATION_MODES[contaminationId];
  if (!contamination) return {};
  const result: typeof TECHNOLOGIES = {};
  contamination.resolvedBy.forEach(techId => {
    result[techId] = TECHNOLOGIES[techId];
  });
  return result;
}

export function getIndustriesBySeverity() {
  return Object.values(INDUSTRIES).sort((a, b) => {
    const severityOrder: Record<string, number> = { EXTREME: 3, HIGH: 2, 'MEDIUM-HIGH': 1.5, MEDIUM: 1, 'LOW-MEDIUM': 0.5, LOW: 0 };
    return (severityOrder[b.contaminationExposure] || 0) - (severityOrder[a.contaminationExposure] || 0);
  });
}

export function getAllTechnologiesByFeature(feature: 'waterRemoval' | 'particleCapture' | 'wearProtection' | 'moistureControl') {
  const features = {
    waterRemoval: ['HYDROCORE', 'TURBOCORE', 'SYNTEPORE'],
    particleCapture: ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'SYNTEPORE', 'MICROKAPPA'],
    wearProtection: ['SYNTRAX', 'NANOFORCE', 'MACROCORE'],
    moistureControl: ['DRYCORE', 'HYDROCORE']
  };
  return (features[feature] || []).map(id => TECHNOLOGIES[id]);
}

export function mapKnowledgeNetwork(nodeId: string, nodeType: 'technology' | 'standard' | 'contamination' | 'industry') {
  const network: Record<string, unknown> = { node: nodeId, type: nodeType, connections: {} };

  if (nodeType === 'technology' && TECHNOLOGIES[nodeId]) {
    const tech = TECHNOLOGIES[nodeId];
    network.connections = {
      standards: tech.relatedStandards.map(id => STANDARDS[id]),
      contamination: tech.addressesContamination.map(id => CONTAMINATION_MODES[id]),
      industries: Object.values(INDUSTRIES).filter(ind => ind.applicableTechnologies.includes(nodeId))
    };
  } else if (nodeType === 'contamination' && CONTAMINATION_MODES[nodeId]) {
    const contamination = CONTAMINATION_MODES[nodeId];
    network.connections = {
      resolvedBy: contamination.resolvedBy.map(id => TECHNOLOGIES[id]),
      standards: contamination.relatedStandards.map(id => STANDARDS[id]),
      industries: Object.values(INDUSTRIES).filter(ind => ind.relevantContamination.includes(nodeId))
    };
  } else if (nodeType === 'industry' && INDUSTRIES[nodeId]) {
    const industry = INDUSTRIES[nodeId];
    network.connections = {
      technologies: industry.applicableTechnologies.map(id => TECHNOLOGIES[id]),
      contamination: industry.relevantContamination.map(id => CONTAMINATION_MODES[id]),
      standards: industry.applicableStandards.map(id => STANDARDS[id])
    };
  }

  return network;
}
