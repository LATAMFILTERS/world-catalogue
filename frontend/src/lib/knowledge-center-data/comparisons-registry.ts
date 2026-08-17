/**
 * comparisons-registry.ts
 * ELIMFILTERS Knowledge Center — Engineering Comparison Registry
 *
 * 10 side-by-side engineering comparisons across 4 categories:
 *   - standards     (3): expression/classification systems
 *   - technology    (2): media and mechanism comparisons
 *   - system        (3): circuit architecture comparisons
 *   - test-method   (2): contamination measurement comparisons
 *
 * Entity IDs are permanent graph IDs — never reassigned.
 * Content language: neutral technical documentation, no marketing claims.
 */

import type { KCComparison } from './types';
import { COMPARISON_IDS } from './entity-ids';

export const KC_COMPARISONS: KCComparison[] = [

  // ── STANDARDS COMPARISONS ──────────────────────────────────────────────────

  {
    id:       COMPARISON_IDS['beta-ratio-vs-filtration-efficiency'],
    slug:     'beta-ratio-vs-filtration-efficiency',
    title:    'Beta Ratio vs. Single-Pass Filtration Efficiency',
    subtitle: 'Two expressions of the same particle capture measurement — ISO 16889 multipass context',
    category: 'standards',

    engineeringObjective:
      'Determine which expression to use when specifying, reporting, or comparing filter element particle capture performance under ISO 16889 conditions.',
    comparisonScope:
      'Covers Beta ratio (β_x(c)) and single-pass efficiency (E%) derived from ISO 16889 multipass testing. Does not cover gravimetric efficiency, air filter arrestance, or single-pass membrane test methods.',
    governingStandards: ['ISO 16889:2022', 'ISO 11171:2010', 'ISO 4406:2021'],

    optionA: {
      id:          'A',
      label:       'Beta Ratio β_x(c)',
      description: 'The ratio of upstream particle count to downstream particle count at a stated particle size x under test conditions c. Defined in ISO 16889:2022 §3.1.2 as β_x(c) = N_up / N_down where N is the cumulative count of particles ≥x µm(c) per unit volume of fluid. A higher Beta value indicates fewer particles passing through; β₁₀(c) = 200 means 200 particles upstream per 1 downstream at ≥10 µm(c).',
      advantages: [
        'Directly proportional to the actual upstream/downstream particle ratio — engineering-precise',
        'Scale is unbounded (β = 2 to β = ∞), which reveals gradations in high-efficiency media that percentages compress above 99%',
        'Required by ISO 16889 and referenced in most procurement specifications for hydraulic and lube oil filter elements',
        'Maps directly to ISO 4406 cleanliness code calculations used in system design',
        'Invertibility: E = (1 − 1/β) × 100% converts without ambiguity',
      ],
      limitations: [
        'Unintuitive scale — a non-specialist may not grasp that β = 200 means 99.5% efficiency',
        'Two high-efficiency filters (β = 200 vs β = 1000) appear numerically far apart but differ by less than 0.4 percentage points',
        'Requires ISO 11171:2010 particle counter calibration to generate valid data; uncalibrated counts are not β-comparable',
        'Conditioned (c) suffix is often omitted in legacy specs, creating data comparability problems between pre- and post-2000 test data',
      ],
      typicalApplications: [
        'ISO filter element specifications and procurement documents',
        'Hydraulic system cleanliness level design (ISO 17/15/12 target calculations)',
        'Lube oil filter element rating sheets (e.g. β₁₀(c) ≥ 200)',
        'Engineering validation reports under ISO 16889 test protocol',
      ],
    },

    optionB: {
      id:          'B',
      label:       'Single-Pass Filtration Efficiency E%',
      description: 'The percentage of particles of a given size removed in a single pass through a filter element, calculated as E = (1 − 1/β) × 100%. For example, β₁₀(c) = 200 corresponds to E = 99.5% at ≥10 µm(c). Efficiency is sometimes measured via single-pass test methods (add-on-test per ISO 4572, now withdrawn) but when derived from ISO 16889 multipass data, it is mathematically identical to the Beta ratio — only the presentation differs.',
      advantages: [
        'Intuitive percentage scale immediately understood by non-engineering stakeholders',
        'Communicates high-performance filters clearly to purchasing or maintenance personnel',
        'Useful for summary documentation, warranty specifications, and operator training materials',
        'Directly comparable to air filter efficiency expressions (ISO 5011 arrestance / efficiency)',
      ],
      limitations: [
        'Compresses the high-efficiency end: difference between β = 200 (99.5%) and β = 1000 (99.9%) appears trivially small but represents a 5× performance gap in downstream particle passage',
        'Precision requirement: "99%" must specify the particle size threshold and test conditions — without this, the value is not comparable across filters',
        'Historical single-pass test data (ISO 4572, withdrawn 2000) is not directly comparable to multipass ISO 16889 efficiency values despite identical percentage format',
        'Cannot be used to calculate ISO 4406 cleanliness code degradation without first converting back to Beta ratio',
      ],
      typicalApplications: [
        'Commercial product data sheets aimed at non-engineering audiences',
        'Operator training and maintenance documentation',
        'Regulatory compliance documentation requiring percentage format',
        'Quick communication of filter capability without full ISO 16889 data context',
      ],
    },

    matrix: [
      { dimension: 'Definition basis',         optionA: 'Ratio N_up / N_down per ISO 16889',        optionB: 'Percentage (1 − 1/β) × 100%',               engineeringNote: 'Mathematically identical when both derived from ISO 16889 multipass data' },
      { dimension: 'Scale range',              optionA: '1 (no filtration) → ∞ (absolute)',          optionB: '0% → 100%' },
      { dimension: 'High-efficiency discrimination', optionA: 'β = 200 vs β = 1000 clearly distinct', optionB: '99.5% vs 99.9% — only 0.4 pp difference on scale' },
      { dimension: 'ISO 16889 requirement',    optionA: 'Required expression in test reports',        optionB: 'Derived metric; not primary ISO 16889 output' },
      { dimension: 'ISO 4406 compatibility',   optionA: 'Direct input to cleanliness calculations',  optionB: 'Must convert to β first for system design' },
      { dimension: 'Stakeholder clarity',      optionA: 'Engineering-precise; requires explanation',  optionB: 'Intuitive for non-engineers; loses nuance at high efficiency' },
      { dimension: 'Particle size specificity', optionA: 'Must state β_x(c) with size subscript',    optionB: 'Must state E_x(c)% with size; often omitted in practice' },
    ],

    engineeringImplications: [
      'Specifying "99% efficiency" without stating particle size and test method is meaningless for procurement — always require the full β_x(c) value from ISO 16889 data.',
      'Legacy single-pass data (pre-2000) expressed as efficiency % cannot be directly compared to modern ISO 16889 Beta ratio data — the test methods differ fundamentally.',
      'For system cleanliness targeting (ISO 4406 code selection), Beta ratio must be used — efficiency percentage has no direct path to cleanliness code calculations without conversion.',
      'When comparing two high-efficiency elements (both rated >99%), the Beta ratio reveals which provides meaningfully better contamination control; the percentage obscures this.',
    ],

    whenToUse: [
      {
        option: 'A',
        conditions: [
          'Writing procurement specifications for hydraulic or lube oil filter elements',
          'Performing ISO 4406 system cleanliness calculations or selecting filter ratings for target codes',
          'Comparing filter element performance in engineering validation reports',
          'Any context requiring ISO 16889 compliance documentation',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Communicating filter capability to maintenance personnel or purchasing stakeholders without engineering background',
          'Producing commercial product data sheets summarising performance',
          'Regulatory submissions that mandate percentage format',
          'Air filter performance context where arrestance/efficiency in % is the established convention (ISO 5011)',
        ],
      },
    ],

    whenNotToUse: [
      {
        option: 'A',
        conditions: [
          'User-facing marketing materials where the ratio scale causes confusion',
          'Cross-media comparisons with air filters where efficiency % is the established metric',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Engineering specifications — "99% efficient" without particle size and test method is not a specification',
          'Comparing two high-efficiency elements where the small percentage difference masks a large performance gap',
          'ISO 4406 cleanliness level system design calculations',
        ],
      },
    ],

    relatedStandards:    ['iso-16889', 'iso-11171', 'iso-4406'],
    relatedTechnologies: ['NANOFORCE', 'SYNTRAX'],
    relatedSystems:      ['hydraulic', 'lube-oil'],
    relatedTerms:        ['beta-ratio', 'filtration-efficiency', 'multipass-test', 'particle-counting'],
    relatedArticles:     ['testing-and-validation', 'fluid-cleanliness', 'filter-media-science'],

    revisionHistory: [
      { version: '1.0', date: '2026-07-09', changes: 'Initial entry — Phase 6C Engineering Comparison Engine' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────

  {
    id:       COMPARISON_IDS['iso4406-vs-nas1638'],
    slug:     'iso4406-vs-nas1638',
    title:    'ISO 4406 vs. NAS 1638 Fluid Cleanliness Classification',
    subtitle: 'Two cleanliness coding systems for hydraulic and lube oil fluids — international vs. US aerospace legacy',
    category: 'standards',

    engineeringObjective:
      'Select the correct cleanliness classification system when specifying, measuring, or reporting fluid cleanliness in hydraulic and lube oil systems to ensure unambiguous communication between engineering teams and suppliers.',
    comparisonScope:
      'Covers ISO 4406:2021 (three-code particle count per mL) and NAS 1638 (single class particle count per 100 mL in size ranges). Does not cover ISO 4407 (counting method) or SAE AS4059 (aerospace successor to NAS 1638).',
    governingStandards: ['ISO 4406:2021', 'NAS 1638:2011', 'SAE AS4059F', 'ISO 11171:2010'],

    optionA: {
      id:          'A',
      label:       'ISO 4406:2021',
      description: 'A three-number cleanliness code (e.g. 16/14/11) where each number represents the ISO range code for cumulative particle counts per mL at ≥4 µm(c), ≥6 µm(c), and ≥14 µm(c) respectively. Range codes are logarithmic: code N means the count lies between 2^(N−1) and 2^N particles/mL. Requires ISO 11171:2010-calibrated automatic particle counter (APC). Widely adopted globally since 1999; current revision is ISO 4406:2021.',
      advantages: [
        'Three-code system covers small, medium, and large particle populations independently — more diagnostic information than a single class',
        'Logarithmic code scale resolves large cleanliness ranges efficiently (code 16 = 320–640 particles/mL)',
        'Mandatory reference for NFPA T2.14, DIN 51524-3, and most current OEM hydraulic specifications',
        'ISO 11171:2010 calibration requirement ensures inter-laboratory reproducibility',
        'Current international standard — actively maintained with 2021 revision incorporating updated particle counter calibration',
        'Directly compatible with ISO 16889 Beta ratio calculations for system design',
      ],
      limitations: [
        'Three-code format can be misread — code order (4/6/14 µm) must not be reversed',
        'Requires ISO 11171-calibrated APC — older ACFTD-based counters produce incomparable results',
        'No direct numerical relationship between ISO code and NAS class — conversion is approximate, not exact',
        'The (c) suffix (calibrated) is often missing in legacy documents, making pre-2000 data ambiguous',
      ],
      typicalApplications: [
        'Mobile and industrial hydraulic system specifications globally',
        'Lube oil system cleanliness targets in engine and transmission applications',
        'NFPA T2.14 proportional valve protection requirements',
        'OEM hydraulic component specifications (Bosch Rexroth, Parker, Eaton)',
        'ISO 16889 system design calculations',
      ],
    },

    optionB: {
      id:          'B',
      label:       'NAS 1638',
      description: 'A single-class particle contamination specification (Class 00 to Class 12) based on maximum allowable particle counts per 100 mL in five size ranges: 5–15 µm, 15–25 µm, 25–50 µm, 50–100 µm, and >100 µm. Class is determined by the worst (highest) count in any range. Developed by the National Aerospace Standard (NAS) committee and originally used by US aerospace and defence industries. NAS 1638 has been formally superseded by SAE AS4059F for new aerospace designs, but remains in service on legacy systems.',
      advantages: [
        'Single class number is simple to communicate and verify against a specification',
        'Long history in US aerospace and defence — engineers familiar with NAS Class 6, 8, etc.',
        'Preserved in legacy contracts and OEM manuals that cannot be changed without system re-qualification',
        'Class 6 and below (equivalent roughly to ISO 16/14/11) still widely referenced in North American industrial hydraulic contexts',
      ],
      limitations: [
        'Single-class worst-case rule can be dominated by one outlier size band — gives less diagnostic information than ISO 4406 three-code',
        'Based on ACFTD particle size distribution (discontinued) — results from modern ISO 11171-calibrated counters produce different (typically cleaner) NAS class numbers for the same actual fluid',
        'Formally superseded by SAE AS4059F for new aerospace designs; NAS 1638 should not be used for new specifications',
        'No ISO-equivalent calibration requirement in the original standard — cross-laboratory reproducibility was poorer than ISO 4406',
        'Approximate and non-linear mapping to ISO 4406 codes — conversion tables are informative only, not exact',
      ],
      typicalApplications: [
        'Legacy US aerospace and defence hydraulic systems with NAS-based OEM manuals',
        'Existing contracts referencing NAS Class levels that cannot be revised',
        'North American industrial markets where NAS terminology remains embedded in equipment documentation',
        'Historical fluid analysis reports requiring comparison with legacy NAS data',
      ],
    },

    matrix: [
      { dimension: 'Code structure',           optionA: 'Three codes: ≥4, ≥6, ≥14 µm(c) per mL',           optionB: 'Single class across 5 size ranges per 100 mL' },
      { dimension: 'Particle sizes covered',   optionA: '≥4 µm(c), ≥6 µm(c), ≥14 µm(c)',                   optionB: '5–15, 15–25, 25–50, 50–100, >100 µm' },
      { dimension: 'Scale type',               optionA: 'Logarithmic range codes (0–24+)',                    optionB: 'Linear class numbers (00–12)' },
      { dimension: 'Calibration basis',        optionA: 'ISO 11171:2010 (PSL spheres)',                       optionB: 'ACFTD (discontinued 1999) — legacy data incomparable' },
      { dimension: 'Current status',           optionA: 'Active international standard (ISO 4406:2021)',       optionB: 'Superseded by SAE AS4059F for new designs' },
      { dimension: 'Diagnostic detail',        optionA: 'Three independent size populations — more information', optionB: 'Worst-case single class — less diagnostic' },
      { dimension: 'ISO 16889 compatibility',  optionA: 'Direct design compatibility',                        optionB: 'Requires conversion (approximate only)' },
      { dimension: 'Typical example',          optionA: '16/14/11 (mobile hydraulics)',                       optionB: 'Class 6 (aerospace hydraulics, legacy)' },
    ],

    engineeringImplications: [
      'Any specification written for new equipment or new systems must use ISO 4406:2021 — NAS 1638 is no longer appropriate for new designs.',
      'ACFTD-calibrated APC data and ISO 11171-calibrated APC data are not numerically comparable — a fluid measuring NAS Class 6 on an old counter may not meet NAS Class 6 on a modern counter.',
      'When converting legacy NAS class to ISO 4406 for mixed-document systems, use conversion tables as guidance only; the two scales cannot be precisely mapped because they cover different particle size ranges.',
      'For international procurement, always specify ISO 4406 codes — NAS 1638 is not recognised as current in most non-US national procurement frameworks.',
    ],

    whenToUse: [
      {
        option: 'A',
        conditions: [
          'All new hydraulic and lube oil system cleanliness specifications',
          'International procurement or supply chain where ISO compliance is required',
          'System design calculations using ISO 16889 Beta ratio framework',
          'OEM component specifications referencing NFPA T2.14 or DIN 51524',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Legacy aerospace or defence system maintenance where OEM manuals specify NAS classes and re-qualification is not feasible',
          'Interpreting historical fluid analysis records that predate ISO 4406 adoption',
          'Contracts that cannot be revised to ISO 4406 without programme change authority',
        ],
      },
    ],

    whenNotToUse: [
      {
        option: 'A',
        conditions: [
          'When legacy documentation mandates NAS class and direct equivalence is not established',
          'Comparing to pre-1999 ACFTD-based data — the calibration bases are different',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Any new system or equipment specification — NAS 1638 is superseded',
          'When modern ISO 11171-calibrated APC data will be used — results are not comparable to original ACFTD-based NAS classes',
          'International procurement where ISO compliance is mandated',
        ],
      },
    ],

    relatedStandards:    ['iso-4406', 'iso-16889', 'iso-11171'],
    relatedTechnologies: ['NANOFORCE', 'SYNTRAX'],
    relatedSystems:      ['hydraulic', 'lube-oil'],
    relatedTerms:        ['cleanliness-code', 'particle-counting', 'iso-4406', 'beta-ratio'],
    relatedArticles:     ['fluid-cleanliness', 'testing-and-validation', 'contamination-control'],

    revisionHistory: [
      { version: '1.0', date: '2026-07-09', changes: 'Initial entry — Phase 6C Engineering Comparison Engine' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────

  {
    id:       COMPARISON_IDS['iso5011-vs-sae-j726'],
    slug:     'iso5011-vs-sae-j726',
    title:    'ISO 5011 vs. SAE J726 Air Filter Test Standards',
    subtitle: 'International vs. North American test codes for engine air intake filter element performance',
    category: 'standards',

    engineeringObjective:
      'Identify which air filter test standard applies to a filter element specification or performance claim, and understand what performance metrics each standard produces.',
    comparisonScope:
      'Covers ISO 5011:2020 and SAE J726 (current revision) for internal combustion engine air intake filter elements. Does not cover cabin air filter standards (ISO 11155, ISO 29463) or compressed air filter standards (ISO 8573).',
    governingStandards: ['ISO 5011:2020', 'SAE J726', 'ISO 5125:2020'],

    optionA: {
      id:          'A',
      label:       'ISO 5011:2020',
      description: 'The internationally harmonised test standard for air intake filter elements used in internal combustion engines, compressors, and similar applications. ISO 5011 specifies the test dust (ISO 12103-1 A2 fine test dust), test rig geometry, airflow conditions, and reporting requirements. Key outputs: initial restriction (kPa), final restriction at terminal ΔP, gravimetric efficiency (%), and dust holding capacity (g). Used globally by European OEMs and increasingly adopted for all international procurement.',
      advantages: [
        'Global harmonisation — single test protocol accepted by European, Asian, and South American OEM specifications',
        'ISO 12103-1 A2 fine test dust is precisely characterised with controlled particle size distribution — results are reproducible across test laboratories',
        'Dust holding capacity (DHC) in grams is the primary output for service interval calculations per ISO 3724',
        'Gravimetric efficiency (%) and collection efficiency at specific particle sizes are both measured — richer performance picture than SAE J726',
        'Active standard (ISO 5011:2020) — regularly updated to align with modern engine intake system geometries',
      ],
      limitations: [
        'A2 fine test dust is finer than some real-world dusts — results may not correlate directly with coarser field contaminants (mining, construction)',
        'Test laboratory setup requirements are more prescriptive — legacy test rigs calibrated for SAE J726 may require modification',
        'Older filter element data sheets may not carry ISO 5011 ratings — historical data comparison requires knowing which standard was used',
      ],
      typicalApplications: [
        'European OEM (DAF, MAN, Mercedes-Benz, Volvo, Scania) engine air filter specifications',
        'Asian market specifications (Isuzu, Hino, Kubota)',
        'International procurement where single global standard is required',
        'Service interval engineering calculations per ISO 3724',
      ],
    },

    optionB: {
      id:          'B',
      label:       'SAE J726',
      description: 'The Society of Automotive Engineers test code for air cleaner element performance, primarily used in North American engine and vehicle specifications. SAE J726 defines test procedures using AC coarse test dust (or equivalent), measuring restriction, efficiency, and capacity. Historically the dominant standard for North American OEM specifications (John Deere, Caterpillar, Cummins, Navistar). SAE J726 results are expressed as arrestance (%) for gravimetric efficiency and restriction (in. H₂O or kPa) for pressure drop.',
      advantages: [
        'Deeply embedded in North American OEM documentation — Caterpillar, John Deere, Cummins, and Navistar specifications reference SAE J726',
        'AC coarse test dust more closely matches coarser field contaminants in agricultural and construction environments than ISO A2 fine',
        'Long data history — extensive existing fleet data and comparison baselines exist using SAE J726 methodology',
        'Well understood by North American filter manufacturers and test laboratories',
      ],
      limitations: [
        'AC coarse test dust is not as precisely characterised as ISO 12103-1 A2 — batch-to-batch variation affects inter-laboratory reproducibility',
        'Arrestance (%) is less precise than ISO 5011 collection efficiency at specific particle sizes for engineering design',
        'Not aligned with international harmonisation — creates dual-spec burden for global OEMs and suppliers',
        'SAE J726 dust holding capacity values are not directly comparable to ISO 5011 DHC — different test dust and conditions',
      ],
      typicalApplications: [
        'North American agricultural OEM specifications (John Deere, AGCO, CNH)',
        'North American construction equipment (Caterpillar, Komatsu NA, Terex)',
        'Cummins and other North American engine builder specifications',
        'Retrofit and aftermarket filter selection where original OEM tested to SAE J726',
      ],
    },

    matrix: [
      { dimension: 'Test dust',               optionA: 'ISO 12103-1 A2 fine (precisely characterised)',     optionB: 'AC fine/coarse (variable batch-to-batch)' },
      { dimension: 'Efficiency metric',        optionA: 'Gravimetric efficiency % + particle size efficiency', optionB: 'Arrestance % (gravimetric only)' },
      { dimension: 'Capacity metric',          optionA: 'DHC in grams — ISO 3724 service interval input',    optionB: 'Dust capacity in grams (not directly ISO 3724 compatible)' },
      { dimension: 'Restriction metric',       optionA: 'kPa at stated flow rate',                           optionB: 'in. H₂O or kPa — dual unit legacy' },
      { dimension: 'Geographic adoption',      optionA: 'Europe, Asia, international procurement',           optionB: 'North America — OEM legacy specifications' },
      { dimension: 'Harmonisation status',     optionA: 'Active ISO standard (2020 revision)',               optionB: 'SAE document — no formal ISO alignment' },
      { dimension: 'Reproducibility',          optionA: 'High — A2 dust tightly specified',                  optionB: 'Moderate — AC dust particle size varies by lot' },
    ],

    engineeringImplications: [
      'ISO 5011 DHC values and SAE J726 dust capacity values are not directly interchangeable for ISO 3724 service interval calculations — always establish which test standard was used.',
      'When specifying filter performance for international supply chains, ISO 5011 is the required reference — SAE J726 creates parallel testing burden without global recognition.',
      'Efficiency values from ISO 5011 (using A2 fine dust) will typically appear lower than SAE J726 arrestance (using AC coarse dust) for the same filter element — the finer test dust penetrates more easily.',
      'For North American replacement decisions, verify which test standard the original OEM used before comparing replacement filter DHC or efficiency ratings.',
    ],

    whenToUse: [
      {
        option: 'A',
        conditions: [
          'All new international filter element specifications',
          'Service interval engineering calculations requiring ISO 3724 DHC inputs',
          'European or Asian OEM compliance',
          'When inter-laboratory reproducibility is critical for global procurement',
        ],
      },
      {
        option: 'B',
        conditions: [
          'North American OEM specifications (Caterpillar, John Deere, Cummins) that explicitly require SAE J726 test data',
          'Matching replacement filter performance against existing SAE J726 baseline data for North American equipment fleet',
          'Retrofit decisions for legacy North American equipment where OEM specifies SAE J726 DHC thresholds',
        ],
      },
    ],

    whenNotToUse: [
      {
        option: 'A',
        conditions: [
          'When the OEM explicitly requires SAE J726 data for warranty compliance and no ISO 5011 correlation data exists',
        ],
      },
      {
        option: 'B',
        conditions: [
          'New equipment specifications or international procurement',
          'ISO 3724 service interval engineering — SAE J726 DHC is not a direct ISO 3724 input',
          'Any context requiring inter-laboratory reproducibility across EU/US/Asia test houses',
        ],
      },
    ],

    relatedStandards:    ['iso-5011', 'sae-j726', 'iso-3724'],
    relatedTechnologies: ['MACROCORE'],
    relatedSystems:      ['air-intake'],
    relatedTerms:        ['dust-holding-capacity', 'filtration-efficiency', 'differential-pressure'],
    relatedArticles:     ['dust-holding-capacity', 'service-intervals', 'testing-and-validation'],

    revisionHistory: [
      { version: '1.0', date: '2026-07-09', changes: 'Initial entry — Phase 6C Engineering Comparison Engine' },
    ],
  },

  // ── TECHNOLOGY COMPARISONS ─────────────────────────────────────────────────

  {
    id:       COMPARISON_IDS['cellulose-vs-synthetic-media'],
    slug:     'cellulose-vs-synthetic-media',
    title:    'Cellulose vs. Synthetic Filter Media',
    subtitle: 'Primary filter media substrate selection — performance, capacity, and service interval trade-offs',
    category: 'technology',

    engineeringObjective:
      'Select the correct filter media substrate for a given application based on required filtration efficiency, service interval targets, operating fluid compatibility, and total cost of ownership.',
    comparisonScope:
      'Covers cellulose (wood-pulp fibre) and synthetic (polyester, polypropylene, or glass-fibre blend) filter media substrates. Does not cover membrane or surface-filtration media, or composite cellulose/synthetic blends.',
    governingStandards: ['ISO 16889:2022', 'ISO 11171:2010', 'ISO 5011:2020', 'ISO 3724:2007'],

    optionA: {
      id:          'A',
      label:       'Cellulose Media',
      description: 'Filter media produced from wood-pulp fibres with a random fibre arrangement creating a tortuous depth-filtration path. Cellulose fibres are hydrophilic and swell when exposed to water-contaminated fluids. Typical graded density construction uses coarser outer layers with progressively finer inner layers. Dirt holding capacity (DHC) is typically 50–150 g/m² depending on basis weight and treatment. Beta efficiency at 10 µm(c) ranges from β₁₀(c) = 75 to β₁₀(c) = 200 for standard grades.',
      advantages: [
        'Lower unit cost — cellulose media costs 30–60% less per square metre than synthetic equivalents',
        'Established manufacturing base — consistent quality from multiple global suppliers',
        'Adequate performance for applications with moderate contamination ingress and standard service intervals',
        'Biodegradable substrate reduces disposal impact in jurisdictions with media-specific waste regulations',
        'High wet tensile resin treatments available for moderate water exposure applications',
      ],
      limitations: [
        'Hydrophilic fibres absorb water, swell, and reduce flow cross-section — efficiency and capacity degrade in water-contaminated systems',
        'Lower DHC than synthetic grades (50–150 g/m² vs 100–300 g/m²) — shorter service intervals for same media area',
        'Beta efficiency ceiling: standard cellulose rarely achieves β₁₀(c) > 200 without chemical impregnation',
        'Higher fibre shedding risk than glass-fibre or synthetic media at service end-of-life',
        'Temperature limit approximately 100–120°C continuous — unsuitable for high-temperature lube oil circuits without heat-stabilised treatment',
        'Media collapse risk under sustained high differential pressure — burst strength lower than synthetic alternatives',
      ],
      typicalApplications: [
        'Standard-interval lube oil and fuel filters in light-duty and medium-duty applications',
        'Air intake pre-filters where primary contamination is coarse particulate',
        'Low-criticality hydraulic return-line filtration',
        'Cost-sensitive applications where fluid cleanliness target is ISO 18/16/13 or coarser',
        'Fleet applications where filter change interval matches cellulose DHC capacity',
      ],
    },

    optionB: {
      id:          'B',
      label:       'Synthetic Media',
      description: 'Filter media produced from engineered polymeric fibres (polyester, polypropylene, or glass-fibre) or blends, with controlled fibre diameter, surface treatment, and layering to achieve defined efficiency, capacity, and chemical resistance. Synthetic media fibres are hydrophobic, dimensionally stable in water exposure, and can be produced with very consistent pore geometry. DHC is typically 100–300 g/m² (polyester/polypropylene) or 150–400 g/m² (glass-fibre). Beta efficiency ranges from β₁₀(c) = 200 to β₁₀(c) > 1000 depending on grade.',
      advantages: [
        'Higher DHC per unit area (1.5–3× cellulose) enables longer service intervals or smaller filter envelope for equivalent capacity',
        'Hydrophobic surface treatment repels water — efficiency and capacity are stable in water-contaminated operating environments',
        'Consistent fibre geometry enables high and reproducible Beta efficiency — β₁₀(c) ≥ 200 achievable as standard; β₂(c) ≥ 200 achievable with glass-fibre grades',
        'Superior high-temperature performance — glass-fibre synthetic stable to 150°C+',
        'Higher burst strength and collapse resistance — media integrity maintained to higher terminal ΔP',
        'Lower fibre shedding — cleaner fluid side at end of service life',
        'Enables extended service intervals (1.5–2.5× cellulose for same DHC) — directly reduces TCO when filter change labour cost is significant',
      ],
      limitations: [
        'Higher media cost (40–100% premium over cellulose) increases element manufacturing cost',
        'Glass-fibre media requires careful disposal — classified as man-made mineral fibre waste in some jurisdictions',
        'Certain synthetic media grades require resin binders that may not be compatible with all hydraulic fluids or fuel types — compatibility verification required',
        'Higher capital cost per element may not be offset by extended interval in low-labour-cost contexts with short vehicle life cycles',
      ],
      typicalApplications: [
        'Extended-interval lube oil filtration for engines with oil analysis programmes',
        'Hydraulic systems requiring ISO 17/15/12 or tighter cleanliness codes',
        'High-pressure common rail (HPCR) fuel system filtration where water contamination is a risk',
        'Cabin air filtration (HEPA grades)',
        'Applications with high contamination ingress rates where DHC is a system constraint',
        'Systems where filter envelope size is constrained and maximum DHC per volume is required',
      ],
    },

    matrix: [
      { dimension: 'Fibre type',               optionA: 'Wood-pulp (cellulose) — natural',                  optionB: 'Polyester / polypropylene / glass-fibre — engineered' },
      { dimension: 'Dirt holding capacity',    optionA: '50–150 g/m²',                                      optionB: '100–400 g/m² (grade dependent)' },
      { dimension: 'Typical Beta at 10 µm(c)', optionA: 'β₁₀(c) = 75–200',                                  optionB: 'β₁₀(c) = 200–1000+' },
      { dimension: 'Water resistance',         optionA: 'Poor — fibres swell, efficiency drops',             optionB: 'Good — hydrophobic, dimensionally stable' },
      { dimension: 'Temperature limit',        optionA: '~100–120°C continuous',                             optionB: '130–200°C+ (glass-fibre grades)' },
      { dimension: 'Service interval',         optionA: 'Standard — baseline reference',                      optionB: '1.5–2.5× cellulose for equivalent DHC' },
      { dimension: 'Media cost per m²',        optionA: 'Lower (reference)',                                  optionB: '40–100% premium over cellulose' },
      { dimension: 'Burst/collapse strength',  optionA: 'Moderate — lower pressure limit',                    optionB: 'Higher — greater structural integrity' },
      { dimension: 'Disposal classification',  optionA: 'Biodegradable substrate',                           optionB: 'Glass-fibre: MMMF waste classification in some jurisdictions' },
    ],

    engineeringImplications: [
      'In water-contaminated operating environments (agriculture, marine, construction with rain ingress), synthetic media maintains performance where cellulose degrades — the additional media cost is justified by consistent protection.',
      'For HPCR fuel systems with injector clearance tolerances of <1 µm, only synthetic or glass-fibre media with certified β₄(c) or finer ratings can reliably protect injection equipment.',
      'TCO analysis must include filter change labour and downtime cost — in high-labour-cost fleets, extended synthetic media intervals reduce total cost even with a higher per-element price.',
      'Mixing cellulose and synthetic elements in the same filtration circuit risks creating differential restriction and pressure imbalance — specify consistently within a system.',
    ],

    whenToUse: [
      {
        option: 'A',
        conditions: [
          'Cost-sensitive applications where fluid cleanliness target is ISO 18/16/13 or coarser and water contamination risk is low',
          'Short-interval, high-frequency filter change programmes where DHC is not the service constraint',
          'Applications where element disposal regulations favour biodegradable media',
          'Light-duty engine oil filtration meeting manufacturer service intervals without extended oil drain',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Hydraulic systems requiring ISO 17/15/12 or tighter — cellulose Beta efficiency is insufficient',
          'HPCR fuel systems — water rejection and fine efficiency are essential',
          'Extended service intervals driven by oil analysis or remote operation (mining, forestry)',
          'High-temperature lube oil circuits (>110°C)',
          'Any application where water ingress is a documented or probable risk',
        ],
      },
    ],

    whenNotToUse: [
      {
        option: 'A',
        conditions: [
          'Hydraulic systems with proportional or servo valves — ISO 17/15/12 target requires Beta efficiency beyond cellulose range',
          'HPCR fuel injection systems — water contamination risk is unacceptable with hygroscopic cellulose',
          'High-contamination environments with extended drain intervals — DHC will be exhausted early',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Budget-driven replacement programmes where the incremental cost premium cannot be justified by operating context',
          'Very short service interval applications (≤250 hours) where cellulose DHC is not the limiting factor',
        ],
      },
    ],

    relatedStandards:    ['iso-16889', 'iso-5011', 'iso-3724'],
    relatedTechnologies: ['SYNTRAX', 'NANOFORCE', 'SYNTAPORE', 'MACROCORE'],
    relatedSystems:      ['hydraulic', 'lube-oil', 'fuel', 'air-intake'],
    relatedTerms:        ['dust-holding-capacity', 'filtration-efficiency', 'beta-ratio', 'depth-filtration'],
    relatedArticles:     ['filter-media-science', 'filter-media-engineering', 'service-intervals', 'total-cost-of-ownership'],

    revisionHistory: [
      { version: '1.0', date: '2026-07-09', changes: 'Initial entry — Phase 6C Engineering Comparison Engine' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────

  {
    id:       COMPARISON_IDS['surface-vs-depth-filtration'],
    slug:     'surface-vs-depth-filtration',
    title:    'Surface Filtration vs. Depth Filtration',
    subtitle: 'Two fundamental particle capture mechanisms — where and how particles are retained in filter media',
    category: 'technology',

    engineeringObjective:
      'Understand the physical mechanism by which each filtration type captures particles, and select the appropriate mechanism for a given application based on particle size, fluid flow, pressure drop behaviour, and backwash requirements.',
    comparisonScope:
      'Covers surface filtration (particle capture on media surface) and depth filtration (particle capture within media volume). Does not cover electrostatic precipitation, centrifugal separation, or coalescing.',
    governingStandards: ['ISO 16889:2022', 'ISO 11171:2010', 'ISO 11125:2018'],

    optionA: {
      id:          'A',
      label:       'Surface Filtration',
      description: 'Particles are captured at or on the upstream face of the filter media, primarily by a sieving mechanism where particles larger than the media pore size cannot pass. Common implementations include woven wire mesh, sintered metal, ceramic membranes, and pleated PTFE membranes. The filter cake that builds on the surface over time increases filtration efficiency progressively but also increases differential pressure. Surface filtration elements are typically cleanable or backwashable because particle loading is concentrated at the accessible surface.',
      advantages: [
        'Absolute filtration rating: particles above the rated pore size are captured with near-100% certainty — especially valuable for woven wire or sintered metal',
        'Cleanable/backwashable — surface cake can be removed by backflushing, pulsing, or mechanical cleaning, enabling reuse',
        'Predictable pressure drop behaviour — ΔP increases monotonically as cake builds; well-defined terminal condition',
        'Effective for high particle loads where cake formation is manageable and cleaning cycles are feasible',
        'Low media volume — compact element design possible when surface area is the primary variable',
      ],
      limitations: [
        'Single-layer sieving — particles at or below the pore size pass through unimpeded; no depth protection for sub-pore particles',
        'Limited dirt holding capacity for very fine particles — cake blinding occurs rapidly for sub-micron contaminants',
        'Cake re-entrainment risk during flow surges — captured particles may release and migrate downstream under sudden ΔP change',
        'Media pore size specification requires tight manufacturing tolerance — a single defect or pinhole creates a bypass path at that point',
        'Not suitable for compressible contamination (sludge, gel) that can extrude through the surface under pressure',
      ],
      typicalApplications: [
        'Hydraulic system strainers (coarse protection, cleanable wire mesh, 100–500 µm)',
        'High-flow return-line filters with backwash capability in industrial hydraulic systems',
        'Fuel pre-strainers upstream of primary filtration elements',
        'Process filtration where filter cleaning cycles are economically viable',
        'Applications requiring absolute particle size exclusion above a defined threshold',
      ],
    },

    optionB: {
      id:          'B',
      label:       'Depth Filtration',
      description: 'Particles are captured within the three-dimensional volume of the filter media by a combination of mechanisms: inertial impaction, direct interception, diffusion (Brownian motion for sub-micron particles), and electrostatic attraction. Fibrous and granular media (cellulose, synthetic fibre, glass-fibre, activated carbon) operate by depth filtration. A progressive-density gradient — coarser fibre density at the upstream face, finer at the downstream — distributes particle loading through the media depth, maximising dirt holding capacity per unit volume.',
      advantages: [
        'High dirt holding capacity — particle loading distributed through media depth rather than concentrated at the surface',
        'Progressive density gradient captures particles across a range of sizes in different media zones — more particles captured per unit volume',
        'Effective for sub-micron particles via diffusion and electrostatic mechanisms — surface filtration cannot capture these',
        'Beta ratio efficiency (ISO 16889) is the characteristic metric — enables precise specification and comparison',
        'Lower initial pressure drop than equivalent surface filtration for the same flow rate and efficiency',
        'More tolerant of variable contamination particle size distribution — captures both large and small particles effectively',
      ],
      limitations: [
        'Not cleanable — once depth media is loaded, captured particles are distributed through the media and cannot be removed by backwash',
        'Efficiency can vary with flow rate — at very high velocities, inertial capture is enhanced but diffusion-dominated sub-micron capture may decrease',
        'Media migration risk at high differential pressure — fibres or captured particles can shed from the downstream face if media integrity is compromised',
        'Pressure drop behaviour is non-linear — terminal ΔP can rise sharply once primary capacity is exhausted',
        'Single-use — element must be replaced at end of service life',
      ],
      typicalApplications: [
        'Primary hydraulic filter elements (ISO 16889 rated, β₁₀(c) ≥ 200)',
        'Lube oil filter elements in engine circuits',
        'Fuel filtration elements for HPCR diesel systems',
        'Air intake filter elements (ISO 5011)',
        'Cabin air filtration (ISO 29463, HEPA grades)',
        'All applications requiring Beta ratio efficiency specification',
      ],
    },

    matrix: [
      { dimension: 'Capture mechanism',        optionA: 'Sieving at media surface (pore exclusion)',         optionB: 'Impaction, interception, diffusion within media volume' },
      { dimension: 'Particle retention location', optionA: 'Upstream face (accessible surface)',             optionB: 'Throughout media depth (inaccessible after capture)' },
      { dimension: 'Sub-micron capability',    optionA: 'Limited — dependent on pore size only',             optionB: 'Yes — diffusion captures sub-micron via Brownian motion' },
      { dimension: 'Dirt holding capacity',    optionA: 'Limited to surface cake before blinding',           optionB: 'High — distributed through media volume' },
      { dimension: 'Cleanability',             optionA: 'Cleanable / backwashable',                          optionB: 'Single-use — not cleanable' },
      { dimension: 'Efficiency rating method', optionA: 'Absolute pore size (µm); no ISO 16889 Beta rating', optionB: 'ISO 16889 Beta ratio β_x(c) — standard rating method' },
      { dimension: 'ΔP behaviour',             optionA: 'Monotonically increasing with cake build-up',       optionB: 'Gradual rise; sharp increase at terminal load' },
      { dimension: 'Re-entrainment risk',      optionA: 'Higher — surface cake can release under surge',     optionB: 'Lower — particles captured within media matrix' },
    ],

    engineeringImplications: [
      'Depth filtration is the mechanism for all ISO 16889-rated filter elements — surface filtration strainers are pre-filtration and protection devices, not primary contamination control elements.',
      'Surface filtration provides absolute particle size exclusion above pore size but cannot contribute to ISO 4406 cleanliness code improvement below the mesh aperture — depth filtration must follow.',
      'In high-contamination environments, a surface strainer upstream of a depth element extends depth element service life by removing the bulk coarse load before the depth media is engaged.',
      'Never specify a cleanable wire mesh as the sole filtration stage for a system requiring ISO cleanliness codes — sub-pore particles will pass through unimpeded.',
    ],

    whenToUse: [
      {
        option: 'A',
        conditions: [
          'Coarse pre-filtration upstream of primary depth elements — protecting elements from catastrophic particle load',
          'Applications requiring cleanable elements due to remote location or difficult element access',
          'High-flow straining applications where only coarse particle exclusion (>100 µm) is needed',
          'Backwash-capable systems in industrial filtration where continuous operation with cleaning is required',
        ],
      },
      {
        option: 'B',
        conditions: [
          'All primary hydraulic, lube oil, fuel, and air intake filtration requiring ISO cleanliness codes or Beta ratio efficiency specification',
          'Any application requiring sub-micron particle capture',
          'High DHC applications requiring extended service intervals',
          'All applications where ISO 16889, ISO 5011, or equivalent standard performance testing is required',
        ],
      },
    ],

    whenNotToUse: [
      {
        option: 'A',
        conditions: [
          'As the sole filtration stage where ISO 4406 cleanliness codes must be met',
          'Applications requiring sub-micron particle capture',
          'Where re-entrainment risk from flow surge is unacceptable (servo valve circuits)',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Applications requiring element re-use via cleaning or backwashing',
          'Coarse pre-straining where surface mesh is more appropriate and cost-effective',
        ],
      },
    ],

    relatedStandards:    ['iso-16889', 'iso-11171'],
    relatedTechnologies: ['NANOFORCE', 'SYNTRAX', 'MACROCORE', 'SYNTAPORE'],
    relatedSystems:      ['hydraulic', 'lube-oil', 'fuel', 'air-intake'],
    relatedTerms:        ['depth-filtration', 'surface-filtration', 'beta-ratio', 'dirt-holding-capacity', 'differential-pressure'],
    relatedArticles:     ['filter-media-science', 'filter-media-engineering', 'fluid-cleanliness'],

    revisionHistory: [
      { version: '1.0', date: '2026-07-09', changes: 'Initial entry — Phase 6C Engineering Comparison Engine' },
    ],
  },

  // ── SYSTEM COMPARISONS ─────────────────────────────────────────────────────

  {
    id:       COMPARISON_IDS['bypass-vs-full-flow-filtration'],
    slug:     'bypass-vs-full-flow-filtration',
    title:    'Bypass vs. Full-Flow (Primary) Filtration',
    subtitle: 'Two oil filtration circuit configurations — primary contamination control vs. polishing and fine filtration',
    category: 'system',

    engineeringObjective:
      'Understand when bypass (partial-flow) filtration supplements full-flow primary filtration, and design the correct combination of circuit topologies for a given lube oil or hydraulic system contamination target.',
    comparisonScope:
      'Covers full-flow (primary, on-line) and bypass (partial-flow) filtration circuit configurations in lube oil and hydraulic systems. Does not cover offline kidney-loop hydraulic filtration (covered in a separate comparison).',
    governingStandards: ['ISO 16889:2022', 'ISO 4406:2021', 'SAE J1811'],

    optionA: {
      id:          'A',
      label:       'Full-Flow Filtration',
      description: 'All fluid flow from the pump passes through the filter element before reaching critical system components. The filter element must pass the full system flow rate at acceptable differential pressure. Full-flow elements must therefore balance efficiency with sufficient flow capacity — very high efficiency (very fine) elements can create unacceptably high ΔP at full flow. A bypass valve is incorporated to open when ΔP reaches the bypass setting (typically 3–6 bar), protecting the system from oil starvation if the element becomes blocked. This bypass opening allows unfiltered fluid to pass to components.',
      advantages: [
        'All fluid is filtered on every circuit pass — maximum protection for system components',
        'Ensures contaminants generated during engine start-up or transient events are captured before reaching bearings or valves',
        'Standard configuration in all automotive and commercial engine lube oil circuits — well-understood maintenance procedures',
        'Single-element replacement at defined service interval — simple maintenance protocol',
      ],
      limitations: [
        'Full-flow requirement forces compromise on efficiency — coarser elements (β₁₀(c) ≥ 75 rather than ≥ 200) are often used to maintain acceptable restriction at rated flow',
        'Bypass valve opening (at high ΔP or blockage) allows unfiltered fluid to reach components — contamination control is compromised at the moment protection is most needed',
        'Large dirt load after extended sump/reservoir life accumulates fine particles below the full-flow element effective capture range',
        'Element service interval is driven by restriction (ΔP) — a lightly-loaded system may change elements before DHC is exhausted; a heavily-loaded system may exceed capacity',
      ],
      typicalApplications: [
        'All automotive and commercial engine crankcase lube oil circuits',
        'Primary hydraulic circuit return-line or pressure-line filtration',
        'Transmission fluid circuits',
        'Any circuit where all fluid must be conditioned before reaching critical components',
      ],
    },

    optionB: {
      id:          'B',
      label:       'Bypass (Partial-Flow) Filtration',
      description: 'A fraction of the system flow (typically 5–15%) is diverted through a high-efficiency, fine filtration element in parallel with the main full-flow circuit. The bypass element sees only a fraction of system flow, so it can operate at very high efficiency (very fine media, β₂(c) ≥ 200 or higher) without creating excessive restriction to main oil flow. Over time, the bypass element progressively removes sub-micron particles, water, and oxidation products that the full-flow element cannot capture. Bypass filtration is additive to full-flow — it is not a replacement.',
      advantages: [
        'Very high filtration efficiency possible (β₂(c), β₅(c)) because low flow rate enables fine media without unacceptable restriction',
        'Captures sub-micron particles, water, soot, and fuel dilution products that are below full-flow element capture size',
        'Extends fluid life by continuously removing degradation by-products — oil analysis programmes often show extended oil drain intervals with bypass filtration',
        'Does not affect main system flow — operates in parallel without risk of flow starvation',
        'Dirt holding capacity is not the limiting factor — the fine element is changed based on time/oil analysis rather than restriction',
      ],
      limitations: [
        'Processes only 5–15% of total flow per circuit pass — provides progressive polishing rather than immediate total-circuit protection',
        'Does not eliminate full-flow primary filtration — bypass is supplementary, not a substitute',
        'Additional element, mounting, and plumbing cost beyond primary filtration',
        'Fine media element has lower DHC than primary element — may require more frequent replacement if bypass flow is high',
        'Not effective for capturing large particles from catastrophic contamination events — full-flow element is the primary barrier',
      ],
      typicalApplications: [
        'Extended oil drain interval programmes (heavy-duty truck and off-highway engines)',
        'Fleet operations with oil analysis programmes targeting reduced fluid consumption',
        'Industrial hydraulic systems requiring ISO 16/14/11 or tighter cleanliness codes alongside primary filtration',
        'High-value equipment (mining, power generation) where fluid life extension justifies additional filtration cost',
        'Engines operating in high-soot environments where full-flow element becomes saturated rapidly',
      ],
    },

    matrix: [
      { dimension: 'Flow fraction processed',  optionA: '100% of system flow',                              optionB: '5–15% of system flow (partial diversion)' },
      { dimension: 'Typical Beta efficiency',  optionA: 'β₁₀(c) = 75–200 (flow rate constraint)',          optionB: 'β₂(c)–β₅(c) ≥ 200 (low flow enables fine media)' },
      { dimension: 'Role in circuit',          optionA: 'Primary — must protect on every circuit pass',     optionB: 'Supplementary polishing — not a substitute for primary' },
      { dimension: 'Sub-micron capture',       optionA: 'Limited by full-flow efficiency compromise',       optionB: 'Yes — fine media at low flow captures sub-micron particles' },
      { dimension: 'Bypass valve',             optionA: 'Present — opens at ΔP threshold (3–6 bar)',       optionB: 'Not required — low flow creates negligible ΔP' },
      { dimension: 'Oil life extension',       optionA: 'Standard drain intervals',                         optionB: '25–100% extended drain intervals documented in field studies' },
      { dimension: 'Maintenance complexity',   optionA: 'Single element change at ΔP or interval',         optionB: 'Additional element in parallel — two elements to manage' },
    ],

    engineeringImplications: [
      'Bypass filtration does not replace full-flow filtration — a system with bypass only would allow all generated contamination from start-up transients to reach components unfiltered.',
      'The combination of full-flow (β₁₀(c) ≥ 200) plus bypass (β₂(c) ≥ 200) achieves the best possible contamination control within practical pressure drop constraints.',
      'Oil analysis data from bypass-filtered fleets consistently shows lower Fe, Cu, and Al wear metal concentrations versus full-flow only — indicating the fine polishing step reduces abrasive wear.',
      'For systems with a bypass valve that opens frequently, the bypass valve itself is an indicator of a service problem — element should be changed, not allowed to bypass in normal operation.',
    ],

    whenToUse: [
      {
        option: 'A',
        conditions: [
          'All lube oil and hydraulic systems as the mandatory primary filtration circuit',
          'Applications where all fluid must be conditioned before reaching critical components on every pass',
          'Standard-interval maintenance programmes',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Heavy-duty fleets targeting extended oil drain intervals with oil analysis validation',
          'High-value equipment where fluid life extension ROI justifies additional element cost',
          'Systems where full-flow primary filter alone cannot achieve target ISO cleanliness codes due to high-efficiency constraint',
          'High-soot diesel applications (EGR engines) where soot loading saturates full-flow elements rapidly',
        ],
      },
    ],

    whenNotToUse: [
      {
        option: 'A',
        conditions: [
          'Never omit — full-flow filtration is mandatory in all lube oil and hydraulic circuits',
        ],
      },
      {
        option: 'B',
        conditions: [
          'As a substitute for full-flow primary filtration',
          'Short-life or disposable equipment where additional element cost outweighs operational benefit',
          'Systems with very clean operating environments and already achieving target cleanliness codes with primary filtration alone',
        ],
      },
    ],

    relatedStandards:    ['iso-16889', 'iso-4406'],
    relatedTechnologies: ['SYNTRAX', 'NANOFORCE'],
    relatedSystems:      ['lube-oil', 'hydraulic'],
    relatedTerms:        ['bypass-valve', 'filtration-efficiency', 'dirt-holding-capacity', 'differential-pressure'],
    relatedArticles:     ['service-intervals', 'total-cost-of-ownership', 'fluid-cleanliness', 'contamination-control'],

    revisionHistory: [
      { version: '1.0', date: '2026-07-09', changes: 'Initial entry — Phase 6C Engineering Comparison Engine' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────

  {
    id:       COMPARISON_IDS['single-stage-vs-multi-stage-fuel'],
    slug:     'single-stage-vs-multi-stage-fuel',
    title:    'Single-Stage vs. Multi-Stage Fuel Filtration',
    subtitle: 'Fuel filtration architecture for high-pressure common rail diesel systems — ISO 16332 context',
    category: 'system',

    engineeringObjective:
      'Select the correct number of filtration stages for a diesel fuel system to achieve the required injector protection cleanliness level while managing water separation, flow restriction, and service interval requirements.',
    comparisonScope:
      'Covers single-stage and multi-stage (typically 2–3 stage) fuel filtration systems for HPCR diesel engines. Does not cover gasoline GDI fuel filtration or biofuel-specific considerations.',
    governingStandards: ['ISO 16332:2008', 'ASTM D6304', 'ISO 12937:2000', 'ISO 16889:2022'],

    optionA: {
      id:          'A',
      label:       'Single-Stage Fuel Filtration',
      description: 'A single filter element provides all particle and water separation functions in the fuel circuit between the tank and the high-pressure pump. The single element combines coarse particle pre-filtration, fine particle removal, and water coalescing in one housing. Common in older diesel engine designs and smaller engines. A single-stage element rated at β₄(c) ≥ 200 or finer is required to protect modern HPCR injection systems with clearances of 1–3 µm.',
      advantages: [
        'Lower system cost — single housing, single element, single service point',
        'Compact installation — suitable for space-constrained engine bays',
        'Simpler maintenance — one element change covers all fuel filtration functions',
        'Adequate for older engines with mechanical injection systems and less stringent fuel cleanliness requirements',
      ],
      limitations: [
        'Combined function means the element must simultaneously handle high particle load, high water content, and deliver fine efficiency — these demands are difficult to optimise in a single stage',
        'Water saturation of a coalescing element reduces particle filtration efficiency — when the element is water-loaded, fine particle capture degrades',
        'Restriction build-up from particle loading and water retention occurs simultaneously — terminal ΔP is reached faster under mixed contamination',
        'In high-contamination environments (high dust, water ingress), single-stage service intervals are shortened, increasing maintenance frequency',
        'Insufficient for HPCR systems with rail pressures >1600 bar where injector clearances require fuel cleanliness at ISO Class 13/11/8 or finer',
      ],
      typicalApplications: [
        'Older mechanical injection diesel engines (pre-HPCR)',
        'Light-duty diesel passenger vehicles with moderate contamination risk',
        'Stationary generators in clean environments',
        'Non-critical equipment where injection system protection requirements are modest',
      ],
    },

    optionB: {
      id:          'B',
      label:       'Multi-Stage Fuel Filtration (2–3 Stage)',
      description: 'Two or three filter stages in series, each addressing a specific contamination type and particle size range. A typical 3-stage arrangement per ISO 16332: Stage 1 — coarse pre-filter (40–100 µm) to remove gross contamination and protect Stage 2; Stage 2 — coalescing water separator (removes free water, >95% efficiency per ISO 16332); Stage 3 — fine final filter (β₄(c) or β₂(c) ≥ 200) immediately upstream of the high-pressure pump. Each stage operates within its optimised function, maintaining efficiency and capacity independently.',
      advantages: [
        'Each stage is optimised for its specific function — coarse removal, water separation, and fine filtration do not compete for element capacity',
        'Water is removed before the fine stage — fine element efficiency is not degraded by water loading, maintaining injector protection integrity',
        'Significantly longer service intervals for the fine stage — coarse and water stages absorb the bulk contamination load',
        'System can indicate individual stage status (ΔP or water-in-fuel sensors per stage) — maintenance is targeted rather than preventive-interval-only',
        'Required for HPCR systems at rail pressures >1600 bar — ISO 16332 3-stage is the OEM-mandated architecture for Bosch CRS, Delphi DFI, Denso HP3/HP4 systems',
        'Scalable to fleet or stationary applications with high water ingress risk',
      ],
      limitations: [
        'Higher system cost — multiple housings, elements, and service points',
        'More complex installation and plumbing — increased risk of air entrainment at connections',
        'Greater service burden — multiple elements require individual inspection, replacement, and pre-fill procedures',
        'Water drain maintenance for coalescing stage — must be manually drained when water-in-fuel warning activates',
        'Space requirement is greater than single-stage equivalent',
      ],
      typicalApplications: [
        'All modern HPCR diesel engines (Bosch CRS 2.0–4.0, Delphi DFI, Denso HP3/HP4, Siemens Deka)',
        'Agricultural equipment with high field dust and rain water ingress exposure',
        'Heavy-duty trucking with extended fuel tank capacity and infrequent fill events (allowing water accumulation)',
        'Marine diesel applications with high humidity and condensation risk',
        'Mining and construction diesel equipment with extreme operating environments',
      ],
    },

    matrix: [
      { dimension: 'Number of stages',         optionA: '1 element — all functions combined',               optionB: '2–3 elements in series — functions separated' },
      { dimension: 'Fine stage efficiency',     optionA: 'Compromised by water/coarse load competition',    optionB: 'Maintained — water removed before fine stage' },
      { dimension: 'Water separation',          optionA: 'Combined with particle filtration',               optionB: 'Dedicated coalescing stage — >95% per ISO 16332' },
      { dimension: 'HPCR protection (>1600 bar)', optionA: 'Marginal — not recommended for new HPCR',     optionB: 'Required architecture for modern HPCR systems' },
      { dimension: 'Service interval (fine)',   optionA: 'Shortened by mixed load',                         optionB: 'Extended — coarse stages absorb bulk load' },
      { dimension: 'Installation complexity',   optionA: 'Simple — single housing',                         optionB: 'Complex — multiple housings, drain, sensors' },
      { dimension: 'System cost',               optionA: 'Lower capital cost',                              optionB: 'Higher capital; lower TCO through extended fine element life' },
    ],

    engineeringImplications: [
      'For any diesel engine with HPCR injection and rail pressure >1200 bar, single-stage filtration is insufficient for injector protection — multi-stage is the engineering-correct choice.',
      'Water in single-stage elements degrades particle capture efficiency — the element may appear within service interval (ΔP acceptable) but be passing particles that damage injectors because water saturation reduces effective porosity.',
      'The cost of injector replacement ($500–2000 per injector) vastly exceeds the additional cost of multi-stage filtration hardware — TCO analysis always favours multi-stage for HPCR systems.',
      'Water drain maintenance on coalescing stages is a critical maintenance step often overlooked in service protocols — water accumulation in Stage 2 will eventually be pushed to Stage 3 and the HPCR pump.',
    ],

    whenToUse: [
      {
        option: 'A',
        conditions: [
          'Pre-HPCR mechanical injection diesel engines where fine particle protection <10 µm is not required',
          'Stationary applications in low-contamination environments with fresh, dry fuel supply',
          'Light-duty diesel with low mileage and frequent refuelling (minimal tank contamination accumulation)',
        ],
      },
      {
        option: 'B',
        conditions: [
          'All HPCR diesel engines regardless of application — multi-stage is the OEM architecture',
          'Any diesel application with documented water ingress risk (agriculture, marine, construction)',
          'Extended-interval filtration programmes targeting reduced total element change frequency',
          'Fleet operations with fuel quality variation (mixed suppliers, field fuelling from mobile tankers)',
        ],
      },
    ],

    whenNotToUse: [
      {
        option: 'A',
        conditions: [
          'HPCR diesel engines with injection pressures >1200 bar',
          'Applications with known or probable water contamination in fuel',
          'Agricultural, marine, or construction environments with high environmental contamination rates',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Simple low-pressure fuel systems where additional stage cost is not justified by protection requirement',
          'Very space-constrained applications where a single multi-function element is the only feasible installation',
        ],
      },
    ],

    relatedStandards:    ['iso-16332', 'iso-12937', 'astm-d6304'],
    relatedTechnologies: ['SYNTAPORE', 'HYDROCORE'],
    relatedSystems:      ['fuel'],
    relatedTerms:        ['water-contamination', 'filtration-efficiency', 'differential-pressure', 'beta-ratio'],
    relatedArticles:     ['diesel-fuel-filtration', 'hpcr-fuel-system-cleanliness', 'water-contamination-fuel', 'service-intervals'],

    revisionHistory: [
      { version: '1.0', date: '2026-07-09', changes: 'Initial entry — Phase 6C Engineering Comparison Engine' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────

  {
    id:       COMPARISON_IDS['online-vs-offline-hydraulic'],
    slug:     'online-vs-offline-hydraulic',
    title:    'Online vs. Offline (Kidney Loop) Hydraulic Filtration',
    subtitle: 'Two hydraulic circuit filtration topologies — flow-path integration vs. independent polishing circuit',
    category: 'system',

    engineeringObjective:
      'Select the correct hydraulic filtration topology — online (in the main working circuit) or offline (independent kidney loop) — based on cleanliness target, system contamination source, and operational continuity requirements.',
    comparisonScope:
      'Covers online (pressure-line, return-line, and off-line tank) hydraulic filtration and offline kidney-loop filtration in industrial and mobile hydraulic systems. Does not cover pneumatic circuit filtration.',
    governingStandards: ['ISO 16889:2022', 'ISO 4406:2021', 'NFPA T2.14.1', 'ISO 11171:2010'],

    optionA: {
      id:          'A',
      label:       'Online Filtration (In-Circuit)',
      description: 'Filter elements installed within the main hydraulic working circuit — either on the pressure line (high-pressure filtration), the return line (return-line filtration), or the suction line (suction strainer). Return-line filtration is the most common online topology: all returning fluid from actuators and motor case drains passes through the return-line filter before entering the reservoir, capturing both particle contamination generated by system components and any ingressed particulate. Pressure-line filters protect specific valves or circuits at high pressure but are expensive and generate high pressure drop if fine media is used.',
      advantages: [
        'Captures contamination on every circuit pass — fastest response to sudden contamination events (seal failure, actuator wear)',
        'Protects all downstream components on every operating cycle',
        'Standard industry practice — well-understood by maintenance personnel globally',
        'Return-line configuration captures all system-generated contamination before fluid re-enters the reservoir',
        'Integral to system operation — filtration occurs automatically during normal machine operation',
      ],
      limitations: [
        'Operating at system flow rate constrains maximum achievable efficiency — high-efficiency fine media creates unacceptable ΔP at full system flow',
        'Bypass valve (return-line filter) must open to protect system from oil starvation during element blockage — unfiltered fluid then reaches reservoir',
        'System must be stopped for element change — brief interruption to operation',
        'Fine particle accumulation in the reservoir is not addressed — only particles circulating in the working circuit are captured on each pass',
      ],
      typicalApplications: [
        'All hydraulic systems as the primary filtration circuit',
        'Mobile hydraulic systems (excavators, loaders, cranes) where compact, integrated filtration is required',
        'Hydraulic systems with moderate cleanliness targets (ISO 18/16/13 to ISO 17/15/12)',
        'Systems where filtration topology is constrained by OEM design',
      ],
    },

    optionB: {
      id:          'B',
      label:       'Offline Filtration (Kidney Loop)',
      description: 'A separate, independently-powered filtration circuit continuously draws fluid from the hydraulic reservoir, passes it through high-efficiency filter elements, and returns clean fluid to the reservoir. The kidney loop operates at low, constant flow (typically 10–30% of main system flow) with an independent low-pressure pump, enabling very high efficiency fine media (β₂(c) ≥ 200 or finer) without creating ΔP in the main working circuit. Kidney-loop filtration progressively polishes the entire reservoir fluid volume and can operate continuously — including when the main system is idle.',
      advantages: [
        'No ΔP limitation from main system flow — fine media with β₂(c) ≥ 200 or finer is achievable',
        'Operates continuously including during system shutdown — progressively removes particles from reservoir that accumulate below the main circuit filter threshold',
        'Element change can be performed without stopping main system operation — element changed on the kidney loop circuit only',
        'Removes reservoir sediment and the fine particle population that main circuit filtration cannot cost-effectively target',
        'Combined with main-circuit filtration, can achieve ISO 15/13/10 or tighter cleanliness codes that are not achievable with online filtration alone',
        'Effective for commission flushing — kidney loop runs at high velocity before system start-up to remove assembly contamination',
      ],
      limitations: [
        'Supplementary cost — additional pump, motor, housing, plumbing, and element',
        'Does not capture contamination generated during a working cycle before it reaches downstream components — main circuit filtration must still be present',
        'Low flow rate means cleanliness improvement is progressive (hours to days to achieve a major cleanliness code step) — not an emergency response measure',
        'Electric motor/pump requires power supply — impractical for truly mobile applications without continuous electrical availability',
        'Additional maintenance — kidney loop pump and element are separate service items',
      ],
      typicalApplications: [
        'Industrial hydraulic power units requiring ISO 16/14/11 or tighter for proportional and servo valve protection',
        'Hydraulic press systems with precision position control sensitive to valve spool wear',
        'Machine tools where tight cleanliness targets are mandatory',
        'System commissioning flushing before initial start-up',
        'Hydraulic systems recovering from a contamination event (seal failure, actuator damage)',
        'Stationary equipment with continuous electrical supply where fine polishing ROI is justified',
      ],
    },

    matrix: [
      { dimension: 'Flow rate processed',      optionA: 'Full system flow (20–400 L/min typical)',           optionB: 'Low constant flow (10–30% of system, continuous)' },
      { dimension: 'Maximum efficiency',        optionA: 'β₁₀(c) ≥ 200 (ΔP constraint at full flow)',       optionB: 'β₂(c) ≥ 200 or finer (low ΔP at low flow)' },
      { dimension: 'Role',                     optionA: 'Primary — mandatory for all hydraulic systems',     optionB: 'Supplementary polishing — not a substitute for primary' },
      { dimension: 'Contamination response',   optionA: 'Immediate — all fluid filtered each pass',          optionB: 'Progressive — improves reservoir volume over hours' },
      { dimension: 'System downtime for change', optionA: 'Brief stop required (return-line)',              optionB: 'No downtime — kidney loop serviced while main runs' },
      { dimension: 'Achievable cleanliness',   optionA: 'ISO 17/15/12 (practical limit at full flow)',      optionB: 'ISO 15/13/10 or tighter (combined with primary)' },
      { dimension: 'Mobile application',       optionA: 'Standard — integrated into machine design',         optionB: 'Impractical — requires continuous electrical supply' },
      { dimension: 'Capital cost',             optionA: 'Included in system',                                optionB: 'Additional pump, motor, housing, plumbing' },
    ],

    engineeringImplications: [
      'Online filtration alone cannot achieve ISO 16/14/11 or tighter in practice because fine media at full system flow creates prohibitive ΔP — kidney loop is required for servo-valve-class cleanliness targets.',
      'A kidney loop running at 10 L/min can polish the entire 400 L reservoir volume to the required cleanliness level in 8–12 hours of continuous operation — planning is needed for initial system commissioning.',
      'Kidney loops are especially valuable for systems recovering from contamination events — the main-circuit filter captures circulating particles while the kidney loop removes reservoir sedimentation.',
      'For mobile equipment (excavators, loaders), an electric kidney loop is not a practical primary solution — mobile systems must achieve target cleanliness through correct online filter selection and element change intervals.',
    ],

    whenToUse: [
      {
        option: 'A',
        conditions: [
          'All hydraulic systems — online filtration is always required as the primary circuit',
          'Mobile hydraulic applications where a separate power supply for kidney loop is not available',
          'Systems where ISO 17/15/12 or coarser cleanliness targets are achievable with online filtration alone',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Industrial hydraulic systems requiring ISO 16/14/11 or tighter for servo or proportional valve protection',
          'System commissioning flushing before initial start-up',
          'Contamination recovery after internal component failure or seal breach',
          'Any application where zero downtime for filter change is a requirement and the system has continuous electrical power',
        ],
      },
    ],

    whenNotToUse: [
      {
        option: 'A',
        conditions: [
          'Kidney loop does not replace online filtration — A is always present',
        ],
      },
      {
        option: 'B',
        conditions: [
          'As a substitute for online filtration in any circuit',
          'Mobile hydraulic applications without a reliable independent electrical power supply',
          'Systems where the capital cost of kidney loop hardware is not justified by the achieved cleanliness improvement',
        ],
      },
    ],

    relatedStandards:    ['iso-16889', 'iso-4406', 'iso-11171'],
    relatedTechnologies: ['NANOFORCE'],
    relatedSystems:      ['hydraulic'],
    relatedTerms:        ['cleanliness-code', 'differential-pressure', 'bypass-valve', 'filtration-efficiency'],
    relatedArticles:     ['fluid-cleanliness', 'contamination-control', 'total-cost-of-ownership'],

    revisionHistory: [
      { version: '1.0', date: '2026-07-09', changes: 'Initial entry — Phase 6C Engineering Comparison Engine' },
    ],
  },

  // ── TEST-METHOD COMPARISONS ────────────────────────────────────────────────

  {
    id:       COMPARISON_IDS['multipass-vs-single-pass-testing'],
    slug:     'multipass-vs-single-pass-testing',
    title:    'ISO 16889 Multipass vs. Single-Pass Filter Testing',
    subtitle: 'Two protocols for measuring filter element performance — how test method affects the efficiency values reported',
    category: 'test-method',

    engineeringObjective:
      'Understand what each test method measures and why ISO 16889 multipass data cannot be directly compared with historical single-pass data, ensuring correct interpretation of filter element performance specifications.',
    comparisonScope:
      'Covers ISO 16889:2022 (multipass) and single-pass test methods (ISO 4572, withdrawn 2000). Does not cover air filter testing (ISO 5011/SAE J726) or cabin filter testing (ISO 29463).',
    governingStandards: ['ISO 16889:2022', 'ISO 11171:2010', 'ISO 4406:2021'],

    optionA: {
      id:          'A',
      label:       'ISO 16889 Multipass Test',
      description: 'The current international standard test method for hydraulic fluid filter element performance. Fluid circulates continuously through the test circuit, with upstream particle counts measured before the filter and downstream counts measured after. Contamination is continuously injected upstream. The Beta ratio is computed from cumulative upstream vs. downstream particle counts measured by an ISO 11171-calibrated optical particle counter. The test continues until the filter reaches terminal differential pressure. Both filtration efficiency and dirt holding capacity are outputs. The (c) suffix on Beta values (β_x(c)) indicates calibrated ISO 11171 particle counter data.',
      advantages: [
        'Real-world simulation: continuously circulating contaminated fluid reflects actual operating conditions better than single-pass',
        'Both efficiency AND dirt holding capacity measured in one test — complete performance characterisation',
        'Particle counter calibration (ISO 11171:2010) ensures inter-laboratory reproducibility — different test houses produce comparable results',
        'Current mandatory standard for all ISO 16889 compliance claims — required for international procurement',
        'Terminal ΔP data enables service interval and bypass valve setting engineering calculations',
        'Produces β_x(c) values that map directly to ISO 4406 cleanliness code system design calculations',
      ],
      limitations: [
        'More complex test rig — particle injection, continuous circulation, ISO 11171 APC — requires higher capital investment than single-pass',
        'Test duration is longer than single-pass — element must be loaded to terminal ΔP',
        'Beta values from multipass and single-pass methods are numerically different for the same element — legacy comparison is impossible without knowing which method was used',
      ],
      typicalApplications: [
        'All current hydraulic and lube oil filter element performance testing',
        'OEM procurement specifications for new equipment',
        'Research and development of new filter media formulations',
        'ISO 16889 compliance validation for certification claims',
        'Forensic performance verification of elements from field failures',
      ],
    },

    optionB: {
      id:          'B',
      label:       'Single-Pass Test Method (ISO 4572, withdrawn)',
      description: 'Contaminated test fluid is passed once through the filter element; upstream and downstream particle counts are measured. Efficiency is calculated from this single-pass count ratio. ISO 4572 used ACFTD (Air Cleaner Fine Test Dust) and early-generation optical particle counters without the ISO 11171 calibration. ISO 4572 was withdrawn in 2000 and replaced by ISO 16889. Single-pass efficiency values reported before 2000 are numerically different from ISO 16889 multipass values for the same filter media — direct comparison is not valid. Note: some non-filtration single-pass methods exist for specific applications (e.g. membrane testing) but these are not referenced by ISO 16889.',
      advantages: [
        'Simpler test rig — single pass does not require continuous contamination injection or a full circulation loop',
        'Faster test execution — no need to load element to terminal ΔP',
        'Useful for rapid development screening where relative (not absolute) efficiency is the objective',
        'Large historical dataset exists from pre-2000 products — useful for legacy system maintenance reference',
      ],
      limitations: [
        'Withdrawn ISO standard — not valid for current procurement specifications or compliance claims',
        'ACFTD test dust is discontinued — ISO 12103-1 A4 (the ACFTD successor) produces different particle counts at the same nominal size',
        'No ISO 11171 calibration requirement — inter-laboratory variability was poor; results from different labs for the same element could vary significantly',
        'Single pass does not capture how efficiency changes as the element loads — multipass shows efficiency variation with loading state',
        'Beta values from ISO 4572 single-pass are NOT interchangeable with β_x(c) from ISO 16889 multipass',
        'Dirt holding capacity is not a primary output of single-pass testing',
      ],
      typicalApplications: [
        'Historical reference for legacy product data sheets (pre-2000)',
        'Internal development screening where relative efficiency comparison is more important than absolute calibrated values',
        'Interpreting legacy OEM filter element specifications that pre-date ISO 16889 adoption',
      ],
    },

    matrix: [
      { dimension: 'Fluid circulation',        optionA: 'Continuous — fluid recirculates throughout test',   optionB: 'Once through — fluid passes filter once only' },
      { dimension: 'Contamination injection',  optionA: 'Continuous upstream injection throughout test',      optionB: 'Pre-mixed or upstream add once' },
      { dimension: 'Test dust',                optionA: 'ISO 12103-1 A3 Medium (or A2/A4)',                  optionB: 'ACFTD (discontinued, no longer available)' },
      { dimension: 'Particle counter',         optionA: 'ISO 11171:2010-calibrated APC — mandatory',         optionB: 'Uncalibrated APC — pre-ISO 11171 era' },
      { dimension: 'Current standard status',  optionA: 'Active — ISO 16889:2022',                           optionB: 'Withdrawn — ISO 4572 (2000)' },
      { dimension: 'Outputs',                  optionA: 'Beta ratio β_x(c) + DHC [g] + terminal ΔP',        optionB: 'Single-pass efficiency % (no DHC)' },
      { dimension: 'Reproducibility',          optionA: 'High — ISO 11171 calibration ensures lab agreement', optionB: 'Poor — particle counter not calibrated; lab variation large' },
      { dimension: 'Data comparability',       optionA: 'Comparable globally (same calibration basis)',       optionB: 'Not comparable with ISO 16889 data; internal only' },
    ],

    engineeringImplications: [
      'A filter rated "99% efficient at 10 µm" from a 1995 data sheet using ISO 4572 is NOT equivalent to β₁₀(c) ≥ 200 from a current ISO 16889 test — never compare these values directly.',
      'Any procurement specification written today must reference ISO 16889 and require β_x(c) values with calibrated (c) suffix — specifications citing "single-pass efficiency" are technically incomplete.',
      'ISO 16889 multipass data tells the engineer how the element performs throughout its service life (efficiency changes as loading increases) — single-pass data reflects only initial clean element performance.',
      'When evaluating filter element substitutions for legacy equipment, ensure the replacement element has ISO 16889 multipass data, then establish which performance metric (β rating, DHC) matches the original design intent.',
    ],

    whenToUse: [
      {
        option: 'A',
        conditions: [
          'All current filter element performance specifications and procurement',
          'Any application requiring ISO 4406 cleanliness code design calculations',
          'New product development, certification, and compliance validation',
          'Forensic analysis of filter elements from field performance investigations',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Interpreting historical (pre-2000) product data for legacy equipment maintenance decisions',
          'Rapid internal development screening where relative comparisons (not certified values) are sufficient',
        ],
      },
    ],

    whenNotToUse: [
      {
        option: 'A',
        conditions: [
          'There are no valid reasons to avoid ISO 16889 for fluid filter element performance characterisation',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Any current procurement specification — ISO 4572 is withdrawn',
          'Any certification or compliance claim — ISO 4572 values are not internationally recognised',
          'Cross-comparison with modern ISO 16889 data',
        ],
      },
    ],

    relatedStandards:    ['iso-16889', 'iso-11171', 'iso-4406'],
    relatedTechnologies: ['NANOFORCE', 'SYNTRAX'],
    relatedSystems:      ['hydraulic', 'lube-oil'],
    relatedTerms:        ['multipass-test', 'beta-ratio', 'filtration-efficiency', 'particle-counting'],
    relatedArticles:     ['testing-and-validation', 'filter-media-science', 'fluid-cleanliness'],

    revisionHistory: [
      { version: '1.0', date: '2026-07-09', changes: 'Initial entry — Phase 6C Engineering Comparison Engine' },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────

  {
    id:       COMPARISON_IDS['gravimetric-vs-particle-counting'],
    slug:     'gravimetric-vs-particle-counting',
    title:    'Gravimetric Analysis vs. Particle Counting',
    subtitle: 'Two methods for measuring contamination levels in hydraulic and lubricating fluids',
    category: 'test-method',

    engineeringObjective:
      'Select the appropriate contamination measurement method based on required data type (total mass, size distribution, or count), sensitivity, and whether ISO 4406 cleanliness codes or bulk contamination mass is the required output.',
    comparisonScope:
      'Covers gravimetric analysis (ISO 4405) and automatic particle counting (ISO 11171, ISO 4406) for hydraulic and lube oil fluid contamination measurement. Does not cover ferrographic analysis, spectrometric oil analysis (SOAP), or biological contamination testing.',
    governingStandards: ['ISO 4405:1991', 'ISO 11171:2010', 'ISO 4406:2021', 'ISO 16889:2022'],

    optionA: {
      id:          'A',
      label:       'Gravimetric Analysis',
      description: 'Fluid is filtered through a membrane filter of known weight, dried, and reweighed. The contamination mass per unit volume is calculated as (final weight − initial weight) / fluid volume, expressed in mg/L or mg/100 mL. ISO 4405 defines the procedure for hydraulic fluids. Gravimetric analysis captures the total mass of particles above the membrane pore size (typically 0.45–1.2 µm) but provides no information about particle size distribution, particle count, or the ISO 4406 cleanliness code.',
      advantages: [
        'Simple, low-cost equipment — calibrated analytical balance and membrane filters; no particle counter required',
        'Measures total contamination mass including particle types that scatter light differently and may undercount in optical APCs',
        'Standard method for filter element dirt holding capacity measurement (ISO 16889 gravimetric weighing of element)',
        'Valid for fluids with high light absorbance or fluorescence that interfere with optical particle counting',
        'Historical measurement method — large legacy database of mg/L values for comparison',
        'Captures both hard particles and soft contamination (gel, sludge, varnish) that may not be counted accurately by APC',
      ],
      limitations: [
        'Does not produce particle size distribution data — cannot calculate ISO 4406 cleanliness codes',
        'Cannot distinguish between a few large particles and many fine particles of the same total mass — fundamentally different contamination profiles give identical gravimetric results',
        'Minimum detectable mass depends on balance sensitivity — not suitable for ultra-clean fluids at ISO 14/12/9 or cleaner',
        'Slow procedure — membrane preparation, filtration, drying, and weighing takes hours vs. minutes for APC',
        'Single-use membrane filter consumables — cost adds up in high-frequency monitoring programmes',
        'Cannot be used in-line or continuously — offline analysis only',
      ],
      typicalApplications: [
        'Filter element dirt holding capacity measurement per ISO 16889 (element weighing before and after test)',
        'Bulk contamination measurement for oil analysis when ISO 4406 coding is not required',
        'Fluids with high optical opacity (some cutting fluids, dark oils) that defeat optical particle counters',
        'Total contamination audit where mass (not count) is the required metric',
        'Historical legacy systems where gravimetric data is the existing baseline',
      ],
    },

    optionB: {
      id:          'B',
      label:       'Automatic Particle Counting (APC)',
      description: 'An ISO 11171:2010-calibrated light-extinction optical particle counter (APC) counts and sizes individual particles in a known volume of fluid. Counts are reported per mL at specified size thresholds (≥4 µm(c), ≥6 µm(c), ≥14 µm(c) per ISO 4406:2021). The three-threshold counts are converted to ISO 4406 range codes. APCs can measure continuously at high flow rates, enabling on-line monitoring. ISO 11171 calibration with PSL spheres ensures inter-laboratory comparability. Particle size distribution data enables identification of contamination sources and degradation mechanisms.',
      advantages: [
        'Produces ISO 4406 cleanliness codes directly — required for component protection specifications',
        'Particle size distribution data reveals contamination source (abrasive silica, metallic wear, seal degradation particles have different size distributions)',
        'Fast results — modern APCs deliver results in minutes; on-line APCs provide continuous monitoring',
        'Detects contamination at concentrations below gravimetric detection limits — suitable for clean systems at ISO 14/12/9 and cleaner',
        'On-line monitoring capability — APC can be installed in-line to detect contamination events in real time',
        'ISO 11171 calibration ensures global inter-laboratory comparability — same fluid measured at any certified lab gives equivalent codes',
        'Required for ISO 16889 filter element performance testing (Beta ratio measurement)',
      ],
      limitations: [
        'Requires ISO 11171-calibrated instrument — capital cost significantly higher than gravimetric balance',
        'Optical extinction method is sensitive to fluid opacity — dark or heavily contaminated fluids require dilution before measurement, adding procedural steps',
        'Air bubbles and water droplets are counted as particles — sample handling to remove aeration is critical',
        'Counts particles (counts/mL) but not their mass — total contamination mass cannot be derived from APC data alone',
        'Soft particles (gel, varnish, elastomer fragments) may be counted inconsistently vs. hard particulate of the same size',
        'Calibration drift without regular PSL recalibration leads to erroneous cleanliness codes',
      ],
      typicalApplications: [
        'ISO 4406 cleanliness code measurement for hydraulic system condition monitoring',
        'ISO 16889 filter element Beta ratio testing (mandatory APC method)',
        'On-line hydraulic system contamination monitoring with particle count alarms',
        'Fluid cleanliness acceptance testing for new systems and after flushing',
        'Condition monitoring for predictive maintenance programmes',
        'Component protection verification for proportional and servo valve systems',
      ],
    },

    matrix: [
      { dimension: 'Output data type',         optionA: 'Total mass [mg/L or mg/100 mL]',                   optionB: 'Particle count per mL by size threshold' },
      { dimension: 'ISO 4406 code output',     optionA: 'Not possible — no particle size data',              optionB: 'Direct output — count at ≥4, ≥6, ≥14 µm(c)' },
      { dimension: 'Particle size data',       optionA: 'None — mass only',                                  optionB: 'Full size distribution (size spectrum)' },
      { dimension: 'Calibration requirement',  optionA: 'Calibrated analytical balance per ISO 4405',        optionB: 'ISO 11171:2010 PSL calibration — mandatory' },
      { dimension: 'Minimum detection',        optionA: 'Limited by balance sensitivity (~0.1 mg)',           optionB: 'Single particle detection to 1 µm(c) and below' },
      { dimension: 'Speed',                    optionA: 'Hours — membrane prep, drying, weighing',           optionB: 'Minutes; on-line = continuous real-time' },
      { dimension: 'Fluid opacity sensitivity', optionA: 'Not affected by optical properties',               optionB: 'Dark/opaque fluids require dilution or alternate sensing' },
      { dimension: 'Soft particle detection',  optionA: 'Captures gel, varnish, sludge by mass',             optionB: 'Soft particles inconsistently counted by optical method' },
      { dimension: 'ISO 16889 requirement',    optionA: 'Used for element DHC weighing only',                optionB: 'Required for Beta ratio measurement' },
    ],

    engineeringImplications: [
      'ISO 4406 cleanliness codes can only be assigned by APC — gravimetric analysis does not produce cleanliness codes; systems specified by ISO 4406 targets must use APC for verification.',
      'For filter element performance testing per ISO 16889, APC is mandatory — gravimetric measurement is used only for dirt holding capacity (element weight) determination, not for Beta ratio.',
      'In dark or heavily aerated fluids where APC accuracy is questionable, gravimetric analysis may be the more reliable contamination mass indicator, but it cannot substitute for APC in cleanliness-code systems.',
      'When troubleshooting rapid cleanliness code degradation, APC particle size distribution data provides contamination source identification that gravimetric mg/L data cannot — a spike in 14 µm+ particles indicates a different source than a spike in 4 µm particles.',
    ],

    whenToUse: [
      {
        option: 'A',
        conditions: [
          'Filter element dirt holding capacity measurement per ISO 16889 test procedure',
          'Total contamination audit for fluids where optical particle counting is impractical (high opacity)',
          'Historical comparison with legacy gravimetric database',
          'Contamination mass measurement where ISO 4406 cleanliness codes are not the required output',
        ],
      },
      {
        option: 'B',
        conditions: [
          'All ISO 4406 cleanliness code measurement and verification',
          'ISO 16889 filter element Beta ratio performance testing',
          'Hydraulic and lube oil system condition monitoring programmes',
          'Component protection verification for servo and proportional valve systems',
          'Any application requiring particle size distribution data for contamination source diagnosis',
        ],
      },
    ],

    whenNotToUse: [
      {
        option: 'A',
        conditions: [
          'When ISO 4406 cleanliness codes are the required output — gravimetric cannot produce cleanliness codes',
          'ISO 16889 Beta ratio testing — APC is required by the standard',
          'Ultra-clean fluid verification (ISO 14/12/9 or cleaner) where mass differences are below balance detection limit',
        ],
      },
      {
        option: 'B',
        conditions: [
          'Heavily contaminated or opaque fluids without dilution capability — aeration and opacity cause counting errors',
          'When total contamination mass (not count) is the required metric for comparison with historical gravimetric data',
          'Environments where APC calibration maintenance cannot be sustained — uncalibrated APC data is not ISO 4406 compliant',
        ],
      },
    ],

    relatedStandards:    ['iso-4406', 'iso-11171', 'iso-16889', 'iso-4405'],
    relatedTechnologies: ['NANOFORCE', 'SYNTRAX'],
    relatedSystems:      ['hydraulic', 'lube-oil'],
    relatedTerms:        ['particle-counting', 'cleanliness-code', 'gravimetric-analysis', 'beta-ratio', 'iso-4406'],
    relatedArticles:     ['testing-and-validation', 'fluid-cleanliness', 'contamination-control'],

    revisionHistory: [
      { version: '1.0', date: '2026-07-09', changes: 'Initial entry — Phase 6C Engineering Comparison Engine' },
    ],
  },

];

// ── Lookup helpers ─────────────────────────────────────────────────────────────

export function getComparisonBySlug(slug: string): KCComparison | undefined {
  return KC_COMPARISONS.find(c => c.slug === slug);
}

export function getComparisonsByCategory(
  category: KCComparison['category'],
): KCComparison[] {
  return KC_COMPARISONS.filter(c => c.category === category);
}
