# ECOSYSTEM READINESS REPORT
# ELIMFILTERS World Catalogue — AI Knowledge Platform

**Date:** 2026-06-03
**Branch:** claude/dazzling-franklin-ALGY1
**Scope:** Full-stack evaluation across all Phase 1–4C deliverables

---

## Evaluation Summary

| Area | Completion | Stability | Risk | Tech Debt | Business Impact |
|------|-----------|-----------|------|-----------|-----------------|
| Knowledge Graph | 85% | HIGH | LOW | LOW | MEDIUM |
| Citation Index | 90% | HIGH | LOW | MEDIUM | HIGH |
| Part Search Map | 89% | MEDIUM | LOW | MEDIUM | HIGH |
| JSON-LD Layer | 60% | MEDIUM | MEDIUM | HIGH | HIGH |
| Obsidian Vault | 85% | HIGH | LOW | LOW | MEDIUM |
| unified-data.ts | 100% | HIGH | LOW | MEDIUM | HIGH |
| Knowledge System | 75% | HIGH | LOW | MEDIUM | HIGH |
| Future AI Engine | 30% | LOW | HIGH | HIGH | HIGHEST |

---

## 1. Knowledge Graph

**Completion: 85%**

41 vault notes across 8 entity types. 335 directed graph edges. 97.3%+ resolution ratio (42/43 referenced keys have notes). The Part Search traversal path — Problem → ContaminationMode → Technology → ProductFamily — is fully connected across all 5 product domains (air, fuel, hydraulic, cabin, lube oil). All 41 notes have complete AI Retrieval canonical blocks, correct YAML schemas per Phase 3B, and Phase 3C-compliant wikilink conventions.

Remaining 15%: INTEKCORE and SYNTEPORE ProductFamily notes (2 terminal nodes without families), the DIN_51524 stub (1 dangling reference, 1 ref count), deprecated technology notes (AQUAGUARD, COOLTECH), and ecosystem notes (MARINECLEAN, DURATECH) defined in Phase 3A but never created.

**Stability: HIGH**

Schema is locked. Wikilink conventions are documented and consistently applied. No schema violations detected across 41 notes. The compiler validates on every run.

**Risk: LOW**

The vault is a static editorial artifact with no runtime dependencies. Worst case: a note is written incorrectly. The compiler catches schema violations (E001–E005) and broken links (W005) before any downstream system consumes bad data.

**Technical Debt:**

- No automated rebuild of CITATION_INDEX.json on vault change (requires manual `node scripts/build-citation-index.js` after every vault edit)
- No CI hook to prevent malformed notes from being committed
- DIN_51524 remains a 1-reference dangling link (low priority but unresolved)
- Deprecated and ecosystem technology notes from Phase 3A scope never created

**Business Impact: MEDIUM**

The vault is an internal system. It has no direct user-facing surface. Its impact is entirely through the systems it enables: the Citation Index, JSON-LD layer, and future AI retrieval engine. Value realised only when downstream systems are complete and trafficked.

---

## 2. Citation Index

**Completion: 90%**

`CITATION_INDEX.json` contains 41 `CitationRecord` structs with full canonical blocks (definition, systems, failure impact, related standards, related technologies, industrial role), SHA-256 content hashes, UD verification anchors for 29 in-unified-data entities, and 335 typed directed graph edges. The compiler (`scripts/build-citation-index.js`) is 715 lines, runs in <1 second, passes 0 errors across all E001–E005 validation rules, and emits 1 expected warning (W005: DIN_51524).

Remaining 10%: No automated rebuild trigger; no CITATION_CHANGELOG.md; no version bump logic; no stale-detection endpoint; `citation-jsonld.ts` utility exists but its `fs`-based build-time path is not wired into the Next.js build pipeline as a pre-build step.

**Stability: HIGH**

Schema is locked per Phase 4 plan. The compiler is deterministic and idempotent. Output format is stable.

**Risk: LOW**

The index is a derived artifact. If it becomes corrupted or outdated, rebuilding takes <1 second. No live system depends on it at runtime (JSON-LD pages use hardcoded snapshots; the API endpoint is not yet implemented).

