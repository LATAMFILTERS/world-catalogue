# Kubota USA — Batch 008: expanded all-filter RTV and cross-family discovery
Date: 2026-10-17
Research only. No new product/approved cross/SKU write. Applies owner-approved method: genuine Kubota OEN -> Donaldson first pass -> if no verified Donaldson cross then verified Fleetguard -> OEN if no verified manufacturer cross; approval automatic only for certified application, valid existing identity, no SKU conflict.

## RTV-X kit 77700-05389 — core five positions
Source dealer diagram: https://www.messicks.com/catalogs/kubota/filter-kit-rtv6-rtvx1100c-rtvx1120d/77700-05389-rtv-series-filter-maintenance-kit/001000-filter-kit-rtv6
Engine oil HH150-32094; fuel 6A320-59930; oil suction/hydraulic HHK32-16774 (current dealer part, older kit HHK32-16770); HST HHK70-14073; outer air 1G319-11212 (new dealer part supersedes 1G319-11210).
Kit applicability further attested by https://www.colemanequip.com/parts/details/KubotaParts/Kubota-Filter-Maintenance-Kit-for-RTV-X-Series/77700-05389/ includes RTV-X1100CR/CW, RTV-X1120DR, RTV-X1130R/W, RTV-X1140R/W; qualification by year/serial remains needed.
Secondary/inner air K7591-82360 found in compatible third-party six-filter kits, not included among dealer's five listed kit parts. Keep separately.

## New important cross-family links (not deduced fitment)
Kubota 6A320-59930 dealer listing includes model lists for B, L, LX, M tractors, RTV-X and a claimed 128 machines: https://www.messicks.com/parts/kubota/6A320-59930 . This is an index for subsequent official Kubota IPL matching, not 128 certified fits. Prior Fleetguard FF42106 research remains relevant for all *verified* applications of same genuine filter.
Kubota official filter category: https://www.kubotausa.com/parts-service/kubota-parts-products/filters
Kubota 1G319-11212 dealer explicitly states supersedes 1G319-11210 and lists RTV-X, RTV-XG850, B3350, U27-4: https://www.messicks.com/parts/kubota/1G319-11212 . Therefore RTV-XG850 GAS should be researched under FRAM regional LD authority where classified LD; no automatic Donaldson diesel application inheritance.
Kubota existing filter kit group (model families for next batches): https://www.messicks.com/part/department/kubotafilterkits includes RTV legacy with serial-bound variants, BX/GR/ZD, B, L, LX, Z commercial mowers, etc.

## Cross evidence and issues
K7591-82360 -> Donaldson P535396 reseller-supported https://www.motointegrator.at/artikel/709651-sekundaerluftfilter-donaldson-p535396 ; competing site https://www.airfilter-crossreference.com/convert/KUBOTA/K7591-82360 lists only MANN/Hengst. Check direct manufacturer cross and dimensions. Existing GitHub collision documentation identifies EA15396 already used for DBA5396 and existing reviewed mapping EA15967 (Fleetguard AF25967): docs/audits/migration226-casos-por-SKU-20261008.md . No new EA15396.
6A320-59930 -> Fleetguard FF42106 supported by existing Fleetguard catalogue; official FF42106 product dimensions https://www.fleetguard.com/product/FF42106 . If OEM cross and fit certified and no valid Donaldson in first pass, preferred EF92106 (pending live collision). Not yet live-approved.
HHK70-14073 / HHK70-14070 -> Donaldson P550711 RESOLVER still needs evidence of role: Donaldson catalog calls lube filter; Kubota dealer HST assembly points hydraulic transmission. Do not allocate EL80711 or EH60711 before resolving category. Preserve leading zero.
HHK32-16774 -> no verifiable Donaldson or Fleetguard cross from current searches; do not invent.
Filter kit sidekick RTV-XG850 77700-09725 documented here https://www.messicks.com/parts/kubota/77700-09725 but kit individual contents not established; avoid diesel filter assumptions.
Third-party replacement kit source lists K7591-82360 as additional inner air element (not dealer kit): https://russopower.com/products/raptor-rtv-x1100c-kitr25-filter-kit

## Distinct filter role checklist
Engine oil, diesel fuel element, air outer, air inner/safety, hydraulic suction, HST transmission; separately inspect cabin air (cab-equipped only), fuel-water separator, coolant treatment and any other genuine filter only if Kubota IPL documents replaceable element. Never fill missing positions with made-up OEN.

## Next batch
Develop B/BX/LX and ZD mower OEN equipment-specific matrices by official IPL or primary source, reuse common verified genuine parts. Certify factory OEN and manufacturer specific direct cross prior to auto-approval. No database connection available in this mobile research session.

## Ponytail
Reused existing Isuzu/NPR closure, catalogue standard, SKU leading-zero rule and GitHub existing collision audit. Created one research document, no scripts/services/schedulers/tables.
