# CUSTOMER ENGINEERING JOURNEYS
## ELIMFILTERS Engineering Intelligence Platform — Phase 4

---

## Overview

A Journey is a structured, multi-step experience that begins with a customer's intent
and ends with a product recommendation grounded in engineering reasoning.

Every Journey:
- Begins with the customer's reality (what they have, what they face, what they want to know)
- Traverses the Knowledge Graph through Engineering Services
- Produces recommendations with full traceability
- Ends with products as the consequence of engineering reasoning

There are four canonical journeys.

---

## Journey 1 — I Know My Part Number

**Customer intent:** Fast identification and engineering validation of a known part.

**Entry trigger:** Visitor types a part number, SKU, or OEM code.

```
STEP 1: Part Number Entry
  Input:   Raw string (e.g. "EA10695", "P181059", "LF3000")
  Action:  search(query, { maxResults: 5 })
  Display: Top matches with entityType, label, score
  
STEP 2: Cross Reference
  Input:   Selected product node
  Action:  traverse(graph, nodeId, 1) → REALIZES relationships
  Display: Equivalent ELIMFILTERS part, OEM references, competitor codes
  
STEP 3: Engineering Explanation
  Input:   Technology node linked via REALIZES
  Action:  findById(techEntityId) + getEntityProvenance()
  Display: What technology this product implements, why it was engineered
  
STEP 4: Technology Context
  Input:   Technology node
  Action:  recommendFromTechnology(techEntityId)
  Display: Engineering Principles implemented, Standards validated, Failure Modes prevented
  
STEP 5: Product Confirmation
  Input:   Confirmed technology + media match
  Action:  traverse(graph, mediaNodeId, 1) → PART_OF relationships
  Display: Product card with full engineering lineage
  
STEP 6: Purchase
  Action:  Link to product page / distributor / e-commerce
  Display: Product + engineering summary for customer record
```

**Graph path:**
```
search result → PART_OF → PROTECTION_MEDIA → REALIZES → TECHNOLOGY_ARCHITECTURE
→ IMPLEMENTS → ENGINEERING_PRINCIPLE → VALIDATES → STANDARD
```

**Success condition:** Customer confirms purchase with understanding of WHY this part
protects their equipment, not just that it matches their old part number.

---

## Journey 2 — I Want to Protect My Equipment

**Customer intent:** Proactive asset protection. Customer knows their equipment but
has not yet experienced a problem.

**Entry trigger:** Visitor selects an industry or equipment type.

```
STEP 1: Asset Selection
  Input:   Industry selector + equipment type (optional: model/make)
  Action:  searchByType(industry, 'TECHNOLOGY_ARCHITECTURE') filtered by industry tags
  Display: AssetSelector component — visual grid of industrial sectors
  
STEP 2: Risk Assessment
  Input:   Selected asset/industry
  Action:  traverse(graph, industryNode, 1) → GENERATES relationships
  Display: Top contamination risks for this asset class
           (CONTAMINATION nodes with GENERATES → FAILURE_MODE chains)
  
STEP 3: Failure Mode Explorer
  Input:   Top contamination nodes
  Action:  recommendFromContamination(contaminationEntityId)
  Display: Failure modes this contamination causes, measurable consequences,
           operating time impact
  
STEP 4: Contamination Analysis
  Input:   Selected failure mode
  Action:  recommendFromFailureMode(failureModeEntityId)
  Display: Which technologies PREVENT this failure mode, with confidence levels
           and RecommendationStep[] trace
  
STEP 5: Technology Recommendation
  Input:   Recommended technology nodes
  Action:  buildAIContext(techEntityId, 1)
  Display: Full technology card:
           - What it does (technologyName + canonicalDefinition)
           - Which Engineering Principles it implements
           - Which Standards it validates
           - Protection Media available
           - Engineering Memory (field lessons if present)
  
STEP 6: Protection System
  Input:   Confirmed technology selection
  Action:  traverse(graph, techNodeId, 1) → USES relationships
  Display: Complete protection system: primary + secondary media,
           recommended replacement intervals, measurable outcomes
  
STEP 7: Products
  Action:  PROTECTION_MEDIA → PART_OF → Products
  Display: Product cards with engineering lineage, not just specifications
```

