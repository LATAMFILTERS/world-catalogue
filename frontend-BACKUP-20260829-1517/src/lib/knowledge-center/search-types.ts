/**
 * search-types.ts
 * ELIMFILTERS Knowledge Center — Engineering Search Types
 *
 * Phase 6E: Engineering Search
 *
 * Covers all 8 primary entity types from Phase 6D plus industries and problems
 * (carried forward from the pre-existing search page).
 *
 * Dependency: none
 */

// ── Entity types ──────────────────────────────────────────────────────────────

export type KCSearchEntityType =
  | 'article'
  | 'standard'
  | 'technology'
  | 'term'
  | 'system'
  | 'diagram'
  | 'calculator'
  | 'comparison'
  | 'industry'
  | 'problem';

// ── Search document (index record) ────────────────────────────────────────────

/**
 * Flat document representation used for search scoring.
 * Built once at module scope from all KC registries.
 */
export interface KCSearchDocument {
  /** Unified key — same format as KCNodeKey in recommendation engine. */
  id:        string;
  type:      KCSearchEntityType;
  slug:      string;
  /** Primary display name (title / standard code / term). */
  label:     string;
  /**
   * Machine-readable code for standards and calculators.
   * Receives the highest scoring weight on exact/prefix match.
   * Examples: 'ISO 16889', 'ASTM D6304', 'SAE J1539'
   */
  code?:     string;
  /** One-line context: subtitle, tagline, scope, or first-sentence definition. */
  subtitle:  string;
  /** Domain, category, or classification (e.g. 'Engineering', 'Air Intake Protection'). */
  domain?:   string;
  /**
   * All additional searchable strings: keywords, aliases, standard codes referenced,
   * technology names, contamination types, challenges, abbreviations.
   */
  keywords:  string[];
  href:      string;
  /**
   * Number of graph edges in the recommendation graph.
   * Used for graph-density weighting — more-connected entities rank higher
   * when textual scores are close.
   */
  edgeCount: number;
}

// ── Match ─────────────────────────────────────────────────────────────────────

export type KCMatchField = 'code' | 'label' | 'subtitle' | 'domain' | 'keyword';

export interface KCSearchMatch {
  field:   KCMatchField;
  value:   string;     // the text that matched (for display in explanation)
  score:   number;
  exact:   boolean;    // true = exact match; false = prefix or contains
}

// ── Result ────────────────────────────────────────────────────────────────────

export interface KCSearchResult {
  document:    KCSearchDocument;
  /** Total score: text score + graph density bonus. */
  score:       number;
  /** Matches that contributed to the score, highest first. */
  matches:     KCSearchMatch[];
  /** Points added from graph-density weighting (edgeCount × weight, capped). */
  graphBonus:  number;
}

// ── Filter ────────────────────────────────────────────────────────────────────

export type KCSearchFilter = KCSearchEntityType | 'all';
