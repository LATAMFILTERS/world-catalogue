# Knowledge Governance Architecture — Bloque 1

> "HERMES investiga.
> Obsidian publica.
> PostgreSQL autoriza el SKU.
> Groq interpreta y redacta.
> El orquestador hace cumplir las fronteras."

This document describes the governance contracts introduced in `lib/knowledge-governance/`. **This is Bloque 1 only**: architecture, contracts and enforcement rules. There is no real HERMES research call, no real Obsidian write, and no production deployment tied to this work — those are later, separate phases.

## Why this exists

Before this block, the bot orchestrator had exactly one hard authority boundary: SKUs only ever came from a real PostgreSQL catalog query. Everything else — technical facts, OEM maintenance intervals, general guidance — was implicitly trusted from whatever the Knowledge Engine Runtime or Groq's free-text rewrite produced. Nothing enforced *who* was allowed to assert *what*, and nothing tracked *what we don't know yet*. Bloque 1 makes those boundaries explicit, testable contracts instead of implicit code structure.

## Authorities

Declared in `lib/knowledge-governance/authority-policy.js`:

| Responsibility | Authority |
|---|---|
| Technical facts | Obsidian |
| OEM maintenance | Obsidian |
| Technical procedures | Obsidian |
| Standards | Obsidian |
| Knowledge research | HERMES |
| Knowledge publication | Obsidian |
| Product SKU | PostgreSQL |
| Language interpretation | Groq |
| Final decision | Orchestrator |

These responsibilities never mix. Concretely:

- **HERMES investigates.** It can research and return findings + sources, but its output can never reach the customer directly and can never carry a SKU or an approval flag.
- **Obsidian publishes.** Only Obsidian-authored, reviewed, `approved_for_bot_use: true` evidence can ever back a technical fact or an OEM maintenance interval. Obsidian can never authorize a SKU.
- **PostgreSQL authorizes the SKU.** A SKU is only ever "validated" when it came out of a real `elimfilters_catalog` query. PostgreSQL can never create an OEM interval.
- **Groq interprets and drafts.** Groq may phrase the final sentence, but it never gets to decide whether a fact or a SKU is true — its output is treated as unapproved by default and is scanned for anything it might have invented.
- **The orchestrator enforces the boundaries.** It is the only actor allowed to assemble and publish the final response (`response-governance-contract.js`), and it is responsible for stripping anything that slipped through without authorization.

## Contracts

| File | Purpose |
|---|---|
| `authority-policy.js` | The actor → allowed-action table and the 10 core rules. Everything else defers to this. |
| `technical-evidence-contract.js` | Canonical shape for a piece of technical evidence, and the single gate (`isApprovedTechnicalEvidence`) for citing it. |
| `oem-maintenance-contract.js` | Canonical shape for an OEM maintenance record, plus a curated list of `general_approved_practice` entries that are explicitly never shaped like an OEM interval. |
| `knowledge-gap-contract.js` | What "we don't know this" looks like, with a strict status lifecycle. |
| `hermes-research-contract.js` | Request/response shapes for a (future) HERMES research call. |
| `obsidian-publication-contract.js` | Review lifecycle for a (future) Obsidian publication, plus a stub adapter that never claims to have written anything. |
| `sku-authority-contract.js` | Canonical shape for a SKU authorization decision, and the bridge that converts a real `bot-protocol-catalog.js` PostgreSQL result into that shape. |
| `response-governance-contract.js` | Composes all of the above into one `response_governance` object per turn, decides `safe_to_publish`, and redacts anything unauthorized out of the final answer text. |

## States and transitions

### Knowledge gap lifecycle (strict, no skipping)

```
detected
  -> queued_for_hermes
  -> researching
  -> researched
  -> awaiting_review
  -> approved_for_obsidian
  -> published_in_obsidian
  -> closed
```

`awaiting_review` may also go to `rejected` (reason required), and `rejected` may be re-queued (`queued_for_hermes`) or closed. Jumping directly from `detected` to `published_in_obsidian` (or any other skip) throws — `isValidKnowledgeGapTransition` / `transitionKnowledgeGapStatus` enforce this.

### Obsidian publication review lifecycle

```
pending -> approved | rejected | changes_requested
changes_requested -> pending
```

`approved` and `rejected` are terminal for review. Approval requires at least one `approved_sources` entry. Rejection requires `review_notes`.

## Examples — permitted

