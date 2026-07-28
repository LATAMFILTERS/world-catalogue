# ELIMFILTERS Knowledge Center — Layer 3

## Purpose

Layer 3 is the governed base diagnostic library. It converts the approved Layer 2 taxonomy and templates into reusable engineering cases organized by technical family rather than by part number.

## Operating model

Each case represents a materially distinct reasoning path linking symptoms, evidence, probable causes, risks, diagnostic steps, corrective action, and verification. A case may relate to many assets and products through metadata. Part-number variants do not create new cases unless the engineering reasoning changes.

## Initial delivery

The first operational seed contains 25 high-priority diagnostic cases: five cases for each protection system. These are `ENGINEERING_DRAFT` records and are not production eligible until technical review and approval records are attached.

## Status model

- `ENGINEERING_DRAFT`: structured technical seed requiring review.
- `TECHNICAL_REVIEW`: evidence and reasoning under engineering review.
- `ELIMFILTERS_VALIDATED`: approved technical content, not necessarily published.
- `APPROVED`: eligible for production only when `production_eligible: true` and an approval record exists.

## Case requirements

Every case must contain:

- Protection system, technical family, product family, and technology.
- Normalized condition and customer-language variants.
- Primary and secondary symptoms.
- Minimum evidence required to assess.
- Probable causes with mechanisms.
- Diagnostic procedure in a safe sequence.
- Stop-operation and escalation conditions.
- Corrective and preventive actions.
- Verification and closure criteria.
- Source, reviewer, approval, and revision metadata.

## Coverage method

Coverage is measured by approved, materially distinct cases per technical family. Drafts, duplicates, translations, part-number copies, and application-only variants do not count as additional coverage.

## Prioritization

Cases are developed in this order:

1. High safety or asset-damage risk.
2. High-frequency field complaints.
3. Conditions that cause incorrect filter replacement.
4. Conditions requiring separation between filter failure and system failure.
5. Preventive conditions with measurable downtime impact.

## Continuous growth boundary

Layer 3 establishes the initial library. Future field interactions may create candidate cases, but they cannot enter the approved library automatically. Continuous-learning intake and promotion belong to Layer 5 and must follow the same evidence and approval controls.
