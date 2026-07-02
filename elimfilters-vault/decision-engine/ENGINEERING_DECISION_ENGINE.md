# Engineering Decision Engine
## Master Governing Document
### Version 1.0 | Ratified: 2026-07-01 | Status: FROZEN

---

> The platform never answers because it can.
> The platform answers because it can justify the answer.

---

## Document Control

| Field | Value |
|---|---|
| Document | ENGINEERING_DECISION_ENGINE |
| Version | 1.0 |
| Status | FROZEN — Governing Architecture |
| Ratified | 2026-07-01 |
| Authority | Subordinate to ENGINEERING_EXPERIENCE_PRINCIPLES v1.2 |
| Scope | All recommendations, diagnoses, and engineering conclusions produced by the platform |
| Related documents | DECISION_EVALUATION_MODEL, CONFIDENCE_SCORING_MODEL, EVIDENCE_REQUIREMENTS, DIAGNOSTIC_QUESTION_STRATEGY, RECOMMENDATION_GOVERNANCE, IMPLEMENTATION_PLAN |

---

## Position in Platform Architecture

```
ENGINEERING FOUNDATION
    │  (immutable — vault, knowledge graph, engineering services)
    │
    ▼
ENGINEERING DECISION ENGINE          ← this document governs
    │  (evaluates whether evidence justifies an answer)
    │
    ▼
ENGINEERING EXPERIENCE LAYER
    │  (renders engineering knowledge in customer language)
    │
    ▼
CUSTOMER
```

The Decision Engine is the final gate between the Engineering Foundation and the customer. It consumes governed engineering knowledge and evaluates whether that knowledge is sufficient to support a recommendation. It does not produce knowledge. It evaluates it.

**The Foundation governs what is true.**
**The Decision Engine governs what can be confidently stated.**
**The Experience Layer governs how it is communicated.**

---

## Why This Engine Exists

Every recommendation the platform makes represents a commitment. A commitment to the reliability of a machine, the safety of an operation, and the economic decisions of the people who depend on that machine.

A recommendation made without sufficient engineering evidence is not a recommendation. It is a guess presented as engineering judgment. That is a more dangerous failure than no answer at all.

The Engineering Decision Engine exists to make the platform's epistemic standards explicit, consistent, and measurable. It is not a filter that blocks answers. It is a standard that ensures every answer is earned.

**The platform is not measured by how many answers it produces.**
**It is measured by how reliably it knows when it has earned the right to produce one.**

---

## The Six-Step Evaluation Sequence

Every request for a recommendation, diagnosis, or engineering conclusion passes through six evaluation steps in sequence. Each step is a gate. Failure at any step stops the evaluation and produces a defined response rather than a speculative answer.

The steps are not weighted individually. They are executed in order. Each step assumes the previous has passed.

---

### Step 1 — Question Understanding

**Evaluate:** Can the customer's intent be determined with confidence?

The platform must be able to state — in engineering terms — what the customer is asking. Not paraphrase it. State it precisely enough to select the appropriate evidence and response.

**Inputs:**
- Customer statement, query, or symptom description
- Journey context (asset type, industry, operating environment if known)
- Prior session context (if available)

**Pass condition:** Customer intent maps to at least one of the following:
- A specific contamination domain (hydraulic, fuel, air intake, lube oil, cabin, compressed air)
- A specific symptom or operational observation
- A specific equipment type or application
- A specific standard or cleanliness target
- A specific technology or product type

**Fail condition:** Customer intent is ambiguous across multiple domains or cannot be mapped to governed engineering knowledge. The request is too general to evaluate.

**Response on fail:** Produce the minimum set of clarifying questions that resolves the ambiguity. See DIAGNOSTIC_QUESTION_STRATEGY for question selection rules. Stop. Do not proceed to Step 2.

---

### Step 2 — Knowledge Coverage

**Evaluate:** Does the Engineering Foundation contain sufficient governed information to support this request?

The platform may understand the customer's intent perfectly and still be unable to answer because the knowledge domain required does not exist in governed form. This is an honest limitation, not a failure.

**Inputs:**
- Identified customer intent from Step 1
- Engineering Foundation scope (contamination modes, failure modes, standards, technology architectures, protection media, engineering principles)

