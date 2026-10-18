# Kubota USA — Batch 019: M-Series fuel/cabin and L-Series air cross follow-up
Date: 2026-10-17
Status: RESEARCH_CANDIDATES; no production writes.

## Kubota M7060 fuel
Kubota OEM 1J800-43170 -> Donaldson P550049; Fleetguard FF5088 as secondary documented crosses.
Evidence:
- https://inlinefilters.co.uk/FilterCrossReference/Kubota/1J80043170/
- https://spareto.com/products/hengst-filter-fuel-filter/h519wk
- https://www.parts-machining.com/high-efficiency-fuel-filter-me229355-lff3527_p9725.html
Product threading M20 x 1.5; reseller dimensional claims ~90-96 mm OD, 100-101 mm height. Manufacturer direct OEN-equivalence/spec and fitment still pending. Donaldson canonical candidate P550049 -> last four digits 0049, HD fuel prefix EF9 -> EF90049. Existing `data/dims.csv` includes EF90049, so must reuse/reconcile current product identity and check live DB rather than minting a duplicate.

## Kubota M5-111 specialty filter positions
M5-111 with cab, V3800CR-TIEF4 kit lists:
- V0521-51940 fuel/water separator (NO verified Donaldson/Fleetguard)
- T1855-71600 cab air (NO verified Donaldson/Fleetguard)
- 1G410-52300 fuel pump filter (NO verified Donaldson/Fleetguard)
Kit: https://crossfilters.com/products/cfkit-maintenance-filter-kit-for-kubota-m5-11-cabin-air-filter
Kubota T1855-71600 cab filter dealer: https://partsonline.com/products/cab-filter-replacement-for-kubota-t1855-71600
1G410-52300 third-party cross source https://tpi-mexico.com/wp-content/uploads/2025/08/CAT-APLICACIONES-AGRICOLA.pdf lists Baldwin PF46241 but Donaldson/Fleetguard empty. Do not choose Baldwin as diesel SKU base.

## L3301/L3901 primary air conflict sharpened
OEM TC620-93230 and TA040-93230 were inconsistently reported across kit listings: do not merge them or treat them as same original part. For TA040-93230 only, Bavaria catalogue lists Donaldson P821575, Fleetguard AF25551: https://www.bavariafilter.com/Uploads/BAVARIA_DIGITAL_CATALOG.pdf
More broad cross services report alternative P831424, P538494, P539578, and sizes vary. Conflicting Donaldson candidates prevent automatic approval.
Existing repo audit `docs/audits/migration226-casos-por-SKU-20261008.md` states Donaldson P821575 preferred EA11575 slot occupied by P541575 and controlled fallback EA15551 with Fleetguard AF25551. Do not use EA11575 or duplicate EA15551 without current product identity review.

## Conclusions / gating
One new diesel fuel cross candidate EF90049 with preexisting code; three specialty filter OEMs open; air collision flagged. No new certified direct manufacturer crosses, no SKU publications.
Use first-pass Donaldson then verified Fleetguard fallback; preserving four digits/zeros. Automatic owner approval only after certification, correct model/serial, component role, product identity and collision validation.
Ponytail: reused NPR/Isuzu gates, existing HD prefix rules and collision audit; only research artifact created.
