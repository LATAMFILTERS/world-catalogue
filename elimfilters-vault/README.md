# ELIMFILTERS® Knowledge Vault

**Purpose:** Machine-readable industrial filtration knowledge graph for ELIMFILTERS®.
This vault is the editorial master for entity definitions, relationships, canonical
knowledge blocks and governed intelligence proposals used by Part Search and the AI retrieval layer.

---

## What this vault is

A structured Obsidian knowledge graph with canonical entity folders and a separate governed review workflow.

### Canonical knowledge

| Entity | Folder | Key Pattern |
|--------|--------|-------------|
| Technology | `01-technologies/` | `MACROCORE` |
| Industry | `02-industries/` | `MINING` |
| System | `03-systems/` | `AIRFILTER` |
| Standard | `04-standards/` | `ISO_5011` |
| ContaminationMode | `05-contamination/` | `PARTICLE_WEAR` |
| Component | `06-components/` | `TURBOCHARGER_BEARING` |
| Problem | `07-problems/` | `DUST_INGESTION` |
| ProductFamily | `08-product-families/` | `AIRFILTER_PRIMARY` |
| Product (SKU) | `09-products/` | `TURBOCORE_SERIES_900FH` |
| CaseStudy | `10-case-studies/` | `CS_DIESEL_WATER` |
| TechnicalArticle | `11-articles/` | `TA_AIR_INTAKE_SYSTEMS` |
| OEM | `12-oems/` | `VOLVO_TRUCKS` |
| Equipment | `13-equipment/` | `VOLVO_FH_AERO_2027` |
| Approved Intelligence | `14-intelligence/` | `INTEL_DONALDSON_2026_001` |
| Filter Media | `15-filter-media/` | `MEDIA_SYNTHETIC_FUEL_001` |
| Supplier | `16-suppliers/` | `AHLSTROM` |
| Technology Watch | `17-technology-watch/` | `WATCH_NANOFIBER_2026_001` |

### Governed HERMES workflow

These folders are not canonical knowledge and must never be queried as approved production truth:

| Workflow area | Folder | Purpose |
|---|---|---|
| HERMES Inbox | `90-hermes-inbox/` | Raw normalized candidates |
| Pending Review | `91-pending-review/` | Candidates awaiting Victor's decision |
| Approved Updates | `92-approved-updates/` | Approved changes waiting for publication |
| Rejected | `93-rejected/` | Rejected candidates with decision evidence |
| Sync Log | `94-sync-log/` | Publication and synchronization audit records |

The governing contract is defined in `docs/architecture/HERMES_OBSIDIAN_GOVERNANCE.md`.

---

## Part Search traversal path

```
User describes a problem (plain language)
        ↓
Problem note (07-problems/)
        ↓ root_contamination
ContaminationMode note (05-contamination/)
        ↓ resolved_by
Technology note (01-technologies/)
        ↓ ProductFamily lookup
ProductFamily note (08-product-families/)
        ↓ contains_skus / Part Search DB query
Product / SKU result
```

---

## HERMES governance path

```
Official and technical sources
        ↓
HERMES candidate
        ↓
90-hermes-inbox
        ↓
91-pending-review
        ↓
Weekly email and Victor approval
        ↓
92-approved-updates or 93-rejected
        ↓
Controlled canonical update
        ↓
PostgreSQL / pgvector / Knowledge Graph
        ↓
94-sync-log
```

HERMES discovers and proposes. Victor approves or rejects. A controlled publisher performs approved updates.

No HERMES candidate is authoritative before approval and publication.

---

## Editing rules

### File naming
- Always use an uppercase entity key.
- Use underscores for multi-word keys: `BUS_COACH.md`, `ISO_8573_1.md`.
- Canonical product and legacy entity keys must continue matching their approved source contracts.
- HERMES candidates use the prefix `HERMES_` followed by a unique stable key.

### YAML frontmatter
- YAML is the machine-readable sync contract; keep it accurate.
- Relationships in YAML use bare wikilinks: `"[[KEY]]"`.
- Only modify `ud_description` after verifying the corresponding value in `unified-data.ts`.
- Do not invent data for HYDROCORE or THERMACORE; both carry unverified TODO flags.
- HERMES workflow files must use the metadata contract in `HERMES_OBSIDIAN_GOVERNANCE.md`.

### Body text
- Body text is editorial and is not a substitute for structured metadata.
- Relationships section: use display alias form `[[KEY|Display Name]]`.
- AI Retrieval section: maintain the canonical block format exactly.
- Source-reported competitor claims must remain identified as source-reported claims.

### Wikilink format
- In YAML arrays: `"[[KEY]]"` — bare key, no display alias.
- In body text: `[[KEY|Display Name — Context]]` — include an alias.
- Never use `[[key]]`, `[[KEY.md]]` or free-form filenames with spaces.

### in_unified_data flag
- `true` — entity record exists in `frontend/src/lib/unified-data.ts`.
- `false` — entity does not exist in UD; vault note may be the approved editorial source.
- Do not change this flag without also updating `unified-data.ts` when applicable.

---

## Approval boundary

The following folders are proposal and workflow areas only:

- `90-hermes-inbox/`
- `91-pending-review/`
- `92-approved-updates/`
- `93-rejected/`
- `94-sync-log/`

Files in these folders must not be surfaced as approved technical knowledge to customers, distributors, bots or production assistants.

Only approved content published into a canonical entity folder may become production knowledge.

---

## Sync relationship with unified-data.ts and PostgreSQL

**Current Phase:** Manual foundation with governed HERMES architecture defined.

The vault and `unified-data.ts` remain manually synchronized. Changes to structural fields must be reflected in every applicable canonical source.

The existing Obsidian indexer produces an inventory and unresolved-wikilink report. It does not publish to PostgreSQL.

Automated publication is not authorized until it enforces:

- metadata validation;
- evidence requirements;
- Victor approval;
- field-level change records;
- idempotency;
- conflict detection;
- immutable sync logging.

---

## Phase status

| Phase | Description | Status |
|-------|-------------|--------|
| 3A | Folder structure, YAML schemas, entity definitions | Complete |
| 3B | Core entity model | Complete |
| 3C | Core relationship model | Complete |
| 3D | Vault creation and starter notes | Current |
| 3E | Remaining canonical notes | Not started |
| 3F | Additional entity population | Not started |
| 3G | Automated sync layer | Not authorized |
| 3H | HERMES governed intake and approval architecture | Architecture approved; implementation pending |

---

## Do not

- Do not edit files in `frontend/` from inside this vault.
- Do not create automated database sync without explicit authorization.
- Do not let HERMES write directly into canonical folders.
- Do not synchronize candidates lacking approval and evidence.
- Do not invent specifications for HYDROCORE or THERMACORE.
- Do not commit `.obsidian/` folder contents; Obsidian configuration is local only.

Add `.obsidian/` to `.gitignore` at project root if not already present.
