# DISTRIBUTOR CONVERSION — PHASE 1 IMPLEMENTATION PLAN
## ELIMFILTERS® — Build-Ready Specification
**Date:** 2026-06-04
**Status:** Pre-implementation — do not deploy until internal decisions in Section 0 are confirmed
**Inputs:** COMMERCIAL_CONVERSION_AUDIT.md · DISTRIBUTOR_CONVERSION_IMPROVEMENT_PLAN.md · DISTRIBUTOR_PROGRAM_DECISION_WORKBOOK.md · DISTRIBUTOR_PREQUALIFICATION_FLOW.md

---

## WHAT THIS DOCUMENT IS

A build-ready specification for a single implementation session. Every change is described at the file, line, and copy level. A developer with no knowledge of the planning documents can execute this plan start-to-finish.

## WHAT THIS IMPLEMENTS

All five critical items (C-01 through C-04) from the improvement plan, plus the three form field additions required by the prequalification workflow:

| Item | Description | Source |
|------|-------------|--------|
| C-04 | Kleo / ELIMFILTERS® identity clarification | Improvement Plan |
| C-01a | Auto-reply confirmation email via Formspree | Improvement Plan + Prequalification Flow |
| C-01b | Response timeline text on application page | Improvement Plan |
| C-02 | "What Happens Next" 3-step block | Improvement Plan |
| C-03 | Distributor page content rewrite | Improvement Plan + Program Workbook |
| F-01 | WhatsApp field added to form | Prequalification Flow |
| F-02 | Primary Industry select field added to form | Prequalification Flow + Audit |
| F-03 | Company Website field added to form | Prequalification Flow |
| F-04 | Ghost `employees` field removed from state | Audit |

## WHAT THIS DOES NOT IMPLEMENT

- New pages (no new routes)
- Distributor program one-pager PDF (content decisions not yet finalized — see Section 0)
- CTA expansion to Technologies, Industries, Warranty pages (Phase 2)
- Phone number or Calendly booking link (Phase 2)
- Product catalog, testimonials, territory map (deferred)
- Any backend changes — all changes are frontend React + Formspree dashboard configuration

---

## SECTION 0 — PREREQUISITE DECISIONS (MUST BE RESOLVED BEFORE IMPLEMENTATION)

The following four decisions cannot be made from this document and must be confirmed internally before any implementation begins. Placeholders are marked `[PLACEHOLDER]` throughout this spec.

### Decision 0.1 — Kleo Technologies Statement (Required for Part 1)

Confirm the exact legal relationship and the one sentence that describes it publicly.

**Draft statement (requires approval):**
> "ELIMFILTERS® is a brand of Kleo Technologies LLC, a filtration engineering company registered in Frisco, Texas. All products, warranties, and distributor agreements operate under the ELIMFILTERS® brand."

**What to confirm:** Is "Kleo Technologies LLC" the correct legal entity name? Is "registered in Frisco, Texas" accurate? Does this accurately describe the relationship?

**Placeholder in spec:** `[KLEO_STATEMENT]`

---

### Decision 0.2 — Commercial Team WhatsApp Number (Required for Parts 2, 4, and 6)

The auto-reply email, the "What Happens Next" block, and the rewritten benefits section all reference a WhatsApp number for the ELIMFILTERS® commercial team. This must be a real, monitored number before launch.

**What to confirm:** What is the WhatsApp number? Format required: international format, e.g. `+1 (940) 555-0001`

**Placeholder in spec:** `[COMMERCIAL_WHATSAPP]`

---

### Decision 0.3 — Response Timeline Commitment (Required for Parts 2, 3, and 4)

All documents reference "5 business days" as the review period. This is the commitment that will be shown on the page and in the confirmation email.

**What to confirm:** Is 5 business days the correct commitment? Is it achievable at initial launch volume with the current commercial team?

**Placeholder in spec:** `[RESPONSE_DAYS]` (default: `5`)

---

### Decision 0.4 — Formspree Plan Tier (Required for Part 2)

