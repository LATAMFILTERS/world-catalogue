# Kubota USA — Batch 006: preserve four numeric digits in HD SKUs
Date: 2026-10-17
Owner correction: Always preserve exactly the last FOUR numeric digits of canonical base, including leading zeros.

Donaldson P550711 => 0711. Candidate lubrication SKU **EL80711** (prefix EL8 + 0711); candidate hydraulic SKU **EH60711** (prefix EH6 + 0711). **Never EL8711 or EH6711.** Neither is approved until Kubota OEM part position and Donaldson cross are certified; if two genuine OEMs truly cross to a single product, do not mint two ELIMFILTERS products.

Kubota K7591-82360 -> Donaldson P535396 appears in distributor cross lists, but existing repository `docs/audits/migration226-casos-por-SKU-20261008.md` records EA15396 occupied by DBA5396 and resolution to EA15967 (Fleetguard AF25967). DO NOT allocate EA15396 or silently replace the historical governed mapping; verify before binding.

Kubota HHK32-16770 -> reported genuine supersession HHK32-16774, still lacks validated Donaldson/Fleetguard direct cross. Kubota 6A320-59930 -> reported Fleetguard FF42106, no documented Donaldson absence. Both remain pending.

Previously owner-approved four proposals: EL82067, EL80162, EA13837, EH60227; owner approval does not override pending verified cross/specification and collision constraints. No catalogue writes or product creation.

Reused existing HD SKU prefix rules, NPR/Isuzu evidence workflow and collision record. New: only this traceable research correction document.
