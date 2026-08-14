/**
 * entity-ids.ts
 * ELIMFILTERS Knowledge Center — Permanent Entity ID Registry
 *
 * Every KC entity receives a permanent, immutable identifier at creation.
 * IDs follow the governance.ts PermanentId convention: {PREFIX}-{DESCRIPTOR}.
 * Once assigned, an ID is never changed, reused, or deleted.
 *
 * Dependency: none (primitive constants only)
 */

// ── Article IDs ───────────────────────────────────────────────────────────────

export const ARTICLE_IDS = {
  'airflow-engineering':                   'ARTICLE-AIRFLOW-ENGINEERING',
  'seal-integrity':                        'ARTICLE-SEAL-INTEGRITY',
  'contamination-control':                 'ARTICLE-CONTAMINATION-CONTROL',
  'filter-media-science':                  'ARTICLE-FILTER-MEDIA-SCIENCE',
  'fluid-cleanliness':                     'ARTICLE-FLUID-CLEANLINESS',
  'air-restriction':                       'ARTICLE-AIR-RESTRICTION',
  'dust-holding-capacity':                 'ARTICLE-DUST-HOLDING-CAPACITY',
  'service-intervals':                     'ARTICLE-SERVICE-INTERVALS',
  'total-cost-of-ownership':               'ARTICLE-TOTAL-COST-OF-OWNERSHIP',
  'failure-analysis':                      'ARTICLE-FAILURE-ANALYSIS',
  'testing-and-validation':                'ARTICLE-TESTING-AND-VALIDATION',
  'oem-engineering':                       'ARTICLE-OEM-ENGINEERING',
  'asset-protection-engineering':          'ARTICLE-ASSET-PROTECTION-ENGINEERING',
  'materials-engineering':                 'ARTICLE-MATERIALS-ENGINEERING',
  'iso-16889':                             'ARTICLE-ISO-16889',
  'iso-4406':                              'ARTICLE-ISO-4406',
  'iso-5011':                              'ARTICLE-ISO-5011',
  'beta-ratio':                            'ARTICLE-BETA-RATIO',
  'hydraulic-contamination-sensitivity':   'ARTICLE-HYDRAULIC-CONTAMINATION-SENSITIVITY',
  'water-contamination-fuel':              'ARTICLE-WATER-CONTAMINATION-FUEL',
  'compressed-air-purity':                 'ARTICLE-COMPRESSED-AIR-PURITY',
  'oil-analysis-methods':                  'ARTICLE-OIL-ANALYSIS-METHODS',
  'cabin-air-filtration':                  'ARTICLE-CABIN-AIR-FILTRATION',
  'diesel-fuel-filtration':                'ARTICLE-DIESEL-FUEL-FILTRATION',
  'air-intake-system-design':              'ARTICLE-AIR-INTAKE-SYSTEM-DESIGN',
  'lubrication-system-filtration':         'ARTICLE-LUBRICATION-SYSTEM-FILTRATION',
  'hydraulic-power-unit-design':           'ARTICLE-HYDRAULIC-POWER-UNIT-DESIGN',
  'particle-ingress-prevention':           'ARTICLE-PARTICLE-INGRESS-PREVENTION',
  'filter-media-engineering':              'ARTICLE-FILTER-MEDIA-ENGINEERING',
  'marine-diesel-filtration':              'ARTICLE-MARINE-DIESEL-FILTRATION',
  'cooling-system-contamination':          'ARTICLE-COOLING-SYSTEM-CONTAMINATION',
  'filter-element-integrity':              'ARTICLE-FILTER-ELEMENT-INTEGRITY',
  'filter-housing-system-integration':     'ARTICLE-FILTER-HOUSING-SYSTEM-INTEGRATION',
  'contamination-ingression-modelling':    'ARTICLE-CONTAMINATION-INGRESSION-MODELLING',
  'sae-j300-viscosity-classification':     'ARTICLE-SAE-J300-VISCOSITY-CLASSIFICATION',
  'nfpa-t2-14-hydraulic-cleanliness':      'ARTICLE-NFPA-T2-14-HYDRAULIC-CLEANLINESS',
  'iso-29463-hepa-ulpa-filters':           'ARTICLE-ISO-29463-HEPA-ULPA-FILTERS',
  'varnish-formation-lube-systems':        'ARTICLE-VARNISH-FORMATION-LUBE-SYSTEMS',
  'iso-4548-lube-filter-test-methods':     'ARTICLE-ISO-4548-LUBE-FILTER-TEST-METHODS',
  'contamination-sensitivity-components':  'ARTICLE-CONTAMINATION-SENSITIVITY-COMPONENTS',
  'extended-drain-interval-engineering':   'ARTICLE-EXTENDED-DRAIN-INTERVAL-ENGINEERING',
  'compressed-air-dryer-selection':        'ARTICLE-COMPRESSED-AIR-DRYER-SELECTION',
  'iso-11171-particle-counting':           'ARTICLE-ISO-11171-PARTICLE-COUNTING',
  'sae-j726-iso-5011-air-cleaner-test':    'ARTICLE-SAE-J726-ISO-5011-AIR-CLEANER-TEST',
  'hydraulic-system-flushing':             'ARTICLE-HYDRAULIC-SYSTEM-FLUSHING',
  'oil-condition-monitoring':              'ARTICLE-OIL-CONDITION-MONITORING',
  'filter-housing-design':                 'ARTICLE-FILTER-HOUSING-DESIGN',
  'hydraulic-reservoir-design':            'ARTICLE-HYDRAULIC-RESERVOIR-DESIGN',
  'iso-16889-multipass-test':              'ARTICLE-ISO-16889-MULTIPASS-TEST',
  'compressed-air-quality-verification':   'ARTICLE-COMPRESSED-AIR-QUALITY-VERIFICATION',
  'hpcr-fuel-system-cleanliness':          'ARTICLE-HPCR-FUEL-SYSTEM-CLEANLINESS',
  'crankcase-ventilation-filtration':      'ARTICLE-CRANKCASE-VENTILATION-FILTRATION',
  'fleet-oil-sampling-protocol':           'ARTICLE-FLEET-OIL-SAMPLING-PROTOCOL',
} as const;

