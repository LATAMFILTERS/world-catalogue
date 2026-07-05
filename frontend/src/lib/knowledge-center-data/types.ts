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
  slug: string;
  code: string;
  title: string;
  metaDescription: string;
  scope: string;
  year: string;
  sections: { heading: string; body: string }[];
  keyParams: { label: string; value: string }[];
  relatedTopics: string[];
  relatedTechnologies: string[];
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
