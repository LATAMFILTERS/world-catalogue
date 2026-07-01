# ENGINEERING EXPERIENCE ARCHITECTURE
## ELIMFILTERS Engineering Intelligence Platform — Phase 4

---

## 1. Core Principle

The Engineering Experience Layer is the visual and interactive expression of the Knowledge Graph.

Every screen, every component, every interaction must answer:

1. What asset is being protected?
2. What risk exists?
3. Why does this happen?
4. Which Engineering Principle applies?
5. Which Technology Architecture solves it?
6. What evidence supports the solution?
7. Which products implement that technology?

This order is non-negotiable. It is the constitutional sequence of the platform.

---

## 2. Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│              ENGINEERING EXPERIENCE LAYER               │
│  (Phase 4 — this document)                              │
│                                                         │
│  Customer Journeys · Experience Components ·            │
│  Generated Pages · Search Experience ·                  │
│  Recommendation Experience                              │
└──────────────────────────┬──────────────────────────────┘
                           │ consumes exclusively
┌──────────────────────────▼──────────────────────────────┐
│                ENGINEERING SERVICES                      │
│  (Phase 3 — complete)                                   │
│                                                         │
│  search() · recommendFrom*() · citeEntity() ·          │
│  buildAIContext() · getEntityProvenance() ·             │
│  getGovernanceSummary()                                 │
└──────────────────────────┬──────────────────────────────┘
                           │ reads from
┌──────────────────────────▼──────────────────────────────┐
│                KNOWLEDGE GRAPH CORE                      │
│  (Phase 2 — complete)                                   │
│                                                         │
│  94 nodes · 185 relationships · 13 types                │
└──────────────────────────┬──────────────────────────────┘
                           │ built from
┌──────────────────────────▼──────────────────────────────┐
│               ENGINEERING FOUNDATION                     │
│  (Phase 1 — complete, FROZEN)                           │
│                                                         │
│  Registries · Types · Provenance · Version              │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Experience Entry Points

The platform provides four canonical entry points. Every page in the platform feeds into one or more of these.

### EP-1: Part Number Entry
The visitor knows exactly what they need. Fast path to cross-reference and engineering validation.

```
/search?intent=part   →  SearchBar (intent: PART_NUMBER)
```

### EP-2: Asset Protection Entry
The visitor wants to protect equipment. Begin with asset, traverse to risk, failure modes, technology.

```
/protect              →  AssetSelector  →  Journey 2
```

### EP-3: Problem Diagnosis Entry
The visitor has a visible problem right now. Begin with symptom, diagnose to root cause, resolve.

```
/diagnose             →  ProblemExplorer  →  Journey 3
```

### EP-4: Engineering Learning Entry
The visitor wants to understand filtration engineering. Begin with curiosity, build to conviction.

```
/knowledge-system     →  EngineeringIntelligenceHub  →  Journey 4
```

---

## 4. Page Taxonomy

All pages belong to one of four categories:

### 4.1 Hub Pages
Orchestrate entry points and direct visitors into journeys.
- `/` — Home (engineering flow, not product catalogue)
- `/protect` — Asset Protection Entry
- `/diagnose` — Problem Diagnosis Entry
- `/knowledge-system` — Engineering Intelligence Hub (already exists, Phase 4 enhances)

### 4.2 Explorer Pages
Generated from Knowledge Graph nodes. One page per entity.
- `/engineering/principles/[entityId]` — Engineering Principle
- `/engineering/technologies/[entityId]` — Technology Architecture
- `/engineering/failure-modes/[entityId]` — Failure Mode
- `/engineering/contamination/[entityId]` — Contamination
- `/engineering/standards/[entityId]` — Standard
- `/engineering/media/[entityId]` — Protection Media

### 4.3 Journey Pages
Guided multi-step experiences routing through the Knowledge Graph.
- `/journey/protect` — Journey 2: Asset Protection
- `/journey/diagnose` — Journey 3: Problem Diagnosis

### 4.4 Product Resolution Pages (Terminal)
Reached only after engineering reasoning is complete.
- `/products/[sku]` — Product page with full engineering context
- `/systems/[slug]` — Product system with engineering foundation

---

## 5. Data Flow Constraint

**Rule: No component may read from registries or graph directly.**

All data must flow through Engineering Services:

```
React Component
    ↓ calls
Engineering Services API  (search, recommend, cite, provenance, aiContext)
    ↓ reads
Knowledge Graph
    ↓ built from
Foundation Registries (FROZEN)
```

Any component that imports from `@/lib/registry/*` or `@/lib/graph/*` directly
is a Phase 4 architectural violation.

---

## 6. Engineering Reasoning Chain

Every experience page must render the engineering reasoning chain visibly to the visitor.

