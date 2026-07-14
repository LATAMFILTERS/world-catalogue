# MANUFACTURER SELECTION ENGINE — Manufacturer Selection (Phase 5)

**Status:** Normative reference — philosophy and business rules, now
**closed by the project owner (2026-07-13, Decisions 01-12, ADR-0062
through ADR-0074)**. All twelve Open Questions this document originally
raised are resolved — see "Resolved Decisions" below, mirroring the exact
discipline `ENGINEERING_RULE_ENGINE.md` (ADR-0038 through ADR-0060)
established for Phase 4. Phase 5 implementation is authorized to proceed
from these decisions; `phases/phase-05-manufacturer-selection.md` is
rewritten as an implementable spec deriving from them without
contradiction (see that file).
**Created:** 2026-07-13, before Phase 5 was authorized to begin.
**Decisions closed:** 2026-07-13 (same day, second pass, after the
initial philosophy-only draft).
**Depends on:** Phase 01 (Product Engineering Passport, `APPROVED /
FROZEN v1.0`), Phase 02 (Manufacturer Registry, `APPROVED / FROZEN
v1.0`), Phase 03 (Manufacturer Intake Portal, `APPROVED / FROZEN v1.0`),
Phase 04 (Engineering Compliance Validation, `APPROVED / FROZEN v1.0`) —
the Selection Engine consumes Phase 4's Global Result Model
(`ENGINEERING_RULE_ENGINE.md`, "Global Result Model") as its sole
technical-eligibility input.
**Governs:** Phase 05 — Manufacturer Selection
(`phases/phase-05-manufacturer-selection.md`). No Phase 5 code,
migration, or API may be written until this document exists, its Open
Questions are resolved, and Phase 5's own spec is updated to derive from
it.

## What This Document Is, and Is Not

This is **not** an API specification. It defines no endpoint, no
request/response shape, no route.

This is **not** a table specification. It defines no column, no
migration, no schema.

This is **not** a scoring formula, a weighting model, or a ranking
algorithm. It defines the dimensions a ranking may consider, never their
relative importance or the arithmetic that combines them.

**This is the definition of what the Manufacturer Selection Engine
decides, why, and under what constraints.** Every future decision about
Phase 5's data model, API, or code must derive from this document, not
the other way around. If Phase 5's eventual implementation needs to
deviate from something stated here, that deviation is itself a decision
requiring a new ADR that explicitly supersedes the relevant section —
the same discipline already applied to every frozen phase in this
platform.

The Selection Engine does not decide whether a Manufacturer *can*
produce a Passport's specification — that question is closed, exactly
once, by Phase 4's Global Result Model before Selection ever runs. The
Selection Engine decides which of the Manufacturers who *can* is the
best choice **for ELIMFILTERS**, and it never revisits, recomputes, or
second-guesses Phase 4's answer to do so.

## 1. Philosophy

These ten terms are used precisely and never interchangeably throughout
Phase 5 and this document.

### Manufacturer Recommendation

The Selection Engine's complete output for one Passport at one point in
time: a structured, versioned statement of which Manufacturer Offer(s)
it proposes for the Primary, Secondary, and Backup tiers (§7), together
with the full basis for each — every candidate considered, the exact
`(offer_id, offer_revision)` evaluated for each, and the reasoning that
produced the ranking. A Manufacturer Recommendation is **always a
proposal**, never a commitment — it does not by itself authorize
production, an order, or any commercial commitment. It is the direct
analog of Phase 4's `MECHANICALLY_ELIGIBLE_FOR_APPROVAL` flag: a
mechanical, reproducible output that still requires a human act (§8) to
become actionable.

### Primary Manufacturer

