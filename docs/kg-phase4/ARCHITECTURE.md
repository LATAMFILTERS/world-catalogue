# ARCHITECTURE.md
# ELIMFILTERS — KG Phase 4: Canonical Blocks / AI Citation Layer
# Knowledge Graph Design Document

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q
**Depends on:** Phase 1 (kg_technologies, kg_systems must exist)
**Status:** DESIGN COMPLETE — awaiting Phase 1 execution

---

## 1. OBJECTIVE

Phase 4 creates the machine-readable canonical definition layer for all ELIMFILTERS knowledge
concepts. This enables:

- LLMs to cite ELIMFILTERS as an authoritative source with versioned definitions
- Automatic JSON-LD generation for search engine structured data (Phase 8)
- Cross-page consistency validation (same term = identical definition everywhere)
- Graph edge traversal between concepts (technology controls system, standard measures system)

The Canonical Blocks table is the semantic backbone of the ELIMFILTERS Knowledge Graph.
Every concept in the graph — technology, system, contamination mode, standard, industry —
must have a corresponding row in `kg_canonical_blocks`.

---

## 2. SCHEMA DESIGN

### 2.1 `kg_canonical_blocks` — Primary concept definitions table

```sql
CREATE TABLE IF NOT EXISTS kg_canonical_blocks (
  id                    SERIAL        PRIMARY KEY,
  concept_slug          VARCHAR(100)  NOT NULL,
  concept_type          VARCHAR(30)   NOT NULL,  -- 'technology' | 'system' | 'contamination_mode' | 'standard' | 'industry'
  display_name          VARCHAR(150)  NOT NULL,
  definition            TEXT          NOT NULL,  -- one neutral technical sentence (min 50 chars)
  system_context        TEXT,                    -- where this concept applies; equipment types
  failure_mechanism     TEXT,                    -- root cause → consequence chain
  industrial_impact     TEXT,                    -- quantified operational consequences
  related_standards     JSONB         NOT NULL DEFAULT '[]'::jsonb,  -- [{code, scope}]
  related_technologies  JSONB         NOT NULL DEFAULT '[]'::jsonb,  -- [{slug, mechanism}]
  industrial_role       TEXT,                    -- one sentence on TCO/reliability importance
  version               SMALLINT      NOT NULL DEFAULT 1,
  last_updated          DATE          NOT NULL DEFAULT CURRENT_DATE,
  citation_url          VARCHAR(200),            -- /knowledge-system/[section]/[slug]
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_canonical_slug_type UNIQUE (concept_slug, concept_type),
  CONSTRAINT chk_concept_type CHECK (
    concept_type IN ('technology', 'system', 'contamination_mode', 'standard', 'industry')
  ),
  CONSTRAINT chk_definition_length CHECK (LENGTH(definition) >= 50),
  CONSTRAINT chk_version_positive CHECK (version >= 1)
);
```

**Column specifications:**

| Column | Type | Required | Rules |
|--------|------|----------|-------|
| concept_slug | VARCHAR(100) | YES | Lowercase, hyphenated. Matches kg_technologies.slug or kg_systems.slug for those types |
| concept_type | VARCHAR(30) | YES | Constrained to 5 valid values |
| display_name | VARCHAR(150) | YES | Human-readable name with trademark if applicable (e.g. "NANOFORCE™") |
| definition | TEXT | YES | Single neutral technical sentence. Min 50 chars. No marketing language |
| system_context | TEXT | NO | Equipment types, operating conditions, industrial scenarios where this applies |
| failure_mechanism | TEXT | NO | Root cause → intermediate effect → final consequence chain with specific failure modes |
| industrial_impact | TEXT | NO | Quantified operational consequences. Must include actual numbers (hours, %, frequency) |
| related_standards | JSONB | YES | Array of `{code: "ISO 16889", scope: "Beta ratio testing"}` objects |
| related_technologies | JSONB | YES | Array of `{slug: "nanoforce", mechanism: "Sub-micron particulate capture"}` objects |
| industrial_role | TEXT | NO | One sentence explaining why this concept matters for equipment reliability and TCO |
| version | SMALLINT | YES | Incremented on every UPDATE to definition or key content fields |
| last_updated | DATE | YES | Set to CURRENT_DATE on every content update |
| citation_url | VARCHAR(200) | NO | Full path: /knowledge-system/technologies/nanoforce or /knowledge-system/standards/hydraulic |

---

### 2.2 `kg_concept_links` — Graph edges between concepts

