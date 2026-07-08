/**
 * types.ts
 * ELIMFILTERS Knowledge Center — Entity Type Definitions
 *
 * All TypeScript interfaces for KC data entities.
 * This file has NO imports from other KC modules — it is the dependency root.
 *
 * Dependency: none
 */

export interface KCArticle {
  slug: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  category: string;
  readTime: string;
  intro: string;
  sections: {
    heading: string;
    body: string;
    callout?: { label: string; value: string }[];
  }[];
  keyMetrics: { label: string; value: string }[];
  relatedStandards: string[];
  relatedTechnologies: string[];
  relatedSystems: string[];
  keywords: string[];
  // ── Extended template fields (Phase 4 Batch 3+) ─────────────────────────
  /** Objective troubleshooting guide — symptoms, causes, inspection, actions. */
  fieldDiagnostics?: {
    symptoms: string[];
    probableCauses: string[];
    inspectionMethods: string[];
    correctiveActions: string[];
  };
  /** Engineering decision chain: Problem → Standard → System → Technology → Articles. */
  decisionMatrix?: Array<{
    problem: string;
    standard: string;
    protectionSystem: string;
    technology: string;
    relatedArticles: string[];
  }>;
  /** Governance metadata sourced from the Engineering Data Layer. */
  revisionHistory?: {
    version: string;
    lastEngineeringReview: string;
    nextScheduledReview: string;
    responsibleRegistry: string;
    evidenceStatus: string;
  };
}

export interface KCStandard {
  // ── Core identity ──────────────────────────────────────────────────────────
  slug: string;
  code: string;
  title: string;
  entityId: string;                       // STD-xxx permanent graph ID
  // ── Issuing body & revision ────────────────────────────────────────────────
  issuingOrganization: string;            // Full organization name
  year: string;
  revisionStatus: 'active' | 'superseded' | 'withdrawn' | 'draft';
  supersedes?: string;                    // Code string of superseded standard
  supersededBy?: string;                  // Code string of superseding standard
  // ── Content ───────────────────────────────────────────────────────────────
  metaDescription: string;
  scope: string;
  engineeringPurpose: string;             // Why this standard exists for filtration engineering
  sections: { heading: string; body: string }[];
  keyParams: { label: string; value: string }[];
  // ── Graph relationships ────────────────────────────────────────────────────
  applicableSystems: string[];            // system slugs (SYSTEM_IDS keys)
  relatedGlossaryTerms: string[];         // TERM-xxx permanent IDs
  relatedTopics: string[];                // article category slugs
  relatedTechnologies: string[];          // technology display names (e.g. 'MACROCORE™')
  relatedArticles: string[];              // article slugs
  // ── Hierarchy ─────────────────────────────────────────────────────────────
  parentStandard?: string;                // STD-xxx ID (e.g. ISO 8573-2 → ISO 8573-1)
  childStandards?: string[];              // STD-xxx IDs
}

export interface KCTechnology {
  slug: string;
  name: string;
  domain: string;
  tagline: string;
  engineeringPrinciple: string;
  contamination: string[];
  performanceSpecs: { label: string; value: string }[];
  standards: string[];
  relatedSystems: string[];
  relatedIndustries: string[];
  worksWith: string[];
}

export interface KCSystemDetail {
  slug: string;
  failureMechanism: string;
  contaminationTarget: string;
  targetCleanliness: string;
  keyMetrics: { label: string; value: string }[];
  sections: { heading: string; body: string; callout?: { label: string; value: string }[] }[];
}

export interface KCIndustryDetail {
  slug: string;
  contaminationEnvironment: string;
  primaryRisks: string[];
  serviceIntervalNote: string;
  keyMetrics: { label: string; value: string }[];
  technologies: string[];
  standards: string[];
  systems: string[];
  sections: { heading: string; body: string }[];
}

export interface KCDiagram {
  // ── Core identity ──────────────────────────────────────────────────────────
  slug: string;
  entityId: string;                    // DIAG-xxx permanent graph ID
  title: string;
  metaDescription: string;
  engineeringPurpose: string;
  diagramType: 'flow' | 'schematic' | 'cross-section' | 'system' | 'process' | 'chart';
  // ── Standards ─────────────────────────────────────────────────────────────
  governingStandards: string[];        // STD-xxx permanent IDs
  // ── Graph relationships ────────────────────────────────────────────────────
  applicableSystems: string[];         // system slugs (SYSTEM_IDS keys)
  relatedTechnologies: string[];       // technology display names (e.g. 'NANOFORCE™')
  relatedArticles: string[];           // article slugs
  relatedGlossaryTerms: string[];      // TERM-xxx permanent IDs
  // ── Revision metadata ─────────────────────────────────────────────────────
  revisionMetadata: {
    version: string;
    lastReviewed: string;
    nextReview: string;
    status: 'current' | 'draft' | 'superseded';
  };
  // ── Accessibility ─────────────────────────────────────────────────────────
  accessibility: {
    title: string;
    desc: string;
    ariaLabel: string;
  };
  // ── SVG component reference ────────────────────────────────────────────────
  svgComponentId: string;              // matches component export name
}

// ── Engineering Calculators ───────────────────────────────────────────────────

export interface KCCalculatorVariable {
  symbol: string;         // e.g. "β_x(c)"
  definition: string;     // e.g. "Beta ratio at particle size x µm(c)"
  unit: string;           // e.g. "dimensionless"
}

export interface KCCalculatorWorkedExample {
  description: string;
  inputs: { symbol: string; value: string }[];
  outputs: { symbol: string; value: string }[];
  narrative: string;
}

export interface KCCalculatorFormula {
  expression: string;                   // human-readable formula string
  variables: KCCalculatorVariable[];
  standard: string;                     // e.g. "ISO 16889:2022 §3.1.2"
  assumptions: string[];
  limitations: string[];
  workedExample: KCCalculatorWorkedExample;
  validationReference: string;          // citation for known test data
}

export interface KCCalculatorInputSpec {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
  description: string;
}

export interface KCCalculatorOutputSpec {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  precision: number;
}

export type KCCalculatorCategory =
  | 'fluid-cleanliness'
  | 'filtration-efficiency'
  | 'pressure-drop'
  | 'service-interval'
  | 'air-intake';

export interface KCCalculator {
  // ── Core identity ──────────────────────────────────────────────────────────
  slug: string;
  entityId: string;                     // CALC-xxx permanent graph ID
  title: string;
  description: string;
  category: KCCalculatorCategory;
  governingStandard: string;            // primary standard citation for display
  // ── Engineering specification ──────────────────────────────────────────────
  formula: KCCalculatorFormula;
  // inputSummary/outputSummary: registry metadata only (documentation & SEO).
  // Actual computation logic lives in CalculatorContent.tsx — not in the registry.
  inputSummary: KCCalculatorInputSpec[];
  outputSummary: KCCalculatorOutputSpec[];
  // ── Graph relationships ────────────────────────────────────────────────────
  relatedStandards: string[];           // standard slugs
  relatedArticles: string[];            // article slugs
  relatedTechnologies: string[];        // technology display names (e.g. 'NANOFORCE™')
  // ── Validation & revision ─────────────────────────────────────────────────
  validationStatus: 'validated' | 'pending';
  sourceStandardRevision: string;       // e.g. "ISO 16889:2022"
  revisionHistory: { version: string; date: string; change: string }[];
}
