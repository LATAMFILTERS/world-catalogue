# Decision Evaluation Model
## Engineering Decision Engine — Step Specification
### Version 1.1 | Ratified: 2026-07-01 | Last amended: 2026-07-02 | Status: FROZEN

---

## Document Control

| Field | Value |
|---|---|
| Document | DECISION_EVALUATION_MODEL |
| Version | 1.1 |
| Status | FROZEN — Governing Architecture |
| Ratified | 2026-07-01 |
| Last amended | 2026-07-02 — Amendment A1: Step 5a (PROHIBITED Gate) added; Step 6 updated with PROHIBITED decision path |
| Authority | Subordinate to ENGINEERING_DECISION_ENGINE v1.1 |
| Scope | Detailed specification of each evaluation step in the six-step sequence |

---

## Purpose

The Engineering Decision Engine executes six steps in sequence. ENGINEERING_DECISION_ENGINE.md defines what each step evaluates. This document defines how each step evaluates it — the specific inputs, evaluation logic, decision criteria, and outputs that make each step operational.

---

## Step 1 — Question Understanding: Detailed Model

### Objective

Produce a precise, engineering-level statement of customer intent that is sufficient to select appropriate evidence and determine applicable knowledge domains.

### Input Processing

**Raw input forms accepted:**
- Symptom description ("black smoke from exhaust under load")
- Equipment description with problem ("excavator hydraulic pressure dropping after 500 hours")
- Direct question ("what filter rating do I need for a HPCR diesel injection system?")
- Product inquiry that reveals underlying need ("looking for a replacement for Donaldson P119344")
- Standards query ("what does ISO 4406 18/16/13 mean?")

**Context enrichment:**
- If prior session context exists, the platform extracts: asset type, operating environment, contamination symptoms previously identified, any cleanliness targets already stated.
- Context reduces the question scope — a customer who identified their asset as a mining haul truck in a prior step is not asked about asset type again.

### Intent Classification

Customer intent must resolve to at least one of these primary intents:

| Intent Class | Definition | Example trigger phrases |
|---|---|---|
| FAILURE_DIAGNOSIS | Customer observing active or recent failure symptom | "keeps failing," "pressure dropping," "smoke," "overheating," "won't start" |
| PROACTIVE_PROTECTION | Customer wants to prevent known failure modes | "how do I protect," "what should I use," "interval optimization" |
| TECHNOLOGY_RESEARCH | Customer evaluating technology options | "difference between," "which technology," "what does X do" |
| STANDARDS_INTERPRETATION | Customer interpreting or applying a standard | "what does ISO X mean," "what rating do I need," "how do I read" |
| EQUIPMENT_REPLACEMENT | Customer replacing or specifying for a known asset | "replacement for," "equivalent to," "fits my" |
| SUPPLIER_EVALUATION | Customer assessing ELIMFILTERS as a source | "do you make," "can you supply," "what do you offer for" |
| DISTRIBUTOR_INQUIRY | Distributor-level inquiry for product or program access | "distributor pricing," "stock availability," "program requirements" |

**Intent may be compound.** A customer describing a hydraulic pressure failure while asking which filter to use has both FAILURE_DIAGNOSIS and EQUIPMENT_REPLACEMENT intent. Both are recorded. The primary intent governs the evaluation path. The secondary intent is resolved after the primary.

### Pass Criteria

**PASS** if intent resolves to at least one Intent Class AND maps to at least one of:
- A specific contamination domain (hydraulic, fuel, air intake, lube oil, cabin, compressed air)
- A specific symptom or operational observation
- A specific equipment type or application
- A specific standard or cleanliness target
- A specific technology type

**FAIL** if:
- Intent cannot be classified into any Intent Class
- Intent maps to multiple domains with no way to prioritize
- Statement is too general to select any evidence ("help me with filtration")

### Output

- Primary intent class
- Secondary intent class (if compound)
- Relevant contamination domain(s)
- Relevant equipment type (if stated)
- Relevant symptom(s) (if stated)
- Relevant standard(s) (if stated)
- Ambiguity flag: RESOLVED or UNRESOLVED

