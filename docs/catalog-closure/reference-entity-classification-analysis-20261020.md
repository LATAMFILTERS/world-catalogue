# Manufacturer-aware classification analysis

The legacy conflict view matches normalized numbers across OEM and competitor arrays. Migration 274 explicitly preserves entries when the number belongs to different named manufacturers; the legacy view continues to count that overlap.

`lib/catalog-reference-classification-analysis.js` explains each overlap with the native reference parser. It distinguishes missing manufacturers, the same normalized manufacturer in both columns, and distinct names requiring entity and role evidence. It retains every manufacturer pair, including a same-manufacturer pair hidden alongside distinct names. It does not mutate input, suppress a conflict, assign manufacturer roles, infer equivalence, or certify a product.

Different names can be aliases of the same entity. The general-knowledge role map in migration 274 is insufficient to authorize exemptions. A future correction to the view needs independently reviewed evidence for the exact SKU, code and manufacturer pair, must expire when that pair changes, and must preserve same-manufacturer and unknown-manufacturer conflicts. This diagnostic is not that exemption mechanism and is not wired into production controls.

Validation: `node --test tests/catalog-reference-classification-analysis.test.js tests/catalog-alternate-integrity-v1.test.js` (9 passed). No database migration or production change is included.
