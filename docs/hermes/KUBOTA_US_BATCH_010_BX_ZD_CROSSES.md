# Kubota USA — Batch 010: BX23S / ZD1211 Donaldson cross research
Date: 2026-10-17
Scope: Kubota OEM -> Donaldson first-pass -> Fleetguard alternative; proposed HD SKU and repository collision inspection.
Status: CROSS_DOCUMENTED_THIRD_PARTY; manufacturer direct OEM cross and live SKU identity remain to be certified. No catalogue insert.

| Kubota OEM | Application (dealer/kit claim) | Donaldson candidate | Fleetguard alternative | Derived proposed SKU | Status |
|---|---|---|---|---|---|
| K3181-82240 | ZD1211 primary air | P778979 | AF26387 | EA18979 (EA1 + 8979) | MANUFACTURER_OEM_CROSS_PENDING |
| K3181-82250 | ZD1211 secondary air | P780018 | AF26388 | EA10018 (EA1 + 0018) | MANUFACTURER_OEM_CROSS_PENDING |
| 12581-43012 | BX23S and ZD1211 fuel inline | P550012 | FF149 | EF90012 (EF9 + 0012) | EXISTING_IDENTITY_COLLISION_AUDIT |

Evidence:
- https://www.filterfinder.se/products/k3181-82240 cross K3181-82240→P778979, AF26387.
- https://www.finditparts.com/products/20399284/wix-filters-49968 explicitly records K3181-82250→P780018, AF26388.
- https://www.finditparts.com/products/20399286/wix-filters-49978 records K3181-82240→P778979.
- https://inlinefilters.co.uk/FilterCrossReference/Kubota/1258143012/ records Kubota 12581-43012→Donaldson P550012 and Fleetguard FF149.
- https://shop.donaldson.com/store/fr-us/product/P778979/22047 confirms manufacturer P778979 product as radial-seal primary air, not OEM cross itself.

Existing repo collision/identity:
- `data/dims.csv` already mentions EA18979 and EA10018. They are not proof of live catalogue product but require reuse check, not recreation.
- `docs/audits/catalog-367-remediation-batch3-20261007.md` explicitly flags `EF90012 | ST2001HH | EF92001 | COLISION`.
- `fix_ff149.js` ties Fleetguard FF149 to Donaldson P550012 / ELIMFILTERS EF90012. This historical script is NOT to be executed; current authority/DB must be consulted read-only.
Thus do not insert/approve a NEW EF90012 identity just from the Kubota cross. If existing canonical identity is verified, add application link to that product with no duplicate SKU.

Other unclosed BX/ZD OEM positions: K2581-82310 (BX air), HHK20-36990 (BX HST), HHK32-16772 (ZD suction). No documented direct Donaldson/Fleetguard cross found in this pass; leave open. Prior HH150-32094 conflict and HHK70-14073 classification block remain.

Governance: real Kubota OEM and model/serial from genuine Kubota IPL; direct manufacturer cross must be verified before certified automatic approval. Four numeric last digits, zero padding preserved. Donaldson first pass, Fleetguard if no verified Donaldson. No product/SKU or database writes, no separate pipeline.

Ponytail: reuses NPR/Isuzu evidence scheme, canonical SKU and collision audit; created only research document.
