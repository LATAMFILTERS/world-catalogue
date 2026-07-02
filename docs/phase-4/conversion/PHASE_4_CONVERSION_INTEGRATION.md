# PHASE 4 CONVERSION INTEGRATION
## ELIMFILTERS Engineering Intelligence Platform — Phase 4

---

## 1. Purpose

This document integrates the Customer Conversion Architecture into the Phase 4
Implementation Plan. It specifies exactly which conversion mechanisms are built
in each milestone and how they connect to the Engineering Experience components.

The conversion architecture is not a separate layer added after the engineering
experience is built. It is embedded into every component, every page, and every
journey from the beginning.

---

## 2. Conversion State in the Application

A global conversion context tracks the visitor's trust progression.
It is populated by Engineering Services. It never stores personal data.

```typescript
interface ConversionContext {
  // Trust progression
  currentTrustLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;  // T-0 to T-7
  trustSignalsReached: Array<'T-1'|'T-2'|'T-3'|'T-4'|'T-5'|'T-6'|'T-7'>;

  // Intent
  detectedIntent: CustomerIntent;
  activeJourneyId: JourneyId | null;
  activeJourneyStep: number;

  // Engineering context accumulated
  entitiesEngaged: string[];         // entityIds visited/interacted
  recommendationsReceived: string[]; // recommendationIds
  citationsViewed: string[];

  // Lead capture eligibility
  eligibleCTAs: LeadType[];          // derived from trust level + journey state

  // Session state
  journeyState: JourneyState | null;
  sessionId: string;
}
```

This context is computed from Engineering Services data, never from user-provided
data. Privacy-preserving by design.

---

## 3. Milestone-by-Milestone Conversion Integration

### Milestone 1 — Experience Component Library

**Conversion integration in each component:**

**EngineeringSearchBar (C-01)**
- On result selection: dispatch `TRUST_SIGNAL_T1` (problem recognition)
- Track: `searchIntent`, `selectedEntityType`
- Output: `detectedIntent` → feeds journey routing

**FailureModeCard (C-04)**
- On `expanded = true`: dispatch `TRUST_SIGNAL_T2` (mechanism explanation)
- When causeChain is read (scroll-to-bottom): confirm T-2 signal
- Contextual CTA eligibility: L-6 enabled after T-2

**TechnologyCard (C-06)**
- On `mode = 'full'` render: dispatch `TRUST_SIGNAL_T4`
- Enables: L-4 (technical download) CTA
- On recommendation context received: dispatch `TRUST_SIGNAL_T6` prep

**RecommendationPanel (C-08)**
- On trace expanded: dispatch `TRUST_SIGNAL_T6` (traceable recommendation)
- Enables: L-1, L-2 CTAs
- Hard constraint: panel must not render if `steps.length === 0`

**EngineeringMemoryPanel (C-10)**
- On panel expanded: dispatch `TRUST_SIGNAL_T5` (field validation)
- Does not enable additional CTAs but strengthens existing ones

**ProvenancePanel (C-11)**
- On render: dispatch `TRUST_SIGNAL_T7` (institutional credibility)
- Enables: L-1, L-7 CTAs

**CitationPanel (C-09)**
- On render with FULL traceability: dispatch `TRUST_SIGNAL_T3`
- Partial traceability does not trigger T-3

**JourneyProgressBar (C-15)**
- Displays current trust level visually (subtle indicator, not a score shown to user)

**Conversion components added to Milestone 1 (new):**

```
frontend/src/components/conversion/
  CTACard.tsx           (renders primary + secondary CTA based on ConversionContext)
  LeadCaptureForm.tsx   (captures lead data for L-1 through L-7)
  EngineeringPackage.tsx (generates and displays the post-lead engineering summary)
  ConversionContext.tsx (React context provider for conversion state)
```

---

### Milestone 2 — Enhanced Home Engineering Flow

**Conversion integration:**

