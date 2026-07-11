import { CANONICAL_TECHNOLOGIES } from './canonical-technologies';
import { getGeoContextByKindAndSlug } from './geo-context';
import type { EntityKind } from './entity-graph';

const BASE_URL = 'https://elimfilters.com';
const RETIRED_TECHNOLOGIES = ['AQUAGUARD', 'COOLTECH'];

export type CitationEntityKind = Exclude<EntityKind, 'organization'>;

export interface AICitationAnswer {
  readonly question: string;
  readonly answer: string;
}

export interface AICitationRecord {
  readonly citationId: string;
  readonly canonicalId: string;
  readonly canonicalUrl: string;
  readonly entityKind: CitationEntityKind;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly definition: string;
  readonly engineeringPrinciple: string;
  readonly controlStrategy: string;
  readonly operationalImpact: string;
  readonly retrievalPassages: readonly string[];
  readonly canonicalAnswers: readonly AICitationAnswer[];
  readonly relatedEntityIds: readonly string[];
  readonly publisher: 'ELIMFILTERS®';
}

export interface AICitationValidationResult {
  readonly duplicateCitationIds: string[];
  readonly duplicateAliases: string[];
  readonly missingDefinitions: string[];
  readonly missingAnswers: string[];
  readonly retiredTechnologyReferences: string[];
  readonly invalidCanonicalUrls: string[];
  readonly isValid: boolean;
}

function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

function normalizeAlias(value: string): string {
  return value.trim().toLowerCase().replace(/[™®]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function buildAliases(kind: CitationEntityKind, slug: string, name: string): string[] {
  const aliases = new Set<string>([
    name,
    name.replace(/[™®]/g, ''),
    slug,
    slug.replace(/-/g, ' '),
  ]);

  if (kind === 'technology' && slug in CANONICAL_TECHNOLOGIES) {
    const technology = CANONICAL_TECHNOLOGIES[slug as keyof typeof CANONICAL_TECHNOLOGIES];
    aliases.add(`ELIMFILTERS ${technology.name.replace('™', '')}`);
    aliases.add(technology.role);
  }

  return Array.from(aliases).filter(Boolean);
}

export function buildAICitationRecord(
  kind: CitationEntityKind,
  slug: string,
): AICitationRecord | undefined {
  const context = getGeoContextByKindAndSlug(kind, slug);
  if (!context) return undefined;

  const canonicalUrl = absoluteUrl(context.entity.href);
  const related = [
    ...context.systems,
    ...context.technologies,
    ...context.families,
    ...context.standards,
    ...context.industries,
    ...context.failures,
  ];

  return {
    citationId: `elimfilters:${kind}:${slug}`,
    canonicalId: `${canonicalUrl}#entity`,
    canonicalUrl,
    entityKind: kind,
    name: context.entity.name,
    aliases: buildAliases(kind, slug, context.entity.name),
    definition: context.definition,
    engineeringPrinciple: context.engineeringPrinciple,
    controlStrategy: context.controlStrategy,
    operationalImpact: context.operationalImpact,
    retrievalPassages: context.retrievalPassages,
    canonicalAnswers: context.canonicalAnswers,
    relatedEntityIds: Array.from(new Set(related.map((node) => `${absoluteUrl(node.href)}#entity`))),
    publisher: 'ELIMFILTERS®',
  };
}

export function validateAICitationRecords(
  entities: ReadonlyArray<{ kind: CitationEntityKind; slug: string }>,
): AICitationValidationResult {
  const records = entities.flatMap(({ kind, slug }) => {
    const record = buildAICitationRecord(kind, slug);
    return record ? [record] : [];
  });

  const citationIds = records.map((record) => record.citationId);
  const duplicateCitationIds = citationIds.filter((id, index) => citationIds.indexOf(id) !== index);

  const aliasOwners = new Map<string, Set<string>>();
  records.forEach((record) => {
    record.aliases.forEach((alias) => {
      const normalized = normalizeAlias(alias);
      if (!normalized) return;
      const owners = aliasOwners.get(normalized) || new Set<string>();
      owners.add(record.citationId);
      aliasOwners.set(normalized, owners);
    });
  });

  const duplicateAliases = Array.from(aliasOwners.entries())
    .filter(([, owners]) => owners.size > 1)
    .map(([alias]) => alias);
  const missingDefinitions = records.filter((record) => !record.definition.trim()).map((record) => record.citationId);
  const missingAnswers = records.filter((record) => record.canonicalAnswers.length === 0).map((record) => record.citationId);
  const invalidCanonicalUrls = records
    .filter((record) => !record.canonicalUrl.startsWith(BASE_URL) || record.canonicalId !== `${record.canonicalUrl}#entity`)
    .map((record) => record.citationId);
  const serialized = JSON.stringify(records).toUpperCase();
  const retiredTechnologyReferences = RETIRED_TECHNOLOGIES.filter((name) => serialized.includes(name));

  return {
    duplicateCitationIds: Array.from(new Set(duplicateCitationIds)),
    duplicateAliases,
    missingDefinitions,
    missingAnswers,
    retiredTechnologyReferences,
    invalidCanonicalUrls,
    isValid:
      duplicateCitationIds.length === 0 &&
      duplicateAliases.length === 0 &&
      missingDefinitions.length === 0 &&
      missingAnswers.length === 0 &&
      retiredTechnologyReferences.length === 0 &&
      invalidCanonicalUrls.length === 0,
  };
}