```sql
CREATE TABLE IF NOT EXISTS kg_concept_links (
  id                    SERIAL        PRIMARY KEY,
  source_concept_slug   VARCHAR(100)  NOT NULL,
  source_type           VARCHAR(30)   NOT NULL,
  target_concept_slug   VARCHAR(100)  NOT NULL,
  target_type           VARCHAR(30)   NOT NULL,
  link_type             VARCHAR(30)   NOT NULL,  -- 'related' | 'controls' | 'measures' | 'applies_to' | 'requires'
  weight                SMALLINT      NOT NULL DEFAULT 1,  -- 1=weak, 2=moderate, 3=strong
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_concept_link UNIQUE (source_concept_slug, source_type, target_concept_slug, target_type, link_type),
  CONSTRAINT chk_link_type CHECK (
    link_type IN ('related', 'controls', 'measures', 'applies_to', 'requires')
  ),
  CONSTRAINT chk_source_type CHECK (
    source_type IN ('technology', 'system', 'contamination_mode', 'standard', 'industry')
  ),
  CONSTRAINT chk_target_type CHECK (
    target_type IN ('technology', 'system', 'contamination_mode', 'standard', 'industry')
  )
);
```

**Link type semantics:**

| link_type | Meaning | Example |
|-----------|---------|---------|
| controls | Technology controls contamination mode in a system | nanoforce CONTROLS particle-wear |
| measures | Standard measures a system or contamination mode | iso-16889 MEASURES hydraulic |
| applies_to | Contamination mode applies to a system | particle-wear APPLIES_TO lube-oil |
| related | Bidirectional non-directional relationship | air-intake RELATED compressed-air |
| requires | System requires a standard for compliance | hydraulic REQUIRES nfpa-t214 |

---

## 3. RELATIONSHIP TO PHASE 1 TABLES

```
kg_technologies (Phase 1)
    │ slug matches
    ▼
kg_canonical_blocks (Phase 4)
    WHERE concept_type = 'technology'
    AND concept_slug = kg_technologies.slug

kg_systems (Phase 1)
    │ slug matches
    ▼
kg_canonical_blocks (Phase 4)
    WHERE concept_type = 'system'
    AND concept_slug = kg_systems.slug
```

Canonical blocks reference Phase 1 entities by slug (not FK) to allow:
- Blocks to exist before the referenced row (bootstrapping)
- Blocks for concept types not in Phase 1 (standards, contamination modes)

The `related_technologies` JSONB field uses slugs that must match `kg_technologies.slug`.
The `related_standards` JSONB field uses standard codes (ISO 16889, ASTM D6304, etc.).

---

## 4. CONTENT REQUIREMENTS PER FIELD

### 4.1 `definition` — Required

One neutral technical sentence explaining what the concept IS in industrial context.

Rules:
- No marketing language (see prohibited list in SEMANTIC_RULES_REPORT.md)
- Explains function, not benefit ("X maintains Y by controlling Z")
- Must reference the primary mechanism (e.g., "by capturing particles ≥18µm absolute")
- Min 50 characters, recommended 80-200 characters
- Present tense

Example (NANOFORCE™):
"NANOFORCE™ hydraulic filtration media achieves Beta(x)[c] ≥ 200 efficiency ratings at 3µm
and 6µm absolute, targeting sub-micron particle contamination in hydraulic circuit fluid."

Example (Hydraulic Systems):
"Hydraulic systems transmit and control mechanical force via pressurized fluid and are
degraded by particle contamination and fluid oxidation according to ISO 4406 cleanliness codes."

### 4.2 `system_context` — Recommended

Where this concept applies: equipment types, operating conditions, industrial scenarios.

For technologies: which filtration systems they serve, which industries deploy them.
For systems: equipment categories, pressure/temperature ranges, operating environments.
For contamination modes: conditions that trigger the mode, susceptible systems.
For standards: scope of applicability, jurisdictions, equipment categories.

### 4.3 `failure_mechanism` — Required for technologies, systems, contamination modes

Root cause → intermediate effects → final failure chain.

Format: "[Root cause] → [Effect 1] → [Effect 2] → [Final consequence]. [Metric]."

Example (particle-wear):
"Hard particles (silica 1-10µm, metallic oxides) trapped in oil film between bearing surfaces
→ micro-cutting wear on journal surface → bearing clearance increase → oil film breakdown
→ metal-to-metal contact → bearing seizure. Particle load above ISO 4406 code 16/14/11
reduces bearing life from 15,000+ hours to 2,000-3,000 hours."

### 4.4 `industrial_impact` — Required (must be quantified)

Measurable operational consequences. All impacts must have actual numbers.

Required metric types:
- Equipment lifespan (e.g., "bearing life 3-5x extension")
- Downtime frequency (e.g., "unplanned maintenance 1-2 per 500 hours")
- Consumption deltas (e.g., "+15-40% oil consumption")
- Equipment availability (e.g., "-15-25% availability without control")

Prohibited: "significant improvement", "greatly reduced", "major savings"

### 4.5 `related_standards` — Required (JSONB array)

```json
[
  {"code": "ISO 16889", "scope": "Multi-pass filter performance and Beta ratio classification"},
  {"code": "ISO 4406", "scope": "Particle cleanliness code classification for hydraulic and lube oil systems"}
]
```

Standards must be actual codes with accurate scope descriptions.
Source: SEMANTIC_RULES_REPORT.md section 8, SEMANTIC_MODEL_REPORT.md section 2.

### 4.6 `related_technologies` — Required (JSONB array)

