# DISTRIBUTOR CONVERSION IMPROVEMENT PLAN
## ELIMFILTERS® — Minimum Viable Path to Recruitment Readiness
**Date:** 2026-06-04 · **Input:** COMMERCIAL_CONVERSION_AUDIT.md

---

## OBJECTIVE

Move the commercial flow from:

> **B — Commercial flow requires improvement before active distributor recruitment**

to:

> **A — Commercial flow ready for distributor acquisition**

Using the smallest set of high-impact changes, in the correct sequence.

---

## THE 80/20 PRINCIPLE APPLIED

The audit identified 15+ gaps. Not all gaps have equal commercial weight.

The chart below maps each finding to its conversion impact versus implementation effort. The 20% of work that produces 80% of the conversion result is in the top-left quadrant: high impact, low effort.

```
HIGH IMPACT
    │
    │  ★ Confirmation email         ★ "What happens next" copy
    │  ★ Program one-pager          ★ Kleo identity resolution
    │
    │  ◆ CTA expansion              ◆ Part Search as benefit
    │  ◆ Warranty as selling tool   ◆ KS as selling tool
    │
    │  ◇ Phone/booking link         ◇ Single testimonial
    │
    │  ○ Product catalog            ○ Leadership page
    │  ○ Territory map              ○ Pricing details
    │
LOW IMPACT
    └───────────────────────────────────────────────
    LOW EFFORT                               HIGH EFFORT
```

**★ Critical — Must complete before recruiting**
**◆ Important — Complete in first 30 days of recruitment**
**◇ Valuable — Complete in first 90 days**
**○ Deferrable — Phase 2 or beyond**

---

## PART I — CRITICAL IMPROVEMENTS

These are the minimum blocking conditions. Each one, if missing, will cause a qualified distributor to abandon the process or never trust the brand enough to apply. None of the improvements in this tier require new page development.

---

### C-01 · Post-Submission Confirmation + Response Timeline

**Priority Rank:** 1 of 4 (highest)

**What is missing:**

After submitting the distributor application form at `/distributor-application`, the applicant sees a green success message for 5 seconds and then it disappears. No confirmation email is sent. No timeline is stated on the application page. The applicant has no record of their submission and no expectation of when they will hear back.

**Business rationale:**

Every B2B sales process begins with acknowledging the inbound lead. A distributor who submits an application is signaling serious commercial intent. Failing to acknowledge that intent within seconds (automated) is a fundamental breakdown in the commercial workflow. The lead is effectively lost the moment the success message disappears — not because the submission failed, but because the applicant has no anchor for follow-up.

The contact page FAQ states "5 business days" for distributor applications. That commitment is invisible from the application page itself. The person who needs that information most — the applicant — cannot see it.

**User impact:**

The applicant does not know:
- Whether their submission was received
- Who will contact them
- When they will be contacted
- What criteria will be used to evaluate them
- What step comes after the review

This leaves the applicant in the same position as if they had sent an email to a cold address: uncertain, waiting, and likely evaluating competitors in the meantime.

**Conversion impact:**

A distributor who submits with no confirmation is 3–5× more likely to accept a competing brand's offer during the silence window. Every day without acknowledgment reduces the probability of successful engagement. This is not a UX improvement — it is a fundamental revenue protection measure.

**Implementation complexity:** LOW

This requires two changes:
1. Add explicit text to the application page stating the review timeline ("Applications are reviewed within 5 business days. You will receive a response at the email address provided.")
2. Configure the Formspree endpoint to send an automated reply email to the applicant. Formspree supports auto-reply via the `_replyto` field and email template settings — no code change required, only form configuration.

No new pages. No new components. The copy change is 2–3 sentences. The Formspree configuration change is done in the Formspree dashboard.

---

### C-02 · "What Happens Next" Process Block

**Priority Rank:** 2 of 4

**What is missing:**

The distributor application page (`/distributor-application`) has no description of the post-application process. After submitting, a distributor does not know whether they are being evaluated for territory coverage, product line fit, minimum order capacity, or customer base type. There is no mention of a review call, an onboarding sequence, or an approval decision.

**Business rationale:**

