\# ELIMFILTERS LD / HD MASTER CATALOG POLICY

Version: 1.0

Status: APPROVED

Date: 2026-06-16



\---



\# PURPOSE



Define the official catalog governance model for ELIMFILTERS.



This document establishes:



1\. Which manufacturer becomes the master source.

2\. How SKU codes are generated.

3\. How Mann, Donaldson and Fleetguard are treated.

4\. How Heavy Duty and Light Duty products are separated.

5\. Which records require manual review.



\---



\# MASTER CATALOG STRATEGY



ELIMFILTERS operates under a dual catalog architecture:



\## HEAVY DUTY (HD)



Master Reference:



DONALDSON



All HD products must ultimately resolve to a Donaldson base code whenever possible.



Donaldson is the official reference system for:



\- Air Filtration

\- Fuel Filtration

\- Lubrication

\- Hydraulic

\- Coolant

\- Air Dryer

\- Turbine Series



\---



\## LIGHT DUTY (LD)



Master Reference:



MANN-FILTER



All LD products use MANN as the official base catalog.



Only the following LD categories are accepted:



\- Air Filter

\- Cabin Filter

\- Fuel Filter

\- Oil Filter



\---



\# FLEETGUARD POLICY



Fleetguard is NOT a master catalog.



Fleetguard serves only as:



\- Cross Reference Source

\- OEM Enrichment Source

\- Alternative Product Source

\- Data Validation Source



Fleetguard never overrides:



\- Donaldson HD master records

\- MANN LD master records



\---



\# HD SKU STRUCTURE



Heavy Duty products use Donaldson as base code.



Official prefixes:



| Category | Prefix |

|-----------|----------|

| Air Filter | EA1 |

| Cabin Filter | EC1 |

| Fuel Filter | EF9 |

| Oil Filter | EL8 |

| Hydraulic Filter | EH6 |

| Coolant Filter | EW7 |

| Air Dryer | ED4 |

| Turbine Series | ET9 |



Rule:



Take the last 4 digits of the Donaldson base code.



Examples:



P550490 → EL8490



P550788 → EL8788



P164200 → EH6200



P181099 → EA1099



\---



\# LD SKU STRUCTURE



Light Duty products use MANN as base code.



Official prefixes:



| Category | Prefix |

|-----------|----------|

| Air Filter | EA3 |

| Cabin Filter | EC3 |

| Fuel Filter | EF3 |

| Oil Filter | EL3 |



Rule:



1\. Extract NUMBERS ONLY from the MANN code.

2\. Ignore:

&#x20;  - letters

&#x20;  - spaces

&#x20;  - slashes

&#x20;  - hyphens

&#x20;  - symbols

3\. Take the LAST 4 DIGITS.

4\. Build ELIMFILTERS SKU.



Examples:



W940/21



Numbers:

94021



Last 4:

4021



SKU:

EL34021



\---



WK842/23



Numbers:

84223



Last 4:

4223



SKU:

EF34223



\---



CUK2939



Numbers:

2939



Last 4:

2939



SKU:

EC32939



\---



C30850



Numbers:

30850



Last 4:

0850



SKU:

EA30850



\---



HU719/7X



Numbers:

7197



Last 4:

7197



SKU:

EL37197



\---



\# HD HOMOLOGATION PROCESS



If a MANN product is classified as HD:



MANN

↓

OEM Match

↓

Donaldson Search



If Donaldson exists:



Donaldson becomes the official base code.



Generate ELIMFILTERS HD SKU.



Example:



MANN

↓

OEM

↓

P550490



Result:



Base Code:

P550490



SKU:

EL8490



\---



\# NON-HOMOLOGATED HD PRODUCTS



If a HD product cannot be matched to Donaldson:



MANN

↓

OEM

↓

No Donaldson Found



Status:



MANUAL REVIEW REQUIRED



These products must never be imported automatically.



Output file:



mann\_hd\_review.csv



\---



\# IMPORT ORDER



Phase 1



MANN Processing



\- Count SKUs

\- Separate LD and HD

\- Generate LD SKUs

\- Resolve HD to Donaldson

\- Export exceptions



Phase 2



Import Clean MANN Catalog



Phase 3



Fleetguard Enrichment



\- Cross References

\- OEM Expansion

\- Validation



Phase 4



Catalog QA



\---



\# FINAL GOVERNANCE RULE



HD MASTER:

DONALDSON



LD MASTER:

MANN-FILTER



ENRICHMENT:

FLEETGUARD



Any process that violates this hierarchy must be rejected.



END OF DOCUMENT

