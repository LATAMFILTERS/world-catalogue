import { getRankedEntityAuthority, type EntityAuthorityScore } from './entity-authority';
import type { EntityKind } from './entity-graph';

export interface AuthorityCoverageGap {
  readonly entityId: string;
  readonly entityName: string;
  readonly entityKind: Exclude<EntityKind, 'organization'>;
  readonly score: number;
  readonly missingDimensions: readonly string[];
  readonly recommendation: string;
}

export interface EntityAuthorityReport {
  readonly generatedFrom: 'canonical-entity-graph';
  readonly totalEntities: number;
  readonly averageScore: number;
  readonly highestAuthority: readonly EntityAuthorityScore[];
  readonly lowestAuthority: readonly EntityAuthorityScore[];
  readonly coverageGaps: readonly AuthorityCoverageGap[];
}

function missingDimensions(score: EntityAuthorityScore): string[] {
  return [
    ['systems', score.systems],
    ['technologies', score.technologies],
    ['product families', score.families],
    ['standards', score.standards],
    ['failure modes', score.failures],
    ['industries', score.industries],
  ]
    .filter(([, count]) => count === 0)
    .map(([label]) => String(label));
}

function recommendationFor(score: EntityAuthorityScore, missing: readonly string[]): string {
  if (missing.length === 0) {
    return 'Maintain coverage and expand technical depth through canonical engineering content.';
  }
  return `Strengthen canonical coverage for ${missing.join(', ')} before adding non-canonical links.`;
}

export function buildEntityAuthorityReport(): EntityAuthorityReport {
  const ranked = getRankedEntityAuthority();
  const totalScore = ranked.reduce((sum, entry) => sum + entry.score, 0);
  const coverageGaps = ranked
    .map((entry) => {
      const missing = missingDimensions(entry);
      return {
        entityId: entry.entity.id,
        entityName: entry.entity.name,
        entityKind: entry.entity.kind as Exclude<EntityKind, 'organization'>,
        score: entry.score,
        missingDimensions: missing,
        recommendation: recommendationFor(entry, missing),
      };
    })
    .filter((entry) => entry.missingDimensions.length > 0)
    .sort((a, b) => a.score - b.score || a.entityId.localeCompare(b.entityId));

  return {
    generatedFrom: 'canonical-entity-graph',
    totalEntities: ranked.length,
    averageScore: ranked.length ? Math.round(totalScore / ranked.length) : 0,
    highestAuthority: ranked.slice(0, 10),
    lowestAuthority: ranked.slice(-10).reverse(),
    coverageGaps,
  };
}