The auto-reply email with field interpolation (using the applicant's name and country in the email body) requires the Formspree **Starter or higher** paid plan. The free tier supports a generic auto-acknowledge only.

**What to confirm:** Is the formspree.io/f/mbjekqwb form on a free or paid plan? If free, the email body will be generic (no personalization). Upgrade to Starter (~$10/month) to enable the full template in this spec.

**Placeholder in spec:** Notes throughout Part 2 indicate which features are plan-dependent.

---

## PART 1 — KLEO / ELIMFILTERS® CLARIFICATION COPY

### 1A — Exact Copy

**Primary statement (About page):**
```
ELIMFILTERS® is a brand of Kleo Technologies LLC, a filtration engineering
company registered in Frisco, Texas. All products, warranties, and distributor
agreements operate under the ELIMFILTERS® brand.
```

**Footer line (replaces current copyright):**
```
© 2015–2026 ELIMFILTERS® — Kleo Technologies LLC
```

### 1B — About Page: File and Placement

**File:** `frontend/src/app/about/page.tsx`

**Current content at insertion point (lines 103–107):**
```tsx
              >
                ELIMFILTERS® specializes in protecting critical assets through advanced filtration
                engineering. We design systems that prevent contamination before it damages.
              </motion.p>
          </motion.div>
```

**Action:** Add the Kleo statement as a new `<motion.p>` element immediately after the closing `</motion.p>` at line 106 and before `</motion.div>` at line 107.

**New element to insert:**
```tsx
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.45)',
                fontFamily: 'Outfit, sans-serif',
                maxWidth: '680px',
                marginTop: '1.5rem',
              }}
            >
              [KLEO_STATEMENT]
            </motion.p>
```

### 1C — Footer: File and Placement

**File:** `frontend/src/components/Footer.tsx`

**Current content (line 226):**
```tsx
              © 2015–2026 Kleo Technologies
```

**Replace with:**
```tsx
              © 2015–2026 ELIMFILTERS® — Kleo Technologies LLC
```

**No other changes to Footer.tsx.**

---

## PART 2 — AUTO-REPLY EMAIL COPY

### 2A — Complete Email Template

This is the exact email the applicant receives within 2 minutes of submitting the distributor application form. This email is configured in the Formspree dashboard, not in the codebase.

---

**Subject line:**
```
Your ELIMFILTERS® distributor application — received
```

**Email body (plain text with field interpolation):**

```
{{contactName}},

Thank you for your interest in becoming an authorized ELIMFILTERS® distributor.

We have received your application for {{country}} and will complete our
initial review within [RESPONSE_DAYS] business days. You will hear from
us directly at this email address with our next step.

While you wait, we recommend reviewing the following resources. They
represent the technical foundation of the ELIMFILTERS® distributor program —
the same content your sales team will use with customers:

ELIMFILTERS® Knowledge System
elimfilters.com/knowledge-system

Industrial filtration standards, contamination failure modes, and fleet
optimization strategies — organized by domain. This is the training
curriculum your team will complete as part of onboarding.

Part Search Tool
part-search.elimfilters.com

20,000+ OEM cross-references. Search any part number to find the
ELIMFILTERS® equivalent. This is one of the primary tools your team
will use with customers daily.

If you have an immediate question before we complete our review:
WhatsApp: [COMMERCIAL_WHATSAPP]
Email: info@elimfilters.com

We will be in touch.

ELIMFILTERS® Commercial Team
Frisco, Texas · elimfilters.com
```

**Field interpolation keys:**
- `{{contactName}}` → maps to form field `name="contactName"`
- `{{country}}` → maps to form field `name="country"`

### 2B — Formspree Configuration Steps

All of the following are performed in the Formspree dashboard. No code changes are required for the auto-reply.

**Step 1:** Log in to formspree.io with the account that owns form `mbjekqwb`

**Step 2:** Navigate to the form → click the gear icon (Settings)

**Step 3:** Open the **"Emails"** or **"Notifications"** tab (label varies by plan)

**Step 4:** Locate **"Auto-response to submitter"** or **"Send Auto-Response"** — enable it

**Step 5:** Configure the auto-response:
- **"Reply-to field"**: select `email` from the dropdown (this tells Formspree which field holds the applicant's email address — this field must be named exactly `email` in the form HTML, which it currently is)
- **"From name"**: `ELIMFILTERS® Commercial Team`
- **"Subject"**: `Your ELIMFILTERS® distributor application — received`
- **"Body"**: paste the plain-text body from Section 2A above

**Step 6:** Save. Test by submitting the form with a real email address.

### 2C — Plan Tier Notes

| Feature | Free Plan | Starter Plan (~$10/mo) |
|---------|-----------|------------------------|
| Auto-response enabled | Yes | Yes |
| Custom subject line | Yes | Yes |
| Custom email body | Limited | Full control |
| Field interpolation (`{{contactName}}`, `{{country}}`) | No | Yes |
| From name customization | No | Yes |

**If on free plan:** The auto-response will send with a generic subject and body. It confirms receipt but cannot address the applicant by name or mention their country. Upgrade to Starter to enable the full template.

**Minimum viable free-tier version:**
```
Subject: Your ELIMFILTERS® distributor application has been received

Thank you for submitting your distributor application. Our team will
review your information and contact you within [RESPONSE_DAYS] business
days.

ELIMFILTERS® Commercial Team
elimfilters.com
```

### 2D — Hidden Field Addition to Form (Required for Interpolation)

To ensure Formspree can correctly reference `contactName` and `country` in the auto-reply template, both fields must be submitted with those exact `name` attributes. Verify in `frontend/src/app/distributor-application/page.tsx`:

- Input for Contact Name currently has `name="contactName"` ✓ (line 353 — already correct)
- Input for Country currently has `name="country"` ✓ (line 475 — already correct)
- Input for Email currently has `name="email"` ✓ (line 391 — already correct)

No form HTML changes needed for interpolation to work.

---

## PART 3 — RESPONSE TIMELINE COPY

### 3A — Exact Copy

**Short version (inline, near submit button):**
```
Applications are reviewed within [RESPONSE_DAYS] business days.
You will receive our response at the email address you provided.
```

**Hero subheading version (replaces current hero description):**
```
Join the ELIMFILTERS® authorized distributor network. We review every
application within [RESPONSE_DAYS] business days and contact qualified
candidates directly.
```

### 3B — Placement in distributor-application/page.tsx

**File:** `frontend/src/app/distributor-application/page.tsx`

**Location 1 (hero description — replaces line 120–123):**

**Current:**
```tsx
            Join the ELIMFILTERS® network. We're seeking qualified distributors to expand our industrial filtration reach.
```

**Replace with:**
```tsx
            Join the ELIMFILTERS® authorized distributor network. We review every
            application within [RESPONSE_DAYS] business days and contact qualified
            candidates directly.
```

**Location 2 (above submit button — add after the final textarea div that closes at line 703):**

Add this block immediately before the `<motion.button type="submit"` element (currently line 706):

```tsx
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.4)',
                      fontFamily: 'Outfit, sans-serif',
                      marginBottom: '1.25rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Applications are reviewed within [RESPONSE_DAYS] business days.
                    You will receive our response at the email address you provided.
                  </p>
```

---

## PART 4 — "WHAT HAPPENS NEXT" SECTION COPY

### 4A — Exact Copy

```
WHAT HAPPENS AFTER YOU APPLY

01 / APPLICATION REVIEW
We evaluate your territory, industry focus, and product line fit.
Response within [RESPONSE_DAYS] business days.

02 / DISCOVERY CALL
A member of our commercial team contacts you to discuss your market
and how ELIMFILTERS® fits your current portfolio.

03 / PROGRAM TERMS
If there is a mutual fit, we provide program terms, territory details,
and onboarding timeline.
```

### 4B — JSX Block to Insert

**File:** `frontend/src/app/distributor-application/page.tsx`

**Insertion point:** After the closing `</div>` of the "Distributor Benefits" `<ul>` block (currently ends around line 252), before the outer left-column `</div>` at line 254, and before `</AnimateIn>` at line 255.

Add the following block:

```tsx
              <div
                style={{
                  marginTop: '3rem',
                  paddingTop: '2.5rem',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: '#FFF12D',
                    fontFamily: 'JetBrains Mono, monospace',
                    marginBottom: '1.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  // WHAT HAPPENS AFTER YOU APPLY
                </h3>

                {[
                  {
                    number: '01',
                    title: 'APPLICATION REVIEW',
                    body: `We evaluate your territory, industry focus, and product line fit. Response within [RESPONSE_DAYS] business days.`,
                  },
                  {
                    number: '02',
                    title: 'DISCOVERY CALL',
                    body: 'A member of our commercial team contacts you to discuss your market and how ELIMFILTERS® fits your current portfolio.',
                  },
                  {
                    number: '03',
                    title: 'PROGRAM TERMS',
                    body: 'If there is a mutual fit, we provide program terms, territory details, and onboarding timeline.',
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1.5rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#FFF12D',
                        fontWeight: 700,
                        minWidth: '28px',
                        paddingTop: '2px',
                      }}
                    >
                      {step.number}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          fontFamily: 'Space Grotesk, sans-serif',
                          color: 'rgba(255,255,255,0.9)',
                          marginBottom: '0.35rem',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {step.title}
                      </div>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          color: 'rgba(255,255,255,0.6)',
                          fontFamily: 'Outfit, sans-serif',
                          lineHeight: 1.55,
                          margin: 0,
                        }}
                      >
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
```

---

## PART 5 — DISTRIBUTOR APPLICATION FORM CHANGES

### 5A — Fields to Add

Three new fields are required by the prequalification workflow:

| Field | Name attribute | Type | Required | Purpose |
|-------|---------------|------|----------|---------|
| WhatsApp Number | `whatsapp` | tel | Yes | RFI contact channel; LATAM standard |
| Primary Industry | `primaryIndustry` | select | Yes | Routing and matching during review |
| Company Website | `website` | url | Yes | Primary verification tool in Step 3 |

### 5B — Field to Remove from State

The `employees` field exists in `formData` state (line 17) but is never rendered in the form. It should be removed from state to avoid sending a blank field to Formspree.

### 5C — Updated State Initialization

**File:** `frontend/src/app/distributor-application/page.tsx`

**Current `useState` call (lines 8–21):**
```tsx
  const [formData, setFormData] = useState({
    companyName: '',
    legalName: '',
    contactName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    employees: '',
    yearsInBusiness: '',
    currentProducts: '',
    serviceArea: '',
    message: '',
  });
```

**Replace with:**
```tsx
  const [formData, setFormData] = useState({
    legalName: '',
    contactName: '',
    email: '',
    whatsapp: '',
    country: '',
    state: '',
    website: '',
    primaryIndustry: '',
    yearsInBusiness: '',
    currentProducts: '',
    serviceArea: '',
    message: '',
  });
```

**Changes:**
- Removed: `companyName` (duplicate of `legalName`; was never used separately)
- Removed: `employees` (ghost field — in state but never rendered)
- Added: `whatsapp` (between `email` and `country`)
- Added: `website` (between `state` and `primaryIndustry`)
- Added: `primaryIndustry` (between `website` and `yearsInBusiness`)

### 5D — Updated Reset Object in handleSubmit

**Current reset object (lines 43–55):**
```tsx
        setFormData({
          companyName: '',
          legalName: '',
          contactName: '',
          email: '',
          phone: '',
          country: '',
          state: '',
          employees: '',
          yearsInBusiness: '',
          currentProducts: '',
          serviceArea: '',
          message: '',
        });
```

**Replace with:**
```tsx
        setFormData({
          legalName: '',
          contactName: '',
          email: '',
          whatsapp: '',
          country: '',
          state: '',
          website: '',
          primaryIndustry: '',
          yearsInBusiness: '',
          currentProducts: '',
          serviceArea: '',
          message: '',
        });
```

### 5E — Success Message: Extend Display Duration

**Current (line 57):**
```tsx
        setTimeout(() => setSubmitted(false), 5000);
```

**Replace with:**
```tsx
        setTimeout(() => setSubmitted(false), 30000);
```

Rationale: 5 seconds is too short for an applicant to read the confirmation. 30 seconds gives them time to copy the information before it disappears. The full solution is a persistent confirmation with the timeline text (Part 3), making the dismissal less critical.

### 5F — Updated Success Message Copy

**Current success message (lines 280–295):**
```tsx
                {submitted && (
                  <div
                    style={{
                      background: 'rgba(100, 200, 100, 0.2)',
                      border: '1px solid rgba(100, 200, 100, 0.4)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      fontSize: '0.95rem',
                      color: '#90ee90',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    ✓ Application submitted! Our team will review and contact you soon.
                  </div>
                )}
```

**Replace with:**
```tsx
                {submitted && (
                  <div
                    style={{
                      background: 'rgba(100, 200, 100, 0.08)',
                      border: '1px solid rgba(100, 200, 100, 0.3)',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      marginBottom: '1.5rem',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.95rem',
                        color: '#90ee90',
                        marginBottom: '0.5rem',
                        fontWeight: 600,
                      }}
                    >
                      ✓ Application received.
                    </div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.55)',
                        lineHeight: 1.5,
                      }}
                    >
                      We will complete our review within [RESPONSE_DAYS] business days
                      and contact you at the email address you provided. Check your inbox
                      for a confirmation email from ELIMFILTERS®.
                    </div>
                  </div>
                )}
```

### 5G — New Form Fields JSX

Insert the following three field blocks into the form. Placement order within the form:

**Recommended field order (final):**
1. Company Legal Name (existing)
2. Contact Name (existing)
3. Email (existing)
4. WhatsApp Number ← **NEW**
5. Country (existing)
6. State / Province (existing)
7. Company Website ← **NEW**
8. Primary Industry ← **NEW** (select)
9. Years in Business (existing)
10. Current Product Lines (existing)
11. Service Area / Markets (existing)
12. Additional Information (existing)

---

**WhatsApp field JSX** (insert after the Email field block, before the Country field block):

```tsx
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      placeholder="+1 555 000 0000"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>
```

---

**Company Website field JSX** (insert after State / Province field, before Primary Industry):

```tsx
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Company Website *
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      required
                      placeholder="https://yourcompany.com"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      }}
                    />
                  </div>
```

---

**Primary Industry select field JSX** (insert after Company Website, before Years in Business):

```tsx
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      Primary Industry *
                    </label>
                    <select
                      name="primaryIndustry"
                      value={formData.primaryIndustry}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(20,20,20,0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        color: formData.primaryIndustry ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.95rem',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <option value="" disabled>Select primary industry</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Mining">Mining</option>
                      <option value="Marine">Marine</option>
                      <option value="Construction">Construction</option>
                      <option value="Oil & Gas">Oil & Gas</option>
                      <option value="Power Generation">Power Generation</option>
                      <option value="Transportation & Fleets">Transportation & Fleets</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Bus & Coach">Bus & Coach</option>
                      <option value="Railway">Railway</option>
                      <option value="Waste Management">Waste Management</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
```

---

## PART 6 — DISTRIBUTOR PAGE CONTENT CHANGES

### 6A — Rewritten "Why Partner" Left Column

**File:** `frontend/src/app/distributor-application/page.tsx`

The left column currently has four content blocks: Market-Leading Technology, Global Support Infrastructure, Comprehensive Warranty, Distributor Benefits. Replace all four blocks (lines 152–253) with the following revised content. The `<h2>` heading "WHY PARTNER WITH ELIMFILTERS®?" at lines 141–151 is retained unchanged.

**Replacement content (insert after the `<h2>` block, before the `"What Happens Next"` block from Part 4):**

```tsx
              {/* Block 1: Sell on performance, not price */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  Sell on Performance, Not Price
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  ELIMFILTERS® is built on contamination control engineering — ISO standards,
                  Beta ratio efficiency, quantified TCO impact. Your sales team closes on
                  equipment reliability, not price. No commodity price pressure.
                </p>
              </div>

              {/* Block 2: Part Search tool */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  20,000+ OEM Cross-References — Live at Your Fingertips
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  The Part Search tool at{' '}
                  <a
                    href="https://part-search.elimfilters.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#FFF12D', textDecoration: 'none' }}
                  >
                    part-search.elimfilters.com
                  </a>{' '}
                  lets you or your customers find the ELIMFILTERS® equivalent for any OEM
                  part number in seconds. No catalog, no lookup table, no waiting on a
                  quote. Your competitors do not offer this.
                </p>
              </div>

              {/* Block 3: Knowledge System as sales toolkit */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  30 Technical Pages — Your Team's Sales Toolkit
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  The{' '}
                  <a
                    href="/knowledge-system"
                    style={{ color: '#FFF12D', textDecoration: 'none' }}
                  >
                    ELIMFILTERS® Knowledge System
                  </a>{' '}
                  covers ISO standards, contamination failure modes, and fleet optimization
                  strategies — organized by industry and system type. Your team uses these
                  pages in customer conversations. Your customers use them to understand why
                  filtration decisions affect equipment lifespan.
                </p>
              </div>

              {/* Block 4: Engine protection warranty */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  Engine Protection Warranty — A Closing Argument
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  ELIMFILTERS® includes engine protection coverage with every authorized
                  distributor sale. Non-prorated, with 24-hour response. Tell your customer:
                  if this filter fails and damages the engine, ELIMFILTERS® covers the repair.
                  No competing brand in this category makes that commitment.
                </p>
              </div>

              {/* Block 5: 11-language site */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  11 Languages — Your Customers Served in Their Language
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.65)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  The ELIMFILTERS® website detects your customer's language and serves
                  content in Spanish, Portuguese, French, German, and eight other languages
                  automatically. Send a customer to elimfilters.com — they get it in their
                  own language without any setup on your end.
                </p>
              </div>

              {/* Block 6: Program structure */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    marginBottom: '0.6rem',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  Program Structure
                </h3>
                <ul
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'Outfit, sans-serif',
                    lineHeight: 1.75,
                    paddingLeft: '1.25rem',
                    margin: 0,
                  }}
                >
                  <li>Territory-based exclusivity for qualified distributors</li>
                  <li>Competitive wholesale pricing with volume structure</li>
                  <li>Dedicated account manager and WhatsApp technical support</li>
                  <li>Three-module training program (online, 8 hours)</li>
                  <li>Co-brandable digital marketing materials</li>
                  <li>Priority order fulfillment and 24H warranty response</li>
                </ul>
              </div>
```

---

## PART 7 — CTA UPDATES

**Note:** CTA expansion to additional pages is classified as Phase 2 (Important, not blocking) in the improvement plan. This section is included in the spec for completeness and to enable Phase 2 execution without re-reading planning documents.

### 7A — Reusable Distributor CTA Component Spec

**File to create:** `frontend/src/components/DistributorCTA.tsx`

**Purpose:** A self-contained bottom-of-page CTA block that can be dropped into any page. Used in Phase 2 on Technologies, Industries, and Warranty pages.

**Copy:**
```
Become an Authorized ELIMFILTERS® Distributor

Expand your industrial product range with a brand built on contamination
control engineering — technical selling tools, 20,000+ OEM cross-references,
and territory-based exclusivity for qualified partners.

[button] APPLY NOW  →  /distributor-application
[link text] What to expect from the process  →  /distributor-application#process
```

**Component JSX:**

```tsx
'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export function DistributorCTA() {
  return (
    <section
      style={{
        background: 'rgba(255,241,45,0.04)',
        borderTop: '1px solid rgba(255,241,45,0.12)',
        padding: '4rem 2rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '1rem',
          }}
        >
          // AUTHORIZED DISTRIBUTOR PROGRAM
        </p>
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 900,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}
        >
          Become an Authorized ELIMFILTERS® Distributor
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'Outfit, sans-serif',
            lineHeight: 1.65,
            maxWidth: '580px',
            margin: '0 auto 2rem',
          }}
        >
          Expand your industrial product range with a brand built on
          contamination control engineering — technical selling tools,
          20,000+ OEM cross-references, and territory-based exclusivity
          for qualified partners.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/distributor-application"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: '#FFF12D',
              color: '#000',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            APPLY NOW
          </Link>
          <Link
            href="/distributor-application"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              fontSize: '0.85rem',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            What to expect →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
```

### 7B — Pages That Receive the CTA (Phase 2)

| File | Current last section | Add CTA before |
|------|---------------------|----------------|
| `frontend/src/app/technologies/page.tsx` | FAQ section or closing section | Before `</main>` |
| `frontend/src/app/industries/page.tsx` | FAQ section or closing section | Before `</main>` |
| `frontend/src/app/warranty/page.tsx` | CTA → /contact | Replace existing generic CTA or add above it |

**To add the CTA to any of these pages:**
1. Import: `import { DistributorCTA } from '@/components/DistributorCTA';`
2. Add `<DistributorCTA />` before `</main>`

---

## PART 8 — REQUIRED CODE CHANGES (SUMMARY)

| # | File | Change Type | Description | Phase |
|---|------|-------------|-------------|-------|
| 1 | `frontend/src/app/about/page.tsx` | Copy | Add Kleo identity statement after hero description | 1 |
| 2 | `frontend/src/components/Footer.tsx` | Copy | Update copyright line | 1 |
| 3 | `frontend/src/app/distributor-application/page.tsx` | Copy | Update hero subheading | 1 |
| 4 | `frontend/src/app/distributor-application/page.tsx` | State | Remove `companyName`, `employees`; add `whatsapp`, `website`, `primaryIndustry` | 1 |
| 5 | `frontend/src/app/distributor-application/page.tsx` | State | Update reset object in `handleSubmit` | 1 |
| 6 | `frontend/src/app/distributor-application/page.tsx` | Copy + JSX | Replace success message with extended version including timeline | 1 |
| 7 | `frontend/src/app/distributor-application/page.tsx` | JSX | Add WhatsApp field (after Email) | 1 |
| 8 | `frontend/src/app/distributor-application/page.tsx` | JSX | Add Company Website field (after State) | 1 |
| 9 | `frontend/src/app/distributor-application/page.tsx` | JSX | Add Primary Industry select field (after Website) | 1 |
| 10 | `frontend/src/app/distributor-application/page.tsx` | Copy + JSX | Replace left-column "Why Partner" content (6 blocks) | 1 |
| 11 | `frontend/src/app/distributor-application/page.tsx` | Copy + JSX | Add "What Happens Next" 3-step block (end of left column) | 1 |
| 12 | `frontend/src/app/distributor-application/page.tsx` | Copy | Add response timeline text above submit button | 1 |
| 13 | `frontend/src/app/distributor-application/page.tsx` | Logic | Extend success message display from 5s to 30s | 1 |
| 14 | Formspree dashboard | Config | Enable auto-reply, set subject/body, configure reply-to field | 1 |
| 15 | `frontend/src/components/DistributorCTA.tsx` | New file | Create reusable distributor CTA component | 2 |
| 16 | `frontend/src/app/technologies/page.tsx` | JSX | Add `<DistributorCTA />` | 2 |
| 17 | `frontend/src/app/industries/page.tsx` | JSX | Add `<DistributorCTA />` | 2 |
| 18 | `frontend/src/app/warranty/page.tsx` | JSX | Add `<DistributorCTA />` | 2 |

**Files with no changes:**
- `frontend/src/app/contact/page.tsx` — no changes needed
- `frontend/src/app/page.tsx` (home) — rotating CTA and stats are not modified
- `frontend/src/components/Navigation.tsx` — no changes needed
- All Knowledge System pages — no changes needed

---

## PART 9 — FILE-BY-FILE IMPLEMENTATION PLAN

### FILE 1: `frontend/src/components/Footer.tsx`

**Scope:** 1 line change.

**Current (line 226):**
```tsx
              © 2015–2026 Kleo Technologies
```

**Target:**
```tsx
              © 2015–2026 ELIMFILTERS® — Kleo Technologies LLC
```

**Verification:** Build → check footer on any page. Single line visible in the bottom-right copyright block.

---

### FILE 2: `frontend/src/app/about/page.tsx`

**Scope:** Insert one `<motion.p>` block after line 106.

**Insert after** the closing `</motion.p>` that ends with `"We design systems that prevent contamination before it damages."` (currently line 106):

```tsx
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.45)',
                fontFamily: 'Outfit, sans-serif',
                maxWidth: '680px',
                marginTop: '1.5rem',
              }}
            >
              [KLEO_STATEMENT]
            </motion.p>
```

**Verification:** Build → visit `/about` → confirm the statement appears below the hero description, in muted text, before the "RISK FIRST" section.

---

### FILE 3: `frontend/src/app/distributor-application/page.tsx`

**Scope:** Multiple targeted changes to a single file. Perform in this sequence to avoid line offset drift:

**Change sequence (top to bottom in the file):**

**3.1 — State initialization** (lines 8–21): Replace `useState` call per Part 5C.

**3.2 — handleSubmit reset object** (lines 43–55): Replace reset object per Part 5D.

**3.3 — Success message timeout** (line 57): Change `5000` to `30000`.

**3.4 — Hero subheading** (lines 118–123): Replace per Part 3B (Location 1).

**3.5 — Success message JSX** (lines 280–295): Replace with extended version per Part 5F.

**3.6 — Left column content** (lines 152–253): Replace "Why Partner" four blocks with six new blocks per Part 6A. The `<h2>` at lines 141–151 is retained.

**3.7 — WhatsApp field**: Insert after the closing `</div>` of the Email field block (currently around line 418).

**3.8 — Website field**: Insert after the closing `</div>` of the State/Province field block (currently around line 541).

**3.9 — Primary Industry select field**: Insert after the closing `</div>` of the Website field added in step 3.8.

**3.10 — Response timeline text**: Insert before the `<motion.button type="submit"` element per Part 3B (Location 2).

**3.11 — "What Happens Next" block**: Insert at the end of the left column, after the last benefit block, before the outer `</div>` per Part 4B.

**Verification:**
- `npm run build` — should produce no TypeScript errors
- Visit `/distributor-application`
- Left column: 6 benefit blocks + "What Happens Next" 3-step block visible
- Form: WhatsApp, Website, Primary Industry (select) fields present and required
- Hero: updated subheading with timeline reference
- Submit form with test data → success message shows 30 seconds with timeline text

---

### FILE 4: Formspree Dashboard (not a codebase file)

**Scope:** External configuration. Performed once by the person with Formspree account access.

**Steps:** Per Part 2B above.

**Verification:** Submit a test application with a real email address → confirm auto-reply email arrives within 2 minutes with correct subject line and body content.

---

### FILE 5: `frontend/src/components/DistributorCTA.tsx` (Phase 2)

**Scope:** New file creation. Full JSX per Part 7A.

**Verification:** Import into any page, add `<DistributorCTA />` to JSX, build, check rendering.

---

### FILE 6: Technologies, Industries, Warranty pages (Phase 2)

**Scope:** Import `DistributorCTA`, add `<DistributorCTA />` before `</main>` in each file.

Per Part 7B.

---

## PART 10 — ESTIMATED IMPLEMENTATION EFFORT

### Phase 1 — Critical Changes (must complete before first distributor outreach)

| # | Item | File | Effort | Blocking? |
|---|------|------|--------|-----------|
| 1 | Confirm 4 prerequisite decisions (Section 0) | Internal | 30–60 min | Yes |
| 2 | Footer copyright update | Footer.tsx | 5 min | Yes |
| 3 | About page Kleo statement | about/page.tsx | 10 min | Yes |
| 4 | Hero subheading update | distributor-application/page.tsx | 5 min | Yes |
| 5 | State object updates (add 3 fields, remove 2) | distributor-application/page.tsx | 15 min | Yes |
| 6 | Success message JSX replacement | distributor-application/page.tsx | 15 min | Yes |
| 7 | WhatsApp field JSX | distributor-application/page.tsx | 10 min | Yes |
| 8 | Website field JSX | distributor-application/page.tsx | 10 min | Yes |
| 9 | Primary Industry select JSX | distributor-application/page.tsx | 15 min | Yes |
| 10 | Response timeline text above submit button | distributor-application/page.tsx | 5 min | Yes |
| 11 | Left column "Why Partner" rewrite | distributor-application/page.tsx | 30 min | Yes |
| 12 | "What Happens Next" block | distributor-application/page.tsx | 20 min | Yes |
| 13 | Build + verify | Terminal | 15 min | Yes |
| 14 | Formspree auto-reply configuration | Dashboard | 30 min | Yes |
| 15 | Auto-reply test (submit form, verify email) | Browser + inbox | 15 min | Yes |

**Phase 1 total:** ~3.5–4 hours (not counting prerequisite decisions)
**Critical path:** Prerequisites (Section 0) → code changes (all in one file session) → Formspree configuration → test

### Phase 2 — Important Changes (complete within first 30 days of recruitment)

| # | Item | File | Effort |
|---|------|------|--------|
| 1 | Create DistributorCTA component | DistributorCTA.tsx | 30 min |
| 2 | Add CTA to Technologies page | technologies/page.tsx | 15 min |
| 3 | Add CTA to Industries page | industries/page.tsx | 15 min |
| 4 | Add CTA to Warranty page | warranty/page.tsx | 15 min |
| 5 | Build + verify all three pages | Terminal + browser | 15 min |

**Phase 2 total:** ~1.5 hours

### Effort Summary

| Phase | Hours | Blocks Recruitment |
|-------|-------|-------------------|
| Section 0 — Prerequisite decisions | 0.5–1h | Yes |
| Phase 1 — Code changes | ~3h | Yes |
| Phase 1 — Formspree config + test | ~1h | Yes |
| Phase 2 — CTA expansion | ~1.5h | No |
| **Total Phase 1** | **~4–5h** | — |
| **Total Phase 1 + 2** | **~5.5–6.5h** | — |

### What the Critical Path Looks Like in Practice

The fastest path to a conversion-ready state:

```
Day 1, morning — Internal session (30–60 min)
  Confirm Kleo statement copy
  Confirm WhatsApp number
  Confirm response timeline (5 business days — yes/no)
  Confirm Formspree plan tier (upgrade if needed)

Day 1, afternoon — Implementation session (3–4 hours)
  All code changes to three files (Footer, About, Distributor Application)
  Build and local test
  Formspree dashboard configuration
  End-to-end form submission test

Day 2 — Verification (30 min)
  Check auto-reply received correctly
  Check rendered pages on all screen sizes
  Confirm no TypeScript build errors
  Push to branch → deploy
```

Upon completion, the distributor acquisition flow moves from **B (requires improvement)** to **A (ready for recruitment)**.

---

## APPENDIX A — PLACEHOLDERS REFERENCE

All placeholders used throughout this document, with their expected values:

| Placeholder | Description | Default / Draft | Status |
|-------------|-------------|-----------------|--------|
| `[KLEO_STATEMENT]` | Full sentence describing relationship | See Section 1A draft | Requires approval |
| `[COMMERCIAL_WHATSAPP]` | International format WhatsApp number | e.g. `+1 (940) 555-0001` | Requires confirmation |
| `[RESPONSE_DAYS]` | Review period commitment | `5` | Requires confirmation |

---

## APPENDIX B — WHAT DOES NOT CHANGE

Per the improvement plan, these elements are at or above the threshold for distributor recruitment readiness. Do not modify them during Phase 1:

- Home page rotating CTA, stats block, or hero content
- Navigation structure or links
- Knowledge System pages (any of the 30 pages)
- Contact page form or content
- Technologies page primary content
- Industries page primary content
- Warranty page primary content
- All i18n translation files (changes to page.tsx copy do not require translation file updates unless the pages use `t()` calls — the distributor application page does not use i18n)
- `unified-data.ts` (locked — do not modify)
- `next.config.js` — `output: 'export'` must remain unchanged

---

*Specification completed: 2026-06-04*
*Inputs: 4 planning documents + static code analysis of 3 React page files + 2 component files*
*Scope: Phase 1 implementation only — Phase 2 specified but not blocking*
