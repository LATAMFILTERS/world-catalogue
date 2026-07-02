# Implementation Plan
## Engineering Decision Engine — Integration with Engineering Services Layer
### Version 1.0 | Ratified: 2026-07-01 | Status: FROZEN

---

## Document Control

| Field | Value |
|---|---|
| Document | IMPLEMENTATION_PLAN |
| Version | 1.0 |
| Status | FROZEN — Governing Architecture |
| Ratified | 2026-07-01 |
| Authority | Subordinate to ENGINEERING_DECISION_ENGINE v1.0 |
| Scope | Integration specifications for the Decision Engine with the existing Engineering Services layer |

---

## Architecture Position

The Decision Engine is implemented as a layer between the Engineering Foundation (Knowledge Graph + Engineering Services) and the Experience Layer (pages, components, AI assistant responses).

```
ENGINEERING FOUNDATION
    │  Knowledge Graph (entity relationships)
    │  Engineering Services (synchronous query functions)
    │
    ▼
DECISION ENGINE LAYER          ← this document governs implementation
    │  EvaluationOrchestrator
    │  EvidenceInventory
    │  InferenceAudit
    │  ConfidenceCalculator
    │  RecommendationComposer
    │
    ▼
EXPERIENCE LAYER
    │  Pages / Components
    │  EngineeringRecommendationsSection
    │  AI assistant response generation
    │
    ▼
CUSTOMER
```

The Decision Engine layer is additive. It does not replace Engineering Services. It consumes Engineering Services output and applies the evaluation model before passing results to the Experience Layer.

---

## Implementation Principles

### Principle 1 — No Modification to Engineering Services

Engineering Services (`@/lib/services`) are the governed access layer to the Knowledge Graph. The Decision Engine reads from services. It does not modify service implementations.

If the Decision Engine evaluation reveals that a service function is missing (e.g., a required evidence category cannot be retrieved), this is documented as an Evidence Gap, not fixed by modifying the service directly. Service extensions require a separate Engineering Decision Record.

### Principle 2 — Evaluation Is Synchronous

All six evaluation steps are synchronous. The Decision Engine does not introduce async operations. The existing Engineering Services are synchronous; evaluation must remain synchronous to preserve build-time generation compatibility with Next.js static export.

### Principle 3 — No Hardcoded Engineering Content

The Decision Engine evaluation references entity IDs and calls service functions. It does not contain hardcoded text about contamination modes, failure mechanisms, standards, or technology capabilities. All such content resides in the Foundation and is retrieved via services.

### Principle 4 — Confidence Level Is Immutable Once Assigned

Once the Decision Engine assigns a confidence level to an evaluation, that level is passed to the Experience Layer unchanged. The Experience Layer renders it. It does not upgrade it, hide it, or apply conditions to its display.

---

## Component Specifications

### EvaluationOrchestrator

**File:** `@/lib/decision-engine/EvaluationOrchestrator.ts`

**Purpose:** Executes the six evaluation steps in sequence. Manages step inputs and outputs. Returns a structured EvaluationResult.

**Interface:**
```typescript
interface EvaluationInput {
  customerStatement: string;
  journeyContext?: {
    assetType?: string;
    industry?: string;
    operatingEnvironment?: string;
    priorSymptoms?: string[];
    priorCleanlinessCodes?: string[];
  };
  sessionContext?: EvaluationResult[];  // Prior steps in this consultation
}

interface EvaluationResult {
  evaluationId: string;
  timestamp: string;
  step1: QuestionUnderstandingResult;
  step2: KnowledgeCoverageResult;
  step3: EvidenceAvailabilityResult;
  step4: InferenceDetectionResult;
  step5: ConfidenceAssessmentResult;
  step6: DecisionResult;
  recommendation: RecommendationComposition | null;
}

function evaluate(input: EvaluationInput): EvaluationResult;
```

**Behavior:**
- Executes steps 1–6 in sequence
- If any step returns a FAIL or STOP, halts execution at that step
- Records the halt reason and the required response in the EvaluationResult
- Does not skip, merge, or reorder steps under any condition

