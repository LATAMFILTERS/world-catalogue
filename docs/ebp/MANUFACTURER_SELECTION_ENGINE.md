# MANUFACTURER SELECTION ENGINE — Manufacturer Selection (Phase 5)

**Status:** Normative reference — philosophy and business rules only. No
table, API, migration, or code is authorized by this document. Phase 5
implementation may not begin until every Open Question below is closed
by the project owner, per the same discipline `ENGINEERING_RULE_ENGINE.md`
(ADR-0038) established for Phase 4.
**Created:** 2026-07-13, before Phase 5 was authorized to begin.
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

These are the dimensions the ranking philosophy (§6) may draw on. This
section defines **what may be considered**, never how heavily, never in
what combination. No weighting, scoring formula, or relative priority
between dimensions is decided by this document — see Open Questions.

### Engineering

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

### Commercial

- **FOB** — the Offer's FOB price (Phase 3).
- **MOQ** — minimum order quantity (Phase 3).
- **Lead Time** — quoted lead time (Phase 3).
- **Capacity** — the Offer's stated monthly/period capacity (Phase 3)
  and the Manufacturer's qualification-level capacity ceiling (Phase 2).
- **Offer Expiration** — how much of the Offer's effectiveness window
  (`expires_at`, Phase 3) remains at Selection time; an Offer nearing
  expiration is a different commercial proposition than a freshly
  submitted one even at an identical price.

### Operational

- **Historical Performance** — realized performance on prior orders for
  this Manufacturer (once Phase 9, Order Management, exists and produces
  this data) — on-time delivery, quality escapes, quantity accuracy.
- **Response Time** — how quickly this Manufacturer has historically
  responded to Manufacturer Request Batches (Phase 3) and to
  Exception/Condition follow-ups (Phase 4).
- **Stability** — continuity of the Manufacturer's own qualification
  status over time (Phase 2) — a Manufacturer with a volatile
  qualification history (frequent `SUSPENDED`/reinstated cycles) is a
  different operational risk than one with an unbroken `QUALIFIED`
  record, independent of its current instantaneous status.
- **Reliability** — the Manufacturer's track record of Offer accuracy
  (how often its offered specifications, once produced, actually matched
  what was offered) — a signal that only accumulates once Phase 9/order
  fulfillment data exists.

### Strategic

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
  (concentration) signal, deliberately left dual-purpose here; how it
  should be scored is an Open Question.

## 4. Eligibility

An Offer is eligible to enter the Selection process for a given Passport
only when **all** of the following hold, evaluated fresh at the moment
Selection runs (never cached from a prior run):

- **Validation vigente** — a `CURRENT` (never `STALE`) Validation Run
  exists for this exact `(offer_id, offer_revision)`, per Phase 4's
  Decision 12/ADR-0050 full-coarse-invalidation model.
- **Engineering Decision válida** — the Validation Run's associated
  Engineering Decision is `APPROVED` or `CONDITIONALLY_APPROVED` (never
  `REJECTED` or the system-only `PENDING_REVIEW`), its `status` is
  `CURRENT` (never `NEEDS_REVIEW`, per the correction round/ADR-0055),
  and — for `CONDITIONALLY_APPROVED` — every mandatory Condition is
  `SATISFIED` or formally `WAIVED` (never `OPEN`/`OVERDUE`/`FAILED`).
  This is exactly `computeSelectionEligibility()`'s existing contract
  (`ebp/phase4/service.js`, correction round/ADR-0055) — Selection must
  call that function (or an equivalent that produces an identical
  result), never re-derive eligibility independently from raw Rule
  Results.
- **Offer vigente** — the Offer is the current active revision for its
  `(passport_id, engineering_revision, manufacturer_id)` lineage (not
  `SUPERSEDED`, `WITHDRAWN`, or `REJECTED`), and has not passed its
  `expires_at`.
- **Manufacturer activo** — the Manufacturer's Phase 2 qualification
  status for the applicable product family is `QUALIFIED` or
  `CONDITIONAL`-satisfied (never `SUSPENDED`, `CANDIDATE`, or otherwise
  not yet cleared).
- **Certificaciones válidas** — any certification Phase 2 records as
  required for this product family/category is current (not expired) on
  the Manufacturer's record.

An Offer failing any one of these is not ranked lower — it is not a
candidate at all (§5).

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
identical ranking philosophy. Backup is deliberately allowed to diverge
from strict rank order: because Backup exists specifically to address
supply-continuity risk (§1, Strategic Allocation/Strategic dimension), a
future Selection Policy may prefer, as Backup, a lower-ranked candidate
that is geographically or technologically diversified from Primary and
Secondary over a higher-ranked candidate that would concentrate risk
further (e.g., the same country as Primary). Whether this divergence is
enabled by default, or requires an explicit Selection Policy setting, is
an Open Question.

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

