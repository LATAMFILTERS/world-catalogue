/**
 * ELIMFILTERS® Knowledge Architecture Map — Compatibility Adapter (Phase 2 Task 3)
 *
 * This file is now a compatibility layer over unified-data.ts (Single Source of Truth).
 * All TECHNOLOGIES, STANDARDS, CONTAMINATION_MODES, and INDUSTRIES data is derived
 * from unified-data.ts. Public exports and function signatures are unchanged.
 *
 * Platform (2026-06-02):
 *   Active:     MACROCORE · SYNTEPORE · INTEKCORE · DRYCORE · HYDROCORE
 *               · SYNTRAX · NANOFORCE · THERMOCORE · MICROKAPPA
 *   Deprecated: AQUAGUARD → HYDROCORE  |  COOLTECH → THERMOCORE
 *   Ecosystems: MARINECLEAN · DURATECH
 *
 * COMPARISON_TOPICS, FLEET_OPTIMIZATION, EDUCATIONAL_PATHWAYS remain inline
 * because they have no equivalent in unified-data.ts.
 */

import {
  TECHNOLOGIES as UD_TECHNOLOGIES,
  DEPRECATED_TECHNOLOGIES as UD_DEPRECATED,
  ECOSYSTEMS as UD_ECOSYSTEMS,
  INDUSTRIES as UD_INDUSTRIES,
  STANDARDS as UD_STANDARDS,
  CONTAMINATION_MODES as UD_CONTAMINATION,
} from './unified-data';
import type {
  TechnologyKey,
  IndustryKey,
  StandardKey,
  ContaminationKey,
} from './unified-data';

// Re-export unified-data.ts key types for any future consumers
export type { TechnologyKey, IndustryKey, StandardKey, ContaminationKey } from './unified-data';

// ============================================================================
// LOCAL TYPE DEFINITIONS (preserved for API compatibility)
// ============================================================================

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
// DERIVATION HELPERS
// ============================================================================

/** Returns industry keys that list a given standard as applicable. */
function _industriesForStandard(key: StandardKey): string[] {
  return (Object.values(UD_INDUSTRIES) as Array<typeof UD_INDUSTRIES[IndustryKey]>)
    .filter((ind) => (ind.applicableStandards as string[]).includes(key))
    .map((ind) => ind.key as string);
}

/** Returns contamination mode keys that cite a given standard. */
function _contaminationForStandard(key: StandardKey): string[] {
  return (Object.values(UD_CONTAMINATION) as Array<typeof UD_CONTAMINATION[ContaminationKey]>)
    .filter((mode) => (mode.relatedStandards as string[]).includes(key))
    .map((mode) => mode.key as string);
}

/** Returns industry keys whose relevantContamination list includes a given contamination key. */
function _industriesForContamination(key: ContaminationKey): string[] {
  return (Object.values(UD_INDUSTRIES) as Array<typeof UD_INDUSTRIES[IndustryKey]>)
    .filter((ind) => (ind.relevantContamination as string[]).includes(key))
    .map((ind) => ind.key as string);
}

// ============================================================================
// TECHNOLOGY SYSTEMS (derived from unified-data.ts)
// ============================================================================

export const TECHNOLOGIES: TechnologyRecord = (() => {
  const out: TechnologyRecord = {};

  // 9 active technologies
  for (const tech of Object.values(UD_TECHNOLOGIES)) {
    out[tech.key] = {
      id: tech.slug,
      name: tech.name,
      category: tech.category,
      tagline: tech.tagline,
      slug: tech.slug,
      relatedStandards: tech.relatedStandards as string[],
      addressesContamination: tech.addressesContamination as string[],
      applicableIndustries: tech.applicableIndustries as string[],
      comparisonTopics: ['OEM_VS_AFTERMARKET'],
      keyMetrics: { ...tech.keyMetrics },
      description: tech.geoDefinition,
    };
  }

  // 2 deprecated technologies — included for legacy string lookups
  for (const dep of Object.values(UD_DEPRECATED)) {
    out[dep.key] = {
      id: dep.slug,
      name: dep.name,
      category: dep.domain,
      tagline: dep.sunsetNote,
      slug: dep.slug,
      relatedStandards: [],
      addressesContamination: [],
      applicableIndustries: [],
      comparisonTopics: ['OEM_VS_AFTERMARKET'],
      keyMetrics: { replacedBy: dep.replacedByName, deprecatedDate: dep.deprecatedDate },
      description: dep.geoDefinition,
    };
  }

  // 2 ecosystem entries — included for legacy string lookups
  for (const eco of Object.values(UD_ECOSYSTEMS)) {
    out[eco.key] = {
      id: eco.slug,
      name: eco.name,
      category: eco.programType,
      tagline: eco.geoDefinition,
      slug: eco.slug,
      relatedStandards: [],
      addressesContamination: [],
      applicableIndustries: [],
      comparisonTopics: ['OEM_VS_AFTERMARKET'],
      keyMetrics: { programType: eco.programType },
      description: eco.geoDefinition,
    };
  }

  return out;
})();

