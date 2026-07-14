# Phase 5 — OEM Knowledge Graph

## Objective

Convert OEM and competitor references into governed entities and evidence-bearing assertions without treating every shared code as a technically validated equivalent.

## Canonical entity types

- `OEMManufacturer` — equipment, engine or component manufacturer that owns an OEM code namespace.
- `OEMCode` — normalized manufacturer part number.
- `CompetitorCode` — normalized aftermarket manufacturer part number.
- `CrossReferenceAssertion` — a sourced statement connecting a SKU to an OEM or competitor code.

## Assertion levels

1. `observed` — the code appeared in an imported source.
2. `commercial_match` — a catalogue or seller presents the codes as cross references.
3. `application_match` — both codes are tied to the same reviewed application.
4. `validated_equivalent` — dimensions, function, performance requirements and application have been technically reviewed.
5. `rejected` — evidence shows that the proposed relationship is unsafe or incorrect.

Only `validated_equivalent` may be exposed as an approved technical equivalence.

## Identity rules

- Manufacturer ID: `oem-manufacturer:<slug>`.
- OEM code ID: `oem-code:<manufacturer-slug>-<normalized-code>`.
- Competitor code ID: `competitor-code:<brand-slug>-<normalized-code>`.
- Assertion ID: `crossref:<source-sku>-<target-id-slug>`.
- Preserve the source spelling separately from the normalized code.
- Never remove punctuation from the stored display value; normalization is only for identity and matching.

## Generated layer

Bulk output is written under `knowledge/generated/oem-graph/` and is not canonical. Generated assertions remain `under_review` and are published as GitHub workflow artifacts.

## Promotion rule

An assertion may be promoted into `knowledge/entities/cross-references/` only when:

- source SKU exists;
- target code entity exists;
- source is traceable;
- assertion level is explicit;
- validated equivalence includes an evidence record;
- no unresolved conflict exists for the same code pair.

## Product Intelligence integration

The Product Intelligence Graph points to assertion IDs. SKU notes must not duplicate ungoverned lists of codes once an assertion entity exists.
