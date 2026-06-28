# VALIDATION_AND_ROLLBACK.md
# ELIMFILTERS — KG Phase 4: Canonical Blocks Validation & Rollback
# Knowledge Graph Phase 4

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q

---

## 1. VALIDATION CHECKLIST

Run after completing all Phase 4 migration scripts (001 through 004).

### A. Schema Integrity

```
□ kg_canonical_blocks table exists
□ kg_concept_links table exists
□ UNIQUE constraint active on (concept_slug, concept_type)
□ CHECK constraint active on concept_type values
□ CHECK constraint active on definition LENGTH ≥ 50
□ CHECK constraint active on version ≥ 1
□ updated_at trigger active on kg_canonical_blocks
□ UNIQUE constraint active on kg_concept_links (source, target, link_type)
```

### B. Block Completeness

```
□ Total technology blocks = 13 (one per kg_technologies row)
□ Total system blocks = 6 (one per kg_systems row)
□ Total contamination_mode blocks ≥ 3 (particle-wear, diesel-water, hydraulic-contamination)
□ All 13 technology slugs have matching canonical blocks
□ All 6 system slugs have matching canonical blocks
□ No concept_slug appears twice with the same concept_type
```

### C. Content Quality

```
□ No NULL definition fields (all 24 seed rows have definitions)
□ No definition shorter than 50 characters
□ All definition fields pass language rules (no prohibited marketing language)
□ All technology blocks have industrial_impact populated with numbers
□ All technology blocks have related_standards non-empty JSONB array
□ All system blocks have related_standards non-empty JSONB array
□ All technology blocks have citation_url populated
□ All system blocks have citation_url populated
□ All version numbers = 1 (first run) or incremented correctly
□ All last_updated = CURRENT_DATE of seed run
```

### D. Link Graph Integrity

```
□ All link source slugs resolve to existing kg_canonical_blocks rows
□ All link target slugs resolve to existing kg_canonical_blocks rows
□ No self-referencing links (source_slug ≠ target_slug)
□ All link_type values are in approved set
□ technology → contamination_mode 'controls' links present (≥5)
□ standard → system 'measures' links present (≥6)
□ contamination_mode → system 'applies_to' links present (≥5)
```

---

## 2. SQL VALIDATION QUERIES

These are also included in `migrations/kg-phase4/validate.sql`. Run individually during debugging:

```sql
-- A1: Block count by type
SELECT concept_type, COUNT(*) AS cnt
FROM kg_canonical_blocks
GROUP BY concept_type
ORDER BY concept_type;
-- Expected: technology=13, system=6, contamination_mode≥3

-- A2: Technology coverage check (must return 0 rows)
SELECT t.slug AS missing_tech
FROM kg_technologies t
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = t.slug AND b.concept_type = 'technology'
WHERE b.id IS NULL AND t.is_active = TRUE;

-- A3: System coverage check (must return 0 rows)
SELECT s.slug AS missing_system
FROM kg_systems s
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = s.slug AND b.concept_type = 'system'
WHERE b.id IS NULL;

-- B1: NULL definition check (must return 0 rows)
SELECT concept_slug, concept_type FROM kg_canonical_blocks WHERE definition IS NULL;

-- B2: Short definition check (must return 0 rows)
SELECT concept_slug, concept_type, LENGTH(definition) AS def_length
FROM kg_canonical_blocks WHERE LENGTH(definition) < 50;

-- B3: Missing industrial_impact for technology blocks (must return 0 rows)
SELECT concept_slug FROM kg_canonical_blocks
WHERE concept_type IN ('technology', 'system') AND (industrial_impact IS NULL OR industrial_impact = '');

-- B4: Empty related_standards JSONB (must return 0 rows)
SELECT concept_slug, concept_type
FROM kg_canonical_blocks
WHERE related_standards = '[]'::jsonb
  AND concept_type IN ('technology', 'system');

-- B5: citation_url missing for technology/system blocks (must return 0 rows)
SELECT concept_slug, concept_type FROM kg_canonical_blocks
WHERE concept_type IN ('technology', 'system')
  AND (citation_url IS NULL OR citation_url = '');

-- C1: Marketing language scan (must return 0 rows)
SELECT concept_slug, concept_type
FROM kg_canonical_blocks
WHERE
  definition ILIKE '%leading provider%'
  OR definition ILIKE '%superior%'
  OR definition ILIKE '%innovative%'
  OR definition ILIKE '%cutting-edge%'
  OR definition ILIKE '%industry-leading%'
  OR definition ILIKE '%outperforms%'
  OR definition ILIKE '%premium%'
  OR definition ILIKE '%cost savings%'
  OR definition ILIKE '%cheaper than%';

-- D1: Link graph — orphan source check (must return 0 rows)
SELECT cl.source_concept_slug, cl.source_type
FROM kg_concept_links cl
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = cl.source_concept_slug AND b.concept_type = cl.source_type
WHERE b.id IS NULL;

-- D2: Link graph — orphan target check (must return 0 rows)
SELECT cl.target_concept_slug, cl.target_type
FROM kg_concept_links cl
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = cl.target_concept_slug AND b.concept_type = cl.target_type
WHERE b.id IS NULL;

-- D3: Version integrity
SELECT concept_slug, concept_type, version, last_updated
FROM kg_canonical_blocks WHERE version < 1;
-- Must return 0 rows

-- E1: Summary counts
SELECT
  (SELECT COUNT(*) FROM kg_canonical_blocks) AS total_blocks,
  (SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='technology') AS tech_blocks,
  (SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='system') AS system_blocks,
  (SELECT COUNT(*) FROM kg_concept_links) AS total_links,
  (SELECT COUNT(*) FROM kg_concept_links WHERE link_type='controls') AS controls_links,
  (SELECT COUNT(*) FROM kg_concept_links WHERE link_type='measures') AS measures_links,
  (SELECT COUNT(*) FROM kg_concept_links WHERE link_type='applies_to') AS applies_to_links;
```

