# Kubota USA — Batch 023: KX057-4, U55-4, SVL97-2 fuel and separation
Date: 2026-10-17. Evidence-only; no production inserts.
Method: Kubota OEM -> Donaldson first pass -> verified Fleetguard if Donaldson not verified -> OEM fallback. Preserve last four digits including zeros, and use correct position prefix.

| OEM Kubota | Position | Donaldson candidate | Fleetguard candidate | Conditional ELIMFILTERS SKU | Status |
|---|---|---|---|---|---|
| RD819-51280 | fuel/water separator element | P502406 | FF5386 | ES92406 only if water-separation function and manufacturer equivalence certified | Cross supported by Hengst manufacturer's own E13S OEM and aftermarket comparisons; Kubota machine applicability by dealer, no live SKU check |
| HHV00-51920 | fuel-water separator spin-on | none verified | none verified | none | Kubota OEM confirmed by dealer, aftermarket MANN/WIX only; don't use unsupported code |
| RD451-51940 | separator/screen element | none verified | none verified | none | genuine Kubota part; MANN P4001, HIFI only |
| 1C020-32430 | engine oil | P550318 | LF3376 | EL80318 (reuse, already prior Kubota batch) | strong third-party cross; OEM exact fitment and product identity check required |
| V0631-51880 | fuel SVL97-2 | none verified | none verified | none | appears on aftermarket machine application list; verify Kubota serial and IPL first |

Sources:
- Hengst E13S cross listing both Kubota RD819-51280 and Donaldson P502406 / Fleetguard FF5386: https://www.motointegrator.de/artikel/1771490-kraftstofffilter-hengst-filtration-e13s
- Additional product cross https://agrif.pl/filtry/filtr-paliwa-agrif-ag1652/
- Kubota genuine water-separator listing https://www.colemanequip.com/parts/details/KubotaParts/Kubota-Fuel-Filter---Water-Separator-Element/RD451-51940/
- Kubota HHV00-51920 original, supersedes V0621-51920, models include KX057-4 and U55-4: https://www.messicks.com/parts/kubota/HHV00-51920
- Cross lists no valid Donaldson/Fleetguard for HHV00-51920 https://www.fuelfilter-crossreference.com/convert/KUBOTA/HHV00-51920
- Kubota 1C020-32430 cross Donaldson P550318 / Fleetguard LF3376: https://www.oilfilter-crossreference.com/convert/KUBOTA/1C020-32430
- SVL97-2 fuel V0631-51880 aftermarket applications https://partsonline.com/products/fuel-filter-replacement-for-kubota-v0631-51880

Important: Donaldson P502406 appears in fuel category, but OEM RD819-51280 described as fuel/water separation element. Require physical element type and official water-separation specs before choosing ES9 vs EF9. Do NOT auto-approve proposed ES92406 based solely on reseller mapping. Use no new SKU if existing. No claims of unavailable manufacture from an inconclusive search.

Reused NPR/Isuzu workflow and previous Kubota batches. Created research note only, no code, database, workers, or products.
