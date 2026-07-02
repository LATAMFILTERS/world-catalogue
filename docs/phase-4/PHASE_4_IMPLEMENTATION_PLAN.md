# PHASE 4 IMPLEMENTATION PLAN
## ELIMFILTERS Engineering Intelligence Platform

---

## Prerequisites (All Complete)

- [x] Phase 1 — Engineering Foundation (FROZEN)
- [x] Phase 2 — Knowledge Graph Core (94 nodes, 185 relationships)
- [x] Phase 3 — Engineering Services (21/21 checks passing)
- [x] Phase 4 Architecture Documents (this set)

---

## Implementation Sequence

Phase 4 is implemented in 7 milestones in strict order.
No milestone begins until the previous one passes validation.

---

## Milestone 1 — Experience Component Library

**Objective:** Build the 15 reusable engineering components. No pages yet.

**Deliverables:**

```
frontend/src/components/engineering/
  EngineeringSearchBar.tsx        (C-01)
  AssetSelector.tsx               (C-02)
  ProblemExplorer.tsx             (C-03)
  FailureModeCard.tsx             (C-04)
  ContaminationCard.tsx           (C-05)
  TechnologyCard.tsx              (C-06)
  EngineeringPrincipleCard.tsx    (C-07)
  RecommendationPanel.tsx         (C-08)
  CitationPanel.tsx               (C-09)
  EngineeringMemoryPanel.tsx      (C-10)
  ProvenancePanel.tsx             (C-11)
  ProtectionSystemExplorer.tsx    (C-12)
  StandardCard.tsx                (C-13)
  EngineeringReasoningChain.tsx   (C-14)
  JourneyProgressBar.tsx          (C-15)
  index.ts                        (barrel)
```

**Validation checklist:**
- [ ] All 15 components created
- [ ] No component imports from `@/lib/registry/*` or `@/lib/graph/*`
- [ ] All components import only from `@/lib/services`
- [ ] RecommendationPanel renders empty state (not recommendation) when steps.length === 0
- [ ] EngineeringMemoryPanel renders nothing when no memory exists (no empty state shown)
- [ ] TypeScript: 0 errors
- [ ] Build: 0 errors

**Estimated scope:** 15 components × average 80 lines = ~1,200 lines of TSX

---

## Milestone 2 — Enhanced Home Engineering Flow

**Objective:** Transform the homepage from product catalogue to engineering entry.
The Home must answer: "What is putting your operation at risk?"

**Rule:** Do NOT redesign visually. Redesign the flow.

**Changes to `frontend/src/app/page.tsx`:**

```
CURRENT HOME FLOW:
  Hero → Products → Technologies → Industries → CTA

TARGET HOME FLOW:
  Hero (intent question) → 4 Journey Entry Points → Brief Engineering Context → Products (below the fold)
```

**Specific additions:**

```
SECTION: Engineering Entry Matrix
  - 4 journey cards in 2×2 grid:
    [1] I know my part number    → /search?intent=part
    [2] Protect my equipment     → /journey/protect
    [3] I have a problem         → /journey/diagnose
    [4] I want to learn          → /knowledge-system
  - Each card: icon + label + 1-line description + arrow
  - No product names in this section

SECTION: Live Search Bar (above the fold)
  - C-01 EngineeringSearchBar embedded in hero
  - Placeholder: "Part number, equipment, problem, or technology..."
  - Intent detection active

SECTION: Engineering Context (brief, already exists partially)
  - Asset Protection Layer narrative (already implemented, Phase 3)
  - Keep as-is, no changes

SECTION: Products (below the fold, unchanged)
  - Existing product grid retained
  - Now appears AFTER engineering entry points
```

**Validation checklist:**
- [ ] 4 journey entry points visible above the fold on desktop
- [ ] Search bar functional (calls Engineering Services)
- [ ] Products section still present but below engineering content
- [ ] No product names in the hero section
- [ ] TypeScript: 0 errors
- [ ] Build: 0 errors
- [ ] Mobile: journey cards stack vertically, all accessible

---

## Milestone 3 — Engineering Search Experience

**Objective:** Multi-intent search with explainable results.

**New/modified files:**

```
frontend/src/app/search/page.tsx           (new — search results page)
frontend/src/app/api/search/route.ts       (new — optional server action)
```

**Search results page sections:**

