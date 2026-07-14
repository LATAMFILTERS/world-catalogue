# ELIMFILTERS® Knowledge Graph v2 — Implementation Roadmap

## Current baseline

Graphify has already produced a first repository graph containing code and semantic document extraction. That graph is useful for orientation, but it mixes current code, approved knowledge, historical reports and generated artifacts. Version 2 separates those layers and maps them into the canonical ELIMFILTERS ontology.

## Phase 1 — Stabilize the raw graph

### Objective

Create reproducible graph layers without entity collisions.

### Actions

1. Generate `GRAPH_REPORT.md` and community names:

```powershell
graphify cluster-only .
```

2. Preserve the current raw result as the baseline snapshot.
3. Create independent extraction scopes:

```text
graphify-layers/
├── code/
├── knowledge/
├── historical/
└── operational/
```

4. Extract current code separately from historical Markdown reports.
5. Merge only after each layer has its own namespace.
6. Exclude build outputs, package dependencies, caches and generated exports from future source scans.

### Exit criteria

- no current source node is dropped because of a historical report collision;
- code and knowledge layers can be rebuilt independently;
- raw Graphify outputs remain generated artifacts, not manually edited sources.

## Phase 2 — Normalize the Obsidian vault

### Objective

Make Obsidian the approved human-editable knowledge source.

### Actions

1. Inventory all vault notes by intended entity type.
2. Add required YAML frontmatter:

```yaml
entity_id:
entity_type:
canonical_name:
status:
aliases: []
source_priority: 2
review_date:
relationships: []
```

3. Create canonical folders:

```text
01-Brand/
02-Technologies/
03-Protection-Systems/
04-Products/
05-Industries/
06-Equipment/
07-Contamination/
08-Failure-Modes/
09-Standards/
10-Evidence/
11-Decisions/
12-Sources/
90-Research/
99-Deprecated/
```

4. Migrate existing wikilinks into typed relationships while preserving human navigation.
5. Mark incomplete or unverified notes as `research` or `inferred`.
6. Add `superseded_by` to deprecated notes.

### Exit criteria

- each approved concept has one canonical note;
- aliases do not create duplicate entities;
- every engineering claim links to evidence or is visibly marked unverified.

## Phase 3 — Build the normalization layer

### Objective

Map Graphify raw nodes, Obsidian entities and PostgreSQL records to stable canonical IDs.

### Deliverables

```text
knowledge-graph/
├── ontology/
│   └── ELIMFILTERS_ONTOLOGY_V2.yaml
├── mappings/
│   ├── technology-aliases.yaml
│   ├── industry-aliases.yaml
│   ├── standards-aliases.yaml
│   └── source-path-rules.yaml
├── scripts/
│   ├── normalize-graph.ts
│   ├── validate-ontology.ts
│   ├── import-obsidian.ts
│   ├── import-postgres.ts
│   └── build-unified-graph.ts
└── output/
    ├── canonical-entities.json
    ├── canonical-relationships.json
    ├── conflicts.json
    └── coverage-report.json
```

### Normalization behavior

- remove trademark characters from IDs while preserving display names;
- resolve aliases to canonical entities;
- namespace code nodes separately from business nodes;
- preserve Graphify confidence tags;
- reject relationships not declared in the ontology;
- create conflict records instead of silently choosing between competing claims.

### Exit criteria

- every curated entity has a stable ID;
- repeated extraction does not change IDs;
- collisions are reported, not silently dropped;
- ontology validation fails the build when invalid predicates are introduced.

## Phase 4 — PostgreSQL operational bridge

### Objective

Connect catalogue data without copying the transactional database into the graph.

### Actions

1. Define read-only extraction queries for:
   - SKUs;
   - product families;
   - technologies;
   - OEM cross references;
   - competitor cross references;
   - machine and vehicle applications;
   - manufacturers;
   - technical specifications.
2. Emit lightweight entity references using stable source keys.
3. Never infer inventory or fitment from semantic text.
4. Attach database provenance to each imported property.
5. Produce a conflict report when Obsidian or website data disagrees with PostgreSQL.

### Exit criteria

- SKU and fitment answers resolve to PostgreSQL provenance;
- the graph can identify which pages and APIs expose each operational entity;
- no graph rebuild writes to PostgreSQL.

## Phase 5 — Website and API coverage graph

### Objective

Measure whether approved knowledge is actually implemented.

### Actions

1. Map every public page to canonical entities.
2. Map API endpoints to returned entity types.
3. Link source files to pages and APIs.
4. Create coverage checks:
   - approved Obsidian entity missing from website;
   - website claim lacking approved evidence;
   - technology page missing an official industry;
   - SKU technology inconsistent with canonical product classification;
   - standard mentioned in copy but absent from evidence records.
5. Generate `coverage-report.json` and a Markdown executive summary.

### Exit criteria

Claude Code can answer:

- what exists in Obsidian but not on the website;
- what website claim lacks support;
- what code files must change when a technology definition changes;
- what database entities are exposed by each API.

## Phase 6 — Claude Code graph-first operation

### Objective

Make the graph the default orientation layer for work in the repository.

### Required behavior

Before broad repository searches, Claude Code must use:

```powershell
graphify query "<question>"
graphify explain "<entity>"
graphify path "<entity A>" "<entity B>"
```

Claude must then verify the answer against the source-of-truth hierarchy before modifying files.

### Standard task protocol

1. Identify canonical entities.
2. Query relevant graph layer.
3. Open authoritative sources.
4. State conflicts and assumptions.
5. Modify the authoritative source.
6. Run validation and build checks.
7. Update the affected graph layer.
8. Confirm that coverage and conflict reports remain acceptable.

### Exit criteria

- Claude does not treat historical implementation reports as current truth;
- technical answers distinguish validated evidence from inference;
- changes include impact analysis across knowledge, database, code and website.

## Phase 7 — Automation

### Objective

Keep the graph current with minimal manual work.

### Local workflow

```powershell
graphify . --update --backend claude-cli
graphify cluster-only .
```

### Target automated workflow

- code changes: rebuild code layer automatically after commit;
- Obsidian changes: rebuild knowledge layer on vault synchronization;
- PostgreSQL: scheduled read-only operational snapshot;
- nightly unified graph merge;
- nightly conflict and coverage reports;
- notification only when a new conflict, missing evidence or publishing gap appears.

## Immediate next commands

Run from the repository root after the current extraction has completed:

```powershell
graphify cluster-only .
graphify query "What are the central ELIMFILTERS technologies, protection systems, standards and source files?"
graphify query "Which historical reports collide with current source-code entities?"
graphify query "What knowledge appears in Markdown documentation but is not implemented in website pages?"
```

Do not commit generated graph files until their size, sensitivity and repository policy have been reviewed.

## Definition of done

Knowledge Graph v2 is complete when:

- Obsidian, PostgreSQL and code retain clear authority boundaries;
- all curated entities use stable canonical IDs;
- all technical claims are traceable to evidence;
- Graphify layers rebuild independently;
- entity collisions do not cause silent data loss;
- Claude Code performs graph-first impact analysis;
- conflicts and coverage gaps are generated automatically;
- a single operator can maintain the system without manually searching hundreds of files.
