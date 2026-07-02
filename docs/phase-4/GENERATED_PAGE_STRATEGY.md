# GENERATED PAGE STRATEGY
## ELIMFILTERS Engineering Intelligence Platform — Phase 4

---

## Core Principle

Every engineering page in the platform is generated from the Knowledge Graph.

No engineering content is written manually in JSX or in static translation files.

The Knowledge Graph is the single source of truth. The page templates are the rendering layer.

---

## Why Generated Pages

**Without generated pages:**
- Engineering content in JSX → duplicates the graph → diverges over time
- Manual updates required across multiple files when knowledge changes
- No guarantee that a page reflects current graph state

**With generated pages:**
- Knowledge Graph updated once → all pages reflect it on next build
- Engineering content is traceable (provenance attached to every claim)
- New entities added to registries automatically produce new pages
- Zero manual engineering content in JSX

---

## Generated Page Types

### GP-1: Technology Architecture Pages

**Route:** `/engineering/technologies/[entityId]`
**Source:** TECHNOLOGY_ARCHITECTURE nodes (12 current)
**Generation:** Static (Next.js generateStaticParams)

**Page sections (all from graph):**

```
1. TECHNOLOGY HEADER
   Source: node.properties.technologyName
           node.properties.systemDomain
   
2. CANONICAL DEFINITION
   Source: node.properties.canonicalDefinition
   Citation: citeEntity(entityId, 'canonicalDefinition')

3. ENGINEERING PRINCIPLES IMPLEMENTED
   Source: traverse(graph, entityId, 1) → IMPLEMENTS → ENGINEERING_PRINCIPLE nodes
   Rendered as: EngineeringPrincipleCard (summary) × N

4. STANDARDS VALIDATED
   Source: traverse(graph, entityId, 1) → VALIDATES → STANDARD nodes
   Rendered as: StandardCard (summary) × N

5. FAILURE MODES PREVENTED
   Source: traverse(graph, entityId, 1) → PREVENTS → FAILURE_MODE nodes
   Rendered as: FailureModeCard (collapsed) × N

6. PROTECTION MEDIA
   Source: traverse(graph, entityId, 1) → USES → PROTECTION_MEDIA nodes
   Rendered as: MediaCard × N

7. RECOMMENDATIONS FROM THIS TECHNOLOGY
   Source: recommendFromTechnology(entityId)
   Rendered as: RecommendationPanel × N (each with full trace)

8. ENGINEERING MEMORY
   Source: getMemoryFor(entityId)
   Rendered as: EngineeringMemoryPanel

9. PROVENANCE
   Source: getEntityProvenance(entityId)
   Rendered as: ProvenancePanel

10. CANONICAL KNOWLEDGE BLOCK (AI Citation Layer)
    Source: buildAIContext(entityId, 1) → structured JSON-LD
    Format: JSON-LD + plain-text machine-readable summary
```

**Example URL:** `/engineering/technologies/TECH-MACROCORE`
**Current count:** 12 pages (one per TECHNOLOGY_ARCHITECTURE node)

---

### GP-2: Engineering Principle Pages

**Route:** `/engineering/principles/[entityId]`
**Source:** ENGINEERING_PRINCIPLE nodes (12 current)
**Generation:** Static

**Page sections:**

```
1. PRINCIPLE HEADER
   Source: node.label
           node.properties.scienceDomain chip

2. DEFINITION
   Source: node.properties.definition
   Citation: citeEntity(entityId, 'definition')

3. PHENOMENON DESCRIPTION
   Source: node.properties.phenomenonDescription
   (The physical mechanism — why this happens)

4. TECHNOLOGIES THAT IMPLEMENT THIS PRINCIPLE
   Source: traverse(graph, entityId, 1, 'reverse') → IMPLEMENTS ← TECHNOLOGY nodes
   OR: recommendFromPrinciple(entityId) filtered to TECHNOLOGY_ARCHITECTURE
   Rendered as: TechnologyCard (summary) × N

5. STANDARDS THAT GOVERN THIS DOMAIN
   Source: traverse(graph, techNodes, 1) → VALIDATES → STANDARD nodes (union)
   Rendered as: StandardCard (compact) × N

6. FAILURE MODES THIS PRINCIPLE PREVENTS (INDIRECTLY)
   Source: traverse each techNode → PREVENTS → FAILURE_MODE (union, deduplicated)
   Rendered as: FailureModeCard (collapsed) × N

7. ENGINEERING MEMORY
   Source: getMemoryFor(entityId)

8. CANONICAL KNOWLEDGE BLOCK
   Source: buildAIContext(entityId, 1)
```

