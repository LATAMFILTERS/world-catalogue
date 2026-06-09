# DISTRIBUTOR PREQUALIFICATION FLOW
## ELIMFILTERS® — Phase 1 Intake Workflow
**Date:** 2026-06-04 · **Input:** DISTRIBUTOR_PROGRAM_DECISION_WORKBOOK.md

---

## PURPOSE

The prequalification flow converts a form submission into a qualified or disqualified candidate before any commercial conversation begins. It protects the commercial team's time, ensures only real industrial distributors enter the evaluation pipeline, and sets expectations with the candidate from the first moment of contact.

This flow covers the period from form submission to the start of the Distributor Evaluation Stage — the point where the candidate receives a discovery call invitation.

---

## PHASE 1 FORM — FIELD REFERENCE

The prequalification form collects 8 fields:

| Field | Type | Required |
|-------|------|----------|
| Company Name | Text | Yes |
| Contact Person | Text | Yes |
| Corporate Email | Email | Yes |
| WhatsApp | Phone | Yes |
| Country | Text | Yes |
| Primary Industry | Select or Text | Yes |
| Company Website | URL | Yes |
| Comments | Textarea | No |

**Note on field design:** "Primary Industry" should be a select field with ELIMFILTERS®' 12 industry options plus "Other." This produces structured data and prevents free-text entries that require interpretation. "Company Website" is required — it is the primary verification tool in Step 3.

---

## WORKFLOW OVERVIEW

```
CANDIDATE                           ELIMFILTERS®
─────────────                       ────────────────────────────────────
Submits Phase 1 form
                                    [AUTO] Confirmation email sent (< 2 min)
                                    [AUTO] Internal notification sent (< 2 min)
                                    [MANUAL] Lead logged in tracker (Day 1)
                                    [MANUAL] Website evaluation (Day 1–2)

                                    DECISION POINT A
                                    ├── CLEAR PASS → Step 5 (Approval)
                                    ├── INCONCLUSIVE → Step 4 (RFI)
                                    └── CLEAR FAIL → Step 6 (Rejection)

[If RFI] Candidate receives info request
Candidate responds (or does not respond)
                                    [MANUAL] Re-evaluate with additional info

                                    DECISION POINT B
                                    ├── PASS → Step 5 (Approval)
                                    └── FAIL → Step 6 (Rejection)

[If Pass] Candidate receives prequalification email
                                    Transition to Distributor Evaluation Stage
                                    [MANUAL] Discovery call scheduled
```

---

## STEP 1 — LEAD SUBMISSION

### What happens at the moment of form submission

The candidate completes the 8-field form at `/distributor-application` and clicks submit.

Three events occur simultaneously and automatically:

**Event A — Confirmation email** is sent to the candidate's corporate email address. Content is defined in Step 2.

**Event B — Internal notification** is sent to the designated commercial inbox (info@elimfilters.com or a dedicated commercial team inbox). The notification includes all 8 form fields in a structured format so the reviewer can immediately assess the lead without logging into Formspree.

**Event C — Lead entry** is created in the lead tracking system (see Step 1B below).

### Step 1B — Lead Logging

Within the same business day as receipt, the commercial team logs the lead in the tracking system. For Version 1 at small volume, a shared spreadsheet is sufficient. Each lead receives:

| Field | Content |
|-------|---------|
| Lead ID | Sequential (LATAM-001, LATAM-002, etc.) |
| Date received | Auto-populated |
| Company Name | From form |
| Country | From form |
| Primary Industry | From form |
| Website | From form |
| Assigned reviewer | Name of commercial team member |
| Status | New |
| Next action | Website evaluation |
| Next action date | Within 2 business days of receipt |

**Tracking system requirement:** The lead tracker must be accessible to at least two people (primary reviewer + backup). A Google Sheet shared with the commercial team is the minimum viable Version 1 implementation.

---

## STEP 2 — AUTOMATIC CONFIRMATION EMAIL

### Trigger

Sent automatically by Formspree within 2 minutes of form submission. Delivered to the `Corporate Email` field address.

### Subject Line

```
Your ELIMFILTERS® distributor application — received
```

### Email Body