**On UNRESOLVED:** Produce the minimum clarifying questions per DIAGNOSTIC_QUESTION_STRATEGY. Do not proceed to Step 2.

---

## Step 2 — Knowledge Coverage: Detailed Model

### Objective

Confirm that the Engineering Foundation contains governed knowledge sufficient to evaluate the customer's intent. The platform may understand the intent perfectly and still be unable to proceed if the required domain is outside governed knowledge.

### Coverage Assessment

The Engineering Foundation is assessed against four coverage requirements:

**Requirement 1 — Contamination Mode Coverage**
At least one contamination mode relevant to the identified domain must exist in the Foundation. The contamination mode must include: particle characterization OR chemical identity, failure mechanism chain, severity parameters.

**Requirement 2 — Standard Coverage**
At least one applicable engineering standard must exist in the Foundation for the domain. The standard must include: scope, measurement methodology, and at least one quantified cleanliness target or performance threshold.

**Requirement 3 — Technology Architecture Coverage**
At least one technology architecture that addresses the domain must be documented. The technology must include: operating principle, filtration mechanism, performance specification.

**Requirement 4 — Engineering Principle Coverage**
At least one governing engineering principle for the failure mechanism must exist. The principle must explain why the failure occurs, not just that it occurs.

### Coverage Map by Domain

| Domain | Primary Contamination Modes | Primary Standards | Primary Technologies |
|---|---|---|---|
| Air Intake | CONT-DUST-MINERAL, CONT-DUST-ORGANIC | ISO 5011, SAE J1539 | MACROCORE, INTEKCORE |
| Fuel | CONT-WATER-FUEL, CONT-PARTICLE-FUEL | ASTM D6304, ISO 12937, ISO 16332 | HYDROCORE, SYNTEPORE, TURBOCORE |
| Hydraulic | CONT-WEAR-PARTICLE-HYD, CONT-WATER-HYD | ISO 4406, ISO 16889, NFPA T2.14, DIN 51524 | NANOFORCE |
| Lube Oil | CONT-WEAR-PARTICLE-OIL, CONT-SOOT-OIL | ISO 4406, ISO 16889, SAE J1211 | SYNTRAX |
| Cabin | CONT-PM10-CABIN, CONT-VOC-CABIN | ISO 11155, DIN 71220 | MICROKAPPA |
| Compressed Air | CONT-MOISTURE-AIR, CONT-OIL-AIR | ISO 8573-1, ISO 8573-2, ISO 8573-3 | DRYCORE |

### Pass Criteria

**PASS** if all four coverage requirements are met.

**PARTIAL** if three of four requirements are met. Document which requirement is missing. Proceed to Step 3. The missing requirement will constrain the confidence level in Step 5.

**FAIL** if fewer than three requirements are met. The domain is outside governed knowledge.

### Output

- Coverage status: FULL / PARTIAL / FAIL
- Which of the four requirements are met (checklist)
- For PARTIAL: which requirement is missing and why
- For FAIL: explicit statement of what knowledge is absent

**On FAIL:** State specifically what engineering knowledge is missing. Do not approximate from adjacent domains. Do not synthesize from related knowledge. Stop.

---

## Step 3 — Evidence Availability: Detailed Model

### Objective

Inventory the specific evidence available for this specific request — not the domain in general, but this request: this equipment, this symptom, this environment. Produce an evidence inventory that feeds directly into Step 5.

### Evidence Source Evaluation

Each of the ten evidence source categories is assessed individually:

**Category 1 — Engineering Principles**
- Available if: the governing physical or chemical principle for the failure mechanism is documented in the Foundation
- Availability levels: PRESENT (principle documented with mechanism chain) / PARTIAL (principle known but mechanism chain incomplete) / ABSENT

**Category 2 — Technology Architecture**
- Available if: a technology architecture document exists that addresses the contamination target
- Availability levels: PRESENT (full performance spec available) / PARTIAL (technology exists but performance data incomplete) / ABSENT

