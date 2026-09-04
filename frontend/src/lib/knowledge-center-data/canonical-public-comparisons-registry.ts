import type { KCComparison, KCComparisonCategory } from './types';
import {
  KC_COMPARISONS as SEMANTIC_COMPARISONS,
} from './canonical-comparisons-registry';
import { isConsolidatedEngineeringTopic } from '../knowledge-center/canonical-article-ownership';

function isRetiredNfpaStandard(value: string): boolean {
  return /nfpa[\s-]*t2[.\s-]*14/i.test(value);
}

function isIso3724(value: string): boolean {
  return /iso[\s-]*3724/i.test(value);
}

function canonicalizeHydraulicTopology(comparison: KCComparison): KCComparison {
  if (comparison.slug !== 'online-vs-offline-hydraulic') return comparison;

  return {
    ...comparison,
    subtitle: 'Application-dependent hydraulic contamination-control topologies — in-circuit filtration and independent fluid conditioning',
    engineeringObjective:
      'Compare in-circuit and offline hydraulic filtration using component sensitivity, contamination sources, operating duty, reservoir condition, flow/restriction requirements and maintenance availability.',
    comparisonScope:
      'Covers online filtration located in the working hydraulic circuit and offline kidney-loop filtration operating through an independent conditioning circuit. Neither topology is universally mandatory or sufficient by itself; the required architecture depends on equipment design, cleanliness requirements and validated operating conditions.',
    optionA: {
      ...comparison.optionA,
      description:
        'Online filtration places the filter in a working circuit location such as pressure or return flow. Its purpose and rating depend on the circuit design, component sensitivity, allowable pressure drop and contamination load. An online filter is not automatically required in every hydraulic architecture solely because the system is hydraulic.',
      typicalApplications: [
        'Hydraulic circuits whose equipment design includes pressure-line, return-line or other in-circuit filtration',
        'Applications requiring direct protection of defined downstream components within the working flow path',
        'Systems where the selected filter location, flow capacity and differential-pressure envelope are validated for the duty cycle',
      ],
    },
    optionB: {
      ...comparison.optionB,
      description:
        'Offline or kidney-loop filtration uses an independent pump and filter circuit to condition reservoir fluid separately from the main working flow. It can support contamination removal during operation or maintenance windows, but it does not automatically replace filtration required by the equipment design inside the working circuit.',
      typicalApplications: [
        'Reservoir conditioning where an independent recirculation loop is practical',
        'Systems requiring fluid cleanup without routing the full working flow through a fine conditioning element',
        'Maintenance programmes using offline conditioning as a supplement to the equipment filtration architecture',
      ],
    },
    matrix: [
      { dimension: 'Flow path', optionA: 'Inside a working hydraulic circuit', optionB: 'Independent conditioning circuit' },
      { dimension: 'Primary selection basis', optionA: 'Circuit design, component protection, flow and pressure-drop requirements', optionB: 'Reservoir conditioning objective, cleanup rate and available independent flow' },
      { dimension: 'Cleanliness target', optionA: 'Application/component-specific', optionB: 'Application/component-specific' },
      { dimension: 'Can replace the other topology?', optionA: 'Not by assumption', optionB: 'Not by assumption' },
      { dimension: 'Service strategy', optionA: 'Based on equipment and filter condition requirements', optionB: 'Based on conditioning objective and measured fluid condition' },
    ],
    engineeringImplications: [
      'Do not state that every hydraulic system must use online filtration; verify the equipment architecture and protected components.',
      'Do not state that a kidney loop automatically replaces in-circuit filtration required by the equipment design.',
      'ISO 4406 cleanliness codes describe fluid contamination levels; they do not prescribe one universal filtration topology.',
      'Use ISO 16889 data when applicable to element performance, but select topology from the actual circuit, component sensitivity and operating conditions.',
    ],
    whenToUse: [
      { option: 'A', conditions: ['The equipment or circuit design requires filtration in the working flow path', 'A defined component or circuit requires direct in-line contamination protection and the filter can meet the flow/pressure requirements'] },
      { option: 'B', conditions: ['Independent reservoir conditioning is required or beneficial based on measured contamination and operating strategy', 'A separate cleanup circuit can be installed without compromising the working hydraulic circuit'] },
    ],
    whenNotToUse: [
      { option: 'A', conditions: ['The topology is being specified only from a generic cleanliness-code assumption without checking the actual circuit'] },
      { option: 'B', conditions: ['It is being used as a substitute for equipment-required working-circuit filtration without engineering validation'] },
    ],
    revisionHistory: [
      ...comparison.revisionHistory,
      { version: '1.1', date: '2026-09-04', changes: 'Removed universal topology and cleanliness-target claims; made selection application- and evidence-dependent.' },
    ],
  };
}

function sanitizeRelations(comparison: KCComparison): KCComparison {
  const governingStandards = comparison.governingStandards
    .filter((standard) => !isRetiredNfpaStandard(standard))
    .filter((standard) => comparison.slug !== 'cellulose-vs-synthetic-media' || !isIso3724(standard));

  return {
    ...comparison,
    governingStandards,
    relatedStandards: comparison.relatedStandards.filter((standard) => !isRetiredNfpaStandard(standard)),
    relatedArticles: comparison.relatedArticles.filter((slug) => !isConsolidatedEngineeringTopic(slug)),
  };
}

/**
 * Final public Comparison registry.
 *
 * Semantic corrections happen in canonical-comparisons-registry.ts. This final
 * layer enforces application boundaries plus graph/discovery hygiene so retired
 * Standards, domain-mismatched governing references and consolidated Engineering
 * aliases cannot be reintroduced through lateral relationships.
 */
export const KC_COMPARISONS: KCComparison[] = SEMANTIC_COMPARISONS
  .map(canonicalizeHydraulicTopology)
  .map(sanitizeRelations);

export function getComparisonBySlug(slug: string): KCComparison | undefined {
  return KC_COMPARISONS.find((comparison) => comparison.slug === slug);
}

export function getComparisonsByCategory(category: KCComparisonCategory): KCComparison[] {
  return KC_COMPARISONS.filter((comparison) => comparison.category === category);
}