```
[Contact Person name],

Thank you for your interest in becoming an authorized ELIMFILTERS® distributor.

We have received your application for [Country] and will complete our initial 
review within 5 business days. You will hear from us directly at this email 
address with our next step.

While you wait, we recommend reviewing the following resources. They represent 
the technical foundation of the ELIMFILTERS® distributor program — the same 
content your sales team will use with customers:

ELIMFILTERS® Knowledge System
elimfilters.com/knowledge-system
Industrial filtration standards, contamination failure modes, and fleet 
optimization strategies — organized by domain.

Part Search Tool
part-search.elimfilters.com
20,000+ OEM cross-references. Search any part number to find the ELIMFILTERS® 
equivalent. This is one of the primary tools your team will use daily.

If you have an immediate question, contact us directly:
WhatsApp: [COMMERCIAL TEAM WHATSAPP NUMBER]
Email: info@elimfilters.com

We will be in touch.

ELIMFILTERS® Commercial Team
Frisco, Texas · elimfilters.com
```

### Design Rules for the Confirmation Email

**Use the candidate's name, not a generic greeting.** Formspree supports field interpolation. `{Contact Person}` in the template becomes the value submitted in the form.

**Include the Knowledge System and Part Search links.** A candidate who spends time in these tools before the review call is a better-qualified candidate. The confirmation email creates that self-education opportunity.

**Include the WhatsApp number.** The LATAM commercial expectation is that a real company has a WhatsApp. Its absence in the confirmation email would be noticed as an anomaly.

**Do not include pricing, program terms, or commitment language.** The confirmation email is not a sales email. Its only function is to confirm receipt and set expectations.

**Do not auto-reject or auto-approve.** The confirmation email makes no judgment about the application. Every submitted lead receives the same confirmation email before the review begins.

---

## STEP 3 — INTERNAL REVIEW PROCESS

### Timing

Initiated within 2 business days of form submission. Completed within 5 business days. The reviewer goal is to reach Decision Point A within 48 hours of receipt.

### Reviewer

One designated commercial team member is assigned at the time of lead logging. The same person completes the website evaluation (Step 3B) and makes the initial pass/fail determination (Step 4).

### Step 3A — Form Data Scan (15 minutes)

Before opening the candidate's website, the reviewer reads the 8 form fields and records initial observations:

**Country check.** Is this country a Tier 1 or Tier 2 target market? Is it in LATAM? An application from outside LATAM is not automatically disqualified — but it requires a note explaining the exception.

**Industry check.** Is the declared Primary Industry one of ELIMFILTERS®' 12 target industries? If the candidate selected "Other" and wrote "retail auto parts," this is a yellow flag before the website is opened.

**Website presence check.** Does the URL look like a real company website? (Not a Facebook page, not a Wix placeholder, not a landing page with no content.) If the field is blank or contains a social media URL, this is noted.

**Comments check.** If the candidate wrote anything in the Comments field, read it carefully. This is where motivated candidates often provide context that accelerates the review: "We currently distribute Mann filters in the Antioquia region and are looking for a premium alternative for our mining accounts."

**Email domain check.** Does the corporate email match the company domain? A Gmail or Hotmail address for a company claiming to be an established industrial distributor is a yellow flag. It does not disqualify, but it adds to the inconclusive column.

### Step 3B — Website Evaluation

The reviewer visits the company website and completes the Website Evaluation Checklist (see Step 3C). The website evaluation is the primary verification tool because a company's website reflects its actual commercial identity better than any self-reported form field.

**Time allocation:** 20–30 minutes per lead.

**If no website is found** (domain does not load, website is under construction, website is a social media profile):
- Search the company name on LinkedIn, Google Maps, and Instagram
- If the company has a genuine online presence in those channels that confirms industrial activity, note it and continue
- If no verifiable online presence exists, mark the lead as INCONCLUSIVE and proceed to the Request for Additional Information step (Step 5)

### Step 3C — Website Evaluation Checklist

The reviewer completes this checklist while reviewing the candidate's website. Each item is marked: **Yes / No / Unclear**.

#### CATEGORY 1 — Company Identity (Is this a real industrial company?)

```
□ Website has a company name that matches the form submission
□ Website has a physical address (city, country)
□ Website has been operational for more than 1 year (check footer copyright or domain age if needed)
□ Website appears to represent an established business, not a startup or placeholder
□ Website language is consistent with declared country (Spanish for Colombia, Portuguese for Brazil, etc.)
```

