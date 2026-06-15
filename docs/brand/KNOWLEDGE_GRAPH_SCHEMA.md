# KNOWLEDGE_GRAPH_SCHEMA

## Core Entities

### TECHNOLOGIES

Examples:

- MACROCORE
- SYNTEPORE
- SYNTRAX
- NANOFORCE
- HYDROCORE
- THERMACORE
- MICROKAPPA
- DRYCORE
- INTEKCORE

---

### SYSTEMS

Examples:

- Air Intake
- Fuel Cleanliness
- Lubrication
- Hydraulic
- Cooling

---

### PRODUCTS

Examples:

- Air Filters
- Fuel Filters
- Lube Filters
- Hydraulic Filters
- Coolant Filters

---

### INDUSTRIES

Examples:

- Mining
- Agriculture
- Construction
- Oil & Gas
- Manufacturing
- Power Generation
- Railway
- Marine
- Waste Municipal

---

### PROBLEMS

Examples:

- Particle Wear
- Water Contamination
- Varnish Formation
- Air Restriction
- Injector Damage
- Pump Failure

---

### ASSETS

Examples:

- Excavator
- Generator
- Truck
- Marine Engine
- Hydraulic System
- Compressor

---

### STANDARDS

Examples:

- ISO 16889
- ISO 4406
- ISO 5011
- SAE J1858

---

## Relationships

TECHNOLOGY ? PROTECTS ? SYSTEM

SYSTEM ? CONTAINS ? PRODUCT

PRODUCT ? MITIGATES ? PROBLEM

PROBLEM ? DAMAGES ? ASSET

INDUSTRY ? USES ? ASSET

ASSET ? OPERATES_IN ? INDUSTRY

PRODUCT ? USES ? TECHNOLOGY

STANDARD ? VALIDATES ? PRODUCT

STANDARD ? VALIDATES ? TECHNOLOGY

OEM ? MANUFACTURES ? ASSET

PRODUCT ? REPLACES ? OEM_REFERENCE

---

# Strategic Objective

Every ELIMFILTERS recommendation must be explainable through graph relationships.