**Pass condition:** The Engineering Foundation contains:
- At least one contamination mode relevant to the request
- At least one applicable engineering standard
- At least one technology architecture that addresses the domain
- Engineering principles governing the failure mechanism

**Fail condition:** The domain, equipment type, application, or contaminant described by the customer falls outside the scope of governed engineering knowledge. The platform knows what the customer is asking but does not have governed knowledge to answer it.

**Response on fail:** Explain specifically what engineering knowledge is missing. Do not improvise from adjacent domains. Do not approximate with similar knowledge. State the limitation explicitly. Stop.

---

### Step 3 — Evidence Availability

**Evaluate:** What evidence sources are available for this specific request, and are they sufficient?

Evidence is not binary. It exists on a spectrum from complete to absent. This step maps which evidence sources are available and produces an evidence inventory that feeds Step 5 (Confidence Assessment).

**Evidence source categories:**

| Category | Description |
|---|---|
| Engineering Principles | Governing physical or chemical principles for the failure mechanism |
| Technology Architecture | Documented technology capabilities matching the contamination target |
| Protection Media | Specific media types and their validated performance characteristics |
| Applicable Standards | ISO/ASTM/SAE standards providing measurable targets for the domain |
| Failure Modes | Documented failure mode progression for the identified contamination |
| Contamination Data | Specific contamination entity with particle size, phase state, and sources |
| Engineering Memory | Prior observations or operational context for similar equipment or applications |
| Operating Conditions | Equipment type, application, ambient environment, duty cycle |
| Equipment Mapping | Specific equipment to filtration system relationship |
| Symptom Correlation | Observed symptoms mapped to known failure mode signatures |

**Pass condition:** Minimum evidence thresholds are met for the domain. See EVIDENCE_REQUIREMENTS for domain-specific thresholds.

**Partial pass:** Some evidence is available but below threshold. Proceeds to Step 4 but confidence will be LIMITED.

**Fail condition:** Fewer than the minimum required evidence sources are available. Evidence inventory is insufficient to support any recommendation.

**Response on fail:** Identify specifically which evidence categories are missing. Formulate targeted questions to obtain missing evidence. See DIAGNOSTIC_QUESTION_STRATEGY. Stop.

---

### Step 4 — Inference Detection

**Evaluate:** Is the platform making an inference? If so, what kind, and is it disclosable?

An inference occurs when the platform reasons from available evidence to a conclusion that the evidence does not directly state. Inferences are not prohibited. Undisclosed inferences are.

**Inference types:**

| Type | Definition | Treatment |
|---|---|---|
| Direct | Conclusion is directly stated in governed knowledge | No disclosure required — state as fact |
| Supported | Conclusion is strongly implied by convergent evidence from multiple sources | Disclose evidence basis — present as high-confidence reasoning |
| Extended | Conclusion is reasoned from adjacent or related governed knowledge | Disclose explicitly as engineering hypothesis |
| Speculative | Conclusion requires assumptions not supported by governed knowledge | Prohibited — do not present |

**Pass condition:** All inferences are of Direct, Supported, or Extended type. Speculative inferences are identified and excluded from the recommendation.

**Required disclosure for Extended inferences:**
- State explicitly: "This is an engineering hypothesis, not a verified finding."
- State the evidence basis used to form the hypothesis
- State what additional evidence would confirm or refute it

**Fail condition:** The recommendation requires Speculative inferences. Remove those elements. If removing them leaves insufficient evidence to support any recommendation, fail to Step 5 with LOW confidence.

---

### Step 5 — Confidence Assessment

**Evaluate:** What confidence level does the available evidence support?

Confidence is not a score. It is a statement about the completeness and quality of the evidence inventory relative to the requirements for this domain and request type.

**Confidence levels:**

| Level | Meaning |
|---|---|
| HIGH | All required evidence sources present; no speculative inferences; direct and supported reasoning throughout |
| MEDIUM | Most required evidence sources present; Extended inferences disclosed; conclusion is defensible with stated assumptions |
| LOW | Significant evidence gaps; reasoning relies on Extended inferences; conclusion is possible but not defensible as engineering fact |
| UNKNOWN | Evidence inventory insufficient to form any defensible conclusion; domain coverage is absent or below minimum |

