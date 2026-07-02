# Recommendation Governance
## Engineering Decision Engine — Rules for When and How Recommendations Are Produced
### Version 1.1 | Ratified: 2026-07-01 | Last amended: 2026-07-02 | Status: FROZEN

---

## Document Control

| Field | Value |
|---|---|
| Document | RECOMMENDATION_GOVERNANCE |
| Version | 1.1 |
| Status | FROZEN — Governing Architecture |
| Ratified | 2026-07-01 |
| Last amended | 2026-07-02 — Amendment A1: Decision Authority Principle added; PROHIBITED state integrated into permission model |
| Authority | Subordinate to ENGINEERING_DECISION_ENGINE v1.1 |
| Scope | All recommendations produced by the platform — technology recommendations, product recommendations, and engineering conclusions |

---

## The Recommendation Definition

A recommendation is any statement by the platform that a specific action, product, technology, or engineering approach is appropriate for a specific situation.

A recommendation is not:
- A general description of a technology's capabilities
- An explanation of how a contamination mode causes failure
- A definition of a standard or cleanliness code
- An offer to continue the diagnostic consultation

All three of the above are permitted at any confidence level. A recommendation requires a confidence level of MEDIUM or HIGH.

---

## Recommendation Types

| Type | Definition | Required Confidence |
|---|---|---|
| Technology Recommendation | Statement that a specific technology architecture is appropriate for the identified contamination domain and protection requirement | MEDIUM or HIGH |
| Product Recommendation | Statement that a specific product or product family should be selected to implement the technology recommendation | HIGH preferred; MEDIUM permitted with disclosure |
| Engineering Conclusion | Statement about the root cause of an observed failure or symptom | MEDIUM or HIGH |
| Cleanliness Target | Statement of the appropriate ISO code or standards-based measurement target for a specific system | MEDIUM or HIGH |
| Service Interval Guidance | Statement about appropriate filter replacement intervals based on operating conditions | HIGH only |
| Diagnostic Hypothesis | Statement that available evidence is consistent with a specific failure mode | MEDIUM; must be disclosed as hypothesis |

---

## The Decision Authority Requirement

Every engineering recommendation requires authorization from the Engineering Decision Engine before it reaches any customer-facing surface. This is not a procedural requirement — it is a constitutional one (Engineering Experience Principles, Principle 13).

**Authorization means:** The Decision Engine evaluation has completed, the PROHIBITED gate has been cleared, and Step 6 has produced RECOMMEND or RECOMMEND WITH DISCLOSURE.

**No surface is exempt.** AI Assistant, Engineering Search, Product Recommendation Engine, Generated Pages, Dealer Portal, API Endpoints, and future autonomous agents all require Decision Engine authorization before producing a recommendation. There is no "simple enough to skip" threshold. Authorization is required for all recommendations.

**The authorization sequence:**
```
Engineering Question
    ↓
Decision Engine Evaluation (Steps 1–5a–5–6)
    ↓
PROHIBITED? → Stop. Request information. No recommendation.
NOT PROHIBITED + LOW/UNKNOWN? → Stop. Continue diagnostic consultation. No recommendation.
NOT PROHIBITED + HIGH/MEDIUM? → Authorization granted.
    ↓
Recommendation permitted.
```

---

## What Permits a Recommendation

### Conditions That Must All Be True

1. **The six-step evaluation (including Step 5a PROHIBITED gate) has completed.** A recommendation produced before the evaluation is complete is unauthorized. Steps may not be skipped.

2. **Step 5a returned NOT PROHIBITED.** If PROHIBITED, the evaluation stops at Step 5a. No recommendation is permitted regardless of any other factor.

3. **Step 6 produced RECOMMEND or RECOMMEND WITH DISCLOSURE.** No other Step 6 output permits a recommendation.

3. **Every claim in the recommendation has a corresponding evidence source.** Claims without evidence sources have been excluded by Step 4.