**Graph path:**
```
INDUSTRY → CONTAMINATION (GENERATES) → FAILURE_MODE (PREVENTS) → TECHNOLOGY_ARCHITECTURE
→ ENGINEERING_PRINCIPLE (IMPLEMENTS) → STANDARD (VALIDATES)
→ PROTECTION_MEDIA (USES) → Products (PART_OF)
```

**Success condition:** Customer selects a complete protection system with documented
reasoning they can present to their maintenance team or management.

---

## Journey 3 — I Have a Problem

**Customer intent:** Reactive diagnosis. Customer has a visible symptom right now.

**Entry trigger:** Visitor describes a problem in natural language or selects from
a problem taxonomy.

```
STEP 1: Problem Description
  Input:   Free text OR problem selector
           Examples: "filter blinding too fast", "hydraulic pressure dropping",
                     "oil turning black quickly", "fuel injector failure"
  Action:  search(problem_description) → score by FAILURE_MODE entity type
  Display: Top matching failure modes with confidence and excerpt

STEP 2: Failure Mode Identification
  Input:   Selected FAILURE_MODE node
  Action:  findById(fmEntityId) + getEntityProvenance(fmEntityId)
  Display: Failure mode card:
           - systemContext (where in the equipment this occurs)
           - causeChain (why it happens step by step)
           - measurableConsequence (what gets damaged)
           - industrialImpact (cost and operational consequence)
           - Engineering Memory if present (field history)

STEP 3: Contamination Root Cause
  Input:   Failure mode node
  Action:  traverse(graph, fmNodeId, 1) → RELATES_TO + GENERATES (reverse)
  Display: Root contamination sources causing this failure
           Each contamination node shows: class, phase state, ingress path

STEP 4: Engineering Principle
  Input:   Contamination + Failure Mode pair
  Action:  recommendFromFailureMode(fmEntityId) filtered to ENGINEERING_PRINCIPLE
  Display: The physical principle that governs this failure:
           - definition
           - phenomenonDescription
           - scienceDomain
           - Traceable reasoning: why this principle explains the observed failure

STEP 5: Technology Architecture
  Input:   Engineering Principle node
  Action:  recommendFromPrinciple(principleEntityId)
  Display: Technology architectures that apply this principle to prevent the failure:
           - systemDomain
           - canonicalDefinition
           - Confidence level
           - RecommendationStep[] trace shown visually as path diagram

STEP 6: Protection Media
  Input:   Recommended technology
  Action:  traverse(graph, techNodeId, 1) → USES relationships
  Display: Physical protection media:
           - mediaFunction
           - baseConstruction
           - Fit for this specific failure context

STEP 7: Products
  Action:  PROTECTION_MEDIA → PART_OF → Products
  Display: Products with complete engineering reasoning:
           Problem → Root Cause → Principle → Technology → Media → Product
```

**Graph path:**
```
search(symptom) → FAILURE_MODE ← GENERATES ← CONTAMINATION
→ PREVENTS → TECHNOLOGY_ARCHITECTURE ← IMPLEMENTS ← ENGINEERING_PRINCIPLE
→ USES → PROTECTION_MEDIA → PART_OF → Products
```

**Success condition:** Customer understands their problem at the engineering level
and has documented evidence to support their product selection.

---

## Journey 4 — I Want to Learn

**Customer intent:** Engineering education. Customer wants to understand filtration
engineering, build knowledge, develop expertise.

**Entry trigger:** Visitor enters the Knowledge System or Engineering Intelligence hub.

