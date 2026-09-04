import type { KCComparison, KCComparisonCategory } from './types';
import { KC_COMPARISONS as LEGACY_COMPARISONS } from './comparisons-registry';

function canonicalizeIso4406VsNas(comparison: KCComparison): KCComparison {
  const stripRetiredNfpa = (values: string[]) => values.filter((value) => !/NFPA\s*T2\.14/i.test(value));

  return {
    ...comparison,
    comparisonScope:
      'Compares ISO 4406 fluid-cleanliness coding with the legacy NAS 1638 classification approach. The comparison is for interpretation and migration of historical documentation; it does not assign component cleanliness targets or treat a retired external reference as governing authority.',
    optionA: {
      ...comparison.optionA,
      advantages: stripRetiredNfpa(comparison.optionA.advantages),
      typicalApplications: stripRetiredNfpa(comparison.optionA.typicalApplications),
    },
    optionB: {
      ...comparison.optionB,
      advantages: stripRetiredNfpa(comparison.optionB.advantages),
      limitations: stripRetiredNfpa(comparison.optionB.limitations),
      typicalApplications: stripRetiredNfpa(comparison.optionB.typicalApplications),
    },
    engineeringImplications: stripRetiredNfpa(comparison.engineeringImplications),
    whenToUse: comparison.whenToUse.map((clause) => ({
      ...clause,
      conditions: stripRetiredNfpa(clause.conditions),
    })),
    whenNotToUse: comparison.whenNotToUse.map((clause) => ({
      ...clause,
      conditions: stripRetiredNfpa(clause.conditions),
    })),
    revisionHistory: [
      ...comparison.revisionHistory,
      { version: '1.1', date: '2026-09-04', changes: 'Removed retired NFPA T2.14 authority references from the public comparison.' },
    ],
  };
}

function canonicalizeIso5011VsSaeJ726(comparison: KCComparison): KCComparison {
  return {
    ...comparison,
    title: 'ISO 5011 vs. Legacy SAE J726 Air Cleaner Test Reference',
    subtitle: 'Current ISO air-cleaner performance testing compared with a withdrawn SAE legacy reference',
    engineeringObjective:
      'Interpret current ISO 5011 performance data and legacy SAE J726 documentation without treating the withdrawn SAE document as a current equivalent standard.',
    comparisonScope:
      'Covers ISO 5011 as the current engine-intake air-cleaner performance-test reference and SAE J726 only as historical context for legacy data. SAE J726_200206 was canceled on 27 June 2002. Results from different test methods or historical datasets must not be treated as directly interchangeable without validated correlation evidence.',
    governingStandards: comparison.governingStandards.filter((standard) => !/^SAE J726$/i.test(standard)),
    optionA: {
      ...comparison.optionA,
      description:
        'ISO 5011 defines laboratory performance testing for inlet air-cleaning equipment used with internal-combustion engines and compressors. Application decisions should use the applicable ISO test data together with equipment requirements and validated operating conditions.',
      advantages: [
        'Current governed reference for engine-intake air-cleaner performance testing in the ELIMFILTERS Knowledge Center',
        'Supports controlled comparison of restriction, efficiency and dust-capacity performance under its defined method',
        'Provides a current standards owner for new technical content and procurement interpretation',
      ],
      limitations: [
        'Laboratory results remain method- and condition-specific and do not by themselves determine field service intervals',
        'Performance data generated under another test method cannot be assumed equivalent without correlation evidence',
      ],
      typicalApplications: [
        'Current engine-intake air-cleaner performance specifications referencing ISO 5011',
        'Engineering comparison of filter restriction, efficiency and capacity under a common method',
        'Technical review of replacement elements when comparable ISO 5011 evidence is available',
      ],
    },
    optionB: {
      ...comparison.optionB,
      label: 'SAE J726 — withdrawn legacy reference',
      description:
        'SAE J726 is retained here only to interpret historical air-cleaner documentation. The final J726_200206 revision was canceled on 27 June 2002; it must not be presented as a current North American equivalent to ISO 5011 or as governing evidence for new ELIMFILTERS claims.',
      advantages: [
        'Useful for identifying the test basis stated in historical equipment or filter documentation',
        'Helps prevent legacy results from being compared to current ISO 5011 data without recognizing the method difference',
      ],
      limitations: [
        'Canceled document; not a current ELIMFILTERS governing standard',
        'Historical data must retain its original test context and cannot be converted into ISO 5011 performance by assumption',
        'OEM or application requirements must be verified from current equipment documentation rather than inferred from the legacy reference',
      ],
      typicalApplications: [
        'Interpretation of archived test reports or legacy maintenance documentation explicitly citing SAE J726',
        'Historical baseline review where the original test method must be preserved for traceability',
      ],
    },
    matrix: [
      { dimension: 'Governance status', optionA: 'Current governed ISO reference', optionB: 'Withdrawn/canceled legacy reference' },
      { dimension: 'Use in new ELIMFILTERS claims', optionA: 'Permitted when supported by applicable test evidence', optionB: 'No — historical interpretation only' },
      { dimension: 'Cross-method equivalence', optionA: 'Use ISO 5011 results as ISO 5011 results', optionB: 'Do not infer ISO 5011 equivalence from legacy SAE J726 data' },
      { dimension: 'Service-interval meaning', optionA: 'Test data may inform application engineering; field interval remains application-specific', optionB: 'Legacy results do not define a current service interval' },
    ],
    engineeringImplications: [
      'Always identify the test method before comparing restriction, efficiency or capacity values.',
      'Do not present SAE J726 as a current equivalent or alternative governing standard to ISO 5011.',
      'Do not use ISO 3724 as an air-filter service-interval authority; it belongs to hydraulic filter-element fatigue testing, not engine-air service life.',
      'Field service decisions require equipment requirements, operating conditions and validated restriction/condition evidence in addition to laboratory test data.',
    ],
    whenToUse: [
      { option: 'A', conditions: ['Current engineering specifications and technical comparisons that reference ISO 5011', 'New ELIMFILTERS technical content requiring a governed air-cleaner test-method owner'] },
      { option: 'B', conditions: ['Interpreting historical documentation that explicitly cites SAE J726', 'Tracing the origin of legacy air-cleaner performance data without converting it into a current ISO claim'] },
    ],
    whenNotToUse: [
      { option: 'A', conditions: ['When the available result was generated under a different method and no validated correlation to ISO 5011 exists'] },
      { option: 'B', conditions: ['New product qualification or current standards claims', 'Any statement describing SAE J726 as active, current or equivalent to ISO 5011'] },
    ],
    relatedArticles: comparison.relatedArticles.filter((slug) => slug !== 'service-intervals'),
    revisionHistory: [
      ...comparison.revisionHistory,
      { version: '1.1', date: '2026-09-04', changes: 'Reframed SAE J726 as withdrawn legacy context and removed false current-equivalence/service-interval authority.' },
    ],
  };
}

