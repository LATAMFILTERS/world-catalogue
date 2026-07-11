import { ENTITY_NODES, getConnectedEntities, type EntityNode } from './entity-graph';

export interface EntityAuthorityScore {
  readonly entity: EntityNode;
  readonly score: number;
  readonly directConnections: number;
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
  readonly isValid: boolean;
}

export function getEntityAuthorityScore(entityId: string): EntityAuthorityScore | undefined {
  const entity = ENTITY_NODES.find((node) => node.id === entityId);
  if (!entity || entity.kind === 'organization') return undefined;

  const connected = getConnectedEntities(entity.id);
  const count = (kind: EntityNode['kind']) => connected.filter((node) => node.kind === kind).length;
  const systems = count('system');
  const technologies = count('technology');
  const families = count('family');
  const standards = count('standard');
  const failures = count('failure');
  const industries = count('industry');

  const weighted =
    systems * 16 +
    technologies * 14 +
    families * 12 +
    standards * 13 +
    failures * 15 +
    industries * 8;

  return {
    entity,
    score: Math.min(100, Math.round(weighted / 2)),
    directConnections: connected.length,
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
    .sort((a, b) => b.score - a.score || b.directConnections - a.directConnections || a.entity.name.localeCompare(b.entity.name));
}

export function validateEntityAuthority(): EntityAuthorityValidation {
  const entities = ENTITY_NODES.filter((node) => node.kind !== 'organization');
  const scores = entities.map((entity) => ({ entity, score: getEntityAuthorityScore(entity.id) }));
  const missingScores = scores.filter(({ score }) => !score).map(({ entity }) => entity.id);
  const outOfRangeScores = scores
    .filter(({ score }) => score && (score.score < 0 || score.score > 100))
    .map(({ entity }) => entity.id);

  return {
    missingScores,
    outOfRangeScores,
    isValid: missingScores.length === 0 && outOfRangeScores.length === 0,
  };
}