---

### EvidenceInventory

**File:** `@/lib/decision-engine/EvidenceInventory.ts`

**Purpose:** Assembles the evidence inventory for Step 3 by querying Engineering Services for each category.

**Interface:**
```typescript
interface EvidenceItem {
  category: EvidenceCategory;    // 1–10
  availability: 'PRESENT' | 'PARTIAL' | 'ABSENT' | 'KNOWN' | 'UNKNOWN' | 'MAPPED' | 'INFERABLE' | 'CORRELATED' | 'UNCORRELATED' | 'N/A';
  sourceEntityIds: string[];     // Which entities provided this evidence
  content: string | null;        // Summary of evidence content, if available
  limitingFactors: string[];     // Why availability is PARTIAL or ABSENT
}

interface EvidenceInventoryResult {
  domain: ContaminationDomain;
  intentClass: IntentClass;
  categories: EvidenceItem[];    // All 10 categories
  completenessScore: number;     // 0–100 per CONFIDENCE_SCORING_MODEL
  minimumThresholdMet: boolean;  // Per EVIDENCE_REQUIREMENTS
  minimumFloorMet: boolean;      // Per EVIDENCE_REQUIREMENTS
}

function buildInventory(
  intentClass: IntentClass,
  domain: ContaminationDomain,
  context: EvaluationInput
): EvidenceInventoryResult;
```

**Service queries used:**
- `recommendFromContamination(entityId)` — retrieves contamination → technology chains (Categories 5, 6)
- `recommendFromTechnology(entityId)` — retrieves technology → standard chains (Categories 2, 3, 4)
- `recommendFromPrinciple(entityId)` — retrieves principle → application chains (Category 1)
- `recommendFromFailureMode(entityId)` — retrieves failure mode → prevention chains (Categories 5, 10)

---

### InferenceAudit

**File:** `@/lib/decision-engine/InferenceAudit.ts`

**Purpose:** Audits claims in a draft recommendation for inference type. Returns an audit record per claim.

**Interface:**
```typescript
type InferenceType = 'DIRECT' | 'SUPPORTED' | 'EXTENDED' | 'SPECULATIVE';

interface ClaimAudit {
  claim: string;
  inferenceType: InferenceType;
  evidenceCategories: EvidenceCategory[];
  disclosureRequired: boolean;
  disclosureText: string | null;
  permitted: boolean;
}

interface InferenceAuditResult {
  claims: ClaimAudit[];
  allPermitted: boolean;
  speculativeCount: number;
  extendedCount: number;
  adjustment: number;           // Score adjustment per CONFIDENCE_SCORING_MODEL
}

function auditClaims(
  draftClaims: string[],
  evidenceInventory: EvidenceInventoryResult
): InferenceAuditResult;
```

---

### ConfidenceCalculator

**File:** `@/lib/decision-engine/ConfidenceCalculator.ts`

**Purpose:** Calculates confidence level from evidence inventory and inference audit per CONFIDENCE_SCORING_MODEL.

**Interface:**
```typescript
type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

interface ConfidenceCalculationResult {
  rawScore: number;
  adjustedScore: number;
  adjustment: number;
  confidenceLevel: ConfidenceLevel;
  hardFloorApplied: string | null;   // Which hard floor rule triggered, if any
  limitingFactors: string[];          // What prevented higher confidence
  upgradeRequirements: string[];      // What evidence would upgrade to next level
}

function calculateConfidence(
  intentClass: IntentClass,
  evidenceInventory: EvidenceInventoryResult,
  inferenceAudit: InferenceAuditResult
): ConfidenceCalculationResult;
```

---

### RecommendationComposer

**File:** `@/lib/decision-engine/RecommendationComposer.ts`

**Purpose:** Composes the final recommendation structure when Step 6 permits it (HIGH or MEDIUM confidence). Returns null for LOW or UNKNOWN.