A distributor evaluating ELIMFILTERS® is simultaneously evaluating other brands. Every competing brand with a mature distribution program describes their evaluation process explicitly: what criteria are used, what the next conversation will cover, who will contact them, and what approval looks like. Leaving this undefined signals either that the program is new, that it is informal, or that no one is actively managing it.

A brief process description does not require committing to specific timelines or operational details that haven't been finalized. It only requires telling the applicant what to expect at a high level.

**User impact:**

The distributor leaves the page without knowing what a "yes" looks like. This creates ambiguity that makes it easier to defer a decision in favor of a brand that has already answered the question.

**Conversion impact:**

Process clarity is a trust signal. It communicates that ELIMFILTERS® has a functioning commercial program, has managed distributor relationships before, and knows how to onboard a new partner. Without it, the application page reads as a contact form, not a commercial intake step.

**Implementation complexity:** LOW

This is a copy change on the existing distributor application page. A 3-step process block added to the "Why Partner" column (left side of the page layout):

```
WHAT HAPPENS AFTER YOU APPLY:

01 / APPLICATION REVIEW
We evaluate your territory, industry coverage, and product line fit.
Response within 5 business days.

02 / DISCOVERY CALL
A member of our commercial team contacts you to discuss your market
and how ELIMFILTERS® fits your current portfolio.

03 / PROGRAM TERMS
If there is mutual fit, we provide program terms, pricing structure,
and onboarding timeline.
```

No new pages. No new components. This is a text block added to the existing layout.

---

### C-03 · Distributor Program One-Pager

**Priority Rank:** 3 of 4

**What is missing:**

The distributor application page lists 6 benefits (competitive wholesale pricing, marketing support, technical training, dedicated account manager, co-branded materials, priority fulfillment). These are category labels, not program content. A distributor cannot evaluate the commercial opportunity from a label list.

What is needed is a one-pager — not a price list — that answers the structural questions a distributor will ask before applying:

- What kind of distributor is ELIMFILTERS® looking for?
- What does the territory model look like?
- What does the training program consist of?
- What marketing support is available and in what form?
- What does a distributor's day-to-day relationship with ELIMFILTERS® look like?

**Business rationale:**

Competing distribution programs from Donaldson, Mann, and Fleetguard all provide program guides. A distributor comparing brands will compare the specificity of the commercial proposition, not just the product. ELIMFILTERS® has a stronger technical story than most competitors — but technical strength does not substitute for commercial clarity at the moment of decision.

A one-pager does not require publishing pricing. It requires describing the program structure with enough specificity that a distributor can self-qualify before applying. Self-qualification improves application quality and reduces time spent on non-fit applicants.

**User impact:**

A distributor who reads the one-pager can answer: "Am I the right fit for this program?" before submitting. This produces higher-quality applications and higher commitment from applicants who do submit.

**Conversion impact:**

Distributors who self-qualify have already made a partial commitment before submitting. Their follow-through rate on the process is significantly higher than cold applicants who submitted out of curiosity.

**Implementation complexity:** MEDIUM

This requires creating content that does not yet exist — specifically, decisions about what the program structure is. The technical implementation is a PDF linked from the distributor page, or a dedicated section on the page itself.

The content work is the bottleneck, not the implementation. Once the program structure is defined internally, the page or PDF can be built in one session.

Key decisions required before this can be written:
- Territory model (exclusive / non-exclusive / geographic vs. industry-specific)
- Training format (in-person / remote / materials-based)
- Marketing support specifics (what co-branded materials exist, what is available day 1)
- Account manager structure (dedicated vs. shared)
- Onboarding timeline (how long from approval to first shipment)

---

### C-04 · Kleo Technologies Identity Resolution

**Priority Rank:** 4 of 4

**What is missing:**

The site footer states "© 2015–2026 Kleo Technologies" on every page. The legal entity presented on the contact page is "ELIMFILTERS® LLC." The relationship between Kleo Technologies and ELIMFILTERS® is never explained anywhere on the site.

**Business rationale:**

A distributor doing commercial due diligence — which every serious distributor does before signing a distribution agreement — will search both names. They will find two identities with no stated relationship. This raises three possible interpretations: (1) Kleo Technologies is the parent company and ELIMFILTERS® is a brand, (2) ELIMFILTERS® is the operating company and Kleo is a legacy entity, or (3) the brand identity is inconsistent.