// ── Standard IDs ──────────────────────────────────────────────────────────────

export const STANDARD_IDS = {
  'iso-16889':   'STD-ISO-16889',
  'iso-5011':    'STD-ISO-5011',
  'iso-4406':    'STD-ISO-4406',
  'nas-1638':    'STD-NAS-1638',
  'iso-29463':   'STD-ISO-29463',
  'sae-j1858':   'STD-SAE-J1858',
  'iso-11171':   'STD-ISO-11171',
  'iso-8573-1':  'STD-ISO-8573-1',
  'sae-j1539':   'STD-SAE-J1539',
  'iso-12937':   'STD-ISO-12937',
  'nfpa-t2-14':  'STD-NFPA-T2-14',
  'iso-11155-1': 'STD-ISO-11155-1',
  'astm-d6304':  'STD-ASTM-D6304',
  'iso-16332':   'STD-ISO-16332',
  'din-71220':   'STD-DIN-71220',
  'din-51524':   'STD-DIN-51524',
  'sae-j726':    'STD-SAE-J726',
  // Phase 5C additions
  'iso-3723':    'STD-ISO-3723',
  'iso-19438':   'STD-ISO-19438',
  'astm-d5185':  'STD-ASTM-D5185',
  'iso-8573-2':  'STD-ISO-8573-2',
  'iso-3968':    'STD-ISO-3968',
} as const;

// ── Technology IDs ────────────────────────────────────────────────────────────

export const TECHNOLOGY_IDS = {
  'macrocore':   'TECH-MACROCORE',
  'syntrax':     'TECH-SYNTRAX',
  'nanoforce':   'TECH-NANOFORCE',
  'SYNTAPORE':   'TECH-SYNTAPORE',
  'TURBOCORE':   'TECH-TURBOCORE',
  'turbocore':   'TECH-TURBOCORE',
  'thermacore':  'TECH-THERMACORE',
  'drycore':     'TECH-DRYCORE',
  'intekcore':   'TECH-INTEKCORE',
  'microkappa':  'TECH-MICROKAPPA',
  'duratech':    'TECH-DURATECH',
  'marineclean': 'TECH-MARINECLEAN',
} as const;