The chain is always:

```
ASSET  →  RISK  →  FAILURE MODE  →  CONTAMINATION
    →  ENGINEERING PRINCIPLE  →  TECHNOLOGY  →  PRODUCTS
```

No step may be skipped. No step may be invented. Every step must be traceable to a graph node.

---

## 7. Explainability Requirement

Every recommendation, suggestion, and search result must display:

- Source entity (nodeId + entityId)
- Relationship path that produced it (RecommendationStep[])
- Confidence level (HIGH / MEDIUM / LOW)
- Supporting standards (VALIDATES relationships)
- Citation traceability (FULL / PARTIAL / NONE)
- Engineering Memory if present (HAS_MEMORY relationships)

This is not optional UX polish. It is the platform's constitutional guarantee.

---

## 8. AI Experience Architecture (Reserved)

The AI interface is NOT built in Phase 4.

The architecture is defined here so Phase 5 implements correctly:

```
AI Request
    ↓
buildAIContext(entityId, depth)
    ↓ returns AIContextPackage
{
  nodes: AIContextNode[]
  relationships: AIContextRelationship[]
  citations: AIContextCitation[]
  engineeringMemory: AIContextNode[]
  summary: string
}
    ↓
Injected as system context into LLM call
    ↓
LLM Response (grounded, citable, traceable)
```

AI must never answer a filtration question without a populated AIContextPackage.
Hallucination prevention is architectural, not prompting-based.

---

## 9. Search Architecture

The search bar is the universal entry point across all journeys.

It must:
1. Accept any input (part number, equipment name, symptom, contamination, technology)
2. Detect intent automatically from query shape
3. Call `search(query, options)` from Engineering Services
4. Present results with engineering context, not just labels
5. Explain why each result is relevant (matchedFields, excerpt, score)

Intent detection rules (client-side heuristics, refined by search score distribution):

| Pattern | Detected Intent |
|---|---|
| `/^[A-Z]{2,3}-[A-Z0-9-]+$/` | ENTITY_ID |
| `/^(E[ALHCFSWTM][0-9]{5,})/` | PART_NUMBER |
| Keywords: "fail", "problem", "broke" | FAILURE_MODE |
| Keywords: "dust", "water", "particle" | CONTAMINATION |
| Keywords: "ISO", "SAE", "ASTM" | STANDARD |
| Keywords: "protect", "reduce", "wear" | TECHNOLOGY |
| Default | KEYWORD |

---

## 10. Generated Page Architecture

Explorer pages are generated at build time from Knowledge Graph nodes.

Each node type maps to a page template:

| Entity Type | Template | Route |
|---|---|---|
| ENGINEERING_PRINCIPLE | PrinciplePage | `/engineering/principles/[id]` |
| TECHNOLOGY_ARCHITECTURE | TechnologyPage | `/engineering/technologies/[id]` |
| FAILURE_MODE | FailureModePage | `/engineering/failure-modes/[id]` |
| CONTAMINATION | ContaminationPage | `/engineering/contamination/[id]` |
| STANDARD | StandardPage | `/engineering/standards/[id]` |
| PROTECTION_MEDIA | MediaPage | `/engineering/media/[id]` |

Each template receives:
- The primary node from `findById(entityId)`
- Traversal results from `traverse(graph, entityId, 2)`
- Recommendations from appropriate `recommendFrom*()` function
- Citations from `citeEntity(entityId, ...)`
- Provenance from `getEntityProvenance(entityId)`
- AI context from `buildAIContext(entityId, 1)`

No engineering content is written manually on these pages. All content derives from the graph.

---

## 11. Validation Requirements

Before any Phase 4 page ships, it must pass:

- [ ] Entry point is customer intent (asset / risk / problem / learn) — not product
- [ ] All data consumed via Engineering Services (no direct registry reads)
- [ ] Engineering reasoning chain visible and complete
- [ ] Every recommendation has RecommendationStep[] trace rendered
- [ ] Every cited fact has traceability level displayed
- [ ] Search results explain why they matched
- [ ] No engineering content duplicated in JSX (all from graph)
- [ ] TypeScript: 0 errors
- [ ] Build: 0 errors

---

## 12. Implementation Sequence

Phase 4 implementation proceeds in this order:

1. Experience Component Library (reusable, graph-driven components)
2. Enhanced Home — engineering flow, 4 entry points
3. Search Experience — multi-intent, explainable results
4. Explorer Pages — generated from graph nodes (6 entity types)
5. Journey Pages — guided multi-step flows (Journey 2 + Journey 3)
6. Recommendation Experience — explainable panels
7. Product Resolution — products as terminal engineering consequence

Implementation does not begin until this architecture document is approved.