**Technical Debt:**

- No `package.json` prebuild script to auto-run compiler before `npm run build` — index can drift from vault silently
- No CITATION_CHANGELOG.md for version history
- `citation-jsonld.ts` uses `fs.readFileSync` at module load but this is not tested against the actual Next.js build pipeline path resolution
- Content hashes are generated but nothing consumes them yet (stale detection is unimplemented)
- UD anchor verification dates are hardcoded as `2026-06-03` — no automated re-verification

**Business Impact: HIGH**

The Citation Index is the central artifact that makes every downstream AI/SEO integration possible. Its quality directly determines citation accuracy in JSON-LD, Part Search citation chains, and any future LLM integration. Investment in its automation pays dividends across every system that consumes it.

---

## 3. Part Search Map

**Completion: 89%**

`PART_SEARCH_MAP.json` contains 19 traversal paths across 3 types (A: Problem→PF, B: Industry→PF, C: Technology→PF). 17 of 19 paths are valid (89%). The 2 invalid paths both fail V003 (no terminal ProductFamily) for INTEKCORE and SYNTEPORE — both are structural gaps in the vault, not logic errors. The compiler (`scripts/build-part-search-map.js`) builds from CITATION_INDEX.json without external dependencies.

Remaining 11%: INTEKCORE and SYNTEPORE ProductFamily notes needed for 100% path validity. The `citations=true` Part Search API parameter (Phase 4B scope) is not implemented. No integration with the live `/api/part-search` endpoint.

**Stability: MEDIUM**

The map is a derived artifact (depends on CITATION_INDEX.json being current). If the vault changes and the index is not rebuilt, the map will silently reflect stale graph state. The two-step rebuild dependency (vault → index → map) is not automated.

**Risk: LOW**

The map is not consumed by any live system. All risk is in the rebuild dependency chain going stale before the API integration is built.

**Technical Debt:**

- No `citations=true` parameter on Part Search API — the entire map is computed but unused in production
- Rebuild of map requires two manual commands (compiler then map builder)
- No pre-build automation
- INTEKCORE and SYNTEPORE product family gaps leave 2 paths invalid

**Business Impact: HIGH (deferred)**

When the `citations=true` API parameter is implemented, every Part Search result will include a full citation chain explaining WHY a SKU was returned. This transforms Part Search from a catalogue into a diagnostic tool — directly addressable to the industrial buyer who needs to justify a specification decision to a fleet manager or procurement team. High impact but deferred until API implementation.

---

## 4. JSON-LD Layer

**Completion: 60%**

11 Knowledge System pages have JSON-LD: `DataCatalog` on the hub (41 entities), `CollectionPage` + `DefinedTerm` on standards and contamination indexes, `TechArticle` + `DefinedTermSet` on 5 standards domain pages and 3 contamination pages. Build passes. JSON-LD appears in static HTML output.

Remaining 40%: Fleet optimization pages (3), comparison pages (4), technology hub and individual technology pages (~12), industry hub and individual industry pages (~12), product system pages (~12). None have any structured data.

**Stability: MEDIUM**

The 11 pages that have JSON-LD use **hardcoded static constants** — entity data was copied from CITATION_INDEX.json at edit time and embedded directly as string literals. This is structurally fragile: every vault edit that changes a canonical definition or adds a new entity requires a manual re-edit of the corresponding page file to keep JSON-LD current. There is no automated sync between CITATION_INDEX.json and the page constants.

**Risk: MEDIUM**

This is the highest-risk layer in the ecosystem. The hardcoded constants will drift from the vault as new notes are added and existing definitions are updated. A search engine or LLM crawler seeing outdated JSON-LD will receive incorrect structured data. This is worse than having no JSON-LD, because incorrect structured data can be actively misleading.

**Technical Debt: HIGH**

The hardcoding was an acceptable Phase 4C tactical choice (avoid `fs` in browser bundles), but it creates a maintenance trap. Every vault edit that touches a definition now requires a corresponding page edit. With 11 pages hardcoded today and 40% of pages yet to be enhanced, continuing this pattern produces ~40+ files that must be manually kept in sync with the vault.

