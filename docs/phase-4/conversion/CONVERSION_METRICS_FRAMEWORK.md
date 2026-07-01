# CONVERSION METRICS FRAMEWORK
## ELIMFILTERS Engineering Intelligence Platform — Phase 4

---

## 1. Measurement Philosophy

Traditional catalogue metrics measure browsing and purchasing behavior.
The Engineering Intelligence Platform must also measure trust progression
and engineering engagement — these are leading indicators that predict
eventual conversion.

**Two categories of metrics:**

**Engagement metrics** — leading indicators of trust building
**Conversion metrics** — lagging indicators of commercial outcomes

Both are required. Engagement metrics identify where the trust-building sequence
is working or breaking. Conversion metrics confirm commercial impact.

---

## 2. Engagement Metrics (Trust Progression)

### E-01: Problem Recognition Rate
**Definition:** Percentage of visitors who interact with a failure mode or contamination
entity within their first session.
**Target:** >40% of non-part-number visitors
**Signals:** ProblemExplorer interaction, FailureModeCard expansion, Journey 3 entry
**If below target:** Problem recognition language needs improvement. Symptom taxonomy needs expansion.

### E-02: Engineering Depth Score
**Definition:** Average number of entity pages (TechnologyCard, PrincipleCard, etc.)
viewed per session.
**Target:** >2.5 entities per session (non-J1 journeys)
**Signals:** Page views on `/engineering/*` routes
**If below target:** Engineering content not compelling enough. May indicate incorrect intent routing.

### E-03: Recommendation Acceptance Rate
**Definition:** Percentage of visitors who receive a RecommendationPanel and click
"Explore" or expand the step trace.
**Target:** >55%
**Signals:** Interaction with RecommendationPanel trace
**If below target:** Recommendations not trusted. Review recommendation explanation quality.

### E-04: Engineering Memory Engagement
**Definition:** Percentage of entity page visitors who expand the EngineeringMemoryPanel.
**Target:** >30% (where memory exists)
**Signals:** EngineeringMemoryPanel expansion event
**If below target:** Memory panel placement or visual treatment needs revision.

### E-05: Citation Interaction Rate
**Definition:** Percentage of visitors who interact with a CitationPanel (hover or expand).
**Target:** >20%
**Signals:** CitationPanel interaction event
**If below target:** Citations not sufficiently prominent or not contextually placed.

### E-06: Journey Completion Rate
**Definition:** Percentage of visitors who enter a journey and complete all steps.
**Target by journey:**
- J1 (Part Number): >65% (high intent, high completion expected)
- J2 (Asset Protection): >35% (longer journey, acceptable dropout)
- J3 (Problem Diagnosis): >50% (high urgency, should complete fast)
- J4 (Learning): >25% (exploration journey, lower completion acceptable)
**If below target:** Identify which step has highest dropout rate and investigate.

### E-07: Cross-Journey Transition Rate
**Definition:** Percentage of sessions that include a transition between journeys.
**Target:** >15%
**Signals:** Journey context change with entity carry-over
**If below target:** Cross-journey transition CTAs not visible or compelling.

### E-08: Return Visitor Rate (Engineering)
**Definition:** Percentage of visitors who return to the platform within 30 days
and visit engineering content (not just product pages).
**Target:** >25%
**Signals:** Return session + engineering page visit
**Interpretation:** High return rate indicates the platform is being used as a
reference resource — the highest trust signal.

---

## 3. Conversion Metrics (Commercial Outcomes)

### C-01: Problem-to-Product Conversion Rate
**Definition:** Percentage of visitors who enter via a problem (J2 or J3) and
reach a product page within the same session.
**Target:** >30%
**Benchmark:** Traditional catalogue direct-to-product rate is higher (visitors
arrive with product intent). This metric measures engineering-to-product conversion,
which starts further back in the funnel.

### C-02: Engineering Consultation Request Rate
**Definition:** Percentage of Journey 2 and Journey 3 completions that generate
an L-1 Engineering Consultation lead.
**Target:** >12%
**This is the most important conversion metric.** Engineering consultation leads
are the highest-value outcome of the platform.

### C-03: Qualified Lead Rate
**Definition:** Percentage of all captured leads scoring >60 (Qualified or Hot).
**Target:** >40%
**If below target:** Lead capture CTAs are appearing too early (low-trust leads).
Review CTA placement against Trust Signal sequence.

### C-04: Technical Download Conversion
**Definition:** Percentage of technology page visitors who download a technical document.
**Target:** >8%
**Signals:** L-4 lead capture completion

### C-05: Distributor Referral Rate
**Definition:** Percentage of J1 and J3 completions that generate a L-3 distributor referral.
**Target:** >20% (J1), >15% (J3)

