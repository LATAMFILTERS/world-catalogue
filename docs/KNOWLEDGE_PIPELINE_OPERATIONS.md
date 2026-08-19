# Knowledge Pipeline Operations — Bloque 2

> "HERMES investiga.
> Obsidian publica.
> PostgreSQL autoriza el SKU.
> Groq interpreta y redacta.
> El orquestador hace cumplir las fronteras."

This document describes the **operational** integration built on top of [Bloque 1's governance contracts](./KNOWLEDGE_GOVERNANCE_ARCHITECTURE.md): a real Obsidian-authorized-knowledge query, real (gated) HERMES research requests, durable knowledge-gap tracking, an ELIMFILTERS category recommender, and the resulting A-F structured diagnostic answer.

## Architecture: what "Obsidian" and "HERMES" really are in this codebase

Before building anything, the codebase was audited for existing HERMES/Obsidian infrastructure (per the Bloque 2 mandate not to duplicate it). Two **unrelated** systems both use the word "HERMES" or "Obsidian":

| System | What it actually is | Used by Bloque 2? |
|---|---|---|
| `scripts/hermes/*.mjs`, `elimfilters-vault/`, `hermes/reports` | An **offline, batch, cron-driven** content pipeline that collects candidate marketing/SEO knowledge-system articles (Standards, Contamination, Fleet pages — see root `CLAUDE.md`), reviews them by weekly email, and writes approved Markdown notes into `elimfilters-vault/`. No request/response API surface. | **No.** Unrelated domain (marketing content, not bot diagnostics), no synchronous interface a chatbot could call. |
| `services/knowledge-engine-runtime`, `services/knowledge-center-api`, the `knowledge_center` Postgres schema | A real, already-deployed (see `render.yaml`) microservice pair: `knowledge-center-api` owns `knowledge_center.candidate_cases` (a human-reviewed research/case-tracking workflow — this **is** the real HERMES-equivalent backend) and `knowledge_center.knowledge_records` / `knowledge_record_versions` (versioned, source-cited, human-approved technical facts — this **is** the real Obsidian-equivalent authority). `knowledge-engine-runtime` answers reasoning queries by retrieving **only** `knowledge_records` rows where `production_eligible = true AND lifecycle_status IN ('APPROVED','CURRENT','LIMITED_USE')`, and was already being called (unconditionally, on every message) from `lib/bot-protocol-knowledge-engine.js` before this block. | **Yes — reused, not duplicated.** |

This satisfies the explicit instruction *"No asumir que Knowledge Engine Runtime equivale automáticamente a Obsidian autorizado. Debe demostrarse mediante metadata de fuente y aprobación"*: the demonstration is the SQL filter in `services/knowledge-engine-runtime/src/runtime.ts`'s `retrieve()` function, plus real `recordId`/`versionId`/`sourceId` provenance on every citation.

**Known limitation:** the reasoning service's public citation shape does not expose `authority_level` or `record_type` directly (only `recordId`, `versionId`, `sourceId`, `label`). `lib/knowledge-governance/obsidian-knowledge-client.js` infers a Bloque-1 `source_type` from the citation label via a conservative heuristic, and never treats a citation lacking a `sourceId` as approved (no traceability → no approval).

## Components built in this phase

| File | Role |
|---|---|
| `lib/knowledge-governance/obsidian-knowledge-client.js` | Normalizes `lib/bot-protocol-knowledge-engine.js`'s `queryKnowledgeEngine` (reused, not reimplemented) into the Bloque 1 technical-evidence contract shape. |
| `lib/knowledge-governance/hermes-client.js` | Gated (`HERMES_REQUESTS_ENABLED`), deduplicated wrapper around the real `knowledge-center-api` candidate-case creation (reuses `createCandidateCase`, exported from `bot-protocol-knowledge-engine.js`). |
| `lib/knowledge-governance/knowledge-gap-store.js` + `migrations/bot-knowledge-gap-store/` | Durable, deduplicated, occurrence-counted knowledge-gap ledger in the bot's own database — see "Why a second table" below. |
| `lib/bot-product-category-recommender.js` | Pure function: symptom/system → ELIMFILTERS category (never a SKU). |
| `lib/bot-conversation-orchestrator.js` | Wires all of the above into the existing pipeline (`runKnowledgeGovernancePipeline`, `finalizeResponseGovernance`, `applyPipelineToState`) and produces the A-F structured diagnostic answer. |

### Why a second table (`bot_governance.knowledge_gaps`) instead of reusing `knowledge_center.candidate_cases`

`knowledge_center.candidate_cases` is semantically very close to "a knowledge gap," but it is owned by a separate deployed service with its own auth/review roles, and it is missing exactly the fields the bot orchestrator needs for **its own** dedup/occurrence bookkeeping (`deduplication_key UNIQUE`, `occurrences`). Rather than modify that service's schema from this repository (out of scope, and its own migration pipeline lives in `services/knowledge-center-api/src/migrate.ts`), `bot_governance.knowledge_gaps` is a small, additive table in the **same physical database** (same `DATABASE_URL`, same connection pool via `bot-protocol-db.js`) that:

- tracks "have we already flagged this exact gap, how many times" (pure bookkeeping, owned by the bot), and
- links out to the real HERMES case via `hermes_research_id` (a `knowledge_center.candidate_cases.id`) once one is actually created.

## Environment variables

| Variable | Purpose | Required? |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection (elimfilters_catalog + the new `bot_governance` schema). Same connection knowledge-engine-runtime uses for `knowledge_center`. | Yes |
| `REDIS_URL` | Conversation memory. Falls back to an in-process Map if unset. | No |
| `GROQ_API_KEY` | LLM classification + answer phrasing. Falls back to the deterministic classifier if unset. | No |
| `KNOWLEDGE_ENGINE_RUNTIME_URL` | Obsidian-equivalent reasoning service base URL. | No — `obsidian-knowledge-client.js` returns `unavailable` and a knowledge gap is registered instead. |
| `ENGINE_API_KEY` | `x-engine-api-key` header for the above. | No (paired with the URL) |
| `KNOWLEDGE_CENTER_API_URL` | HERMES-equivalent candidate-case service base URL. | No — `hermes-client.js` returns `unavailable`. |
| `KNOWLEDGE_CENTER_API_KEY` | `x-api-key` header for the above. | No (paired with the URL) |
| `HERMES_REQUESTS_ENABLED` | Must be the exact string `'true'`, or **no** HERMES network call is ever made, regardless of URL/key presence. Default: disabled. | No (safe default: off) |
| `BOT_PROTOCOL_API_KEY` | Inbound auth for `/api/bot/protocol` (pre-existing, unchanged). | Yes |

No values are hardcoded anywhere in this phase; none were printed to logs.

## Endpoints consulted

- `POST {KNOWLEDGE_ENGINE_RUNTIME_URL}/api/knowledge-engine/v1/reason` — reasoning query (Obsidian-equivalent). Header: `x-engine-api-key`.
- `POST {KNOWLEDGE_CENTER_API_URL}/api/knowledge-center/v1/candidate-cases` — HERMES research request creation. Headers: `x-api-key`, `x-actor-id`, `x-actor-role: BOT_PROTOCOL`.

Both are real, pre-existing, already-deployed endpoints (see `render.yaml`) — no new endpoint was created.

## Timeouts and retries

| Call | Timeout | Retries |
|---|---|---|
| Obsidian reasoning (`queryKnowledgeEngine`) | 5.5s (`AbortController`, tuned down from the original 9s per the spec's 4-6s guidance) | None — a failure resolves to `unavailable` |
| HERMES candidate-case creation | 4s | 1 limited retry after 300ms (safe because the call is idempotent by `externalId`) |
| PostgreSQL (`bot_governance.knowledge_gaps`, `elimfilters_catalog`) | 1.8s statement timeout (pre-existing `withProtocolClient` default) | None |

`Promise.all` is not used between Obsidian and HERMES calls because HERMES creation only ever happens *after* Obsidian is confirmed to have no evidence — they are not independent, they are sequential by design (see "Normal flow" below).

## Normal flow (per message, once the state machine is out of the data-collection phase)

1. Postgres catalog query (`runCatalogQuery`, pre-existing, unchanged).
2. `queryApprovedTechnicalKnowledge(...)` — Obsidian-equivalent query, skipped and reused from conversation memory if this exact conversation already has `validated` evidence.
3. `recommendCategories(...)` — pure, always safe, no I/O.
4. If (and only if) intent is `diagnostic`, phase is `diagnostic_assessment`, and the Obsidian result is anything other than `validated`: `upsertKnowledgeGap` (create-or-merge), then — only if no `hermes_research_id` is already attached — `createHermesResearchRequest` (itself gated by `HERMES_REQUESTS_ENABLED`).
5. The A-F structured answer is built (diagnostic intent) or Groq rewrites an **already-approved-only** knowledge answer (other intents).
6. `finalizeResponseGovernance` composes `response_governance`, strips any unauthorized SKU/OEM-interval-shaped text that slipped through, and logs one structured line per stage.
7. Compact, non-sensitive pointers (`technicalKnowledge`, `knowledgeGap`, `productRecommendation` — never full evidence text) are written back into conversation state exactly once, then memory is saved exactly once, and `res.json` is called exactly once.

## Safe degradation

Every external dependency (Obsidian, HERMES, PostgreSQL, Redis, Groq) can fail independently without breaking the HTTP response:

- Obsidian unreachable/timeout → `status: 'unavailable'` → treated the same as "no evidence" → a knowledge gap is still registered, the conversation still gets a safe answer ("no tengo confirmado... fue registrado para investigación técnica").
- HERMES disabled/unreachable → the knowledge gap is still persisted (if PostgreSQL is up); `hermes_request_created: false`; no error surfaces to the customer.
- `bot_governance.knowledge_gaps` write fails → `upsertKnowledgeGap` returns `{ persisted: false, error }`; the orchestrator falls back to an in-memory-only gap record for that turn and continues.
- PostgreSQL catalog unreachable → SKU lookup returns `database_unavailable`; a category-only recommendation is still shown; no SKU is ever invented.

## Persistence and deduplication

- `bot_governance.knowledge_gaps.deduplication_key` is `UNIQUE` — a repeated report of the same gap (same `request_type` + equipment + system + component + question, see `buildDeduplicationKey` in `knowledge-gap-contract.js`) increments `occurrences` instead of inserting a new row (verified: 20 identical reports → 1 row, `occurrences = 20`).
- Before ever calling HERMES, the orchestrator checks the conversation-level pointer (`state.knowledgeGap`) and — via `upsertKnowledgeGap` — the durable row; `hermes-client.js` itself also refuses to resend if the gap it's given already carries a `hermes_research_id` (defense in depth against a caller bug).

## Review and publication

No automatic publication happens anywhere in this phase. A HERMES research response (were a real one ever wired up) can only ever reach `awaiting_review` (`isReadyForObsidianReview`, Bloque 1) — never the customer, never auto-approved (`canAutoPublish()` is hardcoded `false`). Publishing a knowledge record into `knowledge_center.knowledge_records` remains entirely the responsibility of `knowledge-center-api`'s human-reviewed `POST /knowledge-versions/:id/publications` endpoint, untouched by this phase.

## Deployment procedure

1. Review this PR's diff.
2. Apply `migrations/bot-knowledge-gap-store/001_schema.sql` against the target database (additive — creates the `bot_governance` schema/table only; no existing table is touched). Run `validate.sql` to confirm.
3. Set `HERMES_REQUESTS_ENABLED=true` only when ready for HERMES to actually receive research requests — it is safe (and recommended for a first deploy) to leave it unset/false so knowledge gaps are recorded without yet notifying HERMES.
4. Deploy the bot service as usual (no changes to `KNOWLEDGE_ENGINE_RUNTIME_URL` / `KNOWLEDGE_CENTER_API_URL` / render.yaml were made — this phase only changes how their existing responses are treated).
5. Confirm `npm test` is green in CI.

## Smoke tests

`npm run test:knowledge-pipeline` covers all 35 minimum cases from the spec at the unit and HTTP-e2e level, against test doubles — no live infrastructure required. For a real end-to-end smoke test against the actual `npm start` chain, boot the server with a preload script that installs the same test doubles via `__setProtocolPoolForTests` / stubbed `global.fetch` (see the pattern used for the pre-delivery manual verification of this PR) and exercise the conversation scripts A-E from the spec.

## Rollback

- **Code**: revert the merge commit; no other service's code was touched.
- **Schema**: `migrations/bot-knowledge-gap-store/rollback.sql` drops the `bot_governance` schema entirely — guarded behind `SET bot_governance.allow_rollback = 'true'`, and only removes the bot's own dedup ledger. It never touches `elimfilters_catalog` or `knowledge_center`.
- **Behavioral**: setting `HERMES_REQUESTS_ENABLED` to anything other than `'true'` (or unsetting it) immediately stops all outbound HERMES calls without a deploy.

## Pending risks (carried into a future phase)

1. **No structured OEM interval is ever synthesized.** `oemMaintenance` is always passed as `null` into `buildResponseGovernance` — the reasoning service's free-text `answer` is shown as informational "Mantenimiento OEM" citation text, but `oem_maintenance_found` stays `false` until a future phase feeds a real `{value, unit}` interval (sourced from `knowledge_record_versions.content`, which the reasoning API does not currently expose) through `oem-maintenance-contract.js`.
2. **No dedicated ambiguous-SKU detection.** `bot-protocol-catalog.js` resolves a multi-row cross-reference match deterministically (`is_primary DESC`) rather than surfacing an explicit `ambiguous` state; the contract-level state (`createSkuAuthorityRecord({ lookup_status: 'ambiguous' })`) exists but nothing currently populates it from a real query result.
3. **`audience: 'TECHNICAL_SUPPORT'`** is still hardcoded in `queryKnowledgeEngine`'s request to the reasoning service, which uses a lower confidence bar (`minAnswer` 0.72) than the `CUSTOMER` audience (`minProduction` 0.85) — even though the resulting answer can reach the end customer. Changing this is a `services/knowledge-engine-runtime` change (a separate deployed service) and was left untouched in this phase to avoid scope creep into another service's code; flagged here for a follow-up decision.
4. `knowledge_gaps` persistence lives in the bot's own database; if that database and the `knowledge_center` database are ever split onto different physical instances, `hermes_research_id` becomes a cross-database foreign key with no referential integrity — acceptable today (same instance), worth revisiting if that topology ever changes.