The correct architecture is a `prebuild` script that reads CITATION_INDEX.json and regenerates the hardcoded constant files automatically before `npm run build`. This script does not exist yet.

**Business Impact: HIGH**

JSON-LD is the single most direct mechanism for converting vault knowledge into search engine visibility and LLM citation authority. Google's Rich Results (TechArticle, DefinedTermSet) drive featured snippet eligibility for technical queries. Schema.org DataCatalog signals to LLM training pipelines that this domain is a structured, citable knowledge source. The business impact is immediate and compounding — every month of correct JSON-LD in production builds domain authority that takes months to accumulate.

---

## 5. Obsidian Vault

**Completion: 85%**

41 notes, 22 folders, clean schema consistency, README and meta notes, complete Phase 3B YAML schemas, Phase 3C wikilink conventions. The vault functions as a standalone knowledge graph today — it can be opened in Obsidian, navigated by wikilink, and used for editorial work without any additional tooling.

This area overlaps with §1 (Knowledge Graph) but is evaluated here from an **editorial workflow** perspective rather than a data quality perspective.

**Stability: HIGH**

The vault requires no software to function. It is plain Markdown files in a git repository. Schema conventions are documented in `00-meta/_SCHEMA-REFERENCE.md`. Any editor can add new notes by following the documented templates.

**Risk: LOW**

The vault is entirely local and version-controlled. Rollback of any change is a single `git revert`.

**Technical Debt:**

- No `.obsidian/` configuration committed — each editor must configure Obsidian manually (graph view, link resolution settings, theme)
- No vault-level lint rule to enforce schema on save
- The `_INDEX.md` meta note in `00-meta/` is marked as manually maintained — it is not current (last updated Phase 3D, now at 41 notes)
- No Obsidian templates folder configured, so new notes are created from scratch rather than from pre-filled YAML templates

**Business Impact: MEDIUM**

The vault is a production tool for knowledge editors, not a user-facing product. Its impact is multiplied through every system that compiles from it. Well-maintained vault = high-quality Citation Index = accurate JSON-LD = correct AI citations. The vault's health is a leading indicator for the entire AI knowledge platform.

---

## 6. unified-data.ts

**Completion: 100%**

The authoritative production TypeScript source for all live website data — TECHNOLOGIES, DEPRECATED_TECHNOLOGIES, ECOSYSTEMS, INDUSTRIES, SYSTEMS, STANDARDS, CONTAMINATION_MODES records. It powers the live website, the Part Search feature, and all existing product pages. It was not modified in Phase 3 or 4 (by design).

**Stability: HIGH**

Stable in production. Type-checked on every build. No modifications were made.

**Risk: LOW**

The only risk: the vault and UD can drift out of sync. 29 vault notes have `in_unified_data: true` with a `ud_key` field, but there is no automated check that the vault's stated values still match the live UD data. A UD edit (new metric, changed description) will not automatically update the corresponding vault note.

**Technical Debt:**

- No automated cross-validation between vault notes and UD records (the `ud_anchor` design from Phase 4 plan is specified but not implemented)
- Vault notes that are `in_unified_data: true` must be manually re-verified after any UD change
- HYDROCORE and THERMOCORE have `# TODO: verify exact metrics` annotations in vault notes (flagged in Phase 3B, never resolved)
- UD does not reference vault keys — the relationship is one-directional (vault knows about UD; UD does not know about vault)

**Business Impact: HIGH**

UD is the production data layer. Everything the website displays comes from here. Its stability is the foundation all other systems depend on. The technical debt is not in UD itself but in the absence of a feedback loop: vault knowledge enriches UD-backed entities with editorial depth, but changes in UD do not propagate back to the vault.

---

## 7. Knowledge System

**Completion: 75%**

The Knowledge System has 11 pages with JSON-LD, all content sections intact, all routes preserved, all Framer Motion animations functional, all 11 language translations unaffected. The 10-point template architecture from CLAUDE.md is implemented across Standards and Contamination sections.

