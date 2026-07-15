---
id: recommendation-rule:replace-me
type: RecommendationRule
name: Replace me
status: under_review
authority: canonical
owner: ELIMFILTERS Product Intelligence
source:
  - source:field-observation-method
last_reviewed: 2026-07-15
evidence_status: under_review
scenario: failure-scenario:replace-me
action_level: inspect
---

# Replace me

## Applicability

Define the scenario, system, duty cycle and evidence conditions required before this rule may be used.

## Recommended actions

- inspect_system: `system:replace-me`
- consider_technology: `technology:replace-me`
- consider_product_family: `product-family:replace-me`

## Decision boundary

Allowed action levels:

- `inspect`
- `sample`
- `review_selection`
- `recommend_candidate`
- `validated_recommendation`

Only `validated_recommendation` may name a canonical SKU, and it requires validated scenario evidence plus product-specific evidence.

## Evidence

- supported_by_evidence: `evidence:replace-me`

## Limitations

Record exclusions, incompatible applications and conditions requiring engineering review.
