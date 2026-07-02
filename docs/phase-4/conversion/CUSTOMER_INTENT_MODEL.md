# CUSTOMER INTENT MODEL
## ELIMFILTERS Engineering Intelligence Platform — Phase 4

---

## 1. Intent Classification

Visitor intent determines the optimal experience path.
The platform must detect intent from the first interaction and route accordingly.

Intent is classified along two axes:

**Axis A: Urgency**
- Reactive (problem exists now)
- Proactive (preventing future problems)
- Research (no immediate need)

**Axis B: Engineering Depth**
- Technical (maintenance engineer, fleet engineer, procurement specialist)
- Operational (maintenance manager, fleet manager, operations director)
- Commercial (purchasing agent, distributor, sales engineer)

---

## 2. Intent Profiles

### INTENT-1: Known Part Number

**Profile:** The visitor has a part number, OEM code, or competitor cross-reference.
They need to confirm equivalence and place an order.

**Urgency:** Reactive or scheduled maintenance.
**Engineering depth:** Low to medium (wants confirmation, not education).
**Primary question:** "Is this the right part? Can I get it?"

**Optimal path:**
```
Search bar → Part cross-reference → Engineering validation (brief) → Product → Purchase
```

**Trust signals needed:** T-4 (technology briefly), T-6 (product confirmation)
**CTA:** Add to cart / Contact distributor
**Time to conversion:** 2–5 minutes
**Conversion trigger:** Part confirmed equivalent with engineering validation

**Detection signals:**
- Query matches SKU pattern or OEM code format
- Query contains competitor brand + number (Donaldson P181059, Fleetguard LF3000)
- Query is short, alphanumeric

---

### INTENT-2: Equipment Replacement

**Profile:** The visitor is ordering routine replacement parts.
Scheduled maintenance. They know the equipment, not necessarily the filter.

**Urgency:** Scheduled (maintenance interval reached).
**Engineering depth:** Low (wants convenience, not learning).
**Primary question:** "What filter does my [equipment] take?"

**Optimal path:**
```
Equipment search → Cross-reference by model → Product confirmation → Purchase
```

**Trust signals needed:** T-6 (confident recommendation matching their equipment)
**CTA:** Product page / Distributor
**Time to conversion:** 3–7 minutes
**Conversion trigger:** Equipment confirmed, part recommended

**Detection signals:**
- Query contains equipment brand + model (Caterpillar 320, Cummins ISX, Komatsu PC200)
- Query contains engine or vehicle identifier
- Query is "filter for [equipment]"

---

### INTENT-3: Failure Diagnosis

**Profile:** The visitor has a visible equipment problem right now.
They need to understand what happened and how to fix it fast.

**Urgency:** Acute (equipment down or degrading).
**Engineering depth:** Medium (wants explanation + solution, not a lecture).
**Primary question:** "Why is this happening and how do I fix it?"

**Optimal path:**
```
Problem description → Failure mode match → Root cause explanation → Technology → Product → Distributor (fast)
```

**Trust signals needed:** T-1 (recognition), T-2 (mechanism), T-4 (technology), T-6 (recommendation)
**CTA:** Contact distributor / Request urgent consultation
**Time to conversion:** 5–10 minutes
**Conversion trigger:** Root cause understood, solution identified

**Detection signals:**
- Query contains symptom words: "fail", "broke", "pressure drop", "overheat", "black smoke"
- Query is a question: "why is my..."
- Journey 3 entry

---

### INTENT-4: Proactive Protection

**Profile:** The visitor manages a fleet or facility and wants to prevent future failures.
They are responsible for asset reliability.

**Urgency:** Proactive (no current problem, preventing future ones).
**Engineering depth:** High (wants full engineering picture, can share with team).
**Primary question:** "What is putting my equipment at risk and how do I prevent it?"

**Optimal path:**
```
Industry selection → Asset type → Risk assessment → Failure modes → Technology recommendation
→ Protection system → Engineering consultation → Quote
```

**Trust signals needed:** All 7 (T-1 through T-7)
**CTA:** Engineering consultation / Protection system quote / Technical document download
**Time to conversion:** 15–30 minutes (multi-session)
**Conversion trigger:** Protection system recommendation accepted + human contact initiated

**Detection signals:**
- Journey 2 entry
- Query contains industry + "prevent" or "protect" or "reduce"
- Multi-page session beginning with industry/equipment content

---

### INTENT-5: Technology Research

**Profile:** The visitor is evaluating ELIMFILTERS vs. alternatives.
May be building a procurement case or comparing suppliers.

**Urgency:** Deliberate (procurement cycle, 3–12 months).
**Engineering depth:** Very high (wants technical differentiation, not marketing).
**Primary question:** "What makes ELIMFILTERS technology different? Can I prove it?"

**Optimal path:**
```
Technology pages → Engineering Principle pages → Standard validation → Evidence (citations + memory)
→ Comparison context → Engineering consultation
```

**Trust signals needed:** T-2, T-3, T-4, T-5, T-6, T-7
**CTA:** Engineering consultation / Technical document / Newsletter
**Time to conversion:** Multiple sessions over days/weeks
**Conversion trigger:** Procurement decision + consultation request