4. **All EXTENDED inferences have disclosure text.** An EXTENDED inference without disclosure is treated as SPECULATIVE and excluded.

5. **The confidence level assigned in Step 5 has not been modified.** The confidence level produced by the evaluation is the confidence level communicated to the customer.

### Conditions That Never Permit a Recommendation

- The PROHIBITED gate triggered in Step 5a
- A matching product exists in the catalogue
- A related recommendation was made successfully for a similar customer
- The customer appears to expect a recommendation
- The conversation has been ongoing for a long time and a response is needed to move it forward
- A senior engineer has provided an informal opinion
- A competitor product exists that serves this function (the competitor's recommendation does not validate ours)
- The platform has answered this type of question before

---

## Recommendation Structure — Required Elements

Every recommendation must include the following elements, in order:

### 1. Engineering Statement

State the recommendation in engineering terms before commercial terms.

**Correct:** "For this application, the hydraulic system requires ISO 4406 cleanliness at 16/14/11. This target is appropriate given the proportional valve clearances of 2–5µm documented for this component type. To achieve and maintain this target, a filtration solution with a minimum Beta[c]10(c) efficiency of 200 is required at the primary filter location."

**Incorrect:** "We recommend the NANOFORCE hydraulic filter. It's our best product for this type of system."

The engineering statement must precede any product or technology reference.

### 2. Evidence Chain

State which evidence sources informed the recommendation. Do not embed references in footnotes or hide them. State them directly.

**Example:** "This recommendation is based on: (1) ISO 16889 Beta ratio methodology for filter efficiency classification; (2) ISO 4406 particle code targets for proportional valve protection; (3) documented failure mode progression for hydraulic valve stiction caused by particle contamination in the 5–15µm range."

### 3. Confidence Level Declaration

State the confidence level explicitly.

**HIGH:** "This recommendation is made at HIGH confidence. All required evidence categories were available, and all reasoning is direct or supported."

**MEDIUM:** "This recommendation is made at MEDIUM confidence. The following assumptions have been applied: [list assumptions]. The following inferences are engineering hypotheses, not verified findings: [list EXTENDED inferences with disclosure]."

The confidence level is stated once, clearly, before product recommendations are made. It applies to all claims that follow.

### 4. Technology Recommendation

State the technology architecture appropriate for the identified protection requirement.

Technology recommendations reference:
- The technology name and operating principle
- The contamination target it controls
- The performance specification (efficiency rating, Beta ratio, purity class)
- The applicable standard that governs measurement of that specification

**Example:** "NANOFORCE — sub-micron hydraulic filtration with Beta[c]10(c) ≥ 200 efficiency. Controls solid particle contamination in the 5–20µm range. Performance verified per ISO 16889 multi-pass testing."

### 5. Product Recommendation (if applicable)

Product recommendations are the final element, after engineering and technology recommendations are complete.

Product recommendations reference:
- The specific product or product family
- The performance specification of that product (not general descriptions)
- How the product implements the technology recommendation
- Compatibility with identified equipment (if Category 9 evidence is available)

A product recommendation without a technology recommendation preceding it is not permitted under this governance model.

### 6. Implementation Guidance

State what is required for the recommendation to be effective. A technology or product recommendation that omits implementation context is incomplete.

Implementation guidance addresses at minimum:
- Installation requirements or conditions
- Service interval applicable to this application
- Monitoring indicators that confirm the recommendation is working
- What to observe if the recommendation does not produce expected results

---

## Recommendation Scope

A recommendation is scoped to the evidence available. It does not claim to address domains or situations outside the scope of the evaluation.

**Example of correct scoping:** "This recommendation addresses hydraulic particulate contamination based on the evidence provided. The evaluation has not assessed hydraulic fluid condition, thermal degradation, or water contamination — those would require separate evaluation."

**Example of incorrect scoping:** "This filtration solution will solve all your hydraulic problems."

---

## What Recommendations Never Include

### Comparative Claims
Recommendations do not compare ELIMFILTERS products to competitor products by brand. The recommendation is based on engineering evidence, not competitive differentiation. If a customer asks why ELIMFILTERS over another brand, the answer returns to engineering evidence — the Beta ratio, the contamination target, the cleanliness code — not to claims about competitive superiority.

### Unverified Performance Claims
All performance specifications cited in recommendations must be verifiable against governed knowledge. Specifications from marketing materials that have not been validated by engineering are not used in recommendations.

### Cost-Savings Claims
Recommendations do not include projected cost savings unless those projections are derived from documented failure mode consequences with verifiable assumptions. "You will save X%" is not permitted. "Reducing contamination from ISO 19/17/14 to ISO 16/14/11 is documented to extend proportional valve life by [X%] in [specific application type] — this is based on [specific evidence source]" is permitted.

### Urgency-Based Urgency
Recommendations do not include language designed to create purchase urgency. Engineering evidence creates urgency when urgency is warranted. If the failure mode is serious and the customer's situation is urgent, the engineering evidence will reflect that. The recommendation does not add urgency language on top.

---

## Disclosure Requirements

When MEDIUM confidence applies, the recommendation must include explicit disclosures for every EXTENDED inference. The disclosure format is:

```
ENGINEERING HYPOTHESIS — [Claim being made]

Basis: [Evidence sources used to form the hypothesis]
Assumption: [What is being assumed that is not directly evidenced]
Would be confirmed by: [What evidence would upgrade this to a verified finding]
Would be refuted by: [What evidence would eliminate this hypothesis]
```

The disclosure appears adjacent to the EXTENDED inference in the recommendation. It is not relegated to a footnote or offered as a separate section. The customer must be able to read the hypothesis and its disclosure together.

---

## The Product Placement Rule

Products are the conclusion of the recommendation, not the introduction.

The sequence is:
1. Customer intent understood
2. Engineering domain identified
3. Contamination target defined
4. Standards and measurement applied
5. Technology architecture selected
6. Product implements the technology

A recommendation that begins with a product name — before the engineering domain, contamination target, standard, or technology are stated — violates this rule regardless of confidence level.

This rule is an implementation of ENGINEERING_EXPERIENCE_PRINCIPLES v1.2, Principle 3 (Products Are Conclusions) and Principle 2 (Engineering Before Commerce).

---

## Product Recommendation Authority

Products may be recommended only if:

1. A technology recommendation has been produced at MEDIUM or HIGH confidence
2. The product is documented as an implementation of that technology architecture
3. The product's performance specification is verifiable against the governed standard cited in the technology recommendation
4. The product is available for the identified equipment (Category 9 evidence supports compatibility)

If a product cannot be identified that satisfies all four conditions, the recommendation stops at the technology level. A technology recommendation without a matching product is a valid recommendation. A product recommendation without a technology recommendation is not.

---

## Citation Reference

```
CANONICAL GOVERNANCE BLOCK: Recommendation Governance

DOCUMENT
Recommendation Governance v1.0

PURPOSE
Defines the rules for when recommendations are permitted, what they must
contain, and what they may never include.

CORE RULE
Recommendations require Step 6 output of RECOMMEND or RECOMMEND WITH DISCLOSURE.
No other condition permits a recommendation.

MANDATORY SEQUENCE
Engineering Statement → Evidence Chain → Confidence Declaration →
Technology Recommendation → Product Recommendation → Implementation Guidance.
Products are always last. Engineering statement is always first.

PROHIBITED
Recommendations from matching catalogue products alone.
Recommendations that precede the engineering domain identification.
Unverified performance claims.
Comparative claims against competitor brands.
Urgency language not derived from engineering evidence.

CITATION_REFERENCE
source: elimfilters-vault/decision-engine/RECOMMENDATION_GOVERNANCE.md
document: Recommendation Governance
version: 1.0
ratified: 2026-07-01
status: FROZEN
```
