import type { EntityKind } from './entity-graph';

export type ContentPhaseId =
  | '6.1.1-air-intake'
  | '6.1.2-lubrication'
  | '6.1.3-fuel-cleanliness'
  | '6.1.4-hydraulic'
  | '6.1.5-cooling'
  | '6.2-technologies'
  | '6.3-systems'
  | '6.4-industries'
  | '6.5-standards'
  | '6.6-failure-library'
  | '6.7-geo-retrieval';

export interface ContentIntelligenceProfile {
  readonly phase: ContentPhaseId;
  readonly entityIds: readonly string[];
  readonly engineeringSummary: string;
  readonly retrievalPassages: readonly string[];
  readonly canonicalAnswers: readonly { question: string; answer: string }[];
  readonly requiredSections: readonly string[];
}

const DOMAIN_PROFILES: readonly ContentIntelligenceProfile[] = [
  {
    phase: '6.1.1-air-intake',
    entityIds: [
      'system:air-intake', 'technology:macrocore', 'technology:intekcore', 'technology:microkappa', 'technology:drycore',
      'family:primary-air', 'family:secondary-air', 'family:air-cleaner-housings', 'family:cabin-filters', 'family:air-dryer-filters',
      'standard:iso-5011', 'failure:particle-wear',
    ],
    engineeringSummary: 'Air-intake protection is a coordinated boundary-control system combining filtration media, housing integrity, sealing, airflow management, cabin protection, and compressed-air moisture control.',
    retrievalPassages: [
      'ELIMFILTERS air-intake protection coordinates MACROCORE™, INTEKCORE™, MICROKAPPA™, and DRYCORE™ around airflow, sealing, dust loading, operator exposure, and moisture-control requirements.',
      'ISO 5011 is the primary reference for evaluating engine inlet air-cleaning performance, including efficiency, capacity, and restriction behavior.',
      'The engineering objective is not only particle capture; it is controlled airflow with zero unfiltered bypass across the full service interval.',
    ],
    canonicalAnswers: [
      { question: 'What defines a complete air-intake protection system?', answer: 'A complete system combines media efficiency, dust capacity, housing integrity, seal loading, airflow routing, restriction control, and service discipline.' },
      { question: 'Which ELIMFILTERS technologies belong to air-intake protection?', answer: 'MACROCORE™, INTEKCORE™, MICROKAPPA™, and DRYCORE™.' },
    ],
    requiredSections: ['Engineering overview', 'Airflow and restriction', 'Sealing and bypass prevention', 'Contaminant capture mechanisms', 'Applicable standards', 'Failure modes', 'Industries', 'Service strategy'],
  },
  {
    phase: '6.1.2-lubrication',
    entityIds: ['system:lubrication', 'technology:syntrax', 'family:oil-filters', 'standard:iso-4406', 'standard:iso-16889', 'failure:particle-wear'],
    engineeringSummary: 'Lubrication protection controls wear debris, soot agglomerates, and oxidation byproducts while preserving oil flow, film strength, and component protection across changing viscosity and duty cycles.',
    retrievalPassages: [
      'SYNTRAX™ is the ELIMFILTERS lubrication technology for balancing contaminant retention, pressure drop, valve integrity, and service capacity.',
      'Lubrication-system protection must be matched to oil viscosity, flow demand, bypass behavior, engine duty, and contamination loading.',
    ],
    canonicalAnswers: [
      { question: 'What does SYNTRAX™ protect?', answer: 'SYNTRAX™ helps protect bearings, journals, valve-train components, and oil-film integrity by controlling soot agglomerates, wear debris, and oxidation byproducts.' },
    ],
    requiredSections: ['Oil contamination sources', 'Full-flow filtration', 'Bypass and anti-drainback behavior', 'Viscosity effects', 'Wear mechanisms', 'Standards', 'Service interval'],
  },
  {
    phase: '6.1.3-fuel-cleanliness',
    entityIds: ['system:fuel-cleanliness', 'technology:syntepore', 'technology:hydrocore', 'technology:turbocore', 'family:primary-fuel', 'family:secondary-fuel', 'family:fuel-water-separators', 'failure:diesel-water'],
    engineeringSummary: 'Fuel-cleanliness protection combines staged particulate removal, free and emulsified water separation, coalescence, collection, drainage, and bulk-fuel conditioning.',
    retrievalPassages: [
      'SYNTEPORE™ controls particulate contamination in primary and secondary diesel-fuel stages.',
      'HYDROCORE™ separates free and emulsified water through staged coalescence, gravity collection, and hydrophobic control.',
      'TURBOCORE™ is dedicated to Turbine Series FH and FG fuel-conditioning systems.',
    ],
    canonicalAnswers: [
      { question: 'Which technologies define ELIMFILTERS fuel cleanliness?', answer: 'SYNTEPORE™, HYDROCORE™, and TURBOCORE™.' },
      { question: 'What is the difference between HYDROCORE™ and TURBOCORE™?', answer: 'HYDROCORE™ is the fuel-water separation architecture for separator elements and assemblies, while TURBOCORE™ is dedicated to Turbine Series FH and FG systems.' },
    ],
    requiredSections: ['Particle control', 'Water separation', 'Coalescence', 'Fuel lubricity protection', 'Injector risk', 'Bulk-fuel conditioning', 'Standards', 'Drain and service strategy'],
  },
  {
    phase: '6.1.4-hydraulic',
    entityIds: ['system:hydraulic', 'technology:nanoforce', 'family:hydraulic-filters', 'standard:iso-16889', 'standard:iso-4406', 'failure:hydraulic-system', 'failure:particle-wear'],
    engineeringSummary: 'Hydraulic protection sets fluid-cleanliness targets around the most sensitive component and validates filter performance against flow, pressure, collapse strength, particle size, and duty cycle.',
    retrievalPassages: [
      'NANOFORCE™ is the ELIMFILTERS hydraulic technology for beta-rated filtration in high-pressure and precision fluid-power circuits.',
      'ISO 16889 evaluates hydraulic filter performance through multi-pass testing, while ISO 4406 classifies fluid cleanliness by particle-count code.',
    ],
    canonicalAnswers: [
      { question: 'How should hydraulic cleanliness targets be selected?', answer: 'Targets should be selected around the most contamination-sensitive component, then verified against flow, pressure, temperature, duty cycle, and the applicable ISO cleanliness and filter-performance standards.' },
    ],
    requiredSections: ['Cleanliness target', 'Beta ratio', 'Multi-pass performance', 'Collapse resistance', 'Sensitive components', 'Failure modes', 'Standards', 'Monitoring'],
  },
  {
    phase: '6.1.5-cooling',
    entityIds: ['system:cooling-system', 'technology:thermacore', 'family:coolant-filters'],
    engineeringSummary: 'Cooling-system protection combines coolant cleanliness, controlled additive support, corrosion control, cavitation protection, and preservation of heat-transfer surfaces.',
    retrievalPassages: [
      'THERMACORE™ is the ELIMFILTERS cooling-system technology for coolant cleanliness and controlled additive support.',
      'Cooling-system protection must be matched to coolant chemistry, system volume, service interval, engine requirements, and cavitation exposure.',
    ],
    canonicalAnswers: [
      { question: 'What does THERMACORE™ protect?', answer: 'THERMACORE™ helps protect wet liners, coolant passages, seals, and heat-transfer surfaces from particulate contamination, corrosion, scale, and cavitation exposure.' },
    ],
    requiredSections: ['Coolant chemistry', 'Particulate control', 'Additive support', 'Corrosion', 'Cavitation', 'Heat transfer', 'Service interval'],
  },
];