// ── System IDs ────────────────────────────────────────────────────────────────

export const SYSTEM_IDS = {
  'air-intake-protection':      'SYS-AIR-INTAKE-PROTECTION',
  'fuel-cleanliness-protection':'SYS-FUEL-CLEANLINESS-PROTECTION',
  'lubrication-protection':     'SYS-LUBRICATION-PROTECTION',
  'hydraulic-protection':       'SYS-HYDRAULIC-PROTECTION',
  'cooling-system-protection':  'SYS-COOLING-SYSTEM-PROTECTION',
  'cabin-air-protection':       'SYS-CABIN-AIR-PROTECTION',
} as const;

// ── Industry IDs ──────────────────────────────────────────────────────────────

export const INDUSTRY_IDS = {
  'mining':           'IND-MINING',
  'construction':     'IND-CONSTRUCTION',
  'agriculture':      'IND-AGRICULTURE',
  'truck-fleets':     'IND-TRUCK-FLEETS',
  'marine':           'IND-MARINE',
  'oil-gas':          'IND-OIL-GAS',
  'manufacturing':    'IND-MANUFACTURING',
  'power-generation': 'IND-POWER-GENERATION',
  'railway':          'IND-RAILWAY',
  'waste-municipal':  'IND-WASTE-MUNICIPAL',
} as const;

// ── Term IDs ──────────────────────────────────────────────────────────────────