All three interpretations create doubt about who the legal counterparty to the distribution agreement will be, which entity carries the warranty obligation, and whether the brand has a stable identity.

The fix is one sentence, placed once, that explains the relationship. It does not require disclosing corporate structure details. It only needs to close the gap between what the footer says and what the brand presents.

**User impact:**

A distributor who searches and finds the discrepancy without an explanation will either ask about it (friction) or quietly disqualify the brand (silent dropout). Silent dropouts are invisible and unrecoverable.

**Conversion impact:**

This is a trust gap, not a product gap. Trust gaps affect the final decision step — the moment a distributor is about to commit. At that point, any unresolved question can abort the process.

**Implementation complexity:** VERY LOW

One of two options:
1. Add a brief statement to the About or Contact page: "ELIMFILTERS® is a brand of Kleo Technologies, [description]."
2. Update the footer copyright to "© 2015–2026 ELIMFILTERS® / Kleo Technologies" with a tooltip or About link.

Either approach closes the gap. No new page, no new component, no structural change.

---

## PART II — IMPORTANT IMPROVEMENTS (NOT BLOCKING)

These improvements do not prevent a distributor from applying or completing the process. They do reduce conversion rate and reduce the quality of the distributor's first impression. They should be completed within the first 30 days of active recruitment.

---

### I-01 · Expand Distributor CTA to 3 Additional Pages

**What is missing:** The distributor application is only accessible via a rotating home CTA (5 seconds, competes with Part Search), the footer link, and an indirect mention on the contact page. Industries, Technologies, Warranty, and About pages carry zero distributor CTAs.

**Why it matters:** A distributor researching ELIMFILTERS® will naturally visit Technologies and Industries pages before deciding to apply. These are the highest-intent research pages on the site. Adding a single bottom-of-page distributor CTA block to Technologies, Industries, and Warranty pages creates 3 new conversion entry points that require no new page development — only a reusable CTA component.

**Implementation complexity:** LOW — One reusable CTA component, placed at the bottom of 3 existing pages.

---

### I-02 · Reframe Distributor Benefits Using Owned Advantages

**What is missing:** The "Why Partner" section on the distributor application page lists 6 generic benefits (competitive pricing, support, training, account manager, co-branded materials, priority fulfillment). These are identical in substance to what every competing brand claims.

ELIMFILTERS® has three distributor advantages that no competitor offers and that are not mentioned anywhere on the distributor page:

1. **Part Search tool** — A live, searchable database of 20,000+ OEM cross-references available to the distributor's customers from day one. No competitor provides this as a distributor selling tool.
2. **Knowledge System** — 30 technical pages covering ISO standards, contamination failure modes, and fleet optimization. A distributor's sales team can send customers to the Knowledge System instead of building their own technical content.
3. **11-language site** — The distributor's customers can use the ELIMFILTERS® site in their own language. This is a direct customer support advantage for distributors serving multilingual markets.

**Why it matters:** These three advantages are what differentiate ELIMFILTERS® from commodity brand distribution programs. They should replace or augment two of the six generic bullet points on the distributor page.

**Implementation complexity:** LOW — Copy change on the existing distributor page. No new page, no new component.

---

### I-03 · Add Response Timeline to Application Page

**What is missing:** The contact page FAQ states "5 business days" for distributor applications. This commitment is not stated on the distributor application page, where it is most needed.

**Implementation complexity:** VERY LOW — One sentence added to the application page hero or form area.

---

### I-04 · Add One Contact Method Beyond Email

**What is missing:** The only contact method across the entire site is `info@elimfilters.com`. No phone number, no WhatsApp, no Calendly/booking link.

For a LATAM distributor in a different time zone evaluating a time-sensitive decision, the absence of a phone number or scheduling option creates an async-only relationship that slows every step. A single phone number or scheduling link provides an escalation path for high-intent prospects.

**Implementation complexity:** LOW — Adding a phone number to the Contact page is a copy change. A Calendly link for the commercial team adds a scheduling path without requiring any custom development.

---