#### CATEGORY 2 — Industrial Customer Base (Does this company serve industrial buyers?)

```
□ Website mentions industrial clients, industrial sectors, or industrial applications
□ Website does NOT appear to be purely a retail auto parts or consumer-facing business
□ Products or services listed are consistent with the declared Primary Industry
□ Imagery on the website shows industrial equipment, facilities, or operations (not retail shelves or consumer vehicles)
□ Customer references, client logos, or case studies visible (if any)
```

#### CATEGORY 3 — Product Lines and Technical Orientation (Can this team sell a technical product?)

```
□ Website lists specific product brands or product lines currently distributed
□ At least one current product line is a technical industrial product (filters, lubricants, hydraulic components, pneumatic components, or similar)
□ Website contains technical language appropriate for industrial buyers (not only pricing or generic descriptions)
□ Product pages or catalog exist (even if basic)
```

#### CATEGORY 4 — Geographic Coverage (Does this company actually operate in the declared territory?)

```
□ Company address is consistent with declared country
□ Website indicates service area, coverage regions, or client locations in the declared territory
□ Contact page has a local phone number for the declared country
```

#### CATEGORY 5 — Commercial Signals (Does this company invest in its commercial presence?)

```
□ Website is reasonably current (not visibly outdated more than 3 years, dead links, or incorrect copyright)
□ Website has a contact page with a working email address
□ Company has a LinkedIn page (search independently if not linked from website)
□ Social media presence, if any, is active in the last 6 months
```

### Step 3D — Reviewer Notes

After completing the checklist, the reviewer writes 3–5 sentences summarizing the overall impression:

- What kind of company is this?
- What do they currently sell?
- Who are their apparent customers?
- What is the strongest evidence for or against qualification?
- What is still unknown?

These notes become the basis for the Decision Point A determination.

---

## STEP 4 — PASS / FAIL CRITERIA

### Decision Point A — Determination

Based on the form data scan (Step 3A) and website evaluation checklist (Step 3C), the reviewer places the lead into one of three buckets:

---

### CLEAR PASS

The lead meets the following minimum conditions across all four qualification dimensions:

**Industrial customer base:** Website confirms the company serves industrial clients in at least one of ELIMFILTERS®' 12 target industries. Industrial clients are not end consumers. A mining equipment dealer, an agricultural machinery importer, a marine engine service company, and a truck fleet maintenance supplier all qualify. A retail auto parts shop that occasionally sells to a local mechanic does not.

**Technical product lines:** The company currently distributes at least one technical industrial product — filters, lubricants, hydraulic components, seals, pneumatic systems, or industrial chemicals. A company that exclusively sells office supplies or consumer goods does not qualify regardless of size.

**Operational history:** Website or LinkedIn confirms the company has been operating for at least 2 years. Companies founded in the current or prior year require additional verification.

**Geographic coherence:** The declared country matches the company's apparent location. A company claiming to cover all of Mexico with a single person in a regional city is Inconclusive, not a Clear Pass.

**No disqualifying signals:** None of the disqualifying signals listed under Clear Fail are present.

---

### CLEAR FAIL

The lead is disqualified if any single one of the following conditions is true:

```
□ The company is exclusively a retail auto parts or consumer goods operation
   (no evidence of industrial clients at any level)

□ The website does not exist, has not loaded in 48 hours, and no alternative 
   online presence can be found (LinkedIn, Google Maps, trade directory)

□ The declared Primary Industry is "Other" and the comments or website 
   reveal an industry with no connection to mechanical equipment, fluid 
   systems, or heavy machinery (e.g., food retail, hospitality, software)

□ The contact email is a personal Gmail or Hotmail address AND no company 
   website exists AND no LinkedIn company page exists — three simultaneous 
   signals of non-institutional origin

□ The declared country is under active international trade sanctions or 
   presents a supply chain that ELIMFILTERS® cannot currently serve

□ The company's website or LinkedIn reveals a direct conflict of interest 
   (e.g., the company owns a filtration manufacturing brand that directly 
   competes with ELIMFILTERS®)
```

