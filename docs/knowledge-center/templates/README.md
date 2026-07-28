# ELIMFILTERS Knowledge Object Templates

These templates convert the Knowledge Center governance standards into repeatable authoring formats for researchers, reviewers, Claude Code, and future ingestion pipelines.

## Canonical rule

The governing standards in `docs/knowledge-center/` take precedence over every template. A template is an implementation aid, not an alternate source of policy.

## Available templates

- `diagnostic-case.template.yaml` — symptom-first diagnostic reasoning object.
- `asset-record.template.yaml` — equipment, engine, machine, or system technical record.
- `product-record.template.yaml` — governed ELIMFILTERS product record.
- `source-record.template.yaml` — source registration and claim-level traceability.
- `approval-record.template.yaml` — technical review, validation, and production eligibility.
- `research-brief.template.md` — human-readable research assignment and evidence summary.

## Required workflow

1. Copy the relevant template without modifying the original.
2. Assign a unique stable identifier.
3. Complete required fields using explicit evidence states.
4. Register every external source separately.
5. Link claims to source and evidence identifiers.
6. Keep unsupported fields as `UNKNOWN`; do not fill gaps by inference unless the inference is explicitly declared.
7. Submit the object for technical review.
8. Create an approval record.
9. Expose the object to production only when `production_eligible: true`.

## File naming

Use lowercase kebab case:

```text
<type>-<system-or-asset>-<short-description>-<id>.yaml
```

Examples:

```text
diagnostic-fuel-water-separator-repeated-drainage-dg-fuel-0001.yaml
asset-cummins-isx15-ar-engine-0001.yaml
product-hydrocore-ef12345-pr-0001.yaml
source-cummins-service-manual-sr-0001.yaml
approval-dg-fuel-0001-ap-0001.yaml
```

## Controlled values

Evidence states:

- `OFFICIAL_VERIFIED`
- `ELIMFILTERS_VALIDATED`
- `FIELD_VERIFIED`
- `CUSTOMER_REPORTED`
- `INFERRED`
- `PENDING_VERIFICATION`
- `UNKNOWN`

Lifecycle states:

- `RESEARCH`
- `DRAFT`
- `TECHNICAL_REVIEW`
- `APPROVED`
- `REJECTED`
- `RETIRED`

## Claude Code boundary

Claude Code may create research briefs, source records, and draft knowledge objects. It may not assign `ELIMFILTERS_VALIDATED`, mark an object `APPROVED`, or set `production_eligible: true` without an explicit ELIMFILTERS approval record.