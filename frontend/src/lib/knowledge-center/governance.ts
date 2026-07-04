/**
 * governance.ts
 * ELIMFILTERS Engineering Knowledge Platform — KC-00 Governance Layer
 *
 * Defines the structural governance model for all entities on the platform.
 * Every article, standard, technology, problem, and terminology entry must
 * satisfy these constraints from the moment it is created.
 *
 * Architecture reference: KC-PLAN-002 v1.1 — KC-00 Knowledge Governance
 */

// ── Permanent Identifier System ──────────────────────────────────────────────
// Every entity receives a permanent, collision-free identifier at creation.
// URLs may change. Identifiers never do. No identifier is ever reused or deleted.

export type EntityPrefix =
  | 'STD'     // Engineering Standards     STD-ISO-16889
  | 'TECH'    // Technologies              TECH-MACROCORE
  | 'SYS'     // Protection Systems        SYS-AIR-INTAKE
  | 'FAM'     // Product Families          FAM-PRIMARY-AIR
  | 'PROB'    // Engineering Problems      PROB-ABRASIVE-WEAR
  | 'COMP'    // Equipment Components      COMP-TURBOCHARGER
  | 'IND'     // Industries                IND-MINING
  | 'ARTICLE' // Knowledge Articles        ARTICLE-ISO-16889
  | 'TERM'    // Terminology Registry      TERM-BETA-RATIO
  | 'EVID';   // Evidence Sources          EVID-ISO-16889-2022

export type PermanentId = `${EntityPrefix}-${string}`;

// ── Entity Status ────────────────────────────────────────────────────────────
// Governs which content participates in AI retrieval and public navigation.
// Only 'published' entities with authorityScore >= 50 appear in AI responses.

export type EntityStatus =
  | 'draft'                // Created, not yet reviewed. Excluded from all systems.
  | 'technical-review'     // Awaiting engineering review. Excluded from public.
  | 'engineering-approved' // Technically correct. Ready for publication.
  | 'published'            // Live. Participates in AI retrieval and navigation.
  | 'superseded'           // Newer version exists. Retained for citation continuity.
  | 'deprecated'           // Technically outdated. Historical record only.
  | 'archived';            // Removed from active platform. Permanent ID retained.

// ── Entity Version ───────────────────────────────────────────────────────────

export interface EntityVersion {
  version: string;           // "1.0" | "1.1" | "2.0"
  status: EntityStatus;
  date: string;              // ISO 8601
  supersededBy?: PermanentId;
  changeNote?: string;
}

// ── Evidence Governance ──────────────────────────────────────────────────────
// Every technical claim traces to a registered evidence source.
// Expired evidence reduces Authority Score and flags the article for review.

export type EvidenceAuthorityLevel = 'primary' | 'secondary' | 'supporting';
export type EvidenceConfidence = 'high' | 'medium' | 'low';

export interface EvidenceGovernance {
  id: PermanentId;                      // EVID-ISO-16889-2022
  authorityLevel: EvidenceAuthorityLevel;
  confidence: EvidenceConfidence;
  publicationDate: string;              // ISO 8601
  lastValidated: string;                // ISO 8601
  expiryDate?: string;                  // ISO 8601 — triggers review task when passed
  reviewTask?: string;                  // auto-generated at expiry
}

// ── Terminology Entry ─────────────────────────────────────────────────────────
// One registry, one definition per term.
// Articles reference TERM-xxx identifiers, never write inline definitions.

export interface TerminologyEntry {
  id: PermanentId;            // TERM-BETA-RATIO
  term: string;               // "Beta Ratio"
  definition: string;         // Single authoritative definition — exists nowhere else
  aliases: string[];          // ["ß ratio", "filtration ratio", "Beta-x"]
  applicableStandards: PermanentId[];
  relatedTerms: PermanentId[];
  version: string;
  status: EntityStatus;
  lastReviewed: string;       // ISO 8601
}

// ── Knowledge Lifecycle ───────────────────────────────────────────────────────
// Every governed entity records its full lifecycle.
// nextReviewDue is computed: lastReviewed + reviewFrequency.
// When nextReviewDue passes, a review task is generated automatically.