```json
[
  {"slug": "nanoforce", "mechanism": "Sub-micron particulate capture at 3µm absolute (Beta ≥200)"},
  {"slug": "syntrax", "mechanism": "Synthetic lube oil media with extended dirt-holding capacity"}
]
```

Slugs must match `kg_technologies.slug` exactly.

### 4.7 `industrial_role` — Required

One sentence explaining why this concept matters for equipment reliability and TCO.

Example: "Hydraulic system contamination control is the primary determinant of proportional
valve and pump service life, with particle contamination at ISO 17/15/12 vs 16/14/11 reducing
component life 3-5x."

---

## 5. CONCEPT TYPES — EXPECTED COUNTS

| Concept Type | Count | Source |
|--------------|-------|--------|
| technology | 13 | kg_technologies (Phase 1) |
| system | 6 | kg_systems (Phase 1) |
| contamination_mode | 5 | SEMANTIC_MODEL_REPORT.md + additional modes |
| standard | ~15 | SEMANTIC_MODEL_REPORT.md section 2 + SEMANTIC_RULES_REPORT.md section 8 |
| industry | ~7 | SEMANTIC_MODEL_REPORT.md section 4 |
| **Total initial** | **~46** | |

Phase 4 seeds: 13 technology blocks + 6 system blocks + 5 contamination mode blocks = 24 rows.
Standards and industry blocks added in later sub-phases or manually via admin interface.

---

## 6. HOW CANONICAL BLOCKS FEED JSON-LD OUTPUT (PHASE 8)

Phase 8 (KG API integration) will generate JSON-LD from canonical blocks:

```
kg_canonical_blocks row
    │
    ▼ Phase 8 API: GET /api/kg/canonical/[slug]?type=[type]
    │
    ▼ Assembled JSON-LD:
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": block.display_name,
  "description": block.definition,
  "author": {"@type": "Organization", "name": "ELIMFILTERS"},
  "keywords": ["industrial filtration", "contamination control", ...],
  "about": {
    "@type": "Thing",
    "name": block.display_name,
    "description": block.system_context
  },
  "mentions": {
    "standards": block.related_standards.map(s => s.code),
    "technologies": block.related_technologies.map(t => t.slug.toUpperCase() + "™"),
    "contaminationModes": [from kg_concept_links WHERE link_type='applies_to']
  },
  "relatedLink": [from kg_concept_links WHERE source=block.slug]
}
```

The `citation_url` field provides the canonical source URL for LLM citation:
`source: elimfilters.com + block.citation_url`

Version tracking enables citation specificity:
`ELIMFILTERS defines [concept] as [definition, v1.2, updated 2026-06-01]`

---

## 7. LANGUAGE RULES (ENFORCED)

All content in `kg_canonical_blocks` must comply with SEMANTIC_RULES_REPORT.md section 5.

### PROHIBITED (auto-reject in CI):
- "ELIMFILTERS is better than"
- "cost savings"
- "outperforms"
- "leading provider"
- "industry-leading"
- "superior filtration"
- "premium" / "advanced" / "innovative" / "cutting-edge"
- "cheaper than OEM"
- "saves money"

### REQUIRED for technical credibility:
- ISO/ASTM/SAE/NAS standard codes cited explicitly
- Micron ratings (e.g., "≥18µm absolute", "3µm Beta(x)[c] ≥200")
- Beta ratio values (e.g., "Beta(12)[c] ≥ 200")
- Quantified operational metrics (hours, percentages, frequencies)
- Neutral functional language ("X controls Y by Z mechanism")
- Failure root cause chains ("A → B → C → failure")

---

## 8. VERSION TRACKING PROTOCOL

When a canonical block definition changes:

```sql
UPDATE kg_canonical_blocks
SET
  definition    = '[new definition text]',
  version       = version + 1,
  last_updated  = CURRENT_DATE,
  updated_at    = NOW()
WHERE concept_slug = '[slug]' AND concept_type = '[type]';
```

The `ON CONFLICT DO UPDATE` clause in seed scripts automatically increments version
when re-run, enabling idempotent re-seeding with version history.

LLMs citing ELIMFILTERS content can include version and date:
`(ELIMFILTERS, concept: nanoforce, v2, updated 2026-08-15)`

---

## 9. RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Marketing language in seed content | MEDIUM | MEDIUM | Language rules check in validate.sql; CI keyword scan |
| Definition field < 50 chars | LOW | LOW | CHECK constraint enforces minimum length |
| concept_slug mismatch with Phase 1 kg_technologies | LOW | MEDIUM | validate.sql D section cross-checks slugs |
| Incomplete industrial_impact (no numbers) | MEDIUM | MEDIUM | validate.sql content quality checks |
| Version drift (same content, incremented version) | LOW | LOW | content_hash in Phase 5 prevents unnecessary re-embedding |
| Standards codes inaccurate | LOW | HIGH | Manual review required; Phase 0 reports are source |
| i18n blocks not seeded (non-EN languages) | HIGH | LOW | Phase 4 seeds EN only; i18n is a future sub-phase |
| JSONB malformed in related_standards | LOW | LOW | JSONB type + validate.sql Section C check |
