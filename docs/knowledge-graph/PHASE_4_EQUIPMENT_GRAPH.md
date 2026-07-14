# Knowledge Graph v2 — Phase 4: Equipment Graph

## Objective

Normalize real equipment, engine and vehicle application data and connect it to reviewed SKU entities without inventing compatibility.

## Canonical entity types

- `Manufacturer` — normalized equipment, engine or vehicle manufacturer.
- `Equipment` — off-highway, industrial, marine, agricultural, power-generation or rail equipment model.
- `Engine` — engine family or model when independently identifiable.
- `Vehicle` — on-road vehicle platform with optional year range.

## Identity rules

Canonical IDs use normalized values:

```text
manufacturer:caterpillar
equipment:caterpillar-980m
engine:cummins-isx15
vehicle:freightliner-cascadia-2018-2024
```

A change in punctuation, capitalization or spacing does not create a new entity. Different model designations remain separate until evidence proves they are aliases.

## Source authority

1. Production PostgreSQL application arrays.
2. Manufacturer documentation or validated field evidence.
3. Reviewed scraper output.
4. Working notes and generated reports.

Generated entities always start as `under_review`. They are not proof of fitment by themselves.

## Core relationships

```text
SKU --fits_equipment--> Equipment
SKU --fits_engine--> Engine
SKU --fits_vehicle--> Vehicle
Equipment --manufactured_by--> Manufacturer
Engine --manufactured_by--> Manufacturer
Vehicle --manufactured_by--> Manufacturer
Equipment --uses_engine--> Engine
Equipment --operates_in--> Industry
Vehicle --operates_in--> Industry
```

## Ambiguity policy

Application strings that cannot be parsed confidently are retained verbatim in the unresolved report. They must not be silently converted into a canonical compatibility.

## Scale policy

Generated equipment entities are written under `knowledge/generated/equipment-graph/` and distributed as workflow artifacts. Only reviewed entities are promoted into `knowledge/entities/`.

## Definition of done

Phase 4 is complete when:

- canonical templates exist;
- the validator recognizes the four entity types;
- an exporter reads real catalogue application fields;
- duplicate and alias candidates are reported;
- generated output is excluded from source control;
- GitHub Actions publishes a review artifact;
- promotion to canonical knowledge is evidence-gated.