**Example URL:** `/engineering/principles/EP-SEP-001`
**Current count:** 12 pages

---

### GP-3: Failure Mode Pages

**Route:** `/engineering/failure-modes/[entityId]`
**Source:** FAILURE_MODE nodes (9 current)
**Generation:** Static

**Page sections:**

```
1. FAILURE MODE HEADER
   Source: node.label
           node.properties.systemContext chip

2. CAUSE CHAIN
   Source: node.properties.causeChain
   Rendered as: Step-by-step numbered list
   Citation: citeEntity(entityId, 'causeChain')

3. MEASURABLE CONSEQUENCE
   Source: node.properties.measurableConsequence
   (Quantified — hours of life lost, pressure drop, etc.)

4. INDUSTRIAL IMPACT
   Source: node.properties.industrialImpact
   (Cost + operational consequence)

5. CONTAMINATION SOURCES
   Source: traverse(graph, entityId, 1, 'reverse') → GENERATES ← CONTAMINATION
   Rendered as: ContaminationCard × N

6. TECHNOLOGIES THAT PREVENT THIS FAILURE
   Source: recommendFromFailureMode(entityId) filtered to TECHNOLOGY_ARCHITECTURE
   Rendered as: RecommendationPanel × N (with confidence + trace)

7. ENGINEERING PRINCIPLES THAT GOVERN THE PREVENTION
   Source: recommendFromFailureMode(entityId) filtered to ENGINEERING_PRINCIPLE
   Rendered as: EngineeringPrincipleCard × N

8. STANDARDS REFERENCED
   Source: traverse graph to standards via technology links
   Rendered as: StandardCard (compact) × N

9. ENGINEERING MEMORY
   Source: getMemoryFor(entityId)

10. CANONICAL KNOWLEDGE BLOCK
    Source: buildAIContext(entityId, 1)
```

**Example URL:** `/engineering/failure-modes/FM-AIR-001`
**Current count:** 9 pages

---

### GP-4: Contamination Pages

**Route:** `/engineering/contamination/[entityId]`
**Source:** CONTAMINATION nodes (8 current)
**Generation:** Static

**Page sections:**

```
1. CONTAMINATION HEADER
   Source: node.properties.name
           node.properties.contaminantClass chip
           node.properties.phaseState badge

2. CONTAMINATION DEFINITION
   Source: node.properties.definition (if present)
   Citation: citeEntity(entityId, 'definition')

3. MEDIA FUNCTION CONTEXT
   Source: node.properties.mediaFunction (if present)

4. FAILURE MODES GENERATED
   Source: traverse(graph, entityId, 1) → GENERATES → FAILURE_MODE
   Rendered as: FailureModeCard × N
   With arrow: "[CONTAMINATION] generates → [FAILURE_MODE]"

5. RECOMMENDED PROTECTION TECHNOLOGIES
   Source: recommendFromContamination(entityId)
   Rendered as: RecommendationPanel × N (with full trace)

6. STANDARDS APPLICABLE
   Source: traverse via technology → VALIDATES → STANDARD (union)
   Rendered as: StandardCard (compact) × N

7. ENGINEERING MEMORY
   Source: getMemoryFor(entityId)

8. CANONICAL KNOWLEDGE BLOCK
   Source: buildAIContext(entityId, 1)
```

**Example URL:** `/engineering/contamination/CONT-DUST-MINERAL`
**Current count:** 8 pages

---

### GP-5: Standard Pages

**Route:** `/engineering/standards/[entityId]`
**Source:** STANDARD nodes (12 current)
**Generation:** Static

**Page sections:**

