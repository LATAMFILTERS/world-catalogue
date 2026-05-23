/**
 * ELIMFILTERS Knowledge Architecture Map
 *
 * Defines relational structure between:
 * - Technologies (product systems)
 * - Standards (ISO, ASTM, SAE, DIN)
 * - Contamination modes (failure mechanisms)
 * - Industries (application verticals)
 * - Comparison topics (OEM vs Aftermarket)
 * - Fleet optimization strategies
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
// ============================================================================

export const TECHNOLOGIES: TechnologyRecord = {
  MACROCORE: {
    id: 'macrocore',
    name: 'MACROCORE™',
    category: 'Air Filtration',
    tagline: 'Progressive Density Gradient Air Protection',
    slug: 'macrocore',
    relatedStandards: ['ISO_5011', 'SAE_J726', 'ASTM_D202', 'ISO_16889'],
    addressesContamination: ['PARTICLE_WEAR'],
    applicableIndustries: ['AGRICULTURE', 'MINING', 'CONSTRUCTION', 'POWER_GEN', 'MARINE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      efficiency: '99.98%',
      pressureDrop: '62 PSI',
      thermalRating: '120C',
      particleCaptureSize: '5-25 microns'
    },
    description: 'Three-zone progressive density gradient architecture for air intake protection'
  },

  NANOFORCE: {
    id: 'nanoforce',
    name: 'NANOFORCE™',
    category: 'Fuel & Hydraulic Filtration',
    tagline: 'Electrostatic Particle & Water Rejection',
    slug: 'nanoforce',
    relatedStandards: ['ISO_16889', 'ISO_4406', 'ASTM_D975', 'ISO_11158'],
    addressesContamination: ['DIESEL_WATER', 'PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION'],
    applicableIndustries: ['AGRICULTURE', 'CONSTRUCTION', 'MARINE', 'POWER_GEN', 'AUTOMOTIVE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      efficiency: '99.9%',
      waterRemoval: '98%',
      particleSize: '3-5 microns',
      fluidCompatibility: 'Universal'
    },
    description: 'Electrostatic synthetic media for fuel and hydraulic fluid contamination control'
  },

  MICROKAPPA: {
    id: 'microkappa',
    name: 'MICROKAPPA™',
    category: 'Coolant & Specialty Filtration',
    tagline: 'Precision Coolant System Protection',
    slug: 'microkappa',
    relatedStandards: ['ISO_16889', 'ASTM_D6595', 'DIN_51525'],
    addressesContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION'],
    applicableIndustries: ['MANUFACTURING', 'AUTOMOTIVE', 'MARINE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      efficiency: '99.95%',
      particleSize: '2-10 microns',
      fluidLife: '+40%',
      costPerHour: '-15%'
    },
    description: 'Micro-filtration for machine tool coolants and specialty fluids'
  },

  SYNTRAX: {
    id: 'syntrax',
    name: 'SYNTRAX™',
    category: 'Synthetic Fluid Technology',
    tagline: 'Advanced Hydraulic & Industrial Fluids',
    slug: 'syntrax',
    relatedStandards: ['ISO_16889', 'ISO_11158', 'DIN_51524', 'NFPA_T214'],
    addressesContamination: ['DIESEL_WATER', 'HYDRAULIC_CONTAMINATION'],
    applicableIndustries: ['MINING', 'CONSTRUCTION', 'MARINE', 'POWER_GEN'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      viscosityStability: '+25%',
      oxidationResistance: '+40%',
      lowTempPerformance: '-40C',
      fluidLife: '4000+ hours'
    },
    description: 'High-performance synthetic fluids with superior contamination resistance'
  },

  AQUAGUARD: {
    id: 'aquaguard',
    name: 'AQUAGUARD™',
    category: 'Water Removal Technology',
    tagline: 'Integrated Water Extraction System',
    slug: 'aquaguard',
    relatedStandards: ['ISO_16889', 'ASTM_D6304', 'ISO_12937'],
    addressesContamination: ['DIESEL_WATER', 'HYDRAULIC_CONTAMINATION'],
    applicableIndustries: ['MARINE', 'AGRICULTURE', 'OUTDOOR_EQUIPMENT', 'POWER_GEN'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      waterRemoval: '99.2%',
      freeWaterCapacity: '5-10 liters',
      responseTime: 'Real-time',
      backflushInterval: '500 hours'
    },
    description: 'Superabsorbent polymer cores for water encapsulation and removal'
  },

  DURATECH: {
    id: 'duratech',
    name: 'DURATECH™',
    category: 'Engine Oil Filtration',
    tagline: 'Dual-Stage Wear Debris Capture',
    slug: 'duratech',
    relatedStandards: ['ISO_4406', 'ISO_16889', 'SAE_J1211', 'ISO_11158'],
    addressesContamination: ['PARTICLE_WEAR'],
    applicableIndustries: ['AGRICULTURE', 'CONSTRUCTION', 'AUTOMOTIVE', 'MARINE'],
    comparisonTopics: ['OEM_VS_AFTERMARKET'],
    keyMetrics: {
      efficiency: '98%',
      particleSize: '10-20 microns',
      bypassPrevention: '3-5 bar',
      serviceLife: '500 hours'
    },
    description: 'Coarse + precision stage architecture for engine oil wear protection'
  }
};

// ============================================================================
// STANDARDS
// ============================================================================

export const STANDARDS: StandardRecord = {
  ISO_16889: {
    id: 'iso_16889',
    code: 'ISO 16889',
    name: 'Cleanliness Coding System',
    description: 'Particle cleanliness classification with 4-digit code',
    slug: 'iso-16889',
    applicableTo: ['MACROCORE', 'NANOFORCE', 'MICROKAPPA', 'AQUAGUARD', 'DURATECH'],
    relevantIndustries: ['ALL'],
    relatedContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION'],
    criticality: 'PRIMARY'
  },

  ISO_4406: {
    id: 'iso_4406',
    code: 'ISO 4406',
    name: 'Legacy Cleanliness Code',
    description: 'Historic 2-3 digit particle count classification',
    slug: 'iso-4406',
    applicableTo: ['DURATECH', 'NANOFORCE'],
    relevantIndustries: ['AUTOMOTIVE', 'INDUSTRIAL'],
    relatedContamination: ['PARTICLE_WEAR'],
    criticality: 'SECONDARY'
  },

  ISO_5011: {
    id: 'iso_5011',
    code: 'ISO 5011',
    name: 'Filter Integrity Testing',
    description: 'Collapse and integrity verification procedures',
    slug: 'iso-5011',
    applicableTo: ['MACROCORE', 'NANOFORCE', 'MICROKAPPA', 'AQUAGUARD', 'DURATECH'],
    relevantIndustries: ['ALL'],
    relatedContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION'],
    criticality: 'PRIMARY'
  },

  ASTM_D6304: {
    id: 'astm_d6304',
    code: 'ASTM D6304',
    name: 'Karl Fischer Titration',
    description: 'Water content measurement in fuels',
    slug: 'astm-d6304',
    applicableTo: ['NANOFORCE', 'AQUAGUARD', 'SYNTRAX'],
    relevantIndustries: ['DIESEL', 'MARINE', 'AGRICULTURE'],
    relatedContamination: ['DIESEL_WATER'],
    criticality: 'PRIMARY'
  },

  SAE_J1539: {
    id: 'sae_j1539',
    code: 'SAE J1539',
    name: 'Air Intake Cleanliness',
    description: 'Diesel engine air intake contamination classification',
    slug: 'sae-j1539',
    applicableTo: ['MACROCORE'],
    relevantIndustries: ['AGRICULTURAL', 'CONSTRUCTION', 'AUTOMOTIVE'],
    relatedContamination: ['PARTICLE_WEAR'],
    criticality: 'PRIMARY'
  },

  NFPA_T214: {
    id: 'nfpa_t214',
    code: 'NFPA T2.14',
    name: 'Machine Tool Hydraulic Fluids',
    description: 'Minimum cleanliness ISO 18/16/13 for proportional systems',
    slug: 'nfpa-t214',
    applicableTo: ['NANOFORCE', 'SYNTRAX'],
    relevantIndustries: ['MANUFACTURING', 'INDUSTRIAL'],
    relatedContamination: ['HYDRAULIC_CONTAMINATION'],
    criticality: 'PRIMARY'
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
    description: 'Free, emulsified, and sedimentary water in fuel systems',
    rootCauses: ['ATMOSPHERIC_BREATHING', 'CONDENSATION', 'STORAGE_CORROSION', 'TRANSFER_CONTAMINATION'],
    failureModes: ['INJECTOR_STICTION', 'FUEL_DELIVERY_CORROSION', 'MICROBIAL_GROWTH', 'FUEL_GUM_FORMATION', 'LUBRICITY_LOSS'],
    impacts: {
      hardStarting: '+5-15 seconds',
      fuelConsumption: '+3-8%',
      injectorCleaningFrequency: '2000-3000 hours',
      equipmentAvailability: '-12-18%'
    },
    resolvedBy: ['NANOFORCE', 'AQUAGUARD', 'SYNTRAX'],
    relatedStandards: ['ASTM_D6304', 'ISO_12937', 'ISO_4406'],
    applicableIndustries: ['MARINE', 'AGRICULTURAL', 'OUTDOOR_EQUIPMENT']
  },

  PARTICLE_WEAR: {
    id: 'particle_wear',
    name: 'Particle Wear in Engines',
    slug: 'particle-wear',
    description: 'Abrasive particle-induced wear through three mechanisms',
    rootCauses: ['AIR_INTAKE_INGESTION', 'FUEL_CONTAMINATION', 'INTERNAL_GENERATION', 'OIL_CIRCULATION'],
    failureModes: ['TWO_BODY_WEAR', 'THREE_BODY_WEAR', 'ADHESIVE_WEAR', 'BEARING_SPALLING', 'RING_STICKING'],
    impacts: {
      oilConsumption: '+15-40%',
      engineBlowBy: '+5-10%',
      fuelEconomy: '-5-12%',
      compressionDrop: '-10-25%',
      equipmentAvailability: '-15-25%'
    },
    resolvedBy: ['MACROCORE', 'NANOFORCE', 'DURATECH'],
    relatedStandards: ['ISO_16889', 'ISO_4406', 'SAE_J1539', 'ASTM_D7085'],
    applicableIndustries: ['AGRICULTURAL', 'CONSTRUCTION', 'AUTOMOTIVE', 'MINING']
  },

  HYDRAULIC_CONTAMINATION: {
    id: 'hydraulic_contamination',
    name: 'Hydraulic System Contamination',
    slug: 'hydraulic-system',
    description: 'Pressurized fluid system failures from contamination',
    rootCauses: ['MANUFACTURING_RESIDUE', 'SEAL_DEGRADATION', 'EXTERNAL_INGESTION', 'INTERNAL_GENERATION', 'PUMP_WEAR'],
    failureModes: ['VALVE_SPOOL_STICTION', 'ORIFICE_BLOCKAGE', 'PUMP_SWASHPLATE_STICTION', 'SEAL_EXTRUSION', 'HEAT_EXCHANGER_BLOCKAGE'],
    impacts: {
      systemPressureIncrease: '+10-30%',
      heatGeneration: '+5-15 kW',
      fluidTemperature: '+20-30C',
      equipmentAvailability: '-15-30%',
      unplannedMaintenance: '1-2 per 500 hours'
    },
    resolvedBy: ['NANOFORCE', 'AQUAGUARD', 'SYNTRAX', 'MICROKAPPA'],
    relatedStandards: ['ISO_16889', 'ISO_4406', 'NFPA_T214', 'DIN_51524'],
    applicableIndustries: ['CONSTRUCTION', 'MANUFACTURING', 'MINING', 'MARINE']
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
    relevantContamination: ['DIESEL_WATER', 'PARTICLE_WEAR'],
    applicableTechnologies: ['MACROCORE', 'NANOFORCE', 'DURATECH', 'SYNTRAX'],
    applicableStandards: ['SAE_J1539', 'ISO_16889', 'ISO_5011'],
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
    relevantContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION'],
    applicableTechnologies: ['MACROCORE', 'NANOFORCE', 'NANOFORCE_HYDRAULIC', 'DURATECH'],
    applicableStandards: ['SAE_J1539', 'ISO_16889', 'ISO_5011'],
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
    relevantContamination: ['PARTICLE_WEAR', 'HYDRAULIC_CONTAMINATION'],
    applicableTechnologies: ['MACROCORE', 'NANOFORCE', 'DURATECH', 'SYNTRAX'],
    applicableStandards: ['ISO_16889', 'ISO_5011'],
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
    applicableTechnologies: ['NANOFORCE', 'AQUAGUARD', 'DURATECH', 'SYNTRAX'],
    applicableStandards: ['ASTM_D6304', 'ISO_16889', 'ISO_14540'],
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
    relevantContamination: ['DIESEL_WATER', 'PARTICLE_WEAR'],
    applicableTechnologies: ['MACROCORE', 'NANOFORCE', 'DURATECH'],
    applicableStandards: ['SAE_J1539', 'ISO_4406', 'ISO_16889'],
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
    relevantContamination: ['HYDRAULIC_CONTAMINATION', 'PARTICLE_WEAR'],
    applicableTechnologies: ['NANOFORCE', 'MICROKAPPA', 'SYNTRAX'],
    applicableStandards: ['NFPA_T214', 'ISO_16889', 'DIN_51524'],
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
    relevantContamination: ['DIESEL_WATER', 'PARTICLE_WEAR'],
    applicableTechnologies: ['MACROCORE', 'NANOFORCE', 'AQUAGUARD', 'SYNTRAX'],
    applicableStandards: ['ISO_16889', 'ASTM_D6304', 'ISO_5011'],
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
    relevantTechnologies: ['MACROCORE', 'NANOFORCE', 'MICROKAPPA', 'DURATECH', 'AQUAGUARD'],
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

export function getAllTechnologiesByFeature(feature: 'waterRemoval' | 'particleCapture' | 'wearProtection' | 'costEffective') {
  const features = {
    waterRemoval: ['NANOFORCE', 'AQUAGUARD', 'SYNTRAX'],
    particleCapture: ['MACROCORE', 'NANOFORCE', 'DURATECH', 'MICROKAPPA'],
    wearProtection: ['DURATECH', 'SYNTRAX'],
    costEffective: ['MACROCORE', 'DURATECH']
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
