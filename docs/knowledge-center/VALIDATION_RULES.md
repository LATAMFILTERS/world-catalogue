# ELIMFILTERS Knowledge Validation Rules

**Version:** 1.0  
**Status:** Draft Standard  
**Owner:** ELIMFILTERS Engineering

## 1. Purpose

This standard defines the evidence states, review gates, approval criteria, expiration rules, and production eligibility for ELIMFILTERS technical knowledge.

## 2. Evidence States

### OFFICIAL_VERIFIED

Supported by official documentation applicable to the exact product, asset, model, variant, revision, or serial range.

### ELIMFILTERS_VALIDATED

Reviewed and approved by ELIMFILTERS Engineering using traceable evidence and documented reasoning.

### FIELD_VERIFIED

Confirmed through direct inspection, measurement, test, photograph, analysis, or service evidence.

### CUSTOMER_REPORTED

Reported by a customer, operator, technician, owner, or distributor but not independently verified.

### INFERRED

Derived through engineering reasoning from available evidence. The inference and its basis must be explicit.

### PENDING_VERIFICATION

Candidate information awaiting sufficient evidence or resolution of a contradiction.

### UNKNOWN

No reliable information is available.

## 3. Object Workflow States

```text
research
  ↓
draft
  ↓
technical_review
  ↓
approved
  ↓
production
```

Additional states:

- `rejected`
- `revision_required`
- `suspended`
- `retired`

No automated agent may assign `approved` or `production` status.

## 4. Mandatory Review Gates

A knowledge object may enter technical review only when it has:

- A unique identifier.
- Required schema fields.
- Claim-level source traceability.
- Explicit unknowns.
- Recorded contradictions.
- Scope and applicability limits.
- Version and change history.

A knowledge object may be approved only when:

- Critical claims are supported.
- Safety implications are addressed.
- Variant applicability is resolved.
- Recommendations are proportional to evidence.
- Unsupported marketing or sales claims are absent.
- External text has been rewritten into original ELIMFILTERS language.
- A named authorized reviewer approves it.

## 5. Field-Level Validation

Object approval does not make every field `OFFICIAL_VERIFIED`.

Approved objects may contain `UNKNOWN`, `CUSTOMER_REPORTED`, or `INFERRED` fields when those states are necessary and clearly represented. Production behavior must respect each field's status.

## 6. Production Eligibility

Production assistants may retrieve an object only when:

- Object status is `approved` or `production`.
- It is not suspended, retired, or beyond a mandatory review date.
- Required source links remain active or preserved.
- The requested use falls within the object's approved scope.

## 7. Confidence Communication

The assistant shall translate evidence into calibrated language:

- High confidence: evidence strongly supports the conclusion.
- Moderate confidence: evidence supports a probable conclusion but confirmation remains useful.
- Low confidence: evidence is limited or multiple explanations remain possible.

The assistant shall not expose internal status codes to customers unless operationally useful.

## 8. Safety-Critical Knowledge

Safety-critical claims require:

- Applicable primary evidence.
- Exact scope.
- Technical reviewer approval.
- Explicit escalation conditions.
- Review date.

An unresolved contradiction blocks production use of a safety-critical claim.

## 9. Review Frequency

Review timing shall be risk-based:

- Safety-critical or regulated content: at least annually or upon source revision.
- Product specifications and applications: upon product, supplier, or source change.
- Diagnostic cases: after material field evidence, recurring failures, or at least every two years.
- General engineering principles: upon standard revision or credible contradiction.

## 10. Automatic Review Triggers

Objects must be flagged when:

- A source is superseded or withdrawn.
- A linked product becomes obsolete.
- A linked asset variant changes.
- Field evidence contradicts the approved object.
- A diagnostic repeatedly produces unresolved outcomes.
- A technical limit changes.
- A reviewer identifies unsupported reasoning.

## 11. Change Control

Every approved revision must record:

```yaml
version: <semantic version>
changed_at: <timestamp>
changed_by: <identity>
reviewed_by: <identity>
change_summary: <text>
reason: <text>
affected_claims: []
source_changes: []
production_impact: <none | reindex | retrain | urgent_withdrawal>
```

## 12. Rejection Conditions

Knowledge shall be rejected or returned for revision when it:

- Fabricates or fills unknown data.
- Lacks traceable evidence for critical claims.
- Confuses correlation with causation.
- Generalizes one manufacturer or application to all systems.
- Ignores model or serial variants.
- Uses a product recommendation as a substitute for diagnosis.
- Contains unsupported performance, reliability, warranty, ROI, or service-life claims.
- Allows a customer-facing assistant to bypass approved knowledge.