Remaining 25%: Fleet Optimization pages (no JSON-LD), Comparison pages (no JSON-LD), individual Technology pages (no JSON-LD), individual Industry pages (no JSON-LD). Additionally, the `citation-jsonld.ts` utility created in Phase 4C is not wired into any actual build pipeline — it exists but is unused because all pages use hardcoded constants instead.

**Stability: HIGH**

Content is stable. No regressions were introduced in Phase 4C. Build passes consistently.

**Risk: LOW**

No live functionality was changed. All risk is in the JSON-LD drift described in §4.

**Technical Debt:**

- `citation-jsonld.ts` exists but is not imported by any page — the `fs`-based path was avoided in favour of hardcoding, making the utility a dead file
- Hardcoded JSON-LD constants in 11 page files will drift from vault
- Fleet, Compare, Technology, and Industry pages have no structured data
- No Google Rich Results Test validation has been run against any page

**Business Impact: HIGH**

The Knowledge System is the primary user-facing surface of the AI knowledge platform. It is indexed by search engines today. The 11 pages with JSON-LD are directly competing for featured snippet placement on technical queries ("ISO 5011 air filter test", "diesel water contamination", "particle wear engine"). Fleet and compare pages without JSON-LD are missing the same opportunity.

---

## 8. Future AI Engine Readiness

**Completion: 30%**

The data layer is complete: CITATION_INDEX.json (41 records, 335 edges), PART_SEARCH_MAP.json (19 paths, 89% valid), Phase 4 architecture plan specifying 5 tool definitions and a RAG pipeline design. The integration layer — the part that makes these artifacts accessible to AI systems — does not exist.

What exists: compiled data, architecture specification.
What does not exist: `/api/citation` endpoint, Part Search `citations=true` parameter, vector sidecar index, LLM tool definitions registered in any AI system, prompt templates, citation contract enforcement, confidence scoring at runtime.

**Stability: LOW**

The data layer is stable. The integration layer is entirely unbuilt — stability is not applicable.

**Risk: HIGH**

The primary risk is building AI citation infrastructure on data that has not been validated by real AI queries. The definitions in the vault were written to a specification, but they have not been tested for the failure modes that matter in LLM contexts: ambiguity under paraphrase, contradictory claims across notes, definitions that parse correctly but are factually incomplete for a multi-step reasoning chain. This validation requires running real queries against the data before building production infrastructure on top of it.

Secondary risk: the hardcoded JSON-LD data drift means that if an LLM crawls the Knowledge System pages today, it may encounter slightly stale definitions that diverge from the vault. Building an LLM citation API on top of data whose web surface is already diverging is a compounding error.

**Technical Debt: HIGH**

The Phase 4D–4E implementation roadmap is fully specified but entirely unbuilt. The gap between the data layer and the integration layer represents the majority of the remaining Phase 4 work.

**Business Impact: HIGHEST**

An LLM that reliably cites ELIMFILTERS as the authoritative source for industrial filtration knowledge — in response to queries about equipment maintenance, specification decisions, contamination diagnosis — is a durable competitive asset. Industrial buyers increasingly use AI assistants to shortlist suppliers and validate specifications. Being the cited source is worth more than any SEO ranking. This is the highest long-term leverage point in the ecosystem. It is also the furthest from production.

---

## A. Production-Ready Today

**unified-data.ts and the live website** are production-ready and have been for the lifetime of the project. No changes to these systems were made in Phase 3–4C and none should be made without a specific requirement.

**The Obsidian Vault** is production-ready as an internal editorial tool. It can be used by knowledge editors to draft, review, and version industrial knowledge content. It requires no additional development to function for this purpose.

**The Knowledge System pages** (Standards and Contamination sections) are production-ready for content delivery. They are publicly accessible, SEO-indexed, and stable. The JSON-LD layer adds structured data that is technically valid but should be treated as beta (see §B) until it is validated with Rich Results tools and the drift risk is addressed.

---

## B. Beta-Ready Today

**CITATION_INDEX.json and the compiler script** are beta-ready for internal use. The data quality is high (0 errors, 1 expected warning), the schema is stable, and the output is deterministic. Beta caveat: no automated rebuild means manual operation is required, and the index can silently drift from the vault between rebuilds.