export const TERM_IDS = {
  // Filtration Performance
  'beta-ratio':                    'TERM-BETA-RATIO',
  'absolute-efficiency':           'TERM-ABSOLUTE-EFFICIENCY',
  'nominal-efficiency':            'TERM-NOMINAL-EFFICIENCY',
  'multi-pass-test':               'TERM-MULTI-PASS-TEST',
  'gravimetric-efficiency':        'TERM-GRAVIMETRIC-EFFICIENCY',
  'differential-pressure':         'TERM-DIFFERENTIAL-PRESSURE',
  'filter-bypass-valve':           'TERM-FILTER-BYPASS-VALVE',
  'element-collapse':              'TERM-ELEMENT-COLLAPSE',
  // Fluid Cleanliness
  'iso-cleanliness-code':          'TERM-ISO-CLEANLINESS-CODE',
  'particle-count':                'TERM-PARTICLE-COUNT',
  'nas-cleanliness-code':          'TERM-NAS-CLEANLINESS-CODE',
  'contamination-ingression-rate': 'TERM-CONTAMINATION-INGRESSION-RATE',
  'test-dust':                     'TERM-TEST-DUST',
  'oil-condition-monitoring':      'TERM-OIL-CONDITION-MONITORING',
  // Air Intake
  'restriction':                   'TERM-RESTRICTION',
  'dust-holding-capacity':         'TERM-DUST-HOLDING-CAPACITY',
  'progressive-density-gradient':  'TERM-PROGRESSIVE-DENSITY-GRADIENT',
  'cyclonic-separation':           'TERM-CYCLONIC-SEPARATION',
  'ingress-protection':            'TERM-INGRESS-PROTECTION',
  'service-interval':              'TERM-SERVICE-INTERVAL',
  // Contamination
  'abrasive-wear':                 'TERM-ABRASIVE-WEAR',
  'adhesive-wear':                 'TERM-ADHESIVE-WEAR',
  'silica':                        'TERM-SILICA',
  'aeration':                      'TERM-AERATION',
  'particle-size-distribution':    'TERM-PARTICLE-SIZE-DISTRIBUTION',
  // Hydraulic Systems
  'servo-valve':                   'TERM-SERVO-VALVE',
  'proportional-valve':            'TERM-PROPORTIONAL-VALVE',
  'cavitation':                    'TERM-CAVITATION',
  'bypass-filtration':             'TERM-BYPASS-FILTRATION',
  'full-flow-filtration':          'TERM-FULL-FLOW-FILTRATION',
  // Lubrication
  'bearing-clearance':             'TERM-BEARING-CLEARANCE',
  'viscosity':                     'TERM-VISCOSITY',
  'viscosity-index':               'TERM-VISCOSITY-INDEX',
  'total-base-number':             'TERM-TOTAL-BASE-NUMBER',
  // Chemical Degradation
  'varnish':                       'TERM-VARNISH',
  'oxidative-degradation':         'TERM-OXIDATIVE-DEGRADATION',
  'thermal-degradation':           'TERM-THERMAL-DEGRADATION',
  'total-acid-number':             'TERM-TOTAL-ACID-NUMBER',
  'soot':                          'TERM-SOOT',
  // Water & Fuel
  'water-ingress':                 'TERM-WATER-INGRESS',
  'karl-fischer-titration':        'TERM-KARL-FISCHER-TITRATION',
  'hpcr':                          'TERM-HPCR',
  'injector-stiction':             'TERM-INJECTOR-STICTION',
  'coalescing':                    'TERM-COALESCING',
  'microbial-contamination':       'TERM-MICROBIAL-CONTAMINATION',
  // Filter Media
  'depth-filtration':              'TERM-DEPTH-FILTRATION',
  'surface-filtration':            'TERM-SURFACE-FILTRATION',
  'synthetic-media':               'TERM-SYNTHETIC-MEDIA',
  // Phase 5B Expansion — Filtration Performance
  'collapse-pressure':             'TERM-COLLAPSE-PRESSURE',
  // Phase 5B Expansion — Air Intake
  'safety-element':                'TERM-SAFETY-ELEMENT',
  'pre-cleaner':                   'TERM-PRE-CLEANER',
  'restriction-indicator':         'TERM-RESTRICTION-INDICATOR',
  'breather-filter':               'TERM-BREATHER-FILTER',
  // Phase 5B Expansion — Fluid Cleanliness
  'dew-point':                     'TERM-DEW-POINT',
  'compressed-air-purity':         'TERM-COMPRESSED-AIR-PURITY',
  // Phase 5B Expansion — Contamination
  'ferrous-wear-debris':           'TERM-FERROUS-WEAR-DEBRIS',
  'glycol-contamination':          'TERM-GLYCOL-CONTAMINATION',
  // Phase 5B Expansion — Hydraulic Systems
  'kidney-loop':                   'TERM-KIDNEY-LOOP',
  'system-flushing':               'TERM-SYSTEM-FLUSHING',
  // Phase 5B Expansion — Lubrication
  'hydrodynamic-lubrication':      'TERM-HYDRODYNAMIC-LUBRICATION',
  'oil-drain-interval':            'TERM-OIL-DRAIN-INTERVAL',
  // Phase 5B Expansion — Chemical Degradation
  'sludge':                        'TERM-SLUDGE',
  'lacquer':                       'TERM-LACQUER',
  // Phase 5B Expansion — Water & Fuel
  'free-water':                    'TERM-FREE-WATER',
  'emulsified-water':              'TERM-EMULSIFIED-WATER',
  'water-separation-efficiency':   'TERM-WATER-SEPARATION-EFFICIENCY',
  // Phase 5B Expansion — Filter Media
  'melt-blown-media':              'TERM-MELT-BLOWN-MEDIA',
  'cellulose-media':               'TERM-CELLULOSE-MEDIA',
} as const;

// ── Diagram IDs ───────────────────────────────────────────────────────────────

