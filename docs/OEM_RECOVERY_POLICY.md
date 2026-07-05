# ============================================================
# OEM RECOVERY POLICY (DO NOT MODIFY EXISTING DATA)
# ============================================================

HEAVY_DUTY:
  master: DONALDSON
  source_air: https://www.airfilter-crossreference.com/
  source_fuel: https://www.fuelfilter-crossreference.com/
  source_oil: https://www.oilfilter-crossreference.com/

LIGHT_DUTY:
  master: MANN-FILTER
  source_air: https://www.airfilter-crossreference.com/
  source_fuel: https://www.fuelfilter-crossreference.com/
  source_oil: https://www.oilfilter-crossreference.com/

RULES:

- NEVER UPDATE EXISTING OEMS
- NEVER DELETE OEMS
- NEVER TOUCH VALID SKUS
- ONLY INSERT OEM WHEN OEM COUNT = 0
- ONLY USE THE CORRECT WEBSITE FOR EACH FAMILY
- PRESERVE ALL COMPETITOR REFERENCES
- PRESERVE ALL APPLICATIONS
- PRESERVE ALL TECHNICAL SPECS

AIR/AIR INTAKE/CABIN
    -> airfilter-crossreference

FUEL/FUEL SEPARATOR
    -> fuelfilter-crossreference

OIL/LUBE/HYDRAULIC
    -> oilfilter-crossreference
