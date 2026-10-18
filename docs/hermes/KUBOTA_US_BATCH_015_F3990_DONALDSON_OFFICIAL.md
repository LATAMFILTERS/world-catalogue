# Kubota USA — Batch 015 F-Series and official Donaldson expansion
Date: 2026-10-17. Research only. OEM terminology. No live SKU creation or database mutation.

## New primary manufacturer crosses (Donaldson March 2026)
Official bulletin: https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/emea/eafm-new-products/2026/New-Product-Releases-March-2026.pdf
- Kubota OEM 6A100-82632 / 6C060-99410 -> Donaldson P500260, AIR PRIMARY, Fleetguard AF25745 also cross-listed. Kubota tractor application indicated, exact model-year and serial fitment still to confirm. Candidate SKU EA10260 (EA1 + 0260).
- Kubota OEM 32721-58242 -> Donaldson P903550, AIR SAFETY, Fleetguard AF25151 also cross-listed. Candidate SKU EA13550 (EA1 + 3550).
These manufacturer-published product crosses are stronger evidence than prior reseller claims. Still apply Kubota genuine model scope, live product identity and collision before operational approval. GitHub code-search returned no indexed files for these exact candidate SKU or Donaldson numbers; does NOT prove they're available in live DB.

## F3990 primary air ambiguity
Kubota OEM TA040-93230 as listed in prior F3990 dealer kit. Third-party data gives incompatible Donaldson suggestions P821575, P547477, P538494, P539578. Sources:
https://www.airfilter-crossreference.com/convert/KUBOTA/TA04093230
https://www.finditparts.com/products/7492395/kubota-ta04093230
https://www.enginegensetparts.com/auto-filters/air-filters/air-filter-ta040-93230-for-kubota.html
https://www.ruiqianfilter.com/air-filter/air-filter-element/ta040-93230-air-filter-rs30147-p538494.html
Fleetguard AF25551 is independently listed on Kubota TA04093230 product page; cannot shortcut Donaldson-first conflict by asserting Donaldson absence. No selected base SKU until filter dimensions and OEM assembly context resolved.

## F3990/ZD inline fuel verified as genuine Kubota part
Kubota OEM K3272-24210 (assembly, fuel filter) confirmed at genuine-part dealers, used on F3990, F2690, ZD1211 and ZD1511, plus other equipment where model/serial qualifies:
https://www.messicks.com/parts/kubota/K3272-24210
https://www.colemanequip.com/parts/details/KubotaParts/Fuel-Filter--In-Line-/K3272-24210/
https://www.greatplainskubota.com/shop-parts/filters/ASSY-FILTER-FUE
No manufacturer-verified Donaldson or Fleetguard replacement obtained in this pass. Do not invent a cross or mint OEM-fallback SKU without classification and identity governance.

## Batch outcomes
Two NEW manufacturer-backed Donaldson/OEM cross candidates; two candidate EA1 derived identifiers with four digits preserved. One genuine fuel OEM whose cross remains open, and one primary-air cross with multi-result conflict. No product or SKU database writes.

Reused NPR/Isuzu gate sequence, canonical HD prefixes, prior Kubota research docs, repository collision-aware workflow. Created only this evidence document; no scripts, schedulers, workers, databases or dependencies.
