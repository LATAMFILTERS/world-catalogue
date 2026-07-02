# Diagnostic Question Strategy
## Engineering Decision Engine — Minimum Effective Questioning
### Version 1.0 | Ratified: 2026-07-01 | Status: FROZEN

---

## Document Control

| Field | Value |
|---|---|
| Document | DIAGNOSTIC_QUESTION_STRATEGY |
| Version | 1.0 |
| Status | FROZEN — Governing Architecture |
| Ratified | 2026-07-01 |
| Authority | Subordinate to ENGINEERING_DECISION_ENGINE v1.0 |
| Scope | Selection rules for clarifying questions at Step 1, Step 3, and Step 6 (LOW decision) |

---

## The Questioning Standard

The Engineering Decision Engine produces questions at three points:
- **Step 1 (FAIL):** Customer intent cannot be determined
- **Step 3 (FAIL):** Evidence inventory is insufficient to proceed
- **Step 6 (LOW decision):** Insufficient evidence to recommend; questions gather evidence to continue

In every case, the questions produced must satisfy one rule:

> **Every question asked must change the recommendation if the answer is different.**

A question that would not change the evaluation outcome — regardless of how the customer answers — is not a diagnostic question. It is noise. The platform does not ask noise questions.

### The Question Economy Principle

The minimum number of questions is the right number of questions. Not the minimum because customers dislike questions, but because:

1. Excess questions signal that the platform does not know what evidence it needs
2. Each question that does not change the recommendation wastes the customer's time
3. Engineering credibility is built by asking the right question once, not by exhausting the customer's patience

**The platform never asks a question to which the answer would not change the recommendation.**

---

## Question Selection Rules

### Rule 1 — Identify the Missing Evidence Category

Before generating a question, the platform must identify which Step 3 evidence category is missing or PARTIAL. The question is designed to fill exactly that category. Questions are not generated from templates; they are derived from evidence gaps.

### Rule 2 — Map Evidence Category to Question Type

Each evidence category has a natural question type:

| Evidence Category | Question Type |
|---|---|
| 1 — Engineering Principles | Not a customer question. Principle gaps are Foundation gaps — they do not produce customer questions. |
| 2 — Technology Architecture | Not a customer question. Architecture gaps mean the platform cannot evaluate the domain. |
| 3 — Protection Media | Application specification question: "What filtration efficiency or particle rating is currently specified for this system?" |
| 4 — Applicable Standards | Cleanliness target question: "Is there a cleanliness code or standard requirement specified for this system?" |
| 5 — Failure Modes | Symptom or history question: "What specific symptoms are you observing, and when did they begin?" |
| 6 — Contamination Data | Contamination type question: varies by domain (see domain-specific questions below) |
| 7 — Engineering Memory | History question: "What is the service history of this equipment, and have similar symptoms appeared before?" |
| 8 — Operating Conditions | Environment and application question (see domain-specific questions below) |
| 9 — Equipment Mapping | Equipment specification question: "What is the make, model, and year of the equipment?" |
| 10 — Symptom Correlation | Symptom detail question: "Can you describe when the symptom occurs, under what operating conditions, and what changed before it appeared?" |

### Rule 3 — Prioritize by Evidence Weight

If multiple evidence categories are missing, questions are generated in order of evidence weight (PRIMARY before SECONDARY before TERTIARY). The highest-weight missing category is addressed first.

**Exception:** If Category 6 (Contamination Data) is missing in the fuel domain, it is prioritized above all others because contamination type determines the entire evaluation path.

**Exception:** If Category 8 (Operating Conditions) is missing in the cabin safety domain, it is prioritized above all others because operator safety requirements demand it.

### Rule 4 — One Question Per Evidence Category

Each evidence category produces at most one question. If a single question can address multiple categories simultaneously, that is preferred. Never generate more questions than there are missing evidence categories.

### Rule 5 — Sequence Questions

If more than one question must be asked, sequence them so that earlier answers inform later questions. If the answer to Question 1 makes Question 2 unnecessary, Question 2 is not asked in that session.

---

## Domain-Specific Question Banks