// ============================================================================
// STANDARDS (derived from unified-data.ts)
// ============================================================================

export const STANDARDS: StandardRecord = (() => {
  const out: StandardRecord = {};
  for (const [key, standard] of Object.entries(UD_STANDARDS) as Array<[StandardKey, typeof UD_STANDARDS[StandardKey]]>) {
    out[key] = {
      id: standard.key.toLowerCase(),
      code: standard.code,
      name: standard.name,
      slug: standard.slug,
      description: standard.description,
      applicableTo: standard.applicableTo as string[],
      relevantIndustries: _industriesForStandard(standard.key),
      relatedContamination: _contaminationForStandard(standard.key),
      criticality: standard.criticality,
    };
  }
  return out;
})();

// ============================================================================
// CONTAMINATION MODES (derived from unified-data.ts)
// ============================================================================

export const CONTAMINATION_MODES: ContaminationRecord = (() => {
  const out: ContaminationRecord = {};
  for (const [key, mode] of Object.entries(UD_CONTAMINATION) as Array<[ContaminationKey, typeof UD_CONTAMINATION[ContaminationKey]]>) {
    out[key] = {
      id: mode.key.toLowerCase(),
      name: mode.name,
      slug: mode.slug,
      description: mode.description,
      rootCauses: [...mode.rootCauses],
      failureModes: [...mode.failureModes],
      impacts: { ...mode.impacts },
      resolvedBy: mode.resolvedBy as string[],
      relatedStandards: mode.relatedStandards as string[],
      applicableIndustries: _industriesForContamination(mode.key),
    };
  }
  return out;
})();

// ============================================================================
// INDUSTRIES / VERTICALS (derived from unified-data.ts — all 12)
// ============================================================================

export const INDUSTRIES: IndustryRecord = (() => {
  const out: IndustryRecord = {};
  for (const [key, industry] of Object.entries(UD_INDUSTRIES) as Array<[IndustryKey, typeof UD_INDUSTRIES[IndustryKey]]>) {
    out[key] = {
      id: industry.slug,
      name: industry.name,
      slug: industry.slug,
      contaminationExposure: industry.contaminationExposure,
      primaryEquipment: [...industry.primaryEquipment],
      relevantContamination: industry.relevantContamination as string[],
      applicableTechnologies: industry.applicableTechnologies as string[],
      applicableStandards: industry.applicableStandards as string[],
      operatingConditions: { ...industry.operatingConditions },
    };
  }
  return out;
})();

// ============================================================================
// COMPARISON TOPICS (kept inline — no equivalent in unified-data.ts)
// ============================================================================

