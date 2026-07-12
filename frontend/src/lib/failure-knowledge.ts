import type { TechnologySlug } from './canonical-technologies';
import { FAILURE_RELATIONSHIPS } from './canonical-relationships';

export type FailureKnowledgeKey = keyof typeof FAILURE_RELATIONSHIPS;

export interface FailureKnowledgeProfile {
  readonly key: FailureKnowledgeKey;
  readonly name: string;
  readonly definition: string;
  readonly mechanism: string;
  readonly operationalImpact: string;
  readonly controlStrategy: string;
  readonly systems: readonly string[];
  readonly technologies: readonly TechnologySlug[];
  readonly families: readonly string[];
  readonly standards: readonly string[];
  readonly industries: readonly string[];
}

const relationships = <K extends FailureKnowledgeKey>(key: K) => {
  const rel = FAILURE_RELATIONSHIPS[key];
  return {
    systems: [...rel.systems],
    technologies: [...rel.technologies] as TechnologySlug[],
    families: [...rel.families],
    standards: [...rel.standards],
    industries: [...rel.industries],
  };
};

export const FAILURE_KNOWLEDGE: Record<FailureKnowledgeKey, FailureKnowledgeProfile> = {
  'hydraulic-system': {
    key: 'hydraulic-system',
    name: 'Hydraulic System Contamination',
    definition: 'Hydraulic system contamination is the presence of solid particles, water, wear debris, or other foreign material in a hydraulic circuit operating with precision clearances.',
    mechanism: 'Particles circulate through pumps, valves, actuators, and servo controls, where they produce abrasion, surface fatigue, stiction, and accelerated seal wear.',
    operationalImpact: 'Progressive contamination increases leakage, reduces control precision, raises heat generation, and increases exposure to pump, valve, and actuator failure.',
    controlStrategy: 'Set cleanliness targets around the most sensitive component, monitor fluid condition, and select filtration by Beta ratio, flow demand, pressure rating, collapse strength, and duty cycle.',
    ...relationships('hydraulic-system'),
  },
  'particle-wear': {
    key: 'particle-wear',
    name: 'Particle Wear',
    definition: 'Particle wear is surface damage caused when hard contamination moves through lubricated, hydraulic, fuel, or air-handling interfaces.',
    mechanism: 'Particles cut, abrade, indent, or initiate fatigue at component surfaces when their size, hardness, and concentration exceed the clearance tolerance of the protected interface.',
    operationalImpact: 'The result is progressive loss of sealing, reduced efficiency, clearance growth, unstable control, and shorter component service life.',
    controlStrategy: 'Reduce particle exposure through source control, effective sealing, cleanliness monitoring, and filtration matched to the critical particle size and system duty cycle.',
    ...relationships('particle-wear'),
  },
  'diesel-water': {
    key: 'diesel-water',
    name: 'Diesel Water Contamination',
    definition: 'Diesel water contamination is the presence of free, emulsified, or dissolved water in fuel storage, transfer, and injection systems.',
    mechanism: 'Water promotes corrosion, reduces lubricity, supports microbial growth, and creates erosion or stiction risk inside high-pressure injection components.',
    operationalImpact: 'Fuel quality degrades, injectors lose metering precision, combustion quality declines, and the probability of pump and injector failure increases.',
    controlStrategy: 'Control storage and transfer practices, drain collected water, monitor fuel condition, and use staged particle filtration with HYDROCORE™ separation or TURBOCORE™ Turbine FH/FG systems according to the application.',
    ...relationships('diesel-water'),
  },
};

export function getFailureKnowledgeProfile(slug: string): FailureKnowledgeProfile | undefined {
  return FAILURE_KNOWLEDGE[slug as FailureKnowledgeKey];
}