The Manufacturer Offer the Selection Engine recommends as ELIMFILTERS'
first choice for a given Passport at a given point in time. Exactly one
Primary Manufacturer exists per active Manufacturer Recommendation
(never zero *and* a recommendation still considered actionable — see
§7's "no eligible candidate" case; never more than one). Being Primary
carries no implicit exclusivity over other Passports, families, or
future demand — it is scoped to exactly the one Passport the
recommendation was computed for.

### Secondary Manufacturer

The Manufacturer Offer the Selection Engine recommends as ELIMFILTERS'
next-best choice for the same Passport, to be used if the Primary
becomes unavailable, non-compliant, or otherwise unsuitable without
requiring an entirely new selection cycle. A Secondary Manufacturer is
optional — it is absent (never a placeholder, never fabricated) when
fewer than two eligible candidates exist (§4).

### Backup Manufacturer

The Manufacturer Offer the Selection Engine recommends as a third-tier
fallback, distinct from Secondary — used only if both Primary and
Secondary are simultaneously unavailable. Also optional, absent when
fewer than three eligible candidates exist. A Backup Manufacturer exists
specifically to address **supply continuity risk** (§3, Strategic
dimension), not merely to fill a third ranking slot — see §7 for the
distinction in how Backup may be chosen differently from a pure
continuation of the Primary/Secondary ranking order.

### Eligible Manufacturer

A Manufacturer whose current Offer for a given Passport satisfies every
condition in §4. Eligibility is a strict gate, evaluated identically for
every candidate — it is never itself a ranking signal (an Offer does not
rank higher for being "more eligible"; it is either eligible or excluded,
per §5). Eligibility must be re-derived at the moment of every Selection
run, never cached or assumed to still hold from a prior run.

### Preferred Manufacturer

A Manufacturer that ELIMFILTERS has designated, through **Selection
Policy** (below), as one to be favored in ranking — for reasons the
Selection Engine's ordinary evaluation factors (§3) would not otherwise
capture on their own: a long-term strategic relationship, an investment
already made in that Manufacturer's tooling, a volume commitment already
negotiated outside this platform. "Preferred" is a policy input the
ranking philosophy (§6) may weigh; it is never a substitute for
eligibility, and a Preferred Manufacturer that is not Eligible (§4) can
never be recommended, regardless of preference.

### Selection Policy

The named, versioned set of organizational rules and preferences that
parameterizes how the Selection Engine ranks Eligible Manufacturers —
for example, a declared preference for geographic diversification, a
declared cap on concentration in a single country, or a declared list of
Preferred Manufacturers for a specific product family. A Selection
Policy is **never** the same thing as the Manufacturer Recommendation it
produces — one policy, applied identically, must produce the same
ranking for the same set of eligible candidates (reproducibility, §2).
Changing the Selection Policy is itself a re-selection trigger (§10).

### Re-selection

The act of running the Selection Engine again for a Passport that
already has an active Manufacturer Recommendation, producing a new,
independently versioned Manufacturer Recommendation that supersedes the
prior one (§9). Re-selection is never a mutation of the existing
recommendation — it is always a new computation, triggered by one of the
events in §10.

### Manual Override

An explicit ELIMFILTERS decision, recorded by an authorized human role
(§8), to depart from what the Selection Engine's own ranking would have
produced — for example, retaining a Manufacturer the ranking would have
demoted, or promoting one the ranking placed lower. A Manual Override
can only ever select **among Eligible Manufacturers** (§4) — it can
never promote an ineligible or excluded (§5) Manufacturer into a tier,
for exactly the same reason Phase 4's `ADMIN_OWNER` can never convert a
technically-failed Offer into an approved one (Decision 09,
ADR-0047/ADR-0052): a human may choose differently among what is
possible, never redefine what is possible.

### Strategic Allocation

A deliberate ELIMFILTERS decision to distribute demand for a Passport
(or a product family) across more than one Eligible Manufacturer
simultaneously — for example, splitting volume 70/30 between Primary and
Secondary rather than sourcing 100% from Primary — for supply-continuity
or negotiating-leverage reasons. Strategic Allocation is a **downstream
consumer** of a Manufacturer Recommendation (used by Phase 9, Order
Management, when it exists), never something the Selection Engine itself
computes or decides — the Selection Engine produces a ranked
recommendation; how ELIMFILTERS chooses to allocate actual demand across
that ranking is a separate, later decision.

## 2. Principles

These principles are non-negotiable constraints on any future Selection
Engine implementation. Any design that violates one requires a new ADR
explicitly overriding it — never a silent implementation choice.

1. **Never select on price alone.** FOB price is one commercial
   dimension among several (§3); a ranking model that reduces to "lowest
   FOB wins" is a defect, not a valid simplification, regardless of how
   the eventual weighting formula is decided.
2. **Engineering always has priority.** No commercial, operational, or
   strategic dimension can ever outrank or compensate for a failure of
   engineering eligibility (§4) — an Offer that Phase 4 has not
   determined mechanically and humanly eligible cannot be recommended at
   any tier, regardless of how attractive its commercial terms are.
3. **Every selection must be fully auditable.** Every Manufacturer
   Recommendation must record every candidate considered, why each
   candidate was included or excluded, and the exact basis for the
   ranking produced — never a bare "Manufacturer X selected" with no
   reconstructable reasoning.
4. **Every selection must be versioned.** No Manufacturer Recommendation
   is ever overwritten in place; a new selection is always a new,
   independently dated version, per §9. The full history of every past
   recommendation for a Passport must remain reconstructable forever.
5. **The engine never modifies Passport, Offer, or Validation data.**
   The Selection Engine is a pure consumer of Phase 1 (Passport), Phase
   3 (Offer), and Phase 4 (Validation/Engineering Decision) data. It
   never writes back to any of those phases' tables, exactly as Phase 4
   never writes back into Phase 1/2/3 beyond the one documented,
   non-authoritative projection (`phase-04-validation-engine.md`,
   Integration Points).
6. **It only consumes validated information.** Every input the Selection
   Engine reads must already have passed through its own phase's
   validation — an Offer that has not completed Phase 4's Engineering
   Compliance Validation, or whose Engineering Decision does not
   indicate eligibility (§4), is invisible to Selection, never a
   candidate to be filtered out at ranking time.
7. **Every recommendation must be reproducible.** Given the identical set
   of Eligible Manufacturer Offers, the identical Selection Policy, and
   the identical evaluation-factor data, running the Selection Engine
   again must produce the identical ranking. Any element of
   non-determinism (a random tiebreak, an unrecorded manual input) is a
   defect against this principle.

## 3. Evaluation Factors

These are the dimensions the ranking philosophy (§6) may draw on, now
organized into the four weighted categories closed by Decision 01
(ADR-0062, §3A below): **Technical Quality (40%)**, **Commercial
Competitiveness (25%)**, **Operational Capability (20%)**, **Strategic
Resilience (15%)**. The category boundaries below are fixed by this
document; the *weights themselves* (and every normalization function)
belong to a versioned **Selection Policy** (§1, §3A), never to this
document or to hardcoded engine constants.

### Engineering (Technical Quality — 40%)

- **Validation Result** — the Global Result Model's Mechanical
  Compliance Result (`MECHANICALLY_PASS` / `MECHANICALLY_FAIL` /
  `REQUIRES_ENGINEERING_REVIEW`) and Engineering Decision (`APPROVED` /
  `CONDITIONALLY_APPROVED` / `REJECTED` / `PENDING_REVIEW`), per
  `ENGINEERING_RULE_ENGINE.md`. This dimension is the eligibility gate
  itself (§4) as much as a ranking input — see Principle 2.
- **Rule Failures** — the count, severity, and category of any `WARNING`
  Rule Results still present even on an otherwise-eligible Offer (an
  Offer can be `APPROVED` while still carrying non-blocking `WARNING`s,
  per Decision 03/ADR-0041 — these remain visible to Selection as a
  quality signal even though they never blocked eligibility).
- **Exceptions** — the count and nature of any `APPROVED` Exceptions
  (Decision 07/ADR-0045) an Offer required to become eligible, and their
  `effective_disposition = ACCEPTED_BY_EXCEPTION` distinction (Decision
  06 correction round/ADR-0054) from genuine technical compliance — an
  Offer that needed zero Exceptions is a different engineering profile
  than one that needed several, even though both may be equally
  `APPROVED`.
- **Conditions** — the presence, nature, and status of any structured
  Conditions attached to a `CONDITIONALLY_APPROVED` Engineering Decision
  (Decision 08/ADR-0046), including whether any remain `OPEN`/`OVERDUE`
  (which would itself affect eligibility, §4) versus fully `SATISFIED`/
  `WAIVED`.
- **Certifications** — the Manufacturer's current certification status
  for the applicable product family/category (Phase 2, Manufacturer
  Registry), independent of the specific Offer's own Engineering
  Decision.

### Commercial (Commercial Competitiveness — 25%)

- **FOB** — the Offer's unit FOB price (Phase 3).
- **MOQ** — minimum order quantity (Phase 3).
- **Tooling Cost** — the Offer's `tooling_cost` (Phase 3).
- **Sample Cost** — the Offer's `sample_cost` (Phase 3).
- **Offer Expiration** — how much of the Offer's effectiveness window
  (`expires_at`/`offer_validity_until`, Phase 3) remains at Selection
  time; an Offer nearing expiration is a different commercial
  proposition than a freshly submitted one even at an identical price.

Lead Time and Capacity are evaluated under **Operational**, not here —
they are a plant's operating characteristics, not a price term (Decision
01).

### Operational (Operational Capability — 20%)

- **Lead Time** — the Offer's quoted `lead_time_days` (Phase 3).
- **Monthly Capacity** — the Offer's stated `monthly_capacity` (Phase 3).
- **Plant/Location Rating** — the Manufacturer location's qualification
  standing and any `capability_type = MONTHLY_CAPACITY`/`PROCESS`
  declarations for the applicable family (Phase 2).
- **Verified Capacity** — whether the Manufacturer's declared capacity
  capability (Phase 2, `ebp_manufacturer_capabilities`) carries
  `review_status = VERIFIED` rather than merely `DECLARED` — a verified
  figure is a different operational signal than a self-reported one.
- **Response Time** — how quickly this Manufacturer has historically
  responded to Manufacturer Request Batches (Phase 3) and to
  Exception/Condition follow-ups (Phase 4).