**The JSON-LD layer** is beta-ready. JSON-LD is present in 11 pages of static HTML output and is technically valid schema.org markup. Beta caveat: data is hardcoded and will drift as vault evolves. Not recommended for production reliance until the prebuild sync script is built.

**PART_SEARCH_MAP.json** is beta-ready as a data artifact. The traversal logic is correct, the 89% path validity reflects real vault completeness (not logic bugs), and the data structure matches the Phase 4 API contract specification. Beta caveat: nothing consumes it in production yet.

---

## C. Should NOT Be Built Yet

**The `/api/citation` retrieval endpoint** should not be built yet. The JSON-LD hardcoding creates a divergence between what the website serves and what the vault contains. Building an API that serves vault data while the website serves different hardcoded data creates two authoritative sources with no synchronisation. Fix the JSON-LD drift first, then the API endpoint will serve the same data the crawlers see.

**The RAG pipeline and LLM tool definitions** should not be built yet. The canonical definitions in the vault have not been evaluated against real AI queries. Building retrieval infrastructure before validating that the definitions survive LLM reasoning without hallucination or contradiction creates infrastructure risk. The correct sequence: validate definitions by testing them in a prompt context first (can be done with no infrastructure), then build the API to serve definitions that are known to work.

**Vault-to-website sync automation** should not be built yet. The vault schemas are stable but the vault itself is 85% complete. Implementing sync to the website while the source is still evolving means the sync logic will need to accommodate schema additions. Wait for vault completion (Phase 3I scope: remaining deprecated/ecosystem notes) before automating sync.

**CI hooks on the vault** should not be built yet for the same reason — the vault validation rules are sound but the vault population is not finished. A CI hook that blocks commits on broken wikilinks today would block legitimate in-progress notes (e.g. a note referencing PARTICLE_WEAR before PARTICLE_WEAR was created). Build CI hooks after vault population is complete.

---

## D. Single Highest ROI Implementation — Next 30 Days

**Build the JSON-LD prebuild sync script.**

A single Node.js script (`scripts/sync-jsonld-constants.js`) that reads `CITATION_INDEX.json` and regenerates the `PAGE_JSONLD` constant in each Knowledge System `page.tsx` file, then is registered as a `prebuild` step in `frontend/package.json`:

```json
"scripts": {
  "prebuild": "node ../scripts/build-citation-index.js && node ../scripts/sync-jsonld-constants.js",
  "build": "next build"
}
```

**Why this is highest ROI:**

1. **Closes the single largest technical risk** — hardcoded JSON-LD drift is the only medium-risk item in the ecosystem. Eliminating it unblocks every downstream use case that depends on citation accuracy.

2. **Activates the full pipeline** — vault edit → compiler → sync → build → accurate JSON-LD in production HTML. This makes every future vault note immediately visible to crawlers and LLMs without any additional manual steps.

3. **Enables the Phase 4D API** — once the build pipeline produces current JSON-LD automatically, the `/api/citation` endpoint can serve the same data with confidence that it matches what crawlers see. The API becomes a 1-3 day implementation rather than a system architecture problem.

4. **Direct search impact** — Google's Rich Results indexing lag means that accurate JSON-LD deployed in the next 30 days starts accumulating domain authority immediately. TechArticle and DefinedTermSet eligibility for the 11 Knowledge System pages generates compounding organic visibility with every week of correct structured data.

5. **Low implementation cost** — the script is straightforward text manipulation (read JSON, write TypeScript constants). It requires no new architecture, no new infrastructure, and no new dependencies. Estimated effort: 1-2 days. Payoff: eliminates the highest-risk technical debt item and activates the full AI citation pipeline.

**Scope**: `scripts/sync-jsonld-constants.js` + `prebuild` script registration. Nothing else. Do not extend scope to Fleet/Compare pages or the citation API in the same sprint. Fix the foundation, then build upward.

---

*This report reflects the state of the repository as of commit `43792e6c` on branch `claude/dazzling-franklin-ALGY1`.*