**Category 3 — Protection Media**
- Available if: specific filter media types and their validated performance characteristics are documented for this application
- Availability levels: PRESENT / PARTIAL / ABSENT

**Category 4 — Applicable Standards**
- Available if: at least one standard is applicable that provides measurable targets for this domain and request
- Availability levels: PRESENT (standard with full measurement methodology) / PARTIAL (standard referenced without specific targets for this use) / ABSENT

**Category 5 — Failure Modes**
- Available if: the specific failure mode progression for the identified contamination is documented
- Availability levels: PRESENT / PARTIAL / ABSENT

**Category 6 — Contamination Data**
- Available if: the specific contamination entity is characterized with particle size, phase state, and contamination sources
- Availability levels: PRESENT (full characterization) / PARTIAL (partial characterization) / ABSENT

**Category 7 — Engineering Memory**
- Available if: prior observations from similar equipment or applications are available
- Availability levels: PRESENT (direct match) / PARTIAL (adjacent match requiring inference) / ABSENT

**Category 8 — Operating Conditions**
- Available if: equipment type, application, ambient environment, and duty cycle are known for this request
- Note: this category is controlled by customer-provided information. Cannot be inferred.
- Availability levels: KNOWN (customer provided) / PARTIAL (some operating context known) / UNKNOWN (customer has not provided)

**Category 9 — Equipment Mapping**
- Available if: the specific equipment-to-filtration-system relationship is documented or can be determined
- Availability levels: MAPPED (documented) / INFERABLE (can be determined from equipment type + application) / UNKNOWN

**Category 10 — Symptom Correlation**
- Available if: observed symptoms are mappable to known failure mode signatures
- Only applies to FAILURE_DIAGNOSIS intent
- Availability levels: CORRELATED / PARTIAL / UNCORRELATED

### Evidence Inventory Output

The evidence inventory is a structured record:

```
EVIDENCE INVENTORY
Request: [customer intent summary]
Domain: [contamination domain]

Category 1 — Engineering Principles:     [PRESENT / PARTIAL / ABSENT]
Category 2 — Technology Architecture:    [PRESENT / PARTIAL / ABSENT]
Category 3 — Protection Media:           [PRESENT / PARTIAL / ABSENT]
Category 4 — Applicable Standards:       [PRESENT / PARTIAL / ABSENT]
Category 5 — Failure Modes:              [PRESENT / PARTIAL / ABSENT]
Category 6 — Contamination Data:         [PRESENT / PARTIAL / ABSENT]
Category 7 — Engineering Memory:         [PRESENT / PARTIAL / ABSENT]
Category 8 — Operating Conditions:       [KNOWN / PARTIAL / UNKNOWN]
Category 9 — Equipment Mapping:          [MAPPED / INFERABLE / UNKNOWN]
Category 10 — Symptom Correlation:       [CORRELATED / PARTIAL / UNCORRELATED / N/A]

Evidence completeness score: [X of 10 categories at PRESENT/KNOWN/MAPPED/CORRELATED level]
```

### Pass Criteria

See EVIDENCE_REQUIREMENTS for domain-specific minimum thresholds.

**PASS** if evidence meets or exceeds minimum threshold for the domain.

**PARTIAL PASS** if evidence is below threshold but above a minimum floor. Proceeds to Step 4 with LIMITED confidence flag.

**FAIL** if evidence is below the minimum floor. The inventory is insufficient to form any recommendation.

**On FAIL:** Identify specifically which categories are absent. Formulate targeted questions to obtain missing evidence. Stop.

---

## Step 4 — Inference Detection: Detailed Model

### Objective

Identify every inference in the proposed recommendation or conclusion. Classify each inference. Exclude prohibited inference types. Flag required disclosures.

### Inference Audit Process

For each claim in the proposed recommendation:

1. **Identify the claim.** What is being asserted?
2. **Identify the evidence source.** Which category (or categories) from the evidence inventory supports this claim?
3. **Classify the inference type:**

