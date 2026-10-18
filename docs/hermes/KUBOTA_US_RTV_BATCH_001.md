# Kubota USA — Lote 001: RTV / service-kit application evidence
Date: 2026-10-17
State: DOCUMENTED_RESELLER, pending Kubota genuine IPL validation
Parent kickoff: docs/hermes/KUBOTA_US_CATALOGUE_RESEARCH_20261017.md

## Traceable RTV service kit evidence (NOT individual filters)
| Equipment scope | Kubota kit number | Source | Interpretation |
|---|---|---|---|
| RTV900 legacy (specific RTV900G/RTV900W6SE examples) | 77700-01819 | https://www.messicks.com/parts/kubota/77700-01819 | Explicitly NOT compatible with RTV-X900 or RTV900XTT; do not inherit parts |
| RTV-X900 | 77700-08715 | https://www.messicks.com/parts/kubota/77700-08715 | Kit listing calls RTVX900, contents not yet established |
| RTV-X1100C; RTV-X1120D; RTV-X1140R/W | 77700-05389 | https://www.messicks.com/part/department/kubotafilterkits | Explicit kit-application listing; component details not yet established |
| RTV-XG850 Sidekick | 77700-09725 | https://www.messicks.com/part/department/kubotafilterkits | Different vehicle/powertrain; keep separate |

## Traceable individual-number seeds (RTV-X900W; dealer catalogue not OEM primary verification)
| Model scope | Number | Described component | Evidence | Status |
|---|---|---|---|---|
| RTV-X900W | HHK70-14073 | Oil Filter Cartridge (transmission position to confirm with IPL) | https://www.messicks.com/catalogs/kubota/rtv-x900w | REVIEW_REQUIRED_POSITION |
| RTV-X900W | K7591-82360 | Inner Air Filter Element / Air Cleaner Inner/Safety | https://www.messicks.com/catalogs/kubota/rtv-x900w | DOCUMENTED_RESELLER; OEM_IPL_PENDING |

## Legacy kit contents (do NOT transfer to RTV-X900)
Dealer explicitly lists RTV900 kit 77700-01819 with:
- HH150-32430 engine oil filter
- HHK72-14080 hydraulic suction filter
- HHK70-14070 HST filter
- 12581-43012 fuel filter
- K1211-82320 air outer element
Source: https://www.messicks.com/parts/kubota/77700-01819
All scoped exclusively to dealer's listed legacy kit, not RTV-X900.

## OEM manufacturer model and engine evidence
- Kubota RTV-X family current: https://www.kubotausa.com/equipment-series/rtv-x-series — D1105 engine mentioned via auxiliary hydraulic pump listing for RTV-X / X1120 / X1100; distinguish from X900 D902.
- Kubota RTV-X CAB: https://www.kubotausa.com/equipment-series/rtv-x-cab — D1105, 3-cylinder diesel.
- Kubota RTV-X CREW: https://www.kubotausa.com/equipment-series/rtv-x-crew — D1105 usage in pump/accessories, year/serial qualification pending.
- Kubota RTV-X long bed: https://www.kubotausa.com/equipment-series/rtv-x-long-bed — D1105.

## Pending
- Official Kubota IPL OEN, part supersessions, serial bounds for each item.
- Actual kit contents for RTV-X900 and X1100C/X1120D/X1140.
- Precise FILTER_POSITION for HHK70-14073.
- Aftermarket references not approved or imported.
- Live PostgreSQL reconciliation on ELIMSERVER; no inserts, sku changes, workers, or publication.
