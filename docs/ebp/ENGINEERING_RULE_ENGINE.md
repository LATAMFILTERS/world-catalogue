# ENGINEERING RULE ENGINE — Engineering Compliance Validation (Phase 4)

**Status:** Normative reference — architecture and rule-behavior fully
decided. See ADR-0038 in `DECISIONS.md`, and ADR-0039 through ADR-0051
for the twelve closed decisions plus the Global Result Model, recorded
2026-07-13. Implementation of Phase 4 is authorized to proceed from this
document; Phase 5 is not.
**Created:** 2026-07-13, before Phase 4 was authorized to begin.
**Decisions closed:** 2026-07-13, by the project owner, resolving all
twelve open questions raised in the original version of this document.
See "Resolved Decisions" below (replaces the former "Open Questions"
section) and the "Global Result Model" section.
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

The specific ELIMFILTERS-internal decision, recorded by a human holding
the `ENGINEERING_APPROVER` functional role (**Decision 01**, ADR-0039;
**Decision 09**, ADR-0047), that a given Compliance result — including
any `WARNING`s, `REQUIRES_REVIEW`s, or granted Exceptions — is acceptable
to proceed. Engineering Approval is always a human decision layered on
top of the engine's mechanical output; **the engine never grants
Engineering Approval itself, even when every rule reports `PASS`**
(Decision 09) — the mechanical output can at most be flagged
`MECHANICALLY_ELIGIBLE_FOR_APPROVAL` (see "Global Result Model"). This
mirrors the existing platform-wide principle that "no Passport ×
Manufacturer × Manufacturer Offer combination reaches Manufacturer
Selection... without passing Engineering Compliance Validation"
(`PROJECT_MANIFESTO.md` §4.4) — the engine produces the evidence; a
human `ENGINEERING_APPROVER` makes the approval, always.

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
explicit, tracked condition. **Decided (Decision 08, ADR-0046):**
Conditional Approval is an ordinary Engineering Decision
(`CONDITIONALLY_APPROVED`) with one or more structured condition records
linked to it — never a separate, parallel technical state. See "Global
Result Model" and Decision 08 below for the condition record shape and
eligibility rules.

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

**Decided (Decision 04, ADR-0042) — severity and gating semantics:**
- **Effective severity** of a Composite Rule is the **highest** severity
  among: the Composite Rule's own declared severity, and the severities
  of whichever operand(s) actually caused the negative result.
- **`AND`:** fails if any blocking operand fails.
- **`OR`:** fails only when every valid alternative fails.
- **`XOR`:** fails if none of the alternatives are satisfied, or if more
  than one is.

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
today (Decision 11, ADR-0049, generalizes this further to Rule
Applicability beyond Phase 1 fields).

**Decided (Decision 04, ADR-0042) — severity semantics when the
precondition is false:** severity is evaluated **only** when the
precondition is true. When the precondition is false, the result is
`NOT_APPLICABLE`, severity never participates in gating, it never
affects any future Scoring (§6), and the `NOT_APPLICABLE` result — with
which precondition evaluated false — is always recorded for
traceability, never silently omitted.

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

**Decided (Decision 02, ADR-0040):** the `FAIL` ↔ `REQUIRES_EXCEPTION`
relationship is entirely a function of the rule version's declared
`exception_policy` (`NON_WAIVABLE` / `WAIVABLE_WITH_ENGINEERING_APPROVAL`
/ `WAIVABLE_WITH_CONDITIONS`) — never a manual, ad hoc promotion an
engineer performs at review time outside that declared policy. See
Decision 02 below.

## 4. Severity

Every rule in the Rule Catalog declares exactly one Severity. Severity is
fixed per rule (not per evaluation instance) — the same rule always
carries the same severity across every Offer it evaluates, unless the
Rule Catalog itself is revised (which is itself a tracked, versioned
change, not a silent edit).

**Decided (Decision 03, ADR-0041) — fixed platform-wide base mapping:**

