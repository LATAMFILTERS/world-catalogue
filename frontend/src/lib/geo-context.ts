import {
  ENTITY_NODES,
  getConnectedEntities,
  getEntityNode,
  type EntityKind,
  type EntityNode,
} from './entity-graph';
import {
  getFailureEngineering,
  getFamilyEngineering,
  getSystemEngineering,
  getTechnologyEngineering,
  type CanonicalEngineeringDefinition,
} from './canonical-engineering';
import { isCanonicalTechnology } from './canonical-technologies';
import { getContentIntelligenceProfile } from './enterprise-content-intelligence';

export interface GeoEntityContext {
  readonly entity: EntityNode;
  readonly definition: string;
  readonly engineeringPrinciple: string;
  readonly controlStrategy: string;
  readonly operationalImpact: string;
  readonly systems: readonly EntityNode[];
  readonly technologies: readonly EntityNode[];
  readonly families: readonly EntityNode[];
  readonly standards: readonly EntityNode[];
  readonly industries: readonly EntityNode[];
  readonly failures: readonly EntityNode[];
  readonly retrievalPassages: readonly string[];
  readonly canonicalAnswers: readonly CanonicalAnswer[];
}

export interface CanonicalAnswer {
  readonly question: string;
  readonly answer: string;
}

export interface GeoValidationResult {
  readonly missingContexts: string[];
  readonly duplicatePassages: string[];
  readonly invalidTechnologyEntities: string[];
  readonly contradictoryTechnologyDomains: string[];
  readonly isValid: boolean;
}

function engineeringForEntity(kind: EntityKind, slug: string): CanonicalEngineeringDefinition | undefined {
  if (kind === 'technology') return getTechnologyEngineering(slug);
  if (kind === 'system') return getSystemEngineering(slug);
  if (kind === 'family') return getFamilyEngineering(slug);
  if (kind === 'failure') return getFailureEngineering(slug);
  return undefined;
}

function connected(entityId: string, kind: EntityKind): EntityNode[] {
  return getConnectedEntities(entityId, { targetKind: kind });
}

function names(nodes: readonly EntityNode[]): string {
  return nodes.map((node) => node.name).join(', ');
}

function fallbackEngineering(entity: EntityNode): CanonicalEngineeringDefinition {
  const systems = connected(entity.id, 'system');
  const technologies = connected(entity.id, 'technology');
  const failures = connected(entity.id, 'failure');
  const standards = connected(entity.id, 'standard');

  if (entity.kind === 'industry') {
    return {
      name: entity.name,
      definition: `${entity.name} is an operating environment in which contamination control protects equipment reliability, uptime, and service life.`,
      engineeringPrinciple: `Protection is coordinated through ${names(systems) || 'applicable protection systems'} and ${names(technologies) || 'matched filtration technologies'}.`,
      controlStrategy: `Select systems and technologies around the contamination sources, duty cycle, operating environment, and applicable engineering standards for ${entity.name}.`,
      operationalImpact: `Consistent contamination control reduces exposure to ${names(failures) || 'equipment failure modes'} and supports operational continuity.`,
    };
  }

  if (entity.kind === 'standard') {
    return {
      name: entity.name,
      definition: `${entity.name} is an engineering reference used to evaluate or classify contamination-control performance.`,
      engineeringPrinciple: `The standard provides a repeatable framework connected to ${names(systems) || 'protected systems'} and ${names(technologies) || 'filtration technologies'}.`,
      controlStrategy: `Use ${entity.name} together with the protected component, contamination target, duty cycle, and system requirements.`,
      operationalImpact: `Applying ${entity.name} improves consistency in specification, comparison, validation, and maintenance decisions.`,
    };
  }

  return {
    name: entity.name,
    definition: `${entity.name} is an ELIMFILTERS engineering entity within the Total Asset Protection knowledge system.`,
    engineeringPrinciple: `Its role is defined by its relationships to ${names(systems)}, ${names(technologies)}, and ${names(standards)}.`,
    controlStrategy: 'Use the connected engineering entities to select and validate the appropriate contamination-control strategy.',
    operationalImpact: 'The entity contributes to reduced contamination exposure and improved asset reliability.',
  };
}