```
1. SEARCH BAR (C-01 EngineeringSearchBar)
   - Pre-populated with query from URL params
   - Intent badge shown

2. INTENT EXPLANATION
   - "Searching for: [detected intent label]"
   - "Results explain why they match your query"

3. RESULTS LIST
   Each result renders:
   - Entity type chip (color-coded by type)
   - Label + entityId
   - Score bar (0–100)
   - Matched fields: "Matched on: name, technologyName"
   - Excerpt: first matched text snippet
   - [Explore →] link to entity page

4. GROUPED RESULTS (optional, if results span types)
   Group by entityType with count badge per group

5. NO RESULTS STATE
   - "No matches for [query]"
   - Suggestions: "Try: [related search terms]"
   - Link to ProblemExplorer (Journey 3)
```

**Validation checklist:**
- [ ] Search detects intent from query shape (7 intent types)
- [ ] Every result shows matchedFields and excerpt
- [ ] Score bar renders proportionally to score (0–100)
- [ ] Empty query → empty results (no error)
- [ ] Unknown query → graceful no-results state
- [ ] TypeScript: 0 errors

---

## Milestone 4 — Generated Explorer Pages (63 pages)

**Objective:** Generate one page per graph node for 6 entity types.

**New route structure:**

```
frontend/src/app/engineering/
  technologies/
    [entityId]/
      page.tsx     (GP-1 template)
  principles/
    [entityId]/
      page.tsx     (GP-2 template)
  failure-modes/
    [entityId]/
      page.tsx     (GP-3 template)
  contamination/
    [entityId]/
      page.tsx     (GP-4 template)
  standards/
    [entityId]/
      page.tsx     (GP-5 template)
  media/
    [entityId]/
      page.tsx     (GP-6 template)
```

**Implementation approach:**

Each `page.tsx` is a template with `generateStaticParams()` that:
1. Calls `loadGraph()` at build time
2. Returns one route per node of the correct entity type
3. Receives `entityId` as a param
4. Calls Engineering Services to populate all sections

```typescript
// Example: technologies/[entityId]/page.tsx

import { loadGraph, findById, recommendFromTechnology,
         getEntityProvenance, getMemoryFor, buildAIContext } from '@/lib/services';
import { traverse } from '@/lib/graph/graph-traversal';
import { TechnologyCard, RecommendationPanel, ... } from '@/components/engineering';

export function generateStaticParams() {
  const graph = loadGraph();
  return Array.from(graph.nodes.values())
    .filter(n => n.entityType === 'TECHNOLOGY_ARCHITECTURE')
    .map(n => ({ entityId: n.entityId }));
}

export default function TechnologyPage({ params }: { params: { entityId: string } }) {
  const node = findById(params.entityId);
  if (!node) return notFound();
  const recommendations = recommendFromTechnology(params.entityId);
  const provenance = getEntityProvenance(params.entityId);
  const memory = getMemoryFor(params.entityId);
  const context = buildAIContext(params.entityId, 1);
  // ... render sections
}
```

**Validation checklist:**
- [ ] 63 pages generated (12 + 12 + 9 + 8 + 12 + 10)
- [ ] Each page includes all sections from GENERATED_PAGE_STRATEGY.md
- [ ] No engineering content hardcoded in any template
- [ ] Deprecated entities show deprecation banner
- [ ] Alias entities show redirect notice
- [ ] JSON-LD canonical block present on every page
- [ ] Plain-text RetrievalBlock present on every page
- [ ] TypeScript: 0 errors
- [ ] Build: 0 errors (63 new routes)

---

## Milestone 5 — Journey 2: Asset Protection Flow

**Objective:** Implement the guided multi-step Journey 2.

**New files:**

```
frontend/src/app/journey/protect/page.tsx      (entry + step router)
frontend/src/app/journey/protect/steps/
  AssetSelectionStep.tsx
  RiskAssessmentStep.tsx
  FailureModeStep.tsx
  ContaminationStep.tsx
  TechnologyStep.tsx
  ProtectionSystemStep.tsx
  ProductsStep.tsx
```

**State management:**
- JourneyState stored in React context + sessionStorage
- Each step component receives state and dispatch
- Back navigation preserves all previous selections
- Journey completion stores recommendations in sessionStorage for product page context

**Validation checklist:**
- [ ] All 7 steps functional end-to-end
- [ ] Each step shows EngineeringReasoningChain (growing with each step)
- [ ] RecommendationPanel shown at Step 5 with full trace
- [ ] Products shown ONLY at Step 7 (final step)
- [ ] Journey state persists on page refresh (sessionStorage)
- [ ] Back navigation returns to previous step with preserved state
- [ ] TypeScript: 0 errors