**Single-flag rule:** One yellow flag (e.g., Gmail address alone) is not a disqualification. It moves the lead toward Inconclusive. Disqualification requires one of the six explicit conditions above.

---

### INCONCLUSIVE

The lead cannot be clearly passed or failed based on available information. Common causes:

- Website exists but is minimal and does not confirm the industry or product lines
- Company name and website do not match (common after rebranding)
- Declared country is correct but coverage area appears narrower than expected
- Primary Industry declared as "Other" without clarifying context in the Comments field
- Website is in a language the reviewer cannot assess (requires translation)
- Company is in a relevant industry but appears very small (1–2 person operation) and the reviewer cannot determine whether they have the capacity for the opening order

**Resolution:** Inconclusive leads proceed to Step 5 (Request for Additional Information) before a pass/fail determination is made.

---

## STEP 5 — REQUEST FOR ADDITIONAL INFORMATION (RFI)

### Trigger

Used for Inconclusive leads only. Not used for Clear Pass or Clear Fail.

### Channel

WhatsApp. Send to the number provided in the form. WhatsApp is the correct channel because:
- It confirms the number is active (double-tick delivery confirmation)
- It is the LATAM commercial standard for B2B follow-up
- It produces faster responses than email for qualifying questions
- It demonstrates that ELIMFILTERS® operates the way LATAM distributors expect

If no response is received on WhatsApp within 3 business days, send the same message by email as a follow-up.

### RFI Message Template

```
Hello [Contact Person name], I'm [Reviewer name] from the ELIMFILTERS® 
commercial team. We received your distributor application for [Country] 
and we're reviewing it now.

To complete our evaluation, I have a few quick questions:

1. What industrial products does your company currently distribute? 
   (Filter brands, lubricants, hydraulic parts, etc.)

2. What type of companies are your main clients? 
   (Mining operations, agricultural companies, transport fleets, etc.)

3. In which regions of [Country] do you actively work?

You can reply here on WhatsApp or by email — whichever is easier.

Thank you,
[Reviewer name]
ELIMFILTERS® Commercial Team
```

### RFI Scope Rules

**Ask only what you cannot determine from the website and form.** If the website is clear that the company distributes Mann filters to mining operations in Antioquia, do not ask what products they distribute.

**Ask no more than 3 questions.** More than 3 questions in a first WhatsApp message signals disorganization and discourages response.

**Do not ask for documents at this stage.** No tax registration, no financial statements, no catalog PDFs. The prequalification stage is a conversation, not an audit.

### RFI Response Handling

**Response received within 5 business days:** Re-evaluate using the additional information. Proceed to Decision Point B (same pass/fail criteria as Decision Point A).

**No response after 5 business days (WhatsApp + email):** The lead is placed in the DORMANT category. Log as "Non-responsive — archived." Send one final email:

```
Subject: Your ELIMFILTERS® application — no response received

[Contact Person name],

We reached out on [date] with a few questions about your distributor 
application for [Country] but have not heard back.

If you're still interested in the ELIMFILTERS® program, you can 
reapply at elimfilters.com/distributor-application at any time. 
Our commercial team reviews applications as they arrive.

ELIMFILTERS® Commercial Team
```

No further follow-up after this message. The lead is closed.

---

## STEP 6 — PREQUALIFICATION APPROVAL PROCESS

### Decision Point A: Clear Pass → Approval

When a lead reaches Clear Pass, the reviewer completes the following:

**Internal approval record.** The lead tracker is updated:
- Status: PREQUALIFIED
- Decision date
- Reviewer name
- Key evidence (2–3 bullet points summarizing why the lead passed)
- Anchor industry identified
- Territory confirmed

**No additional approval required for a standard Clear Pass.** The reviewer has full authority to advance a Clear Pass lead to the Approval Notification step. This keeps the process moving without requiring management sign-off on every routine qualification.

**Exception: Management review required if:**
- The lead is from a country not on the Tier 1 or Tier 2 target list
- The lead represents a company with more than 100 employees (large distributor relationships may carry different terms)
- The reviewer has any concern about the company's integrity, competitive conflicts, or misrepresentation in the form

### Decision Point A: Clear Fail → Rejection

**Rejection notification sent within 5 business days of form submission.** Channel: email only (not WhatsApp — rejection is a formal communication).

**Rejection email:**

