# ELIMFILTERS Product Technical Record Standard

**Version:** 1.0  
**Status:** Draft Standard  
**Owner:** ELIMFILTERS Engineering

## 1. Purpose

This standard defines the mandatory technical record for every ELIMFILTERS product and protection component used by the Knowledge Center, applications, distributors, and AI assistants.

A Product Technical Record is an engineering record, not marketing copy.

## 2. Required Product Schema

```yaml
product_id: <ELIMFILTERS part number>
status: research | draft | technical_review | approved | obsolete
product_type: <specific type>
protection_system: <approved system>
technology: <approved ELIMFILTERS technology>
construction: {}
dimensions: []
interfaces: []
media: {}
performance: []
operating_limits: []
materials: []
features: []
applications: []
asset_links: []
cross_references: []
service_guidance: []
installation_requirements: []
inspection_points: []
failure_indicators: []
source_ids: []
field_evidence: []
approved_by: null
approved_at: null
review_due: null
```

## 3. Field Evidence

Every technical field must carry its own value, evidence status, source IDs, and notes. Missing values remain unknown.

Permitted states are:

- `OFFICIAL_VERIFIED`
- `ELIMFILTERS_VALIDATED`
- `FIELD_VERIFIED`
- `CUSTOMER_REPORTED`
- `INFERRED`
- `PENDING_VERIFICATION`
- `UNKNOWN`

## 4. Product Type Specificity

Records shall distinguish construction and use differences. Examples include:

- Primary versus secondary air filters.
- Radial versus axial seal.
- Full-flow versus bypass oil filtration.
- Fuel filter versus fuel/water separator.
- Suction, pressure, return, pilot, offline, and breather hydraulic filtration.
- Coolant filter with or without additive release.
- Cartridge, spin-on, element, housing, bowl, head, drain, valve, and sensor assemblies.

A generic filter template shall not erase type-specific fields.

## 5. Performance Claims

Performance values require traceable evidence and test context, including where applicable:

- Test standard.
- Particle or contaminant definition.
- Flow rate.
- Fluid or air properties.
- Pressure differential.
- Temperature.
- Efficiency definition.
- Capacity definition.
- Test date and report identity.

Unsupported claims such as universal efficiency, service-life extension, downtime reduction, or compatibility are prohibited.

## 6. Cross References

A cross reference means dimensional or application-related interchange evidence, not automatic equivalence.

Each cross reference must specify:

- Referenced brand and part number.
- Evidence source.
- Match basis.
- Known differences.
- Confidence status.
- Application or variant restrictions.

The assistant shall not claim full equivalence when only dimensions or thread specifications match.

## 7. Applications

Product applications shall link to Asset Technical Records or verified application records. Free-text application claims without evidence are not approved production knowledge.

Applications must account for:

- Model and variant.
- Year or serial range.
- Engine or system configuration.
- Market or region.
- Installation position.
- Primary, secondary, safety, or auxiliary role.

## 8. Service Guidance

Service guidance must separate:

- Inspection criteria.
- Replacement criteria.
- Condition-based limits.
- Official interval data.
- ELIMFILTERS validated practices.

Calendar or hour intervals shall not be invented when only condition-based guidance is available.

## 9. Approval Boundary

Only approved product records may be used for customer-facing:

- Specifications.
- Compatibility.
- Cross references.
- Product recommendations.
- Installation guidance.
- Operating limits.

Research and draft records remain internal.

## 10. Obsolescence

Obsolete products remain traceable. Records shall identify replacement status, supersession evidence, remaining restrictions, and effective date. A successor shall not inherit the predecessor's applications without verification.
