import {
  ENTITY_NODES,
  getConnectedEntities,
  type EntityKind,
  type EntityNode,
} from './entity-graph';

const DIMENSION_WEIGHTS: Record<Exclude<EntityKind, 'organization'>, number> = {
  system: 18,
  technology: 17,
  family: 12,
  standard: 14,
  failure: 16,
  industry: 10,
};

const KIND_BASELINE: Record<Exclude<EntityKind, 'organization'>, number> = {
  system: 18,
  technology: 18,
  family: 10,
  standard: 10,
  failure: 9,
  industry: 11,
};

export interface EntityAuthorityScore {
  readonly entity: EntityNode;
  readonly score: number;
  readonly directConnections: number;
  readonly secondLevelConnections: number;
  readonly coverageBreadth: number;
  readonly systems: number;
  readonly technologies: number;
  readonly families: number;
  readonly standards: number;
  readonly failures: number;
  readonly industries: number;
}

export interface EntityAuthorityValidation {
  readonly missingScores: string[];
  readonly outOfRangeScores: string[];
  readonly nonDeterministicScores: string[];
  readonly criticalEntitiesBelowThreshold: string[];
  readonly isValid: boolean;
}

function uniqueSecondLevelConnections(entityId: string, directIds: Set<string>): number {
  const secondLevel = new Set<string>();
  getConnectedEntities(entityId).forEach((direct) => {
    getConnectedEntities(direct.id).forEach((candidate) => {
      if (candidate.id !== entityId && !directIds.has(candidate.id)) secondLevel.add(candidate.id);
    });
  });
  return secondLevel.size;
}

function normalizedDimensionScore(count: number, weight: number): number {
  if (count <= 0) return 0;
  return Math.min(weight, Math.round((1 - Math.exp(-count / 3)) * weight));
}

export function getEntityAuthorityScore(entityId: string): EntityAuthorityScore | undefined {
  const entity = ENTITY_NODES.find((node) => node.id === entityId);
  if (!entity || entity.kind === 'organization') return undefined;

  const connected = getConnectedEntities(entity.id);
  const directIds = new Set(connected.map((node) => node.id));
  const count = (kind: EntityNode['kind']) => connected.filter((node) => node.kind === kind).length;
  const systems = count('system');
  const technologies = count('technology');
  const families = count('family');
  const standards = count('standard');
  const failures = count('failure');
  const industries = count('industry');
  const coverageBreadth = [systems, technologies, families, standards, failures, industries]
    .filter((value) => value > 0).length;
  const secondLevelConnections = uniqueSecondLevelConnections(entity.id, directIds);

  const dimensionScore =
    normalizedDimensionScore(systems, DIMENSION_WEIGHTS.system) +
    normalizedDimensionScore(technologies, DIMENSION_WEIGHTS.technology) +
    normalizedDimensionScore(families, DIMENSION_WEIGHTS.family) +
    normalizedDimensionScore(standards, DIMENSION_WEIGHTS.standard) +
    normalizedDimensionScore(failures, DIMENSION_WEIGHTS.failure) +
    normalizedDimensionScore(industries, DIMENSION_WEIGHTS.industry);

  const breadthBonus = coverageBreadth * 2;
  const depthBonus = Math.min(8, Math.round(secondLevelConnections / 4));
  const directBonus = Math.min(8, connected.length);
  const score = Math.min(
    100,
    KIND_BASELINE[entity.kind] + dimensionScore + breadthBonus + depthBonus + directBonus,
  );

  return {
    entity,
    score,
    directConnections: connected.length,
    secondLevelConnections,
    coverageBreadth,
    systems,
    technologies,
    families,
    standards,
    failures,
    industries,
  };
}

export function getRankedEntityAuthority(): EntityAuthorityScore[] {
  return ENTITY_NODES
    .filter((node) => node.kind !== 'organization')
    .flatMap((node) => {
      const score = getEntityAuthorityScore(node.id);
      return score ? [score] : [];
    })
    .sort((a, b) =>
      b.score - a.score ||
      b.coverageBreadth - a.coverageBreadth ||
      b.directConnections - a.directConnections ||
      a.entity.id.localeCompare(b.entity.id),
    );
}

export function compareEntityAuthority(a: EntityNode, b: EntityNode): number {
  const aScore = getEntityAuthorityScore(a.id);
  const bScore = getEntityAuthorityScore(b.id);
  return (
    (bScore?.score || 0) - (aScore?.score || 0) ||
    (bScore?.coverageBreadth || 0) - (aScore?.coverageBreadth || 0) ||
    a.id.localeCompare(b.id)
  );
}

export function validateEntityAuthority(): EntityAuthorityValidation {
  const entities = ENTITY_NODES.filter((node) => node.kind !== 'organization');
  const scores = entities.map((entity) => ({
    entity,
    first: getEntityAuthorityScore(entity.id),
    second: getEntityAuthorityScore(entity.id),
  }));
  const missingScores = scores.filter(({ first }) => !first).map(({ entity }) => entity.id);
  const outOfRangeScores = scores
    .filter(({ first }) => first && (first.score < 0 || first.score > 100))
    .map(({ entity }) => entity.id);
  const nonDeterministicScores = scores
    .filter(({ first, second }) => JSON.stringify(first) !== JSON.stringify(second))
    .map(({ entity }) => entity.id);
  const criticalEntitiesBelowThreshold = scores
    .filter(({ entity, first }) =>
      Boolean(first) &&
      (entity.kind === 'technology' || entity.kind === 'system') &&
      (first?.score || 0) < 30,
    )
    .map(({ entity }) => entity.id);

  return {
    missingScores,
    outOfRangeScores,
    nonDeterministicScores,
    criticalEntitiesBelowThreshold,
    isValid:
      missingScores.length === 0 &&
      outOfRangeScores.length === 0 &&
      nonDeterministicScores.length === 0 &&
      criticalEntitiesBelowThreshold.length === 0,
  };
}
