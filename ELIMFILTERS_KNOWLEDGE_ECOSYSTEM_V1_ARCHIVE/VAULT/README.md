# ELIMFILTERS® Knowledge Vault

**Purpose:** Machine-readable industrial filtration knowledge graph for ELIMFILTERS®.
This vault is the editorial master for entity definitions, relationships, and canonical
knowledge blocks used by the Part Search traversal and AI retrieval layer.

---

## What this vault is

A structured Obsidian knowledge graph connecting 11 entity types:

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
| CaseStudy | `10-case-studies/` | `CS_DIESEL_WATER` |
| TechnicalArticle | `11-articles/` | `TA_AIR_INTAKE_SYSTEMS` |

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

## Editing rules

### File naming
- Always uppercase key, exactly matching the TypeScript key in `unified-data.ts`
- Underscores for multi-word: `BUS_COACH.md`, `ISO_8573_1.md`
- No spaces, no hyphens, no lowercase in filenames

### YAML frontmatter
- YAML is the machine-readable sync contract — keep it accurate
- Relationships in YAML: bare wikilink form `[[KEY]]`
- Only modify `ud_description` if you have verified the change against `unified-data.ts`
- Do not invent data for HYDROCORE or THERMOCORE — both carry unverified TODO flags

### Body text
- Body text is editorial — free-form prose, never parsed by automation
- Relationships section: use display alias form `[[KEY|Display Name]]`
- AI Retrieval section: maintain the canonical block format exactly

### Wikilink format
- In YAML arrays: `"[[KEY]]"` — bare key, no display alias
- In body text: `[[KEY|Display Name — Context]]` — always include alias
- Never use: `[[key]]` (lowercase), `[[KEY.md]]` (with extension), `[[KEY NAME]]` (spaces)

### in_unified_data flag
- `true` — entity record exists in `frontend/src/lib/unified-data.ts`
- `false` — entity does not exist in UD; vault note is the only authoritative source
- Do not change this flag without also updating `unified-data.ts`

---

## Sync relationship with unified-data.ts

**Current Phase:** 3D — Manual foundation (no automated sync)

The vault and `unified-data.ts` are **manually synchronised**. Changes to structural
fields (keys, slugs, standards lists) must be reflected in both places. The vault is
the editorial master for prose fields (taglines, descriptions, geo definitions).

Automated bidirectional sync is planned for Phase 3E (not yet authorised).

---

## Phase status

| Phase | Description | Status |
|-------|-------------|--------|
| 3A | Folder structure, YAML schemas, entity definitions | Complete (commit d42f75c2) |
| 3B | Full entity model for 10 entity types | Complete (commit 6b961b42) |
| 3C | Complete relationship model | Complete (commit 18d94dfa) |
| 3D | Vault creation, starter notes | **Current** |
| 3E | Remaining 58 Phase 3A notes | Not started |
| 3F | Phase 3B additions (~105 notes) | Not started |
| 3G | Automated sync layer | Not authorised |

---

## Do not

- Do not edit files in `frontend/` from inside this vault
- Do not create automated sync without explicit authorisation
- Do not invent specifications for HYDROCORE or THERMOCORE
- Do not commit `.obsidian/` folder contents — Obsidian config is local only

Add `.obsidian/` to `.gitignore` at project root if not already present.