---

## 3. CONTENT QUALITY CHECKS

These checks require manual review — cannot be fully automated:

### 3.1 Definition Accuracy Check

For each technology block, verify:
- Primary system assignment matches kg_technologies.primary_system_id
- Micron ratings cited are consistent with product DB data
- ISO standards cited are applicable to the technology's primary system

Critical checks:
```sql
-- MICROKAPPA must reference cabin/HEPA/carbon adsorption, NOT coolant
SELECT definition FROM kg_canonical_blocks
WHERE concept_slug = 'microkappa' AND concept_type = 'technology';
-- Must contain: "cabin" or "HEPA" or "carbon adsorption" — NOT "coolant"

-- SYNTRAX must reference lube/engine oil, NOT hydraulic
SELECT definition FROM kg_canonical_blocks
WHERE concept_slug = 'syntrax' AND concept_type = 'technology';
-- Must contain: "lube" or "engine oil" or "SAE J1211" — NOT "hydraulic"

-- NANOFORCE must reference hydraulic, NOT lube oil
SELECT definition FROM kg_canonical_blocks
WHERE concept_slug = 'nanoforce' AND concept_type = 'technology';
-- Must contain: "hydraulic" or "ISO 16889" or "proportional valve" — NOT "engine oil"
```

### 3.2 Metrics Completeness Check

Verify contamination mode blocks contain quantified impacts:
```sql
-- Check each contamination mode has numbers in industrial_impact
SELECT concept_slug, industrial_impact
FROM kg_canonical_blocks
WHERE concept_type = 'contamination_mode';
```

For particle-wear: must include "+15-40% oil consumption" or "-5-12% fuel economy"
For diesel-water: must include "+5-15 seconds" or "+3-8% fuel consumption"
For hydraulic-contamination: must include "+10-30% system pressure" or "1-2 per 500 hours"

### 3.3 Standards Code Accuracy

Verify JSONB standard codes are real codes:
```sql
SELECT concept_slug, concept_type, related_standards
FROM kg_canonical_blocks
WHERE related_standards != '[]'::jsonb
ORDER BY concept_type, concept_slug;
```

Expected codes: ISO 16889, ISO 4406, ISO 5011, SAE J1539, SAE J1211, ASTM D6304,
ISO 12937, ISO 11155, DIN 71220, NFPA T2.14, DIN 51524, ISO 8573-1, ISO 8573-2, ISO 8573-3

---

## 4. ROLLBACK STRATEGY

### Full Rollback (DROP all Phase 4 tables)

**Script:** `migrations/kg-phase4/rollback.sql`

```sql
-- Full Phase 4 rollback (CASCADE handles FK constraints)
DROP TABLE IF EXISTS kg_concept_links CASCADE;
DROP TABLE IF EXISTS kg_canonical_blocks CASCADE;
```

**Impact:** Removes all canonical block data. Does NOT affect Phase 1 tables (kg_technologies,
kg_systems) or the product catalog. Phase 4 is isolated — rollback is safe.

**Time to rollback:** <5 seconds
**Recovery:** Re-run 001_schema.sql through 004_seed_concept_links.sql

### Partial Rollback — Remove by Type

Remove only technology blocks (re-seed after content correction):
```sql
DELETE FROM kg_canonical_blocks WHERE concept_type = 'technology';
```

Remove only contamination mode blocks:
```sql
DELETE FROM kg_canonical_blocks WHERE concept_type = 'contamination_mode';
```

Remove all concept links (re-run 004 after):
```sql
TRUNCATE TABLE kg_concept_links;
```

### Correction Rollback — Fix Specific Block

To correct a single definition without rolling back all blocks:
```sql
-- Fix MICROKAPPA definition if wrong category was seeded
UPDATE kg_canonical_blocks
SET
  definition   = '[corrected definition text]',
  version      = version + 1,
  last_updated = CURRENT_DATE,
  updated_at   = NOW()
WHERE concept_slug = 'microkappa' AND concept_type = 'technology';
```

---

## 5. KNOWN RISKS AND MITIGATIONS

| Risk | Detection | Mitigation |
|------|-----------|-----------|
| MICROKAPPA seeded with wrong category | Check query B in validate.sql | ON CONFLICT DO UPDATE corrects on re-run |
| SYNTRAX seeded as hydraulic instead of lube | Check query B in validate.sql | Explicit correction in seed content |
| definition field too short | CHECK constraint + validate.sql B2 | Extend definition in seed file |
| related_standards JSONB malformed | JSONB type check on INSERT | Test JSONB syntax before execution |
| concept_slug mismatch with kg_technologies | validate.sql A2 | Cross-check slugs against Phase 1 before seeding |
| Link pointing to non-existent concept | validate.sql D1/D2 | Run 004 only after 002 and 003 complete |