```
1. STANDARD HEADER
   Source: node.label (standard code)
           node.properties.title
           node.properties.issuingBody chip

2. SCOPE
   Source: node.properties.scope
   Citation: citeEntity(entityId, 'scope')

3. VALIDATED TECHNOLOGIES
   Source: traverse(graph, entityId, 1, 'reverse') → VALIDATES ← TECHNOLOGY
   Rendered as: TechnologyCard (summary) × N

4. RELATED STANDARDS
   Source: traverse(graph, entityId, 1) → RELATES_TO → STANDARD
   Rendered as: StandardCard (compact) × N
   Also includes: SUPERSEDES relationships

5. ENGINEERING PRINCIPLES GOVERNED
   Source: traverse validated technologies → IMPLEMENTS → PRINCIPLE (union)
   Rendered as: EngineeringPrincipleCard (compact) × N

6. CANONICAL KNOWLEDGE BLOCK
   Source: buildAIContext(entityId, 1)
```

**Example URL:** `/engineering/standards/STD-ISO-16889`
**Current count:** 12 pages

---

### GP-6: Protection Media Pages

**Route:** `/engineering/media/[entityId]`
**Source:** PROTECTION_MEDIA nodes (10 current)
**Generation:** Static

**Page sections:**

```
1. MEDIA HEADER
   Source: node.label
           node.properties.code chip

2. MEDIA FUNCTION
   Source: node.properties.mediaFunction
   Citation: citeEntity(entityId, 'mediaFunction')

3. BASE CONSTRUCTION
   Source: node.properties.baseConstruction

4. TECHNOLOGIES USING THIS MEDIA
   Source: traverse(graph, entityId, 1, 'reverse') → USES ← TECHNOLOGY
   Rendered as: TechnologyCard (summary) × N

5. PRODUCTS IMPLEMENTING THIS MEDIA
   Source: traverse(graph, entityId, 1) → PART_OF → Products
   Rendered as: Product cards (SKU, description, CTA)

6. ENGINEERING MEMORY
   Source: getMemoryFor(entityId)

7. CANONICAL KNOWLEDGE BLOCK
   Source: buildAIContext(entityId, 1)
```

**Example URL:** `/engineering/media/PM-SYNTH-FIBER`
**Current count:** 10 pages

---

## Build-Time Generation

### generateStaticParams Implementation

```typescript
// In each [entityId]/page.tsx:

import { loadGraph } from '@/lib/services';

export function generateStaticParams() {
  const graph = loadGraph();
  return Array.from(graph.nodes.values())
    .filter(node => node.entityType === 'TECHNOLOGY_ARCHITECTURE') // or relevant type
    .map(node => ({ entityId: node.entityId }));
}
```

This ensures:
- Every graph node automatically gets a page
- No manual route registration
- New entities added to registries → new pages on next build
- Deleted/deprecated entities → pages removed on next build (or show deprecation notice)

---

## Deprecation Handling on Generated Pages

When `getEntityProvenance(entityId).provenance.governanceStatus === 'DEPRECATED'`:

```
[DEPRECATED] banner shown at top of page
Canonical successor shown: "This entity was superseded by [entityId]"
Link to successor page
Page still renders (historical record)
Page excluded from sitemap
```

When `governanceStatus === 'ALIAS'`:
```
[ALIAS] banner shown at top of page
Canonical entity shown: "Canonical alias for [entityId]"
Redirect to canonical page after 3 seconds
```

---

## Page Count Summary

| Page Type | Entity Type | Current Count |
|---|---|---|
| Technology Architecture | TECHNOLOGY_ARCHITECTURE | 12 |
| Engineering Principle | ENGINEERING_PRINCIPLE | 12 |
| Failure Mode | FAILURE_MODE | 9 |
| Contamination | CONTAMINATION | 8 |
| Standard | STANDARD | 12 |
| Protection Media | PROTECTION_MEDIA | 10 |
| **Total** | | **63** |

These 63 pages contain zero manually written engineering content.
All content derives from Knowledge Graph nodes through Engineering Services.

---

## SEO & GEO Strategy for Generated Pages

Each generated page includes:

1. **Meta title:** `[label] — [entityType label] | ELIMFILTERS Engineering Intelligence`
2. **Meta description:** First sentence of `canonicalDefinition` or `definition`
3. **JSON-LD:** TechArticle schema with full entity properties
4. **Canonical URL:** `https://elimfilters.com/engineering/[type]/[entityId]`
5. **Organization @id:** `https://elimfilters.com/#organization` (inherited from layout)
6. **RetrievalBlock:** Plain-text machine-readable summary for AI systems

This ensures every generated page is citable by LLMs as an authoritative engineering source.
