# Evidence Requirements
## Engineering Decision Engine — Domain-Specific Minimum Evidence Thresholds
### Version 1.0 | Ratified: 2026-07-01 | Status: FROZEN

---

## Document Control

| Field | Value |
|---|---|
| Document | EVIDENCE_REQUIREMENTS |
| Version | 1.0 |
| Status | FROZEN — Governing Architecture |
| Ratified | 2026-07-01 |
| Authority | Subordinate to ENGINEERING_DECISION_ENGINE v1.0 |
| Scope | Minimum evidence thresholds for each contamination domain and intent class |

---

## Purpose

Step 3 of the Engineering Decision Engine evaluates whether available evidence meets a minimum threshold for the domain. The threshold is not universal — different domains have different evidence requirements because the consequences of inadequate evidence differ.

This document defines:
1. Minimum evidence thresholds per domain (what must be PRESENT for the evaluation to proceed)
2. Minimum evidence floors per domain (what must be PRESENT to avoid a FAIL)
3. Intent-class modifiers (what additional evidence is required by intent type)

The thresholds defined here are engineering minimums, not aspirations. Meeting the minimum allows the evaluation to continue. It does not guarantee HIGH confidence.

---

## Domain 1 — Air Intake Filtration

### Why this domain has specific requirements

Air intake contamination causes irreversible abrasive wear to engine internals. A single ingestion event of sufficient particle concentration can cause premature engine failure. Evidence requirements reflect this irreversibility.

### Minimum Threshold (PASS to proceed)

| Category | Minimum Required State |
|---|---|
| 1 — Engineering Principles | PRESENT — abrasive wear mechanism and Mohs hardness relationship must be documented |
| 4 — Applicable Standards | PRESENT — at minimum ISO 5011 or SAE J1539 with filtration efficiency methodology |
| 5 — Failure Modes | PRESENT — at minimum dust ingestion → abrasive wear → bore wear → power loss chain |
| 6 — Contamination Data | PARTIAL — particle type (mineral/organic) must be determinable |
| 8 — Operating Conditions | PARTIAL — equipment type and application must be known |

### Minimum Floor (FAIL if below)

All five categories in the threshold table must be at minimum PARTIAL. If any is ABSENT, the evaluation fails Step 3.

### Intent-Class Modifiers

**FAILURE_DIAGNOSIS:** Category 10 (Symptom Correlation) must also be at minimum PARTIAL. Symptoms must correlate to at least one of: power loss, increased oil consumption, elevated wear metals in oil analysis.

**EQUIPMENT_REPLACEMENT:** Category 9 (Equipment Mapping) must be at minimum INFERABLE. Without knowing what equipment is being protected, a replacement recommendation cannot be formed.

**PROACTIVE_PROTECTION:** Category 8 must be KNOWN (not just PARTIAL). Operating environment (ambient dust concentration, application type) is required to specify protection level.

### Common Evidence Gaps in This Domain

- Operating environment dust concentration (often not provided by customer)
- Duty cycle and service interval history
- Previous filter inspection data (bypass events, media saturation patterns)

---

## Domain 2 — Fuel Filtration (Diesel and HPCR)

### Why this domain has specific requirements

High-pressure common-rail injection systems operate at clearances of 1–3µm. Contamination at this precision level causes injector wear, stiction, and failure at contamination levels that would have no effect in older low-pressure systems. The evidence threshold reflects the tight tolerance sensitivity of modern fuel systems.

### Minimum Threshold (PASS to proceed)

| Category | Minimum Required State |
|---|---|
| 1 — Engineering Principles | PRESENT — particle size vs. clearance relationship for HPCR injectors |
| 4 — Applicable Standards | PRESENT — at minimum ASTM D6304 (water content) or ISO 12937 with measurement methodology |
| 5 — Failure Modes | PRESENT — at minimum one documented failure mode: injector stiction, injector erosion, or microbial fouling |
| 6 — Contamination Data | PRESENT — contamination type must be specified: water, particulate, or biological. Recommendations differ completely by type. |
| 8 — Operating Conditions | PARTIAL — fuel system type (HPCR vs. conventional injection) must be determinable |

### Minimum Floor (FAIL if below)

Category 6 (Contamination Data) must be at minimum PARTIAL. A fuel contamination recommendation cannot be formed without knowing whether the primary contaminant is water, particles, or biological growth. If the contamination type cannot be determined from available evidence, Step 3 fails.

### Intent-Class Modifiers

**FAILURE_DIAGNOSIS:** Category 6 must be PRESENT (not just PARTIAL). Without knowing the contamination type, failure diagnosis is not possible. Generate targeted questions to determine contamination type before proceeding.

**PROACTIVE_PROTECTION:** Category 4 must include ASTM D6304 water content threshold or ISO 12937 equivalent. Proactive fuel protection cannot be specified without a measurable cleanliness target.

### Common Evidence Gaps in This Domain

- Fuel source quality and storage conditions
- Tank condition (corrosion, contamination history)
- Operating temperature range (affects water solubility and microbial growth rate)
- Injection system pressure specification