**Interface:**
```typescript
interface RecommendationComposition {
  engineeringStatement: string;
  evidenceChain: string[];
  confidenceDeclaration: string;
  confidenceLevel: ConfidenceLevel;
  technologyRecommendations: TechnologyRecommendation[];
  productRecommendations: ProductRecommendation[];    // Empty if no product match
  implementationGuidance: string;
  disclosures: ClaimDisclosure[];    // EXTENDED inference disclosures
  scopeStatement: string;
  diagnosticQuestions: string[];     // Only populated for LOW; empty for HIGH/MEDIUM
}

interface TechnologyRecommendation {
  technologyEntityId: string;        // e.g. 'TECH-NANOFORCE'
  technologyName: string;
  operatingPrinciple: string;
  contaminationTarget: string;
  performanceSpec: string;
  applicableStandard: string;
}

function compose(
  evaluationResult: EvaluationResult,
  confidenceResult: ConfidenceCalculationResult,
  evidenceInventory: EvidenceInventoryResult,
  inferenceAudit: InferenceAuditResult
): RecommendationComposition | null;
```

---

## Integration with EngineeringRecommendationsSection

The existing `EngineeringRecommendationsSection` component renders the output of Engineering Services directly. In the Decision Engine integration, it is extended to optionally render an `EvaluationResult` alongside the `RecommendationResult`.

**Integration approach:**

The Decision Engine is invoked before `EngineeringRecommendationsSection` renders. The evaluation result is passed as a prop. The component renders:
1. The confidence level declaration
2. The engineering statement
3. The evidence chain summary
4. The technology and product recommendations (from `RecommendationComposition`)
5. Any disclosures (EXTENDED inferences)

The existing `RecommendationPanel` and `EngineeringMemoryPanel` components remain unchanged. They render output from Engineering Services. The Decision Engine adds a governance layer before rendering, not a replacement of the rendering components.

**Extended prop signature:**
```typescript
interface EngineeringRecommendationsSectionProps {
  primaryEntityId: string;
  queryType: 'technology' | 'contamination' | 'failureMode' | 'principle';
  label?: string;
  maxRecommendations?: number;
  evaluationContext?: EvaluationInput;    // Optional; if provided, Decision Engine evaluates before rendering
}
```

When `evaluationContext` is not provided, the component behaves exactly as it does today — calling Engineering Services directly and rendering results. This maintains backward compatibility with all nine pages that already use the component.

---

## Integration with Problem Diagnosis Page

The `/engineering/problem-diagnosis` page receives free-form customer input. This is the primary integration point for the full six-step evaluation.

**Implementation:**
1. Customer submits description via the existing diagnosis form
2. The `EvaluationOrchestrator.evaluate()` is called with the customer statement
3. The result is rendered in a structured response following RECOMMENDATION_GOVERNANCE sequence:
   - Engineering statement
   - Evidence chain
   - Confidence declaration
   - Technology recommendation (if HIGH or MEDIUM)
   - Product recommendation (if applicable)
   - Diagnostic questions (if LOW)
   - Explanation of knowledge gap (if UNKNOWN)

**Static export compatibility:** The problem diagnosis page uses client-side rendering. The Decision Engine, as a synchronous TypeScript library, is compatible with client-side invocation. No server-side API is required.

---

## Integration with Engineering Topic Pages

The three existing engineering topic pages (dust ingestion, hydraulic contamination, diesel water contamination) present content organized around the 10-point architecture. The Decision Engine integration adds a governed recommendation at section 07 (Recommended Products).

**Approach:**
- Each topic page has a pre-computed `EvaluationInput` based on the page's primary entity
- The Decision Engine evaluates this input at page load (synchronous, client-side)
- Section 07 renders the `RecommendationComposition` output
- The confidence level is displayed before any recommendation
- For topic pages with pre-defined entities (CONT-DUST-MINERAL, CONT-WATER-FUEL, CONT-WEAR-PARTICLE-HYD), the evaluation will typically produce HIGH confidence, as all Foundation evidence is available and well-documented

