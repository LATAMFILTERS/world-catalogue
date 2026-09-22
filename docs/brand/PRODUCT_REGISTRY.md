# PRODUCT_REGISTRY

Status: Active
Last updated: 2026-09-22

---

# AIR INTAKE & AIRFLOW PROTECTION

## Air Filters
Technology:
- MACROCORE™

## Cabin Air Filters
Technology:
- MICROKAPPA™

## Air Dryers
Technology:
- DRYCORE™

## Air Intake Housings
Technology:
- INTEKCORE™

---

# FUEL CLEANLINESS PROTECTION

## Primary / Secondary / Spin-On / Cartridge Fuel Filters
Technology:
- SYNTAPORE™

## Standard Non-Turbine Fuel Water Separators
Technology:
- HYDROCORE™

Scope:
- Approved standard non-turbine separator configurations
- Drain and transparent-bowl configurations where specified by application

## FH Series Turbine Fuel/Water Separation
Technology:
- TURBOCORE™

## FG Series Turbine Fuel/Water Separation
Technology:
- TURBOCORE™

Rule:
SYNTAPORE™, HYDROCORE™ and TURBOCORE™ are distinct fuel-cleanliness technology scopes and must not be merged or substituted.

---

# LUBRICATION PROTECTION

## Lube Filters
Technology:
- SYNTRAX™

---

# HYDRAULIC PROTECTION

## Hydraulic Filters
Technology:
- NANOFORCE™

---

# COOLING SYSTEM PROTECTION

## Coolant Filters
Technology:
- THERMACORE™

---

# SPECIALIZED COMMERCIAL SOLUTIONS

## Marine Filtration Systems
Solution:
- MARINECLEAN™

## Integrated Maintenance and Asset Protection Kits
Solution:
- DURATECH™

Rule:
Products belong to protection systems. Specialized solutions may contain products from multiple systems but are not core technology entities. The filter is the means; asset protection is the objective.


---

# INDUSTRIAL & PROCESS

Canonical product assignment rule:

Every Industrial & Process product must map to:
Platform
→ Technology Family
→ Descriptive Subfamily if applicable
→ Product Family / Configuration
→ Canonical SKU

Base-code authority rule:

Before a Canonical SKU can be minted, the external reference used to define the product identity must be classified with one of four authority states:

1. `ORIGINAL_BASE` — primary evidence confirms the exact original element/code for the equipment, housing, vessel, collector or module. This always outranks a family anchor.
2. `FAMILY_ANCHOR_BASE` — used only when the true original cannot be established and the code belongs to the approved anchor manufacturer for that Industrial Technology Core with complete primary product evidence.
3. `COMPETITOR_CROSS` — validated interchangeable/equivalent reference only; never becomes the base merely because it is common or dimensionally similar.
4. `SOURCE_ONLY` — observed source code with insufficient authority for canonical identity.

Industrial family anchors v1:

- TC-AIR-01 — General Air Filtration → CAMFIL
- TC-AIR-02 — HE-CRIVA™ → CAMFIL
- TC-AIR-03 — MA-TREA™ → CAMFIL
- TC-DUST-01 — FUMEVRA™ → DONALDSON
- TC-NG-01 — COALERIS™ → PALL
- TC-NG-02 — Gas-Liquid Separation → PALL
- TC-HYD-01 — HYLTRIS™ → PARKER
- TC-LUB-01 — LUBREVA™ → PARKER
- TC-OIL-01 — DEWATIS™ → PALL; Parker is a secondary technical/cross-reference source
- TC-OIL-02 — OILREVEX™ → PALL
- TC-WAT-01 — Depth Filtration → PALL
- TC-WAT-03 — ADSOVEX™ → CALGON CARBON
- TC-WAT-04 — MEMBRAVEX™ / Reverse Osmosis → DUPONT FILMTEC
- TC-WAT-05 — MEMBRAVEX™ / Ultrafiltration → DUPONT WATER SOLUTIONS
- TC-WAT-06 — MEMBRAVEX™ / Nanofiltration → DUPONT FILMTEC
- TC-WAT-07 — IONVEXA™ → DUPONT AMBERLITE
- TC-WAT-08 — Electrodeionization → no commercial base approved

PARTION™ Oil Mist / Coolant Mist may use DONALDSON as a research anchor, but no commercial base or SKU is authorized until that treatment family is separately approved.

Rule:
A discovery supplier such as REIKE is `SOURCE_ONLY` by default. It becomes `ORIGINAL_BASE` only when original-manufacturer status is proven by primary evidence. Parker Par Fit or any other interchange programme remains `COMPETITOR_CROSS` when the original element is known.

Industrial SKU nomenclature remains separately governed. Product development may proceed as an EBP `pre-SKU` Product Engineering Passport; this policy does not mint or invent an ELIMFILTERS SKU.

## AEREMIS™ — Air Technologies

### General Air Filtration
Technology family: descriptive
Core: TC-AIR-01

### High-Efficiency / Critical Air Filtration
Technology:
- HE-CRIVA™
Core: TC-AIR-02

### Molecular Air Treatment
Technology:
- MA-TREA™
Core: TC-AIR-03

## PARTION™ — Dust & Fume Technologies

### Fine Dust & Fume Filtration
Technology:
- FUMEVRA™
Core: TC-DUST-01

## COALVEX™ — Gas Conditioning Technologies

### Gas Coalescence
Technology:
- COALERIS™
Core: TC-NG-01

### Gas-Liquid Separation
Technology family: descriptive
Core: TC-NG-02

## FLUREXIS™ — Fluid Conditioning Technologies

### Hydraulic Fluid Filtration
Technology:
- HYLTRIS™
Core: TC-HYD-01

### Industrial Lubrication Filtration
Technology:
- LUBREVA™
Core: TC-LUB-01

### Oil Dehydration & Water Removal
Technology:
- DEWATIS™
Core: TC-OIL-01

### Oil Condition Remediation
Technology:
- OILREVEX™
Core: TC-OIL-02

## AQUVEXIS™ — Water Treatment Technologies

### Depth Filtration
Technology family: descriptive
Core: TC-WAT-01

### Adsorptive Carbon Treatment
Technology:
- ADSOVEX™
Core: TC-WAT-03

### Membrane Separation
Technology:
- MEMBRAVEX™
Cores:
- TC-WAT-04 — Reverse Osmosis
- TC-WAT-05 — Ultrafiltration
- TC-WAT-06 — Nanofiltration

### Ion Exchange
Technology:
- IONVEXA™
Core: TC-WAT-07

### Electrodeionization
Technology family: descriptive
Core: TC-WAT-08

Rule:
Product records inherit the platform / family identity from this registry. They must not invent product-level technology names.
