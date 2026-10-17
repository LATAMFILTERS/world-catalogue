# Kubota USA — Batch 007: further OEN cross evidence (2026-10-17)

Status: documented cross candidates, not fitment-certified, no SKU mutation.

| Kubota OEN | Donaldson | Fleetguard | Evidence | Gate |
|---|---|---|---|---|
| K7591-82360 | P535396 | AF25967 | https://www.motointegrator.nl/producten/709651-secundair-luchtfilter-donaldson-p535396 ; existing docs/audits/migration226-casos-por-SKU-20261008.md | Existing EA15396 collision with DBA5396, governed historical mapping EA15967; do not mint a new product or override |
| 6A320-59930 | UNVERIFIED | FF42106 | Fleetguard catalogue hosted https://autokada.lv/wp-content/uploads/2019/07/FLEETGUARD-CATALOGUE.pdf lists exact Kubota OEN cross; manufacturer item https://www.fleetguard.com/product/FF42106 | FF42106 spec cartridge OD 46mm height 54mm; Donaldson manufacturer nonmanufacture unresolved |
| HHK70-14070 | P550711 candidate | LF17543 | Fleetguard catalogue as above lists HHK7014070=>LF17543; Donaldson reseller https://crossfilters.com/collections/our-best-sellers/products/p550711-donaldson-lube-filter-spin-on-full-flow | P550711 classified lube by Donaldson but Kubota HST hydraulic context; prefix BLOCKED |
| HHK32-16774 | no verified cross | no verified cross | prior Kubota dealer supersession | still open |
| 6A320-58862 | no verified cross | no verified cross | https://crossfilters.com/products/cfkit-filter-kit-for-kubota-rtv-x900-w-d902-engine | RTV-X900 kit seller discrepancy vs 6A320-59930, no substitution assumed |

**SKU digit rule**: Fleetguard FF42106 -> last four digits **2106**, fuel HD prefix EF9 -> **EF92106** only as conditional *proposal* if Donaldson not manufactured and product identity/collision gates pass. Never EF942106. The numeric substring of FF42106 is 42106; suffix 2106.

**A controlled source exists**: source is Fleetguard-branded PDF hosted by third party, not live official Fleetguard web cross interface. Direct manufacturer item page confirms product existence and specs, not directly the Kubota cross.

Existing SKU identity and collision enforcement mandatory. No DB, SKU, deployment, service or scheduler writes.