---

## Evaluation Persistence

Evaluation results are not persisted in a database in Phase 1. They are computed on-demand and held in React state for the duration of the session.

**Future phase:** Evaluation results may be stored for:
- Engineering memory (Category 7 — prior observations for similar equipment)
- Consultation history for returning customers
- Pattern analysis for diagnostic question optimization

This is documented for future planning. It is not part of the current implementation scope.

---

## Testing Requirements

### Unit Tests (required before merge)

Each component is tested independently:
- `EvaluationOrchestrator`: Each of the six steps tested with pass/fail/partial inputs
- `EvidenceInventory`: Inventory assembly tested for each domain
- `InferenceAudit`: Each inference type classification tested
- `ConfidenceCalculator`: Score calculation tested for each intent class; hard floors verified
- `RecommendationComposer`: Output structure verified for HIGH, MEDIUM, null (LOW/UNKNOWN)

### Integration Tests (required before merge)

- End-to-end evaluation for one known request in each of the six contamination domains
- Verification that confidence level output is consistent across ten independent evaluations of the same input
- Verification that `EngineeringRecommendationsSection` renders correctly with and without `evaluationContext`

### Build Verification

The Decision Engine is a TypeScript library. TypeScript compilation must succeed with zero errors before any commit containing Decision Engine code.

---

## Phased Rollout

### Phase 1 — Library (current scope)

Implement the five components as TypeScript functions in `@/lib/decision-engine/`. No UI integration. Tested and verified independently.

### Phase 2 — Problem Diagnosis Integration

Integrate `EvaluationOrchestrator` with the `/engineering/problem-diagnosis` page. This is the highest-value integration point because it handles free-form customer input.

### Phase 3 — EngineeringRecommendationsSection Extension

Extend `EngineeringRecommendationsSection` to optionally accept `evaluationContext` and render governance-compliant output. No breaking changes to existing usages.

### Phase 4 — Topic Page Integration

Apply Decision Engine evaluation to the three existing topic pages at section 07. Confidence levels rendered visibly in the recommendation section.

### Phase 5 — Engineering Memory

Implement evaluation result persistence for engineering memory (Category 7 evidence accumulation). Requires database layer — outside current implementation scope.

---

## What This Plan Does Not Change

- Engineering Services (`@/lib/services`) — not modified
- Knowledge Graph entity definitions — not modified
- Foundation registries — not modified
- Existing `EngineeringRecommendationsSection` behavior without `evaluationContext` — not changed
- `RecommendationPanel` and `EngineeringMemoryPanel` components — not changed
- Nine Knowledge System pages that already use `EngineeringRecommendationsSection` — not changed

This implementation is additive. The Decision Engine is a layer that can be applied incrementally to governed interactions. It does not replace existing functionality — it governs how new interactions are evaluated before reaching the customer.

---

## Citation Reference

```
CANONICAL GOVERNANCE BLOCK: Implementation Plan

DOCUMENT
Implementation Plan v1.0

PURPOSE
Defines the integration architecture for the Engineering Decision Engine
with the existing Engineering Services layer and Experience Layer.

APPROACH
Additive layer — does not modify Engineering Services, Knowledge Graph,
or Foundation registries. Implemented as five TypeScript components.
Full backward compatibility with existing EngineeringRecommendationsSection usage.

PHASED ROLLOUT
Phase 1: TypeScript library implementation and testing
Phase 2: Problem Diagnosis page integration
Phase 3: EngineeringRecommendationsSection extension
Phase 4: Topic page recommendation governance
Phase 5: Engineering Memory persistence (future)

CONSTRAINTS
Synchronous execution only (static export compatibility)
No hardcoded engineering content in Decision Engine components
Confidence level immutable after Step 5 assignment

CITATION_REFERENCE
source: elimfilters-vault/decision-engine/IMPLEMENTATION_PLAN.md
document: Implementation Plan
version: 1.0
ratified: 2026-07-01
status: FROZEN
```