The following are the minimum effective questions for each domain. Questions are listed by the evidence category they address.

### Air Intake Domain

**Category 8 — Operating Conditions:**
- "What type of equipment is this, and what is the primary application? (mining, agriculture, construction, on-highway, etc.)"
- "What is the operating environment? (open pit, underground, crop harvest, quarry, highway, urban)"

**Category 6 — Contamination Data:**
- "What type of dust or particulate is present in the environment? (mineral/silica, agricultural, carbon/soot, mixed)"
- "Is the environment seasonal, or is dust exposure consistent throughout operation?"

**Category 9 — Equipment Mapping:**
- "What is the engine make and model? What air filtration housing is currently installed?"

**Category 10 — Symptom Correlation (FAILURE_DIAGNOSIS only):**
- "What symptoms are you observing? (power loss, increased fuel consumption, elevated oil consumption, premature filter blinding)"
- "How quickly is the filter reaching capacity, and has this changed from historical patterns?"

---

### Fuel Domain

**Category 6 — Contamination Data (PRIORITY):**
- "Is the primary concern water in the fuel, particulate contamination, or biological growth? If you're not sure, describe what you're observing."
- "Has the fuel been tested for water content (Karl Fischer or similar)? If so, what were the results?"

**Category 8 — Operating Conditions:**
- "What type of injection system is installed? (HPCR — common rail, unit injector, or older low-pressure mechanical injection)"
- "What is the fuel storage method? (above-ground tank, underground tank, portable IBC, direct delivery)"

**Category 9 — Equipment Mapping:**
- "What is the engine make, model, and year of manufacture?"
- "Is this a single machine or a fleet? If fleet, how many units and are conditions consistent across units?"

**Category 10 — Symptom Correlation (FAILURE_DIAGNOSIS only):**
- "What symptoms are you observing? (injector failure, hard starting, rough running, filter plugging, fuel system corrosion)"
- "When did symptoms first appear? Did anything change at that time — new fuel source, change in storage, seasonal shift, extended storage period?"

---

### Hydraulic Domain

**Category 6 — Contamination Data:**
- "What type of contamination concern are you addressing? (solid particles causing valve wear, water in the hydraulic fluid, or varnish/oil degradation)"

**Category 8 — Operating Conditions:**
- "What is the operating pressure of the hydraulic system? (low pressure < 100 bar, medium 100–250 bar, high > 250 bar)"
- "What type of hydraulic components are critical in this system? (proportional valves, servo valves, piston pumps, gear pumps)"
- "Is this a closed circuit or open circuit hydraulic system?"

**Category 9 — Equipment Mapping:**
- "What is the equipment type, make, and model? What hydraulic fluid specification is currently in use?"

**Category 4 — Applicable Standards:**
- "Is there a cleanliness target currently specified for this system? (ISO 4406 cleanliness code, or OEM specification)"

**Category 10 — Symptom Correlation (FAILURE_DIAGNOSIS only):**
- "What symptoms are you observing? (pressure loss, erratic valve behavior, pump noise, excessive component wear, fluid discoloration)"
- "Is the symptom consistent or intermittent? Does it change with temperature or load?"

---

### Lube Oil Domain

**Category 8 — Operating Conditions:**
- "What type of engine is this? (diesel, gas, two-stroke, four-stroke) What is the rated power output?"
- "What is the operating duty cycle? (continuous full load, variable load, idle-heavy, seasonal use)"

**Category 6 — Contamination Data:**
- "Is oil analysis currently being performed on this equipment? If so, what parameters are being measured and what are the recent results?"
- "What type of contamination is suspected? (wear metals — iron/chrome/copper, fuel dilution, coolant ingress, external dust, soot buildup)"

**Category 9 — Equipment Mapping:**
- "What is the engine make, model, year, and current accumulated hours?"
- "What is the current oil drain interval, and has it changed recently?"

**Category 10 — Symptom Correlation (FAILURE_DIAGNOSIS only):**
- "What symptoms are prompting this evaluation? (high oil consumption, low oil pressure, bearing noise, elevated operating temperature, unexpected filter condition at drain)"

---

### Cabin Air Domain

