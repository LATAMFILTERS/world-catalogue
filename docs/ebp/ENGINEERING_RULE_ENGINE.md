# ENGINEERING RULE ENGINE — Engineering Compliance Validation (Phase 4)

**Status:** Normative reference — approved architecture, no implementation
authorized. See ADR-0038 in `DECISIONS.md`.
**Created:** 2026-07-13, before Phase 4 was authorized to begin.
**Depends on:** Phase 01 (Product Engineering Passport, `APPROVED / FROZEN
v1.0`), Phase 02 (Manufacturer Registry, `APPROVED / FROZEN v1.0`), Phase 03
(Manufacturer Intake Portal, `APPROVED / FROZEN v1.0`).
**Governs:** Phase 04 — Engineering Compliance Validation
(`phases/phase-04-validation-engine.md`). No Phase 4 code, migration, or
API may be written until this document exists and is referenced by that
phase's own spec approval.

## What This Document Is, and Is Not

This is **not** an API specification. It defines no endpoint, no request/
response shape, no route.

This is **not** a table specification. It defines no column, no migration,
no schema.

**This is the definition of the engine's behavior** — the rules the
Engineering Compliance Validation gate (Phase 4) executes when it compares
a Manufacturer Product Offer against a Product Engineering Passport. Every
future decision about Phase 4's data model, API, or code must derive from
this document, not the other way around. If Phase 4's eventual
implementation needs to deviate from something stated here, that deviation
is itself a decision requiring a new ADR that explicitly supersedes the
relevant section — the same discipline already applied to every frozen
phase in this platform.

The engine does not improvise rules at evaluation time. It executes rules
that were defined in advance, from a catalog (§8), each with a known
comparison type (§2), state model (§3), and severity (§4). Nothing about
"is this offer compliant" is decided ad hoc in application code.

## 1. Philosophy

These six terms are used precisely and never interchangeably throughout
Phase 4 and this document.

### Engineering Compliance

The technical fact of whether a Manufacturer's offered specification
matches what the Product Engineering Passport requires, evaluated
field-by-field via the Rule Catalog (§8). Engineering Compliance is
**never** a judgment call — it is the deterministic output of running the
applicable rules against a specific (Passport Version × Manufacturer ×
Offer ID × Offer Revision) combination, per `phase-04-validation-engine
.md`'s operating tuple (already fixed by ADR-0007/ADR-0008 in
`DECISIONS.md`). Engineering Compliance answers: *"Does this Offer's
specification satisfy this Passport's engineering requirements?"* — never
*"Should ELIMFILTERS use this Manufacturer?"* (that is Manufacturer
Selection, Phase 5) and never *"Is this Offer's packaging/commercial
proposal acceptable?"* (that is Offer Approval, Phase 3,
`ebp_manufacturer_offer_approvals`, per ADR-0008 — a separate gate this
document does not touch).

### Engineering Approval

The specific ELIMFILTERS-internal decision, made by a qualified engineer
(a `declared_actor` with an engineering-authorized role — the exact role
model is an open question, §"Open Questions"), that a given Compliance
result — including any `WARNING`s, `REQUIRES_REVIEW`s, or granted
Exceptions — is acceptable to proceed. Engineering Approval is the human
decision layered on top of the engine's mechanical output; the engine
never grants Engineering Approval itself, even when every rule reports
`PASS`. This mirrors the existing platform-wide principle that "no
Passport × Manufacturer × Manufacturer Offer combination reaches
Manufacturer Selection... without passing Engineering Compliance
Validation" (`PROJECT_MANIFESTO.md` §4.4) — the engine produces the
evidence; a person (or a rule explicitly configured to auto-approve, if
ever decided) makes the approval.

### Commercial Approval

**Not part of this document or Phase 4.** This is the existing Offer
Approval entity (Phase 3, `ebp_manufacturer_offer_approvals`, ADR-0008) —
ELIMFILTERS' decision on final approved packaging and
`elimfilters_approved_quantity`. Engineering Approval and Commercial
Approval are always two separate, independently recorded decisions on the
same Offer revision; neither implies the other. A rule engine finding that
an Offer is engineering-compliant says nothing about whether its packaging
proposal is commercially acceptable, and vice versa.

### Deviation

A specific, identified instance where an Offer's `offered_*`/`actual_*`
value does not match a Passport's `required_*` value for one rule. A
Deviation is always scoped to exactly one rule evaluation on one Offer
revision — it is a fact produced by the engine (a `FAIL` or `WARNING` Rule
Result, §3), not a decision. A Deviation may or may not be tolerable
depending on the rule's severity (§4) and whether an Exception (below) is
granted against it.

