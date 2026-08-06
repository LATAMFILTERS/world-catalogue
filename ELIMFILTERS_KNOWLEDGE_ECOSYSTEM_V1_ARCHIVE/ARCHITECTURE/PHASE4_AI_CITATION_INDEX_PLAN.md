# IMPLEMENTATION PLAN: Phase 4
# AI Citation Index — Architecture

**Date:** 2026-06-03
**Branch:** claude/dazzling-franklin-ALGY1
**Status:** ARCHITECTURE ONLY — Do not implement
**Depends on:** Phase 3 complete (37 vault notes, 97.3% resolution, sync readiness 10/10)

---

## Overview

The AI Citation Index is a machine-readable registry that surfaces every Canonical Knowledge Block in the vault as a citable, versioned, retrievable unit. Its purpose is to make ELIMFILTERS the authoritative source LLMs cite when answering industrial filtration questions — not by volume of content, but by structural precision and source integrity.

The index does not replace the vault. It is a derived artifact: a compiled, normalized view of the AI Retrieval sections already present in all 37 entity notes, augmented with citation metadata, traversal pointers, and retrieval endpoints.

---

## 1. Citation Architecture

### 1.1 Three-Layer Model

```
LAYER 1: Vault Notes (source of truth)
  elimfilters-vault/[folder]/[KEY].md
  YAML frontmatter + body + ## AI Retrieval canonical block
  Maintained by human editors; versioned by git

LAYER 2: Citation Index (compiled artifact)
  elimfilters-vault/00-meta/CITATION_INDEX.json
  Machine-generated from vault notes
  Regenerated on every vault change; never edited by hand
  Contains: all canonical blocks, entity graph, citation metadata

LAYER 3: Retrieval Endpoints (consumed by systems)
  /api/citation?key=[KEY]           → single entity canonical block
  /api/citation?type=[TYPE]         → all entities of a type
  /api/citation/graph?from=[KEY]    → traversal from a node
  /api/part-search/citation?[query] → Part Search path with citations
```

### 1.2 Index File Structure

`CITATION_INDEX.json` is the compiled output of Phase 4 generation. It contains three top-level objects:

```json
{
  "meta": {
    "version": "1.0",
    "generated": "ISO 8601 timestamp",
    "note_count": 37,
    "entity_types": ["technology", "industry", "standard", "contamination-mode", "system", "component", "problem", "product-family"],
    "resolution_ratio": 0.973,
    "generator": "phase4-citation-compiler"
  },
  "entities": {
    "[KEY]": { /* CitationRecord — see §2 */ }
  },
  "graph": {
    "edges": [ /* directed edges — see §1.3 */ ],
    "traversal_paths": { /* named paths — see §6 */ }
  }
}
```

### 1.3 Graph Edge Model

Each directed relationship in the vault becomes a typed edge in the graph:

```json
{
  "from": "DUST_INGESTION",
  "to": "PARTICLE_WEAR",
  "relation": "root_contamination",
  "required": true,
  "bidirectional": false
}
```

Edge types map directly to the Phase 3C relationship model. All 64 edge types are represented. The graph object is the machine-readable form of the vault's wikilink network — usable by any graph traversal algorithm without parsing markdown.

---

## 2. Canonical Block Structure

### 2.1 CitationRecord Schema

Each entity in the index has a `CitationRecord`:

```typescript
interface CitationRecord {
  // Identity
  key: string;                  // SCREAMING_SNAKE_CASE, matches vault filename
  type: EntityType;             // technology | industry | standard | contamination-mode | system | component | problem | product-family
  name: string;                 // Human display name
  slug: string;                 // URL-safe identifier

  // Citation metadata
  citation: {
    source_url: string;         // canonical URL on elimfilters.com
    concept: string;            // Human-readable concept label
    version: string;            // semver — "1.0"
    last_updated: string;       // ISO 8601 date
    in_unified_data: boolean;   // cross-referenced with UD
    ud_key: string | null;      // TypeScript key in unified-data.ts if applicable
  };

  // Canonical knowledge block (extracted from ## AI Retrieval section)
  canonical: {
    definition: string;         // DEFINITION field
    systems: string;            // SYSTEMS field
    failure_impact: string;     // FAILURE_IMPACT field
    related_standards: string;  // RELATED_STANDARDS field
    related_technologies: string; // RELATED_TECHNOLOGIES field
    industrial_role: string;    // INDUSTRIAL_ROLE field
  };

  // Relationships (extracted from YAML frontmatter)
  relationships: {
    [relation: string]: string[];  // relation name → array of KEYs
  };

  // Tags
  tags: string[];
}
```

