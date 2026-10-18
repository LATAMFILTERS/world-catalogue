# Kubota USA closure 003 — RTV-X900W transmission IPL update
Date 2026-10-17. Evidence-only; no production SKU creation.

## Stronger Kubota dealer IPL evidence
Kubota RTV-X900W TRANSMISSION D01600 HST (CASE) [COMPONENT PARTS], assembly HST, ASSY(T-24,71,A) explicitly for S/N >=41624:
https://store.germanbliss.com/kubota-rtv-x900w-parts-73
- Diagram position 120: OEM HHK32-16772, FILTER(OIL,CARTRIDGE)
- Diagram position 140: OEM HHK70-14073, CARTRIDGE,OIL FILTER
These are two *distinct filters on same assembly*. Diagram shows a serial-qualified HST assembly; exact component applicability to other serials and exact functional designation (VHT vs SUCTION) must still be cross-checked against respective service diagram. No inference that HHK70-14070 is the same as HHK70-14073.

## Original-part supersession
Dealer Kubota parts source explicitly states HHK32-16772 superseded to HHK32-16774, which also replaces HHK32-16770, HH3A0-82630, 3A431-82630, K3161-16770, K7591-32050:
https://www.messicks.com/parts/kubota/hhk32-16772
https://www.messicks.com/parts/kubota/hhk32-16774
This is part number/supersession evidence, not Donaldson/Fleetguard homologation.
The original RTV-X900 operator manual independently separates VHT filter (yellow) and SUCTION filter (black), with distinct service operations:
https://www.manualslib.com/manual/881106/Kubota-Rtv-X900.html?page=92
https://www.manualslib.com/manual/881106/Kubota-Rtv-X900.html?page=93

## Current closure table
- SUPPORTED by machine-specific parts diagram: HHK32-16772 and HHK70-14073 as two physical filter elements on specified HST assembly.
- SUPPORTED by dealer supersession: HHK32-16772 -> HHK32-16774.
- OPEN: machine-specific serial boundary of component itself; service-color functional mapping; manufacturer Donaldson/Fleetguard exact-OEM cross for HHK32-16774 and HHK70-14073; final technical category and ELIMFILTERS SKU collision review.
- RTV-X900 remains PARTIAL; not TECHNICALLY_CERTIFIED, INTEGRATED or PUBLISHED.

Next: use primary manufacturer parts drawings for exact functional designation; direct Donaldson cross for HHK70-14073 / HHK32-16774 then Fleetguard if no confirmed Donaldson in bounded pass. Preserve last four digits and existing identity. No separate CRM technical authority.

Ponytail: reuses existing Kubota closure docs, NPR evidence gates, manufacturer SKU policy and original dealer IPL. Created only this one traceable research document.
