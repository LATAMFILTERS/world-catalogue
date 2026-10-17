# Kubota USA — Batch 017: LX/L cross-reference first pass (2026-10-17)

Evidence-only, no canonical product insert, no approval of contradictory crosses. OEM terminology.

| Kubota OEM | Donaldson first-pass candidates | Fleetguard candidate | Proposed ELIMFILTERS SKU | Disposition |
|---|---|---|---|---|
| 1G311-43380, diesel fuel cartridge | P502640 | FF5468 | EF92640 if Donaldson direct verified; otherwise EF95468 Fleetguard fallback if its match passes | CROSS_CANDIDATE; direct manufacturer proof pending |
| HH164-32430, engine oil | P550399, but other Donaldson options P551042/P551268 listed | LF3706 | EL80399 only if P550399 validated | BLOCKED_CONFLICT |
| TC620-93230, primary air | P821575 / P831424 (plus other reseller product families) | AF25551 | no chosen SKU | BLOCKED_CONFLICT |
| HH1J1-43172, fuel | none certified | none certified | none | OPEN |
| TC422-82620, hydraulic | none certified | none certified | none | OPEN |
| HH670-37712, hydraulic | none certified | none certified | none | OPEN |
| HH660-36060, HST | none certified | none certified | none | OPEN |

Sources:
1G311-43380 -> P502640/FF5468 reseller https://www.parts-machining.com/kubota-1g311-43380-fuel-filter-1g31143380-replacement_p4596.html ; Fleetguard specific https://www.filterfinderonline.com/products/1g311-43380 and https://motormaq.cl/producto/filtro-combustible-cartucho-1g311-43380-kubota/ .
HH164-32430 -> P550399/LF3706 https://www.motorman.cl/repuestos/producto/filtro-aceite-motor-kubota-hh164-32430-p550939-3974896-1641432430/ ; conflicting listings https://www.oilfilter-crossreference.com/convert/KUBOTA/HH164-32430 .
TC620-93230 competing P821575/P831424 and AF25551 https://whd-parts.com/products/air-filter-shop-pack-102-305-20-for-kubota-tc620-93230 .
Hydraulic model-group replacement candidates, not primary OEM proof: https://tractorpartscentral.com/parts/hydraulic-filter-cross-reference-chart/?lang=en claims HH670-37712 -> HH6C0-37710; HH660-36060 -> HH6F0-36060. Verify against factory parts diagram.
Prior original Kubota equipment kits: docs/hermes/KUBOTA_US_BATCH_016_LX_L_TRACTORS.md .

GitHub indexed search did not find EF92640 or EL80399/P502640/P550399 in accessible repository results. This does NOT prove live SKU vacancy. Verify in ELIMSERVER after access is available.

Owner method: Kubota genuine OEM -> Donaldson verified in first pass, otherwise verified Fleetguard, otherwise OEM; manufacturer/documentation evidence and exact role fitment before auto-approval; suffix FOUR digits preserve initial zero. If actual Fleetguard FF5468 chosen, prefix EF9 + 5468 = EF95468. Avoid treating candidate code as product created.

Ponytail: reused existing research branch, NPR/Isuzu methodology and HD SKU governance. Only a research document created; no scripts, product changes, database, scheduler or service.
