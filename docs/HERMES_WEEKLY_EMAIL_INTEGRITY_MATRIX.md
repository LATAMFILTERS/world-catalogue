# HERMES Weekly Email Integrity Matrix

Incident date: 2026-09-08

## Failure matrix

| Layer | Observed condition | Root cause | Impact | Control implemented | Verification |
|---|---|---|---|---|---|
| Weekly report | `needs_research > 0` with valid `research_pending[]` | Report was correct | None at source | Preserve structured pending queue | Contract compares summary count with queue length |
| Email composition | Summary displayed pending count but renderer only iterated `groups` | `research_pending[]` was omitted from HTML/text rendering | Email appeared empty although HERMES had findings | Render every pending item with code, reason and source | Pending candidates must appear in both HTML and text |
| Delivery | Outlook returned successful Graph delivery | Delivery layer could not detect semantic emptiness | `SENT` falsely implied a useful report | Validate content before mail transport | Transport is never called when contract fails |
| Count integrity | No relationship between `totals.review_ready` / `totals.needs_research` and rendered detail | Missing cross-layer invariant | Summary and detail could diverge silently | Exact count contract | `review_ready == grouped candidates`; `needs_research == research_pending.length` |
| Regression protection | No test covered a cycle with all findings in research pending | Missing edge-case fixture | Same failure could recur | 32-pending regression fixture | Automated test blocks 32-vs-31 mismatch and omitted candidates |
| Operational resend | Resend only checked Markdown size | File size does not prove semantic completeness | A structurally incomplete email could still resend | Sender-level semantic gate | Resend inherits the same sender integrity contract |

## Mandatory invariants

1. If `totals.review_ready = N`, exactly `N` detailed candidates must exist in `groups`.
2. If `totals.needs_research = N`, exactly `N` detailed candidates must exist in `research_pending`.
3. Every detailed candidate must have an `entity_code`.
4. Every review-ready and research-pending `entity_code` must appear in both HTML and plain-text email bodies.
5. If HERMES scanned candidates, at least one detailed queue must exist unless candidates are explicitly classified as duplicate or invalid.
6. A mail provider success response is not sufficient to classify the weekly report as healthy; semantic validation must pass before transport.

## 2026-09-08 diagnosis

The visible Outlook message showed a valid summary such as `32 candidates analyzed / 0 ready / 32 require research`, followed by no candidate detail. The source report generator already populated `research_pending`. The defect was therefore isolated to email composition: the renderer iterated review-ready `groups` but did not render the research-pending queue. Delivery via Microsoft Graph was functioning correctly.

## Closure criteria

The incident is closed only when the production sender enforces the integrity contract, the 32-pending regression test passes, and a regenerated email displays every pending item rather than only the summary count.