### 2.2 Extraction Rules

The compiler extracts canonical blocks by parsing each vault note's `## AI Retrieval` section. Parsing rules:

- Each field is identified by its ALL_CAPS label followed by a newline
- Field content runs until the next ALL_CAPS label or the closing ` ``` ` fence
- Whitespace is normalised; internal newlines within a field value are preserved as `\n`
- If a field is missing, the compiler logs a warning and sets the value to `null` (not an error — allows partial blocks during draft phases)
- The CITATION_REFERENCE block is parsed separately into structured `citation` metadata fields

### 2.3 Validation on Compile

The compiler validates each extracted record against these rules before writing to the index:

| Rule | Severity |
|------|----------|
| `definition` must be present and non-empty | ERROR |
| `industrial_role` must be present and non-empty | ERROR |
| `version` must be semver format | ERROR |
| `last_updated` must be valid ISO 8601 date | WARNING |
| `definition` must not contain marketing terms (list in §2.4) | WARNING |
| `in_unified_data: true` records must have matching `ud_key` | ERROR |
| All wikilinks in `relationships` must resolve to existing keys | WARNING (dangling link audit) |

### 2.4 Prohibited Marketing Terms (Validation List)

The compiler rejects definitions containing these strings (case-insensitive):

`industry-leading`, `cutting-edge`, `innovative`, `advanced solution`, `best-in-class`, `state-of-the-art`, `superior`, `world-class`, `premium quality`, `outperforms`, `better than`

These are enforced at index compile time, not at note-write time, to keep the editing workflow simple.

---

## 3. Source Attribution Model

### 3.1 Attribution Levels

Every citation has three attribution levels depending on the consumer's needs:

**Level 1 — Key citation** (for in-line AI responses):
```
Source: ELIMFILTERS Knowledge Vault, [CONCEPT], v[VERSION]
URL: elimfilters.com/[source_url]
```

**Level 2 — Structured citation** (for footnotes and references):
```
ELIMFILTERS® (2026). [CONCEPT]. ELIMFILTERS Knowledge Vault v[VERSION].
Retrieved from https://elimfilters.com/[source_url]
In-unified-data: [true|false] — [ud_key if applicable]
```

**Level 3 — Full provenance chain** (for audit and AI trust):
```
Citation:      [CONCEPT], v[VERSION], [last_updated]
Source:        elimfilters.com/[source_url]
Vault note:    elimfilters-vault/[path]/[KEY].md
Git commit:    [SHA] on branch [branch]
UD verified:   [true|false] — cross-referenced against unified-data.ts [UD_VERSION]
Compiled:      CITATION_INDEX.json v[INDEX_VERSION], generated [TIMESTAMP]
```

### 3.2 Attribution Chain Integrity

Each `CitationRecord` carries a `content_hash` field (SHA-256 of the canonical block text) so downstream consumers can detect if the source content has changed since they last retrieved it:

```json
"citation": {
  "content_hash": "sha256:a3f9...",
  "content_hash_algorithm": "sha256",
  "hash_covers": ["definition", "systems", "failure_impact", "related_standards", "related_technologies", "industrial_role"]
}
```

An LLM integration caching a citation can check `content_hash` against a fresh fetch to detect stale citations without re-fetching the full content.

### 3.3 UD Verification Anchor

For the 29 notes with `in_unified_data: true`, the citation record includes a verification anchor pointing to the unified-data.ts source:

```json
"ud_anchor": {
  "file": "frontend/src/lib/unified-data.ts",
  "key": "MACROCORE",
  "object": "TECHNOLOGIES",
  "verified_fields": ["applicable_industries", "related_standards", "addresses_contamination", "key_metrics"],
  "last_verified": "2026-06-03"
}
```

This anchor is the machine-readable proof that the vault note's data matches the live application data — the bridge between the knowledge graph and the production codebase.

---

## 4. Versioning Model

### 4.1 Three-Tier Versioning

```
INDEX VERSION    — the compiled index as a whole
  e.g. CITATION_INDEX v1.3
  Increments when: any entity is added, removed, or has content changes