## 8. Manual Override

- **When it exists:** whenever ELIMFILTERS wishes to select differently
  from what the Selection Engine's own ranking produced, for any of the
  Evaluation Factors (§3) the ranking may have under- or over-weighted,
  or for a reason genuinely outside all of them (e.g., a negotiated
  volume commitment made outside this platform).
- **Who can use it:** an authorized ELIMFILTERS role — the exact role
  name and its relationship to Phase 4's existing functional roles
  (`ENGINEERING_APPROVER`/`ADMIN_OWNER`, Decision 01/ADR-0039) is an Open
  Question; what is already decided is that it is **never** the
  Selection Engine itself, and never a Manufacturer/Distributor-facing
  actor.
- **Mandatory audit:** every Manual Override must record: which tier was
  overridden, what the Engine's own ranking would have produced for that
  tier, what was chosen instead, who made the decision (a declared actor
  label, per this platform's existing identity convention), when, and a
  documented reason — never an override with no recorded justification.
- **Duration:** an Open Question — whether an override persists across
  future Re-selections (i.e., "keep this Manufacturer as Primary even as
  new Offers arrive") or applies only to the one Manufacturer
  Recommendation version it was recorded against, requiring a fresh
  override at each subsequent Re-selection.
- **Traceability:** an overridden Manufacturer Recommendation must still
  show, unambiguously, both what the Engine recommended and what was
  actually chosen — never overwriting one with the other.
- **Impact on future selections:** an Open Question — whether a pattern
  of overrides for a given Manufacturer should itself become an input to
  future rankings (e.g., as evidence toward "Preferred Manufacturer"
  status), or must remain entirely inert data that never feeds back into
  the ranking philosophy automatically.

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

**A Manufacturer Recommendation is never overwritten.** Every
Re-selection produces a new Selection Version; the prior one becomes
Superseded, exactly as a Phase 4 Validation Run becomes `STALE` rather
than being mutated.

## 10. Re-selection

Re-selection (§1) must be triggered — an existing Manufacturer
Recommendation must never simply be treated as still valid — whenever
any of the following occurs:

- **Nueva Offer** — a Manufacturer submits a new Offer revision for the
  Passport (Phase 3), whether from the current Primary/Secondary/Backup
  or a new candidate entirely.
- **Nueva Validation** — a new Validation Run (Decision 12/ADR-0050)
  completes for any Offer already in, or newly eligible for, the
  candidate pool — including the automatic revalidation Phase 4 now
  triggers on every Exception decision (correction round/ADR-0053).
- **Suspensión del fabricante** — a Manufacturer's Phase 2 qualification
  status changes to `SUSPENDED` for the applicable family.
- **Cambio de certificaciones** — a required certification is renewed,
  added, or allowed to expire.
- **Expiración** — an Offer in the current recommendation's candidate
  pool passes its `expires_at`.
- **Cambio de política** — the Selection Policy itself is changed
  (a new Preferred Manufacturer designation, a new concentration cap, a
  new diversification target, etc.).

Re-selection always produces a new Selection Version (§9); it never
mutates the prior recommendation, even when the new computation happens
to reproduce the exact same ranking.

## 11. Dashboard Readiness

Per ADR-0037 (`PLATFORM_ARCHITECTURE.md` §8), the Selection Engine must
emit Activity Events into the same shared, single-model event ledger
Phase 4 uses (`ebp_activity_events`) — never its own independent event
system. **Candidate event set for Phase 5 — not yet finalized, pending
the Open Questions below:**

**Events:** `MANUFACTURER_SELECTION_STARTED`, `MANUFACTURER_RECOMMENDED`,
`PRIMARY_SELECTED`, `SECONDARY_SELECTED`, `BACKUP_SELECTED`,
`SELECTION_SUPERSEDED`, `SELECTION_REVIEW_REQUIRED`,
`MANUAL_SELECTION_OVERRIDE`.

**KPIs:** Products with Primary; Products with Backup; Single-source
Products (Primary with no eligible Secondary); average Selection Time;
Manufacturer Distribution (share of Passports/volume by Manufacturer);
Geographic Distribution; Concentration Index (a single-number summary of
Manufacturer Concentration, §3 — exact formula an Open Question).

**Alerts:** Product without Primary; Product without Backup; High
Manufacturer Concentration; Selection Requires Review; Selection
Expiring (an active recommendation whose underlying Offer(s) are
approaching `expires_at`).

**Analytics Views:** an `ebp_analytics_selection_summary`-shaped view
(exact shape deferred to Phase 5's own spec, mirroring
`ebp_analytics_validation_summary`'s role in Phase 4) — never a raw
transactional table read directly by a future dashboard or API, per the
same ADR-0037 §8.3 convention every phase in this platform now follows.

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

## Open Questions

These must all be answered by the project owner before Phase 5
implementation may begin — no code, table, or API may be written against
an unresolved question below.

1. **Ranking weighting/scoring formula.** §6 defines the ranking's
   philosophy but no arithmetic. What is the actual formula or scoring
   model that combines the Evaluation Factors (§3) into an ordered
   ranking? Is it a single weighted score, a lexicographic priority order
   (e.g., "engineering first, then commercial, then strategic, ties
   broken by operational"), or something else? This is the single
   highest-priority open question — nothing in §6/§7 can be implemented
   without it.
2. **Demand signal scope.** Does Phase 5's initial scope select for real
   orders only (post-Phase-9), for forecast/planning demand ahead of
   Order Management existing, or both? If forecasts are in scope, what
   is the forecast data model, and does it live in this platform or is
   it an external input?
3. **"No eligible candidate" representation.** How must a Passport with
   zero Eligible Manufacturers (§4) be represented — is it a
   Manufacturer Recommendation with all three tiers empty, or the
   explicit absence of any recommendation at all? What Alert (§11) does
   this state produce, and does it block anything downstream (e.g., can
   Phase 9 still accept an order against a Passport with no eligible
   Manufacturer, or must it be blocked)?
4. **Backup divergence rule.** §7 allows Backup to diverge from strict
   rank order for supply-continuity reasons. Is this divergence
   automatic (always prefer a diversified Backup when one is available)
   or does it require an explicit Selection Policy setting? What counts
   as "sufficiently diversified" (different country? different region?
   different `technology_code` specialization?)?
5. **Manual Override role and duration.** §8 leaves open exactly which
   functional role may exercise a Manual Override, and whether an
   override persists across future Re-selections or must be
   re-established at each new Selection Version.
6. **Manual Override feedback into ranking.** §8 leaves open whether a
   pattern of overrides for a given Manufacturer should ever become an
   automatic input to future rankings (contributing toward "Preferred
   Manufacturer" status) or must remain entirely inert historical data.
7. **Selection Policy ownership and versioning.** Who defines and changes
   a Selection Policy (§1)? Is it itself versioned identically to a
   Manufacturer Recommendation (so a past recommendation can always be
   explained in terms of the exact policy in force when it was
   computed)? Is there one global Selection Policy, or can policies be
   scoped per product family/category?
8. **Concentration Index formula.** §11 names a Concentration Index KPI
   without defining it — what specific formula (e.g., a
   Herfindahl-Hirschman-style index over Manufacturer share of volume)
   is used, and at what scope (per family, per category, platform-wide)?
9. **Basis-recording format for factor attribution.** §12 requires that
   a recommendation's basis be tagged by Evaluation Factor category
   (Engineering/Commercial/Operational/Strategic) to answer "why did
   this change" questions — what is the actual structured format for
   recording this (a fixed schema per factor, free-structured JSON with
   required category tags, something else)?
10. **Preferred Manufacturer governance.** §1 defines "Preferred
    Manufacturer" as a Selection Policy input but does not specify who
    designates one, whether the designation is scoped to a product
    family or global, whether it expires, or whether it is itself
    versioned/audited the same way a Manufacturer Recommendation is.
11. **Relationship to Offer Approval (Phase 3) sequencing.** The
    predecessor `phase-05-manufacturer-selection.md` draft (pre-dating
    this document) required a Phase-3-level Offer Approval in addition
    to Phase 4 eligibility before an Offer could be an official
    candidate (old ADR-0010/ADR-0011). Does that sequencing rule still
    hold exactly as previously decided, given Phase 4's actual frozen
    Global Result Model (which did not exist in its current form when
    that rule was written), or does it need to be re-examined and
    re-ratified under this document's terms?
12. **Strategic Allocation's boundary with Phase 9.** §1 defines
    Strategic Allocation as a downstream concern, not something the
    Selection Engine computes. Is there any minimal signal the Selection
    Engine must still expose (e.g., a suggested allocation split as
    metadata, not a decision) to make Phase 9's eventual consumption of
    a Manufacturer Recommendation practical, or is the ranking alone
    sufficient?

## Restrictions Confirmed

No table was created by this document. No API was created. No migration
was written. No code was written. No frozen phase (0, 1, 2, 3, or 4) was
modified. **Phase 5 was not started.** These are business-rule and
philosophy decisions only; they authorize nothing about Phase 5's
implementation until every Open Question above is explicitly closed by
the project owner and Phase 5's own spec is updated to derive from this
document without contradiction.
