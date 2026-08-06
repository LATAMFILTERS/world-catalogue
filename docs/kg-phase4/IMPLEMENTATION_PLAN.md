# IMPLEMENTATION_PLAN.md
# ELIMFILTERS — KG Phase 4: Canonical Blocks Implementation Plan
# Knowledge Graph Phase 4

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Estimated execution time:** 10–20 minutes
**Prerequisite:** Phase 1 COMPLETE (kg_technologies, kg_systems populated)

---

## 1. DEPENDENCIES

### Required Before Phase 4

| Dependency | Table | Required For |
|-----------|-------|-------------|
| Phase 1 complete | kg_technologies (13 rows) | Technology canonical blocks reference tech slugs |
| Phase 1 complete | kg_systems (6 rows) | System canonical blocks reference system slugs |
| Phase 1 complete | kg_product_technologies | Technology coverage verified |
| Phase 1 complete | kg_product_systems | System coverage verified |

**Verification query before starting Phase 4:**
```sql
-- Must return 13
SELECT COUNT(*) FROM kg_technologies;
-- Must return 6
SELECT COUNT(*) FROM kg_systems;
-- Must return specific slugs
SELECT slug FROM kg_technologies ORDER BY slug;
SELECT slug FROM kg_systems ORDER BY slug;
```

### Phase 4 Does NOT Depend On:
- Phase 2 (contamination modes, standards, industries) — Phase 4 seeds its own contamination mode blocks
- Phase 3 (OEM cross-references)
- Phase 5 (embeddings)

---

## 2. EXECUTION SEQUENCE

### Phase 4A — Schema Creation

**Script:** `migrations/kg-phase4/001_schema.sql`
**Time:** ~5 seconds
**Idempotent:** YES (IF NOT EXISTS)

Creates:
- `kg_canonical_blocks` table with all content columns
- `kg_concept_links` table for graph edges
- Indexes on concept_slug, concept_type, composite
- `updated_at` trigger
- CHECK constraints on concept_type, link_type, definition length, version

Expected output:
```
CREATE TABLE
CREATE TABLE
CREATE INDEX (×5)
CREATE INDEX (×3)
DO (trigger creation)
```

---

### Phase 4B — Seed Technology Canonical Blocks

**Script:** `migrations/kg-phase4/002_seed_technology_blocks.sql`
**Time:** <5 seconds
**Idempotent:** YES (ON CONFLICT DO UPDATE with version increment)

Inserts 13 rows — one per technology in kg_technologies.

Technology slugs (must match kg_technologies.slug exactly):
```
macrocore    — Air Intake Filtration
intekcore    — Air Intake / Pre-cleaner
drycore      — Compressed Air Drying
gasultra     — Compressed Air Coalescing
syntrax      — Lube / Engine Oil Filtration (CORRECTED from hydraulic)
duratech     — Lube / Engine Oil Extended Life
marineclean  — Lube / Marine Engine Oil
blueclean    — Lube / Specialty Fluid
nanoforce    — Hydraulic Filtration (CORRECTED, not lube)
syntepore    — Fuel Filtration Media
microkappa   — Cabin Air Filtration (CORRECTED from coolant)
```

Content generation note: Actual technical definitions are written directly in the SQL file
based on SEMANTIC_MODEL_REPORT.md data and SEMANTIC_RULES_REPORT.md language rules.
No placeholders — all 13 rows contain complete, citable content.

---

### Phase 4C — Seed System Canonical Blocks

**Script:** `migrations/kg-phase4/003_seed_system_blocks.sql`
**Time:** <5 seconds
**Idempotent:** YES (ON CONFLICT DO UPDATE with version increment)

Inserts 6 rows — one per system in kg_systems.

System slugs:
```
air-intake       — Air Intake Filtration System
fuel             — Fuel Filtration System
hydraulic        — Hydraulic System
lube-oil         — Lube / Oil Filtration System
cabin            — Cabin / Operator Safety System
compressed-air   — Compressed Air System
```