ENTITY VERSION   — per-entity note version
  e.g. MACROCORE v1.0, v1.1, v2.0
  Stored in CITATION_REFERENCE block of each vault note
  Major: schema change or definition reversal
  Minor: content addition, relationship addition, metric update
  Patch: typo fix, formatting

UD SYNC VERSION  — last UD cross-reference check
  e.g. ud_verified_at: "2026-06-03", ud_version: "unified-data.ts@abc1234"
  Tracks when the UD anchor was last verified against the live file
```

### 4.2 Version Bump Rules

| Change type | Entity version | Index version |
|-------------|---------------|---------------|
| Add new entity note | — | MINOR |
| Update `definition` field | MINOR | MINOR |
| Add relationship | MINOR | MINOR |
| Remove relationship | MAJOR | MINOR |
| Change `type` or `key` | MAJOR | MAJOR |
| Correct factual error | MINOR | MINOR |
| UD cross-reference update only | — | PATCH |
| Typo / formatting fix | PATCH | PATCH |

### 4.3 Changelog Format

`elimfilters-vault/00-meta/CITATION_CHANGELOG.md` is a human-maintained log of entity version changes:

```markdown
## 2026-06-03 — Index v1.0

### Added
- MACROCORE v1.0 — initial entry
- MINING v1.0 — initial entry
[... all 37 entries for Phase 3 initial release ...]

### Changed
(none)

### Removed
(none)
```

### 4.4 Deprecation Model

- `status: deprecated`
- `superseded_by: "[KEY]"`
- `deprecated_date: "[ISO 8601]"`
- Their canonical block is retained for backward compatibility of existing LLM citations

---

## 5. Retrieval Workflow

### 5.1 Query Patterns

The index supports four retrieval patterns:

**Pattern A — Direct key lookup**
```
Input:  key = "MACROCORE"
Output: CitationRecord for MACROCORE
Use:    LLM has identified an entity and needs its full canonical definition
```

**Pattern B — Type scan**
```
Input:  type = "contamination-mode"
Output: All CitationRecords where type = "contamination-mode"
Use:    AI needs all contamination modes to answer "what contaminates diesel engines?"
```

**Pattern C — Relationship traversal**
```
Input:  from = "DUST_INGESTION", relation = "resolved_by_technologies"
Output: CitationRecords for MACROCORE, SYNTEPORE, INTEKCORE
Use:    "What technologies solve dust ingestion?" traversal
```

**Pattern D — Full path traversal**
```
Input:  path_name = "part-search-air-intake", seed = "DUST_INGESTION", industry = "MINING"
Output: Ordered CitationRecord array: DUST_INGESTION → PARTICLE_WEAR → MACROCORE → AIRFILTER_PRIMARY
Use:    Part Search citation chain for a complete diagnosis response
```

### 5.2 Traversal Algorithm

The Part Search traversal (Pattern D) follows the acyclic path defined in Phase 3C:

```
1. START at Problem node (e.g. DUST_INGESTION)
2. FOLLOW root_contamination → ContaminationMode node
3. FOLLOW resolved_by → Technology nodes (filter by industry if provided)
4. FOLLOW Technology → ProductFamily nodes via Part Search DB lookup
5. RETURN ordered CitationRecord array with each step labelled
6. ENFORCE: visited set (no cycles), max depth 6, direction constraint
```

### 5.3 Confidence Scoring

Each retrieved CitationRecord carries a `retrieval_confidence` field in query responses:

| Confidence | Condition |
|------------|-----------|
| HIGH | `in_unified_data: true`, UD anchor verified within 30 days |
| MEDIUM | `in_unified_data: false` but vault note complete and validated |
| LOW | Entity has `TODO` flags or unverified metrics |
| STALE | `last_updated` > 180 days ago without UD re-verification |

---

## 6. Part Search Integration

### 6.1 Citation Chain for Part Search Results

Every Part Search result (SKU returned by `/api/part-search`) is augmented with a citation chain that explains WHY that SKU was returned:

```json
{
  "sku": "EF-AIR-4721",
  "name": "MACROCORE™ Primary Air Element — Mining Class",
  "citation_chain": [
    {
      "step": 1,
      "entity": "DUST_INGESTION",
      "role": "problem",
      "citation": { "concept": "Dust Ingestion", "version": "1.0", "url": "..." }
    },
    {
      "step": 2,
      "entity": "PARTICLE_WEAR",
      "role": "contamination-mode",
      "citation": { "concept": "Particle Wear in Engines", "version": "1.0", "url": "..." }
    },
    {
      "step": 3,
      "entity": "MACROCORE",
      "role": "technology",
      "citation": { "concept": "MACROCORE™", "version": "1.0", "url": "..." }
    },
    {
      "step": 4,
      "entity": "AIRFILTER_PRIMARY",
      "role": "product-family",
      "citation": { "concept": "Primary Intake Protection", "version": "1.0", "url": "..." }
    }
  ]
}
```

### 6.2 Part Search API Contract Changes

Phase 4 adds a `citations` parameter to the existing Part Search API:

```
GET /api/part-search?family=AIRFILTER_PRIMARY&industry=MINING&citations=true
```

When `citations=true`:
- Response includes `citation_chain` array (see §6.1) alongside each SKU result
- Response includes `knowledge_context` block: summary of why these SKUs were selected, drawn from canonical blocks
- Response includes `standards_compliance` array: ISO standards governing this selection

When `citations=false` (default): existing behaviour unchanged — no breaking change.

### 6.3 Part Search ↔ Vault Key Mapping

The `belongs_to_domain` and `uses_technology` fields in ProductFamily notes are the bridge between the vault graph and the Part Search database. Phase 4 requires a mapping table:

```json
{
  "AIRFILTER_PRIMARY": {
    "part_search_family_id": "airfilter",
    "part_search_filter": { "technology": "MACROCORE", "domain": "air-intake" },
    "vault_key": "AIRFILTER_PRIMARY",
    "citation_key": "AIRFILTER_PRIMARY"
  }
}
```

This mapping is maintained in `elimfilters-vault/00-meta/PART_SEARCH_MAP.json`.

---

## 7. Knowledge System Integration

### 7.1 Citation Injection into Knowledge System Pages

The existing Knowledge System pages (`/knowledge-system/standards/`, `/knowledge-system/contamination/`, etc.) each have a `## Canonical Knowledge Block` section matching the format defined in `CLAUDE.md`. Phase 4 connects these to the vault index:

