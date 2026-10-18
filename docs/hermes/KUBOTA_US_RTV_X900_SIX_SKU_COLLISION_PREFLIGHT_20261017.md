# Kubota RTV-X900 — six candidate SKU collision preflight
Date: 2026-10-17
Scope: six *proposed* SKUs. GitHub indexed default-branch code search, not complete repository scan and NOT PostgreSQL validation.

| Position | OEM Kubota | Proposed SKU | GitHub indexed findings | Decision |
|---|---|---|---|---|
| Engine oil | HH150-32430 | EL82067 | present in data/dims.csv | existing reference, identity check required |
| Fuel | 6A320-59930 | EF92106 | no matching indexed result | no proven collision; NOT certified vacant |
| Air outer | 1G319-11210 | EA13837 | no matching indexed result | no proven collision; NOT certified vacant |
| Air safety | K7591-82360 | EA15967 | historical audit records present | reviewed fallback with earlier EA15396 collision; identity check mandatory |
| Transmission HST | HHK70-14073 | EH64073 | no matching indexed result | conditional OEM-base SKU; Donaldson technical cross unresolved |
| Hydraulic suction | HHK32-16774 | EH66774 | no matching indexed result | conditional OEM-base SKU; no certified competitor equivalence |

GitHub search found no indexed exact references to EH66774 or EH64073, but this cannot certify non-collision or SKU availability. Existing historical EA15967 audit must be checked before duplicate or identity reuse. Codes follow category prefix + last four digits preserving leading zeros; Kubota hydraulic OEM endings 4073 and 6774.

Final acceptance remains BLOCKED on:
1. Exact SKU/normalized-identity read-only queries in canonical PostgreSQL catalogo_elimfilters, including aliases and historical product identity.
2. Original OEM model + engine + serial-scoped fitment and filter-position validation.
3. Authorized world-catalogue insertion/certification path. No CRM canonical write.
Remote ELIMSERVER access was previously blocked by Desktop Commander monthly limit; do not claim live database access.

HERMES remains canonical technical authority; Catalogue Intelligence is commercial completeness reviewer. This is a bounded review and does not re-open the HIFI/Donaldson debate. No new script, database table, service, workers or product inserted.