---

## Domain 3 — Hydraulic Systems

### Why this domain has specific requirements

Hydraulic proportional and servo valves are among the most contamination-sensitive components in industrial equipment. Clearances of 1–5µm make them vulnerable to particles that pass undetected in other systems. Failures are often not predicted from external symptoms until significant internal damage has occurred.

### Minimum Threshold (PASS to proceed)

| Category | Minimum Required State |
|---|---|
| 1 — Engineering Principles | PRESENT — particle wear mechanism in hydraulic clearances, ISO 4406 code interpretation |
| 4 — Applicable Standards | PRESENT — ISO 4406 cleanliness code framework and ISO 16889 Beta ratio methodology |
| 5 — Failure Modes | PRESENT — at minimum one documented failure mode for the identified component type |
| 6 — Contamination Data | PARTIAL — at minimum particle size range determinable from component type |
| 8 — Operating Conditions | PARTIAL — system pressure and circuit type must be determinable |

### Minimum Floor (FAIL if below)

Category 4 (ISO 4406 + ISO 16889) must be at minimum PRESENT. A hydraulic cleanliness recommendation without measurable ISO codes is not an engineering recommendation — it is a product suggestion. If standards coverage is absent, the evaluation fails Step 3.

### Intent-Class Modifiers

**FAILURE_DIAGNOSIS:** Category 9 (Equipment Mapping) must be at minimum INFERABLE. The hydraulic component type (proportional valve, servo valve, piston pump, gear pump) determines the applicable cleanliness target. Without component identification, the ISO code target cannot be determined.

**PROACTIVE_PROTECTION:** ISO 4406 target cleanliness code must be determinable from equipment type and operating pressure. If neither is known, generate targeted questions before proceeding.

### Common Evidence Gaps in This Domain

- Component type specificity (proportional valve vs. gear pump have very different cleanliness targets)
- System contamination baseline (what is the current ISO code?)
- Reservoir design and breather condition
- Commissioning flushing protocol compliance

---

## Domain 4 — Lube Oil / Engine Oil

### Why this domain has specific requirements

Engine lube oil systems protect bearing surfaces with clearances of 5–25µm. The failure progression from contamination to bearing seizure can take thousands of operating hours, making monitoring critical. Evidence requirements reflect the need for accurate failure mode sequencing.

### Minimum Threshold (PASS to proceed)

| Category | Minimum Required State |
|---|---|
| 1 — Engineering Principles | PRESENT — abrasive wear in bearing clearances, particle size vs. clearance relationship |
| 4 — Applicable Standards | PRESENT — ISO 4406 for particle count interpretation or SAE J1211 for crankcase ventilation |
| 5 — Failure Modes | PRESENT — at minimum: particle accumulation → bearing clearance wear → bearing failure chain |
| 6 — Contamination Data | PARTIAL — contamination type must be determinable: wear particles, soot, or external ingestion |
| 8 — Operating Conditions | PARTIAL — engine type and application must be known |

### Minimum Floor (FAIL if below)

Category 5 (Failure Modes) and Category 1 (Engineering Principles) must both be at minimum PARTIAL. A lube oil recommendation without documented failure mode progression is a product suggestion, not an engineering recommendation.

### Intent-Class Modifiers

**FAILURE_DIAGNOSIS:** Oil analysis data is strongly preferred. If Category 7 (Engineering Memory) includes oil analysis data showing elevated iron, silicon, or chromium content, correlation to specific failure modes is significantly strengthened. Without oil analysis data, diagnosis proceeds at MEDIUM confidence maximum.

**PROACTIVE_PROTECTION:** Engine manufacturer specification for oil cleanliness target must be incorporated where available. Some OEMs specify tighter targets than generic ISO code guidelines.

### Common Evidence Gaps in This Domain

- Oil analysis history
- Crankcase ventilation system condition
- Previous drain interval documentation
- Engine age and accumulated hours

---

## Domain 5 — Cabin Air / Operator Safety

### Why this domain has specific requirements

Cabin air filtration protects human operators, not machines. The failure consequences are occupational health impacts including respiratory disease, neurological effects from chemical exposure, and reduced cognitive performance. Evidence requirements must meet occupational safety standards, not just equipment reliability standards.

### Minimum Threshold (PASS to proceed)

| Category | Minimum Required State |
|---|---|
| 1 — Engineering Principles | PRESENT — particle penetration mechanisms for respiratory exposure (PM10, PM2.5) |
| 4 — Applicable Standards | PRESENT — ISO 11155 or DIN 71220 with operator protection methodology |
| 5 — Failure Modes | PRESENT — at minimum one documented exposure pathway: PM10 inhalation, VOC exposure, or chemical exposure |
| 6 — Contamination Data | PARTIAL — operating environment must be characterizable: mineral dust, agricultural dust, chemical, or urban |
| 8 — Operating Conditions | KNOWN — application and operating environment are required, not optional |

