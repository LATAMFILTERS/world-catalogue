# Kubota USA Batch 022 — KX057-4, U55-4, SVL97-2
Date 2026-10-17. Research only. No product or SKU insert.

| Kubota OEM | Donaldson cross candidate | Fleetguard | Derived SKU | Evidence level |
|---|---|---|---|---|
| R1411-64930 | P550576 | HF28836 | EH60576 | Third-party exact-OEM cross; Donaldson official page confirms hydraulic cartridge category |
| RD452-42270 | P822768 | AF25553 | EA12768 | Vendor direct OEM cross; do not conflate other air housing assembly numbers |
| RD452-42280 | P822769 | AF25554 or AF25519 (conflicting sources) | EA12769 | OEM cross from aftermarket sources, Fleetguard alternative not resolved |

Sources:
https://www.finditparts.com/products/1877398/luber-finer-lh22019
https://shop.donaldson.com/store/fr-us/product/P550576/23063
https://www.dieselequipmentinc.com/products/p822768
https://plenty.parts/parts/wix-filters/engine/wix-filters-46490-secondary-air-filter-t3423903
https://www.filongfilter.com/en/cpshow.asp?id=4252

Equipment OEM seed data:
- KX057-4 serial <=25000: RD45242270 primary, RD45242280 secondary, HH1C032430 oil, 1522143170 fuel, R141164930 hydraulic pilot per https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-kx057-4-excavator-msu-ka-0199-2331555 . Note dealer body for low serial other source contradictions; retain review.
- KX057-4 serial 25001..28736: R140142270 primary, R240142280 secondary, HHV0051920 fuel, RD45151940 water separator, HH1C032430 oil, R141164930 pilot per https://maintenancesolutionsunlimited.com/products/hero-maintenance-filter-kit-for-kubota-kx057-4-excavator .
- U55-4: RD45242270 primary, RD45242280 secondary, HH1C032430 lube, HHV0051920 fuel, R141164930 pilot per https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-u55-4-excavator .
- U55-4 parts catalogue serial 50006-54240 lists RD452-42270 primary through serial 53737, RD452-42272 from 53738, RD452-42280 safety: https://www.scribd.com/document/884967163/Kubota-U55-4-SN-50006-54240-Excavator-Parts-Catalogue-Manual-Publishing-ID-BKIDA5018 . This is a serial range override; do not inherit cross RD452-42270 to RD452-42272.
- SVL97-2 kit initial: 5970026112 primary, 5523126150 safety, HH1C032430 lube, HHTA059900 HST: https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-svl97-2-skid-steer-loader .

Open: direct manufacturer verified exact OEM crosses, Kubota US parts serial detail, distinct fuel and HST elements, existing ELIMFILTERS SKU collision and classification. No automatic production approval until all mandatory technical/identity gates pass. The user's first-pass Donaldson then Fleetguard then OEM method and four terminal digits including zero apply.

Ponytail: reused NPR/Isuzu evidence stages, HD prefixes and earlier Kubota lots. Only one research doc created, no new worker/service/script or database mutation.