**DIRECT inference:**
- The claim is explicitly stated in governed knowledge.
- Evidence source directly asserts the claim.
- No reasoning chain required — only retrieval.
- Example: "ISO 4406 particle codes measure particle counts at three size thresholds: 4µm(c), 6µm(c), 14µm(c)."

**SUPPORTED inference:**
- The claim is not explicitly stated but is strongly implied by convergent evidence from multiple sources.
- Requires a documented evidence chain: [Source A] + [Source B] → [Claim].
- Example: "Combining the documented failure progression (Category 5) with the operating conditions (Category 8) and the symptom correlation (Category 10), the most probable diagnosis is hydraulic proportional valve stiction caused by particle contamination in the 5–15µm range."

**EXTENDED inference:**
- The claim is reasoned from adjacent or related governed knowledge that does not directly address this specific situation.
- Requires explicit disclosure as hypothesis.
- The evidence basis must be stated.
- What additional evidence would confirm or refute the hypothesis must be stated.
- Example: "Based on the documented failure mode progression for similar bearing types (Category 5 — partial match) and the general engineering principle of particle size vs. clearance relationships (Category 1), the observed symptom pattern is consistent with early-stage abrasive wear. This is an engineering hypothesis. It would be confirmed by oil analysis showing elevated silicon and iron content."

**SPECULATIVE inference:**
- The claim requires assumptions not supported by any governed knowledge.
- No valid evidence chain exists.
- PROHIBITED. Must be excluded from any recommendation.
- Example: "This equipment probably has contamination because you mentioned it's working in a construction site." (Operating environment assumed, not documented.)

### Audit Output

For each claim in the recommendation:
- Claim text
- Inference type: DIRECT / SUPPORTED / EXTENDED / SPECULATIVE
- Evidence categories supporting the claim (list)
- Disclosure required: YES / NO
- Disclosure text (if required)

### Pass Criteria

**PASS** if all claims are DIRECT, SUPPORTED, or EXTENDED — and all EXTENDED claims have disclosure text prepared.

**CONDITIONAL PASS** if SPECULATIVE inferences are present but can be removed without eliminating the recommendation entirely. Remove them. Re-assess the remaining claims.

**FAIL** if removing SPECULATIVE inferences eliminates the ability to form any recommendation. Proceed to Step 5 with LOW confidence flag.

---

## Step 5 — Confidence Assessment: Detailed Model

### Objective

Assign a confidence level based on the evidence inventory and inference audit. The confidence level is determined by defined criteria, not by judgment.

### Confidence Determination Rules

**HIGH confidence requires all of the following:**
- Evidence inventory: Categories 1, 2, 4, 5, and 6 all at PRESENT level
- Evidence inventory: Categories 8 and 9 at KNOWN/MAPPED level
- Inference audit: All claims are DIRECT or SUPPORTED — no EXTENDED inferences
- No PARTIAL PASS or FAIL flags from Steps 2–4

**MEDIUM confidence requires all of the following:**
- Evidence inventory: At minimum, Categories 1, 4, and 5 at PRESENT level
- Evidence inventory: At least 5 of 10 categories at PRESENT/KNOWN/MAPPED level
- Inference audit: EXTENDED inferences present but all have disclosure text prepared
- No FAIL flags from Steps 2–4
- SPECULATIVE inferences removed

**LOW confidence applies when:**
- Evidence inventory below MEDIUM threshold
- Or: EXTENDED inferences cannot be adequately disclosed (evidence basis too weak to state coherently)
- Or: One or more FAIL flags from Steps 2–4
- Or: PARTIAL PASS from Step 3 with evidence floor concern

**UNKNOWN confidence applies when:**
- Step 2 returned FAIL (domain not covered)
- Or: Step 3 returned FAIL (evidence below minimum floor)
- Or: Evidence inventory has fewer than 3 categories at PRESENT/KNOWN level
- Or: After removing SPECULATIVE inferences, no defensible claim remains

### Override Prohibition