```
Subject: Your ELIMFILTERS® distributor application

[Contact Person name],

Thank you for your interest in the ELIMFILTERS® distributor program.

After reviewing your application, we do not have a program match for 
[Company Name] at this time. Our current distributor profile is focused 
on [companies with established industrial customer bases / specific 
industries — adapt to the reason without naming the specific disqualifier].

We may revisit our program structure in the future. If your company's 
profile changes, you are welcome to reapply at any time.

Thank you for reaching out.

ELIMFILTERS® Commercial Team
```

**Rejection email rules:**
- Do not explain the specific reason for disqualification. Explain in general terms only.
- Do not use language that invites negotiation ("unfortunately we cannot" implies there is a way to change the outcome).
- Do not promise future consideration unless it is genuine.
- Keep the tone professional and brief. One paragraph is sufficient.

**Internal record:** Lead tracker updated to DISQUALIFIED, with the specific reason logged internally (not shared with the candidate).

### Decision Point B (after RFI): Same Criteria as Decision Point A

If additional information from the RFI resolves the Inconclusive status, the lead is evaluated against the same Pass/Fail criteria and processed accordingly. No new review step is required.

---

## STEP 7 — APPROVAL NOTIFICATION

### Trigger

A prequalified lead (Clear Pass or Post-RFI Pass) proceeds to Approval Notification.

### Timing

Sent within 5 business days of form submission. The goal is to contact the candidate before they lose interest or engage a competing brand.

### Channel

**WhatsApp first.** A brief WhatsApp message is sent before the formal email, to establish personal contact and set up the email as an expected follow-up.

**WhatsApp message (sent first):**

```
Hello [Contact Person name], this is [Reviewer name] from ELIMFILTERS®. 
We've reviewed your distributor application for [Country] and we'd like 
to move forward. I'm sending you an email right now with the details and 
next steps. Please check your inbox.
```

**Approval email (sent immediately after WhatsApp):**

```
Subject: Your ELIMFILTERS® application — next step

[Contact Person name],

Thank you for applying to the ELIMFILTERS® authorized distributor program 
for [Country].

We've completed our initial review and would like to invite you to a 
Discovery Call — a 30-minute conversation where we present the ELIMFILTERS® 
program, answer your questions, and explore whether there is a mutual fit 
for [Country].

The Discovery Call covers:
→ The ELIMFILTERS® product range and 9 protection architectures
→ Our distributor program terms and support structure
→ Your declared market and anchor industry
→ Expected timeline from approval to first order

To schedule your Discovery Call, reply to this email with your availability 
over the next 5 business days. We'll confirm a time that works.

Alternatively, if you have an immediate question, reach us on WhatsApp:
[COMMERCIAL TEAM WHATSAPP NUMBER]

We look forward to speaking with you.

[Reviewer name]
ELIMFILTERS® Commercial Team
Frisco, Texas · elimfilters.com
```

### What the Approval Notification Does NOT Include

- Pricing, wholesale terms, or margins (discussed in the Discovery Call, not before)
- Exclusivity commitments (not made until the formal agreement stage)
- A contract or agreement to sign (premature at prequalification)
- A request for documents (no tax registrations, financial statements, or company documents at this stage)

The approval notification is an invitation to a conversation. It advances the relationship without making premature commercial commitments.

---

## STEP 8 — TRANSITION TO DISTRIBUTOR EVALUATION STAGE

### Definition of Transition

The transition occurs when the candidate confirms availability for the Discovery Call. At this moment, the lead moves from the Prequalification Flow into the Distributor Evaluation Stage.

The Prequalification Flow is complete. The candidate is now a **qualified candidate** — not yet an authorized distributor.

### What Changes at Transition

| Before Transition | After Transition |
|-------------------|------------------|
| Status: PREQUALIFIED | Status: IN EVALUATION |
| Reviewer: commercial team | Account owner: named account manager |
| Communication: form + email + WhatsApp check-ins | Communication: scheduled calls + email |
| Goal: determine basic fit | Goal: determine commercial fit and mutual commitment |

### Transition Handoff Record

The reviewer completes the transition record in the lead tracker before the Discovery Call:

