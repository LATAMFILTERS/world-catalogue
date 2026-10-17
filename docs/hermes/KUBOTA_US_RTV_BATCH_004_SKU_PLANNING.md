# Kubota USA — Batch 004: HD SKU identity planning
Date: 2026-10-17
Status: SKU_CANDIDATES_ONLY — NO PRODUCTS CREATED / NO PUBLISH
Governance: CLAUDE.md (current), CROSS_REFERENCE_CLASSIFICATION_STANDARD.md, HD prefix + Donaldson numeric last-4. Existing product lookup and SKU collision gates apply; never mint alternative digits.

| Kubota OEN research candidate | Donaldson research candidate | Filter family | Preferred ELIMFILTERS SKU | Publication gate |
|---|---|---|---|---|
| HH150-32430 | P502067 | Oil / EL8 / SYNTRAX | EL82067 | REVIEW_REQUIRED OEN and Donaldson direct cross; existing SKU present in data/dims.csv, identity reconciliation required |
| HH150-32094 | P550162 | Oil / EL8 / SYNTRAX | EL80162 | BLOCKED_CONFLICT with P502067 alternative, dimensional verification; existing SKU present in data/dims.csv |
| 1G319-11210 | P903837 | Air / EA1 / MACROCORE | EA13837 | REVIEW_REQUIRED Donaldson direct cross and exact model application, live collision check |
| HHK72-14080 | P550227 | Hydraulic / EH6 / NANOFORCE | EH60227 | REVIEW_REQUIRED Kubota position, Donaldson direct cross, live collision check |

Additional conflicting alternative for HH150-32094: P502067 would derive EL82067; DO NOT assign two Kubota original part identities to the same ELIMFILTERS published product from reseller-only data.

Existing repository evidence: data/dims.csv contains EL82067 (68x65 mm, M20x1.5) and EL80162 (81x86 mm, M20x1.5), distinct physical profiles. These are catalog-data occurrences, not proof of live DB publication, inventory, or interchangeability. GitHub code search for EA13837 and EH60227 found no matching indexed paths, which does not prove SKU availability. No live PostgreSQL query was performed.

Remaining original references HHK70-14073, HHK70-14070, HHK32-16770, K7591-82360 must NOT have an invented Donaldson or ELIMFILTERS code. Fuel 6A320-59930 → Fleetguard FF42106 remains a CANDIDATE and is blocked from canonical Fleetguard choice absent evidence that Donaldson has no applicable manufactured filter.

Workflow: verified Kubota OEN -> validated Donaldson manufactured cross -> existing SKU identity and collision check -> application binding approval -> publication. Fleetguard only when Donaldson nonmanufacture is documented; Kubota OEN fallback only if both unavailable. Neither fallback exercised in this batch.

Ponytail: reuse established HD SKU policy and Isuzu/NPR research closure. Research markdown only, no code, schema, scheduler, dependency, SKU, product, or DB changes.
