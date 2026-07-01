# CTA PLACEMENT GUIDELINES
## ELIMFILTERS Engineering Intelligence Platform — Phase 4

---

## 1. The CTA Constitutional Rule

**A CTA may only appear after the engineering reasoning that earns the right to ask.**

This is not a guideline. It is a constitutional constraint on the platform.

The sequence is always:
```
Engineering context presented  →  Trust signal reached  →  CTA appears
```

The inverse is never permitted:
```
CTA first  →  Engineering context as justification
```

If a CTA appears before the appropriate trust signal, it is a platform violation,
not a UX choice.

---

## 2. CTA Taxonomy

### Primary CTA
One per page or journey step. The most important action the visitor can take
given what they have just learned. Visually prominent. Yellow (#FFF12D).

### Secondary CTA
Zero or one per page. Lower commitment alternative to Primary.
Visually subdued. White border, no fill.

### Contextual CTA
Inline. Appears within engineering content as a logical continuation.
Not a button — a linked action phrase or inline card.

### Exit CTA
Appears at the end of a journey or article. Offers the logical next step
when the visitor has consumed the full page.

---

## 3. CTA Rules by Page Type

### Homepage

**Primary CTA (above fold):** Search bar (engineering entry) — not a button, the search itself.
**Secondary CTA (above fold):** None. The 4 Journey entry cards are navigation, not CTAs.
**First explicit CTA (below engineering section):** L-5 Newsletter subscribe (subtle).
**Product section CTA:** "Find your part" → search with PART_NUMBER intent.

**NOT on homepage:**
- "Request a quote" (trust not established)
- "Contact our sales team" (commercial framing, pre-trust)
- Any pricing reference

---

### Journey 2 — Asset Protection (Step-by-Step)

**Step 1 (Asset Selection):** No CTA.
**Step 2 (Risk Assessment):** Contextual: L-5 "Receive engineering intelligence updates" — small, sidebar only.
**Step 3 (Failure Modes):** Contextual: L-6 "Request failure analysis" — only if failure mode is severe.
**Step 4 (Contamination):** No CTA. Critical engagement step.
**Step 5 (Technology Recommendation):** Secondary: L-4 "Download technical specification".
**Step 6 (Protection System):**
  - Primary CTA: L-1 "Request engineering assessment for your application"
  - Secondary CTA: L-2 "Request a protection system quote"
**Step 7 (Products):**
  - Primary CTA: L-3 "Find your distributor" or Product add-to-cart
  - Secondary CTA: L-2 "Request quote" (if not already submitted)

---

### Journey 3 — Problem Diagnosis (Step-by-Step)

**Step 1 (Problem Description):** No CTA.
**Step 2 (Failure Mode Identified):**
  - Primary CTA: L-6 "Request failure analysis for your equipment"
  - Context: "We've identified the likely failure mode. Our engineers can validate this for your specific application."
**Step 3 (Root Cause):** No CTA. Visitor must understand the mechanism.
**Step 4 (Engineering Principle):** Contextual: L-4 "Download technical brief on [principle]"
**Step 5 (Technology Recommendation):**
  - Contextual CTA: L-1 "Schedule engineering consultation" (below recommendation trace)
**Step 6 (Protection Media):** No CTA.
**Step 7 (Products):**
  - Primary CTA: L-3 "Find distributor" (urgent framing: "Get this for your equipment")
  - Secondary CTA: L-2 "Request quote"

---

### Journey 1 — Part Number

**Steps 1–2 (Search + Cross-Reference):** No CTA. Fast path, do not interrupt.
**Step 3 (Engineering Explanation):**
  - Contextual (optional): L-4 "Download technology brief" — small, non-intrusive.
**Step 5 (Product Confirmed):**
  - Primary CTA: L-3 "Find distributor" or direct product purchase.
  - Secondary CTA: "Explore engineering context" → links to TechnologyPage.

---

### Technology Pages (Generated — GP-1)

**Above the fold:** No CTA. Engineering content first.
**After Technology Architecture section:** Contextual: L-4 "Download technical specification"
**After Recommendations section:** Secondary: L-1 "Discuss this technology for your application"
**Page footer / Exit:**
  - Primary CTA: L-2 "Get a quote for [Technology] products"
  - Secondary CTA: L-3 "Find distributor"
  - Contextual: L-5 "Engineering newsletter" (sidebar)

---

### Failure Mode Pages (Generated — GP-3)

**After Cause Chain section:** Contextual: L-6 "Request failure analysis"
**After Technology Recommendation section:**
  - Primary CTA: L-1 "Discuss prevention for your equipment"
  - Secondary CTA: L-2 "Request protection system quote"
**After Products section:** L-3 "Find distributor"

---

### Engineering Principle Pages (Generated — GP-2)

**After Definition section:** No CTA. Academic/research visitor — do not interrupt.
**After Technology section:**
  - Contextual: L-4 "Download technical brief"
**Page footer:**
  - Primary CTA: L-7 "Interested in engineering training on [principle]?"
  - Secondary CTA: L-5 Newsletter

---

### Standard Pages (Generated — GP-5)

**No commercial CTAs.** Standard pages are pure engineering reference.
Only contextual links to related technologies and principles.
Single exit CTA: L-5 Newsletter or L-4 Technical Download.
This preserves the credibility of standard pages as reference material.

---

### Knowledge System Hub / Articles

**Top of article:** No CTA.
**Mid-article (after 50% of content):** Contextual L-5 Newsletter (subtle inline).
**End of article:**
  - Primary CTA: L-4 "Download technical document" (if available)
  - Contextual: L-5 Newsletter
  - Navigation: "Continue learning → [related article]"

---

## 4. CTA Visual Hierarchy

```
PRIMARY CTA
  Background: #FFF12D (yellow)
  Text: #000 (black)
  Font: Outfit, 600, 0.9rem
  Padding: 0.75rem 1.75rem
  Border-radius: 4px
  Example: "Request engineering assessment"

SECONDARY CTA
  Background: transparent
  Border: 1px solid rgba(255,255,255,0.4)
  Text: #fff
  Font: Outfit, 500, 0.9rem
  Padding: 0.75rem 1.75rem
  Border-radius: 4px
  Example: "Request quote"

CONTEXTUAL CTA (inline text link with arrow)
  Color: #FFF12D
  Font: Inter, 500, 0.9rem
  Format: "→ [Action text]"
  Example: "→ Download technical specification"

EXIT CTA (card at bottom of page)
  Background: rgba(255,241,45,0.05)
  Border: 1px solid rgba(255,241,45,0.2)
  Contains: icon + headline + 1-line description + primary button
```

---

## 5. CTA Copy Standards

CTA copy must follow these rules:

**Use engineering verbs:**
- Request, Schedule, Download, Explore, Find, Calculate

**Reference the engineering context:**
- "Request engineering assessment for your hydraulic system" (not "Contact us")
- "Download MACROCORE technical specification" (not "Download PDF")
- "Find a distributor for this protection system" (not "Buy now")

**Name the value:**
- "Schedule consultation → protect your fleet from [identified failure mode]"
- "Request quote → implement [recommended protection system]"

**No urgency manipulation:**
- No "Limited time", "Act now", "Don't miss out"
- No countdown timers
- No artificial scarcity

Engineering customers distrust sales manipulation. Their trust was built
on engineering evidence. Manipulative CTAs destroy it instantly.

---

## 6. CTA Suppression Rules

CTAs are suppressed (hidden) in these conditions:

| Condition | CTAs Suppressed |
|---|---|
| Visitor is on a Standard page | All commercial CTAs |
| Visitor has not reached T-2 (mechanism) | L-1, L-2 (consultation, quote) |
| Journey step < 4 | L-1, L-2 |
| Entity is deprecated | All commercial CTAs (show deprecation notice instead) |
| Mobile viewport, step in progress | Secondary CTAs (reduce cognitive load) |

---

## 7. CTA Sequencing Anti-Patterns

These patterns destroy conversion and must never appear:

**Anti-pattern 1: The Premature Ask**
Homepage hero with "Get a Quote" button.
Result: Visitor has no trust basis to submit a quote. Rejected.

**Anti-pattern 2: The Interruption Modal**
Pop-up email capture after 30 seconds on page.
Result: Interrupts engineering reading at peak engagement. Trust destroyed.

**Anti-pattern 3: The Unsupported Claim**
"Our technology achieves 99.9% efficiency" → "Buy Now"
Result: Claim without evidence + immediate ask = sales pressure. Rejected.

**Anti-pattern 4: The Repeated Ask**
Same CTA appearing 3+ times on a single page.
Result: Signals desperation. Reduces trust in engineering credibility.

**Anti-pattern 5: The Orphaned CTA**
CTA appearing without any visible connection to the engineering content just read.
Result: Feels random. Visitor cannot understand why this action is the next step.

Each CTA must answer: "Why is this the logical next step given what I just learned?"
If it cannot answer that question, it should not appear.