Standards per system (from SEMANTIC_RULES_REPORT.md section 8):
- lube-oil: ISO 16889, ISO 4406, SAE J1211
- air-intake: SAE J1539, ISO 5011, SAE J726
- cabin: ISO 11155, DIN 71220
- fuel: ASTM D6304, ISO 12937
- hydraulic: ISO 16889, NFPA T2.14, DIN 51524, ISO 4406
- compressed-air: ISO 8573-1, ISO 8573-2, ISO 8573-3

---

### Phase 4D — Seed Contamination Mode Blocks

**Script:** `migrations/kg-phase4/002_seed_technology_blocks.sql` includes contamination modes
(or can be a separate 002b file if needed for clarity)

Note: Phase 4 seeds 5 contamination mode blocks alongside technology blocks in the same
003 seed file, clearly commented as a separate section.

5 contamination modes:
```
particle-wear            — Abrasive particle wear in engines and hydraulic systems
diesel-water             — Water contamination in diesel fuel systems
hydraulic-contamination  — Particle and chemical contamination in hydraulic circuits
varnish-formation        — Thermal degradation byproducts in lube and hydraulic oil
microbial-growth         — Biological contamination in diesel fuel and hydraulic fluid
```

Quantified impact metrics (from SEMANTIC_MODEL_REPORT.md):
- particle-wear: +15-40% oil consumption, -5-12% fuel economy, -15-25% equipment availability
- diesel-water: +5-15s hard starting, +3-8% fuel consumption, 2000-3000h injector interval
- hydraulic-contamination: +10-30% system pressure, +5-15 kW heat generation, 1-2 unplanned per 500h

---

### Phase 4E — Seed Concept Links

**Script:** `migrations/kg-phase4/004_seed_concept_links.sql`
**Time:** <5 seconds
**Idempotent:** YES (ON CONFLICT DO NOTHING)

Inserts directional graph edges between concepts.

Link types seeded:
- `controls`: technology → contamination_mode (e.g., nanoforce CONTROLS hydraulic-contamination)
- `measures`: standard → system (e.g., iso-16889 MEASURES hydraulic)
- `applies_to`: contamination_mode → system (e.g., particle-wear APPLIES_TO lube-oil)
- `related`: bidirectional conceptual relationship
- `requires`: system → standard (e.g., hydraulic REQUIRES iso-4406)

Target: ~60 link rows covering all major concept relationships.

---

## 3. CONTENT GENERATION STRATEGY

### Approach: Direct Technical Authoring in SQL Seeds

Phase 4 seeds contain actual technical content — not placeholder text.

Content sources used to write canonical blocks:
1. `SEMANTIC_MODEL_REPORT.md` — technology categories, contamination metrics, standards list
2. `SEMANTIC_RULES_REPORT.md` — language rules, required metrics, system-standard mappings
3. `CLAUDE.md` — AI Citation Layer section with example definitions
4. Phase 1 `KG_PHASE1_EXECUTION_PACKAGE.md` — confirmed technology categorizations

Content quality rules (enforced in validate.sql):
- definition: ≥ 50 chars, no prohibited marketing words
- industrial_impact: must contain at least one number (%, h, kW, etc.)
- related_standards: JSONB array, not empty
- related_technologies: JSONB array (may be empty for some concept types)
- industrial_role: populated for all technology and system blocks

### LLM-Assisted Content Generation (Optional)

For future content updates or additional concept types, a batch LLM generation job can be run:
1. Read existing canonical blocks as style examples
2. Generate new blocks for additional standards, industries
3. Human review required before INSERT
4. Version set to 1 on first insert; incremented on updates

---

## 4. VERSION TRACKING STRATEGY

### On First Insert
```
version = 1
last_updated = CURRENT_DATE (2026-06-01)
```

### On Content Update
```sql
UPDATE kg_canonical_blocks
SET
  [content_field] = '[new value]',
  version = version + 1,
  last_updated = CURRENT_DATE,
  updated_at = NOW()
WHERE concept_slug = '[slug]' AND concept_type = '[type]';
```