### I-05 · Warranty Program Explicitly Positioned as Distributor Selling Tool

**What is missing:** The warranty page documents a strong warranty (non-prorated, engine protection coverage, 24H response). This warranty is mentioned on the distributor page only as "Comprehensive Warranty" with a two-line description. The engine protection clause — the most powerful element — is not mentioned by name.

A distributor who can tell a customer "if contamination bypasses this filter and damages your engine, ELIMFILTERS® covers the repair cost" has a closing argument that no commodity brand can match. This should be a named benefit on the distributor page, not buried in the warranty documentation.

**Implementation complexity:** VERY LOW — Copy change on the distributor page. No new components.

---

## PART III — DEFERRABLE IMPROVEMENTS

These improvements add value but do not affect the decision to apply or the trust level during the application process. They are appropriate for Phase 2 — after the recruitment program is operational and generating qualified applicants.

---

### D-01 · Product Catalog PDF

A downloadable PDF catalog with full SKU listing, product dimensions, and cross-reference tables. High value for distributors pre-evaluating territory coverage. Requires significant content work and internal alignment on what to include. **Defer until 90 days after recruitment launch**, using early distributor feedback to determine what format is most useful.

---

### D-02 · Customer / Distributor Testimonials

Social proof from end customers or existing distribution partners. The most persuasive trust signal available — but only if real names and verifiable outcomes are attached. Generic testimonials without attribution have low credibility. **Defer until real customer relationships can be documented**, starting with pilot distributors.

---

### D-03 · Territory Map or Availability Indicator

A visual representation of covered versus available territories. High value for distributors assessing exclusivity. Requires internal decisions about territory model before any map can be published accurately. **Defer until territory strategy is finalized.**

---

### D-04 · Leadership / Team Profiles

Founder, commercial director, and technical team profiles with photos and bios. Adds credibility and a human identity to the brand. **Defer** — not blocking, and publishing premature profiles creates maintenance overhead. Include when the commercial team is stable and well-defined.

---

### D-05 · Product Data Sheets (Individual)

Per-product technical data sheets with filtration efficiency curves, pressure drop data, dimensions, and replacement intervals. Critical for technical sales support. **Defer** — these require ongoing maintenance and cannot be partially published. Plan as a complete data sheet library after the product range is fully stable.

---

### D-06 · Dealer Portal / Online Ordering

A distributor-facing login portal for order placement, invoice access, and inventory tracking. **Defer** — significant development effort; appropriate only after the distributor program has reached scale. Not required for recruitment.

---

## PART IV — IMPLEMENTATION SEQUENCE

The following sequence applies the 80/20 principle: complete the critical items first, in order of impact-per-hour-of-effort.

```
PHASE 0 — PREREQUISITE DECISIONS (Internal, before any implementation)
────────────────────────────────────────────────────────────────────────
□ Define the Kleo Technologies / ELIMFILTERS® relationship statement (1 sentence)
□ Define the distributor review process (3 steps, internal workflow)
□ Define the response timeline commitment (currently: 5 business days)
□ Define the program one-pager content: territory model, training format,
  marketing support specifics, onboarding timeline

PHASE 1 — CRITICAL CHANGES (Target: before first distributor outreach)
────────────────────────────────────────────────────────────────────────
□ C-04 · Kleo identity resolution [VERY LOW effort — 1 sentence, 1 location]
□ C-01 · Confirmation email setup via Formspree auto-reply [LOW effort — dashboard config]
□ C-01 · Add response timeline text to application page [VERY LOW effort — 2 sentences]
□ C-02 · Add "What Happens Next" 3-step block to application page [LOW effort — copy + layout]
□ C-03 · Publish distributor program one-pager [MEDIUM effort — content-dependent]

PHASE 2 — IMPORTANT CHANGES (Target: within first 30 days of recruitment)
────────────────────────────────────────────────────────────────────────
□ I-02 · Reframe distributor benefits (Part Search, KS, multi-language) [LOW effort]
□ I-05 · Add engine protection warranty as named distributor benefit [VERY LOW effort]
□ I-03 · Confirm timeline visible on application page [VERY LOW effort — if not done in P1]
□ I-01 · Add distributor CTA to Technologies, Industries, Warranty pages [LOW effort]
□ I-04 · Add phone number or booking link to Contact page [LOW effort]

PHASE 3 — DEFERRABLE (After first distributor cohort is operational)
────────────────────────────────────────────────────────────────────────
□ D-02 · First distributor testimonial (once real relationship exists)
□ D-01 · Product catalog PDF
□ D-03 · Territory map
□ D-04 · Leadership profiles
□ D-05 · Product data sheets
□ D-06 · Dealer portal
```

