# ELIMFILTERS Diagnostic Knowledge Standard

**Version:** 1.0  
**Status:** Draft Standard  
**Owner:** ELIMFILTERS Engineering

## 1. Purpose

This standard defines the mandatory structure, evidence requirements, reasoning boundaries, approval workflow, and production behavior for every ELIMFILTERS diagnostic case.

A diagnostic case is not a product article. It is a structured engineering object used to convert field symptoms and operating evidence into an asset-protection assessment.

## 2. Coverage Model

Diagnostic coverage shall be developed by distinct filter type or protection component because construction, operating mechanism, application, failure modes, users, and asset owners differ.

Initial target: **50–100 approved diagnostic cases per distinct filter type or protection component**.

Coverage includes, at minimum:

- Air filters: primary, secondary, radial, axial, safety elements.
- Cabin air filters.
- Air dryers and related protection components.
- Fuel filters.
- Fuel/water separators.
- Turbine-style fuel filtration systems.
- Lube and oil filters.
- Hydraulic filters: suction, pressure, return, pilot, offline, breathers.
- Coolant filters.
- Housings, bowls, heads, valves, sensors, drains, and restriction devices where diagnostically relevant.

Cases must also be tagged by industry, application, user profile, owner profile, duty cycle, environment, and asset class.

## 3. Required Diagnostic Object

Every case shall contain:

```yaml
id: DIAG-<SYSTEM>-<TYPE>-<NUMBER>
title: <field symptom or condition>
status: research | draft | technical_review | approved | retired
version: 1.0
protection_system: <approved ELIMFILTERS system>
filter_type: <specific type>
asset_classes: []
industries: []
applications: []
user_profiles: []
owner_profiles: []
initial_triggers: []
minimum_evidence: []
questions: []
hypotheses: []
risks: []
actions:
  immediate: []
  corrective: []
  preventive: []
stop_conditions: []
escalation_conditions: []
prohibited_conclusions: []
source_ids: []
approved_by: null
approved_at: null
review_due: null
```

## 4. Symptom-First Design

Cases shall begin with what a customer, operator, technician, manager, buyer, or owner can observe.

Valid triggers include:

- Loss of power.
- Repeated restriction.
- Water in a separator bowl.
- Gelatinous deposits.
- Premature filter replacement.
- Dust downstream of an air filter.
- Hydraulic overheating.
- Foaming or aeration.
- Coolant contamination.
- Abnormal pressure differential.

A customer is not required to identify the failed system or filter type.

## 5. Evidence Requirements

Each question must have a defined engineering purpose. Questions that do not change a hypothesis, risk assessment, recommendation, or escalation decision are prohibited.

Evidence shall be classified as:

- Observed directly.
- Measured.
- Documented officially.
- Field verified.
- Customer reported.
- Inferred.
- Unknown.

The case shall define the minimum evidence required before issuing:

- A general assessment.
- A probable cause.
- A specific corrective action.
- A product or configuration recommendation.

## 6. Hypothesis Structure

Each hypothesis shall include:

```yaml
- id: H1
  statement: <probable mechanism or cause>
  supporting_evidence: []
  contradicting_evidence: []
  required_confirmation: []
  confidence_rule: low | medium | high
  affected_components: []
  consequences: []
```

The assistant shall not present a hypothesis as confirmed unless the case defines sufficient confirming evidence.

## 7. Stop Rule

The assistant must stop asking diagnostic questions when the available evidence is sufficient to:

- Identify the dominant risk.
- Provide safe immediate actions.
- Explain the most probable mechanism with an appropriate confidence statement.
- Determine whether escalation is required.

Additional questions are permitted only when they materially alter the action or safety decision.

## 8. Recommendation Boundaries

Recommendations shall be separated into:

### Immediate actions

Actions intended to reduce immediate risk or prevent further damage.

### Corrective actions

Actions intended to remove the cause or restore system condition.

### Preventive actions

Actions intended to reduce recurrence through maintenance, monitoring, storage, installation, operating practice, or system design.

A filter replacement alone shall not be presented as a complete corrective action when contamination or system condition remains unresolved.

## 9. Equipment-Specific Dependency

Every case shall identify which recommendations require verified equipment or product data.

Without verified data, the assistant shall not provide exact:

- Part numbers.
- Capacities.
- Pressures.
- Flow rates.
- Torques.
- Service intervals.
- Restriction limits.
- Compatibility claims.

## 10. Escalation

Escalation is mandatory when:

- Evidence is contradictory.
- Safety may be affected.
- The asset cannot be identified sufficiently.
- Required technical limits are unknown.
- Damage may extend beyond the protection system.
- The problem persists after approved corrective actions.
- The case lacks approved coverage.

## 11. Source and Approval Rules

Research sources may support case creation, but production assistants may use only the approved ELIMFILTERS case.

Every approved case must have:

- Traceable source records.
- Technical review.
- Approval identity and date.
- Version history.
- Review date.

## 12. Prohibited Behavior

Diagnostic cases shall not:

- Operate as product lookup pages.
- Copy external manufacturer language.
- Promote competitor brands.
- Convert assumptions into facts.
- Use unsupported performance claims.
- Recommend a product before establishing technical need.
- continue interrogation after the stop rule has been met.