```
TRANSITION RECORD — PREQUALIFICATION TO EVALUATION

Lead ID:             [e.g., LATAM-007]
Company Name:        [from form]
Country:             [from form]
Anchor Industry:     [confirmed during review]
Contact Person:      [from form]
WhatsApp:            [from form]
Corporate Email:     [from form]
Website:             [from form]

Evidence of qualification:
  1. [e.g., Distributes Fleetguard and Donaldson filters in Peru]
  2. [e.g., Serves 40+ mining operations in the Junín and Pasco regions]
  3. [e.g., 8 years in operation per LinkedIn company page]

Anchor industry confirmed:      Mining
Territory confirmed:            Peru (national)
Tier designation:               Tier 1

Open questions for Discovery Call:
  - [e.g., Do they have an active catalog or online shop?]
  - [e.g., Who are their primary mining clients?]
  - [e.g., What is their current warehouse capacity?]

Discovery Call scheduled:       [date and time]
Account manager assigned:       [name]

Notes:
  [Any additional context from form comments or RFI conversation]
```

### What the Distributor Evaluation Stage Covers (Out of Scope for This Document)

The Discovery Call and subsequent Evaluation Stage are defined separately. At a high level, the Evaluation Stage includes:

1. Discovery Call (30 minutes) — program presentation and mutual qualification
2. Program One-Pager shared with candidate
3. Formal Application (if Phase 1 form is the prequalification, the full Distributor Application is the evaluation form — requiring: legal name, years in business, current product lines, service area, references)
4. Commercial terms discussion
5. Territory agreement

---

## WORKFLOW METRICS — TRACKING PREQUALIFICATION HEALTH

From Day 1 of program launch, the commercial team tracks the following metrics monthly. These identify where the flow is working and where it is failing:

| Metric | Target (Year 1) | Meaning if Below Target |
|--------|-----------------|------------------------|
| Forms submitted per month | — (baseline, track trend) | — |
| % Clear Pass on first review | ≥ 40% | Form is attracting wrong applicants; review CTA placement |
| % Clear Fail | ≤ 30% | — (some rejection is healthy) |
| % Inconclusive → RFI | ≤ 30% | Website evaluation checklist may be too strict |
| % Inconclusive → Pass (after RFI) | ≥ 50% | RFI questions are effective at resolving uncertainty |
| % Non-responsive to RFI | ≤ 20% | High non-response = candidates not genuinely interested when they applied |
| Days from submission to Decision Point A | ≤ 3 business days | Review process too slow; commercial team capacity issue |
| Days from submission to Approval Notification | ≤ 5 business days | Program commitment to candidate |
| % Prequalified → Discovery Call confirmed | ≥ 70% | Approval notification message needs revision |

---

## SLA SUMMARY

| Event | Maximum Time |
|-------|-------------|
| Confirmation email sent after submission | 2 minutes (automated) |
| Lead logged in tracker | Same business day |
| Website evaluation completed | 2 business days |
| Decision Point A reached | 3 business days |
| RFI sent (if Inconclusive) | 3 business days |
| RFI follow-up by email (if no WhatsApp response) | 3 business days after WhatsApp send |
| Candidate marked Non-responsive | 5 business days after RFI send |
| Rejection notification sent | 5 business days after submission |
| Approval notification sent | 5 business days after submission |
| Discovery Call scheduled | Within 5 business days of candidate confirming availability |

---

## VERSION 1 INFRASTRUCTURE REQUIREMENTS

The prequalification flow operates without custom software. The following tools are sufficient for the first 12 months:

| Function | Tool |
|----------|------|
| Form submission | Formspree (existing) |
| Confirmation email | Formspree auto-reply (dashboard configuration) |
| Internal notification | Formspree email notification to commercial inbox |
| Lead tracking | Google Sheets (shared with commercial team) |
| RFI and approvals | WhatsApp + Gmail |
| Website evaluation | Browser + LinkedIn + Google Maps |
| Discovery call scheduling | Calendly (free tier) or manual email |

When the monthly lead volume exceeds 20 submissions, migrate the lead tracker to a simple CRM (HubSpot free tier or Zoho CRM) to preserve visibility across a larger pipeline.

---

*Flow designed: 2026-06-04 · Workflow design only — no implementation · Input: DISTRIBUTOR_PROGRAM_DECISION_WORKBOOK.md*
