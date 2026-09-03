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
  /** Documented engineering misinterpretations of this article's core concepts. */
  commonMistakes?: string[];
  // ── Phase 6G: GEO + SEO Hardening ───────────────────────────────────────
  /** EEAT visible metadata — reviewer, discipline, version, review dates. */
  eeat?: KCEeat;
  /** Frequently Asked Questions — rendered + emitted as FAQPage JSON-LD. */
  faqs?: KCFaqItem[];
  /** Authoritative engineering references organised by category. */
  engineeringReferences?: KCEngineeringReference[];
  /** Procedural HowTo — emitted as HowTo JSON-LD for procedural articles. */
  howTo?: KCHowTo;
  /** Engineering decision guide — rendered as interactive decision tree. */
  decisionGuide?: KCDecisionGuide;
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
  /** Documented engineering misinterpretations of this standard's requirements or application. */
  commonMistakes?: string[];
  // ── Phase 6G: GEO + SEO Hardening ───────────────────────────────────────
  /** Frequently Asked Questions about this standard — rendered + FAQPage JSON-LD. */
  faqs?: KCFaqItem[];
  /** Authoritative engineering references for this standard. */
  engineeringReferences?: KCEngineeringReference[];
}

export interface KCTechnology {
  slug: string;
  name: string;
  domain: string;
  tagline: string;
  engineeringPrinciple: string;
  selectionGuidance: string;
  evidenceBoundary: string;
  contamination: string[];
  performanceSpecs: { label: string; value: string }[];
  standards: string[];
  relatedSystems: string[];
  relatedIndustries: string[];
  worksWith: string[];
  image?: string;
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

// ── Phase 6G: GEO + SEO Hardening — Supporting Interfaces ────────────────────

export interface KCEeat {
  reviewerName: string;
  reviewerTitle: string;
  organization: string;
  lastReviewDate: string;          // ISO date e.g. "2026-06-15"
  nextReviewDate: string;
  discipline: string;              // e.g. "Fluid Power Engineering"
  standards: string[];             // governing standard codes
  contentLevel: 'introductory' | 'intermediate' | 'advanced' | 'expert';
  contentType: 'technical-article' | 'case-study' | 'reference' | 'procedure' | 'analysis';
  version: string;                 // e.g. "2.1"
  evidenceBase: string;            // source evidence summary
}

export interface KCFaqItem {
  question: string;
  answer: string;
}

export interface KCEngineeringReference {
  category: 'standard' | 'specification' | 'research' | 'handbook' | 'regulation' | 'test-method';
  citation: string;
  relevance: string;
}

export interface KCHowToStep {
  name: string;
  text: string;
  tool?: string;
  supply?: string;
}

export interface KCHowTo {
  name: string;
  description: string;
  totalTime?: string;   // ISO 8601 duration e.g. "PT2H"
  supply?: string[];
  tool?: string[];
  steps: KCHowToStep[];
}

export interface KCDecisionNode {
  id: string;
  question: string;
  yes?: string;          // next node ID on yes
  no?: string;           // next node ID on no
  result?: string;       // terminal node — recommendation text
  note?: string;         // engineering note
}

export interface KCDecisionGuide {
  title: string;
  description: string;
  startNode: string;
  nodes: KCDecisionNode[];
}

// ── COMPARISON TYPES ─────────────────────────────────────────────────────────

export interface KCComparisonDimension {
  dimension:        string;             // what is being compared (e.g. "Efficiency expression")
  optionA:          string;             // value / description for option A
  optionB:          string;             // value / description for option B
  engineeringNote?: string;             // clarification when interpretation is non-obvious
}

export interface KCComparisonOption {
  id:                  string;          // 'A' or 'B' used internally
  label:               string;          // short name (e.g. "Beta Ratio")
  description:         string;          // one-paragraph engineering definition
  advantages:          string[];        // factual engineering advantages
  limitations:         string[];        // factual engineering limitations
  typicalApplications: string[];        // real-world contexts where this option is used
}

export interface KCComparisonWhenClause {
  option:     'A' | 'B';
  conditions: string[];                 // concrete operational conditions that trigger this choice
}

export type KCComparisonCategory =
  | 'standards'
  | 'technology'
  | 'system'
  | 'test-method';

export interface KCComparison {
  // ── Core identity ──────────────────────────────────────────────────────────
  id:                     string;       // COMP-xxx permanent graph ID
  slug:                   string;       // URL slug
  title:                  string;       // "Beta Ratio vs. Filtration Efficiency"
  subtitle:               string;       // one-line context
  category:               KCComparisonCategory;
  // ── Engineering specification ──────────────────────────────────────────────
  engineeringObjective:   string;       // what decision this comparison informs
  comparisonScope:        string;       // what is and is not covered
  governingStandards:     string[];     // ISO/ASTM/SAE codes that define the compared entities
  optionA:                KCComparisonOption;
  optionB:                KCComparisonOption;
  matrix:                 KCComparisonDimension[];
  engineeringImplications: string[];    // consequences of choosing incorrectly
  whenToUse:              KCComparisonWhenClause[];
  whenNotToUse:           KCComparisonWhenClause[];
  // ── Graph relationships ────────────────────────────────────────────────────
  relatedStandards:       string[];     // standard slugs
  relatedTechnologies:    string[];     // technology display names
  relatedSystems:         string[];     // system slugs
  relatedTerms:           string[];     // glossary term slugs
  relatedArticles:        string[];     // article slugs
  // ── Revision ──────────────────────────────────────────────────────────────
  revisionHistory:        { version: string; date: string; changes: string }[];
}