| Severity | Gating behavior (fixed floor, see hardening rule below) |
|---|---|
| `CRITICAL` | Blocks `VALID`. Result is `FAIL`. **Non-waivable by default** — see Decision 02/Decision 03; a `CRITICAL` rule version may only become waivable if its `exception_policy` explicitly declares so. |
| `HIGH` | Blocks `VALID`. Result is `FAIL` or `REQUIRES_EXCEPTION`, according to the rule version's `exception_policy`. |
| `MEDIUM` | Does not block automatically. Produces `WARNING`. May require human review if the rule version explicitly declares that. |
| `LOW` | Does not block. Produces `WARNING`. |
| `INFO` | Does not block. Produces information only — no pass/fail semantics. |

**The Rule Catalog cannot weaken this mapping, only harden it.** A given
rule version may configure a `MEDIUM` rule to block `VALID`; it may never
configure a `HIGH` rule to stop blocking without a formal, declared
Exception path. Every hardening is itself versioned and audited (Decision
10, ADR-0048) as part of that rule's own `rule_version` record.

Severity and State are independent axes: a `CRITICAL` rule can resolve to
`NOT_APPLICABLE` (the precondition was false) just as easily as a `LOW`
rule can resolve to `FAIL`. The Rule Catalog's "Default Behavior" and
`exception_policy` columns (§8) are where Severity and State combine into
an actual effect on the Compliance Summary — that mapping is data, not
hardcoded logic, versioned per `rule_version`, so it can be reviewed and
adjusted by engineering governance without a code deploy (Decision 10).

## 5. Exceptions

**Decided (Decision 02 / ADR-0040, Decision 07 / ADR-0045):**

- **What Exceptions exist:** an Exception is always scoped to exactly one
  **Offer ID × Offer Revision × Rule ID × Rule Version** tuple. There is
  no "blanket Exception" for an Offer, a Manufacturer, or a product
  family in Phase 4 v1.0 — each Deviation that needs one gets its own
  Exception record. A "class Exception" (e.g., a Manufacturer's known
  process pre-approved as equivalent for one rule, indefinitely) is
  **explicitly deferred to a future version and requires its own,
  independent ADR** — it is not built now, and this document takes no
  position on its eventual shape beyond requiring it never become an
  implicit, un-audited rule change if it is ever built.
- **Whether a rule can even receive one:** governed by that rule
  version's `exception_policy` — `NON_WAIVABLE`,
  `WAIVABLE_WITH_ENGINEERING_APPROVAL`, or `WAIVABLE_WITH_CONDITIONS`.
  An engineer cannot freely convert an arbitrary `FAIL` into
  `REQUIRES_EXCEPTION`; a request may only be made if the rule version's
  policy allows it. `NON_WAIVABLE` rules never receive an Exception,
  ever. Every `CRITICAL`-severity rule is `NON_WAIVABLE` **by default**;
  a rule version may declare itself `CRITICAL` and waivable only by
  explicit, visible configuration on that version (never a silent
  default). No administrative override outside this formal Exception
  flow is permitted, for any severity.
- **Who approves them:** the `ENGINEERING_APPROVER` functional role
  (Decision 01, ADR-0039). An Exception is never self-granted by the
  same mechanism that submitted the Offer (a Manufacturer can never
  approve its own Exception) and is never granted via an `ADMIN_OWNER`
  administrative override — matching the existing separation-of-duties
  pattern already used for Offer Approval (Phase 3) and Manufacturer
  qualification changes (Phase 2, admin-only).
- **How long they last:** an Exception is bound to the specific Offer
  Revision it was granted against. **It does not carry forward
  automatically to a later Offer revision** — a new revision re-triggers
  the underlying rule evaluation from scratch, and if the same Deviation
  recurs, a new Exception must be explicitly (re-)granted.
- **Where they are recorded:** as versioned Postgres data (Decision 10,
  ADR-0048), immutable once granted (append a superseding/revoking record
  rather than editing history, the same discipline already used
  everywhere else in this platform), capturing at minimum: Rule ID +
  Rule Version, Offer ID + Offer Revision, who approved it (an
  `ENGINEERING_APPROVER`), when, and a required justification.