Confidence levels may not be upgraded based on:
- Time pressure or customer urgency
- Availability of matching products in the catalogue
- The customer's apparent expertise or confidence
- A desire to avoid saying "I don't know"
- Proximity of the domain to a well-known domain

Confidence levels may only be upgraded when additional evidence is obtained that satisfies the criteria for the higher level.

### Output

- Confidence level: HIGH / MEDIUM / LOW / UNKNOWN
- Evidence completeness summary (from Step 3 inventory)
- Inference summary (from Step 4 audit)
- Specific limiting factors (which criteria prevented HIGH or MEDIUM)
- What evidence would upgrade confidence to the next level

---

## Step 5a — PROHIBITED Gate: Detailed Model

### Objective

Before confidence is scored, assess whether the minimum conditions for responsible reasoning have been established. This gate is binary: PROHIBITED or NOT PROHIBITED.

### PROHIBITED Conditions

The evaluation is PROHIBITED if any one of the following conditions is true:

**Condition 1 — Unknown Equipment**
The equipment type cannot be determined from available evidence and cannot be reasonably inferred from operating context. Example: customer has described a symptom but not the equipment on which the symptom is occurring.

**Condition 2 — Unknown Contamination Source**
The contamination type, source, or mode cannot be identified even at a PARTIAL level. Example: in the fuel domain, neither water contamination nor particulate contamination can be determined from available evidence.

**Condition 3 — Unknown Operating Conditions (domain-specific)**
For domains where operating conditions are CRITICAL-CONTEXTUAL (see CONFIDENCE_SCORING_MODEL):
- Cabin Safety domain: operating environment is unknown — PROHIBITED
- Compressed Air domain: end-use application is unknown — PROHIBITED
- Fuel domain (FAILURE_DIAGNOSIS intent): contamination type is unknown — PROHIBITED

**Condition 4 — Conflicting Evidence**
Two or more evidence sources provide contradictory information about the same engineering fact. Example: symptom correlation suggests hydraulic valve stiction, but the documented oil analysis shows contamination consistent with bearing wear rather than valve contamination. The conflict must be resolved before reasoning can proceed.

**Condition 5 — Evidence Floor Not Met**
The domain-specific evidence floor requirements (per EVIDENCE_REQUIREMENTS) have not been met. The categories designated as "non-negotiable" for the domain are ABSENT.

### PROHIBITED Response

When PROHIBITED:

1. **Do not assess confidence.** Skip Step 5 (confidence scoring) entirely.
2. **Do not form any reasoning.** No engineering hypothesis, no tentative direction, no "it's probably X."
3. **Do not present any engineering conclusion.** No partial answers.
4. **Request minimum required information only.** Apply the Question Economy Principle from DIAGNOSTIC_QUESTION_STRATEGY:
   - Identify exactly which PROHIBITED condition is triggered
   - Produce only the questions that resolve that specific condition
   - Do not ask questions unrelated to the PROHIBITED condition

**PROHIBITED response format:**

```
ENGINEERING EVALUATION — PROHIBITED

The platform cannot form a responsible engineering conclusion at this time.

REASON: [Specific PROHIBITED condition: e.g., "The contamination type in the
fuel system has not been determined. Water contamination and particulate
contamination require different protection strategies. Proceeding without this
information would produce a recommendation that may not address the actual
failure mechanism."]

INFORMATION REQUIRED:
[Minimum questions — one per unresolved PROHIBITED condition]
[Every question materially changes the engineering decision if answered differently]
```

### NOT PROHIBITED — Proceed to Step 5

If none of the five PROHIBITED conditions is triggered, the evaluation proceeds to Step 5 (Confidence Assessment). The PROHIBITED gate is cleared.

---

## Step 6 — Decision: Detailed Model

### Objective

Determine the permitted response given decision state, confidence level, and inference types.

### Decision Rules — Part A: PROHIBITED State

**If the PROHIBITED gate triggered in Step 5a:**

The evaluation stops here. The response is the PROHIBITED response format defined in Step 5a. Step 6 produces no further output.