**Confidence is calculated from evidence completeness, not from probability of being correct.** The platform does not have access to ground truth. It has access to governed knowledge. Confidence reflects the completeness of that knowledge relative to the request.

See CONFIDENCE_SCORING_MODEL for the detailed calculation method.

---

### Step 6 — Decision

**Evaluate:** What response is warranted given confidence level and inference type?

| Confidence | Decision | Permitted response |
|---|---|---|
| HIGH | RECOMMEND | Full recommendation with complete evidence chain |
| MEDIUM | RECOMMEND WITH DISCLOSURE | Recommendation with explicit statement of assumptions, inference types, and limitations |
| LOW | DO NOT RECOMMEND | Continue diagnostic questioning. State what evidence is needed to reach MEDIUM or HIGH. |
| UNKNOWN | NO RESPONSE | Explain why additional engineering information is required. Do not speculate. |

**The LOW decision is not a failure.** It is an accurate statement that the platform has not yet earned the right to recommend. Continuing the diagnostic consultation to gather missing evidence is the correct response.

**The UNKNOWN decision is not a failure.** It is an honest acknowledgment that the platform does not have sufficient knowledge to contribute. Explaining what is missing is more valuable than producing an unsupported answer.

---

## What the Engine Never Does

The Engineering Decision Engine never:

- Produces a recommendation because a matching product exists
- Approximates a recommendation from adjacent knowledge when the required knowledge is absent
- Presents an inference as a verified finding
- Conceals uncertainty in the confidence level
- Escalates confidence to justify presenting a recommendation
- Asks questions for which the answers would not change the recommendation
- Treats time pressure or customer impatience as justification for relaxing evidence standards

---

## Governance

**The Decision Engine does not change engineering knowledge.**
It evaluates existing governed knowledge against defined evidence standards.

**The Foundation remains immutable.**
The engine consumes it. It does not modify it.

**Engineering Services remain the only access layer to governed knowledge.**
The Decision Engine reads from Services. It never accesses the Foundation directly.

**The six steps are executed in sequence.**
Steps may not be reordered, skipped, or merged.

**Confidence levels may not be overridden.**
A MEDIUM confidence output cannot be presented as HIGH. A LOW output cannot be presented as MEDIUM. The confidence level produced by the evaluation is the confidence level presented to the customer.

---

## The Safety Principle

When in doubt between answering and not answering, the Decision Engine always chooses not answering.

Engineering credibility is more valuable than immediate answers.

A customer who receives an honest "I do not yet have enough engineering evidence to recommend" learns that the platform's recommendations are trustworthy when they do appear.

A customer who receives a speculative recommendation presented as engineering judgment will eventually discover the speculation. The trust damage is not recoverable.

---

## Citation Reference

```
CANONICAL GOVERNANCE BLOCK: Engineering Decision Engine

DOCUMENT
Engineering Decision Engine v1.0

PURPOSE
The Engineering Decision Engine governs whether sufficient engineering evidence
exists to justify a recommendation, diagnosis, or engineering conclusion.
It executes before any answer reaches the customer.

SIX EVALUATION STEPS (FROZEN)
Step 1: Question Understanding — can customer intent be determined with confidence?
Step 2: Knowledge Coverage — does governed knowledge cover this domain?
Step 3: Evidence Availability — are required evidence sources present?
Step 4: Inference Detection — what type of reasoning is being applied?
Step 5: Confidence Assessment — what confidence does the evidence support?
Step 6: Decision — HIGH/MEDIUM recommend; LOW/UNKNOWN do not recommend

CONFIDENCE LEVELS (FROZEN)
HIGH: All evidence present; direct/supported reasoning; recommend
MEDIUM: Most evidence present; extended inferences disclosed; recommend with caveats
LOW: Significant gaps; do not recommend; continue diagnostic questioning
UNKNOWN: Insufficient coverage; no response; explain what is missing

SAFETY PRINCIPLE
The platform always prefers "I do not yet have enough engineering evidence"
over an unjustified recommendation.

CITATION_REFERENCE
source: elimfilters-vault/decision-engine/ENGINEERING_DECISION_ENGINE.md
document: Engineering Decision Engine
version: 1.0
ratified: 2026-07-01
status: FROZEN
```