function canonicalizeFuelArchitecture(comparison: KCComparison): KCComparison {
  return {
    ...comparison,
    title: 'Single-Stage vs. Multi-Stage Diesel Fuel Filtration',
    subtitle: 'Application-dependent fuel-cleanliness and water-management architecture for diesel systems',
    engineeringObjective:
      'Compare single-stage and multi-stage diesel fuel-filtration architectures using the actual equipment, contamination exposure, water-management requirement, flow/restriction limits and validated element performance.',
    comparisonScope:
      'Covers diesel fuel-filtration architecture. It does not establish a universal stage count, rail-pressure threshold, micron rating, service interval, cost outcome or OEM mandate. Selection must follow the specific engine/fuel-system requirements and validated application evidence.',
    governingStandards: ['ISO 16332:2018', 'ASTM D6304', 'ISO 12937'],
    optionA: {
      ...comparison.optionA,
      description:
        'A single-stage architecture uses one serviceable filtration location for the functions required by the approved application. Suitability depends on the equipment design, required particulate control, water-management capability, flow/restriction envelope and validated element performance.',
      advantages: [
        'Fewer housings and service points where the equipment architecture is designed for a single-stage arrangement',
        'Compact packaging where installation space and plumbing complexity are constrained',
        'Can be appropriate when the approved application and validated element performance satisfy the required contamination-control functions',
      ],
      limitations: [
        'Particle loading and water-management functions share one service location, which can concentrate contamination burden',
        'Suitability cannot be inferred from engine type or rail pressure alone',
        'A single-stage layout must not be assumed adequate when the equipment specification requires separated functions or additional stages',
      ],
      typicalApplications: [
        'Equipment explicitly designed and validated for a single service-stage fuel-filtration arrangement',
        'Applications where the approved filter assembly satisfies the specified particulate and water-management requirements',
      ],
    },
    optionB: {
      ...comparison.optionB,
      description:
        'A multi-stage architecture separates two or more contamination-control functions or service locations. The stages may divide bulk particulate removal, water separation and finer downstream protection, but the exact sequence and element ratings are application-specific.',
      advantages: [
        'Allows contamination-control functions to be distributed across dedicated stages when the equipment architecture requires it',
        'Can isolate bulk water/contaminant loading from a downstream fine-protection stage',
        'Supports stage-specific inspection or service when the system is designed with independent indicators, drains or elements',
      ],
      limitations: [
        'Adds housings, connections and service points that must fit the approved flow, restriction and sealing requirements',
        'More components do not automatically mean better protection; each stage must have a defined function and validated application fit',
        'Stage count alone does not establish filtration efficiency, water-separation performance or service life',
      ],
      typicalApplications: [
        'Diesel systems whose equipment specification separates particulate filtration and water-management functions',
        'Applications with documented contamination exposure that require multiple validated protection stages',
        'Fuel systems designed by the equipment manufacturer with separate upstream and downstream filtration locations',
      ],
    },
    matrix: [
      { dimension: 'Architecture', optionA: 'One service-stage location', optionB: 'Two or more defined service/protection stages' },
      { dimension: 'Selection basis', optionA: 'Approved application + validated element capability', optionB: 'Approved application + defined purpose for each stage' },
      { dimension: 'Water management', optionA: 'Must be verified for the selected assembly if required', optionB: 'May be assigned to a dedicated stage when designed that way' },
      { dimension: 'Particulate control', optionA: 'Defined by validated element performance, not stage count', optionB: 'Defined by validated performance of each applicable stage' },
      { dimension: 'Micron rating', optionA: 'Application-specific', optionB: 'Application-specific by stage' },
      { dimension: 'Service interval', optionA: 'Condition/equipment/application-specific', optionB: 'Condition/equipment/application-specific for each stage' },
    ],
    engineeringImplications: [
      'Do not select stage count from a universal rail-pressure threshold or generic HPCR label.',
      'Do not describe ISO 16332 as mandating a three-stage architecture; it is a comparative laboratory method for fuel/water separator performance.',
      'Do not infer micron rating from stage number or from TURBOCORE 2010/2020/2040 element-family identifiers.',
      'Use equipment requirements, flow/restriction limits, contamination exposure and validated particulate/water performance to determine architecture.',
      'Cost and service-life outcomes require application-specific evidence and must not be stated as universal advantages.',
    ],
    whenToUse: [
      { option: 'A', conditions: ['The equipment specification provides one filtration service location and the selected assembly is validated for the required functions', 'Application evidence shows one stage satisfies the required particulate and water-management performance'] },
      { option: 'B', conditions: ['The equipment architecture specifies multiple filtration locations or separated protection functions', 'Documented contamination/water-management requirements justify multiple validated stages'] },
    ],
    whenNotToUse: [
      { option: 'A', conditions: ['The equipment requires separate stages or the selected assembly cannot demonstrate the required functions'] },
      { option: 'B', conditions: ['Additional stages are being added without a defined engineering function or without checking total restriction, flow and service requirements'] },
    ],
    relatedTechnologies: ['SYNTAPORE', 'HYDROCORE', 'TURBOCORE'],
    relatedSystems: ['fuel-cleanliness'],
    relatedArticles: Array.from(new Set([...comparison.relatedArticles, 'hpcr-fuel-system-cleanliness'])),
    revisionHistory: [
      ...comparison.revisionHistory,
      { version: '1.1', date: '2026-09-04', changes: 'Removed universal HPCR/OEM/stage-count claims and aligned architecture guidance with application-specific evidence.' },
    ],
  };
}

export const KC_COMPARISONS: KCComparison[] = LEGACY_COMPARISONS.map((comparison) => {
  if (comparison.slug === 'iso4406-vs-nas1638') return canonicalizeIso4406VsNas(comparison);
  if (comparison.slug === 'iso5011-vs-sae-j726') return canonicalizeIso5011VsSaeJ726(comparison);
  if (comparison.slug === 'single-stage-vs-multi-stage-fuel') return canonicalizeFuelArchitecture(comparison);
  return comparison;
});

export function getComparisonBySlug(slug: string): KCComparison | undefined {
  return KC_COMPARISONS.find((comparison) => comparison.slug === slug);
}

export function getComparisonsByCategory(category: KCComparisonCategory): KCComparison[] {
  return KC_COMPARISONS.filter((comparison) => comparison.category === category);
}
