# ELIMFILTERS Knowledge Center
## Technical Knowledge Architecture Specification

**Version:** 1.0  
**Status:** Master Standard  
**Owner:** ELIMFILTERS Engineering  
**Repository role:** Canonical technical knowledge source

---

## 1. Purpose

The ELIMFILTERS Knowledge Center is the official engineering knowledge repository used to support asset-protection decisions.

Its purpose is not merely to store documents. Its purpose is to organize validated engineering knowledge so it can be consumed consistently by:

- Engineers
- Technical specialists
- AI assistants
- Distributor platforms
- Internal applications
- Future engineering tools

The Knowledge Center is the single source of truth for approved ELIMFILTERS technical knowledge.

## 2. Mission

Transform technical information into structured engineering knowledge that enables accurate diagnostics, reliable recommendations, and consistent asset-protection decisions.

## 3. Core philosophy

ELIMFILTERS does not sell filters. ELIMFILTERS designs Asset Protection Systems.

Every knowledge object in this repository must contribute to one or more of the following objectives:

- Protect equipment and critical assets.
- Reduce contamination.
- Reduce failures.
- Increase reliability.
- Improve maintenance decisions.
- Extend component life.
- Reduce downtime.

If a knowledge object does not contribute to these objectives, it does not belong in the Knowledge Center.

## 4. Engineering principles

Every technical statement must be supported by at least one of the following:

- Scientific evidence
- Engineering validation
- Official documentation
- Experimental verification
- Operational evidence
- Approval by ELIMFILTERS Engineering

Marketing language is prohibited in technical knowledge objects.

Sales language is prohibited in technical knowledge objects.

Brand comparisons are prohibited unless explicitly approved for a defined engineering purpose.

Unknown information must remain unknown. Missing information must never be fabricated.

## 5. Knowledge domains

### 5.1 Engineering Knowledge

Scientific and engineering principles, including:

- Filtration science
- Fluid dynamics
- Contamination control
- Failure mechanisms
- Lubrication engineering
- Hydraulic engineering
- Fuel-system engineering
- Cooling-system engineering
- Airflow engineering
- Maintenance engineering
- Standards and calculations

### 5.2 Diagnostic Knowledge

Structured diagnostic cases organized by Asset Protection System.

Each diagnostic case must contain, at minimum:

- Initial symptom or condition
- Applicable assets, users, owners, and operating contexts
- Required evidence
- Minimum evidence threshold
- Technical reasoning
- Probable causes
- Evidence that strengthens or weakens each cause
- Confidence level
- Risks to the asset
- Immediate actions
- Corrective actions
- Preventive actions
- Stop-questioning criteria
- Escalation rules
- Related engineering knowledge
- Related product and asset records, when applicable

The initial coverage objective is 50 to 100 diagnostic cases for each distinct filter type or protection component, because construction, function, application, operating environment, user profile, and asset ownership differ materially.

Diagnostic cases must be organized under the applicable Asset Protection System while preserving the distinct technical behavior of each filter type or component.

### 5.3 Asset Technical Records

Technical records describing equipment, machines, engines, vehicles, systems, and critical assets.

Examples include:

- Engines
- Compressors
- Excavators
- Trucks
- Marine engines
- Generators
- Hydraulic systems
- Industrial machinery

Each technical field must carry its own provenance, evidence state, and confidence level. An entire asset record must never be treated as fully verified merely because some fields are verified.

### 5.4 Product Technical Records

Official ELIMFILTERS product knowledge, including:

- Specifications
- Construction
- Performance characteristics
- Applications
- Technologies
- Cross references
- Service considerations
- Compatibility evidence
- Product limitations

### 5.5 Source Library

Reference material used during research and validation, including:

- OEM manuals
- Service manuals
- Technical data sheets
- Technical papers
- Standards
- Engineering publications
- Technical bulletins
- Field photographs
- Maintenance records
- Customer-provided documentation

Source documents are evidence inputs. They are not automatically Approved Knowledge and are not exposed directly to customers by the technical assistant.

### 5.6 Approved Knowledge

Only reviewed and validated knowledge becomes Approved Knowledge.

Production AI assistants may use only Approved Knowledge for technical claims, diagnostics, recommendations, specifications, limits, intervals, compatibility, and product selection.

## 6. Evidence and confidence model

Every technical field or claim must declare one evidence state:

### `OFFICIAL_VERIFIED`

Extracted from authoritative official documentation and traceable to the exact source location.

### `ELIMFILTERS_VALIDATED`

Reviewed and approved by ELIMFILTERS Engineering.

### `FIELD_VERIFIED`

Confirmed through adequate field evidence, inspection, measurement, photographs, or service records.

### `CUSTOMER_REPORTED`

Provided by the customer or operator but not independently verified.

### `INFERRED`

An engineering inference supported by available evidence but not directly confirmed.

### `PENDING_VERIFICATION`

A candidate value or claim awaiting confirmation.

### `UNKNOWN`

No reliable information is available.

Confidence must be assigned field by field. Evidence state and confidence are related but not interchangeable.

## 7. Equipment and product documentation policy

### 7.1 Complete official documentation