---

## Milestone 6 — Journey 3: Problem Diagnosis Flow

**Objective:** Implement the guided multi-step Journey 3.

**New files:**

```
frontend/src/app/journey/diagnose/page.tsx
frontend/src/app/journey/diagnose/steps/
  ProblemDescriptionStep.tsx
  FailureModeIdentificationStep.tsx
  ContaminationRootCauseStep.tsx
  EngineeringPrincipleStep.tsx
  TechnologyArchitectureStep.tsx
  ProtectionMediaStep.tsx
  ProductsStep.tsx
```

**Key implementation detail:** Step 1 uses the ProblemExplorer component (C-03)
which calls `search(symptomText, { entityTypes: ['FAILURE_MODE'] })`. The symptom
text may be free-form — the search service handles matching.

**Validation checklist:**
- [ ] All 7 steps functional end-to-end
- [ ] Free-text symptom input produces ranked failure mode results
- [ ] Each result shows matchedFields and excerpt (WHY it matched)
- [ ] Cause chain displayed in Step 2 as numbered steps (not prose)
- [ ] Engineering Principle in Step 4 explains the physics (not marketing)
- [ ] Products in Step 7 show full engineering lineage from Step 1
- [ ] TypeScript: 0 errors

---

## Milestone 7 — Recommendation Experience Enhancement

**Objective:** Ensure all existing Knowledge System pages use RecommendationPanel
with full trace. Add recommendation panels to pages that currently show static content.

**Pages to enhance (existing):**

```
knowledge-system/standards/lube-oil-systems/page.tsx   → Add RecommendationPanel
knowledge-system/standards/air-intake-systems/page.tsx → Add RecommendationPanel
knowledge-system/standards/hydraulic-systems/page.tsx  → Add RecommendationPanel
knowledge-system/standards/fuel-systems/page.tsx       → Add RecommendationPanel
knowledge-system/standards/cabin-safety-systems/page.tsx → Add RecommendationPanel
knowledge-system/standards/compressed-air-systems/page.tsx → Add RecommendationPanel
knowledge-system/contamination/*/page.tsx              → Add RecommendationPanel
```

**For each page:**
1. Identify the primary entity (e.g., TECH-MACROCORE for air intake)
2. Call appropriate `recommendFrom*()` function
3. Render RecommendationPanel for top 3 recommendations
4. Each panel shows: explanation + confidence + step trace + citations

**Validation checklist:**
- [ ] RecommendationPanel present on all 9 enhanced pages
- [ ] No recommendation shown without RecommendationStep[] trace
- [ ] CitationPanel compact shown for each step citation
- [ ] EngineeringMemoryPanel shown when memory exists
- [ ] No hardcoded technology descriptions (all from graph)
- [ ] TypeScript: 0 errors
- [ ] Build: 0 errors

---

## Validation Suite (End of Phase 4)

Run all of these before Phase 4 is declared complete:

```bash
npm run validate:foundation    # 0 errors
npm run validate:services      # 21/21 pass
npm run type-check             # 0 errors
npm run build                  # 0 errors, all routes generated
```

Manual validation:
- [ ] Journey 1 (Part Number): Complete end-to-end in browser
- [ ] Journey 2 (Asset Protection): Complete end-to-end in browser
- [ ] Journey 3 (Problem Diagnosis): Complete end-to-end in browser
- [ ] Journey 4 (Learning): Navigate 3 entity pages in browser
- [ ] Search: 5 different query types return explainable results
- [ ] All 63 generated pages load without error
- [ ] All recommendation panels show step traces
- [ ] No page shows a product without preceding engineering context

---

## What Phase 4 Does NOT Include

- Chat interface / AI response generation (Phase 5)
- User accounts / saved journeys (Phase 5 or later)
- E-commerce checkout (separate system)
- New registry entries (Foundation is FROZEN)
- Visual redesign (not in scope — engineering flow only)
- Marketing content (not in scope — engineering content only)

---

## Phase 4 Completion Criteria

Phase 4 is complete when:

1. All 7 milestones pass their validation checklists
2. All 4 journeys complete end-to-end without errors
3. All 63 generated pages load with full engineering content
4. No component reads from registries directly
5. validate:foundation + validate:services + type-check + build all pass
6. PHASE 4 COMPLETION REPORT produced with verdict

Implementation does not begin until the 5 architecture documents are approved.
