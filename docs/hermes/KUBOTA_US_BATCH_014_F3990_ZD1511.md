# Kubota USA — Batch 014, F3990 + ZD1511 diesel mowing equipment
Date 2026-10-17. Research only. OEM means original manufacturer part number.
Owner method: original Kubota OEM -> first-pass Donaldson -> verified Fleetguard if no verified Donaldson first-pass -> OEM if neither. Approved automatically only once cross, model/role, existing SKU/collisions validated. Four-digit suffix including leading zero.

## New equipment: F3990 front mower (candidate kit evidence)
Source: https://maintenancesolutionsunlimited.com/products/hero-maintenance-filter-kit-for-kubota-f3990-front-mount-mower
Primary air TA040-93230; secondary air TA040-93220; engine oil HH150-32094; inline fuel K3272-24210; fuel element 12581-43012; transmission HST HH660-36060. These are reseller kit claims; verify Kubota IPL and serial scope. Note dealer parts catalog https://www.messicks.com/catalogs/kubota/f3990 independently lists secondary air 1G994-11210, potentially supersession vs TA040-93220, not automatically same part.
New Donaldson cross candidates:
- TA040-93220 (secondary/safety air) -> P822858. Evidence cross catalog https://www.petroil.net/publish/IMG_Products/Descargas/2011-product-guide.pdf (Baldwin RS3705 replacement Kubota TA040-93220 and Donaldson P822858). Proposed EA12858, manufacturer cross/identity pending.
- TA040-93230 (primary air) conflicting Donaldson suggestions: P821575, P538494, P539578, P547477 from independent listings; do NOT assign base/SKU until specs reconcile. Sources https://www.enginegensetparts.com/auto-filters/air-filters/air-filter-ta040-93230-for-kubota.html , https://www.ruiqianfilter.com/air-filter/air-filter-element/ta040-93230-air-filter-rs30147-p538494.html , https://tractorcharts.com/kubota-b3200-air-filter/ .
- HH660-36060 (transmission/HST) -> Donaldson P550227 / Fleetguard HF35308 listed at https://www.filterfinder.nl/products/hh660-36060 . Manufacturer P550227 describes it as LUBE, creating classification tension with Kubota HST; do not automatically assign EH60227 or EL80227. Sources https://shop.donaldson.com/store/fr-us/product/P550227/20222 .
- HH150-32094 oil -> prior conflict P550162 vs P502067; pending.
- 12581-43012 fuel -> P550012, prior candidate EF90012 with explicit historical collision audit; reuse existing identity only after live reconciliation.
- K3272-24210 in-line fuel: no verified Donaldson or Fleetguard cross in this pass; pending.

## New equipment: ZD1511
Source: https://maintenancesolutionsunlimited.com/products/hero-maintenance-filter-kit-for-kubota-zd1511-zero-turn-mower
OEM primary air K3181-82240; secondary air K3181-82250; engine oil HH150-32094; HST HHK70-14070; hydraulic oil HHK32-16770; fuel 12581-43012. These overlap ZD1211 and prior RTV research, but require variant/serial check.
- K3181-82240 -> Donaldson P778979, alternative Fleetguard AF26387, proposed EA18979. Direct reseller product https://crossfilters.com/products/p778979-donaldson-air-filter-primary-radialseal-kubota-k3181-82240 ; dimensional product 115.9mm OD x227.1mm length. Existing EA18979 data/dims.csv entry.
- K3181-82250 -> Donaldson P780018, Fleetguard AF26388, proposed EA10018. https://www.finditparts.com/products/20399284/wix-filters-49968 ; https://crossfilters.com/products/p780018-donaldson-air-filter-safety-kubota-k3181-82250 . Existing EA10018 data/dims.csv.
- HHK70-14070 -> P550711 aftermarket candidate; lube vs HST system issue unresolved.
- HHK32-16770 -> prior Kubota dealer supersession HHK32-16774; no verified Donaldson/Fleetguard cross.

## Additional checks
Kubota official filters: https://www.kubotausa.com/parts-service/kubota-parts-products/filters
Kubota F3990 service manual confirms its several filter servicing positions: https://www.acmetools.com/on/demandware.static/-/Sites-acme-sf-catalog-en/en_US/v1766662208450/assets/catalog/product/Z0000000000000006146_2.pdf?dl=1&rlkey=s0zbdswr77pwmrum26i1ufhht&st=djqqb8g5

## SKU work
EA12858 is newly calculated candidate only (P822858 last digits 2858). EA18979 and EA10018 are previously established candidates, do not duplicate. No new accepted/created SKU, db rows or deploy. Need direct original OEM and manufacturer cross, exact position, live SKU collision review before auto-approval.

Ponytail: reused NPR/Isuzu closure and existing sku/dimension records; new artifact is research document only, no parallel systems.