**4 Journey Entry Cards:**
Each card sets `detectedIntent` in ConversionContext before routing.
```
J1 card clicked → detectedIntent: KNOWN_PART
J2 card clicked → detectedIntent: PROACTIVE_PROTECTION
J3 card clicked → detectedIntent: FAILURE_DIAGNOSIS
J4 card clicked → detectedIntent: TECHNOLOGY_RESEARCH
```

**Search bar on homepage:**
On result: `detectedIntent` set from search pattern detection.
Trust signal T-1 dispatched when visitor interacts with result.

**No commercial CTAs on homepage.** The only CTA visible on initial load is the
search bar and the 4 journey entries. No lead capture above the fold.

**Below the fold:**
Newsletter CTA (L-5) placed after engineering context section (after Asset
Protection Layer narrative — T-2 is assumed reached if visitor scrolled this far).

---

### Milestone 3 — Engineering Search Experience

**Conversion integration:**

**Search results page:**
- Intent badge shown → T-1 dispatch on page load
- Each result shows matched fields (engineering honesty builds T-3 partial trust)
- Entity type routing: clicking a FAILURE_MODE result → T-1 → leads to Journey 3 entry
- No CTAs on search results page itself
- Exception: if `detectedIntent === KNOWN_PART` and product found → L-3 CTA shown

**Search + Engineering transition:**
When visitor clicks an engineering entity from search results and reads the full
entity page → full trust sequence begins on that page.

---

### Milestone 4 — Generated Explorer Pages (63 pages)

**Conversion integration per page type:**

**Technology Pages (GP-1):**
```
T-4 dispatch on page load (visitor is on a technology page by definition)
CTA eligibility after section render:
  After Canonical Definition: T-4 confirmed → L-4 enabled (Download tech spec)
  After Recommendations section: T-6 dispatch → L-1 enabled (Consultation)
  Footer: L-2 (Quote), L-3 (Distributor)
```

**Failure Mode Pages (GP-3):**
```
T-1 dispatch on load (failure mode = problem recognition)
T-2 dispatch when causeChain section renders
CTA after T-2: L-6 (Failure Analysis Request)
CTA after Recommendation section (T-6): L-1 (Engineering Consultation)
Footer: L-3 (Distributor)
```

**Principle Pages (GP-2):**
```
No commercial CTAs until exit
T-2 dispatch on phenomenonDescription render
T-3 dispatch on citation render
Exit: L-5 (Newsletter), L-7 (Training)
```

**Standard Pages (GP-5):**
```
No commercial CTAs (standard pages are reference material)
T-3 dispatch on page load
Exit: L-5 only
```

**Contamination Pages (GP-4):**
```
T-1 dispatch on load
T-2 dispatch on Failure Modes section render
CTA after Recommendations (T-6): L-1, L-6
Footer: L-3, L-2
```

---

### Milestone 5 — Journey 2: Asset Protection

**This is the primary conversion journey.** Most L-1 and L-2 leads originate here.

**Conversion integration per step:**

```
Step 1 (Asset Selection): T-1 dispatch. No CTA.
Step 2 (Risk Assessment): T-2 partial. L-5 sidebar (very subtle).
Step 3 (Failure Modes): T-2 full. L-6 contextual (if severe failure mode).
Step 4 (Contamination): No trust dispatch, no CTA. Focus on analysis.
Step 5 (Technology Rec): T-4 + T-5 (if memory present) + T-6. L-4 secondary.
Step 6 (Protection System): T-6 confirmed. T-7 if provenance shown.
  PRIMARY CTA: L-1 Engineering Consultation
  SECONDARY CTA: L-2 Protection System Quote
  On CTA click: LeadCaptureForm opens. EngineeringPackage generated and delivered.
Step 7 (Products): Commercial terminal. L-3 primary. L-2 secondary.
```

**Engineering Package generation at Step 6 CTA click:**
```typescript
const pkg = buildAIContext(recommendedTechEntityId, 2);
const citation = citeEntity(recommendedTechEntityId, 'protection system recommendation');
// Structured package rendered in EngineeringPackage component
// Also emailed to visitor (requires email from LeadCaptureForm)
```

