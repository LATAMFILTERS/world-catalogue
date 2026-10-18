# Kubota USA — RTV batch 002: individual filter extraction
Date: 2026-10-17
Status: EVIDENCE_CAPTURED; NOT APPROVED / NOT PUBLISHED
Parent: docs/hermes/KUBOTA_US_RTV_BATCH_001.md

## OEM-number candidates individually listed by Kubota dealer Messick's
Source: https://www.messicks.com/parts/kubota/77700-05389
Advertised kit: 77700-05389 (RTV-X1100C, RTV-X1120D, RTV-X1140R/W).
| Filter position as listed | Kubota number | Evidence status |
|---|---|---|
| Engine oil | HH150-32094 | DOCUMENTED_DEALER; exact model/serial still pending OEM IPL |
| Fuel | 6A320-59930 | DOCUMENTED_DEALER |
| Hydraulic | HHK32-16770 | DOCUMENTED_DEALER; suspected suction position, needs exact IPL |
| Hydrostatic transmission (HST) | HHK70-14073 | DOCUMENTED_DEALER |
| Outer air | 1G319-11210 | DOCUMENTED_DEALER |
The dealer's kit listing gives these five components. It does NOT establish the inner air element for this kit, so do not infer an included part.

## RTV-X900 kit 77700-08715 — supplier extraction under conflict
Dealer's own 77700-08715 page identifies kit and RTV-X900 but does not enumerate parts:
https://www.messicks.com/parts/kubota/77700-08715
Independent replacement kit suppliers publish these claims (NOT Kubota OEM parts list):
- Russo Power aftermarket kit: https://russopower.com/products/rtv-x900kitr25-filter-kit
  Air outer 1G319-11210; air inner K7591-82360; engine oil HH150-32430; fuel 6A320-59930; hydraulic HHK72-14080; suction HHK32-16770.
- CrossFilters aftermarket: https://crossfilters.com/products/kubota-rtv-x900-w-d902-engine-cfkit-maintenance-filter-kit
  Outer 1G31911210; inner K759182360; engine oil HH15032430; hydraulic/HST HHK7014070; suction HHK3216770; fuel 6A32059930.
- Independent replacement seller (additional corroboration with different positioning): https://www.fridayparts.com/filter-kit-for-kubota-utility-vehicle-rtv-x900-rtv-x1100-tractor-b3350hsd-b3350hsdc-b3350suhsd
  HH150-32430; 1G319-11210; K7591-82360; 6A320-59930; HHK32-16770; and two units HHK70-14070 for HST, with claimed HH3A0-82630 alias.

## Material conflicts and quarantine
1. HH150-32094 (dealer RTV-X1100C/1120D/1140 kit) vs HH150-32430 (RTV-X900 aftermarket kit). They are distinct codes; do NOT normalize one into the other.
2. HHK70-14073 (dealer RTV-X1100C/1120D/1140 HST) vs HHK70-14070 / HHK72-14080 (RTV-X900 aftermarket kit suppliers) have disputed positions and codes. Do not substitute.
3. Earlier batch 001 labeled HHK70-14073 as uncertain position for RTV-X900W from generic accessory/sidebar listings. Dealer 77700-05389 explicitly lists it as HST for different models; still require genuine RTV-X900W IPL for its fitment there.
4. HHK32-16770 called hydraulic by dealer, suction by aftermarket sellers. Preserve source-specific labels, position REVIEW_REQUIRED.
5. Aftermarket listings claim same codes for dissimilar engines and model families. Exact serial / vintage / engine must be validated from Kubota IPL before published fitment.

## Distinct codes captured this batch (6 primary dealer+additional aftermarket; no approved crosses)
HH150-32094, 6A320-59930, HHK32-16770, HHK70-14073, 1G319-11210, HH150-32430, K7591-82360, HHK72-14080, HHK70-14070.
Distinct strings total 9. This is a research inventory, not product count.

## Next targeted work
- Read genuine Kubota illustrated parts for specific RTV-X900W and RTV-X1100C / X1120D / X1140 serial ranges.
- Distinguish TRANSMISSION_FILTER, HST_FILTER, HYDRAULIC_SUCTION by published OEM assembly, physical specifications.
- Research verified Donaldson/WIX/Baldwin/Fleetguard equivalents only after OEN-specific fitment proof.
- Compare existing ELIMFILTERS parts on Lenovo read-only; do not mint any new SKUs now.
## Architecture
Reuses existing NPR/Isuzu closure method and existing reference-classification standard; no code, schema, worker, scheduling, or product mutation.