export const COMPARISON_TOPICS = {
  OEM_VS_AFTERMARKET: {
    id: 'oem_vs_aftermarket',
    name: 'OEM vs Aftermarket Logic',
    slug: 'oem-vs-aftermarket',
    description: 'Performance analysis and specification alignment',
    relevantTechnologies: ['MACROCORE', 'NANOFORCE', 'MICROKAPPA', 'SYNTRAX', 'HYDROCORE'],
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
// FLEET OPTIMIZATION STRATEGIES (kept inline — no equivalent in unified-data.ts)
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
// EDUCATIONAL PATHWAYS (kept inline — no equivalent in unified-data.ts)
// ============================================================================

export const EDUCATIONAL_PATHWAYS = {
  TECHNICIAN_ONBOARDING: {
    name: 'Technician Onboarding',
    sequence: [
      { module: 'CONTAMINATION_FUNDAMENTALS', resources: ['STANDARDS', 'CONTAMINATION_MODES'] },
      { module: 'TECHNOLOGY_OVERVIEW', resources: ['TECHNOLOGIES', 'APPLICABLE_STANDARDS'] },
      { module: 'INDUSTRY_SPECIFIC', resources: ['INDUSTRIES', 'CONTAMINATION_EXPOSURE'] },
      { module: 'PREVENTIVE_MAINTENANCE', resources: ['FLEET_OPTIMIZATION', 'BEST_PRACTICES'] }
    ]
  },

  EQUIPMENT_OPERATOR: {
    name: 'Equipment Operator',
    sequence: [
      { module: 'CONTAMINATION_IMPACTS', resources: ['OPERATIONAL_IMPACT'] },
      { module: 'FILTER_SELECTION', resources: ['TECHNOLOGIES', 'INDUSTRY_SPECIFIC'] },
      { module: 'MAINTENANCE_INTERVALS', resources: ['FLEET_OPTIMIZATION', 'STANDARDS'] }
    ]
  },

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
// Signatures unchanged. Data now sourced from unified-data.ts.
// ============================================================================

export function getTechnologyByIndustry(industryId: string) {
  const industry = INDUSTRIES[industryId];
  if (!industry) return [];
  return industry.applicableTechnologies.map((id) => TECHNOLOGIES[id]);
}

export function getContaminationByTechnology(techId: string) {
  const tech = TECHNOLOGIES[techId];
  if (!tech) return [];
  return tech.addressesContamination.map((id) => CONTAMINATION_MODES[id]);
}

export function getStandardsByTechnology(techId: string) {
  const tech = TECHNOLOGIES[techId];
  if (!tech) return [];
  return tech.relatedStandards.map((id) => STANDARDS[id]);
}

export function getRelatedTechnologies(contaminationId: string): typeof TECHNOLOGIES {
  const contamination = CONTAMINATION_MODES[contaminationId];
  if (!contamination) return {};
  const result: typeof TECHNOLOGIES = {};
  contamination.resolvedBy.forEach((techId) => {
    result[techId] = TECHNOLOGIES[techId];
  });
  return result;
}

export function getIndustriesBySeverity() {
  return Object.values(INDUSTRIES).sort((a, b) => {
    const severityOrder: Record<string, number> = {
      EXTREME: 3, HIGH: 2, 'MEDIUM-HIGH': 1.5, MEDIUM: 1, 'LOW-MEDIUM': 0.5, LOW: 0,
    };
    return (severityOrder[b.contaminationExposure] || 0) - (severityOrder[a.contaminationExposure] || 0);
  });
}

export function getAllTechnologiesByFeature(
  feature: 'waterRemoval' | 'particleCapture' | 'wearProtection' | 'costEffective'
) {
  const features: Record<string, string[]> = {
    waterRemoval: ['NANOFORCE', 'HYDROCORE', 'SYNTRAX'],
    particleCapture: ['MACROCORE', 'NANOFORCE', 'SYNTRAX', 'MICROKAPPA'],
    wearProtection: ['SYNTRAX', 'NANOFORCE'],
    costEffective: ['MACROCORE', 'SYNTRAX'],
  };
  return (features[feature] || []).map((id) => TECHNOLOGIES[id]);
}

export function mapKnowledgeNetwork(
  nodeId: string,
  nodeType: 'technology' | 'standard' | 'contamination' | 'industry'
) {
  const network: Record<string, unknown> = { node: nodeId, type: nodeType, connections: {} };

  if (nodeType === 'technology' && TECHNOLOGIES[nodeId]) {
    const tech = TECHNOLOGIES[nodeId];
    network.connections = {
      standards: tech.relatedStandards.map((id) => STANDARDS[id]),
      contamination: tech.addressesContamination.map((id) => CONTAMINATION_MODES[id]),
      industries: Object.values(INDUSTRIES).filter((ind) =>
        ind.applicableTechnologies.includes(nodeId)
      ),
    };
  } else if (nodeType === 'contamination' && CONTAMINATION_MODES[nodeId]) {
    const contamination = CONTAMINATION_MODES[nodeId];
    network.connections = {
      resolvedBy: contamination.resolvedBy.map((id) => TECHNOLOGIES[id]),
      standards: contamination.relatedStandards.map((id) => STANDARDS[id]),
      industries: Object.values(INDUSTRIES).filter((ind) =>
        ind.relevantContamination.includes(nodeId)
      ),
    };
  } else if (nodeType === 'industry' && INDUSTRIES[nodeId]) {
    const industry = INDUSTRIES[nodeId];
    network.connections = {
      technologies: industry.applicableTechnologies.map((id) => TECHNOLOGIES[id]),
      contamination: industry.relevantContamination.map((id) => CONTAMINATION_MODES[id]),
      standards: industry.applicableStandards.map((id) => STANDARDS[id]),
    };
  }

  return network;
}