**Category 8 — Operating Conditions (PRIORITY — must be first question):**
- "What type of equipment does the operator work in, and what is the operating environment? (mining haul truck, agricultural harvester, construction equipment, industrial forklift, etc.)"
- "What is the primary airborne hazard in the operating environment? (mineral dust/silica, agricultural bioaerosols, chemical vapors, diesel exhaust, or a combination)"

**Category 6 — Contamination Data:**
- "Are there specific chemical hazards present? (pesticides, fertilizers, fuel vapors, rubber dust, other industrial chemicals)"
- "What is the approximate shift duration for operators in this environment?"

**Category 4 — Applicable Standards:**
- "Are there local occupational health regulations or OEM specifications that govern cabin air quality for this application? If so, which standards are referenced?"

---

### Compressed Air Domain

**Category 8 — Operating Conditions (PRIORITY):**
- "What is the end use of the compressed air? (pneumatic tools, product contact in food/pharma, instrument air for controls, breathing air, general workshop)"

**Category 6 — Contamination Data (PRIORITY):**
- "What contamination concerns are you addressing? (moisture/water, oil carryover from compressor, solid particles, or all three)"
- "Is the compressor oil-injected or oil-free?"

**Category 4 — Applicable Standards:**
- "Is there an ISO 8573-1 purity class specified for this application? If not, is there an OEM specification or regulatory requirement?"

**Category 8 — Operating Conditions (secondary):**
- "What is the operating pressure of the compressed air system?"
- "What is the ambient temperature range at the installation point? (relevant for pressure dew point calculation)"

---

## Step 1 Question Selection (Intent Clarification)

When Step 1 fails (customer intent is ambiguous), the question must resolve the ambiguity with a single question where possible.

### Single-Question Resolution Patterns

**Ambiguity: Cannot determine whether FAILURE_DIAGNOSIS or PROACTIVE_PROTECTION**
- Ask: "Are you responding to an active problem with the equipment, or are you looking to optimize the filtration system to prevent future problems?"
- Answer drives the intent class determination completely.

**Ambiguity: Cannot determine contamination domain**
- Ask: "Which of these best describes your concern? (a) air intake / engine performance, (b) fuel quality or fuel system, (c) hydraulic system reliability, (d) engine oil or bearing protection, (e) cabin air quality for operators, (f) compressed air system purity"
- Answer maps directly to domain.

**Ambiguity: Cannot determine equipment type**
- Ask: "What type of equipment or system are you working with, and what does it do in operation?"
- A single open-ended response typically resolves equipment type and application simultaneously.

**Ambiguity: Too general ("help with filtration")**
- Ask: "What is the specific problem or goal you're trying to address? The more specific you can be about the equipment, the symptom, or the outcome you want, the more useful the response will be."
- This is the only question that does not map to a specific evidence category. It is permitted only when no other question strategy can reduce the ambiguity.

---

## What the Strategy Never Produces

- Questions about products the platform might recommend (the customer is not evaluating products at this stage)
- Questions about budget or commercial preferences (commercial factors do not influence engineering recommendations)
- Questions the platform can answer from context already available
- Questions that would produce the same recommendation regardless of the answer
- More questions than there are missing evidence categories
- Questions about information that does not exist in the Engineering Foundation in governed form

---

## Citation Reference

```
CANONICAL GOVERNANCE BLOCK: Diagnostic Question Strategy

DOCUMENT
Diagnostic Question Strategy v1.0

PURPOSE
Defines the selection rules for producing the minimum set of questions
required to reduce evidence uncertainty in the Engineering Decision Engine
at Steps 1, 3, and 6.

CORE RULE
Every question asked must change the recommendation if the answer is different.
Questions that would not change the recommendation are not asked.

QUESTION ECONOMY
Minimum questions = right questions.
Each question addresses exactly one missing evidence category.
Earlier answers inform whether later questions are still needed.

CITATION_REFERENCE
source: elimfilters-vault/decision-engine/DIAGNOSTIC_QUESTION_STRATEGY.md
document: Diagnostic Question Strategy
version: 1.0
ratified: 2026-07-01
status: FROZEN
```