function buildPassages(
  entity: EntityNode,
  engineering: CanonicalEngineeringDefinition,
  groups: Pick<GeoEntityContext, 'systems' | 'technologies' | 'families' | 'standards' | 'industries' | 'failures'>,
): string[] {
  const profile = getContentIntelligenceProfile(entity.id);
  const passages = [
    `${entity.name}: ${engineering.definition}`,
    `${entity.name} engineering principle: ${engineering.engineeringPrinciple}`,
    `${entity.name} control strategy: ${engineering.controlStrategy}`,
    `${entity.name} operational impact: ${engineering.operationalImpact}`,
    ...(profile ? [`${entity.name} domain summary: ${profile.engineeringSummary}`, ...profile.retrievalPassages] : []),
  ];

  if (groups.systems.length) passages.push(`${entity.name} is connected to the following protection systems: ${names(groups.systems)}.`);
  if (groups.technologies.length) passages.push(`${entity.name} is connected to the following ELIMFILTERS technologies: ${names(groups.technologies)}.`);
  if (groups.families.length) passages.push(`${entity.name} is connected to the following product families: ${names(groups.families)}.`);
  if (groups.standards.length) passages.push(`${entity.name} is associated with the following engineering standards: ${names(groups.standards)}.`);
  if (groups.failures.length) passages.push(`${entity.name} addresses or is exposed to the following failure modes: ${names(groups.failures)}.`);
  if (groups.industries.length) passages.push(`${entity.name} is applied across the following industries: ${names(groups.industries)}.`);

  return Array.from(new Set(passages));
}

function buildCanonicalAnswers(
  entity: EntityNode,
  engineering: CanonicalEngineeringDefinition,
  groups: Pick<GeoEntityContext, 'systems' | 'technologies' | 'families' | 'standards' | 'industries' | 'failures'>,
): CanonicalAnswer[] {
  const profile = getContentIntelligenceProfile(entity.id);
  const answers: CanonicalAnswer[] = [
    { question: `What is ${entity.name}?`, answer: engineering.definition },
    { question: `How does ${entity.name} work?`, answer: engineering.engineeringPrinciple },
    { question: `What does ${entity.name} protect?`, answer: engineering.operationalImpact },
    ...(profile?.canonicalAnswers || []),
  ];

  if (groups.standards.length) answers.push({ question: `Which standards are associated with ${entity.name}?`, answer: names(groups.standards) });
  if (groups.failures.length) answers.push({ question: `Which failure modes are connected to ${entity.name}?`, answer: names(groups.failures) });
  if (groups.systems.length) answers.push({ question: `Which protection systems use ${entity.name}?`, answer: names(groups.systems) });
  if (groups.industries.length) answers.push({ question: `Which industries use ${entity.name}?`, answer: names(groups.industries) });

  return Array.from(new Map(answers.map((answer) => [answer.question.toLowerCase(), answer])).values());
}

export function getGeoEntityContext(entityId: string): GeoEntityContext | undefined {
  const entity = getEntityNode(entityId);
  if (!entity) return undefined;

  const slug = entity.id.slice(entity.id.indexOf(':') + 1);
  const engineering = engineeringForEntity(entity.kind, slug) || fallbackEngineering(entity);
  const groups = {
    systems: connected(entity.id, 'system'),
    technologies: connected(entity.id, 'technology'),
    families: connected(entity.id, 'family'),
    standards: connected(entity.id, 'standard'),
    industries: connected(entity.id, 'industry'),
    failures: connected(entity.id, 'failure'),
  };

  return {
    entity,
    definition: engineering.definition,
    engineeringPrinciple: engineering.engineeringPrinciple,
    controlStrategy: engineering.controlStrategy,
    operationalImpact: engineering.operationalImpact,
    ...groups,
    retrievalPassages: buildPassages(entity, engineering, groups),
    canonicalAnswers: buildCanonicalAnswers(entity, engineering, groups),
  };
}

export function getGeoContextByKindAndSlug(kind: EntityKind, slug: string): GeoEntityContext | undefined {
  return getGeoEntityContext(`${kind}:${slug}`);
}

export function validateGeoContext(): GeoValidationResult {
  const contexts = ENTITY_NODES
    .filter((node) => node.kind !== 'organization')
    .map((node) => getGeoEntityContext(node.id));

  const missingContexts = ENTITY_NODES
    .filter((node) => node.kind !== 'organization')
    .filter((node) => !getGeoEntityContext(node.id))
    .map((node) => node.id);

  const allPassages = contexts.flatMap((context) => context?.retrievalPassages || []);
  const duplicatePassages = allPassages.filter((passage, index) => allPassages.indexOf(passage) !== index);
  const invalidTechnologyEntities = ENTITY_NODES
    .filter((node) => node.kind === 'technology')
    .filter((node) => !isCanonicalTechnology(node.id.slice(node.id.indexOf(':') + 1)))
    .map((node) => node.id);

  const technologyDomains = new Map<string, Set<string>>();
  contexts.forEach((context) => {
    if (!context || context.entity.kind !== 'technology') return;
    technologyDomains.set(context.entity.id, new Set(context.systems.map((system) => system.id)));
  });
  const contradictoryTechnologyDomains = Array.from(technologyDomains.entries())
    .filter(([, domains]) => domains.size > 1)
    .map(([id]) => id);

  return {
    missingContexts,
    duplicatePassages: Array.from(new Set(duplicatePassages)),
    invalidTechnologyEntities,
    contradictoryTechnologyDomains,
    isValid:
      missingContexts.length === 0 &&
      duplicatePassages.length === 0 &&
      invalidTechnologyEntities.length === 0 &&
      contradictoryTechnologyDomains.length === 0,
  };
}