**Detection signals:**
- Journey 4 entry
- Visits to multiple technology pages in sequence
- Downloads technical documents
- Returns to platform multiple times

---

### INTENT-6: Supplier Evaluation

**Profile:** The visitor is evaluating ELIMFILTERS as a supplier, not just a product.
Procurement, quality, or engineering assessment.

**Urgency:** Deliberate (vendor qualification, 1–6 months).
**Engineering depth:** Institutional (wants traceability, governance, standards compliance).
**Primary question:** "Can ELIMFILTERS be trusted as a systematic engineering supplier?"

**Optimal path:**
```
Knowledge System → Standards documentation → Provenance and governance information
→ Engineering consultation → Formal supplier evaluation
```

**Trust signals needed:** T-3, T-7 (evidence and institutional credibility primary)
**CTA:** Request formal technical documentation / Schedule engineering consultation
**Time to conversion:** Weeks to months
**Conversion trigger:** Vendor qualification completed

**Detection signals:**
- Visits to governance/provenance pages
- Interested in standards compliance documentation
- Requests company information alongside technical content

---

### INTENT-7: Distributor / Reseller

**Profile:** The visitor is a distributor or reseller evaluating the ELIMFILTERS line.

**Urgency:** Commercial (portfolio expansion decision).
**Engineering depth:** Medium-commercial (wants product breadth + positioning story).
**Primary question:** "Can I sell this? Does it compete on engineering merit?"

**Optimal path:**
```
Product line overview → Engineering differentiation story → Cross-reference coverage
→ Distributor application
```

**Trust signals needed:** T-4, T-6, T-7
**CTA:** Distributor application / Commercial consultation
**Time to conversion:** Days to weeks
**Conversion trigger:** Distributor agreement initiated

**Detection signals:**
- Visits distributor page directly
- Interest in product range breadth (cross-references, coverage)
- Commercial intent signals

---

## 3. Intent Detection Implementation

Intent is detected from three signals, in priority order:

**Signal 1: Explicit journey entry**
If the visitor entered through `/journey/protect` → INTENT-4
If the visitor entered through `/journey/diagnose` → INTENT-3
If the visitor entered through `/knowledge-system` → INTENT-5 or INTENT-6

**Signal 2: Search query pattern**
See search intent detection rules in ENGINEERING_EXPERIENCE_ARCHITECTURE.md.

**Signal 3: Behavioral signal (session)**
- First page visited
- Time on engineering content vs. product content
- Multi-session return patterns
- Pages visited in sequence

**Implementation:**
```typescript
type CustomerIntent =
  | 'KNOWN_PART'
  | 'EQUIPMENT_REPLACEMENT'
  | 'FAILURE_DIAGNOSIS'
  | 'PROACTIVE_PROTECTION'
  | 'TECHNOLOGY_RESEARCH'
  | 'SUPPLIER_EVALUATION'
  | 'DISTRIBUTOR';

interface IntentContext {
  detectedIntent: CustomerIntent;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  detectionSource: 'JOURNEY' | 'SEARCH' | 'BEHAVIOR';
  recommendedJourney: 1 | 2 | 3 | 4;
}
```

---

## 4. Intent-to-Experience Mapping

| Intent | Journey | Primary Entry | Key Components | Primary CTA |
|---|---|---|---|---|
| KNOWN_PART | J1 | SearchBar | SearchResults, TechnologyCard (brief) | Product / Distributor |
| EQUIPMENT_REPLACEMENT | J1 | SearchBar | CrossReference, ProductCard | Product |
| FAILURE_DIAGNOSIS | J3 | ProblemExplorer | FailureModeCard, RecommendationPanel | Distributor (urgent) |
| PROACTIVE_PROTECTION | J2 | AssetSelector | ProtectionSystemExplorer, RecommendationPanel | Engineering Consultation |
| TECHNOLOGY_RESEARCH | J4 | KS Hub | TechnologyCard, CitationPanel, MemoryPanel | Technical Download / Newsletter |
| SUPPLIER_EVALUATION | J4 | KS Hub | ProvenancePanel, StandardCard | Formal Documentation Request |
| DISTRIBUTOR | Direct | Distributor page | Product range, Engineering story | Distributor Application |

---

## 5. Intent Transition Rules

Visitors may change intent during a session. These transitions are common:

```
EQUIPMENT_REPLACEMENT → FAILURE_DIAGNOSIS
  Trigger: "Why does this filter fail so quickly?"
  Action: ProblemExplorer surfaced as contextual option

FAILURE_DIAGNOSIS → PROACTIVE_PROTECTION
  Trigger: Problem resolved, visitor asks "how do I prevent this?"
  Action: Journey 2 entry offered after Journey 3 completion

TECHNOLOGY_RESEARCH → SUPPLIER_EVALUATION
  Trigger: Multiple technology page visits + provenance page visit
  Action: Supplier evaluation CTA surfaced

KNOWN_PART → TECHNOLOGY_RESEARCH
  Trigger: Visitor clicks "Learn more about this technology"
  Action: TechnologyCard full mode → Journey 4 entry
```

Intent transitions always carry the current engineering context with them.
No journey restarts from zero when intent shifts mid-session.
