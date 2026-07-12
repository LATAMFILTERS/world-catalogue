import { getEntityNode, type EntityNode } from './entity-graph';
import { SYSTEM_RELATIONSHIPS, FAILURE_RELATIONSHIPS } from './canonical-relationships';

const BASE_URL = 'https://elimfilters.com';

export type ExpandedConceptKind =
  | 'contaminant'
  | 'failure-mechanism'
  | 'protection-strategy'
  | 'maintenance-objective'
  | 'lifecycle-outcome';

export interface ExpandedConcept {
  readonly id: string;
  readonly kind: ExpandedConceptKind;
  readonly name: string;
  readonly description: string;
  readonly relatedEntityIds: readonly string[];
}

const concepts: readonly ExpandedConcept[] = [
  {
    id: 'contaminant:airborne-dust',
    kind: 'contaminant',
    name: 'Airborne Dust',
    description: 'Solid airborne contamination that enters intake and ventilation paths and accelerates restriction, wear, and component exposure.',
    relatedEntityIds: ['system:air-intake', 'failure:particle-wear'],
  },
  {
    id: 'contaminant:water-in-diesel',
    kind: 'contaminant',
    name: 'Water in Diesel Fuel',
    description: 'Free or emulsified water in diesel fuel that threatens injection equipment, fuel stability, and corrosion control.',
    relatedEntityIds: ['system:fuel-cleanliness', 'failure:diesel-water'],
  },
  {
    id: 'contaminant:hydraulic-particles',
    kind: 'contaminant',
    name: 'Hydraulic Particle Contamination',
    description: 'Solid contamination in hydraulic fluid that drives abrasive wear, valve interference, and loss of system efficiency.',
    relatedEntityIds: ['system:hydraulic', 'failure:hydraulic-system', 'failure:particle-wear'],
  },
  {
    id: 'failure-mechanism:abrasive-wear',
    kind: 'failure-mechanism',
    name: 'Abrasive Wear',
    description: 'Material removal caused by hard particles moving through loaded clearances and lubricated interfaces.',
    relatedEntityIds: ['failure:particle-wear', 'system:lubrication', 'system:hydraulic'],
  },
  {
    id: 'failure-mechanism:water-induced-corrosion',
    kind: 'failure-mechanism',
    name: 'Water-Induced Corrosion',
    description: 'Corrosion and surface degradation initiated by water contamination in fuel and fluid systems.',
    relatedEntityIds: ['failure:diesel-water', 'system:fuel-cleanliness'],
  },
  {
    id: 'protection-strategy:depth-filtration',
    kind: 'protection-strategy',
    name: 'Depth Filtration',
    description: 'A contamination-control strategy that captures particles through the thickness of the media rather than only at the surface.',
    relatedEntityIds: ['technology:macrocore', 'technology:syntrax', 'technology:nanoforce', 'technology:syntepore'],
  },
  {
    id: 'protection-strategy:water-separation',
    kind: 'protection-strategy',
    name: 'Fuel-Water Separation',
    description: 'A fuel protection strategy that separates and removes water before it reaches injection equipment.',
    relatedEntityIds: ['technology:hydrocore', 'technology:turbocore', 'failure:diesel-water'],
  },
  {
    id: 'maintenance-objective:extended-service-interval',
    kind: 'maintenance-objective',
    name: 'Extended Service Interval',
    description: 'A maintenance objective achieved by controlling contamination loading while preserving system flow and component protection.',
    relatedEntityIds: ['system:air-intake', 'system:lubrication', 'system:hydraulic'],
  },
  {
    id: 'maintenance-objective:condition-based-maintenance',
    kind: 'maintenance-objective',
    name: 'Condition-Based Maintenance',
    description: 'A maintenance approach that uses contamination condition, restriction, and fluid cleanliness indicators to guide service timing.',
    relatedEntityIds: ['standard:iso-4406', 'standard:iso-16889', 'standard:iso-5011'],
  },
  {
    id: 'lifecycle-outcome:asset-reliability',
    kind: 'lifecycle-outcome',
    name: 'Asset Reliability',
    description: 'The lifecycle outcome produced by maintaining contamination control across protected systems and operating environments.',
    relatedEntityIds: ['organization:elimfilters', ...Object.keys(SYSTEM_RELATIONSHIPS).map((slug) => `system:${slug}`)],
  },
  {
    id: 'lifecycle-outcome:reduced-unplanned-downtime',
    kind: 'lifecycle-outcome',
    name: 'Reduced Unplanned Downtime',
    description: 'The operational result of reducing contamination-driven failures and preserving component function between planned services.',
    relatedEntityIds: Object.keys(FAILURE_RELATIONSHIPS).map((slug) => `failure:${slug}`),
  },
];

export const EXPANDED_KNOWLEDGE_CONCEPTS = concepts;

export function getExpandedConceptsForEntity(entityId: string): ExpandedConcept[] {
  return concepts.filter((concept) => concept.relatedEntityIds.includes(entityId));
}

export function buildExpandedConceptSchema(concept: ExpandedConcept): Record<string, unknown> {
  const related = concept.relatedEntityIds
    .map((id) => getEntityNode(id))
    .filter((node): node is EntityNode => Boolean(node));

  return {
    '@type': 'DefinedTerm',
    '@id': `${BASE_URL}/#${concept.id.replace(':', '-')}`,
    name: concept.name,
    description: concept.description,
    additionalType: concept.kind,
    inDefinedTermSet: { '@id': `${BASE_URL}/#industrial-contamination-knowledge` },
    about: related.map((node) => ({
      '@type': 'Thing',
      '@id': node.href === '/' ? `${BASE_URL}/#organization` : `${BASE_URL}${node.href}#entity`,
      name: node.name,
    })),
  };
}

export function validateKnowledgeGraphExpansion() {
  const duplicateIds = concepts
    .map((concept) => concept.id)
    .filter((id, index, all) => all.indexOf(id) !== index);
  const invalidEntityReferences = concepts.flatMap((concept) =>
    concept.relatedEntityIds.filter((id) => !getEntityNode(id)).map((id) => `${concept.id}->${id}`),
  );
  const emptyDescriptions = concepts.filter((concept) => !concept.description.trim()).map((concept) => concept.id);

  return {
    duplicateIds: Array.from(new Set(duplicateIds)),
    invalidEntityReferences: Array.from(new Set(invalidEntityReferences)),
    emptyDescriptions,
    isValid: duplicateIds.length === 0 && invalidEntityReferences.length === 0 && emptyDescriptions.length === 0,
  };
}
