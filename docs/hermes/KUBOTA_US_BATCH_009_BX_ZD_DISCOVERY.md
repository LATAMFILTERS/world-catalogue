# Kubota USA — Batch 009: BX23S and ZD1211 OEM filter expansion
Date: 2026-10-17
Status: dealer/aftermarket documented candidates; not manufacturer-OEM certified, not published
Nomenclature: Kubota **OEM** exclusively (owner correction). Never OEN in Kubota outputs.

## BX23S diesel
Third-party kit: https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-bx23s-tractor-2331626
- HH150-32430 engine oil; K2581-82310 primary air; 12581-43012 fuel (two pieces); HHK20-36990 HST/hydraulic.
- Dealer/third-party kit https://partandfilters.com/products/maintenance-filter-kit-for-kubota-bx23s-bx1880-bx2360-bx2380-bx2230 documents Donaldson candidates: HH150-32430→P502067; K1211-82320→P822686; 12581-43012→P550012; HHK72-14080→P550227. **K1211-82320 vs K2581-82310 and HHK72-14080 vs HHK20-36990 are not proven identical**; never merge as OEM.
- https://aspartsmarket.com/products/maintenance-filter-kit-for-kubota-bx-series-sub-compact-tractor-bx23s-bx1880-bx2380 also claims K1211-82320 and Fleetguard AF25550, with P822686 as candidate.
- P550012 fuel → prefix EF9 + 0012 = EF90012; P822686 air → EA1 + 2686 = EA12686, both PROPOSED ONLY until manufacturer primary cross and SKU collision verification.
- Confirm exact OEM through Kubota illustrated parts, engine/year/serial.

## ZD1211 diesel
Third-party kit: https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-zd1211-zero-turn-mower
- K3181-82240 primary air, K3181-82250 secondary air, HH150-32094 engine oil, 12581-43012 fuel, HHK32-16772 transmission oil suction, HHK70-14073 HST.
- Another version https://maintenancesolutionsunlimited.com/products/hero-maintenance-filter-kit-for-kubota-zd1211-zero-turn-mower lists HHK32-16770 instead, so suction filter is a live source conflict, not certified.
- ZD1211L-3 kit https://www.tractorsupply.com/tsc/product/hero-preventative-maintenance-kit-kubota-zd1211l-3-zero-turn-mower-2594393 adds two inline K3272-24210 fuel filters; do not inherit for plain ZD1211.
- Official Kubota manual https://media.kubota.io/uploads/ZD1211-ZD1221-Series-Ride-on-Mower-Manual.pdf confirms real engine oil, fuel, hydraulic and HST filter service positions, but not the above precise OEM identifiers.

## Manufacturer cross status
Donaldson product existence != direct Kubota OEM cross. Above P550012/P822686 are dealer-made claims; direct manufacturer Kubota-number cross still needs verification.
HH150-32094 conflicting Donaldson P550162/P502067 (batch 004), BLOCKED.
HHK70-14073 P550711 classification (lube catalog vs HST fitment) remains BLOCKED.
Any other unverified reference remains OPEN; Fleetguard fallback after bounded Donaldson first-pass when direct Fleetguard cross verified, per owner rule.
No publication/DB write, no invented SKU or cert claims.

## Reused
Kubota research branch and prior 008 batches, NPR/Isuzu evidence gates, canonical prefixes and collision checks. Created only this evidence doc; no script, worker, table, service, schedule or dependency.