export const DIAGRAM_IDS = {
  'multipass-test-circuit':          'DIAG-MULTIPASS-TEST',
  'beta-ratio-measurement':          'DIAG-BETA-RATIO',
  'iso-4406-cleanliness-scale':      'DIAG-ISO4406-CLEANLINESS',
  'hydraulic-contamination-paths':   'DIAG-HYD-CONTAMINATION',
  'air-intake-filtration-flow':      'DIAG-AIR-INTAKE-FLOW',
  'lube-oil-circuit':                'DIAG-LUBE-OIL-CIRCUIT',
  'fuel-filtration-3stage':          'DIAG-FUEL-3STAGE',
  'differential-pressure-curve':     'DIAG-DP-CURVE',
  'compressed-air-treatment':        'DIAG-CA-TREATMENT',
  'particle-wear-mechanism':         'DIAG-PARTICLE-WEAR',
  // ── Phase 6B additions ──────────────────────────────────────────────────────
  'filter-media-cross-section':      'DIAG-MEDIA-CROSS-SECTION',
  'iso-8573-purity-classes':         'DIAG-ISO8573-PURITY',
  'service-interval-flow':           'DIAG-SERVICE-INTERVAL-FLOW',
  'cabin-air-system':                'DIAG-CABIN-AIR-SYSTEM',
  'water-contamination-pathways':    'DIAG-WATER-CONT-PATHS',
} as const;

// ── Lookup helpers ─────────────────────────────────────────────────────────────

export function getArticleId(slug: string): string | undefined {
  return (ARTICLE_IDS as Record<string, string>)[slug];
}

export function getStandardId(slug: string): string | undefined {
  return (STANDARD_IDS as Record<string, string>)[slug];
}

export function getTechnologyId(slug: string): string | undefined {
  return (TECHNOLOGY_IDS as Record<string, string>)[slug];
}

export function getSystemId(slug: string): string | undefined {
  return (SYSTEM_IDS as Record<string, string>)[slug];
}

export function getIndustryId(slug: string): string | undefined {
  return (INDUSTRY_IDS as Record<string, string>)[slug];
}

export function getTermId(slug: string): string | undefined {
  return (TERM_IDS as Record<string, string>)[slug];
}

export function getDiagramId(slug: string): string | undefined {
  return (DIAGRAM_IDS as Record<string, string>)[slug];
}

// ── Calculator IDs ─────────────────────────────────────────────────────────────

export const CALCULATOR_IDS = {
  'iso4406-code-converter':      'CALC-ISO4406-CONVERTER',
  'beta-ratio-efficiency':       'CALC-BETA-RATIO-EFF',
  'pressure-drop-estimator':     'CALC-PRESSURE-DROP',
  'dhc-planning-estimator':      'CALC-DHC-ESTIMATOR',
  'air-filter-restriction':      'CALC-AIR-RESTRICTION',
  'fluid-cleanliness-evaluator': 'CALC-FLUID-CLEANLINESS',
  'service-interval-engineering':'CALC-SERVICE-INTERVAL',
} as const;

export function getCalculatorId(slug: string): string | undefined {
  return (CALCULATOR_IDS as Record<string, string>)[slug];
}

// ── Comparison IDs ─────────────────────────────────────────────────────────────

export const COMPARISON_IDS = {
  'beta-ratio-vs-filtration-efficiency': 'COMP-BETA-VS-EFF',
  'iso4406-vs-nas1638':                  'COMP-ISO4406-VS-NAS',
  'iso5011-vs-sae-j726':                 'COMP-ISO5011-VS-SAE',
  'cellulose-vs-synthetic-media':        'COMP-CELLULOSE-VS-SYN',
  'surface-vs-depth-filtration':         'COMP-SURFACE-VS-DEPTH',
  'bypass-vs-full-flow-filtration':      'COMP-BYPASS-VS-FULL',
  'single-stage-vs-multi-stage-fuel':    'COMP-SINGLE-VS-MULTI-FUEL',
  'online-vs-offline-hydraulic':         'COMP-ONLINE-VS-OFFLINE',
  'multipass-vs-single-pass-testing':    'COMP-MULTI-VS-SINGLE-TEST',
  'gravimetric-vs-particle-counting':    'COMP-GRAV-VS-PARTICLE',
} as const;

export function getComparisonId(slug: string): string | undefined {
  return (COMPARISON_IDS as Record<string, string>)[slug];
}