### C-06: Quote Request Rate
**Definition:** Percentage of protection system recommendations (J2 Step 6) that
generate an L-2 Quote request.
**Target:** >18%

### C-07: Search-to-Engineering Rate
**Definition:** Percentage of search interactions that transition to an engineering
entity page (not directly to product).
**Target:** >45%
**Signals:** Search result click on non-product entity type
**If below target:** Search results not surfacing engineering entities prominently enough.

### C-08: Newsletter Subscriber Growth
**Definition:** New L-5 subscribers per month.
**Target:** Established after 3-month baseline
**Interpretation:** Indicator of long-cycle research audience size.

---

## 4. Journey-Specific KPIs

### Journey 1 — Part Number
| KPI | Target |
|---|---|
| Time to part identification | < 90 seconds |
| Cross-reference success rate | > 85% |
| Engineering touchpoint rate | > 40% (visited at least one engineering card) |
| Distributor contact rate | > 20% |
| Return visit rate | > 30% (scheduled maintenance customers return) |

### Journey 2 — Asset Protection
| KPI | Target |
|---|---|
| Step 2 completion (risk assessment) | > 70% |
| Step 5 completion (technology recommendation) | > 45% |
| Step 7 completion (products reached) | > 30% |
| Engineering consultation request | > 12% |
| Multi-session journey completion | > 20% (some customers return to complete) |
| Engineering package download | > 25% of completions |

### Journey 3 — Problem Diagnosis
| KPI | Target |
|---|---|
| Time to failure mode identification | < 3 minutes |
| Failure analysis request rate | > 20% |
| Technology recommendation acceptance | > 55% |
| Distributor contact (urgent) | > 25% |
| Same-session product confirmation | > 35% |

### Journey 4 — Learning
| KPI | Target |
|---|---|
| Pages per session | > 3.5 |
| Average session duration | > 8 minutes |
| Newsletter conversion | > 15% |
| Return within 14 days | > 35% |
| Technical download | > 12% |
| Transition to J2 or J3 | > 10% |

---

## 5. Anti-Metrics (What NOT to Optimize)

These metrics are commonly optimized in catalogue sites but are counter-productive
for an Engineering Intelligence Platform.

| Anti-Metric | Why Not to Optimize |
|---|---|
| Bounce rate (raw) | Engineering pages legitimately have high bounce after answering specific questions. Optimize for qualified engagement, not raw retention. |
| Pages per session (raw) | A visitor who reads one deeply relevant article and converts is better than one who browses 12 product pages and leaves. |
| Time on site (raw) | Short, high-intent sessions (J1: part confirmed in 90 seconds) are successes. Measure intent completion, not time. |
| CTA click rate (raw) | A CTA clicked before trust is earned may score high but generates unqualified leads. Measure qualified lead rate, not click rate. |
| Product page views | Product page views that follow engineering journeys are valuable. Direct product page views without context are catalogue behavior. |

---

## 6. Measurement Implementation

All events tracked via Google Analytics 4 custom events.

```javascript
// Trust progression events
gtag('event', 'trust_signal_reached', {
  signal: 'T-4', // T-1 through T-7
  entity_id: 'TECH-MACROCORE',
  journey_id: 'ASSET_PROTECTION',
  step: 5
});

// Engineering engagement
gtag('event', 'recommendation_trace_expanded', {
  recommendation_id: 'REC-0001',
  confidence: 'HIGH',
  entity_type: 'TECHNOLOGY_ARCHITECTURE'
});

// Lead capture
gtag('event', 'lead_captured', {
  lead_type: 'L-1', // L-1 through L-7
  trust_level_at_capture: 'T-6',
  journey_id: 'ASSET_PROTECTION',
  lead_score: 75
});

// Journey events
gtag('event', 'journey_step_completed', {
  journey_id: 'PROBLEM_DIAGNOSIS',
  step: 3,
  entity_id: 'FM-HYD-001'
});
```

---

## 7. Reporting Cadence

| Report | Frequency | Audience | Key Metrics |
|---|---|---|---|
| Engineering Engagement Report | Weekly | Platform team | E-01 through E-08 |
| Conversion Report | Weekly | Sales + Marketing | C-01 through C-08 |
| Journey Performance Report | Weekly | Platform team | Journey-specific KPIs |
| Lead Quality Report | Monthly | Sales | Lead score distribution, qualified rate |
| Trust Architecture Audit | Monthly | Engineering + Platform | Which trust signals have lowest engagement |
| Anti-Metric Review | Quarterly | Leadership | Ensure platform not drifting toward catalogue optimization |