- **How they affect future validations:** a granted Exception changes
  what the Compliance Summary and Engineering Decision are allowed to
  conclude for that one tuple — **it never changes the Rule Result
  itself** (a `FAIL` under Exception is still recorded as `FAIL`, with
  the Exception noted alongside it), **it never modifies the Rule
  Catalog**, **it never changes the Passport (PEP)**, and **it never
  converts a Deviation into genuine technical compliance** — it only
  authorizes accepting that specific, identified Deviation. Exceptions
  are never precedent — a granted Exception for Manufacturer A does not
  imply or auto-grant one for Manufacturer B on the same rule.

## 6. Scoring

**Decided (Decision 05, ADR-0043): no numeric technical Score in Phase 4
v1.0.**

Phase 4 v1.0 produces, per validation run: per-rule results, a per-state
summary, per-severity counts, an overall mechanical result, and a
separate human Engineering Decision (see "Global Result Model"). It does
not produce, present, or store any single numeric compliance percentage.
**No fictitious "compliance percentage" derived merely from a count of
passed rules is ever shown** — a pass-count ratio is not a meaningful
technical score and is explicitly rejected as a substitute for one.

All data needed to compute a real, Severity-weighted Score in a future
version is already captured (every Rule Result's state, severity,
category, and rule version) so a future Score can be added, and even
computed retroactively over historical validation runs, **without
recalculating or losing any history**. The exact formula, its weights,
and whether it is a platform-wide constant or configurable per Category/
Duty remain undecided and deferred — building a Score is a future,
separately-authorized decision, not part of Phase 4 v1.0.

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

**Decided (Decision 06, ADR-0044): a hybrid Observation Catalog.**

1. A default template keyed by (`comparison_type`, `result_state`).
2. An optional override keyed by (`rule_id`, `rule_version`,
   `result_state`), taking precedence over the default when present.

Every Observation is identified by a stable **observation code** (never
free text as the authority) — e.g. `OBS_NUMERIC_BELOW_MINIMUM`,
`OBS_TOLERANCE_EXCEEDED`, `OBS_REQUIRED_EVIDENCE_MISSING`. Each rendered
Observation stores, at minimum: the `observation_code`, the structured
parameters used to render it (required value, offered value, unit,
tolerance, field label — never only the final rendered sentence), and
the template version used. **The rendered text is a presentation
artifact only — it is never stored as the sole source of truth**; the
code + structured parameters are what is authoritative and queryable.

Phase 4 v1.0 renders English only, but the catalog is structured with
i18n-ready keys from day one (`observation_code` + parameters, not
baked-in English strings) so a future language can be added by adding
templates, never by touching evaluation code.

## 8. Rule Catalog

Every rule the engine can execute is one row (one `rule_version`) in the
Rule Catalog. The engine has no comparison logic that is not traceable to
a specific catalog entry. **Decided (Decision 10, ADR-0048): the Rule
Catalog is stored as versioned data in Postgres, never as code.** Each
rule version declares:

