# Kubota USA — Batch 016: LX2610 and L3301/L3901 expansion
Date: 2026-10-17; branch research/kubota-us-catalogue-20261017. Research-only; no SKU/database writes.
Owner policy: genuine Kubota OEM -> Donaldson first pass -> documented Fleetguard if no verified Donaldson cross in that pass -> Kubota OEM fallback if no cross; auto-owner-approve only after technical and identity/collision gates. Four numeric suffix digits including leading zero.

## LX2610HSD/UHSD — six dealer kit OEM candidates (qty 1 each)
Source https://maintenancesolutionsunlimited.com/products/hero-maintenance-filter-kit-for-kubota-lx2610hsd-tractor and https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-lx2610uhsd-tractor-2400861
- AIR_PRIMARY 6C060-99410 -> Donaldson P500260 (official March 2026 bulletin https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/emea/eafm-new-products/2026/New-Product-Releases-March-2026.pdf), SKU candidate EA10260 already planned batch 015. Preserve Kubota LX2610 exact application pending factory IPL.
- AIR_SAFETY 32721-58242 -> Donaldson P903550 (same official source), existing proposed EA13550.
- LUBE_PRIMARY HH150-32094 -> disputed Donaldson P550162 vs P502067 (prior batch), BLOCKED.
- FUEL_PRIMARY 6A320-59930 -> Fleetguard FF42106 candidate (previous catalogue-backed source), EF92106 candidate; check existing product/collision.
- HYDRAULIC HH670-37712 -> manufacturer cross unresolved, OEM dealer replacement HH6C0-37710 suggested (verify primary).
- HST HH660-36060 -> manufacturer cross unresolved; do not infer filter category for P550711 from aftermarket kit.
Official Kubota LX2610/LX3310 owners manual: https://www.kubotabooks.com/AutoIndex/index.php?dir=Tractor+Owners+Manuals%2F&file=LX2610-LX3310+OPS.pdf verifies separate HST, hydraulic and fuel positions but not OEM codes.

## L3301F and L3301H kits — distinguish transmissions
L3301F source https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-l3301f-tractor :
AIR_PRIMARY TC620-93230, LUBE HH164-32430, FUEL 1G311-43380 and HH1J1-43172 (two distinct fuel filter positions unclassified in kit), HYDRAULIC TC422-82620. Five positions.
L3301H source https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-l3301h-tractor adds HST HHK70-14070 as sixth position. HHK70-14070 -> P550711 is third-party candidate, filter-classification conflict from earlier RTV research; not an approved mapping.
L3901F shares cited kit family items according to https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-l3901f-tractor but exact completeness/model-year and L3901H parts require further primary validation. Do not auto-inherit.
L2501 HST reseller kit https://www.reliableaftermarketparts.com/products/maintenance-filter-kit-fits-kubota-l2501-hst-tractor lists HH164-32430, 6A320-59930, TA040-93230, HHK70-14070 and other filtration; distinguish from L3301 TC620-93230, don't conflate.

## New open OEM cross queue
HH670-37712; HH660-36060; TC620-93230; HH164-32430; 1G311-43380; HH1J1-43172; TC422-82620. Verify original Kubota IPL model/serial and manufacturer cross. Even when part code appears in a kit, dealer application is not manufacturer-primary certification.

## Ponytail
Reused official company source-authority and SKU-digit conventions, existing NPR/Isuzu research phases, Kubota prior batch candidate identities. Only one research note created; no scripts, workers, schedulers, schemas or product writes.