### Exception

A time-bound, explicitly approved, explicitly recorded decision to accept
a specific Deviation on a specific (Offer Revision × Rule) pair despite it
failing or warning. An Exception is never silent, never implicit, and
never inherited by a later Offer revision automatically (§5). Granting an
Exception does not change the underlying Rule Result (it stays `FAIL` or
`WARNING` as evaluated) — it changes what the **Compliance Summary** and
**Engineering Decision** are allowed to conclude despite that result.

### Conditional Approval

An Engineering Approval granted on the condition that a specific,
identified follow-up occurs (a bounded example: "approved for this
production run pending a corrective action report within 30 days";
another: the existing Phase 2 `CONDITIONAL` manufacturer-qualification
condition being satisfied). A Conditional Approval is not a lesser or
implicit form of Approval — it is a full Approval that carries an
explicit, tracked condition. Whether Conditional Approval requires its own
distinct state or is modeled as an ordinary Engineering Approval plus a
linked Exception/condition record is an open question (§"Open
Questions") — not decided by this document.

## 2. Comparison Types

Every rule in the Rule Catalog (§8) declares exactly one Comparison Type.
The engine's evaluator is a fixed, small set of comparison primitives —
new business need is expressed as a new Rule Catalog entry using an
existing Comparison Type, never as new bespoke comparison code, unless a
genuinely new type of comparison is required (in which case *that* is
itself a new ADR, not a silent addition).

### Exact Match

The offered value must be character-for-character (or normalized-
equivalent, e.g. case/whitespace) identical to the required value. No
partial credit.

```
Thread
  Required: 1"-12 UNF
  Offered:  1"-12 UNF
  → PASS

  Offered:  1"-12 UNF-2A
  → FAIL (does not exactly match; a Deviation, not a "close enough")
```
Typical fields: `thread_spec`, `gasket_material` (when a single fixed
material is required, as opposed to Enumeration below), `center_tube_spec`,
`end_caps_spec`.

### Numeric Tolerance

The offered numeric value must fall within `required_value ± tolerance`
(the tolerance may be expressed as an absolute value or a percentage —
the rule declares which).

```
Efficiency
  Required:  99%
  Tolerance: ±0.5%
  Offered:   98.8%
  → PASS (within [98.5%, 99.5%])

  Offered:   98.2%
  → FAIL (below 98.5%)
```
Typical field: `minimum_efficiency` (paired with
`efficiency_particle_size_basis`, which is contextual metadata describing
*how* the percentage was measured, not itself a separate numeric
comparison).

### Range

The offered value must fall within an inclusive `[min, max]` band, both
bounds explicit on the rule (as opposed to Minimum/Maximum below, which
have only one bound).

```
Operating Temperature
  Required range: -20°C to 120°C
  Offered:         -10°C to 135°C
  → this is actually two separate rule evaluations (Minimum and Maximum,
    below) in this platform's field model, since operating_temp_min_c and
    operating_temp_max_c are stored as two distinct Passport fields — Range
    as a single two-bound rule applies when a Passport field is itself
    modeled as one combined range, not split into two columns.
```

### Maximum

The offered value must be less than or equal to (or, per the rule's own
declaration, strictly less than) a single upper bound.

```
Collapse Pressure (offered must not be a weaker component than required)
  Required maximum operating pressure the housing must NOT collapse under: 120 kPa
  Offered collapse rating:  135 kPa
  → PASS (135 ≥ 120, offered component is stronger than required)
```
Typical fields: `collapse_pressure_kpa`, `burst_pressure_kpa` (both are
"must be at least this strong," which numerically reads as a Minimum on
the offered value even though the underlying engineering concept is a
maximum operating condition — the Rule Catalog entry, not the field name,
is authoritative on which comparison direction actually applies; this is
exactly the kind of ambiguity the Rule Catalog exists to resolve
explicitly, once, rather than leaving it to be re-interpreted per
evaluation).

### Minimum

The offered value must be greater than or equal to (or strictly greater
than, per the rule) a single lower bound.

```
Operating Temperature (maximum-rated)
  Required: 120°C minimum
  Offered:  135°C
  → PASS
```

### Enumeration

The offered value must be a member of a fixed, Passport-defined allow-list
of acceptable values. Unlike Exact Match, more than one value can be
acceptable.

```
Permitted seal material
  Allowed: NBR, FKM, Silicone
  Offered: FKM
  → PASS

  Offered: EPDM
  → FAIL (not in the allowed set — a Deviation, not an automatic exception
    just because it might be technically similar)
```
Typical field: `gasket_material` when the Passport records a set of
acceptable materials rather than one required material — the Passport's
own data (not the Rule Catalog) determines whether a given field is
Exact-Match or Enumeration for a given product; the Rule Catalog entry
must be written to read whichever shape the Passport actually stores.

### Pattern

The offered value must match a declared, versioned pattern (e.g. a
regular expression or a structured format rule) rather than an exact
string or a fixed set. Reserved for fields whose acceptable values are a
*shape*, not an enumerable list (e.g. a certificate number format, a batch
code format). No Phase 1 field currently requires this type; it is
defined here so a future Passport field can use it without inventing a
new Comparison Type ad hoc.

### Boolean

The offered value must match a required `true`/`false` (or
present/absent) state.

```
Anti-drainback valve present
  Required: true
  Offered:  true
  → PASS
```

### Required Evidence

The rule does not compare a value at all — it requires that a linked
document/certificate **exists** (via `evidence_document_id` on the
relevant `ebp_manufacturer_offer_technical_fields` row, already reserved
in Phase 3's schema) and, optionally, that the document itself passed a
separate review status. **Answering "Yes" in a text field is never
sufficient** for a Required Evidence rule — the rule can only `PASS` when
an actual evidence document is linked and (if the rule requires it)
reviewed/accepted.

```
Certification
  Rule: "Must have a valid material certificate on file"
  Offered: "Yes" (free text, no document attached)
  → FAIL (no evidence attached — "Yes" alone never satisfies this rule)

  Offered: evidence_document_id = <a real, uploaded document>
  → PASS (or REQUIRES_REVIEW if the document itself needs a human check
    before the rule can resolve to PASS — see §3)
```

### Composite Rule

A rule expressed as a boolean combination of other rules' results:
`A AND B`, `A OR B`, `A XOR B` (and, if ever needed, `NOT A` — not called
out separately by the project owner but a natural extension of the same
primitive). A Composite Rule's own Rule Result is derived purely from its
operands' results — it never re-evaluates the underlying Passport/Offer
values itself. This keeps every atomic comparison auditable in isolation
(you can always answer "why did rule X fail" by pointing at one specific
comparison) while still allowing genuinely compound engineering
requirements to be expressed as data rather than as bespoke code.

### Conditional Rule

A rule that only applies — and only produces a `PASS`/`FAIL`/`WARNING` —
when a declared precondition is true; when the precondition is false, the
rule resolves to `NOT_APPLICABLE` without evaluating its inner comparison
at all.

```
IF bypass valve applicable (per the Passport's field_applicability,
   already the exact mechanism ADR-0032/Phase 1 use for "is this field
   even required for this product")
THEN compare offered bypass opening pressure against required (Numeric
     Tolerance)
ELSE → NOT_APPLICABLE (not evaluated, not a Deviation, not a failure)
```
This is precisely the existing `bypass_valve_applicability`/
`antidrainback_valve_applicability` gating mechanism already frozen in
Phase 1's `field_applicability` matrix and reused by Phase 3's
`pep-fields.js` — Conditional Rule in this engine is the same concept,
generalized: a rule's applicability precondition can be any other rule's
or field's state, not only the two valve fields Phase 1 happens to gate
today.

## 3. States

Every rule evaluation produces exactly one of these six states. States are
a fixed enum, never free text.

| State | Meaning |
|---|---|
| `PASS` | The offered value satisfies the rule as evaluated. No Deviation. |
| `FAIL` | The offered value does not satisfy the rule. A Deviation exists. Whether a `FAIL` blocks the overall Compliance Summary from being `VALID` depends on the rule's Severity (§4) and whether an Exception (§5) has been granted for this specific (Offer Revision × Rule) pair. |
| `WARNING` | The offered value is outside the ideal target but not an outright failure per the rule's own definition (e.g., within an extended tolerance band, or a field the Passport marks as advisory rather than mandatory). A `WARNING` never blocks `VALID` by itself, but is always visible in the Compliance Summary and may still require Engineering Approval attention depending on the rule's Severity. |
| `NOT_APPLICABLE` | The rule's Conditional Rule precondition was false (§2), or the field itself is not applicable to this product per the Passport's own applicability gating (Phase 1). Never counted as a Deviation, never blocks `VALID`. |
| `REQUIRES_REVIEW` | The engine cannot mechanically resolve `PASS`/`FAIL` without a human judgment call — typically a Required Evidence rule where a document exists but has not yet been reviewed, or a comparison the Rule Catalog explicitly marks as needing engineering eyes regardless of the numeric/textual result (e.g. a borderline case near a tolerance edge, if the catalog chooses to flag it that way). Blocks the overall Compliance Summary from reaching a terminal `VALID`/`INVALID` state until resolved. |
| `REQUIRES_EXCEPTION` | The rule mechanically resolved to a Deviation (what would otherwise be `FAIL`) on a rule whose Severity means it cannot be silently accepted, but the Rule Catalog or an engineer has determined an Exception is the correct path forward rather than an outright rejection. This state exists specifically so "this failed, and the only way forward is an explicit, recorded Exception" is distinguishable from a plain `FAIL` that simply means "this Offer does not qualify." |

**Open question (§"Open Questions"):** the exact transition rules between
`FAIL` and `REQUIRES_EXCEPTION` — is this always a Rule Catalog default
behavior (§8, "Default Behavior" column) decided in advance, or can an
engineer manually promote a `FAIL` to `REQUIRES_EXCEPTION` at review time?
Not decided here.

## 4. Severity

Every rule in the Rule Catalog declares exactly one Severity. Severity is
fixed per rule (not per evaluation instance) — the same rule always
carries the same severity across every Offer it evaluates, unless the
Rule Catalog itself is revised (which is itself a tracked, versioned
change, not a silent edit).

| Severity | Meaning (illustrative default; final gating behavior is Phase 4's spec decision, see "Open Questions") |
|---|---|
| `CRITICAL` | A failure here means the product cannot function or is unsafe as specified. A `FAIL` at `CRITICAL` severity always blocks `VALID`, with or without an Exception being technically possible to request (whether `CRITICAL` failures can ever receive an Exception at all is itself an open question). |
| `HIGH` | A failure materially affects product performance or reliability. A `FAIL` blocks `VALID` unless a granted Exception exists. |
| `MEDIUM` | A failure affects secondary performance characteristics or increases risk without being an immediate functional concern. Illustrative default: produces `WARNING` rather than `FAIL`, or blocks `VALID` only if the Rule Catalog specifically configures it to. |
| `LOW` | A minor deviation, typically cosmetic, packaging-adjacent, or administrative. Illustrative default: `WARNING`, never blocks `VALID`. |
| `INFO` | Not a compliance judgment at all — an observation the engine records for visibility (e.g., "offered value exceeds the requirement," a positive deviation) without any pass/fail semantics. Never blocks anything. |

Severity and State are independent axes: a `CRITICAL` rule can resolve to
`NOT_APPLICABLE` (the precondition was false) just as easily as a `LOW`
rule can resolve to `FAIL`. The Rule Catalog's "Default Behavior" column
(§8) is where Severity and State combine into an actual effect on the
Compliance Summary — that mapping is data, not hardcoded logic, so it can
be reviewed and adjusted by engineering governance without a code change.

## 5. Exceptions

- **What Exceptions exist:** an Exception is always scoped to exactly one
  (Offer Revision × Rule) pair. There is no "blanket Exception" for an
  Offer, a Manufacturer, or a product family — each Deviation that needs
  one gets its own Exception record. (Whether a "class Exception" —
  e.g., "this Manufacturer's known plating process is pre-approved as
  equivalent for this rule, indefinitely" — should exist as a distinct
  concept is an open question, not decided here; if it is ever needed,
  it is still recorded as an explicit, auditable decision, never an
  implicit rule change.)
- **Who approves them:** an ELIMFILTERS-internal engineering-authorized
  actor — the exact role/permission model (a new role distinct from the
  existing `requireAdmin` internal surface, a specific engineering group,
  etc.) is an open question. What is decided here: an Exception is never
  self-granted by the same mechanism that submitted the Offer (a
  Manufacturer can never approve its own Exception), matching the
  existing separation-of-duties pattern already used for Offer Approval
  (Phase 3) and Manufacturer qualification changes (Phase 2, admin-only).
- **How long they last:** an Exception is bound to the specific Offer
  Revision it was granted against. **It does not carry forward
  automatically to a later Offer revision** — a new revision re-triggers
  the underlying rule evaluation from scratch, and if the same Deviation
  recurs, a new Exception must be explicitly (re-)granted. This mirrors
  the platform-wide principle already established for validation results
  generally (`phase-04-validation-engine.md`: "a new Offer revision...
  invalidates the prior result and requires re-validation"). Whether an
  Exception can also carry an explicit expiration date/time independent
  of the Offer revision (e.g., "valid for 90 days regardless of
  revision") is an open question.
- **Where they are recorded:** not decided by this document (no table is
  created here) — but whatever Phase 4's eventual schema looks like, an
  Exception record must be immutable once granted (append a
  superseding/revoking record rather than editing history, the same
  discipline already used everywhere else in this platform: Passport
  supersession, Offer supersession, Manufacturer status history) and must
  capture, at minimum: which Rule, which Offer Revision, who approved it,
  when, and why (a required justification, never optional).
- **How they affect future validations:** a granted Exception changes what
  the Compliance Summary and Engineering Decision are allowed to conclude
  for that one (Offer Revision × Rule) pair — it never changes the Rule
  Result itself (a `FAIL` under Exception is still recorded as `FAIL`,
  with the Exception noted alongside it) and it never affects any other
  rule, any other Offer revision, or any other Manufacturer's evaluation
  of the same rule. Exceptions are never precedent — a granted Exception
  for Manufacturer A does not imply or auto-grant one for Manufacturer B
  on the same rule.

## 6. Scoring

**Philosophy only — not implemented in this document or authorized for
implementation yet.**

The engine must be able to produce, in principle, either:
- a pure `PASS`/`FAIL` (plus the other states in §3) combination result
  with no numeric score, or
- a numeric technical Score (e.g., `97.3%`) summarizing the evaluation as
  a single comparable figure.

If a Score is ever implemented, it is expected to be a function of
Severity-weighted rule outcomes across the applicable rules for that
Offer (e.g., something in the shape of: start at 100, subtract a
per-Severity weight for each `FAIL`/`WARNING`, `NOT_APPLICABLE` rules
excluded from the denominator entirely) — but the **exact formula, its
weights, and whether it is even a single platform-wide constant or
configurable per product category are explicitly not decided here**. A
Score, if built, is always presented as a supplementary, informational
figure — it never overrides or substitutes for the `PASS`/`FAIL`/
`REQUIRES_EXCEPTION`/`REQUIRES_REVIEW` gating logic that actually
determines whether an Offer may proceed. A 97.3% Score does not make an
unresolved `CRITICAL FAIL` acceptable.

## 7. Automatic Observations

The engine must be able to produce a human-readable explanation for every
rule result (examples given: "Efficiency below required threshold,"
"Missing evidence," "Tolerance exceeded," "Engineering review required").
**These strings are never hardcoded inline in application code.** They
are entries in an **Observation Catalog** — a fixed, versioned list of
observation templates, each with its own identifier, referenced by the
Rule Catalog (or produced by the evaluator based on the rule's Comparison
Type and resulting State), and rendered by substituting the specific
rule's actual values (required value, offered value, unit, tolerance,
field label) into the template at evaluation time.

This mirrors two disciplines already binding elsewhere in this platform:
`CLAUDE.md`'s "AI Citation Layer" (root `CLAUDE.md`, World Catalogue
scope) requiring identical definitions/wording reused verbatim everywhere
a concept appears, and `PROJECT_MANIFESTO.md` §4.6's neutral-technical-
tone requirement. An Observation Catalog guarantees the same Deviation
always reads identically regardless of which Offer or Manufacturer
triggered it — a prerequisite for any future AI system to reliably parse
"why did this fail" across thousands of evaluations (§12), and for a
human reviewer to trust that the same words always mean the same thing.

The Observation Catalog's exact structure (one template per Comparison
Type × State combination, one per Rule Catalog entry, or a hybrid) is not
decided here — an open question for Phase 4's own spec.

## 8. Rule Catalog

Every rule the engine can execute is one row in the Rule Catalog. The
engine has no comparison logic that is not traceable to a specific
catalog entry. Each entry declares:

| Field | Meaning |
|---|---|
| **Rule ID** | A stable, permanent identifier (e.g. `RULE-EFF-001`). Never reused after a rule is retired; never renumbered. |
| **Rule Name** | A short, human-readable name. |
| **Description** | The engineering rationale — what this rule checks and why it matters, in the same neutral technical tone as `BUSINESS_RULES.md`. |
| **Comparison Type** | Exactly one of the ten types in §2. |
| **Severity** | Exactly one of the five levels in §4. |
| **Category** | Exactly one of the categories in §9. |
| **Applies To** | Which Passport field(s) (`required_*`) and Offer field(s) (`offered_*`/`actual_*`) this rule reads — for this platform, expressed as the exact `field_name` values already frozen in Phase 1's engineering schema and reused by Phase 3's `pep-fields.js` (e.g. `minimum_efficiency` + `efficiency_particle_size_basis`, `bypass_valve_applicability` + `bypass_opening_pressure_kpa` + `bypass_pressure_tolerance_pct`) — never a new, parallel field-naming scheme. |
| **Default Behavior** | What the Compliance Summary does with this rule's result by default (e.g., "FAIL blocks VALID," "FAIL produces WARNING only," "FAIL requires an Exception to proceed") — the mapping described qualitatively in §4, made concrete per rule. |

**Illustrative starter entries** (not exhaustive, not final — Phase 4's
own spec finalizes the actual catalog and may add, split, or reword any
of these; grounded in Phase 1's real, frozen field names so this document
is concrete rather than abstract):

| Rule ID | Rule Name | Comparison Type | Severity | Category | Applies To | Default Behavior |
|---|---|---|---|---|---|---|
| `RULE-THR-001` | Thread specification match | Exact Match | CRITICAL | Thread | `thread_spec` | FAIL blocks VALID, no Exception |
| `RULE-MED-001` | Required media match | Exact Match or Enumeration (per Passport data shape) | HIGH | Media | `required_media` | FAIL blocks VALID unless Exception |
| `RULE-EFF-001` | Minimum efficiency | Numeric Tolerance | CRITICAL | Efficiency | `minimum_efficiency` (tolerance basis: `efficiency_particle_size_basis`) | FAIL blocks VALID, Exception requires engineering sign-off |
| `RULE-BETA-001` | Beta ratio compliance | Numeric Tolerance or Minimum | HIGH | Beta Ratio | `beta_ratio` | FAIL blocks VALID unless Exception |
| `RULE-BUR-001` | Burst pressure adequacy | Minimum | HIGH | Burst Pressure | `burst_pressure_kpa` | FAIL blocks VALID unless Exception |
| `RULE-COL-001` | Collapse pressure adequacy | Minimum | HIGH | Collapse Pressure | `collapse_pressure_kpa` | FAIL blocks VALID unless Exception |
| `RULE-TMP-001` | Minimum operating temperature | Minimum | MEDIUM | Temperature | `operating_temp_min_c` | FAIL produces WARNING; escalates to blocking if combined with `RULE-TMP-002` |
| `RULE-TMP-002` | Maximum operating temperature | Maximum | MEDIUM | Temperature | `operating_temp_max_c` | FAIL produces WARNING; escalates to blocking if combined with `RULE-TMP-001` |
| `RULE-SEAL-001` | Gasket material | Enumeration | MEDIUM | Seal | `gasket_material` | FAIL produces WARNING, requires Engineering Approval attention |
| `RULE-BYP-001` | Bypass valve opening pressure | Conditional Rule → Numeric Tolerance | HIGH | Bypass Valve | `bypass_valve_applicability` (precondition), `bypass_opening_pressure_kpa`, `bypass_pressure_tolerance_pct` | NOT_APPLICABLE if precondition false; otherwise FAIL blocks VALID unless Exception |
| `RULE-ADB-001` | Anti-drainback valve material | Conditional Rule → Exact Match or Enumeration | MEDIUM | Anti-drainback | `antidrainback_valve_applicability` (precondition), `antidrainback_valve_material` | NOT_APPLICABLE if precondition false; otherwise WARNING |
| `RULE-DOC-001` | Material certificate on file | Required Evidence | HIGH | Documentation | any technical field's linked `evidence_document_id` where the Passport requires evidence | FAIL/REQUIRES_REVIEW blocks VALID until evidence is reviewed |
| `RULE-CERT-001` | Manufacturer certification current for this product family | Boolean / Required Evidence | HIGH | Certification | Phase 2's effective-certification view (`ebp_manufacturer_certifications_effective` — read, never re-derived) | FAIL blocks VALID |
| `RULE-PKG-001` | Packaging class matches Passport requirement | Exact Match | LOW | Packaging | `packaging_class` (Phase 1 `ebp_passport_packaging`) | FAIL produces WARNING (packaging *commercial* acceptability remains Offer Approval's decision, Phase 3 — this rule only flags a mismatch, never substitutes for that gate) |

## 9. Categories

The fixed category vocabulary (extend only via a new ADR, never silently):

`Dimensions`, `Thread`, `Media`, `Efficiency`, `Beta Ratio`, `Burst
Pressure`, `Collapse Pressure`, `Temperature`, `Seal`, `Bypass Valve`,
`Anti-drainback`, `Packaging`, `Documentation`, `Certification`.

Every Rule Catalog entry belongs to exactly one Category. Categories exist
so the KPI Layer and Alert Layer (ADR-0037) can report "which category
produces the most rejections" (§12) without parsing free text.

## 10. Complete Flow

```
Passport (Phase 1, frozen at a specific engineering_revision)
   ↓
Offer (Phase 3, a specific offer_id / offer_revision, its offered_*
       technical fields and evidence documents)
   ↓
Rule Evaluation (each applicable Rule Catalog entry runs its Comparison
                 Type against the matching Passport/Offer field pair)
   ↓
Rule Results (one State + Severity + Observation per rule, per §3/§4/§7)
   ↓
Compliance Summary (the aggregate: overall VALID / INVALID / REQUIRES_
                     REVIEW / REQUIRES_EXCEPTION, derived from every Rule
                     Result's State × Severity × Default Behavior — never
                     a separate, independently-entered judgment)
   ↓
Engineering Decision (a human — or an explicitly-configured automatic
                       rule — records Engineering Approval, a Conditional
                       Approval, or a rejection, referencing the
                       Compliance Summary and any granted Exceptions)
   ↓
Offer Approval (Phase 3, ebp_manufacturer_offer_approvals — the separate
                 Commercial Approval gate, ADR-0008; may only ever be
                 granted for an Offer revision that has an Engineering
                 Decision on file, but is its own independent decision)
```

Nothing after "Rule Evaluation" re-derives a value the engine already
computed — the Compliance Summary is a pure aggregation of Rule Results,
and the Engineering Decision always references (never recalculates) the
Compliance Summary it was based on, so a later audit can reconstruct
exactly which rule results informed which decision.

## 11. Dashboard Readiness

Per ADR-0037 (`PLATFORM_ARCHITECTURE.md` §8), the engine must emit
Activity Events into the shared, single-model event ledger described
there — never its own independent event system. Candidate events (final
naming is Phase 4's own spec decision, not fixed here):

- `RULE_EVALUATED` — one rule ran against one Offer revision, regardless
  of outcome. `entity_type = 'OFFER'`, carries `rule_id`, resulting
  `state`, `severity`.
- `RULE_FAILED` — a rule resolved to `FAIL`. Carries the same fields as
  `RULE_EVALUATED` plus the rendered Observation (§7).
- `RULE_WARNING` — a rule resolved to `WARNING`.
- `VALIDATION_COMPLETED` — the Compliance Summary reached a terminal
  state (`VALID`/`INVALID`) for a specific Offer revision. Carries the
  overall result and, if implemented, the Score (§6).
- `ENGINEERING_EXCEPTION_CREATED` — an Exception was requested/proposed
  for a specific (Offer Revision × Rule) pair.
- `ENGINEERING_EXCEPTION_APPROVED` — an Exception was granted, by whom,
  and its justification.

**Candidate KPIs** (per `PLATFORM_ARCHITECTURE.md` §8.4): validations
completed, pass rate, average rules failed per Offer, Exceptions granted
per period, most-triggered rule, rejection rate by Manufacturer.

**Candidate Alerts** (per §8.5): "Engineering review required" (a
`REQUIRES_REVIEW` state persisting past a threshold), "Repeated Deviation
by Manufacturer" (the same rule failing for the same Manufacturer across
multiple Offers/product families — a genuine early-warning signal this
engine is uniquely positioned to produce).

**Candidate Analytics Views** (per §8.3): `ebp_analytics_validation_
summary` (per Offer/Manufacturer: pass rate, open Exceptions, most recent
Compliance Summary) — naming/shape finalized by Phase 4's own spec, not
this document.

This is architecture only — no event, table, or route exists yet. Actual
implementation follows the same phase-gate discipline as everything else
in this platform (`CLAUDE_WORKFLOW.md`).

## 12. Preparation for AI

Every rule result, being a structured (`rule_id`, `entity_type`,
`entity_id`, `state`, `severity`, `category`, rendered Observation) fact
rather than free text, is designed so a future AI-assisted query layer
can answer questions such as:

- *"Why did this offer fail?"* — a direct read of that Offer revision's
  Rule Results with `state = FAIL`, each with its rendered Observation
  (§7) already human-readable and consistent (never needing to parse
  inconsistent free-text explanations).
- *"Which manufacturers fail compliance most often?"* — an aggregation
  over `RULE_FAILED` events grouped by `manufacturer_id`, exactly the
  kind of query the Analytics Views/KPI Layer (ADR-0037) are designed to
  serve without ever touching a transactional table directly.
- *"What is the most common deviation?"* — a `GROUP BY rule_id` (or
  `category`) over `RULE_FAILED` events.
- *"Which rule produces the most rejections?"* — the same aggregation,
  ranked.

None of this requires building an assistant now. It requires that every
fact the engine produces be structured, catalog-referenced (Rule ID,
Category, Severity — never a description invented at evaluation time),
and captured as an Activity Event, exactly as specified above. The
discipline is identical to the one already applied to the World
Catalogue's own "AI Citation Layer" (root `CLAUDE.md`): consistent,
structured, non-improvised output is what makes a system reliably
citable and queryable by an LLM later — not a feature added after the
fact.

## Restrictions Confirmed

No table was created by this document. No API was created. No migration
was written. No code was written. No frozen phase (0, 1, 2, or 3) was
modified. **Phase 4 was not started.**

## Open Questions (must be resolved before any Phase 4 code is written)

1. **Engineering Approval authority model.** Who, specifically, is
   authorized to record an Engineering Decision or grant an Exception? A
   new role distinct from the existing `requireAdmin` internal surface? A
   named engineering group? Does this require its own identity/auth
   model, or does it reuse the existing internal admin mechanism with an
   additional permission check?
2. **`FAIL` → `REQUIRES_EXCEPTION` promotion.** Is this always a fixed
   Rule Catalog "Default Behavior" decided in advance per rule, or can an
   engineer manually request an Exception path for a rule whose default
   behavior is a hard `FAIL`? Can `CRITICAL`-severity rules ever receive
   an Exception at all, or are some rules categorically non-waivable?
3. **Severity → gating mapping, exactly.** §4 gives an illustrative
   default (`CRITICAL`/`HIGH` block, `MEDIUM`/`LOW` warn). Is this
   mapping fixed platform-wide, or configurable per Rule Catalog entry
   (per the "Default Behavior" column, §8)? If configurable, who is
   authorized to change it, and is that itself audited?
4. **Composite/Conditional Rule combination with severity/state
   aggregation.** When a Composite Rule's operands have different
   severities, what severity does the Composite Rule itself carry? Does
   a Conditional Rule's severity apply only when its precondition is
   true, or does `NOT_APPLICABLE` always mean severity is moot regardless?
5. **Scoring formula and scope (§6).** Is a numeric Score built at all in
   Phase 4's first implementation, or deferred entirely? If built: what
   is the exact weighting formula, is it a single platform-wide constant
   or configurable per product Category (§9) or Duty (HD/LD, per root
   `CLAUDE.md`'s SKU architecture), and who owns changing it?
6. **Observation Catalog structure (§7).** One template per (Comparison
   Type × State), one per individual Rule Catalog entry, or a hybrid
   (a rule-specific override of a Comparison-Type default)? Where does
   internationalization fit, if a future Manufacturer-facing surface
   needs the same Observation in a language other than English?
7. **Exception scope beyond one (Offer Revision × Rule) pair.** Does a
   "class Exception" (e.g., a Manufacturer's pre-approved equivalent
   process for one rule, applied automatically to all its future Offers
   against that rule) ever get built, or is per-(Offer Revision × Rule)
   the permanent, only granularity? If it exists, how does it avoid
   becoming an implicit, un-audited rule change?
8. **Conditional Approval's data shape (Philosophy §, "Conditional
   Approval").** Is it its own distinct state/entity, or an ordinary
   Engineering Approval plus a linked follow-up/condition record? How is
   a missed/expired condition detected and alerted (ties to ADR-0037's
   Alert Layer)?
9. **Automatic vs. human Engineering Decision.** Can a Compliance Summary
   with 100% `PASS` (or `PASS`/`NOT_APPLICABLE` only) ever auto-grant
   Engineering Approval without a human step, or is a human decision
   always required regardless of the mechanical result? If auto-approval
   is ever allowed, under what exact conditions, and is it itself
   auditable as a "decision" distinguishable from a human one?
10. **Rule Catalog storage and versioning.** Is the Rule Catalog itself
    data (a table, editable by an authorized role without a code
    deploy) or code (a versioned file requiring a normal
    review/deploy cycle, closer to how `ebp/phase3/pep-fields.js` is
    structured today)? If data, how are changes to an existing rule's
    Severity/Comparison Type/Default Behavior themselves versioned and
    audited, given a rule's own identity (Rule ID) must remain stable
    forever?
11. **Relationship to Phase 1's `field_applicability` matrix.** Does
    every Conditional Rule's precondition read Phase 1's existing
    `field_applicability`/`ebp_field_applicability_matrix` directly (as
    §2's example assumes), or does Phase 4 need its own, additional
    applicability concept for rules that don't map one-to-one onto an
    existing Passport field (e.g., a rule that only applies to certain
    Duty classes or product Categories not currently modeled as a Phase 1
    field)?
12. **Re-validation triggers, precisely.** `phase-04-validation-engine
    .md` already states that a new Offer revision, a Passport revision
    change, a Manufacturer qualification status change, or Offer
    `expires_at` passing all invalidate a prior result. Does *every*
    Rule Result get invalidated in every one of those cases, or only the
    subset of rules that actually reference the changed data (e.g., a
    Manufacturer status change plausibly only invalidates `RULE-CERT-*`,
    not `RULE-THR-001`)? Coarse (invalidate everything) is simpler and
    safer by default; fine-grained (invalidate only affected rules) is
    more efficient but requires the Rule Catalog to declare its exact
    data dependencies up front.