export type ReviewFrequency =
  | 'monthly'
  | 'quarterly'
  | 'semi-annual'
  | 'annual'
  | 'biennial';

export interface KnowledgeLifecycle {
  created: string;                  // ISO 8601
  lastReviewed: string;             // ISO 8601
  reviewFrequency: ReviewFrequency;
  nextReviewDue: string;            // ISO 8601 — computed
  responsibleOwner: string;         // Team role, e.g. "Hydraulics Engineer"
  reviewStatus: EntityStatus;
  approvers?: string[];             // Future enterprise: approval quorum
}

// ── Engineering Quality Score ─────────────────────────────────────────────────
// 8-dimensional, 0–100. Computed at build time. Used for AI retrieval ranking.
// Score thresholds:
//   85–100 → Authoritative (cited with high confidence, preferred AI result)
//   70–84  → Established (standard confidence, primary results)
//   50–69  → Developing (flagged in AI context, lower ranking)
//   < 50   → Draft (excluded from AI retrieval entirely)

export interface EngineeringQualityScore {
  engineeringAccuracy: number;    // 0–25: technical correctness, precision of claims
  evidenceStrength: number;       // 0–20: authority level and recency of EVID-xxx sources
  standardsCoverage: number;      // 0–15: completeness of STD-xxx citations
  graphCompleteness: number;      // 0–15: relationship density (TECH, PROB, COMP, IND links)
  freshness: number;              // 0–10: recency of last engineering review
  editorialQuality: number;       // 0–5:  writing quality, TERM-xxx compliance
  aiReadiness: number;            // 0–5:  EDL completeness, aiQueryPatterns populated
  governanceCompliance: number;   // 0–5:  PermanentId refs valid, lifecycle complete
  total: number;                  // 0–100 (sum of all dimensions)
}

// ── Enterprise Readiness ──────────────────────────────────────────────────────
// Audience targeting, regional variants, OEM-specific content, private spaces.
// These fields are optional today and additive — no content rewrite required
// when audience targeting is activated. Engineering definitions exist once.

export type Audience   = 'public' | 'dealer' | 'customer' | 'oem' | 'internal';
export type Visibility = 'public' | 'protected' | 'private';

export interface EnterpriseConfig {
  audience: Audience[];
  visibility: Visibility;
  regions?: string[];         // ISO 3166-1 alpha-2 codes (e.g. ['US', 'DE', 'BR'])
  oemIds?: string[];          // OEM partner identifiers
  tenantId?: string;          // Customer-specific knowledge space
  approvalRequired: boolean;
  approvers?: string[];       // Reviewer identities for approval quorum
}

// ── Hierarchy Level ───────────────────────────────────────────────────────────
// KC-10 Engineering Authority Hierarchy — 7 levels.
// Level 1 is most authoritative (Principles). Level 7 is terminal (Products).
// Navigation, internal link direction, schema type, and AI retrieval priority
// all follow this hierarchy.

export type HierarchyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const HIERARCHY_LABELS: Record<HierarchyLevel, string> = {
  1: 'Engineering Principles',   // Physics and chemistry of contamination
  2: 'Engineering Standards',    // ISO, SAE, ASTM test methods
  3: 'Failure Mechanisms',       // Root cause chains
  4: 'Protection Systems',       // Air Intake, Fuel, Hydraulic, Lubrication, Cooling
  5: 'Technologies',             // MACROCORE, NANOFORCE, SYNTRAX, etc.
  6: 'Product Families',         // Primary Air, Oil Filters, Hydraulic Filters, etc.
  7: 'Commercial Products',      // Individual SKUs — terminal recommendation only
};

// ── Authority Score Thresholds ────────────────────────────────────────────────

export const AUTHORITY_THRESHOLDS = {
  AUTHORITATIVE: 85,  // Cited with high confidence, preferred AI result
  ESTABLISHED: 70,    // Standard confidence, primary results
  DEVELOPING: 50,     // Flagged in AI context, lower ranking
  DRAFT: 0,           // Excluded from AI retrieval
} as const;

// ── Validation Status ─────────────────────────────────────────────────────────
// Tracks position in the Engineering Review Workflow.

export type ValidationStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'outdated';