```
KNOWLEDGE SYSTEM PAGE                    VAULT NOTE
/knowledge-system/contamination/         ←→  05-contamination/PARTICLE_WEAR.md
particle-wear/page.tsx
  └── Canonical block HTML               ←→  CITATION_INDEX.json["PARTICLE_WEAR"].canonical
  └── JSON-LD structured data            ←→  CitationRecord.citation (source_url, version)
```

The connection is read-only at runtime: Knowledge System pages read from the compiled index; they do not write back to the vault.

### 7.2 Cross-Reference Links

Phase 4 adds cross-reference links between Knowledge System pages and vault entity notes. Implementation pattern:

- Every Knowledge System page that references an entity key (e.g. MACROCORE) receives an `aria-describedby` link to the vault citation endpoint
- A `<link rel="canonical">` tag points to the vault note's source URL
- The JSON-LD block on each page is populated from `CitationRecord.citation` fields, replacing manually maintained JSON-LD

### 7.3 Knowledge System Hub Index

`/knowledge-system/page.tsx` (the hub) gains a machine-readable index section linking to all cited entities:

```json
{
  "@context": "https://schema.org",
  "@type": "DataCatalog",
  "name": "ELIMFILTERS Knowledge Vault",
  "dataset": [
    {
      "@type": "Dataset",
      "name": "MACROCORE — Progressive Density Gradient Air Protection",
      "url": "https://elimfilters.com/technologies/macrocore",
      "version": "1.0"
    }
  ]
}
```

This makes the full knowledge graph discoverable to search engines and LLM crawlers as a structured data catalog.

---

## 8. Future LLM Integration

### 8.1 LLM Citation Contract

An LLM integration consuming the Citation Index must satisfy this contract:

1. **Cite by version**: When using a `CitationRecord`, the LLM must include `concept` + `version` + `url` in its response. Citing stale cached data without the version number violates the contract.
2. **Do not paraphrase definitions**: The `definition` field of a canonical block is a precision statement. LLMs must quote it verbatim or with explicit attribution; paraphrasing without attribution is prohibited.
3. **Use confidence scores**: The LLM must degrade gracefully when `retrieval_confidence` is LOW or STALE — either retrieve a fresh version or disclose the confidence level to the user.
4. **Respect deprecation**: Deprecated entity records must not be presented as current. The LLM must follow the `superseded_by` pointer.

