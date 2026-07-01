# EXPERIENCE COMPONENT LIBRARY
## ELIMFILTERS Engineering Intelligence Platform — Phase 4

---

## Governing Rules

1. Every component consumes Engineering Services exclusively. No registry imports.
2. Every component that renders a recommendation must render the RecommendationStep[] trace.
3. Every component that renders an engineering claim must render its CitationObject.
4. No engineering content is hardcoded in JSX. All text derives from graph node properties.
5. All components are client-side ('use client') to consume graph state.
6. Styling: dark theme (#000), yellow accent (#FFF12D), Framer Motion animations.

---

## Component Registry

### C-01: EngineeringSearchBar

**Purpose:** Universal entry point. Accepts any query, detects intent, routes to correct journey.

**Services consumed:**
- `search(query, { maxResults: 10 })`

**Props:**
```typescript
interface EngineeringSearchBarProps {
  placeholder?: string;
  onResult: (results: SearchResult[], detectedIntent: SearchIntent) => void;
  autoFocus?: boolean;
  initialQuery?: string;
}

type SearchIntent =
  | 'PART_NUMBER'
  | 'ENTITY_ID'
  | 'FAILURE_MODE'
  | 'CONTAMINATION'
  | 'STANDARD'
  | 'TECHNOLOGY'
  | 'KEYWORD';
```

**Renders:**
- Search input with debounced query (300ms)
- Intent badge (detected automatically)
- Result list with: label, entityType chip, score bar, matchedFields, excerpt
- Explanation: "Matched on: [field list]"
- Keyboard navigation (arrow keys, enter, escape)

**Not rendered:** Product catalogue. Search results do not show prices.

---

### C-02: AssetSelector

**Purpose:** Journey 2 entry. Visual industry grid leading to risk assessment.

**Services consumed:**
- `search(industryKeyword, { entityTypes: ['CONTAMINATION', 'FAILURE_MODE'] })`

**Props:**
```typescript
interface AssetSelectorProps {
  onSelect: (industry: string, assetType: string) => void;
}
```

**Renders:**
- 12-sector industry grid (Agriculture, Mining, Marine, etc.)
- On hover: top 2 contamination risks for that sector (fetched from search)
- On select: transitions into risk assessment view

**Visual:** Each sector shows an icon + label + risk preview. Yellow highlight on hover.

---

### C-03: ProblemExplorer

**Purpose:** Journey 3 entry. Symptom input leading to failure mode identification.

**Services consumed:**
- `search(symptomDescription, { entityTypes: ['FAILURE_MODE'] })`

**Props:**
```typescript
interface ProblemExplorerProps {
  onFailureModeSelected: (failureModeEntityId: string) => void;
}
```

**Renders:**
- Free-text input ("Describe what you're seeing...")
- Quick-select symptom chips: "Filter blinding", "Pressure loss", "Oil darkening", etc.
- Ranked failure mode matches with:
  - systemContext (where in the equipment)
  - measurableConsequence (what gets damaged)
  - Match confidence score
- "Is this your problem?" confirmation before proceeding

---

### C-04: FailureModeCard

**Purpose:** Display a FAILURE_MODE node with full engineering context.

**Services consumed:**
- `findById(entityId)`
- `getEntityProvenance(entityId)`
- `getMemoryFor(entityId)`

**Props:**
```typescript
interface FailureModeCardProps {
  entityId: string;
  expanded?: boolean;
  onExploreContamination?: (entityId: string) => void;
  onExploreTechnology?: (entityId: string) => void;
}
```

**Renders (collapsed):**
- Entity ID chip + label
- systemContext
- measurableConsequence (one sentence)

**Renders (expanded):**
- causeChain (step-by-step mechanism)
- industrialImpact (quantified cost/downtime)
- Engineering Memory panel (if present — field observations)
- Provenance: governanceStatus, sourceRegistry
- Action buttons: "Find root cause" → "Find solution"

---

### C-05: ContaminationCard

**Purpose:** Display a CONTAMINATION node.

**Services consumed:**
- `findById(entityId)`
- `getEntityProvenance(entityId)`

**Props:**
```typescript
interface ContaminationCardProps {
  entityId: string;
  showFailureModes?: boolean;
  onSelect?: (entityId: string) => void;
}
```

**Renders:**
- Contamination class chip + name
- phaseState (solid / liquid / gas / biological)
- contaminantClass
- Linked failure modes (GENERATES relationships) — shown as chain arrows
- Ingress pathway (if in properties)

---

### C-06: TechnologyCard

**Purpose:** Display a TECHNOLOGY_ARCHITECTURE node with engineering context.

**Services consumed:**
- `findById(entityId)`
- `recommendFromTechnology(entityId)` — for related principles + standards
- `getEntityProvenance(entityId)`

**Props:**
```typescript
interface TechnologyCardProps {
  entityId: string;
  mode: 'summary' | 'full' | 'comparison';
  onSelectForProtection?: (entityId: string) => void;
}
```

**Renders (summary):**
- technologyName + systemDomain chip
- canonicalDefinition (first sentence)
- Confidence badge (from recommendation context)

**Renders (full):**
- Complete canonicalDefinition
- Engineering Principles implemented (IMPLEMENTS relationships)
- Standards validated (VALIDATES relationships, via graph)
- Failure Modes prevented (PREVENTS relationships)
- Protection Media used (USES relationships)
- Engineering Memory panel
- Citation panel

---

### C-07: EngineeringPrincipleCard

**Purpose:** Display an ENGINEERING_PRINCIPLE node.

**Services consumed:**
- `findById(entityId)`
- `recommendFromPrinciple(entityId)`

**Props:**
```typescript
interface EngineeringPrincipleCardProps {
  entityId: string;
  showTechnologies?: boolean;
}
```

**Renders:**
- Principle code + label
- definition (full, technical, non-marketing)
- scienceDomain chip
- phenomenonDescription (the physics)
- Technologies that IMPLEMENT this principle (recommended list)
- Related standards (via VALIDATES on implementing technologies)

---

### C-08: RecommendationPanel

**Purpose:** Display a Recommendation with full explainability. The most important
component in the platform. Must never show a recommendation without its trace.

**Services consumed:**
- Result of `recommendFrom*()` — receives Recommendation object

**Props:**
```typescript
interface RecommendationPanelProps {
  recommendation: Recommendation;
  showFullTrace?: boolean;
  onAccept?: (recommendation: Recommendation) => void;
}
```

**Renders (always):**
- Target entity label + type chip
- Confidence badge (HIGH = green, MEDIUM = yellow, LOW = grey)
- Summary explanation (recommendation.explanation)

**Renders (expandable):**
- Engineering Path — visual step-by-step trace:
  ```
  [EP-SEP-001] IMPLEMENTS → [TECH-NANOFORCE] PREVENTS → [FM-HYD-001]
  ```
  Each node in the path is clickable → opens EntityCard
- Supporting Standards (VALIDATES relationships)
- Supporting Citations (CitationPanel)
- Engineering Memory (if any step has HAS_MEMORY)

**Never renders:** Unexplained recommendations. If steps.length === 0, the panel
shows an error state, not a recommendation.

---

### C-09: CitationPanel

**Purpose:** Display CitationObject traceability for any engineering claim.

**Services consumed:**
- `citeEntity(entityId, claim)` or receives CitationObject directly

**Props:**
```typescript
interface CitationPanelProps {
  citation: CitationObject;
  compact?: boolean;
}
```

**Renders:**
- Traceability badge: FULL (green) / PARTIAL (yellow) / NONE (red)
- Source entity: entityId + sourceRegistry
- Claim text
- Formatted citation: `formatCitation(citation)`
- EDR reference if present
- Governance status

**Compact mode:** Badge + source only (for inline use within other cards)

---

### C-10: EngineeringMemoryPanel

**Purpose:** Display Engineering Memory nodes linked to an entity.

**Services consumed:**
- `getMemoryFor(entityId)`

**Props:**
```typescript
interface EngineeringMemoryPanelProps {
  entityId: string;
}
```

**Renders:**
- "Field Engineering Record" header (monospace)
- Each memory node:
  - archivedReason (why this memory was recorded)
  - Provenance: version, sourceRegistry
  - Relationship type (HAS_MEMORY)
- Empty state: no memory is rendered, no panel shown

**Visual:** Yellow-bordered panel, monospace typography, dimmed background.
This panel establishes trust — it shows customers that ELIMFILTERS records
and learns from field experience.

---

### C-11: ProvenancePanel

**Purpose:** Display governance metadata for any entity.

**Services consumed:**
- `getEntityProvenance(entityId)`

**Props:**
```typescript
interface ProvenancePanelProps {
  entityId: string;
  compact?: boolean;
}
```

**Renders:**
- Governance status chip: ACTIVE / DEPRECATED / ALIAS / SUPERSEDED
- Source registry
- Version
- EDR references (if any)
- If alias: "Canonical alias for [entityId]" with link
- If deprecated: "Superseded by [entityId]" with link

---

### C-12: ProtectionSystemExplorer

**Purpose:** Display a complete recommended protection system for an asset.
Composes multiple cards into a coherent recommendation package.

**Services consumed:**
- `recommendFromFailureMode(fmEntityId)` — for each failure mode
- `recommendFromContamination(contEntityId)` — for contamination
- `buildAIContext(techEntityId, 1)` — for context package

**Props:**
```typescript
interface ProtectionSystemExplorerProps {
  industryId: string;
  failureModeEntityIds: string[];
  onProductsRequested: (mediaEntityIds: string[]) => void;
}
```

**Renders:**
- "Your Protection System" header
- Primary technology recommendation (highest confidence)
- Secondary technology recommendations
- Complete protection chain visualization:
  Contamination → Technology → Media → Products
- Standards compliance list
- Engineering Memory summary
- "Show Products" CTA — only appears after engineering context is rendered

---

### C-13: StandardCard

**Purpose:** Display a STANDARD node.

**Services consumed:**
- `findById(entityId)`
- `getEntityProvenance(entityId)`
- `searchByType(standardCode, 'TECHNOLOGY_ARCHITECTURE')` — validated technologies

**Props:**
```typescript
interface StandardCardProps {
  entityId: string;
  showValidatedTechnologies?: boolean;
}
```

**Renders:**
- Standard code (bold, monospace) + title
- issuingBody + scope
- Technologies validated by this standard (VALIDATES relationships, reversed)
- Related standards (RELATES_TO)

---

### C-14: EngineeringReasoningChain

**Purpose:** Visual display of the full reasoning chain for any journey step.
The visual backbone of the Engineering Experience.

**Props:**
```typescript
interface EngineeringReasoningChainProps {
  steps: Array<{
    entityId: string;
    entityType: NodeEntityType;
    label: string;
    relationshipToNext?: string;
  }>;
  activeStep?: number;
}
```

**Renders:**
- Horizontal chain of entity nodes connected by relationship arrows
- Active step highlighted in yellow
- Each node is clickable → opens EntityCard popover
- Relationship labels on arrows (IMPLEMENTS, PREVENTS, USES, etc.)
- On mobile: vertical stack with collapse

---

### C-15: JourneyProgressBar

**Purpose:** Show journey progress and allow step navigation.

**Props:**
```typescript
interface JourneyProgressBarProps {
  journeyId: 'PART_NUMBER' | 'ASSET_PROTECTION' | 'PROBLEM_DIAGNOSIS' | 'LEARNING';
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}
```

**Renders:**
- Step dots with labels
- Completed steps (filled, yellow)
- Current step (pulsing, yellow)
- Future steps (empty, grey)
- Journey label (Journey 1–4)
- Back / Next navigation

---

## Component Composition Patterns

### Pattern A: Entity Deep Dive
```
TechnologyCard (full)
  └─ EngineeringPrincipleCard (for each IMPLEMENTS relationship)
  └─ StandardCard (for each VALIDATES relationship)
  └─ FailureModeCard (for each PREVENTS relationship)
  └─ EngineeringMemoryPanel
  └─ CitationPanel
  └─ ProvenancePanel
```

### Pattern B: Recommendation Result
```
RecommendationPanel (full trace)
  └─ EngineeringReasoningChain (visual path)
  └─ TechnologyCard (summary, target entity)
  └─ CitationPanel (compact, for each step)
  └─ EngineeringMemoryPanel (if applicable)
```

### Pattern C: Journey Step
```
JourneyProgressBar
  └─ [Step-specific primary component]
  └─ EngineeringReasoningChain (shows completed path so far)
  └─ [Navigation: Back / Next]
```

---

## Styling Standards for All Components

- Background: `#000` (black) or `rgba(255,255,255,0.03)` for card surfaces
- Accent: `#FFF12D` (yellow) for active states, CTA, and highlights
- Text: `#fff` primary, `rgba(255,255,255,0.65)` secondary
- Borders: `rgba(255,255,255,0.08)` default, `rgba(255,241,45,0.25)` on hover/active
- Typography: Outfit (headings), Inter (body), JetBrains Mono (IDs, codes, citations)
- Animations: Framer Motion `initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}`
- All cards have `borderRadius: 8px`, `padding: 1.5rem`

## Accessibility Requirements

- All interactive components keyboard navigable
- All entity IDs have aria-label describing entity type
- Confidence badges have aria-label ("Confidence: HIGH")
- Reasoning chains have aria-label ("Engineering path: [N] steps")
- Citation traceability badges have aria-label ("Traceability: FULL")