```
STEP 1: Engineering Intelligence Entry
  Display: Hub with 6 domain doors:
           - Air Intake Systems
           - Lube / Oil Systems
           - Hydraulic Systems
           - Fuel Systems
           - Cabin / Safety Systems
           - Compressed Air Systems

STEP 2: Domain Selection
  Input:   Selected domain (maps to STANDARD entity cluster)
  Action:  searchByType(domainKeyword, 'STANDARD')
           + searchByType(domainKeyword, 'ENGINEERING_PRINCIPLE')
  Display: Domain overview:
           - Applicable standards (ISO / SAE / ASTM codes)
           - Governing Engineering Principles
           - Common Failure Modes in this domain
           - Associated Technologies

STEP 3: Articles / Deep Dives
  Input:   Selected topic (standard, principle, failure mode, or contamination)
  Action:  findById(entityId) + buildAIContext(entityId, 2)
  Display: Full engineering article generated from Knowledge Graph node:
           - Definition
           - System context
           - Failure mechanism
           - Industrial impact (quantified)
           - Related standards
           - Related technologies
           - Engineering Memory (field observations)
           - Citations with traceability

STEP 4: Technology Exploration
  Input:   Technology mentioned in article
  Action:  recommendFromTechnology(techEntityId)
  Display: TechnologyExplorer component:
           - Full technology card
           - Engineering Principles it implements
           - Standards it validates
           - Failure Modes it prevents
           - Protection Media it uses
           - Related technologies

STEP 5: Standards Reference
  Input:   Standard mentioned in article
  Action:  findById(standardEntityId) + traverse(graph, standardEntityId, 1)
  Display: Standard card:
           - title + scope
           - issuingBody
           - Technologies validated by this standard (VALIDATES relationships)
           - Related standards (RELATES_TO)

STEP 6: Application
  Input:   Understanding confirmed
  Display: Application examples — industries and equipment where this
           engineering knowledge applies

STEP 7: Products
  Display: Products that implement the technologies studied in this session
           Presented as engineering implementation, not catalogue browse
```

**Graph path:**
```
Knowledge Hub → STANDARD cluster → ENGINEERING_PRINCIPLE → TECHNOLOGY_ARCHITECTURE
→ PROTECTION_MEDIA → Application context → Products
```

**Success condition:** Customer has built genuine engineering understanding and
now selects products from conviction rather than habit or price comparison.

---

## Journey State Management

Each Journey is a stateful multi-step experience. State must persist across page navigation.

```typescript
interface JourneyState {
  journeyId: 'PART_NUMBER' | 'ASSET_PROTECTION' | 'PROBLEM_DIAGNOSIS' | 'LEARNING';
  currentStep: number;
  completedSteps: number[];
  selections: {
    assetType?: string;
    industryId?: string;
    failureModeEntityId?: string;
    contaminationEntityId?: string;
    principleEntityId?: string;
    technologyEntityId?: string;
    mediaEntityId?: string;
    partNumber?: string;
  };
  recommendations: Recommendation[];  // from Engineering Services
  citations: CitationObject[];         // from Engineering Services
}
```

State is stored in sessionStorage (not URL) to avoid exposing engineering paths in analytics.

---

## Journey Abandonment

When a visitor abandons a journey partway through:

- Preserve their step in sessionStorage
- On return, offer to continue from where they left off
- Do NOT restart from the home screen
- The path they traced has engineering value — losing it is a UX failure

---

## Cross-Journey Transitions

Journeys may link to each other at natural transition points:

| From | To | Trigger |
|---|---|---|
| Journey 1 Step 3 (Engineering Explanation) | Journey 4 | "Learn more about this technology" |
| Journey 4 Step 4 (Technology Exploration) | Journey 2 | "Protect my equipment with this technology" |
| Journey 2 Step 3 (Failure Mode) | Journey 3 | "I already have this problem" |
| Journey 3 Step 4 (Engineering Principle) | Journey 4 | "Understand the science behind this" |

Transitions carry the relevant entityId so the destination journey starts with context.