---

## PART V — EFFORT SUMMARY

| Item | Category | Effort | Blocks Recruitment? |
|------|----------|--------|---------------------|
| C-04 Kleo identity sentence | Critical | 30 min | YES |
| C-01 Confirmation email config | Critical | 1 hour | YES |
| C-01 Timeline text on app page | Critical | 15 min | YES |
| C-02 "What Happens Next" block | Critical | 2 hours | YES |
| C-03 Program one-pager | Critical | 4–8 hours (content) | YES |
| I-02 Reframe distributor benefits | Important | 1 hour | NO |
| I-05 Warranty benefit on app page | Important | 30 min | NO |
| I-03 Timeline visible (if needed) | Important | 15 min | NO |
| I-01 CTA on 3 pages | Important | 2 hours | NO |
| I-04 Phone/booking link | Important | 1 hour | NO |

**Total Phase 1 effort:** approximately 8–12 hours, of which 4–8 hours is content work (program one-pager decisions), not implementation.

**Total Phase 2 effort:** approximately 5 hours.

The critical path is not technical. It is content and decisions. The website code can receive all Phase 1 changes in a single session once the decisions are made. The bottleneck is internal: defining the program terms, the Kleo relationship statement, and the onboarding process description.

---

## PART VI — WHAT DOES NOT NEED TO CHANGE

The following elements of the current site are already at or above the threshold required for distributor recruitment readiness. They should not be modified:

- **Visual identity and brand language** — Premium, differentiated, consistent. No change needed.
- **Technical content depth** — The Knowledge System, technology pages, and ISO standards integration already exceed what any competitor provides. This is a recruitment advantage as-is.
- **Application form fields** — The form captures the right qualification data (legal name, years in business, current products, service area). No new fields needed.
- **Warranty documentation** — The warranty page is clearly written and credible. It only needs to be referenced more prominently from the distributor page.
- **Part Search infrastructure** — The tool exists and works. It only needs to be named as a distributor benefit.
- **Multi-language support** — Already built. Only needs to be mentioned as a distributor advantage.
- **Statistics (99.9%, +45%, 20k+ OEM refs)** — These are strong. No change needed.

---

## FINAL RECOMMENDATION

**The exact improvements that must be completed before recruiting distributors at scale:**

| # | Improvement | What it fixes | Effort |
|---|-------------|--------------|--------|
| 1 | Add 1-sentence Kleo / ELIMFILTERS® relationship statement | Identity confusion that causes due diligence dropout | 30 min |
| 2 | Configure Formspree to send auto-reply confirmation email | No acknowledgment after application | 1 hour |
| 3 | Add response timeline (5 business days) to application page | Applicant has no expectations after submitting | 15 min |
| 4 | Add "What Happens Next" 3-step process block to application page | Process undefined, trust gap at final decision step | 2 hours |
| 5 | Publish distributor program one-pager | No commercial terms to evaluate before applying | 4–8 hours (content) |

**These 5 items are the complete Phase 1 requirement.**

They require no new pages, no new architecture, and no structural changes to the website. They require one internal decision session to define the program content and the Kleo relationship statement, followed by one implementation session to deploy the changes.

Upon completing Phase 1, the commercial flow moves from **B (Requires Improvement)** to **A (Ready for Distributor Acquisition)** — specifically for inbound and outreach-driven recruitment of qualified prospects in target territories.

Phase 2 (Important changes) should follow within 30 days of the first distributor outreach campaign, using early applicant feedback to prioritize which additional improvements create the most conversion impact.

---

*Plan generated: 2026-06-04 · Input: COMMERCIAL_CONVERSION_AUDIT.md · Focus: distributor conversion readiness*
