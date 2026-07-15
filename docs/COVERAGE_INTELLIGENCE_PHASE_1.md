# Coverage Intelligence — Phase 1

## Objective

Audit the complete `elimfilters_catalog.vehicle_applications` dataset in controlled SKU batches and produce one persisted catalogue report.

## Operational rules

- Only confirmed applications with make, model, and classified segment enter operational coverage.
- `UNKNOWN`, missing make, and missing model records are quarantined.
- Quarantined records never count as product gaps.
- Possible hydraulic products are prioritized in the review queue.
- Product gaps and data-quality gaps are reported separately.

## Output

The final report contains:

- full scan totals;
- coverage matrix by segment, category, and status;
- commercial product gaps;
- data-quality queue;
- quarantined review queue;
- opportunity ranking by manufacturer.

## Endpoints

### Start full audit

`POST /api/audit/coverage-intelligence/run`

Requires `Authorization: Bearer <ADMIN_KEY>`.

Optional JSON body:

```json
{
  "segment": "ALL",
  "batch_size": 100,
  "gap_limit": 500,
  "review_limit": 1000
}
```

### Read progress or latest report

`GET /api/audit/coverage-intelligence/status`

## Persistence

Completed and failed executions are stored in `coverage_audit_reports`. The catalogue table is never modified.

## Acceptance marker

```text
[coverage-intelligence] phase 1 full-catalog verification passed
```
