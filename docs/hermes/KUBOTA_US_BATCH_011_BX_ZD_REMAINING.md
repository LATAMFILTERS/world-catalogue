# Kubota USA Batch 011 — BX23S/ZD1211 remaining OEMs
Date: 2026-10-17
Status: SOURCE_DOCUMENTED / NOT LIVE_PUBLISHED

| Kubota OEM | Donaldson first-pass | Fleetguard | New finding | Proposed SKU | Status |
|---|---|---|---|---|---|
| K2581-82310, BX23S air | P822686 | AF25550 | A kit vendor explicitly lists Kubota K2581-82310 alongside K1211-82320 as aftermarket air equivalent; Kubota primary IPL and manufacturer direct OEM match not yet checked | EA12686 | REVIEW_REQUIRED |
| HHK20-36990, BX23S hydraulic/HST | no verified Donaldson cross | no verified Fleetguard cross | dealer supersession to HHK20-36994 | none | OPEN |
| HHK32-16772, ZD1211 suction | no verified Donaldson cross | no verified Fleetguard cross | Kubota dealer supersession to HHK32-16774, also supersedes HHK32-16770 | none | OPEN |

Sources:
- https://www.mymromarts.com/products/maintenance-filter-kit-for-kubota-bx
- https://www.newhollandrochester.com/shop/hhk20-36990/
- https://www.messicks.com/parts/kubota/hhk32-16772
- Manufacturer MANN cross-reference 2024-26 confirms Kubota HHK20-36990→WD 8001 and HHK32-16770→WD 10 001 x, strictly auxiliary diagnostic evidence, not canonical diesel base: https://www.mann-filter.com/content/dam/mann-filter/communication-media/brochures-catalogs/mann-filter-cross-reference-list-2024-26-interactive.pdf

No Donaldson manufacture absence inferred, and no unverified OEM replacement should be treated as identical fitment across serial ranges. Follow current owner rule: first Donaldson search, if missing then verified Fleetguard directly, then verified Kubota OEM fallback if neither verified; canonical system prefix + four terminal digits with leading zeros. OEM replacements should be confirmed against primary Kubota parts list.

Next: investigate HHK20-36994 and HHK32-16774 manufacturer crosses and verify distinct roles (hydraulic suction vs HST) before SKU. Reuse SKU EA12686 candidate from earlier batch; do not create duplicate.

Ponytail: reused prior Kubota research, NPR method, and existing SKU standards. Only evidence document added.
