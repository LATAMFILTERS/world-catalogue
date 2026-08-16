# ELIMFILTERS STANDARDS RELATIONSHIP GOVERNANCE ADDENDUM
Status: APPROVED
Date: 2026-08-16
Related commit: b78fc33 (`frontend/src/lib/canonical-relationships.ts`)
Related branch: `claude/elimfilters-seo-audit-gsc-io4ad3`

## Context

During the MACROCORE™ landing-page rework, an audit of `canonical-relationships.ts`
found that `SAE J1539` was present in `SYSTEM_RELATIONSHIPS['air-intake'].standards`,
a field shared by every technology under the Air Intake & Airflow Protection
system (MACROCORE, INTEKCORE, MICROKAPPA, DRYCORE). Only MACROCORE and
SYNTAPORE are approved for SAE J1539 by the standard's own canonical vault
entity (`elimfilters-vault/04-standards/SAE_J1539.md`), and MACROCORE's own
public-content governance separately prohibits publishing or structuring SAE
J1539 as metadata/schema at all. The system-level field made the standard
reachable, via the entity graph (`entity-graph.ts` → `getConnectedEntities`),
from every technology sharing that system node — regardless of whether that
technology's own canonical sources approved it.

Build verification confirmed SAE J1539 was never rendered on any
`/technologies/[slug]` page (the graph only connects `standard:*` nodes to
`system:*` and `family:*` nodes, never directly to `technology:*`), but it
did reach live HTML/JSON-LD on `/systems/air-intake`.

## Resolution

`SYSTEM_RELATIONSHIPS['air-intake'].standards` was emptied (`[]`).
`FAMILY_RELATIONSHIPS` was left unchanged — each family already maps 1:1 to a
single technology with correctly scoped standards, so it already satisfies
direct technology↔standard resolution without needing a parallel schema.
`MACROCORE.json` (citation API) is unaffected — verified byte-identical
before and after via diff.

## Governance rules established

1. **`SYSTEM_RELATIONSHIPS` must not be a source of standards applicable to
   a technology.** A system node can span multiple technologies and
   sub-domains with non-interchangeable standards (e.g. engine-intake vs.
   cabin-air vs. pneumatic air-drying, all under Air Intake & Airflow
   Protection); listing standards at that level lets any one of them be
   reached from every technology under the system, independent of actual
   applicability.

2. **Standards must derive from explicit `family` or `technology` relations
   with verifiable scope** — traceable to a canonical source that names that
   specific technology (or its 1:1 family) as approved for that specific
   standard.

3. **A family may retain standards only while it stays 1:1 with a single
   technology and introduces no fan-out.** The moment a family's
   `technology` mapping is no longer singular, its standards inherit the
   same over-attribution risk that `SYSTEM_RELATIONSHIPS` had.

4. **If a family comes to contain more than one technology, its standards
   must be re-reviewed before being inherited or published** — do not carry
   the existing standards list forward by default.

5. **A standard entity in `elimfilters-vault/04-standards/` is not, by
   itself, authorization to publish a claim on a technology.** Its
   `applicable_to_technologies` front-matter states the standard's own
   claimed scope; the technology's own canonical sources (its
   `elimfilters-vault/01-technologies/active/*.md`, `canonical-technologies.ts`,
   `canonical-engineering.ts`, `technology-editorial.ts`) must independently
   approve the standard before it is modeled as a publishable relationship.

6. **The technology's source and the standard's source must agree before a
   publishable relationship is created between them.** A relationship should
   only be added to `canonical-relationships.ts` when both sides —
   the standard's vault entity and the technology's own canonical sources —
   name each other.

## Open governance debt: SYNTAPORE™ / SAE J1539

- `elimfilters-vault/04-standards/SAE_J1539.md` declares MACROCORE and
  SYNTAPORE as `applicable_to_technologies`.
- `elimfilters-vault/01-technologies/active/SYNTAPORE.md` does not approve or
  name SAE J1539 in its `RELATED_STANDARDS` block — only generic language
  ("Applicable fuel-filter test methods and application requirements must be
  selected for the approved system...").
- Per rule 6 above, this is a source disagreement, not a resolved
  relationship. There is currently no public exposure of SAE J1539 for
  SYNTAPORE anywhere in `canonical-relationships.ts` (neither
  `FAMILY_RELATIONSHIPS` nor `SYSTEM_RELATIONSHIPS['fuel-cleanliness']`
  reference it).
- **Do not restore, add, or infer a SYNTAPORE ↔ SAE J1539 relationship**
  until Product/Engineering/Brand resolve the discrepancy in a canonical
  source and the vault and technology-editorial entries agree.

## Explicitly not covered by this addendum

- The ~204 files under `frontend/public/api/citation/` beyond `MACROCORE.json`
  remain stale relative to the current vault and were not regenerated or
  cleaned up as part of this work.
- `elimfilters-vault/04-standards/SAE_J1539.md` still contains field-result
  figures (compression-loss percentages, service-interval-hour ranges) that
  are not sourced from the technology-level vault entries and were not
  corrected here.
- Other live consumers of retired MACROCORE claims outside
  `/technologies/macrocore` and its citation JSON (e.g.
  `frontend/src/app/engineering/dust-ingestion/page.tsx`, `AirIntakeFlow.tsx`,
  `terminology-edl.ts`) were identified in an earlier audit but not modified.
