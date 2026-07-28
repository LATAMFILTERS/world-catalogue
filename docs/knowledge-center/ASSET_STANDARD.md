# ELIMFILTERS Asset Technical Record Standard

**Version:** 1.0  
**Status:** Draft Standard  
**Owner:** ELIMFILTERS Engineering

## 1. Purpose

This standard defines how ELIMFILTERS documents equipment, engines, machines, vehicles, vessels, generators, compressors, and other protected assets.

An Asset Technical Record shall exist even when official documentation is incomplete or unavailable.

## 2. Field-Level Verification

Verification applies to each field independently. A record shall never be treated as completely verified merely because one identifier or subsystem is confirmed.

Every field must include:

```yaml
value: null
status: OFFICIAL_VERIFIED | ELIMFILTERS_VALIDATED | FIELD_VERIFIED | CUSTOMER_REPORTED | INFERRED | PENDING_VERIFICATION | UNKNOWN
source_ids: []
observed_at: null
notes: null
```

## 3. Record States

- `OFFICIAL_DOCUMENTATION_COMPLETE`
- `OFFICIAL_DOCUMENTATION_PARTIAL`
- `FIELD_DOCUMENTED_UNVERIFIED`
- `UNIDENTIFIED_ASSET`
- `RETIRED`

These record states summarize the record only. They do not replace field-level evidence status.

## 4. Minimum Asset Schema

```yaml
asset_id: ASSET-<NUMBER>
record_status: <state>
asset_type: {}
manufacturer: {}
model: {}
variant: {}
year_or_range: {}
serial_number: {}
vin_or_equivalent: {}
owner_asset_number: {}
industry: {}
application: {}
duty_cycle: {}
operating_environment: {}
location: {}
engine: {}
powertrain: {}
air_intake_system: {}
fuel_system: {}
lube_system: {}
hydraulic_system: {}
cooling_system: {}
compressed_air_system: {}
installed_filters: []
fluids: []
capacities: []
service_intervals: []
technical_limits: []
maintenance_history: []
failure_history: []
field_evidence: []
source_documents: []
open_questions: []
last_reviewed_at: null
```

## 5. Evidence Sources

Permitted evidence includes:

- Official manuals and technical sheets.
- Manufacturer parts catalogs.
- Nameplates and serial plates.
- Photographs and videos.
- Installed component labels.
- Customer-supplied documents.
- Work orders and maintenance records.
- Fluid analysis and inspection reports.
- Direct field inspection.
- Operator and technician statements.

Customer statements must remain `CUSTOMER_REPORTED` until independently verified.

## 6. Undocumented Assets

When official documentation is unavailable:

1. Create a provisional record.
2. Capture the minimum identity available.
3. Document visible systems and components.
4. Store photos and plate evidence.
5. Record customer statements separately.
6. Mark inferred configurations explicitly.
7. Preserve unknown fields as unknown.
8. Research official and corroborating sources.
9. Resolve variant conflicts before approval.

## 7. Unidentified Assets

An unidentified asset may still enter general diagnosis. The minimum useful identity is:

- Equipment class.
- Application.
- Fuel or fluid type.
- Operating environment.
- Duty cycle.
- Observable symptom.
- Visible protection components.

Until identity is sufficient, exact specifications and compatibility decisions are prohibited.

## 8. Variant Control

Models may differ by year, market, engine, emissions package, serial break, duty rating, and factory option. Each variant must be represented explicitly.

A specification from one variant shall not be inherited by another without evidence.

## 9. Production Use

Before a specific recommendation, the assistant must determine whether the required asset fields are sufficiently verified.

When data is incomplete, it shall:

- State the limitation.
- Request only evidence that changes the decision.
- Provide general safe guidance where appropriate.
- Avoid exact technical values.

## 10. Review and Change History

Every record must retain:

- Created date.
- Last reviewed date.
- Reviewer.
- Changed fields.
- Previous values.
- Source changes.
- Reason for revision.