| Field | Meaning |
|---|---|
| **Rule ID** | A stable, permanent identifier (e.g. `RULE-EFF-001`). Never reused after a rule is retired; never renumbered. |
| **Rule Version** | Monotonically increasing per Rule ID. A published version is never edited — a functional change always creates a new version. Every validation references an exact Rule ID + Rule Version, never "the current version" implicitly. |
| **Rule Name** | A short, human-readable name. |
| **Description** | The engineering rationale — what this rule checks and why it matters, in the same neutral technical tone as `BUSINESS_RULES.md`. |
| **Comparison Type** | Exactly one of the ten types in §2. |
| **Severity** | Exactly one of the five levels in §4. |
| **Exception Policy** | (Decision 02, ADR-0040) Exactly one of `NON_WAIVABLE`, `WAIVABLE_WITH_ENGINEERING_APPROVAL`, `WAIVABLE_WITH_CONDITIONS`. Defaults to `NON_WAIVABLE` for `CRITICAL` severity unless explicitly overridden on that version. |
| **Category** | Exactly one of the categories in §9. |
| **Applies To** | Which Passport field(s) (`required_*`) and Offer field(s) (`offered_*`/`actual_*`) this rule reads — for this platform, expressed as the exact `field_name` values already frozen in Phase 1's engineering schema and reused by Phase 3's `pep-fields.js` (e.g. `minimum_efficiency` + `efficiency_particle_size_basis`, `bypass_valve_applicability` + `bypass_opening_pressure_kpa` + `bypass_pressure_tolerance_pct`) — never a new, parallel field-naming scheme. |
| **Rule Applicability** | (Decision 11, ADR-0049) The declared, versioned condition under which this rule is even evaluated — may read Phase 1's `field_applicability` directly, or Phase 4's own additional applicability inputs (product category/subtype, duty, technology, another field's presence/value, Manufacturer qualification attributes). Always explicit, never inferred silently. |
| **Default Behavior** | What the Compliance Summary does with this rule's result by default (e.g., "FAIL blocks VALID," "FAIL produces WARNING only," "FAIL requires an Exception to proceed") — the mapping described qualitatively in §4, made concrete per rule version, and never weaker than §4's fixed floor. |
| **Status** | `DRAFT` → `ACTIVE` → `SUPERSEDED` / `RETIRED`. A rule version that was ever used by a real validation run is never deleted, regardless of status. |
| **Effective Dates** | When this version became/stopped being `ACTIVE`. |
| **Authoring / Audit Metadata** | Who authored/published this version, when. |

Rule Catalog administration in Phase 4 v1.0 is via controlled internal
endpoints and/or versioned migrations/seed data, following this same data
model — **no visual rule-editing interface is built in v1.0.**

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
Rule Evaluation (each applicable Rule Catalog entry — an exact
                 rule_id + rule_version — runs its Comparison Type
                 against the matching Passport/Offer field pair)
   ↓
Rule Results (one State + Severity + Observation per rule, per §3/§4/§7)
   ↓
Mechanical Compliance Result (MECHANICALLY_PASS / MECHANICALLY_FAIL /
                     REQUIRES_ENGINEERING_REVIEW — the aggregate, derived
                     purely from every Rule Result's State × Severity ×
                     Default Behavior × Exception Policy; never a
                     separate, independently-entered judgment)
   ↓
Engineering Decision (always a human ENGINEERING_APPROVER: PENDING_
                       REVIEW / APPROVED / CONDITIONALLY_APPROVED /
                       REJECTED — references, never recalculates, the
                       Mechanical Compliance Result and any granted
                       Exceptions; the engine may surface
                       MECHANICALLY_ELIGIBLE_FOR_APPROVAL but never
                       writes APPROVED itself, Decision 09)
   ↓
Offer Approval (Phase 3, ebp_manufacturer_offer_approvals — the separate
                 Commercial Approval gate, ADR-0008; requires an eligible
                 Engineering Decision on file, but is its own independent
                 decision, never merged into the same column)
```

See "Global Result Model" below for the full definition of these three
distinct, never-conflated concepts. Nothing after "Rule Evaluation"
re-derives a value the engine already computed.

## 11. Dashboard Readiness

Per ADR-0037 (`PLATFORM_ARCHITECTURE.md` §8), the engine emits Activity
Events into the shared, single-model event ledger — never its own
independent event system. **Decided, final event set for Phase 4 v1.0:**

**Events:** `VALIDATION_RUN_CREATED`, `RULE_EVALUATED`, `RULE_PASSED`,
`RULE_FAILED`, `RULE_WARNING`, `RULE_NOT_APPLICABLE`,
`VALIDATION_COMPLETED`, `VALIDATION_MARKED_STALE`,
`ENGINEERING_REVIEW_STARTED`, `ENGINEERING_DECISION_RECORDED`,
`ENGINEERING_EXCEPTION_REQUESTED`, `ENGINEERING_EXCEPTION_APPROVED`,
`ENGINEERING_EXCEPTION_REJECTED`, `ENGINEERING_CONDITION_CREATED`,
`ENGINEERING_CONDITION_SATISFIED`, `ENGINEERING_CONDITION_OVERDUE`,
`ENGINEERING_CONDITION_FAILED`.

**KPIs:** validations completed; pass/fail/review-required rate; rules
failing most frequently; failure rate by Manufacturer; failure rate by
product Category; exception request rate; exception approval rate;
average engineering review time; conditions open/overdue/failed; stale
validations pending re-run.

**Alerts:** validation pending review; critical rule failure; required
evidence missing; exception expiring; condition approaching deadline;
condition overdue; validation stale; active Offer without a current
validation.

**Analytics Views:** `ebp_analytics_validation_summary` (per Offer/
Manufacturer: pass rate, open Exceptions, most recent Mechanical
Compliance Result and Engineering Decision) — exact shape finalized by
Phase 4's own spec.

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

## Global Result Model (added 2026-07-13)

The engine keeps three concepts structurally distinct — **never merged
into a single column or state**:

### 1. Mechanical Compliance Result

Generated automatically, with no human step:
- `MECHANICALLY_PASS`
- `MECHANICALLY_FAIL`
- `REQUIRES_ENGINEERING_REVIEW`

This is the pure aggregation of Rule Results (state × severity ×
exception policy × default behavior). It may additionally be flagged
`MECHANICALLY_ELIGIBLE_FOR_APPROVAL` when every applicable rule resolved
to `PASS`/`NOT_APPLICABLE` — but this flag is informational only; it is
never itself a decision and never becomes `APPROVED` without step 2.

### 2. Engineering Decision

Recorded by a human `ENGINEERING_APPROVER` (Decision 01):
- `PENDING_REVIEW`
- `APPROVED`
- `CONDITIONALLY_APPROVED`
- `REJECTED`

Always references the Mechanical Compliance Result and any granted
Exceptions it was based on; never recalculates them. `CONDITIONALLY_
APPROVED` carries one or more structured condition records (Decision 08).

### 3. Offer Approval

Belongs to the already-defined downstream flow (Phase 3,
`ebp_manufacturer_offer_approvals`, ADR-0008):
- Requires an eligible Engineering Decision on file (`APPROVED`, or
  `CONDITIONALLY_APPROVED` with no mandatory condition `OPEN`/`OVERDUE`/
  `FAILED`).
- Requires its own, separate Commercial Approval.
- Is never part of the mechanical evaluation.

## Resolved Decisions (2026-07-13)

The twelve questions originally raised here are now closed by the
project owner. Each decision below is registered by its own ADR in
`DECISIONS.md`; this section is the durable summary. **No table, API,
migration, or Phase 4 code exists as a result of these decisions alone**
— they authorize Phase 4's spec (`phases/phase-04-validation-engine.md`)
to be written as an implementable document and, from there, Phase 4's
implementation to begin. Phase 5 remains not started and not authorized.

### Decision 01 — Engineering Approval authority model (ADR-0039)

The MVP uses the existing internal `requireAdmin` mechanism, complemented
by explicit functional authorization via three functional roles:

- **`ENGINEERING_REVIEWER`** — may review results and request
  clarifications; may not grant Exceptions.
- **`ENGINEERING_APPROVER`** — may record an Engineering Decision, may
  technically reject an Offer, may approve Exceptions the rule's
  `exception_policy` permits.
- **`ADMIN_OWNER`** — may administer role assignments; **may not**
  directly convert an invalid technical result into valid, and **may
  not** approve rules outside their authorized flow via an
  administrative override.

While `ADMIN_KEY_SHARED` remains the identity mechanism, the actor stays
a declared label: `declared_actor` and `identity_mechanism =
ADMIN_KEY_SHARED` are stored, never presented as a cryptographically
authenticated identity. The architecture must allow this to be replaced
later by real individual internal authentication without altering any
historical engineering decision.

### Decision 02 — `FAIL` → `REQUIRES_EXCEPTION` promotion (ADR-0040)

Exception capability is defined per rule version via a declared
**`exception_policy`**: `NON_WAIVABLE`,
`WAIVABLE_WITH_ENGINEERING_APPROVAL`, or `WAIVABLE_WITH_CONDITIONS`.

- An engineer cannot freely convert an arbitrary `FAIL` into
  `REQUIRES_EXCEPTION` — an Exception may only be requested if the rule
  version's policy permits it.
- `NON_WAIVABLE` rules never receive an Exception.
- A rule may be `CRITICAL` and exceptionally waivable, but this must be
  declared explicitly on that rule version.
- **By default, every `CRITICAL` rule is `NON_WAIVABLE`.**
- No administrative override outside the formal Exception flow is
  permitted, for any severity.

### Decision 03 — Severity → gating mapping (ADR-0041)

A fixed, platform-wide base mapping is adopted:

- `CRITICAL` — blocks `VALID`; result `FAIL`; non-waivable by default.
- `HIGH` — blocks `VALID`; result `FAIL` or `REQUIRES_EXCEPTION`,
  per `exception_policy`.
- `MEDIUM` — does not block automatically; produces `WARNING`; may
  require human review if the rule defines that.
- `LOW` — does not block; produces `WARNING`.
- `INFO` — does not block; information only.

**The Rule Catalog cannot weaken this mapping, only harden it.** A
`MEDIUM` rule may be configured to block; a `HIGH` rule may never be
configured to stop blocking without a formal Exception. Every hardening
is versioned and audited.

### Decision 04 — Composite and Conditional Rule severity (ADR-0042)

**Composite Rules:** the effective severity is the highest among the
Composite Rule's own declared severity and the severities of whichever
operand(s) caused the negative result.
- `AND` — any blocking operand can fail the rule.
- `OR` — fails only when every valid alternative fails.
- `XOR` — fails if none, or more than one, alternative is satisfied.

**Conditional Rules:** severity is evaluated only when the precondition
is true. When the precondition is false: the result is `NOT_APPLICABLE`;
severity does not participate in gating; it does not affect future
Scoring; it is always recorded for traceability.

### Decision 05 — Scoring (ADR-0043)

No numeric technical score is implemented in Phase 4 v1.0. Phase 4 v1.0
produces per-rule results, a per-state summary, per-severity counts, an
overall Mechanical Compliance Result, and a separate human Engineering
Decision. All data needed to add scoring in a future version is
preserved, without recalculating or losing history. No fictitious
compliance percentage derived merely from a count of passed rules is
ever shown.

### Decision 06 — Observation Catalog (ADR-0044)

A hybrid model:
1. A default template keyed by (`comparison_type`, `result_state`).
2. An optional override keyed by (`rule_id`, `rule_version`,
   `result_state`).

Observations are identified by stable codes, not free text as authority
(e.g. `OBS_NUMERIC_BELOW_MINIMUM`, `OBS_TOLERANCE_EXCEEDED`,
`OBS_REQUIRED_EVIDENCE_MISSING`). Stored: `observation_code`, structured
parameters, and the template version used. The rendered text is always
generated from the catalog and is never stored as the sole source of
truth. Translation is prepared via i18n-ready keys; Phase 4 v1.0 may
render English only as long as the infrastructure is ready for future
languages.

### Decision 07 — Exception scope (ADR-0045)

Phase 4 v1.0 permits Exceptions only at: **Offer ID × Offer Revision ×
Rule ID × Rule Version**. No general Exceptions exist by Manufacturer,
family, or future Offers. An Exception: is not inherited; is not applied
automatically to later revisions; does not modify the Rule Catalog; does
not change the PEP; does not convert a Deviation into genuine technical
compliance; only authorizes accepting that specific, identified
Deviation. Class Exceptions are deferred to a future version and require
an independent ADR.

### Decision 08 — Conditional Approval data shape (ADR-0046)

`CONDITIONALLY_APPROVED` is a normal Engineering Decision with one or
more structured condition records linked to it — never a separate,
parallel technical state.

Engineering Decision: `APPROVED`, `CONDITIONALLY_APPROVED`, `REJECTED`,
`PENDING_REVIEW`.

Each condition record includes: `condition_id`; `condition_type`;
description; verifiable requirement; responsible party; due date;
required evidence; status; satisfaction date; consequence of
non-compliance.

Condition status: `OPEN`, `SATISFIED`, `OVERDUE`, `WAIVED`, `FAILED`,
`CANCELLED`.

A `CONDITIONALLY_APPROVED` Offer: does not count as final approval for
Manufacturer Selection while any mandatory condition is `OPEN`,
`OVERDUE`, or `FAILED`; may be used only in preliminary comparisons;
becomes eligible once every mandatory condition is `SATISFIED` or
formally `WAIVED`. The Alert Layer produces alerts for conditions
approaching their deadline, overdue, or failed.

### Decision 09 — Automatic vs. human Engineering Decision (ADR-0047)

Every Offer requires a human decision. The automatic engine: evaluates
rules; generates Rule Results; produces the Mechanical Compliance
Result; recommends a mechanical disposition. **It never grants a final
Engineering Approval by itself** — even when every rule is `PASS` or
`NOT_APPLICABLE`, an `ENGINEERING_APPROVER` must confirm the decision.
The system may display `MECHANICALLY_ELIGIBLE_FOR_APPROVAL`, but may not
convert it automatically into `APPROVED`. This policy may only be
revisited in the future via a new ADR, with sufficient operational
history.

### Decision 10 — Rule Catalog storage and versioning (ADR-0048)

The Rule Catalog is stored as versioned data in Postgres — never as code
only. Minimum entities: rule identity; rule version; comparison type;
category; severity; gating behavior; exception policy; applicability;
operands/dependencies; observation templates; status; effective dates;
authoring/audit metadata.

Rules: `rule_id` is stable and permanent; every functional change creates
a new `rule_version`; a published version is never edited; prior
versions remain available; every validation references exactly
`rule_id` + `rule_version`; a new rule starts as `DRAFT`, goes through
review, is published as `ACTIVE`, may become `SUPERSEDED` or `RETIRED`;
never deleted if it was ever used.

No advanced visual rule-editing UI is built yet. In Phase 4 v1.0,
administration may be done via controlled internal endpoints or
versioned migrations/seed data, respecting this same data model.

### Decision 11 — Relationship with Phase 1 applicability (ADR-0049)

Phase 4 uses two applicability levels:

**Field applicability** — comes from Phase 1:
`ebp_field_applicability_matrix`, the PEP snapshot, engineering overrides
frozen at the Passport revision. Phase 4 does not modify this
information.

**Rule applicability** — Phase 4's own, additional concept for whether a
rule applies, based on: product category; product subtype; duty;
technology; presence or absence of a field; value of another required
field; Manufacturer qualification attributes; other explicitly declared
inputs. A rule may depend on Phase 1, but not every rule is limited to a
single Phase 1 field. All rule applicability must be: declared;
versioned; auditable; and must record why a rule was evaluated or marked
`NOT_APPLICABLE`.

### Decision 12 — Re-validation triggers (ADR-0050)

Phase 4 v1.0 uses full coarse invalidation. The complete validation is
invalidated when any of the following changes: Passport revision;
Manufacturer Offer revision; relevant Manufacturer qualification status;
Offer expiration; the Rule Catalog's applicable `ACTIVE` version;
required linked evidence; an Exception; an approval condition; or any
other data used as input by the rule set.

No partial results from a prior validation are reused. Every
revalidation: creates a new validation run; preserves the previous
execution; re-evaluates every applicable rule; records the trigger;
records the exact versions of every input. The previous validation
becomes `STALE` (or an equivalent state) without being deleted or
modified historically. Fine-grained optimization is deferred until there
is real evidence of a performance problem.

## Restrictions Confirmed

No table was created by this document. No API was created. No migration
was written. No code was written. No frozen phase (0, 1, 2, or 3) was
modified. **Phase 4 was not started.** These decisions authorize Phase
4's spec to be finalized and its implementation to proceed; they do not
themselves implement anything.
