# ELIMFILTERS® Knowledge Graph Architecture v2

## Purpose

Build a persistent engineering and business knowledge system in which Claude Code can reason across ELIMFILTERS® technologies, products, industries, standards, contamination mechanisms, equipment, source documents, website implementation and operational data without treating the repository as a flat collection of files.

The graph is not the source of truth. It is the navigation and reasoning layer that connects the sources of truth.

## Source-of-truth hierarchy

1. **PostgreSQL** — operational catalogue, SKUs, cross references, specifications and application records.
2. **Obsidian vault** — approved engineering knowledge, decisions, research notes, standards interpretation and business logic.
3. **Repository source code** — implemented behavior of the website, APIs, search engine and data pipelines.
4. **Approved source documents** — standards, laboratory reports, field-test evidence and manufacturer documentation.
5. **Graphify output** — derived relationship graph used for discovery, context and impact analysis.
6. **Historical reports** — evidence of prior work, never authoritative over current source files.

When two sources conflict, Claude Code must report the conflict and defer to the highest-ranked current source.

## Knowledge layers

### Layer A — Business ontology

Represents the industrial meaning of ELIMFILTERS®:

- Brand
- Technology
- ProtectionSystem
- ProductFamily
- Product
- SKU
- Industry
- EquipmentClass
- Machine
- Manufacturer
- Engine
- Component
- Contaminant
- FailureMode
- Standard
- TestMethod
- EngineeringClaim
- Evidence
- FieldValidation
- LaboratoryValidation
- SourceDocument
- Customer
- Distributor
- Market
- Offer
- InventoryRecord

### Layer B — Digital implementation

Represents how business knowledge is implemented:

- WebPage
- APIEndpoint
- DatabaseTable
- DatabaseColumn
- SourceFile
- Function
- ComponentModule
- Script
- BuildProcess
- DataExport
- TranslationKey

### Layer C — Governance

Represents reliability and provenance:

- Decision
- Assumption
- Constraint
- Risk
- Conflict
- Approval
- Version
- Owner
- ReviewDate

## Canonical entity identifiers

Every curated entity must use a stable identifier independent of file name or display text.

Format:

```text
<ENTITY_TYPE>:<CANONICAL_SLUG>
```

Examples:

```text
TECHNOLOGY:macrocore
SYSTEM:air-intake-airflow
INDUSTRY:mining
STANDARD:iso-5011
SKU:EA50090
CONTAMINANT:airborne-silica-dust
FAILURE_MODE:abrasive-cylinder-wear
SOURCE:iso-5011-standard
```

Rules:

- lowercase slugs except official SKU values;
- no trademark symbols in identifiers;
- aliases are properties, never separate canonical entities;
- historical names point to the current canonical entity through `ALIAS_OF`;
- file paths must never be used as business entity IDs.

## Core relationships

### Engineering relationships

- `TECHNOLOGY_PROTECTS_SYSTEM`
- `TECHNOLOGY_USED_IN_INDUSTRY`
- `TECHNOLOGY_MITIGATES_CONTAMINANT`
- `TECHNOLOGY_PREVENTS_FAILURE_MODE`
- `TECHNOLOGY_VALIDATED_BY_STANDARD`
- `PRODUCT_USES_TECHNOLOGY`
- `SKU_INSTANCE_OF_PRODUCT`
- `PRODUCT_PROTECTS_COMPONENT`
- `CONTAMINANT_CAUSES_FAILURE_MODE`
- `FAILURE_MODE_DAMAGES_COMPONENT`
- `STANDARD_DEFINES_TEST_METHOD`
- `CLAIM_SUPPORTED_BY_EVIDENCE`
- `EVIDENCE_DERIVED_FROM_SOURCE`
- `FIELD_VALIDATION_SUPPORTS_CLAIM`
- `LAB_VALIDATION_SUPPORTS_CLAIM`

### Application relationships

- `MACHINE_USES_ENGINE`
- `MACHINE_OPERATES_IN_INDUSTRY`
- `SKU_APPLIES_TO_MACHINE`
- `SKU_CROSS_REFERENCES_PART`
- `MANUFACTURER_PRODUCES_MACHINE`
- `MANUFACTURER_OWNS_PART_NUMBER`
- `INDUSTRY_EXPOSES_ASSET_TO_CONTAMINANT`

### Implementation relationships

- `WEBPAGE_DESCRIBES_ENTITY`
- `API_RETURNS_ENTITY`
- `SOURCE_FILE_IMPLEMENTS_WEBPAGE`
- `SOURCE_FILE_IMPLEMENTS_API`
- `DATABASE_TABLE_STORES_ENTITY`
- `DATABASE_COLUMN_STORES_PROPERTY`
- `SCRIPT_GENERATES_DATA_EXPORT`
- `DATA_EXPORT_FEEDS_WEBPAGE`
- `OBSIDIAN_NOTE_DEFINES_ENTITY`

### Governance relationships