---

### Milestone 6 — Journey 3: Problem Diagnosis

**High-urgency journey.** Visitor under pressure. Do not slow them down.

**Conversion integration:**

```
Step 1 (Problem Description): T-1 dispatch on failure mode match shown.
Step 2 (Failure Mode ID): T-1 confirmed, T-2 start.
  CTA appears here (urgency): L-6 "Request failure analysis"
  This is the earliest CTA in any journey — justified by urgency.
Step 3 (Root Cause): T-2 full. No CTA. Visitor must understand mechanism.
Step 4 (Engineering Principle): T-2 + partial T-3. L-4 contextual (brief).
Step 5 (Technology Rec): T-4 + T-6. L-1 Consultation shown (below trace).
Step 6 (Protection Media): T-5 if memory present. No new CTA.
Step 7 (Products): L-3 primary (urgent framing). L-2 secondary.
```

**Urgency framing at Step 2 (only Journey 3):**
The L-6 CTA copy is adapted to urgency:
"Your failure analysis request → our engineer will review within [SLA] hours."
This is the one context where speed is part of the value proposition.

---

### Milestone 7 — Recommendation Enhancement (Existing KS Pages)

**Existing Knowledge System pages become conversion-capable.**

For each enhanced page:
1. RecommendationPanel added → T-6 dispatch when rendered
2. CitationPanel added inline → T-3 dispatch
3. L-4 CTA added (technical download)
4. L-1 CTA added at page exit (after recommendation section)

No restructuring of page content. Conversion layer added alongside existing engineering content.

---

## 4. Engineering Package Specification

The Engineering Package is the central conversion deliverable. It is generated
by Engineering Services when a lead is captured.

```typescript
interface EngineeringPackage {
  generatedAt: string;           // ISO timestamp
  packageId: string;             // EPKG-[random]
  
  customerContext: {
    detectedIntent: CustomerIntent;
    journeyId: JourneyId;
    completedSteps: number;
    entitiesEngaged: string[];
  };

  assetContext: {
    industryId?: string;
    assetType?: string;
    operatingEnvironment?: string;
  };

  risksIdentified: Array<{
    entityId: string;
    label: string;
    entityType: 'CONTAMINATION' | 'FAILURE_MODE';
    operationalImpact: string;
  }>;

  recommendedProtection: Array<{
    recommendation: Recommendation;   // from Recommendation Service
    citation: CitationObject;          // from Citation Service
    provenance: EntityProvenance;     // from Provenance Service
    memory?: GraphNode[];              // Engineering Memory if present
  }>;

  aiContext: AIContextPackage;         // from AI Context Builder

  formattedCitations: string[];        // human-readable citation strings
  
  nextSteps: {
    primaryAction: LeadType;
    primaryCTA: string;
    engineeringContactRouting: string;
  };
}
```

This package is:
1. Rendered in the browser as a summary after lead capture
2. Emailed to the visitor (requires email from LeadCaptureForm)
3. Transmitted to ELIMFILTERS team with visitor context
4. Stored in sessionStorage so visitor can reference it in follow-up conversation

---

## 5. Phase 4 Conversion Completion Criteria

Phase 4 conversion integration is complete when:

- [ ] ConversionContext provider wraps all journey routes
- [ ] All 7 trust signals are dispatched at correct points in all journeys
- [ ] CTACard renders correct CTAs based on trust level (no premature CTAs)
- [ ] LeadCaptureForm functions for all 7 lead types
- [ ] EngineeringPackage generates correctly from Engineering Services
- [ ] Engineering Package delivered to visitor and team on lead capture
- [ ] Lead qualification score computed from journey data
- [ ] GA4 conversion events firing for all milestones
- [ ] No CTA appears before T-2 (except L-5 Newsletter)
- [ ] No commercial CTA on homepage above the fold
- [ ] Standard pages have no commercial CTAs
- [ ] All CTAs use engineering language (no sales language)