- **Historical Performance / Reliability** — realized performance on
  prior orders for this Manufacturer (once Phase 9, Order Management,
  exists and produces this data) — on-time delivery, quality escapes,
  quantity accuracy, offer-to-production accuracy. Absent until Phase 9
  exists; never fabricated as a default score in the interim (§3A).
- **Stability** — continuity of the Manufacturer's own qualification
  status over time (Phase 2) — a Manufacturer with a volatile
  qualification history (frequent `SUSPENDED`/reinstated cycles) is a
  different operational risk than one with an unbroken `QUALIFIED`
  record, independent of its current instantaneous status.

### Strategic (Strategic Resilience — 15%)

- **Geographic Diversification** — how selecting this Manufacturer would
  affect the geographic spread of ELIMFILTERS' supplier base for this
  Passport or product family, versus concentrating further in one
  country/region.
- **Country Risk** — political, logistical, or regulatory risk
  associated with the Manufacturer's country of operation.
- **Manufacturer Concentration** — how much of ELIMFILTERS' total volume
  (across Passports/families) already depends on this specific
  Manufacturer — a candidate that would push concentration higher is a
  different strategic proposition than one that would not, independent
  of its individual merits for this one Passport.
- **Technology Specialization** — alignment between the Manufacturer's
  declared technology capabilities (Phase 2) and the Passport's required
  `technology_code` (Phase 1) — a Manufacturer specialized in exactly
  this technology is a different strategic fit than a generalist that
  merely also qualifies.
- **Product Family Coverage** — how many other Passports/families within
  the same product line this Manufacturer already covers — both a
  potential efficiency (consolidation) and a potential risk
  (concentration) signal; scored per the Selection Policy's declared
  intent for this dimension (§3A), never assumed one way by the engine
  itself.