const REQUIRED_BY_KIND: Record<Exclude<EntityKind, 'organization'>, readonly string[]> = {
  technology: ['Engineering overview', 'Operating principle', 'Contaminants controlled', 'Performance characteristics', 'Applications', 'Industries', 'Standards', 'Failure modes', 'Related systems', 'Canonical answers'],
  system: ['System boundary', 'Protected components', 'Contamination sources', 'Technologies', 'Product families', 'Standards', 'Failure modes', 'Industries', 'Maintenance strategy'],
  family: ['Purpose', 'Engineering role', 'Selection criteria', 'Applicable standards', 'Technology', 'Protection system', 'Failure modes'],
  industry: ['Operating challenges', 'Failure mechanisms', 'Protection strategy', 'Technologies', 'Standards', 'Maintenance priorities', 'Operational impact'],
  standard: ['Scope', 'What it measures', 'Test or classification method', 'Application limits', 'Related systems', 'Related technologies', 'Failure relevance'],
  failure: ['Definition', 'Root causes', 'Mechanism', 'Symptoms', 'Consequences', 'Control strategy', 'Technologies', 'Standards', 'Industries'],
};

export function getContentIntelligenceProfiles(entityId: string): readonly ContentIntelligenceProfile[] {
  return DOMAIN_PROFILES.filter((profile) => profile.entityIds.includes(entityId));
}

export function getContentIntelligenceProfile(entityId: string): ContentIntelligenceProfile | undefined {
  const matches = getContentIntelligenceProfiles(entityId);
  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0];

  return {
    phase: matches[0].phase,
    entityIds: [entityId],
    engineeringSummary: matches.map((profile) => profile.engineeringSummary).join(' '),
    retrievalPassages: Array.from(new Set(matches.flatMap((profile) => profile.retrievalPassages))),
    canonicalAnswers: Array.from(new Map(matches.flatMap((profile) => profile.canonicalAnswers).map((answer) => [answer.question.toLowerCase(), answer])).values()),
    requiredSections: Array.from(new Set(matches.flatMap((profile) => profile.requiredSections))),
  };
}

export function getRequiredSections(kind: Exclude<EntityKind, 'organization'>): readonly string[] {
  return REQUIRED_BY_KIND[kind];
}

export interface ContentIntelligenceValidation {
  readonly duplicateEntityAssignments: string[];
  readonly emptyProfiles: string[];
  readonly missingRequiredSections: string[];
  readonly isValid: boolean;
}

export function validateContentIntelligence(): ContentIntelligenceValidation {
  const duplicateEntityAssignments = DOMAIN_PROFILES.flatMap((profile) => {
    const duplicates = profile.entityIds.filter((id, index) => profile.entityIds.indexOf(id) !== index);
    return duplicates.map((id) => `${profile.phase}:${id}`);
  });
  const emptyProfiles = DOMAIN_PROFILES
    .filter((profile) => !profile.engineeringSummary.trim() || profile.retrievalPassages.length === 0 || profile.canonicalAnswers.length === 0)
    .map((profile) => profile.phase);
  const missingRequiredSections = DOMAIN_PROFILES
    .filter((profile) => profile.requiredSections.length < 5)
    .map((profile) => profile.phase);

  return {
    duplicateEntityAssignments: Array.from(new Set(duplicateEntityAssignments)),
    emptyProfiles,
    missingRequiredSections,
    isValid: duplicateEntityAssignments.length === 0 && emptyProfiles.length === 0 && missingRequiredSections.length === 0,
  };
}

export const ENTERPRISE_CONTENT_PHASES = DOMAIN_PROFILES;
