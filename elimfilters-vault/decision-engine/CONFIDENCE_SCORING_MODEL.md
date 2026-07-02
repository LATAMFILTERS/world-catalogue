# Confidence Scoring Model
## Engineering Decision Engine — Evidence-Based Confidence Calculation
### Version 1.0 | Ratified: 2026-07-01 | Status: FROZEN

---

## Document Control

| Field | Value |
|---|---|
| Document | CONFIDENCE_SCORING_MODEL |
| Version | 1.0 |
| Status | FROZEN — Governing Architecture |
| Ratified | 2026-07-01 |
| Authority | Subordinate to ENGINEERING_DECISION_ENGINE v1.0 |
| Scope | Evidence-based method for determining confidence level output |

---

## What Confidence Measures

Confidence in this model is not:
- A probability estimate of being correct
- A score assigned by judgment or intuition
- A measure of the customer's certainty
- A measure of how often this type of question has been answered before

Confidence is:
**A measure of evidence completeness relative to the requirements for this domain and request type.**

The platform does not have access to ground truth. It has access to governed engineering knowledge. Confidence reflects how much of the required governed knowledge is present, in the right form, for the specific request being evaluated.

A recommendation made on 100% of available evidence — even if that evidence is incomplete relative to the domain — is a HIGH confidence recommendation about what can be concluded from what is known. It is not a claim that the conclusion is correct in the real world.

---

## Evidence Weighting by Category

Not all evidence categories carry equal weight. The weight reflects the category's role in forming a defensible engineering recommendation.

### Weight Table

| Category | Weight Class | Rationale |
|---|---|---|
| 1 — Engineering Principles | PRIMARY | Without governing principles, no causal chain can be established |
| 2 — Technology Architecture | PRIMARY | Without technology documentation, recommendations are not defensible |
| 4 — Applicable Standards | PRIMARY | Without standards, there is no external reference for cleanliness targets |
| 5 — Failure Modes | PRIMARY | Without failure mode documentation, causal diagnosis is not possible |
| 6 — Contamination Data | PRIMARY | Without contamination characterization, the target is undefined |
| 8 — Operating Conditions | CRITICAL-CONTEXTUAL | Customer-provided; without it, all domain-specific conclusions are approximations |
| 3 — Protection Media | SECONDARY | Adds specificity to technology recommendations; required for HIGH confidence |
| 7 — Engineering Memory | SECONDARY | Adds operational context; valuable but not required for defensibility |
| 9 — Equipment Mapping | SECONDARY | Required for product-level specificity; not required for technology-level recommendation |
| 10 — Symptom Correlation | TERTIARY (DIAGNOSIS ONLY) | Required only for FAILURE_DIAGNOSIS intent; not applicable to other intent classes |

### Weight Assignment

| Weight Class | Score Contribution (per category present) |
|---|---|
| PRIMARY | 15 points |
| CRITICAL-CONTEXTUAL | 15 points |
| SECONDARY | 8 points |
| TERTIARY | 7 points |

**Maximum possible score: 100 points**
- 5 PRIMARY categories × 15 = 75 points
- 1 CRITICAL-CONTEXTUAL × 15 = 15 points
- 3 SECONDARY categories × 8 = 24 points (capped at 15 in standard scoring; see below)
- 1 TERTIARY category × 7 = 7 points (only in FAILURE_DIAGNOSIS; otherwise redistributed)

### Score Normalization by Intent Class

Different intent classes have different applicable category sets. The score is normalized to 100 for each intent class.

**FAILURE_DIAGNOSIS intent (all 10 categories applicable):**

| Category | Points |
|---|---|
| 1 — Engineering Principles | 15 |
| 2 — Technology Architecture | 13 |
| 4 — Applicable Standards | 13 |
| 5 — Failure Modes | 15 |
| 6 — Contamination Data | 13 |
| 8 — Operating Conditions | 15 |
| 3 — Protection Media | 5 |
| 7 — Engineering Memory | 4 |
| 9 — Equipment Mapping | 5 |
| 10 — Symptom Correlation | 2 |
| **Total** | **100** |

**PROACTIVE_PROTECTION intent (symptom correlation not applicable):**

| Category | Points |
|---|---|
| 1 — Engineering Principles | 17 |
| 2 — Technology Architecture | 15 |
| 4 — Applicable Standards | 15 |
| 5 — Failure Modes | 15 |
| 6 — Contamination Data | 14 |
| 8 — Operating Conditions | 14 |
| 3 — Protection Media | 5 |
| 7 — Engineering Memory | 3 |
| 9 — Equipment Mapping | 2 |
| **Total** | **100** |

**TECHNOLOGY_RESEARCH and STANDARDS_INTERPRETATION intent:**

| Category | Points |
|---|---|
| 1 — Engineering Principles | 22 |
| 2 — Technology Architecture | 22 |
| 4 — Applicable Standards | 22 |
| 5 — Failure Modes | 14 |
| 6 — Contamination Data | 10 |
| 8 — Operating Conditions | 5 |
| 3 — Protection Media | 5 |
| **Total** | **100** |
| (Categories 7, 9, 10 not applicable) | |

**EQUIPMENT_REPLACEMENT intent:**

| Category | Points |
|---|---|
| 2 — Technology Architecture | 20 |
| 4 — Applicable Standards | 20 |
| 8 — Operating Conditions | 18 |
| 9 — Equipment Mapping | 18 |
| 3 — Protection Media | 12 |
| 6 — Contamination Data | 8 |
| 1 — Engineering Principles | 4 |
| **Total** | **100** |
| (Categories 5, 7, 10 not applicable) | |

---

## Partial Credit

Categories are not binary. A PARTIAL availability rating receives half credit.