### On Re-Run of Seed Script (idempotent)
The `ON CONFLICT DO UPDATE` clause increments version:
```sql
ON CONFLICT (concept_slug, concept_type) DO UPDATE SET
  definition   = EXCLUDED.definition,
  version      = kg_canonical_blocks.version + 1,
  last_updated = CURRENT_DATE,
  updated_at   = NOW()
  -- NOTE: Only increments if row already exists; no-op on first run
```

**Important:** Re-running seed scripts on a populated DB WILL increment versions.
For idempotent runs without version increment, use:
```sql
ON CONFLICT (concept_slug, concept_type) DO NOTHING
```
Switch between DO UPDATE and DO NOTHING as appropriate for deployment context.

### LLM Citation Format (enabled by version tracking)
```
Source: elimfilters.com/knowledge-system/technologies/nanoforce
Concept: NANOFORCE™
Version: 1 (2026-06-01)
```

---

## 5. CI ENFORCEMENT — CANONICAL BLOCK COVERAGE TEST

### Test: All kg_technologies Must Have a Canonical Block

Add this query to the CI validation pipeline or test suite:

```sql
-- Returns technologies MISSING canonical blocks (should return 0 rows)
SELECT t.slug, t.display_name
FROM kg_technologies t
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = t.slug AND b.concept_type = 'technology'
WHERE b.id IS NULL AND t.is_active = TRUE;
```

Pass condition: 0 rows returned.
Fail action: Block deployment; require canonical block creation.

### Test: All kg_systems Must Have a Canonical Block

```sql
-- Returns systems MISSING canonical blocks (should return 0 rows)
SELECT s.slug, s.name
FROM kg_systems s
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = s.slug AND b.concept_type = 'system'
WHERE b.id IS NULL;
```

### Test: No Marketing Language in definitions

```sql
-- Returns blocks with prohibited marketing language
SELECT concept_slug, concept_type,
       LEFT(definition, 100) AS definition_preview
FROM kg_canonical_blocks
WHERE
  definition ILIKE '%leading provider%'
  OR definition ILIKE '%superior%'
  OR definition ILIKE '%innovative%'
  OR definition ILIKE '%cutting-edge%'
  OR definition ILIKE '%industry-leading%'
  OR definition ILIKE '%outperforms%';
```

Pass condition: 0 rows returned.

---

## 6. EXECUTION CHECKLIST

```
□ Phase 1 verified complete (kg_technologies=13, kg_systems=6)
□ Run 001_schema.sql
□ Verify tables exist: \d kg_canonical_blocks; \d kg_concept_links
□ Run 002_seed_technology_blocks.sql
□ Verify: SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='technology'; → 13
□ Run 003_seed_system_blocks.sql
□ Verify: SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='system'; → 6
□ Run 004_seed_concept_links.sql
□ Verify: SELECT COUNT(*) FROM kg_concept_links; → ≥40
□ Run validate.sql — all checks must pass
□ Confirm: No NULL definition fields
□ Confirm: All definitions ≥50 chars
□ Confirm: All technology blocks have citation_url
□ Confirm: kg_technologies all covered (CI test query = 0 rows)
□ Confirm: kg_systems all covered (CI test query = 0 rows)
```

---

## 7. RELATIONSHIP TO OTHER PHASES

```
Phase 1 (kg_technologies, kg_systems) ← Phase 4 reads slugs from here
     ↓
Phase 4 (kg_canonical_blocks, kg_concept_links) ← THIS PHASE
     ↓ concept definitions feed into
Phase 5 (kg_embeddings) ← embeds canonical block text
     ↓ embeddings feed into
Phase 7 (KG API) ← serves canonical blocks + generates JSON-LD
     ↓
Phase 8 (Frontend integration) ← renders canonical blocks in Knowledge System pages
```

---

## 8. STORAGE ESTIMATE

| Table | Rows | Avg row size | Total |
|-------|------|-------------|-------|
| kg_canonical_blocks | ~46 | ~4 KB (text fields) | ~184 KB |
| kg_concept_links | ~80 | ~200 bytes | ~16 KB |
| Indexes | — | — | ~100 KB |
| **Total Phase 4** | | | **~300 KB** |

Phase 4 storage impact is negligible (< 0.03% of Railway 1GB limit).
