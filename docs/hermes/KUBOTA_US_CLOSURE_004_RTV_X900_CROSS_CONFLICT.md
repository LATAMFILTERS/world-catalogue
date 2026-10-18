# Kubota RTV-X900 closure 004 — Transmission cross classification
Date: 2026-10-17. Status PARTIAL / REVIEW_REQUIRED. Research only.

## Source-backed findings
- Kubota HHK70-14073 -> Donaldson P550711 is a vendor-listed cross (https://www.filterfinderonline.com/products/hhk70-14073). Same vendor also lists Fleetguard LF17543.
- Manufacturer Donaldson P550711 specifies LUBE SPIN-ON FULL FLOW, engine lubricating application, not hydraulic: https://shop.donaldson.com/store/en-us/product/P550711/20498.
- HIFI manufacturer official catalog explicitly maps Kubota HHK70-14073 -> SH60416 and classifies SH60416 as HYDRAULIC FILTER: https://catalog.hifi-filter.com/en-GB/directory-list/cross/brand/kubota/a3ea8153-40f6-ee11-a1fe-0022487fe037/cross/hhk70-14073/d5cca644-548d-f011-b4cc-6045bd971aef.
- No direct official Kubota-to-Donaldson P550711 hydraulic homologation established. Cross filter category mismatch blocks EL80711 and EH60711 for this Kubota role.
- For HHK32-16774, first bounded Donaldson/Fleetguard search did not produce verified manufacturer cross. Not evidence of non-manufacture; preserve genuine Kubota OEM fallback candidate only pending fitment/specification/identity validation.

## Do not conflate
- HIFI manufacturer mapping is not proof Donaldson P550711 is hydraulically compatible.
- Retail cross-reference listings can contain overbroad equivalences mixing older HHK70-14070 / HHK70-14073 / HHK72-14080.
- Technical category and differential pressure/bypass/thread/dimensions must agree before cross approval.

## Required next closure action
Capture original Kubota drawing and specs for RTV-X900W matching serial; confirm distinct VHT and SUCTION filters. Verify manufacturer direct Donaldson or Fleetguard cross and technical details or document OEM fallback under existing governance. Reconcile SKU identity in live canonical database before publication. Status remains PARTIAL; no CRM or catalogue write.

Ponytail: Reuses closure 001-003 and existing HERMES certification gates; one new research Markdown only.