- **Availability of Alternatives** — how many other Eligible Manufacturers
  (§4) exist for this Passport/family; a input to how aggressively
  diversification is worth pursuing (§7's Backup divergence).

## 3A. Weighting, Normalization, and the Technical Priority Rule (Decision 01, ADR-0062)

**No weight is ever hardcoded inside the engine.** Every weight, every
normalization function, and every gate/penalty rule in this section
belongs to a versioned **Selection Policy** (§1, §9); the values below
are Selection Policy v1.0's initial values, not engine constants, and a
future Selection Policy version may change them without any code change
— only a new Policy version (§9's governance, Decision 07/ADR-0068).

**Base weights (sum to 100%):**

| Category | Weight |
|---|---|
| Technical Quality | 40% |
| Commercial Competitiveness | 25% |
| Operational Capability | 20% |
| Strategic Resilience | 15% |

**Technical Priority Rule (Principle 2, restated precisely):** the
composite score computed from these weights can **never** make an
ineligible Offer (§4) eligible, and can never substitute for eligibility.
Scoring only ever ranks candidates that are *already* Eligible (§4) —
eligibility is evaluated first, unconditionally, before any weight is
applied to anything.

- An Offer carrying one or more `APPROVED` Exceptions (§3, Engineering)
  may still compete, but it must receive an explicit, traceable
  **technical penalty** within the Technical Quality score — never
  scored as if it were an unconditioned `MECHANICALLY_PASS` Offer with
  zero Exceptions. The exact penalty magnitude is a Selection Policy
  parameter (§3A "Selection Policy fields" below), not a hardcoded
  number.
- A `CONDITIONALLY_APPROVED` Offer may only compete in an **official**
  Selection run once every mandatory Condition is `SATISFIED` or
  `WAIVED` (never `OPEN`/`OVERDUE`/`FAILED`) — this is not a separate
  rule invented here, it is exactly §4's existing Engineering Decision
  eligibility condition, restated for emphasis because it is the
  precondition scoring itself depends on.

**Normalization:** every one of the factors in §3 (Engineering,
Commercial, Operational, Strategic) must produce a **normalized score
between 0 and 100** before it is weighted. The specific normalization
function per factor (e.g., linear scaling between the pool's observed
min/max FOB, a fixed lookup table for qualification stability, a
step function for exceptions count) is declared, per factor, inside the
Selection Policy version in force — never scattered as a magic number
inside engine code. A Selection Policy version's normalization
functions and limits are themselves part of what must be reproducible
(Principle 7) and versioned (§9) — two runs against the same Policy
version and the same input data must produce identical normalized
scores.

**Composite score formula (Selection Policy v1.0):**

```
composite_score =
    0.40 * technical_quality_score
  + 0.25 * commercial_competitiveness_score
  + 0.20 * operational_capability_score
  + 0.15 * strategic_resilience_score
```

where each `*_score` is itself a 0-100 aggregate of that category's
normalized factor scores, per the Selection Policy's declared
per-category aggregation (also a Policy field, not fixed by this
document — e.g., an unweighted average of the category's own factors is
Selection Policy v1.0's initial default, itself replaceable by a future
Policy version without an engine code change).

A **Preferred Manufacturer** bonus (§1, Decision 10/ADR-0071) is applied,
if any, strictly *after* `composite_score` is computed — the ranking
must always be able to display the pre-bonus score, the bonus applied,
and the final score as three distinct, retained values (§12).

## 4. Eligibility (seven-part gate, Decision 11/ADR-0072)

An Offer is eligible to enter the Selection process for a given Passport
only when **all seven** of the following hold, evaluated fresh at the
moment Selection runs (never cached from a prior run). This gate
supersedes the predecessor draft's five-part ADR-0010 gate — see the
Resolved Decisions §11 note below for exactly what changed and why.

1. **Offer activa y vigente** — the Offer is the current active revision
   for its `(passport_id, engineering_revision, manufacturer_id)` lineage
   (not `SUPERSEDED`, `WITHDRAWN`, `REJECTED`, or `EXPIRED`), and has not
   passed its `expires_at`.
2. **Validation Run `CURRENT`** — a `CURRENT` (never `STALE`) Validation
   Run exists for this exact `(offer_id, offer_revision)`, per Phase 4's
   Decision 12/ADR-0050 full-coarse-invalidation model.
3. **Engineering Decision `APPROVED`/`CONDITIONALLY_APPROVED`** — the
   Validation Run's associated Engineering Decision is one of these two
   (never `REJECTED` or the system-only `PENDING_REVIEW`), and its
   `status` is `CURRENT` (never `NEEDS_REVIEW`, per the correction
   round/ADR-0055).
4. **No condiciones obligatorias abiertas/vencidas/fallidas** — for a
   `CONDITIONALLY_APPROVED` decision, every mandatory Condition is
   `SATISFIED` or formally `WAIVED` (never `OPEN`/`OVERDUE`/`FAILED`).
   Points 2-4 together are exactly `computeSelectionEligibility()`'s
   existing contract (`ebp/phase4/service.js`, correction round/ADR-0055)
   — Selection must call that function (or an equivalent producing an
   identical result), never re-derive it independently from raw Rule
   Results.
5. **Commercial Approval `APPROVED`** — a distinct, Phase-5-owned
   **Offer Commercial Approval** record (Decision 11/ADR-0072; not the
   Engineering Decision, never merged with it) exists for this exact
   `(offer_id, offer_revision)`, recorded by a `COMMERCIAL_APPROVER`, and
   is `APPROVED`. An Offer with no Commercial Approval, or a `PENDING`/
   `REJECTED` one, may appear only in a `PRELIMINARY_COMPARISON` (§4A),
   never in an official recommendation.
6. **Manufacturer y ubicación calificados** — the Manufacturer's Phase 2
   qualification status for the applicable product family/location is
   `QUALIFIED` or `CONDITIONAL`-satisfied (never `SUSPENDED`,
   `CANDIDATE`, or otherwise not yet cleared).
7. **Certificaciones vigentes** — any certification Phase 2 records as
   required for this product family/category is current (`VERIFIED`,
   not expired) on the Manufacturer's record.

An Offer failing any one of these is not ranked lower — it is not a
candidate at all (§5).

## 4A. Preliminary Comparison (carried forward from ADR-0010, restated under the seven-part gate)

An Offer that satisfies points 1-4 and 6-7 above but not yet point 5
(Commercial Approval) may be evaluated in an internal, explicitly and
permanently labeled `PRELIMINARY_COMPARISON` — for planning visibility
only. A `PRELIMINARY_COMPARISON` can never be promoted, converted, or
silently reused as an official Manufacturer Recommendation, and never
feeds Primary/Secondary/Backup tier assignment. Producing an official
recommendation always re-evaluates the full seven-part gate fresh — it
never reuses a `PRELIMINARY_COMPARISON` result as-is.

## 5. Exclusions

A Manufacturer/Offer is automatically excluded from Selection — removed
from the candidate pool entirely, never merely deprioritized — whenever
any of the following holds:

- **Suspended** — the Manufacturer's Phase 2 status is `SUSPENDED` for
  the applicable family, regardless of any individual Offer's own
  Engineering Decision.
- **Expired Offer** — the Offer's `expires_at` has passed.
- **Invalid Validation** — the current Validation Run's
  `mechanical_result` is `MECHANICALLY_FAIL`, or no `CURRENT` Validation
  Run exists at all for this exact `(offer_id, offer_revision)`.
- **Missing Certification** — a certification Phase 2 requires for this
  product family/category is absent or expired.
- **Required Condition overdue** — a mandatory Condition attached to a
  `CONDITIONALLY_APPROVED` Engineering Decision is `OVERDUE` or `FAILED`
  (this is the same fact that already makes the Engineering Decision's
  effective `status` become `NEEDS_REVIEW`, per ADR-0055 — Exclusion
  here is the Selection-side consequence of that same fact, not an
  independent check).

Exclusion is always re-evaluated at the moment of Selection or
Re-selection — a Manufacturer excluded in a past recommendation is not
permanently barred; if the excluding condition clears (Certification
renewed, Condition satisfied, Suspension lifted), the Manufacturer
becomes a candidate again in the next Selection run.

## 6. Ranking

This section defines the ranking's **philosophy**, never its algorithm.
No scoring formula, weighting, or point system is decided here — see
Open Questions.

- **How it is constructed:** a ranking is built exclusively from the
  pool of Eligible Manufacturers (§4) for one Passport, evaluated across
  the Evaluation Factors (§3) as parameterized by the current Selection
  Policy. A ranking is a complete, ordered list — every eligible
  candidate appears in it, not only the ones that end up in a named tier
  (§7). Never a partial computation that stops once Primary/Secondary/
  Backup are found.
- **When it is recalculated:** whenever a Re-selection is triggered
  (§10) — never incrementally patched. A ranking is either the current,
  fully valid output of the latest run, or it is superseded in its
  entirety by a new one; there is no partial re-ranking of only the
  candidates that changed.
- **When it stops being valid:** the moment any input to the ranking
  changes for any candidate in the pool — a new Offer revision, a
  changed Validation result, a changed Manufacturer status, a changed
  Selection Policy, or an Offer's expiration passing. A stale ranking is
  never silently reused; it must be explicitly recomputed (Re-selection,
  §10) before being relied upon again.
- **When it must be reviewed (human attention, not automatic
  recomputation):** whenever a Re-selection materially changes the
  Primary tier from what it was previously (a "your recommendation
  changed" signal distinct from "your recommendation was refreshed with
  the same result") — this is the trigger for
  `SELECTION_REVIEW_REQUIRED` (§11).

### Tie-Break Rules (Decision 01/ADR-0062, resolving the reproducibility gap Principle 7 requires)

Applied, in order, only when two or more candidates produce an identical
`composite_score` (post-bonus) at any tier boundary:

1. Higher Technical Quality (category) score.
2. Fewer/lower-severity Engineering Exceptions.
3. Better normalized FOB (Commercial).
4. Shorter Lead Time (Operational).
5. Greater available Capacity (Operational).
6. Better diversification versus already-assigned tiers (Strategic).
7. Greater remaining Offer validity window (Commercial).
8. If the tie still persists after all seven: the Selection Run's result
   is `TIE_REQUIRES_HUMAN_REVIEW` (§ "Result Model" below) — **never**
   resolved by database row order, `created_at`, or manufacturer code.
   A human (`SELECTION_APPROVER`/`ADMIN_OWNER`, §8) must break the tie via
   Manual Override; the engine itself never guesses.

## 7. Primary / Secondary / Backup

### Requirements

- **Primary** requires at least one Eligible Manufacturer to exist; if
  none exist, there is no actionable Manufacturer Recommendation for
  that Passport at all (a state Selection must be able to represent
  explicitly — see Open Questions, "no eligible candidate").
- **Secondary** requires at least two Eligible Manufacturers; absent,
  never fabricated, when only one exists.
- **Backup** requires at least three Eligible Manufacturers, absent when
  fewer exist.

### Differences

Primary and Secondary are, by default, consecutive positions in the same
ranking (§6) — Secondary is "the next-best after Primary" under the
identical ranking philosophy. Backup diverges from strict rank order by
policy, not by default (Decision 04/ADR-0065): the Selection Policy in
force declares whether Backup-divergence is active for a given scope,
and if so:

- **Required divergence factors** — the Policy declares which of
  {different Manufacturer, different factory location, different
  country, different corporate group (once modeled), different/
  alternative compatible technology} must differ from Primary/Secondary
  before a candidate qualifies as a diversified Backup.
- **Preferred divergence factors** — additional factors the Policy
  weighs favorably but does not require.
- **Permitted exceptions** — conditions under which the Policy allows a
  non-diversified Backup anyway (e.g., fewer than the required number of
  distinct countries exist among Eligible Manufacturers for this
  Passport).

If no sufficiently divergent candidate exists among the Eligible pool,
the Selection Engine falls back to the next Eligible candidate in strict
rank order for Backup, and the Manufacturer Recommendation is explicitly
marked `BACKUP_DIVERSIFICATION_LIMITED` (never silently presented as if
full diversification had been achieved) — this state also raises the
`BACKUP_DIVERSIFICATION_LIMITED` alert (§11).

### Replacement rules

Replacing a tier (e.g., Primary becomes unavailable) is never an edit to
the existing Manufacturer Recommendation — it is always a new
Re-selection (§9/§10), even if the resulting ranking happens to promote
Secondary into Primary unchanged. The historical recommendation that
named the now-unavailable Primary remains exactly as it was recorded.

### Promotion rules

A candidate may only ever be promoted into a higher tier (Backup →
Secondary → Primary) as the *result* of a Re-selection run — never as a
standalone action that reorders an existing recommendation in place.
Promotion driven by a Manual Override (§8) is the one exception, and it
is itself recorded as its own distinct, audited event, never
retroactively merged into the ranking's own reasoning.

### Degradation rules

A candidate may drop out of the ranking entirely (not merely to a lower
tier) the moment it becomes ineligible (§4) or excluded (§5) — it is
never left in a stale tier pointing at a no-longer-eligible Offer. A
Passport whose Primary degrades and has no eligible Secondary to promote
must be able to explicitly represent "Primary lost, no eligible
replacement" as its own state — never silently falling back to an
Offer that would fail Phase 4's own gate.

## 8. Manual Override (Decisions 05/06, ADR-0066/ADR-0067)

- **When it exists:** whenever ELIMFILTERS wishes to select differently
  from what the Selection Engine's own ranking produced, for any of the
  Evaluation Factors (§3) the ranking may have under- or over-weighted,
  or for a reason genuinely outside all of them (e.g., a negotiated
  volume commitment made outside this platform).
- **Who can use it — three functional roles, none of them the engine
  itself, none Manufacturer/Distributor-facing:**
  - **`SELECTION_REVIEWER`** — reviews rankings, may request
    clarification. Cannot approve an override.
  - **`SELECTION_APPROVER`** — approves a recommended Selection; may
    *request* a Manual Override.
  - **`ADMIN_OWNER`** — approves or rejects the requested Manual
    Override. Can never make an ineligible Offer (§4) eligible — exactly
    the same boundary already governing `ADMIN_OWNER` in Phase 4
    (Decision 09/ADR-0047/ADR-0052).
  - The MVP reuses `requireAdmin` with functional role assignments (the
    same pattern as Phase 4 Decision 01/ADR-0039): `declared_actor` +
    `identity_mechanism = ADMIN_KEY_SHARED` are recorded, never presented
    as a cryptographically distinct identity.
  - A Manual Override always requires **two separate actions**: (1) a
    request by `SELECTION_APPROVER`; (2) an approval or rejection by
    `ADMIN_OWNER`. The same declared actor can never perform both actions
    for the same override.
- **Mandatory audit:** every Manual Override must record: which tier was
  overridden, what the Engine's own ranking would have produced for that
  tier (the pre-override candidate and its composite score), what was
  chosen instead, the requesting actor, the approving/rejecting actor,
  when each action occurred, and a documented reason — never an override
  with no recorded justification.
- **Duration (resolved via the Selection Decision model, § "Result
  Model"):** a Manual Override applies to exactly the one Selection
  Version/Manufacturer Recommendation it was recorded against. A new
  Re-selection always produces a new Selection Version with its own
  fresh `Selection Decision` in state `PENDING_REVIEW` — it never
  inherits a prior override automatically. If ELIMFILTERS wants the same
  divergent choice again after a Re-selection, a fresh override request/
  approval is required against the new version. This follows directly
  from Principle 4 (never overwritten) and §9 (a version is immutable) —
  an override is itself scoped to the version it modifies, not to the
  Passport in perpetuity.
- **Traceability:** an overridden Manufacturer Recommendation must still
  show, unambiguously, both what the Engine recommended and what was
  actually chosen — never overwriting one with the other.
- **Impact on future selections:** overrides are retained as durable,
  queryable analytical data (which Manufacturer was chosen over the
  Engine's own top-ranked candidate, how often, for which stated reasons)
  but **never automatically feed back into the ranking formula, the
  Selection Policy's weights, or a candidate's composite score.** A
  pattern of overrides may, in the future, be read by a human as evidence
  to justify a new, explicit `Preferred Manufacturer` designation (§1,
  Decision 10/ADR-0071) — but that designation is itself a separate,
  explicit, human, versioned governance act (§ "Preferred Manufacturer
  Governance"), never an automatic consequence of override history. Any
  machine-learned or automatic weight adjustment derived from override
  patterns requires its own future ADR explicitly authorizing it — it is
  out of scope for Phase 5 v1.0.

## 9. Versioning

- **Selection Version** — every Manufacturer Recommendation is one
  immutable, numbered version in the sequence of recommendations for its
  Passport — the same discipline Phase 1 applies to
  `engineering_revision` and Phase 4 applies to Validation Runs (Decision
  12/ADR-0050). A version is never edited after it is produced.
- **Effective Date** — the timestamp from which a given Selection
  Version is the operative recommendation, distinct from when it was
  computed (which may coincide, but need not — e.g., a recommendation
  computed ahead of an Offer's `effective_from` date).
- **Superseded Selection** — a prior Selection Version that a newer one
  has replaced; marked as superseded, never deleted, never overwritten —
  mirroring Phase 4's `STALE` Validation Run treatment exactly.
- **Historical Selection** — the complete, permanently queryable
  sequence of every Selection Version ever produced for a Passport,
  including every superseded one, each with its own full basis (§1,
  Manufacturer Recommendation) intact.
- **Selection Policy Version** (Decision 07/ADR-0068) — the weights,
  normalizations, gates, penalties, diversification rules, tie-break
  parameters, and concentration thresholds (§3A, §6, §8) are themselves
  a distinct versioned entity from the Manufacturer Recommendation they
  parameterize. Every Selection Run records exactly which Selection
  Policy Version it used, so a past recommendation is always explainable
  in terms of the exact policy in force when it ran — never a
  reconstruction from the *current* policy.

**A Manufacturer Recommendation is never overwritten.** Every
Re-selection produces a new Selection Version; the prior one becomes
Superseded, exactly as a Phase 4 Validation Run becomes `STALE` rather
than being mutated.

### Result Model (Decision-set close-out; three permanently distinct concepts, mirroring ADR-0051's Global Result Model discipline)

Exactly as Phase 4 keeps Mechanical Compliance Result / Engineering
Decision / Offer Approval structurally distinct (ADR-0051), Phase 5
keeps three concepts distinct, never merged into one status column:

1. **Selection Run Result** (automatic, no human step) — the mechanical
   outcome of running the engine once: `RECOMMENDATION_READY` /
   `NO_ELIGIBLE_CANDIDATE` / `TIE_REQUIRES_HUMAN_REVIEW` /
   `INSUFFICIENT_DATA` / `POLICY_CONFLICT` / `STALE`.
2. **Manufacturer Recommendation** (§1) — the ordered candidate list,
   scores, factors, exclusions, and named Primary/Secondary/Backup tiers
   a `RECOMMENDATION_READY` run produces. Never itself an approval.
3. **Selection Decision** (always human, one of `SELECTION_APPROVER`/
   `ADMIN_OWNER`) — `PENDING_REVIEW` / `APPROVED` / `OVERRIDDEN` /
   `REJECTED` / `SUPERSEDED`. **The engine recommends; it never
   auto-approves a final selection.** A new Selection Run's
   Recommendation always starts its Selection Decision at
   `PENDING_REVIEW`; the prior version's Selection Decision (whatever
   state it was in) becomes `SUPERSEDED`.

`NO_ELIGIBLE_CANDIDATE` (Decision 03/ADR-0064): when zero Offers pass the
seven-part gate (§4), the Selection Run still completes as a valid,
recorded run — it is not an error and not silently skipped. It produces
no Primary, Secondary, or Backup; the excluded candidates and their exact
exclusion reasons (§5) are retained; `SELECTION_REVIEW_REQUIRED` (§11) is
emitted; and the `PRODUCT_WITHOUT_ELIGIBLE_MANUFACTURER` alert (§11) is
raised. The engine never automatically selects "the least-bad"
ineligible candidate under any circumstance.

## 10. Re-selection

Re-selection (§1) must be triggered — an existing Manufacturer
Recommendation must never simply be treated as still valid — whenever
any of the following occurs:

- **Nueva Offer revision** — a Manufacturer submits a new Offer revision
  for the Passport (Phase 3), whether from the current Primary/Secondary/
  Backup or a new candidate entirely.
- **Nueva Validation Run** — a new Validation Run (Decision 12/ADR-0050)
  completes for any Offer already in, or newly eligible for, the
  candidate pool — including the automatic revalidation Phase 4 now
  triggers on every Exception decision (correction round/ADR-0053).
- **Cambio de Engineering Decision / Condition** — the Engineering
  Decision or any of its linked Conditions changes state for any
  candidate in the pool.
- **Nueva Exception** — an Exception is requested, approved, or rejected
  for any candidate Offer.
- **Cambio de Commercial Approval** — the new Offer Commercial Approval
  entity (§4, point 5) records a decision, or an existing one changes.
- **Suspensión del fabricante** — a Manufacturer's Phase 2 qualification
  status changes to `SUSPENDED` for the applicable family, or its
  qualification itself changes.
- **Cambio de certificaciones** — a required certification is renewed,
  added, or allowed to expire.
- **Expiración** — an Offer in the current recommendation's candidate
  pool passes its `expires_at`.
- **Cambio de Selection Policy version** — a new Selection Policy Version
  becomes `ACTIVE` for the applicable scope (§9, § "Selection Policy
  Governance").
- **Cambio de Preferred Manufacturer** — a Preferred Manufacturer
  designation is created, expires, or is revoked for the applicable
  scope.
- **Cambio de señal de demanda o escenario** — the declared Demand
  Signal (§ "Demand Signal") changes for the Passport.
- **Cambio de concentración relevante** — the Manufacturer/geographic
  Concentration Index (§ "Concentration Index") crosses a Policy
  threshold for the applicable scope.
- **La selección anterior es superseded o degradada** — the prior
  Selection Version's Primary/Secondary/Backup degrades (§7) for any
  reason above.
- **Cualquier otro input utilizado por el cálculo cambia** — the
  catch-all: any data point the last Selection Run actually read has
  changed since that run, for any candidate in the pool.

Re-selection always produces a new Selection Version (§9); it never
mutates the prior recommendation, even when the new computation happens
to reproduce the exact same ranking. The prior version's Selection
Decision (§ "Result Model") becomes `SUPERSEDED`.

## 11. Dashboard Readiness (finalized, Decision-set close-out)

Per ADR-0037 (`PLATFORM_ARCHITECTURE.md` §8), the Selection Engine emits
Activity Events into the same shared, single-model event ledger Phase 4
introduced (`ebp_activity_events`) — never its own independent event
system. Alerts are likewise recorded in the same shared, generic
`ebp_alerts` table Phase 4 introduced (`alert_type`/`entity_type`/
`entity_id`, ADR-0057) — Phase 5 never creates a parallel alerts table.

**Events:** `MANUFACTURER_SELECTION_STARTED`,
`MANUFACTURER_CANDIDATE_EVALUATED`, `MANUFACTURER_EXCLUDED`,
`MANUFACTURER_RECOMMENDED`, `PRIMARY_SELECTED`, `SECONDARY_SELECTED`,
`BACKUP_SELECTED`, `SELECTION_DECISION_RECORDED`,
`SELECTION_SUPERSEDED`, `SELECTION_MARKED_STALE`,
`SELECTION_REVIEW_REQUIRED`, `MANUAL_SELECTION_OVERRIDE_REQUESTED`,
`MANUAL_SELECTION_OVERRIDE_APPROVED`,
`MANUAL_SELECTION_OVERRIDE_REJECTED`, `PREFERRED_MANUFACTURER_APPLIED`.

**KPIs:** products with Primary; products with Secondary; products with
Backup; single-source products; products without eligible manufacturer;
average selection time; override rate; algorithmic recommendation
acceptance rate; manufacturer distribution; country distribution; SKU
Concentration HHI; volume Concentration HHI; limited-diversification
backup count.

**Alerts:** `PRODUCT_WITHOUT_PRIMARY`, `PRODUCT_WITHOUT_BACKUP`,
`NO_ELIGIBLE_MANUFACTURER`, `TIE_REQUIRES_REVIEW`,
`HIGH_MANUFACTURER_CONCENTRATION`, `HIGH_COUNTRY_CONCENTRATION`,
`BACKUP_DIVERSIFICATION_LIMITED`, `SELECTION_STALE`,
`PRIMARY_MANUFACTURER_SUSPENDED`, `PRIMARY_OFFER_EXPIRING`,
`POLICY_CONFLICT`.

**Analytics Views:** an `ebp_analytics_selection_summary` Postgres
`VIEW` (never a materialized copy, mirroring
`ebp_analytics_validation_summary`'s role in Phase 4) — never a raw
transactional table read directly by a future dashboard or API, per the
same ADR-0037 §8.3 convention every phase in this platform now follows.

## Demand Signal (Decision 02, ADR-0063)

Phase 5 v1.0 does not depend on real Phase 9 orders. Demand is an
**optional, declared** input:

- **Type:** `FORECAST` / `TARGET_VOLUME` / `SCENARIO` / `UNKNOWN`.
- **Fields (minimum):** estimated quantity, period, unit, source,
  confidence, date, author.
- If no reliable demand is declared, the ranking still computes; it is
  explicitly marked `DEMAND_NOT_PROVIDED`, capacity/MOQ/cost are
  evaluated against Selection Policy-declared default assumptions
  (never silently invented), and the recommendation is never presented
  as if it were optimized for real volume.
- Phase 9, once it exists, may supply real demand without requiring any
  Selection Engine redesign — the Demand Signal input shape is designed
  to accept either a declared forecast or a real order reference
  identically.

## Concentration Index (Decision 08, ADR-0069)

A Herfindahl-Hirschman-style index: `HHI = Σ(share_i²)`, where `share_i`
is a Manufacturer's proportion of SKUs or assigned volume.

- **`SKU_CONCENTRATION_HHI`** — always computable, from tier assignments
  alone.
- **`VOLUME_CONCENTRATION_HHI`** — only computable once a demand or
  volume-allocation signal exists (§ "Demand Signal").
- **Normalized scale:** `normalized_hhi = HHI × 10,000`.
- **Interpretation (Selection Policy v1.0 initial thresholds, not fixed
  constants):** below 1,500 — low concentration; 1,500-2,500 — moderate;
  above 2,500 — high. A future Selection Policy version may change these
  thresholds without any engine code change.
- Manufacturer concentration and geographic (country) concentration are
  computed and reported as **separate, never-merged** metrics.

## Factor Explainability (Decision 09, ADR-0070)

Every factor score the engine produces is a structured record, never a
free-text sentence alone. Minimum fields per factor per candidate per
Selection Run: `factor_code`, `factor_category` (Engineering/Commercial/
Operational/Strategic), original value, unit, source, source version,
normalized value, weight, weighted contribution, penalty (if any), gate
applied (if any), status, `reason_code`, explanation parameters,
evidence/reference. Human-readable text is generated from `reason_code` +
template, mirroring Phase 4's Observation Catalog discipline (Decision
06/ADR-0044) exactly — never stored as the sole record of "why."
Illustrative `reason_code`s: `SEL_REASON_LOWEST_VALID_FOB`,
`SEL_REASON_TECHNICAL_EXCEPTION_PENALTY`,
`SEL_REASON_CAPACITY_BELOW_TARGET`,
`SEL_REASON_GEOGRAPHIC_DIVERSIFICATION`,
`SEL_REASON_OFFER_EXPIRES_SOON`.

## Selection Policy Governance (Decision 07, ADR-0068)

A Selection Policy is versioned Postgres data, never a code constant.
Each version records: `policy_id`, `policy_version`, name, description,
scope (platform-wide, or scoped to product category/subtype/duty/
technology/region — most-specific scope wins; a conflict between two
policies of *equal* specificity blocks the calculation with
`POLICY_CONFLICT`, never resolved by an arbitrary tiebreak), weights,
criteria, normalization functions, gates, penalties, diversification
rules (§7), tie-break parameters (§6), effective date, status
(`DRAFT`/`UNDER_REVIEW`/`ACTIVE`/`SUPERSEDED`/`RETIRED`), authorship, and
audit trail. An `ACTIVE` version is never edited in place — any change is
a new version. Every Selection Run references the exact policy version
it used (§9). `ADMIN_OWNER` creates and publishes policies; publication
requires audit and testing; **no policy version may weaken a Phase 4
technical gate** — the Technical Priority Rule (§3A) is not a policy
parameter, it is fixed by this document.

## Preferred Manufacturer Governance (Decision 10, ADR-0071)

A Preferred Manufacturer designation is a declared commercial/strategic
preference, never an automatic consequence of past selections or
overrides, and never a gate. Scope: SKU, family, category, technology,
or region. Required fields: reason, validity window, scope, creator,
approver, status (`ACTIVE`/`EXPIRED`/`REVOKED`). A designation may grant
a limited, Selection-Policy-defined bonus (§3A) applied strictly after
`composite_score` — it can never make an ineligible Offer eligible,
override a technical failure, ignore a suspension, substitute for a
required human approval, or hide a lower underlying score. The ranking
always displays pre-bonus score, bonus applied, and final score as three
distinct values.

## Selection vs. Strategic Allocation (Decision 12, ADR-0073)

Phase 5 decides: which Offer is Primary/Secondary/Backup, the
recommendation order, eligibility, concentration risk, and a capacity
recommendation. Phase 5 never decides: final purchase quantities, order
percentage splits, real orders, production dates, containers, shipments,
or contractual volume allocation — all of that is Phase 9 (Order
Management). Phase 5 may emit a non-binding
`suggested_allocation_percentage` and `recommended_capacity_reserve`,
both explicitly marked `ADVISORY_ONLY` — never treated by any downstream
phase as an executed allocation.

## 12. Preparation for AI

Every Manufacturer Recommendation, being a structured (Passport ID,
Selection Version, ranked candidate list with each candidate's
Evaluation-Factor values at decision time, tier assignments, basis text
keyed to specific factors rather than free-form prose) fact rather than
an opaque conclusion, is designed so a future AI-assisted query layer
can answer questions such as:

- *"Why was this manufacturer selected?"* — a direct read of the
  recommendation's recorded basis for that tier, referencing the exact
  Evaluation Factors (§3) that drove the ranking, never a summary
  reconstructed after the fact.
- *"What changed versus the previous selection?"* — a diff between two
  consecutive Selection Versions (§9) for the same Passport: which
  candidate moved tiers, which Evaluation Factor values changed, which
  Re-selection trigger (§10) caused the recomputation.
- *"What manufacturer would be the best replacement?"* — the next-ranked
  Eligible Manufacturer (§4) not currently in a named tier, read
  directly from the full ranking (§6) the current recommendation already
  retains (never only the three named tiers).
- *"What products are at supply risk?"* — an aggregation over Products
  without a Backup (or without even a Secondary), directly from the
  Analytics View/KPI Layer (§11), never requiring a live recomputation.
- *"What manufacturers dominate a product family?"* — an aggregation of
  Primary/Secondary/Backup assignments grouped by product family and
  Manufacturer, the same Manufacturer Concentration signal (§3) already
  tracked as a KPI.
- *"What selection changed for commercial reasons?"* vs. *"...for
  technical reasons?"* — answerable only if the recorded basis (§1)
  explicitly tags which Evaluation Factor category (Engineering /
  Commercial / Operational / Strategic, §3) drove each material change —
  a requirement on the eventual basis-recording format, not yet finalized
  (see Open Questions).

None of this requires building an assistant now. It requires that every
fact the Selection Engine produces be structured, factor-tagged (never a
description invented at recommendation time), and captured as an
Activity Event plus a durable Selection Version, exactly as specified
above — the identical discipline `ENGINEERING_RULE_ENGINE.md` §12
already established for Phase 4.

## Resolved Decisions (2026-07-13, second pass)

The twelve questions originally raised here are now closed by the
project owner. Each decision below is registered by its own ADR in
`DECISIONS.md`; this section is the durable summary, exactly the
discipline `ENGINEERING_RULE_ENGINE.md` "Resolved Decisions" established
for Phase 4.

### Decision 01 — Ranking formula and weights (ADR-0062)

Multicriteria, Selection-Policy-versioned scoring — never hardcoded
weights. Technical Quality 40% / Commercial Competitiveness 25% /
Operational Capability 20% / Strategic Resilience 15% (§3A). The
Technical Priority Rule makes eligibility (§4) a precondition to scoring,
never a factor within it; an `APPROVED`-by-Exception Offer competes but
carries an explicit, traceable penalty; a `CONDITIONALLY_APPROVED` Offer
competes only once every mandatory Condition is `SATISFIED`/`WAIVED`.
Every factor normalizes to 0-100 before weighting; the normalization
functions and limits belong to the Selection Policy Version, never to
engine code. Ties are broken by the fixed, ordered rule in §6's
"Tie-Break Rules"; a tie surviving all eight steps produces
`TIE_REQUIRES_HUMAN_REVIEW` — never a database-order or timestamp
tiebreak.

### Decision 02 — Demand signal (ADR-0063)

Phase 5 v1.0 does not require real Phase 9 orders. Demand is optional and
declared: `FORECAST` / `TARGET_VOLUME` / `SCENARIO` / `UNKNOWN`, with
quantity, period, unit, source, confidence, date, and author. Absent a
reliable signal, ranking still computes, marked `DEMAND_NOT_PROVIDED`,
using Selection-Policy-declared default assumptions for capacity/MOQ/
cost evaluation — never presented as volume-optimized. See "Demand
Signal" above.

### Decision 03 — "No eligible candidate" representation (ADR-0064)

A Passport with zero Eligible Manufacturers still produces a valid,
recorded Selection Run — `NO_ELIGIBLE_CANDIDATE` (§ "Result Model") —
never an error, never a silently-skipped computation, and never an
automatic "least-bad" fallback. No Primary/Secondary/Backup is created;
excluded candidates and reasons are retained; `SELECTION_REVIEW_REQUIRED`
fires; `PRODUCT_WITHOUT_ELIGIBLE_MANUFACTURER` alert is raised.

### Decision 04 — Backup divergence rule (ADR-0065)

Not a rigid universal rule — a Selection-Policy-configurable constraint
(§7). The Policy declares required divergence factors, preferred
factors, and permitted exceptions. When no sufficiently divergent Backup
exists, the next Eligible candidate in rank order is used, marked
`BACKUP_DIVERSIFICATION_LIMITED`, and an alert is raised.

### Decision 05 — Manual Override role (ADR-0066)

Three functional roles: `SELECTION_REVIEWER` (reviews, cannot approve
override), `SELECTION_APPROVER` (approves a recommendation, may request
an override), `ADMIN_OWNER` (approves/rejects the requested override;
can never make an ineligible Offer eligible). MVP reuses `requireAdmin`
with `declared_actor`/`identity_mechanism = ADMIN_KEY_SHARED`. Two
separate actions are always required — request then approval — and the
same declared actor can never perform both for the same override.
**Duration** is resolved via the Result Model (§9): an override applies
to exactly the Selection Version it was recorded against; a Re-selection
always starts a fresh `PENDING_REVIEW` Selection Decision, never
inheriting a prior override automatically.

### Decision 06 — Override and future ranking (ADR-0067)

A Manual Override never modifies the formula, weights, original score,
Selection Policy, or historical results. The system retains, always
simultaneously: the algorithmic recommendation, the finally approved
selection, their difference, and the override's reason. Overrides may
be used as future analytical data but never automatically feed back into
the algorithm; any ML/weight adjustment derived from override history
requires its own future ADR.

### Decision 07 — Selection Policy governance (ADR-0068)

Selection Policy is versioned Postgres data (§ "Selection Policy
Governance"): `policy_id`, `policy_version`, name, description, scope,
weights, criteria, normalizations, gates, penalties, diversification
rules, tie-break parameters, effective date, status
(`DRAFT`/`UNDER_REVIEW`/`ACTIVE`/`SUPERSEDED`/`RETIRED`), authorship,
audit. An `ACTIVE` version is never edited; scope may be platform-wide
or scoped to category/subtype/duty/technology/region, with
most-specific-scope-wins; equal-specificity conflicts block computation
(`POLICY_CONFLICT`). `ADMIN_OWNER` creates/publishes policies; no policy
may weaken a Phase 4 technical gate.

### Decision 08 — Concentration Index (ADR-0069)

Herfindahl-Hirschman-style: `HHI = Σ(share_i²)`, computed separately as
`SKU_CONCENTRATION_HHI` (always available) and `VOLUME_CONCENTRATION_HHI`
(only once demand/allocation data exists). `normalized_hhi = HHI ×
10,000`; interpretation thresholds (<1,500 low, 1,500-2,500 moderate,
>2,500 high) are versioned Selection Policy parameters, not fixed
constants. Manufacturer concentration and country concentration are
always separate metrics, never merged.

### Decision 09 — Factor explainability (ADR-0070)

Every factor score is a structured record (§ "Factor Explainability"):
`factor_code`, `factor_category`, original value, unit, source, source
version, normalized value, weight, weighted contribution, penalty, gate
applied, status, `reason_code`, explanation parameters, evidence/
reference — mirroring Phase 4's Observation Catalog discipline exactly.
Human-readable text is generated from `reason_code` + template; never
stored as free text alone.

### Decision 10 — Preferred Manufacturer governance (ADR-0071)

A declared commercial/strategic preference (§ "Preferred Manufacturer
Governance"), scoped to SKU/family/category/technology/region, with
reason, validity window, creator, approver, and status
(`ACTIVE`/`EXPIRED`/`REVOKED`). May grant a limited, Policy-defined bonus
applied strictly after `composite_score`. Can never make an ineligible
Offer eligible, override a technical failure, ignore a suspension,
substitute for a required human approval, or hide a lower underlying
score; the ranking always shows pre-bonus, bonus, and final score
separately.

### Decision 11 — Offer Approval sequencing (ADR-0072)

The predecessor draft's ADR-0010/ADR-0011 sequencing rule is
**re-ratified, in substance, under this document's current terms** —
Selection still requires an approval gate beyond Phase 4 eligibility —
but the gate is restated as the **seven-part gate in §4** to reflect
Phase 4's actual frozen Global Result Model (which did not exist in its
current form when ADR-0010/ADR-0011 were written) and to make explicit
that the "engineering approval" component of the old
`ebp_manufacturer_offer_approvals` design (ADR-0008/ADR-0011) is now
already satisfied by Phase 4's own `ebp_engineering_decisions` — it is
never re-implemented or duplicated by Phase 5. Because
`ebp_manufacturer_offer_approvals` was designed (ADR-0008/ADR-0011) but
**never actually built** in Phase 3's real schema/code, **Phase 5 builds
and owns this entity now**, scoped strictly to the Commercial-Approver
decision (never merged with Engineering Decision): an **Offer Commercial
Approval** record, keyed to `(offer_id, offer_revision)`, decided by
`COMMERCIAL_APPROVER`. A `PRELIMINARY_COMPARISON` (§4A) remains the only
way to view Offers that are technically eligible but not yet Commercial-
Approved; it can never be promoted into an official recommendation.

### Decision 12 — Strategic Allocation vs. Phase 9 boundary (ADR-0073)

Phase 5 decides Primary/Secondary/Backup, order, eligibility,
concentration risk, and a capacity recommendation. Phase 5 never decides
final quantities, order splits, real orders, production dates,
containers, shipments, or contractual allocation. It may emit
`suggested_allocation_percentage` and `recommended_capacity_reserve`,
both explicitly `ADVISORY_ONLY` — Phase 9 owns the real allocation.

## Restrictions Confirmed

No table, API, migration, or Phase 5 code exists as a result of these
decisions alone — they authorize `phases/phase-05-manufacturer-
selection.md` to be rewritten as an implementable spec and, from there,
Phase 5's implementation to begin. **No frozen phase (0, 1, 2, 3, or 4)
was modified by this document.** Phase 5's implementation proceeds from
here per the project owner's explicit instruction; Phase 6 remains not
started until Phase 5 is independently authorized to freeze.