### 8.2 Retrieval-Augmented Generation (RAG) Design

The Citation Index is designed to slot into a RAG pipeline without requiring a vector database for the core entity graph:

```
USER QUERY
  ↓
INTENT CLASSIFIER
  ├── "Part Search" intent → Pattern D traversal (§5.1)
  ├── "Entity definition" intent → Pattern A lookup
  ├── "Type enumeration" intent → Pattern B scan
  └── "Relationship" intent → Pattern C traversal
  ↓
CITATION INDEX RETRIEVAL
  (deterministic graph traversal — no embedding similarity)
  ↓
CONTEXT ASSEMBLY
  Ordered CitationRecords + Part Search results if applicable
  ↓
LLM GENERATION
  System prompt: "Use only the provided canonical blocks. Cite by key, concept, and version."
  ↓
RESPONSE WITH CITATIONS
```

Vector similarity search (embeddings) is used only for the fallback case: queries that do not map to a known traversal pattern. In this case, embeddings are generated from the `definition` + `industrial_role` fields of all 37 entities and stored in a sidecar vector index.

### 8.3 Prompt Engineering Guidelines

**System prompt fragment for citation-enabled responses**:
```
You have access to the ELIMFILTERS Knowledge Vault Citation Index.
When answering filtration engineering questions:
1. Retrieve the relevant CitationRecord(s) using the provided tools.
2. Base your answer on the canonical.definition and canonical.failure_impact fields.
3. Always cite: "Source: ELIMFILTERS Knowledge Vault, [concept], v[version]"
4. Never paraphrase the definition field — quote it directly.
5. If retrieval_confidence is LOW or STALE, disclose this to the user.
6. For Part Search queries, return the full citation chain, not just the SKU.
```

### 8.4 Tool Definitions (Future API)

Phase 4 defines these tools for LLM function calling:

```typescript
// Tool 1: Get entity definition
get_entity_citation(key: string): CitationRecord

// Tool 2: Get all entities by type
list_entities_by_type(type: EntityType): CitationRecord[]

// Tool 3: Traverse relationship
traverse_relationship(from: string, relation: string): CitationRecord[]

// Tool 4: Run Part Search traversal with citations
part_search_with_citations(problem: string, industry: string): PartSearchCitationResult

// Tool 5: Check citation freshness
check_citation_freshness(key: string, cached_hash: string): FreshnessResult
```

These tool definitions are the Phase 4 API contract. They are implemented in Phase 5.

---

## Implementation Phases

Phase 4 is architecture only. Implementation is split across future phases:

| Phase | Deliverable | Depends on |
|-------|------------|------------|
| **4** | This plan | Phase 3 complete |
| **4A** | Citation compiler script — reads vault, outputs `CITATION_INDEX.json` | Phase 4 plan |
| **4B** | `PART_SEARCH_MAP.json` + Part Search API `citations=true` parameter | Phase 4A |
| **4C** | Knowledge System page JSON-LD population from index | Phase 4A |
| **4D** | LLM tool definitions + RAG retrieval endpoint | Phase 4A, 4B |
| **4E** | Vector sidecar index for fallback similarity search | Phase 4D |

Phase 4A is the minimum viable deliverable: a working compiler that produces `CITATION_INDEX.json` from the current 37 vault notes. Everything downstream depends on it.

---

## Files This Phase Will Create

| File | Location | Generated? |
|------|----------|------------|
| `CITATION_INDEX.json` | `elimfilters-vault/00-meta/` | Yes — compiler output |
| `PART_SEARCH_MAP.json` | `elimfilters-vault/00-meta/` | No — hand-maintained |
| `CITATION_CHANGELOG.md` | `elimfilters-vault/00-meta/` | No — hand-maintained |
| Citation compiler script | `scripts/build-citation-index.ts` | No — implemented in 4A |
| Retrieval API endpoint | `frontend/src/app/api/citation/route.ts` | No — implemented in 4D |

---

## Constraints

- `CITATION_INDEX.json` is always derived, never edited by hand
- Vault notes are always the source of truth; the index is always downstream
- No sync or two-way write between Knowledge System pages and vault
- `unified-data.ts` is not modified in Phase 4 (read-only UD anchor)
- The compiler must be idempotent: running it twice on the same vault produces identical output
- The compiler must complete in < 5 seconds for 37 notes; must scale to 200 notes without architectural change