- `DECISION_GOVERNS_ENTITY`
- `CONFLICTS_WITH`
- `SUPERSEDES`
- `APPROVED_BY`
- `REQUIRES_REVIEW`
- `DERIVED_FROM`
- `INFERRED_FROM`

## Confidence and provenance

Every curated relationship must carry:

```yaml
confidence: 0.00-1.00
status: extracted | inferred | validated | disputed | deprecated
source_ids: []
reviewed_by: null
reviewed_at: null
```

Rules:

- `extracted` means explicitly stated in an approved source;
- `inferred` means logically derived and not yet independently verified;
- `validated` requires field, laboratory or authoritative standards evidence;
- no marketing claim may be marked `validated` solely from internal copy;
- all AI-created relationships begin as `inferred`;
- Claude Code must distinguish extracted facts from inference in every technical answer.

## Obsidian integration

Obsidian remains the human-editable engineering knowledge source.

Each canonical note must include YAML frontmatter:

```yaml
---
entity_id: TECHNOLOGY:macrocore
entity_type: Technology
canonical_name: MACROCORE™
status: approved
aliases:
  - Macrocore
  - MACROCORE
source_priority: 2
review_date: 2026-12-31
relationships:
  - type: TECHNOLOGY_PROTECTS_SYSTEM
    target: SYSTEM:air-intake-airflow
    confidence: 1.0
    status: validated
---
```

Obsidian rules:

- one canonical entity per note;
- `[[wikilinks]]` support navigation but do not replace typed relationships;
- research notes may link to canonical entities but must use `status: research`;
- obsolete notes use `status: deprecated` and `superseded_by`;
- generated files must never overwrite approved human notes.

## PostgreSQL integration

PostgreSQL supplies high-volume operational entities and relationships:

- SKUs;
- dimensions and specifications;
- OEM and competitor cross references;
- machine and vehicle applications;
- product classifications;
- inventory and commercial records where applicable.

The graph must reference database records through stable keys, not duplicate the full transactional database.

Example:

```yaml
entity_id: SKU:EA50090
source_system: postgres
source_table: products
source_key: EA50090
```

## Graphify role

Graphify provides:

- AST-derived code relationships;
- semantic extraction from Markdown, PDFs and images;
- cross-file path discovery;
- community detection;
- impact analysis for code and documentation changes.

Graphify must not decide the canonical business ontology. Its raw nodes are mapped into the ELIMFILTERS ontology through a curated normalization layer.

Required separation:

1. **Code graph** — source code and implementation.
2. **Knowledge graph** — Obsidian and approved technical documentation.
3. **Historical graph** — implementation reports and deprecated plans.
4. **Operational graph** — PostgreSQL entity references.
5. **Unified graph** — merged graph with namespaces preserved.

This separation prevents historical reports from colliding with current code entities.

## Claude Code operating policy

For architecture, product, engineering or impact questions Claude Code must:

1. query Graphify first;
2. identify the relevant canonical entities;
3. verify claims against source-of-truth hierarchy;
4. label inference explicitly;
5. report unresolved conflicts instead of guessing;
6. modify the authoritative source, never Graphify output directly;
7. rebuild only the affected graph layer;
8. validate that generated website and API behavior remain consistent.

## Inference rules

Approved automatic inference examples:

```text
SKU_INSTANCE_OF_PRODUCT + PRODUCT_USES_TECHNOLOGY
→ SKU_USES_TECHNOLOGY
```

```text
TECHNOLOGY_MITIGATES_CONTAMINANT + CONTAMINANT_CAUSES_FAILURE_MODE
→ TECHNOLOGY_REDUCES_RISK_OF_FAILURE_MODE
```

```text
SKU_APPLIES_TO_MACHINE + MACHINE_OPERATES_IN_INDUSTRY
→ SKU_USED_IN_INDUSTRY
```

```text
CLAIM_SUPPORTED_BY_EVIDENCE + EVIDENCE_DERIVED_FROM_SOURCE
→ CLAIM_TRACEABLE_TO_SOURCE
```

Inference restrictions:

- no inferred cross reference may be published as confirmed fitment;
- no inferred field performance claim may be marked validated;
- no inferred standards compliance without explicit test evidence;
- inferred commercial availability must never become inventory truth.

## Quality gates

A canonical entity is publishable when:

- it has a stable `entity_id`;
- its entity type is approved;
- its authoritative source is identified;
- required properties are complete;
- relationships use approved predicates;
- claims have provenance;
- conflicts are resolved or visible;
- status is `approved` or `validated`.

## Success criteria

The system is functioning as intended when Claude Code can reliably answer:

- what protects a specific component and why;
- which standards support a technology claim;
- which SKUs implement a technology;
- which industries and machines use those SKUs;
- where the information is implemented on the website and API;
- what changed when a source note, database record or code file changes;
- what information exists in Obsidian but is absent from the website;
- what published content lacks approved evidence.