| Availability Rating | Score |
|---|---|
| PRESENT / KNOWN / MAPPED / CORRELATED | Full points |
| PARTIAL / INFERABLE | Half points (rounded down) |
| ABSENT / UNKNOWN / UNCORRELATED | 0 points |

---

## Inference Adjustment

The raw evidence score is adjusted based on the inference audit from Step 4.

### Adjustment Table

| Inference type composition | Adjustment |
|---|---|
| All DIRECT | +5 |
| All DIRECT + SUPPORTED | 0 |
| Any EXTENDED (with disclosure) | −10 |
| Multiple EXTENDED (all with disclosure) | −15 |
| Any EXTENDED without disclosure | −25 (EXTENDED without disclosure is treated as SPECULATIVE) |
| Any SPECULATIVE (should have been removed) | −30 per instance |

The adjustment is applied after the raw score calculation. Negative adjustments may lower the confidence tier.

---

## Confidence Tier Thresholds

| Final Score (after adjustments) | Confidence Level |
|---|---|
| 85–100 | HIGH |
| 65–84 | MEDIUM |
| 40–64 | LOW |
| 0–39 | UNKNOWN |

### Hard Floor Rules

Regardless of score, the following conditions force a lower tier:

**Forces UNKNOWN:**
- Step 2 returned FAIL (domain not covered)
- Step 3 returned FAIL (evidence below minimum floor)
- Category 1 (Engineering Principles) is ABSENT
- Category 4 (Applicable Standards) is ABSENT AND Category 2 (Technology Architecture) is ABSENT

**Forces LOW (cannot be MEDIUM or HIGH):**
- Category 8 (Operating Conditions) is UNKNOWN for FAILURE_DIAGNOSIS or PROACTIVE_PROTECTION intent
- Category 5 (Failure Modes) is ABSENT for FAILURE_DIAGNOSIS intent
- Score would require ≥3 EXTENDED inferences to reach MEDIUM

**Forces MEDIUM (cannot be HIGH):**
- Any EXTENDED inference is present, regardless of score
- Category 3 (Protection Media) is ABSENT for EQUIPMENT_REPLACEMENT intent

---

## Score Calculation Procedure

1. Identify the intent class from Step 1 output
2. Select the applicable scoring table for that intent class
3. For each applicable category, assign: full points, half points, or 0 — based on availability rating from Step 3
4. Sum raw evidence score
5. Apply inference adjustment from Step 4 audit
6. Check hard floor rules
7. Map final score to confidence tier

---

## Example Calculation

**Request:** Hydraulic system on a mining excavator showing pressure drop after 500 hours. Customer confirmed: 300-bar operating pressure, open-center circuit, ambient temperature 35°C.

**Intent class:** FAILURE_DIAGNOSIS

**Evidence inventory (FAILURE_DIAGNOSIS scoring table):**

| Category | Availability | Points Available | Points Scored |
|---|---|---|---|
| 1 — Engineering Principles | PRESENT | 15 | 15 |
| 2 — Technology Architecture | PRESENT | 13 | 13 |
| 4 — Applicable Standards | PRESENT | 13 | 13 |
| 5 — Failure Modes | PARTIAL | 15 | 7 |
| 6 — Contamination Data | PRESENT | 13 | 13 |
| 8 — Operating Conditions | KNOWN | 15 | 15 |
| 3 — Protection Media | PARTIAL | 5 | 2 |
| 7 — Engineering Memory | PRESENT | 4 | 4 |
| 9 — Equipment Mapping | INFERABLE | 5 | 2 |
| 10 — Symptom Correlation | PARTIAL | 2 | 1 |
| **Raw score** | | **100** | **85** |

**Inference audit:** One EXTENDED inference (symptom correlation to specific valve failure — cannot confirm without internal pressure test data). Disclosure prepared.

**Inference adjustment:** −10 (one EXTENDED with disclosure)

**Adjusted score:** 85 − 10 = **75**

**Hard floor check:** Category 8 KNOWN ✓, Category 5 PARTIAL (not ABSENT) ✓. No hard floors triggered. One EXTENDED inference → cannot be HIGH.

**Confidence level:** MEDIUM (score 75, EXTENDED inference present → hard floor cap at MEDIUM)

**Output:** RECOMMEND WITH DISCLOSURE
- State: "This recommendation is made at MEDIUM confidence. One engineering hypothesis is included and disclosed."
- State the EXTENDED inference basis
- State what pressure testing or oil analysis would confirm it

---

## Citation Reference

```
CANONICAL GOVERNANCE BLOCK: Confidence Scoring Model

DOCUMENT
Confidence Scoring Model v1.0

PURPOSE
Defines the evidence-based method for calculating confidence level output
in the Engineering Decision Engine. Confidence measures evidence completeness,
not probability of correctness.

CONFIDENCE TIERS
HIGH (85–100): All primary evidence present; direct/supported reasoning only
MEDIUM (65–84): Most evidence present; extended inferences disclosed
LOW (40–64): Significant gaps; do not recommend; continue questioning
UNKNOWN (0–39): Insufficient knowledge coverage; no response

ADJUSTMENT RULES
Extended inference: −10 per occurrence (with disclosure)
Speculative inference: −30 per instance (should have been removed in Step 4)

HARD FLOOR RULES
UNKNOWN forced: Domain not covered, or Engineering Principles absent
LOW forced: Operating conditions unknown for diagnosis/protection intent
MEDIUM forced: Any extended inference present (regardless of score)

CITATION_REFERENCE
source: elimfilters-vault/decision-engine/CONFIDENCE_SCORING_MODEL.md
document: Confidence Scoring Model
version: 1.0
ratified: 2026-07-01
status: FROZEN
```
