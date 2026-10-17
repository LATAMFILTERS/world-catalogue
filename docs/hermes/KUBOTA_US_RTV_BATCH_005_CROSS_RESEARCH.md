# Kubota USA — Batch 005: Donaldson-first remaining cross research
Date: 2026-10-17
Scope: evidence-only, no catalogue database or SKU mutation

## Owner-approved SKU planning — prior batch 004
Owner approved the four previously *defined SKU proposals* for planning/identifier reservation: EL82067 (Donaldson P502067), EL80162 (P550162), EA13837 (P903837), EH60227 (P550227). Record status OWNER_APPROVED_FOR_PLANNING, not fitment-certified, collision-cleared, or published. EL80162 retains conflict gate. Do not claim insertion or production availability. This approval does not override mandatory validation in CLAUDE.md.

## New Donaldson candidates
| Kubota OEN | Donaldson candidate | Status / evidence |
|---|---|---|
| HHK70-14073 | P550711 | Cross listed by FilterFinder and other distributor catalogues; Donaldson manufacturer product P550711 exists; OEM-level Donaldson cross still to verify. Sources https://www.filterfinderonline.com/products/hhk70-14073 and https://www.intercars24.ee/products/933290-hydraulic-filter-p550711 and https://shop.donaldson.com/store/es-es/product/P550711/20498 |
| HHK70-14070 | P550711 | Cross listed by cross-reference catalogue, additional dealer. https://www.intercars24.ee/products/933290-hydraulic-filter-p550711 and https://readyparts4u.com/products/hydraulic-oil-filter-hhk70-14070-fit-for-kubota-zd1011-zd1211-zd1021 |
| HHK32-16770 | not verified | Messick's identifies Kubota replacement HHK32-16774; distinct genuine part update needs scope check. https://www.messicks.com/parts/kubota/hhk32-16770 |
| K7591-82360 | not verified | No source-backed Donaldson/Fleetguard match; secondary/safety air element needs exact Kubota housing/component |
| 6A320-59930 | no Donaldson evidence | FF42106 is reseller/manufacturer-third-party Fleetguard candidate; no proof of Donaldson nonmanufacture. https://www.fuerdunfiltration.com/6a320-59930-p05728p1.html |

## Classification BLOCKER P550711
Donaldson official storefront identifies P550711 as LUBE full-flow spin-on, while some catalogues categorize it as hydraulic in Kubota RTV. Manufacturer physical product and Kubota assembly position must be reconciled BEFORE prefix/SKU generation: EL8 vs EH6 is not resolved. Do not mint either SKU automatically. Both OEMs appear to share P550711 as aftermarket cross, but validate genuine part supplant and application scope.

## Source strictness
Manufacturer product page alone proves Donaldson P550711 exists, NOT that the Kubota OEN cross is manufacturer-certified. Reseller OEN cross is evidence to investigate only; mark REVIEW_REQUIRED. Verify exact spec, application, serial/year and direct original/manufacturer evidence.

## Next query
Find Kubota HHK32-16774 exact manufacturer Donaldson/Fleetguard cross, Kubota K7591-82360 safety air element cross, direct Donaldson OEN entries for P550711, and fuel 6A320-59930. No OEN fallback without proof of Donaldson and Fleetguard non-manufacture.

## Ponytail
Reuses existing NPR/Isuzu research gating and HD identity policy; no code, scripts, jobs, duplicate product tables, or SKU writes.
