export type KeywordOwnerKind =
  | 'standard'
  | 'comparison'
  | 'commercial'
  | 'engineering'
  | 'industry'
  | 'problem'
  | 'family';

export type KeywordOpportunity = 'high' | 'medium' | 'low';
export type KeywordPublishingState = 'reinforce-existing' | 'owner-gap-review';

export interface KeywordIntentNode {
  readonly keyword: string;
  readonly opportunity: KeywordOpportunity;
  readonly volume?: number;
  readonly ownerKind: KeywordOwnerKind;
  readonly ownerPath: string;
  readonly graphParents: readonly string[];
  readonly allowedSurfaces: readonly ('metadata' | 'body' | 'faq' | 'comparison' | 'product' | 'commercial')[];
  readonly publishingState: KeywordPublishingState;
  readonly action: string;
}

/**
 * Demand signals from the September 2026 AnswerThePublic research.
 *
 * Governance rule: a keyword is not a page. Every query has one intent owner.
 * It may reinforce that owner and its parent entities, but it must not create a
 * second indexable URL unless a reviewed content gap explicitly requires one.
 */
export const ANSWER_THE_PUBLIC_KEYWORD_NODES: readonly KeywordIntentNode[] = [
  {
    keyword: 'iso 5011 air filter', opportunity: 'high', ownerKind: 'standard',
    ownerPath: '/knowledge-center/standards/iso-5011/',
    graphParents: ['standard:iso-5011', 'technology:macrocore', 'system:air-intake'],
    allowedSurfaces: ['metadata', 'body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Strengthen the canonical ISO 5011 standard entity; do not create a parallel Engineering article for the same query intent.',
  },
  {
    keyword: 'iso 16889 filter standard', opportunity: 'high', ownerKind: 'standard',
    ownerPath: '/knowledge-center/standards/iso-16889/',
    graphParents: ['standard:iso-16889', 'technology:nanoforce', 'system:hydraulic'],
    allowedSurfaces: ['metadata', 'body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Strengthen the canonical ISO 16889 entity and keep deep test-method articles subordinate to the standard owner.',
  },
  {
    keyword: 'filtration cleanliness codes', opportunity: 'low', ownerKind: 'standard',
    ownerPath: '/knowledge-center/standards/iso-4406/',
    graphParents: ['standard:iso-4406', 'system:hydraulic', 'system:lubrication'],
    allowedSurfaces: ['metadata', 'body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Use ISO 4406 as the classification owner; comparison content may explain alternate legacy codes without taking ownership.',
  },

  {
    keyword: 'diesel filter comparison', opportunity: 'high', ownerKind: 'comparison',
    ownerPath: '/knowledge-center/comparisons/',
    graphParents: ['system:fuel-cleanliness', 'technology:syntapore', 'technology:hydrocore', 'technology:turbocore'],
    allowedSurfaces: ['comparison', 'product'], publishingState: 'owner-gap-review',
    action: 'Create or approve one dedicated diesel-filter comparison owner before targeting this query; prohibit Engineering metadata ownership.',
  },
  {
    keyword: 'oem vs aftermarket oil filter', opportunity: 'medium', ownerKind: 'comparison',
    ownerPath: '/knowledge-center/comparisons/',
    graphParents: ['system:lubrication', 'technology:syntrax', 'family:oil-filters'],
    allowedSurfaces: ['comparison', 'product'], publishingState: 'owner-gap-review',
    action: 'Create or approve one neutral OEM-vs-aftermarket oil-filter comparison owner; product pages may support but not duplicate the comparison intent.',
  },
  {
    keyword: 'aftermarket filter quality', opportunity: 'low', ownerKind: 'comparison',
    ownerPath: '/knowledge-center/comparisons/',
    graphParents: ['organization:elimfilters', 'family:oil-filters', 'family:primary-fuel', 'family:primary-air'],
    allowedSurfaces: ['comparison', 'product'], publishingState: 'owner-gap-review',
    action: 'Govern as an evidence-based comparison topic; avoid unsupported superiority claims and avoid creating a generic Engineering article.',
  },

  {
    keyword: 'filtration distributor program', opportunity: 'medium', ownerKind: 'commercial',
    ownerPath: '/distributor-application/',
    graphParents: ['organization:elimfilters', 'commercial:distribution'],
    allowedSurfaces: ['metadata', 'body', 'faq', 'commercial'], publishingState: 'reinforce-existing',
    action: 'Assign exclusively to the distributor application and commercial conversion path.',
  },
  {
    keyword: 'industrial filter reseller', opportunity: 'medium', ownerKind: 'commercial',
    ownerPath: '/distributor-application/',
    graphParents: ['organization:elimfilters', 'commercial:distribution'],
    allowedSurfaces: ['metadata', 'body', 'faq', 'commercial'], publishingState: 'reinforce-existing',
    action: 'Assign to distributor recruitment, not to technical Knowledge Center articles.',
  },
  {
    keyword: 'aftermarket filter dealer', opportunity: 'medium', ownerKind: 'commercial',
    ownerPath: '/distributor-application/',
    graphParents: ['organization:elimfilters', 'commercial:distribution'],
    allowedSurfaces: ['metadata', 'body', 'faq', 'commercial'], publishingState: 'reinforce-existing',
    action: 'Assign to distributor recruitment and dealer qualification content only.',
  },

  {
    keyword: 'fleet fuel savings', opportunity: 'medium', ownerKind: 'industry',
    ownerPath: '/industries/trucks-fleets/',
    graphParents: ['industry:trucks-fleets', 'system:fuel-cleanliness', 'system:air-intake'],
    allowedSurfaces: ['metadata', 'body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Use the fleet industry owner for operational context; require evidence before publishing quantified savings claims.',
  },
  {
    keyword: 'diesel fuel consumption filter', opportunity: 'medium', ownerKind: 'engineering',
    ownerPath: '/knowledge-center/engineering/',
    graphParents: ['system:fuel-cleanliness', 'industry:trucks-fleets', 'problem:particle-wear'],
    allowedSurfaces: ['body', 'faq'], publishingState: 'owner-gap-review',
    action: 'Review for a distinct engineering owner only if the content can separate filtration condition from other fuel-consumption variables.',
  },
  {
    keyword: 'fuel efficiency diesel filter', opportunity: 'medium', ownerKind: 'industry',
    ownerPath: '/industries/trucks-fleets/',
    graphParents: ['industry:trucks-fleets', 'system:fuel-cleanliness'],
    allowedSurfaces: ['body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Reinforce fleet application content; do not publish universal fuel-efficiency percentages.',
  },

  {
    keyword: 'water separator diesel', opportunity: 'medium', volume: 869, ownerKind: 'family',
    ownerPath: '/families/fuel-water-separators/',
    graphParents: ['family:fuel-water-separators', 'technology:hydrocore', 'system:fuel-cleanliness'],
    allowedSurfaces: ['metadata', 'body', 'faq', 'product'], publishingState: 'reinforce-existing',
    action: 'Use the standard non-turbine fuel/water separator family as owner; TURBOCORE remains separate for approved FH/FG turbine-style applications.',
  },
  {
    keyword: 'hydrophobic fuel filter', opportunity: 'medium', ownerKind: 'engineering',
    ownerPath: '/knowledge-center/engineering/',
    graphParents: ['system:fuel-cleanliness', 'technology:syntapore', 'technology:hydrocore'],
    allowedSurfaces: ['body', 'faq'], publishingState: 'owner-gap-review',
    action: 'Treat hydrophobic behavior as a mechanism/topic requiring evidence; do not assign the term to a proprietary technology unless validated.',
  },
  {
    keyword: 'diesel fuel water contamination', opportunity: 'low', ownerKind: 'problem',
    ownerPath: '/knowledge-center/problems/diesel-water/',
    graphParents: ['failure:diesel-water', 'system:fuel-cleanliness', 'technology:hydrocore', 'technology:turbocore'],
    allowedSurfaces: ['metadata', 'body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Use the diesel-water failure/problem entity for diagnosis, consequences and mitigation.',
  },

  {
    keyword: 'engine air filter selection', opportunity: 'medium', ownerKind: 'family',
    ownerPath: '/families/primary-air/',
    graphParents: ['family:primary-air', 'technology:macrocore', 'system:air-intake'],
    allowedSurfaces: ['metadata', 'body', 'faq', 'product'], publishingState: 'reinforce-existing',
    action: 'Use the primary-air family for selection intent and link upward to Air Intake & Airflow Protection.',
  },
  {
    keyword: 'heavy duty air filter', opportunity: 'medium', volume: 172, ownerKind: 'family',
    ownerPath: '/families/primary-air/',
    graphParents: ['family:primary-air', 'technology:macrocore', 'system:air-intake'],
    allowedSurfaces: ['metadata', 'body', 'faq', 'product'], publishingState: 'reinforce-existing',
    action: 'Reinforce the primary-air family and product discovery rather than creating a generic heavy-duty article.',
  },
  {
    keyword: 'industrial air filtration', opportunity: 'low', volume: 648, ownerKind: 'engineering',
    ownerPath: '/knowledge-center/systems/air-intake-protection/',
    graphParents: ['system:air-intake', 'technology:macrocore', 'technology:intekcore'],
    allowedSurfaces: ['metadata', 'body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Use the Air Intake & Airflow system owner for broad industrial intent; avoid splitting cabin or compressed-air functions into standalone systems.',
  },

  {
    keyword: 'fleet filtration upgrade', opportunity: 'medium', ownerKind: 'industry',
    ownerPath: '/industries/trucks-fleets/',
    graphParents: ['industry:trucks-fleets', 'system:air-intake', 'system:fuel-cleanliness', 'system:lubrication'],
    allowedSurfaces: ['body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Own at fleet level and connect to system-specific upgrade criteria rather than a standalone generic article.',
  },
  {
    keyword: 'heavy duty oil filter', opportunity: 'medium', volume: 235, ownerKind: 'family',
    ownerPath: '/families/oil-filters/',
    graphParents: ['family:oil-filters', 'technology:syntrax', 'system:lubrication'],
    allowedSurfaces: ['metadata', 'body', 'faq', 'product'], publishingState: 'reinforce-existing',
    action: 'Use the oil-filter family as the commercial/application owner and SYNTRAX as the technical parent.',
  },
  {
    keyword: 'fleet maintenance filters', opportunity: 'low', ownerKind: 'industry',
    ownerPath: '/industries/trucks-fleets/',
    graphParents: ['industry:trucks-fleets', 'system:air-intake', 'system:fuel-cleanliness', 'system:lubrication', 'system:cooling-system'],
    allowedSurfaces: ['body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Reinforce the fleet maintenance context and link to families; do not create one page per maintenance phrase.',
  },

  {
    keyword: 'boat engine filtration', opportunity: 'medium', ownerKind: 'industry',
    ownerPath: '/industries/marine/',
    graphParents: ['industry:marine', 'system:fuel-cleanliness', 'system:air-intake', 'system:lubrication'],
    allowedSurfaces: ['metadata', 'body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Use Marine as the application owner with system-level technical children.',
  },
  {
    keyword: 'marine diesel filter', opportunity: 'medium', ownerKind: 'industry',
    ownerPath: '/industries/marine/',
    graphParents: ['industry:marine', 'system:fuel-cleanliness', 'technology:hydrocore', 'technology:turbocore'],
    allowedSurfaces: ['metadata', 'body', 'faq', 'product'], publishingState: 'reinforce-existing',
    action: 'Own at Marine application level; route turbine-style applications to TURBOCORE and standard separators to HYDROCORE.',
  },
  {
    keyword: 'offshore fuel filter', opportunity: 'medium', ownerKind: 'industry',
    ownerPath: '/industries/marine/',
    graphParents: ['industry:marine', 'system:fuel-cleanliness'],
    allowedSurfaces: ['body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Use Marine/offshore application context and avoid unverified certification or compliance claims.',
  },

  {
    keyword: 'combine harvester filtration', opportunity: 'medium', ownerKind: 'industry',
    ownerPath: '/industries/agriculture/',
    graphParents: ['industry:agriculture', 'system:air-intake', 'system:fuel-cleanliness', 'system:lubrication'],
    allowedSurfaces: ['metadata', 'body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Use Agriculture as owner and connect combine applications to relevant protection systems.',
  },
  {
    keyword: 'agricultural equipment filters', opportunity: 'low', ownerKind: 'industry',
    ownerPath: '/industries/agriculture/',
    graphParents: ['industry:agriculture', 'system:air-intake', 'system:fuel-cleanliness', 'system:lubrication', 'system:hydraulic'],
    allowedSurfaces: ['metadata', 'body', 'faq', 'product'], publishingState: 'reinforce-existing',
    action: 'Use Agriculture as the broad application owner; product families remain children.',
  },
  {
    keyword: 'tractor oil filter', opportunity: 'low', volume: 201, ownerKind: 'family',
    ownerPath: '/families/oil-filters/',
    graphParents: ['family:oil-filters', 'industry:agriculture', 'technology:syntrax', 'system:lubrication'],
    allowedSurfaces: ['body', 'faq', 'product'], publishingState: 'reinforce-existing',
    action: 'Use oil-filter family/product discovery for transaction-oriented intent and Agriculture for application context.',
  },

  {
    keyword: 'fuel system contamination', opportunity: 'low', ownerKind: 'problem',
    ownerPath: '/knowledge-center/problems/diesel-water/',
    graphParents: ['system:fuel-cleanliness', 'failure:diesel-water', 'failure:particle-wear'],
    allowedSurfaces: ['body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Route to governed fuel-contamination problem content and link to particle/water mechanisms as applicable.',
  },
  {
    keyword: 'diesel engine contamination', opportunity: 'low', ownerKind: 'engineering',
    ownerPath: '/knowledge-center/engineering/hpcr-fuel-system-cleanliness/',
    graphParents: ['system:fuel-cleanliness', 'failure:particle-wear', 'failure:diesel-water'],
    allowedSurfaces: ['metadata', 'body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Use the deep HPCR contamination analysis as owner and link diagnostic failures to Problems.',
  },
  {
    keyword: 'engine wear causes', opportunity: 'low', ownerKind: 'problem',
    ownerPath: '/knowledge-center/problems/particle-wear/',
    graphParents: ['failure:particle-wear', 'system:air-intake', 'system:lubrication', 'system:fuel-cleanliness'],
    allowedSurfaces: ['body', 'faq'], publishingState: 'reinforce-existing',
    action: 'Own under the particle-wear failure mechanism; avoid a broad generic article that competes with individual failure entities.',
  },
] as const;

export function getKeywordIntentNode(keyword: string): KeywordIntentNode | undefined {
  const normalized = keyword.trim().toLowerCase();
  return ANSWER_THE_PUBLIC_KEYWORD_NODES.find((node) => node.keyword === normalized);
}

export const KEYWORD_OWNER_GAPS = ANSWER_THE_PUBLIC_KEYWORD_NODES.filter(
  (node) => node.publishingState === 'owner-gap-review',
);