When complete official documentation is available, the record may contain verified specifications, configurations, capacities, limits, intervals, and part relationships. Each field must retain source traceability.

### 7.2 Partial official documentation

When documentation is incomplete, only supported fields may be marked verified. Unsupported fields remain unknown, inferred, or pending verification.

### 7.3 No official technical sheet available

A provisional record must be created from available evidence, which may include:

- Nameplate photographs
- Serial numbers or VINs
- Equipment and engine photographs
- Installed filter photographs
- Visible labels
- Customer manuals
- Parts catalogs
- Work orders
- Maintenance history
- Distributor information
- Field inspection
- Operator or technician statements

Each field must identify whether it was observed, reported, inferred, or remains unknown.

### 7.4 Unidentified asset

The assistant may begin a general diagnostic process using a minimum asset identity:

- Equipment type
- Application
- Operating environment
- Fuel or fluid type
- Usage pattern
- Reported symptom
- Visible system configuration
- Available photographs

Until the asset is sufficiently identified, the assistant must not assert exact capacities, pressures, torques, service intervals, part numbers, or compatibility.

## 8. AI operating principles

The technical assistant must never:

- Invent technical information.
- Guess specifications.
- Present assumptions as facts.
- Cite or depend on live external websites during customer conversations.
- Recommend a product without sufficient technical and compatibility evidence.
- Continue asking questions after the minimum evidence threshold has been reached.

The technical assistant must:

- Reason from approved evidence.
- Identify the customer’s actual operating problem rather than behave as a catalog.
- Ask only the minimum necessary questions.
- Stop asking questions when sufficient evidence exists.
- Distinguish facts, observations, reports, and inferences.
- Explain the technical assessment clearly.
- Prioritize protection of the customer’s asset.
- Escalate when the evidence is insufficient, contradictory, safety-critical, or outside approved knowledge.

## 9. External research policy

External research is permitted only during knowledge creation, maintenance, and validation.

Research may use:

- Official manufacturer documentation
- Technical standards
- Government and regulatory publications
- Scientific literature
- University and recognized engineering publications
- OEM service manuals and bulletins
- Manufacturer technical publications as supporting evidence

External research must:

- Record the source title, publisher, URL or document identifier, publication date when available, access date, and exact section or page.
- Separate direct evidence from inference.
- Identify contradictions between sources.
- Avoid copying protected text beyond what is necessary for internal evidence notes.
- Remove commercial language, brand bias, and unsupported claims from derived ELIMFILTERS knowledge.
- Use multiple independent sources for critical claims when reasonably available.

External research does not become production knowledge automatically.

## 10. Knowledge approval workflow

```text
External or internal evidence
        ↓
Research record
        ↓
Engineering draft
        ↓
Technical review
        ↓
ELIMFILTERS validation
        ↓
Approved Knowledge
        ↓
Production indexing and consumption
```

Only Approved Knowledge is available to production AI assistants.

Research notes, unresolved contradictions, and unapproved drafts must remain outside production retrieval indexes.

## 11. Knowledge objects

The Knowledge Center stores structured knowledge objects, including:

- Diagnostic Case
- Engineering Principle
- Asset Technical Record
- Product Technical Record
- Source Record
- Standard
- Failure Mechanism
- Contamination Mechanism
- Maintenance Procedure
- Engineering Calculation
- Technical Glossary Entry
- Field Evidence Record

Each object type must follow its own schema and validation standard.

## 12. Required record separation

The repository must preserve a clear separation between:

```text
research/
  Sources, evidence, notes, contradictions, and unapproved drafts

approved/
  Reviewed knowledge authorized for production use
```

A production retrieval process must never index `research/` as approved technical truth.

## 13. Technical integrity rules

- Accuracy takes precedence over completeness.
- Unknown values remain unknown.
- No empty field may be completed by assumption merely to make a record appear complete.
- Verification is performed field by field.
- Every critical claim must be traceable.
- Contradictory evidence must be retained and resolved explicitly.
- Recommendations must state their required evidence and limits of applicability.
- Safety-critical uncertainty requires escalation.

## 14. Governance

ELIMFILTERS Engineering owns this standard and the approval status of technical knowledge.

Changes to evidence states, approval rules, diagnostic schemas, asset schemas, product schemas, source policy, or production-consumption rules require explicit review.

Downstream applications and repositories may reference this standard but must not create an independent competing technical source of truth.

## 15. Planned companion standards

This master standard will be extended through dedicated documents:

- `DIAGNOSTIC_STANDARD.md`
- `ASSET_STANDARD.md`
- `PRODUCT_STANDARD.md`
- `SOURCE_POLICY.md`
- `VALIDATION_RULES.md`
- `FIELD_EVIDENCE_STANDARD.md`
- `AI_CONSUMPTION_POLICY.md`

## 16. Long-term vision

The ELIMFILTERS Knowledge Center is the engineering intelligence core for every current and future ELIMFILTERS platform.

Its purpose is to preserve engineering knowledge, standardize technical reasoning, support reliable diagnostics, document assets and products under incomplete-information conditions, and enable consistent Asset Protection decisions worldwide.
