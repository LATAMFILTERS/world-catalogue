# Knowledge Graph v2 — Phase 3: Product Intelligence Graph

## Objective

Transform each ELIMFILTERS SKU from a catalogue row into a governed product-intelligence entity connected to product family, technology, protection system, OEM references, competitor references, equipment applications, industries, contaminants, failure modes, standards and evidence.

Phase 3 does not copy the production database into Markdown as a second uncontrolled database. PostgreSQL remains the operational source of truth. The knowledge layer stores governed identity, semantic relationships, provenance and review state.

## Authority model

1. PostgreSQL `elimfilters_catalog` — operational product attributes and current cross-reference data.
2. `knowledge/entities/` — approved semantic entities and governed relationships.
3. Website source — publication implementation.
4. Graphify output — generated navigation and inference layer.
5. Historical reports — context only.

## SKU identity

Canonical IDs use the normalized ELIMFILTERS part number:

```text
sku:el89009
```

The displayed SKU preserves the official form:

```text
EL89009
```

Normalization removes spaces and punctuation and lowercases the result. A normalized SKU must remain unique.

## Product-intelligence relationship model

A SKU may use these governed predicates:

- `belongs_to_product_family`
- `implements_technology`
- `protects_system`
- `cross_references_oem`
- `cross_references_competitor`
- `fits_equipment`
- `used_in_industry`
- `controls_contaminant`
- `mitigates_failure_mode`
- `evaluated_by_standard`
- `supported_by_evidence`
- `published_at`
- `sourced_from`

A relationship must carry provenance and confidence. Imported catalogue relationships begin as `under_review` unless the source is explicitly authoritative and the mapping is deterministic.

## Required SKU fields

- canonical ID
- official SKU
- name or product description
- product family
- lifecycle status
- operational source
- last synchronization date
- review status
- evidence status
- field-level provenance

## Data-quality rules

- Never invent an OEM or competitor equivalence.
- Never infer equipment fitment from a code similarity.
- Never treat a competitor cross-reference as proof of exact technical equivalence.
- Never mark imported fitment as approved without a traceable source.
- Never duplicate pricing, customer data or confidential commercial terms in the knowledge graph.
- Preserve raw values and normalized values separately.
- Record unresolved mappings instead of silently dropping them.

## Pipeline

```text
PostgreSQL / catalogue JSON
        ↓
Product Intelligence Exporter
        ↓
knowledge/generated/product-intelligence/
        ↓
Validation + unresolved mapping report
        ↓
Human/engineering review
        ↓
knowledge/entities/skus/ (approved subset only)
        ↓
Graphify + Claude Code + website/Part Search
```

## Generated versus canonical records

`knowledge/generated/product-intelligence/` is reproducible and non-authoritative. It may be deleted and rebuilt.

`knowledge/entities/skus/` contains only reviewed canonical SKU entities. Promotion must preserve the original source identifiers and synchronization metadata.

## Completion criteria

Phase 3 is complete when:

1. The SKU schema and template exist.
2. The exporter can read the repository catalogue and optionally PostgreSQL.
3. Generated entities preserve provenance and unknown mappings.
4. The validator rejects missing identity, invalid relationships and false approval states.
5. CI validates the model on every relevant change.
6. A coverage report quantifies mapped and unresolved technologies, systems, families, OEM references, competitor references and applications.