**PROHIBITED → REQUEST MINIMUM INFORMATION**

---

### Decision Rules — Part B: Confidence Level (if NOT PROHIBITED)

**HIGH confidence → RECOMMEND**

Permitted actions:
- State recommendation with complete evidence chain
- Cite all evidence categories used
- Reference applicable standards and measured targets
- Identify technology architectures selected and explain why
- Product recommendations may be included as implementation of the technology recommendation

Required elements:
- Primary recommendation with evidence chain
- Applicable standards and cleanliness targets
- Technology selection rationale
- Implementation guidance

Prohibited elements:
- Overstating certainty beyond evidence level
- Adding claims not supported by evidence
- Recommending products not matched to the engineering recommendation

---

**MEDIUM confidence → RECOMMEND WITH DISCLOSURE**

Permitted actions:
- State recommendation with complete evidence chain
- All EXTENDED inference disclosures must appear in the response
- Assumptions must be explicitly stated
- Limitations must be explicitly stated

Required elements (in addition to HIGH requirements):
- Explicit confidence level disclosure: "This recommendation is made at MEDIUM confidence. The following assumptions have been made: [list]."
- All EXTENDED inference disclosures with evidence basis
- Statement of what additional evidence would upgrade confidence to HIGH
- Clear differentiation between verified findings and engineering hypotheses

---

**LOW confidence → DO NOT RECOMMEND**

Permitted actions:
- State what evidence is missing
- Formulate the minimum targeted questions to obtain missing evidence
- Explain what a recommendation would look like if evidence were obtained

Prohibited actions:
- Presenting a recommendation, even with caveats
- Using hedging language ("probably," "likely") to present a LOW confidence conclusion as a recommendation
- Treating the LOW decision as a failure — it is an accurate statement that evidence is insufficient

Required elements:
- Explicit statement: "I do not yet have sufficient engineering evidence to recommend for this request."
- List of missing evidence categories
- Minimum set of targeted questions per DIAGNOSTIC_QUESTION_STRATEGY
- Statement of what confidence level would be achievable once evidence is obtained

---

**UNKNOWN confidence → NO RESPONSE**

Permitted actions:
- Explain why the platform cannot contribute to this request
- State specifically what engineering knowledge is absent
- Offer to address adjacent questions where knowledge exists

Prohibited actions:
- Any recommendation, even tentative
- Any inference, even labeled as speculative
- Approximating from adjacent domains

Required elements:
- Explicit statement: "The Engineering Foundation does not contain sufficient governed knowledge to evaluate this request."
- Specific identification of what is absent (domain, contamination mode, standard, technology, or principle)
- Adjacent areas where the platform can contribute, if any

---

## Evaluation Integrity

The six steps plus the PROHIBITED gate are executed in sequence for every request. This model does not change based on:
- The complexity of the request (simple requests get full evaluation)
- The expertise of the customer (domain experts get the same evaluation standard)
- The urgency of the situation (urgency does not relax evidence requirements)
- The commercial value of the opportunity (revenue does not influence confidence level)

The evaluation is complete when Step 6 produces an output. The output is the response.

---

## Citation Reference

```
CANONICAL GOVERNANCE BLOCK: Decision Evaluation Model

DOCUMENT
Decision Evaluation Model v1.0

PURPOSE
Defines the detailed operational specification for each of the six steps
in the Engineering Decision Engine evaluation sequence.

SCOPE
All requests for recommendations, diagnoses, and engineering conclusions.

AUTHORITY
Subordinate to ENGINEERING_DECISION_ENGINE v1.0.
Must be read in conjunction with:
- CONFIDENCE_SCORING_MODEL
- EVIDENCE_REQUIREMENTS
- DIAGNOSTIC_QUESTION_STRATEGY

CITATION_REFERENCE
source: elimfilters-vault/decision-engine/DECISION_EVALUATION_MODEL.md
document: Decision Evaluation Model
version: 1.0
ratified: 2026-07-01
status: FROZEN
```