### Minimum Floor (FAIL if below)

Category 8 (Operating Conditions) must be KNOWN for cabin safety. A cabin air recommendation cannot be formed without the operating environment. If the customer has not provided the operating environment, generate targeted questions before any other Step 3 evaluation. This is mandatory.

Category 4 must reference ISO 11155 or DIN 71220. Cabin air is an occupational health domain. Recommendations without applicable safety standards are not engineering recommendations.

### Intent-Class Modifiers

This domain has no intent-class exceptions. The minimum floor applies to all intent classes because operator health protection is non-negotiable regardless of the type of request.

### Common Evidence Gaps in This Domain

- Specific chemical or biological contaminant types (not just "dusty environment")
- Operator time in cab vs. outside cab (relevant for cumulative exposure calculation)
- Existing ventilation system pressurization (positive vs. neutral pressure cab)
- Local regulatory requirements for occupational dust exposure (may vary by jurisdiction)

---

## Domain 6 — Compressed Air Systems

### Why this domain has specific requirements

Compressed air is used directly in product contact applications (food, pharmaceuticals, electronics) and in precision pneumatic tools. Contamination targets depend entirely on the end-use application. Evidence requirements are higher because the same air purity class serves very different risk profiles.

### Minimum Threshold (PASS to proceed)

| Category | Minimum Required State |
|---|---|
| 1 — Engineering Principles | PRESENT — pressure dew point and oil carryover mechanisms |
| 4 — Applicable Standards | PRESENT — ISO 8573-1 purity class framework with applicable class number |
| 5 — Failure Modes | PRESENT — at minimum one failure mode applicable to the identified end-use |
| 6 — Contamination Data | PRESENT (not PARTIAL) — contamination type must be identified: moisture, oil aerosol, solid particle, or combination |
| 8 — Operating Conditions | KNOWN — end-use application is required; purity class cannot be selected without it |

### Minimum Floor (FAIL if below)

Both Category 6 and Category 8 must be at minimum PARTIAL. Compressed air system recommendations without knowing the contamination target AND the end-use application are not evaluable. The ISO 8573-1 purity class is a function of both. If either is unknown, Step 3 fails, and targeted questions are generated.

### Intent-Class Modifiers

**PROACTIVE_PROTECTION:** ISO 8573-1 purity class must be determinable from evidence. If the end-use application maps to ISO Class 1 (instrument air, food contact), the evidence requirements for confirming protection media performance are higher than for ISO Class 5 (general workshop air).

### Common Evidence Gaps in This Domain

- End-use application specificity (often described as "air tools" without specifying product contact vs. mechanical use)
- Inlet air quality (ambient contamination affects the treatment required)
- Compressor type and oil specification (oil-injected vs. oil-free affects downstream contamination baseline)
- Operating pressure and temperature (affects dew point and purity class achievability)

---

## Cross-Domain Evidence Requirements

Some requests span multiple domains. When a customer's intent involves more than one domain (e.g., a fuel system with both water contamination and particulate contamination, or a hydraulic system that also serves as a transmission):

**Rule:** Apply the evidence requirements for the more demanding domain. Do not average the requirements.

**Example:** A marine hydraulic system that also uses diesel fuel for propulsion requires satisfying both Domain 2 (Fuel) and Domain 3 (Hydraulic) minimum thresholds before proceeding.

---

## Evidence Floor Summary Table

| Domain | Non-Negotiable Categories (FAIL if ABSENT) |
|---|---|
| Air Intake | Engineering Principles (1), Failure Modes (5) |
| Fuel | Contamination Data (6) — contamination type must be identified |
| Hydraulic | Applicable Standards (4) — ISO 4406 + ISO 16889 must be present |
| Lube Oil | Engineering Principles (1), Failure Modes (5) |
| Cabin Air | Operating Conditions (8) — KNOWN required, not PARTIAL |
| Compressed Air | Contamination Data (6), Operating Conditions (8) — both required |

---

## Citation Reference

```
CANONICAL GOVERNANCE BLOCK: Evidence Requirements

DOCUMENT
Evidence Requirements v1.0

PURPOSE
Defines the minimum evidence thresholds for each contamination domain
required to pass Step 3 (Evidence Availability) of the Engineering
Decision Engine evaluation sequence.

DOMAINS COVERED
1. Air Intake Filtration
2. Fuel Filtration (Diesel and HPCR)
3. Hydraulic Systems
4. Lube Oil / Engine Oil
5. Cabin Air / Operator Safety
6. Compressed Air Systems

EVIDENCE FLOOR RULE
The minimum floor is the set of evidence categories whose absence
causes a FAIL in Step 3 regardless of all other evidence present.
The floor is different for each domain. Meeting the floor does not
guarantee HIGH confidence — it guarantees the evaluation can proceed.

CITATION_REFERENCE
source: elimfilters-vault/decision-engine/EVIDENCE_REQUIREMENTS.md
document: Evidence Requirements
version: 1.0
ratified: 2026-07-01
status: FROZEN
```