- A preliminary diagnostic explanation ("this points to X, verify mechanically before concluding") with no OEM interval and no SKU claim. Always safe to publish.
- "Categoría: filtro de aceite" recommended without a specific SKU, when PostgreSQL is unavailable or the match was ambiguous (`canRecommendCategoryOnly`).
- An OEM interval cited from evidence where `source_authority === 'obsidian'`, `approved_for_bot_use === true`, `source_id` is present, and the equipment year matches.
- A `general_approved_practice` (e.g. "no reutilizar filtros spin-on") shown as general guidance — never labeled as an OEM interval.
- A SKU cited straight from a real `elimfilters_catalog` row (`lookup_status: 'validated'`, `evidence_count > 0`).

## Examples — blocked

- Groq or HERMES output asserting a maintenance interval ("cada 500 horas") with no Obsidian-approved evidence behind it — stripped by `redactUnauthorizedClaims`, replaced with `[intervalo no confirmado]`.
- Any SKU-shaped token (`E[A-Z]\d{4,7}`) in the final answer that isn't in `validated_skus` — stripped, replaced with `[referencia no confirmada]`.
- A customer-typed SKU ("tengo el EL82100") — never validated on its own; still has to go through PostgreSQL.
- Obsidian evidence citing a SKU — Obsidian is not the SKU authority; `canPublishSku` rejects `source_authority: 'obsidian'` outright.
- OEM evidence for the wrong model year — `isApprovedOemMaintenanceEvidence` returns false when the evidence's equipment year and the target equipment year disagree.
- A HERMES response with no sources, or with `conflicts_detected: true` — never `ready_for_obsidian_review`, and `canAutoPublish()` is hardcoded to always return `false` regardless of input.

## Why HERMES does not publish

HERMES's job is retrieval, not judgment. It has no mechanism in this codebase to mark anything `approved_for_bot_use`, and `hermes-research-contract.js` validates that a HERMES response never carries that field. The only legitimate next step for HERMES output is a human/Obsidian review (`isReadyForObsidianReview`), never the customer.

## Why Obsidian does not authorize SKU

Obsidian is a knowledge/documentation authority, not an inventory system. It can be wrong about which internal SKU maps to a given OEM part number, and mixing that authority into technical documentation review would create a second, inconsistent source of truth for something PostgreSQL already owns definitively. `canPublishSku` explicitly rejects `source_authority: 'obsidian'`.

## Why PostgreSQL does not authorize OEM facts

The catalog table only knows product ↔ cross-reference mappings; it has no concept of maintenance intervals, procedures, or standards, and was never reviewed for that purpose. `canPublishOemRecommendation` explicitly rejects `source_authority: 'postgresql'`.

## Integration with the orchestrator (this phase)

`lib/bot-conversation-orchestrator.js` now builds a `response_governance` object on every turn (`applyKnowledgeGovernance`), **before** finalizing the answer:

1. Converts the current PostgreSQL catalog result into a `skuAuthority` record.
2. Wraps any Knowledge Engine Runtime answer as `buildUnvalidatedEvidence` — it is **not** yet an Obsidian source, so `technical_source_validated` stays `false` in this phase, by design.
3. If a diagnostic reaches `diagnostic_assessment` with no approved technical evidence, registers a local `knowledge_gap` (status `detected` — nothing is sent anywhere).
4. Runs the answer text through `redactUnauthorizedClaims`, stripping any SKU or OEM-interval-shaped claim that isn't backed by validated evidence.
5. Logs one structured `[knowledge-governance]` line per turn and attaches a public-safe subset (`knowledge_governance: { safe_to_publish, technical_source_validated, knowledge_gap_registered, sku_validated_in_postgresql, authority_violation_count }`) to the response. The full internal objects (evidence text, knowledge gap question/reason, etc.) are never sent to the client.

No real HERMES request is made and no real Obsidian write happens anywhere in this phase — `queryKnowledgeEngine` (Knowledge Engine Runtime) is unrelated infrastructure that already existed; this block only changes how its output is treated (unapproved by default) and adds a safety net around the final answer text.

## Observability

Structured log line, `[knowledge-governance]`, emitted once per turn:

```
request_id, conversation_id, technical_source_validated,
knowledge_gap_registered, hermes_request_created,
sku_validated_in_postgresql, authority_violation_count, safe_to_publish
```

Never logged: API keys, tokens, passwords, credentialed URLs, full manual/document content, or unnecessary personal data.

## Future integration (not built in this phase)

- A real HTTP client sending `hermes-research-contract.js` requests to an actual HERMES service, and parsing real responses through the same contract.
- A real Obsidian write path replacing `publishToObsidianStub`, with the human review step (`obsidian-publication-contract.js`) gating it.
- Persisting `knowledge-gap-contract.js` records somewhere durable (currently constructed in-memory, per-request, and never stored) so `mergeDuplicateKnowledgeGap` has something to merge against across turns.
- Feeding real Obsidian-approved evidence into `technicalEvidence` so `oem_maintenance_found` can ever become `true` in production.
