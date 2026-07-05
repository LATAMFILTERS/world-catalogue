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
} as const;

// ── Technology IDs ────────────────────────────────────────────────────────────

export const TECHNOLOGY_IDS = {
  'macrocore':   'TECH-MACROCORE',
  'syntrax':     'TECH-SYNTRAX',
  'nanoforce':   'TECH-NANOFORCE',
  'syntepore':   'TECH-SYNTEPORE',
  'hydrocore':   'TECH-HYDROCORE',
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
