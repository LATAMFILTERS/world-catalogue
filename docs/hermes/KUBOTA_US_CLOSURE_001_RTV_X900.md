# Kubota USA — sequential closure 001: RTV-X900
Date: 2026-10-17
Status: PARTIAL — NOT CERTIFIED COMPLETE.
Decision: stop expanding model universe until existing partial equipment is closed one-by-one.

## Closure policy
CLOSE model only when Kubota OEM model, engine, year, applicable serial range and every replaceable filter position are identified with Kubota primary parts evidence; a certified Donaldson (first pass) or Fleetguard (fallback) cross or validated OEM fallback exists per position; SKU identity + prefix + four digits (including zeroes) checked, duplicates and historic collisions cleared. Existing owner authorizes automatic approval of technically certified fitment/cross, NOT assumed evidence. Keep independently tracked: RESEARCH_COMPLETE, TECHNICALLY_CERTIFIED, DB_INTEGRATED, PUBLISHED.

## RTV-X900W tracked positions
| Position | Kubota OEM candidate(s) | Cross candidate | Gate |
|---|---|---|---|
| Engine oil | HH150-32430 | Donaldson P502067 / EL82067 | Original OEM IPL for exact RTV-X900 serial, direct cross and DB identity |
| Fuel | 6A320-59930; reseller alternate 6A320-58862 | Fleetguard FF42106 / EF92106 | Distinguish distinct OEM numbers and applicability; validate manufacturer cross |
| Air primary | 1G319-11210, later reported 1G319-11212 | Donaldson P903837 / EA13837 | Verify true Kubota supersession and direct Donaldson cross |
| Air safety | K7591-82360 | Donaldson P535396 candidate | Historical EA15396 collision already documented; do not duplicate |
| Transmission | HHK70-14073 vs HHK70-14070 | Donaldson P550711 candidate | Resolve exact hydraulic vs lube positioning and serial restrictions; do not use incorrect prefix |
| HST / hydraulic suction | HHK32-16770, HHK72-14080 | NONE VERIFIED | Resolve each distinct factory replacement position and manufacturer cross; HHK32-16774 dealership supersession |

Kubota dealer's RTV-X900W maintenance chart lists engine oil, engine oil filter, transmission filter, HST filter, fuel filter and inner air separately. Source: https://www.messicks.com/catalogs/kubota/rtv-x900w ; its kit 77700-08715: https://messicks.com/parts/kubota/77700-08715 . Kit 77700-01819 is LEGACY RTV900 only, not RTV-X900: https://www.messicks.com/parts/kubota/77700-01819 .
Historical Kubota research source notes: KUBOTA_US_RTV_BATCH_001.md, _002.md, _003_CROSS_REFERENCES.md, _007_CROSS_EVIDENCE.md.

## Next execution: close RTV-X900, not new families
(1) Extract OEM filter identification from Kubota official illustrated parts lookup for precise model/serial.
(2) Reconcile separate transmission and HST/suction positions; avoid using dealer kit as sole proof.
(3) Check official Donaldson OEN match first, Fleetguard if unmatched on first pass. For still-no-cross, Kubota OEM candidate base only after technical/identity checks.
(4) Read-only compare existing ELIMFILTERS SKU and collisions via primary Lenovo PostgreSQL when available. GitHub dimensional records are NOT live database evidence.
(5) If and only if all positions resolved, record TECHNICALLY_CERTIFIED. Do not mark COMPLETE or claim publication before DB integration.

## Following queue
RTV-X1100C, RTV-X1120D, RTV-X1140, BX23S, ZD1211, ZD1511, F3990, LX2610, L3301/L3901, M6060/M7060, M5-111, KX040-4, U35-4, SVL75-2, KX057-4, U55-4, SVL97-2, then other incomplete models. Only proceed to next after documenting terminal status of prior model (CLOSED or BLOCKED with exact external evidence dependency).

Ponytail: reused existing NPR/Isuzu closure gates, all existing Kubota batches and catalogue governance. One Markdown closure matrix added, no new pipeline, SKU, table, scheduler, worker, deployment or database mutation.
