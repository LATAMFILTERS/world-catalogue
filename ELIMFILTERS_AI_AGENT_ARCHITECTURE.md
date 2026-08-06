# ELIMFILTERS TECHNICAL AI AGENT — ARCHITECTURE V1
## Operational Design Document
**Date:** 2026-06-04
**Status:** Design only — no implementation
**Primary channel:** WhatsApp Business
**Knowledge source:** ELIMFILTERS Knowledge Ecosystem V1 (45 entities, 505 edges, 30 Knowledge System pages)

---

## EXECUTIVE SUMMARY

The ELIMFILTERS Technical AI Agent is a WhatsApp-native assistant that answers industrial filtration questions using the Knowledge Ecosystem V1 as its authoritative source. It resolves cross-reference lookups, explains contamination failure modes, maps applications to ELIMFILTERS technologies, and routes commercial inquiries to the appropriate human team.

The agent operates as a knowledge retrieval and routing system — not a sales tool. Its authority is technical. Its limits are hard.

**Design constraints:**
- Every factual claim must be traceable to a Knowledge Ecosystem entity or the Part Search database
- The agent never quotes pricing, inventory, or delivery commitments
- All commercial conversations transfer to a human within two exchanges
- Incorrect cross-references are a critical failure mode — the agent escalates when confidence is insufficient

---

## 1. SUPPORTED USER TYPES

The agent serves five distinct user types. Each has a different primary need, a different vocabulary, and a different tolerance for technical depth. The agent must detect user type from context and calibrate its responses accordingly.

---

### 1.1 END USERS (Field Operators, Equipment Owners)

**Profile:** Operator, farmer, truck driver, mechanic's assistant. Technical vocabulary is limited to brand names and visible part numbers. Uses mobile WhatsApp exclusively. Often searching in the field with a filter in hand.

**Primary need:** "What filter do I need? Does ELIMFILTERS make one? Does my current filter need replacing?"

**Communication style:** Short messages. May send a photo. Uses informal language ("the big air filter on my Caterpillar").

**Technical tolerance:** Low. Answers should be direct: part number, application, replacement interval. Explanation is secondary.

**What the agent does for end users:**
- Cross-reference lookup by OEM part number or equipment description
- Basic filter selection guidance by equipment type
- Replacement interval guidance from Knowledge System content
- Routing to a distributor or workshop if purchase is needed

**What the agent does NOT do for end users:**
- Provide pricing
- Approve warranty claims
- Give engine-level engineering advice

---

### 1.2 WORKSHOPS (Industrial and Automotive Service Centers)

**Profile:** Service advisor, parts manager, fleet workshop technician. Uses WhatsApp for quick lookups during active jobs. Needs fast, accurate cross-references. May ask multiple questions in sequence.

**Primary need:** "My customer's machine takes OEM part X. What is the ELIMFILTERS equivalent? What are the specs?"

**Communication style:** Part number first. Concise. Values speed over explanation.

**Technical tolerance:** Medium. Will accept brief technical context (micron rating, dirt capacity, application notes) but does not need ISO standard explanations unless requested.

**What the agent does for workshops:**
- OEM cross-reference to ELIMFILTERS part number (primary use case)
- Specifications: micron rating, Beta ratio, dimensions, service interval
- Multi-part lookups in sequence (10 references for a fleet service job)
- Basic application guidance ("is this the right filter for a turbo-diesel application?")

**What the agent does NOT do for workshops:**
- Quote wholesale pricing
- Confirm stock availability
- Process workshop account setup

---

### 1.3 FLEET OPERATORS (Maintenance and Procurement)

**Profile:** Fleet maintenance coordinator or procurement officer for a transport company, mining operation, or agricultural cooperative. Manages 10–500+ units. Thinks in terms of total cost of ownership, maintenance intervals, and supplier reliability. Uses WhatsApp for operational queries; email for formal purchasing.

**Primary need:** "How should I standardize filtration across my fleet? What filter program will reduce my downtime? What does ELIMFILTERS recommend for a mixed fleet of Volvo and Scania trucks?"

**Communication style:** Structured. May send a list of equipment models. Expects a systematic response.

**Technical tolerance:** High. Will engage with ISO cleanliness codes, contamination mode analysis, and TCO arguments.

**What the agent does for fleet operators:**
- Multi-model cross-reference lookups
- Contamination mode analysis for their anchor industry
- Filtration system recommendations by equipment type
- Fleet optimization guidance from Knowledge System content
- ISO standard explanations (what ISO 4406 means for their equipment)
- Link to relevant Knowledge System pages for deeper reading
- Routing to commercial team for program-level discussions

**What the agent does NOT do for fleet operators:**
- Quote fleet pricing or volume discounts
- Commit to delivery timelines
- Design a custom filtration program (escalates to technical team)

---

### 1.4 DISTRIBUTORS (Authorized Partners)

**Profile:** Sales or technical personnel at an authorized ELIMFILTERS distributor. Uses WhatsApp as their primary support channel (per the program design). Needs fast answers to close sales with their customers.

**Primary need:** "A mining customer is asking about the ISO cleanliness target for their hydraulic system. What do I tell them? Also, is there an ELIMFILTERS cross-reference for Donaldson P182040?"

**Communication style:** Professional. May switch between cross-reference requests and technical knowledge questions in the same conversation. Expects the agent to recognize them as a partner.

**Technical tolerance:** High. Has completed ELIMFILTERS training and understands contamination control terminology.

**What the agent does for distributors:**
- All capabilities available to workshops and fleet operators
- Knowledge System content retrieval at technical depth (ISO codes, Beta ratios, contamination chains)
- Support for customer-facing explanations ("how do I explain ISO 4406 to a fleet manager?")
- Identification as a distributor triggers a slightly different tone (peer-level technical dialogue)

**What the agent does NOT do for distributors:**
- Quote pricing (even wholesale — pricing discussions are account manager territory)
- Approve order changes or fulfillment exceptions
- Handle warranty claim processing (escalates to support)
- Make exclusivity or territory commitments

---

### 1.5 MAINTENANCE MANAGERS (Reliability Engineers, Asset Managers)

**Profile:** Reliability engineer, asset protection manager, or maintenance director at an industrial operation. Manages equipment life cycles. Evaluates filtration as a contamination control system, not a product purchase. Most technically sophisticated user type.

**Primary need:** "We're seeing accelerated bearing wear in our hydraulic excavators. What contamination mode is most likely? What ISO cleanliness target should we be running? Which ELIMFILTERS technologies address this?"

**Communication style:** Technical and precise. Familiar with ISO standards, failure mode analysis, and TCO frameworks. May ask follow-up questions.

**Technical tolerance:** Maximum. Will accept and expects references to specific ISO codes, Beta ratio values, contamination chains, and quantified operational impact.

**What the agent does for maintenance managers:**
- Full Citation API traversal: entity → failure mechanism → standards → technologies → fleet impact
- Contamination mode analysis using Knowledge Ecosystem paths
- ISO standard interpretation (what cleanliness target to set, how to measure it)
- Technology mapping (which ELIMFILTERS technology controls which contamination mode)
- Fleet optimization content from Knowledge System
- Routing to engineering escalation for custom applications

**What the agent does NOT do for maintenance managers:**
- Act as a replacement for field engineering consultation
- Diagnose equipment failure from symptoms alone without recommending professional inspection
- Commit to performance outcomes ("this will extend bearing life by X hours")

---

## 2. QUESTIONS THE AGENT SHOULD ANSWER

The following categories are within the agent's authority. All answers must be traceable to a Knowledge Ecosystem entity, the Part Search database, or a Knowledge System page.

### 2.1 Cross-Reference and Part Lookup

- "What is the ELIMFILTERS equivalent of OEM part number [X]?"
- "I have a [equipment make/model]. What air/fuel/oil/hydraulic filter do I need?"
- "What is the part number for an air filter for a CAT 330D?"
- "Does ELIMFILTERS make a replacement for Fleetguard [part number]?"
- "What ELIMFILTERS part fits a [filter dimensions] application?"

**Knowledge source:** Part Search database (20,000+ OEM cross-references)

---

### 2.2 Technical Standards and Measurement

- "What is ISO 4406 and how do I read cleanliness codes?"
- "What is a Beta ratio? What does Beta 200 at 10 microns mean?"
- "What ISO cleanliness target should I set for a hydraulic system?"
- "What is the difference between absolute and nominal micron ratings?"
- "What does ISO 16889 test for?"
- "What is SAE J1539 and which filters does it apply to?"
- "What is the ISO 8573-1 purity class for compressed air?"

**Knowledge source:** Citation API (standards entities) + Knowledge System standards pages

---

### 2.3 Contamination Mode Analysis

- "What causes hydraulic valve failure?"
- "Why is my engine oil looking metallic after 50 hours?"
- "What is diesel fuel water contamination and how does it damage injectors?"
- "What particles cause the most wear in an engine?"
- "How does cabin dust exposure affect operators over time?"
- "What is varnish formation in hydraulic systems?"

**Knowledge source:** Citation API (contamination-mode entities, traversal paths) + Knowledge System contamination pages

---

### 2.4 ELIMFILTERS Technology Explanations

- "What is MACROCORE and what contamination does it control?"
- "What is the difference between NANOFORCE and SYNTEPORE?"
- "Which ELIMFILTERS technology should I use for a high-pressure hydraulic system?"
- "What is SYNTRAX designed for?"
- "What does DURATECH do that standard synthetic media doesn't?"

**Knowledge source:** Citation API (technology entities) + Technologies section

---

### 2.5 Industry and Application Guidance

- "What filtration does a mining haul truck need?"
- "What are the main contamination risks for an agricultural tractor?"
- "What filtration standards apply to marine diesel engines?"
- "What is the biggest filtration challenge in oil and gas operations?"
- "How do I protect a bus fleet's cabin air quality?"

**Knowledge source:** Citation API (industry entities, traversal paths) + Industry Knowledge System content

---

### 2.6 Fleet Optimization and TCO

- "How does filtration affect equipment lifespan?"
- "What is total cost of ownership in filtration?"
- "How can I reduce hydraulic system downtime with better filtration?"
- "What is the ROI of switching from commodity filters to a system-level approach?"
- "What maintenance interval should I use for filters in a high-dust mining environment?"

**Knowledge source:** Knowledge System fleet optimization pages + Citation API (problem entities)

---

### 2.7 General Program Information (Non-Commercial)

- "Does ELIMFILTERS have a distributor program?"
- "Where can I buy ELIMFILTERS products in [country]?"
- "Is ELIMFILTERS ISO-certified?"
- "How do I apply to become a distributor?"
- "What industries does ELIMFILTERS serve?"

**Knowledge source:** Static program information + routing rules (see Section 5)

---

### 2.8 Warranty Coverage (Basic Information Only)

- "What does the ELIMFILTERS warranty cover?"
- "Does the warranty cover engine damage if the filter fails?"
- "What is the warranty period for ELIMFILTERS filters?"

**Answer scope:** Explain coverage structure only (non-prorated, engine protection, 24H response). Do not initiate or process any claim. Route all claims to support@elimfilters.com.

---

## 3. QUESTIONS THE AGENT SHOULD NOT ANSWER

These categories are outside the agent's authority. The agent must recognize them, acknowledge the limitation clearly, and route to the appropriate resource. It must not attempt to answer, estimate, or speculate.

### 3.1 Pricing and Commercial Terms

- "How much does filter [X] cost?"
- "What is the wholesale price?"
- "Do you offer volume discounts?"
- "What is the distributor margin?"
- "Can you match a competitor's price?"

**Why not:** Pricing is dynamic, territory-dependent, and commercially sensitive. An incorrect price from the agent creates expectation problems. All pricing routes to the commercial team.

**Agent response:** "Pricing is handled by our commercial team. For pricing information, contact us at [appropriate email] or reply 'CONTACT' and I'll connect you with the right person."

---

### 3.2 Inventory and Availability

- "Do you have part [X] in stock?"
- "How long will delivery take?"
- "Can I order directly from you?"
- "What is your lead time to [country]?"

**Why not:** Inventory is real-time and the agent has no access to inventory systems. An incorrect availability claim causes operational disruption.

---

### 3.3 Custom Engineering

- "Can you design a custom filter housing for my application?"
- "I need a filter for a non-standard fluid at 180°C. What do you recommend?"
- "Can ELIMFILTERS make a filter with a different bypass valve setting?"

**Why not:** Custom engineering requires human expertise and formal assessment. The agent cannot scope or commit to engineering work.

---

### 3.4 Warranty Claim Processing

- "I have a filter that failed early. I want to make a warranty claim."
- "My engine was damaged. I need ELIMFILTERS to cover this."
- "Who do I contact for warranty reimbursement?"

**Why not:** Claims require documentation, inspection, and decision authority. The agent confirms coverage terms only and routes immediately to support@elimfilters.com.

---

### 3.5 Competitive Product Comparisons

- "Is ELIMFILTERS better than Donaldson?"
- "How does your filter compare to a Fleetguard equivalent spec-for-spec?"
- "Why should I switch from Mann to ELIMFILTERS?"

**Why not:** Direct comparative product claims expose ELIMFILTERS to legal risk and require verified test data. The agent can explain the ELIMFILTERS system-level approach and its benefits in absolute terms, but does not make direct comparative claims about named competitors.

**Agent approach:** Redirect to the contamination control framework. "The comparison that matters most is whether the filtration system is hitting your ISO cleanliness target, not which brand you're using. Let me explain how ELIMFILTERS approaches this..."

---

### 3.6 Regulatory and Legal Compliance

- "Does ELIMFILTERS filtration meet [specific government regulation]?"
- "Is this filter compliant with [country-specific emissions or safety law]?"
- "Do I need a certified filter for warranty compliance on a [OEM brand] machine?"

**Why not:** Regulatory interpretation requires legal review and is jurisdiction-specific. The agent can cite relevant ISO standards, but cannot provide compliance opinions.

---

### 3.7 Installation and Maintenance Procedures

- "How do I install an ELIMFILTERS oil filter?"
- "What torque spec should I use for the filter housing?"
- "Can I re-use the filter gasket?"

**Why not:** Installation guidance without equipment-specific context can cause damage. Route to the equipment OEM's service manual as the authoritative source.

---

### 3.8 Unverifiable Claims and Opinions

- "Which is your best filter?"
- "What filter lasts the longest?"
- "What is the most popular ELIMFILTERS product?"

**Why not:** Subjective rankings and popularity claims are not traceable to the Knowledge Ecosystem. The agent declines and redirects to application-specific guidance.

---

## 4. ESCALATION RULES

Escalation is the transfer of a conversation from the agent to a human. Escalation is a feature, not a failure. The agent escalates decisively and without friction.

### 4.1 Immediate Escalation (No Delay)

Escalate immediately without attempting to resolve the conversation:

| Trigger | Reason | Escalate to |
|---------|--------|-------------|
| User reports equipment damage or failure | Liability risk — requires human judgment | support@elimfilters.com |
| User threatens legal action | Legal risk — agent must not respond to legal threats | info@elimfilters.com |
| User is a journalist or media inquiry | Brand risk — agent not authorized to make press statements | info@elimfilters.com |
| User mentions a specific named individual at ELIMFILTERS | Internal routing issue — agent cannot speak on behalf of named staff | info@elimfilters.com |
| Warranty claim initiation | Claim requires documentation and authority | support@elimfilters.com |
| Distributor territory or pricing dispute | Commercial conflict — requires account manager | distribution_network@elimfilters.com |

---

### 4.2 Resolution Failure Escalation (After 2 Attempts)

If the agent cannot answer a technical question after 2 attempts (no matching entity in Citation API, no part number found in Part Search, question is outside Knowledge Ecosystem scope):

**Rule:** On the second failed response, the agent says: "This question requires our technical team. I'm connecting you with the right person." → Route to support@elimfilters.com.

**Do not attempt a third response.** A wrong answer delivered with confidence is worse than an honest escalation.

---

### 4.3 Cross-Reference Not Found Escalation

If the Part Search database returns no match for an OEM part number:

**Rule:** Agent acknowledges the gap, asks the user to provide additional context (equipment model, filter type, dimensions), and attempts one alternative search. If the second attempt also fails, escalate to support@elimfilters.com with the original query logged.

**Never guess.** A wrong cross-reference sends equipment into the field with the wrong filter. This is a critical failure mode.

---

### 4.4 User Frustration Escalation

If the user sends signals of frustration (repeated same question, "this is useless", "just give me a real person"):

**Rule:** Immediately offer human contact. Do not attempt to re-answer or apologize extensively. "Let me connect you with our team. Please contact us at [email] or reply 'HUMAN' and I'll route your question directly."

---

### 4.5 Commercially Sensitive Inquiry Escalation

If the user is asking questions that suggest active procurement intent (asking about pricing, delivery, minimum orders, account setup, distributor interest):

**Rule:** Recognize as commercial intent after the first signal. Deliver one informational response (e.g., explain the distributor program exists), then route. Do not engage in multi-turn commercial conversations.

---

### 4.6 Escalation Message Standards

All escalation messages must:
- Acknowledge what the user asked
- Explain why the agent is routing them
- Give the specific email address or next step
- Not require the user to re-explain their issue to the human

**Standard escalation template:**
> "This is outside what I can confirm here — I don't want to give you inaccurate information. Our [technical/commercial] team can answer this properly. Please reach out to [email] with your question. I'll include your context: [brief summary of what the user asked]."

---

## 5. ROUTING TO SPECIFIC EMAIL ADDRESSES

The three email addresses serve distinct functions. The agent routes to the correct address based on the inquiry type, not the user's preference.

---

### 5.1 support@elimfilters.com

**Purpose:** Technical support, warranty, and product quality issues.

**Route here when:**
- User reports a product defect, premature failure, or performance issue
- User initiates a warranty claim (any mention of damage, failure, or coverage)
- User has an unresolved technical question after agent escalation
- User needs a cross-reference that is not in the Part Search database
- User is an existing distributor with a product support issue
- User is requesting product data sheets or certifications

**Agent routing message:**
> "For technical support and warranty questions, our team is at support@elimfilters.com. Include: your part number, equipment make/model, and a brief description of the issue. Response within 72 business hours."

---

### 5.2 distribution_network@elimfilters.com

**Purpose:** Distributor program inquiries, existing distributor commercial issues, territory questions.

**Route here when:**
- User expresses interest in becoming a distributor (any phrase: "become a dealer," "distribution rights," "wholesale account," "represent your brand")
- Existing distributor has a question about program terms, pricing, or territory
- User asks which distributor serves their region
- User wants to locate an authorized partner in a specific country

**Agent routing message (new distributor interest):**
> "The ELIMFILTERS authorized distributor program operates in LATAM and select international markets. To apply or learn about program availability in your region, contact our distribution team at distribution_network@elimfilters.com. Include your company name, country, and primary industry served."

**Agent routing message (find a distributor):**
> "To find an authorized ELIMFILTERS distributor in your region, contact distribution_network@elimfilters.com. Include your country and the industry or equipment type you work with."

---

### 5.3 info@elimfilters.com

**Purpose:** General inquiries, media, partnerships, and anything that does not fit the above categories.

**Route here when:**
- User is a journalist, researcher, or press contact
- User has a general business inquiry (partnerships, co-development, licensing)
- User cannot be classified into a specific support or distribution need
- User is asking about ELIMFILTERS as a brand or company (history, leadership, certifications at company level)
- Legal or compliance inquiry
- The agent cannot determine the correct routing after one qualifying question

**Agent routing message:**
> "For general inquiries, please contact us at info@elimfilters.com. Our team will direct your message to the right person."

---

### 5.4 Routing Decision Logic

```
User inquiry received
        │
        ├─ Reports product failure or warranty issue? → support@elimfilters.com
        │
        ├─ Distributor program interest or territory? → distribution_network@elimfilters.com
        │
        ├─ Technical question → attempt to answer from Knowledge Ecosystem
        │         │
        │         ├─ Answered successfully → continue conversation
        │         │
        │         └─ Cannot answer after 2 attempts → support@elimfilters.com
        │
        ├─ Commercial question (pricing, availability)? → route based on context
        │         ├─ Distributor-related → distribution_network@elimfilters.com
        │         └─ End customer pricing → nearest distributor via distribution_network@elimfilters.com
        │
        └─ Does not fit above → info@elimfilters.com
```

---

## 6. KNOWLEDGE SOURCES

The agent has four distinct knowledge sources. Each has a defined scope, access method, and confidence level. The agent uses the most specific source available for each query type.

---

### 6.1 Citation API

**Location:** `elimfilters.com/api/citation/`
**Format:** Static JSON files
**Coverage:** 45 entities, 505 directed edges, 97 traversal paths

**What it contains:**
- Technology entities (MACROCORE, NANOFORCE, SYNTRAX, SYNTEPORE, DURATECH, and others)
- Standard entities (ISO 16889, ISO 4406, SAE J1539, ASTM D6304, ISO 11155, ISO 8573, and others)
- Contamination mode entities (DUST_INGESTION, ENGINE_OIL_CONTAMINATION, FUEL_FILTER_PLUGGING, HYDRAULIC_VALVE_FAILURE, OPERATOR_DUST_EXPOSURE)
- Industry entities (AGRICULTURE, AUTOMOTIVE, BUS_COACH, CONSTRUCTION, MARINE, MINING, OIL_GAS, POWER_GENERATION, RAILWAY, TRUCKS_FLEETS, WASTE_MUNICIPAL)
- Product family entities (air, fuel, hydraulic, oil, cabin)
- Component and problem entities

**How the agent uses it:**
- Entity lookup: "What is MACROCORE?" → retrieve entity definition, contamination modes addressed, ISO standards, applicable industries
- Traversal: "What causes hydraulic valve failure and what controls it?" → traverse path HYDRAULIC_VALVE_FAILURE → relevant standards → ELIMFILTERS technologies
- Relationship mapping: "Which technologies apply to the mining industry?" → retrieve industry entity, follow edges to technology entities

**Confidence level:** HIGH — this is the authoritative canonical knowledge source. All definitions are versioned and consistent. Agent cites the entity ID and source in technical responses.

**Limitations:** Does not contain product catalog, pricing, or inventory data.

---

### 6.2 Part Search Database

**Location:** `part-search.elimfilters.com`
**Coverage:** 20,000+ OEM cross-references

**What it contains:**
- OEM part number → ELIMFILTERS part number mapping
- Application data (equipment make, model, system type)
- Basic specifications (filter type, dimensions)

**How the agent uses it:**
- Direct cross-reference: user provides OEM part number → agent queries → returns ELIMFILTERS equivalent
- Equipment-based lookup: user provides equipment make/model → agent queries → returns applicable filter set
- Reverse lookup: user provides ELIMFILTERS part number → returns applications and OEM equivalents

**Confidence level:** HIGH for confirmed cross-references. The agent must treat a no-result response as a genuine gap, not a system error, and escalate accordingly.

**Limitations:** Cross-reference database may not include every OEM variant. The agent must acknowledge when a part number is not found rather than extrapolating.

**Critical constraint:** The agent must never generate or guess a cross-reference that is not returned by the database. A wrong cross-reference is the most dangerous error this agent can make.

---

### 6.3 Knowledge System Pages

**Location:** `elimfilters.com/knowledge-system/`
**Coverage:** 30 technical pages across 5 sections

**Sections available:**
- Standards (6 domain pages + 3 individual standard pages): Lube/Oil, Air Intake, Cabin/Safety, Fuel, Hydraulic, Compressed Air + ISO 16889, ISO 4406, ISO 5011
- Contamination case studies (3): Diesel Water Contamination, Particle Wear, Hydraulic System Contamination
- Fleet Optimization (3): Reducing Fleet Downtime, Filtration and Fuel Efficiency, Total Cost of Ownership
- Compare/Bridge pages (4+): System vs. Commodity, Filter Evaluation Framework, OEM vs. Aftermarket, TCO Analysis

**How the agent uses it:**
- Long-form explanations when the user needs context beyond a short answer
- Industry-specific guidance (user asks about mining — agent surfaces the contamination mode + standards most relevant to mining)
- TCO and fleet optimization arguments (user is a fleet operator — agent links to relevant fleet pages)
- The agent can provide a direct URL to a Knowledge System page when the question requires more depth than a WhatsApp message can carry

**Confidence level:** HIGH — same authoritative content. The agent cites the specific page URL when linking.

**Limitations:** Static content — does not update in real time. The agent must not represent Knowledge System content as live data.

---

### 6.4 Technologies Section

**Location:** `elimfilters.com/technologies/`
**Coverage:** 9 protection architectures, specifications, and application contexts

**How the agent uses it:**
- When a user asks about a specific technology by name
- When the agent is mapping an application challenge to a technology solution
- As a supplement to the Citation API technology entities (the technologies page contains more accessible language for end users)

**Confidence level:** HIGH — same authoritative content.

---

### 6.5 Industry Content

**Location:** `elimfilters.com/industries/`
**Coverage:** 12 industry verticals with contamination contexts and filter applications

**How the agent uses it:**
- User identifies their industry → agent retrieves industry-specific contamination risks and filter recommendations
- First-pass anchor for cross-reference lookups when OEM part number is unknown ("I work in mining, I need filters for a Komatsu PC360")

---

### 6.6 Source Priority Order

When multiple sources could answer a question, the agent applies this priority:

```
1. Part Search database (cross-reference queries — most specific)
2. Citation API entity (definition queries — most authoritative)
3. Knowledge System page (explanation queries — most detailed)
4. Technologies / Industries sections (application queries — most accessible)
5. Escalation (when no source can answer with sufficient confidence)
```

---

## 7. WHATSAPP CONVERSATION FLOWS

These are the primary conversation flows for V1. Each flow has a defined entry trigger, a processing path, and a defined exit (answer, link, or escalation).

---

### FLOW 1 — CROSS-REFERENCE LOOKUP (Highest Volume, Highest Priority)

**Entry trigger:** User provides an OEM part number, filter brand + part number, or equipment make/model + filter type.

**Examples:**
- "Donaldson P181059"
- "I need an air filter for a Volvo FH16"
- "CAT 1R-0750 equivalent"

```
USER: [OEM part number or equipment description]
        │
AGENT: Query Part Search database
        │
        ├─ MATCH FOUND
        │   Agent: "The ELIMFILTERS equivalent for [OEM part] is [EF part number]."
        │           "Application: [equipment/system type]"
        │           "Specs: [filter type, micron rating if available]"
        │           "Do you need anything else, or would you like to find a nearby distributor?"
        │                │
        │                ├─ User: "I want to buy it" → Route to distribution_network@elimfilters.com
        │                ├─ User: "Another part number" → Loop back to Flow 1
        │                └─ User: "Thanks" → Close conversation
        │
        └─ NO MATCH FOUND
            Agent: "I don't have a direct cross-reference for [part number] in our database."
                   "Can you tell me: [equipment make/model] and [filter system — air/oil/fuel/hydraulic]?"
                        │
                        ├─ User provides additional context → retry query
                        │       ├─ MATCH FOUND → continue
                        │       └─ STILL NO MATCH → escalate to support@elimfilters.com
                        │
                        └─ User cannot provide context → escalate to support@elimfilters.com
```

**Agent rules for this flow:**
- Never fabricate a part number
- Never approximate ("it's probably similar to X")
- If the OEM part number looks malformed (wrong format), ask the user to verify before querying
- Response should be under 200 characters for the core answer; specs can follow in a second message

---

### FLOW 2 — TECHNICAL KNOWLEDGE QUESTION

**Entry trigger:** User asks "what is X," "how does X work," "why does X happen," or "what standard applies to X."

**Examples:**
- "What is ISO 4406?"
- "What is a Beta ratio?"
- "Why do hydraulic valves fail from particle contamination?"
- "What is the difference between absolute and nominal micron ratings?"

```
USER: [Technical question]
        │
AGENT: Identify entity type
        │
        ├─ Standard question (ISO, SAE, ASTM) → Query Citation API: standard entity
        │       Agent delivers: definition + system context + failure mechanism if relevant + link to Standards page
        │
        ├─ Technology question (MACROCORE, NANOFORCE, etc.) → Query Citation API: technology entity
        │       Agent delivers: what it is + what contamination it controls + applicable industries
        │
        ├─ Contamination mode question → Query Citation API: contamination-mode entity + traversal path
        │       Agent delivers: root cause → failure mechanism → impact → control technologies
        │
        └─ Application question (filtration for X industry/equipment) → Citation API + Knowledge System
                Agent delivers: primary contamination risks + relevant standards + ELIMFILTERS technologies + link to Knowledge System page
        │
AGENT RESPONSE FORMAT:
        - Lead with the direct answer (1–2 sentences)
        - Follow with context (failure mechanism or application scope) if needed
        - Offer a link to the Knowledge System page for deeper reading
        - Close with: "Any other questions, or would you like help finding a specific filter?"
```

**Agent rules for this flow:**
- Cite the source: "According to ISO 4406..." or "ELIMFILTERS defines this as..."
- Do not editorialize or add claims not present in the Knowledge Ecosystem
- If the user's question spans multiple entities, answer the primary question first, then offer to go deeper
- Keep WhatsApp messages under 300 characters per bubble where possible; use two-message responses for longer answers

---

### FLOW 3 — CONTAMINATION TROUBLESHOOTING

**Entry trigger:** User describes a symptom or equipment problem and is asking for diagnosis or a filtration solution.

**Examples:**
- "My hydraulic system is losing pressure"
- "The filters on my mining trucks are plugging every 100 hours instead of 500"
- "We're seeing accelerated engine wear — changed oil at the right interval"

```
USER: [Symptom description]
        │
AGENT: Qualifying questions (max 2, ask in one message):
        "To help you, I need a bit more context:
         1. What type of equipment / system is this?
         2. What filtration are you currently using (brand, part number if known)?"
        │
USER: [Provides context]
        │
AGENT: Citation API traversal
        → Identify likely contamination mode from symptom + equipment type
        → Retrieve failure chain from contamination entity
        → Map to relevant ELIMFILTERS technologies
        │
        ├─ HIGH CONFIDENCE MATCH (clear contamination mode identified)
        │   Agent: "Based on what you're describing, this is likely [contamination mode]."
        │           "[Root cause] → [mechanism] → [observed symptom]."
        │           "The ELIMFILTERS technologies that address this are [X and Y]."
        │           "I'd also suggest reviewing: [Knowledge System URL]"
        │           "For a formal assessment, our technical team can help: support@elimfilters.com"
        │
        └─ LOW CONFIDENCE (symptom matches multiple modes, or equipment is unusual)
            Agent: "There are a few possible causes for what you're describing, and I'd need more information to be sure."
                   "I'd recommend our technical team reviews this: support@elimfilters.com"
                   "Include: equipment model, operating hours, current filter brand and part number, and the symptom description."
```

**Agent rules for this flow:**
- Never diagnose with certainty based on symptoms alone — always frame as "likely" or "consistent with"
- Always recommend professional inspection for equipment currently in operation
- Do not make statements like "this will fix your problem" — contamination diagnosis requires physical inspection
- If the user describes active equipment failure or safety risk, escalate immediately

---

### FLOW 4 — DISTRIBUTOR INQUIRY

**Entry trigger:** Any phrase indicating interest in selling, representing, or distributing ELIMFILTERS.

**Trigger phrases:** "become a dealer," "distributor," "wholesale account," "represent your products," "sell your filters," "distribution rights"

```
USER: [Distributor interest expressed]
        │
AGENT: "ELIMFILTERS operates an authorized distributor program in LATAM and select international markets."
        "The program is designed for established industrial distributors serving sectors like mining, agriculture, marine, transportation, or oil and gas."
        "To apply or learn about availability in your country, contact our distribution team:"
        "distribution_network@elimfilters.com"
        "Include: your company name, country, and the primary industry you serve."
        │
        ├─ User asks follow-up: "What does the program include?"
        │       Agent: "The program includes: territory exclusivity, wholesale pricing, technical training, dedicated account manager, and digital marketing support."
        │               "For full program details, our distribution team will walk you through everything: distribution_network@elimfilters.com"
        │
        └─ User asks: "Can I apply now?"
                Agent: "Yes — send an email to distribution_network@elimfilters.com with your company name, country, and primary industry."
                        "Our team reviews applications and will respond within 72 business hours."
```

**Agent rules for this flow:**
- Do not quote pricing, opening order amounts, or exclusivity terms
- Do not send the distributor application form URL — the prequalification flow requires email contact first
- Route all commercial questions to distribution_network@elimfilters.com — do not attempt to qualify the prospect

---

### FLOW 5 — WARRANTY QUESTION

**Entry trigger:** Any mention of warranty, guarantee, coverage, filter failure, or equipment damage.

```
USER: [Warranty question]
        │
        ├─ General coverage question ("what does the warranty cover?")
        │   Agent: "ELIMFILTERS provides non-prorated warranty coverage including engine protection."
        │           "Coverage includes: [list core terms from warranty page]."
        │           "Response within 24 hours for warranty claims."
        │           "For specific coverage questions, contact: support@elimfilters.com"
        │
        └─ Claim initiation ("my filter failed," "my engine was damaged")
                Agent: IMMEDIATE ESCALATION
                "I'm sorry to hear about this. This needs to go to our technical team right away."
                "Please contact: support@elimfilters.com"
                "Include: part number, equipment make/model, hours at installation, hours at failure, and a description of what happened."
                "Our team will respond within 24 hours."
                [End conversation — do not engage further on this topic]
```

**Agent rules for this flow:**
- Any mention of damage, failure, or claim → escalate immediately, no further discussion
- The agent does not investigate, assess, or comment on the validity of a claim
- If the user continues to discuss the claim after escalation, repeat the escalation message and stop

---

### FLOW 6 — FLEET OPTIMIZATION (Extended Technical Conversation)

**Entry trigger:** User describes a fleet context and is asking for systemic guidance (not a single filter lookup).

**Examples:**
- "We have 40 Komatsu mining trucks. What filtration strategy do you recommend?"
- "How do we reduce downtime from hydraulic failures across our fleet?"

```
USER: [Fleet context described]
        │
AGENT: Intake (one message with 2–3 structured questions):
        "To give you a useful recommendation, I need a few details:
         1. What type of equipment / operating environment?
         2. What are your current maintenance intervals and primary failure modes?
         3. Is this a new filtration program or a review of an existing one?"
        │
USER: [Provides fleet context]
        │
AGENT: Synthesize from Citation API + Knowledge System fleet pages
        → Identify anchor industry
        → Surface relevant contamination modes for that industry
        → Map to ISO cleanliness targets (if hydraulic/lube systems involved)
        → Recommend ELIMFILTERS technology stack
        → Link to Fleet Optimization Knowledge System pages
        → Offer human follow-up for program design
        │
AGENT RESPONSE STRUCTURE:
        "Based on [fleet context], the primary contamination risks are:"
        "[Risk 1] — [brief mechanism]"
        "[Risk 2] — [brief mechanism]"
        "The ELIMFILTERS technologies that address these are [X, Y, Z]."
        "For deeper reading: [Knowledge System URL]"
        "For a formal fleet filtration assessment, our technical team can help: support@elimfilters.com"
```

---

### FLOW 7 — UNRECOGNIZED INTENT (Catch-All)

**Entry trigger:** The agent cannot classify the user's question into a known flow after one exchange.

```
AGENT: "I want to make sure I give you the right information."
        "Could you tell me: are you looking for a specific filter part number, a technical explanation, or something about the distributor program?"
        [Offer 3 quick-reply buttons: "Find a part" / "Technical question" / "Something else"]
        │
        ├─ User selects a category → Route to appropriate flow
        │
        └─ User selects "Something else" or provides unclear response
                Agent: "For anything our system can't handle directly, our team is the best resource:"
                        "General: info@elimfilters.com"
                        "Technical / product: support@elimfilters.com"
                        "Distribution: distribution_network@elimfilters.com"
```

---

## 8. SUCCESS METRICS

The following metrics define whether V1 is performing correctly. All metrics should be tracked from day one of launch.

### 8.1 Resolution Metrics

| Metric | Definition | V1 Target |
|--------|-----------|-----------|
| **Autonomous resolution rate** | % of conversations answered without human escalation | ≥ 60% by month 3 |
| **Cross-reference success rate** | % of part number queries that return a confirmed match | Track baseline (depends on OEM coverage) |
| **Escalation rate** | % of conversations that trigger a human handoff | Track; reduce through Knowledge Ecosystem expansion |
| **Wrong answer rate** | % of conversations where agent provided a factually incorrect answer | 0% for cross-references; < 2% overall |

### 8.2 Speed Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| **First response time** | Time from user message to agent first reply | < 30 seconds |
| **Time to resolution** | Time from first message to conversation close (autonomous) | < 3 minutes for cross-references |
| **Time to escalation** | Time from trigger to escalation message sent | < 60 seconds |

### 8.3 Quality Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| **Escalation accuracy** | % of escalations routed to the correct email address | ≥ 95% |
| **Flow completion rate** | % of conversations that reach a defined exit (answer, link, or escalation) vs. abandoned | ≥ 80% |
| **User re-engagement rate** | % of users who return for a second conversation | Track; increasing trend indicates value |
| **Knowledge System link clicks** | % of conversations where agent sends a KS link and user clicks it | Track; indicates content depth is useful |

### 8.4 Commercial Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| **Distributor referral rate** | % of conversations that route to distribution_network@elimfilters.com | Track |
| **Distributor inquiry conversion** | % of distribution referrals that result in an application | Track (requires coordination with distribution team) |
| **Support ticket generation** | # of emails generated to support@elimfilters.com via agent | Track; high volume may indicate agent coverage gaps |

### 8.5 Leading vs. Lagging Indicators

**Leading indicators (check weekly):**
- Cross-reference hit rate (is the database covering incoming queries?)
- Most common unresolved query types (what to add to Knowledge Ecosystem V2)
- Escalation triggers (which question types are failing most often)

**Lagging indicators (check monthly):**
- Autonomous resolution rate trend
- Distributor referral to application conversion
- User return rate

---

## 9. RISKS

### 9.1 CRITICAL — Incorrect Cross-Reference

**Risk:** Agent returns a wrong ELIMFILTERS part number for an OEM reference, either due to database error or agent hallucination.

**Impact:** Equipment enters service with the wrong filter. Potential for engine damage, hydraulic failure, or safety incident. Warranty liability.

**Likelihood:** Low if the agent uses the Part Search database exclusively and never generates part numbers from its own reasoning.

**Controls:**
- Hard rule: the agent never generates a part number not returned by the Part Search database
- On no-match: escalate — never approximate
- All cross-reference responses must cite the source: "Part Search database match for [OEM number]"
- Periodic audit: compare agent cross-reference outputs against Part Search database entries

**Residual risk:** LOW — manageable with strict enforcement of the no-guess rule.

---

### 9.2 HIGH — Confident Wrong Technical Answer

**Risk:** Agent provides a technically incorrect explanation (wrong ISO code interpretation, incorrect failure mechanism, wrong technology mapping) that a user acts on.

**Impact:** Incorrect maintenance decision, wrong filtration specification chosen, user trust damaged.

**Likelihood:** Moderate without strict Citation API grounding. Reduced significantly if agent answers are traced to specific entity definitions.

**Controls:**
- All technical answers grounded in Citation API entity content
- Agent does not extrapolate beyond entity scope
- After 2 failed attempts, escalate — do not try harder
- Technical answers should be prefaced with the source: "According to the ELIMFILTERS Knowledge System..." or "ISO 16889 defines..."

---

### 9.3 HIGH — Scope Creep to Commercial Answers

**Risk:** Agent attempts to answer pricing, availability, or inventory questions because the user is persistent, and the agent wants to be helpful.

**Impact:** Incorrect price quotes create commercial disputes. Incorrect availability claims create delivery expectation failures.

**Controls:**
- Hard rule: pricing and availability questions generate an immediate routing response, with no additional information
- No exceptions — even "rough estimates" or "it depends on your order size" create liability

---

### 9.4 MEDIUM — Privacy and Data Handling

**Risk:** Users share sensitive operational data (fleet size, equipment inventory, locations, operating conditions) in WhatsApp messages. This data may be stored by WhatsApp Business API providers.

**Impact:** Data privacy obligations in some jurisdictions (GDPR for EU distributors, LGPD for Brazil).

**Controls:**
- Terms of use disclosure at conversation start: "This conversation is handled by an AI assistant. Do not share confidential business information. For sensitive discussions, contact us by email."
- Agent does not ask users to provide more information than needed for the immediate query
- Data retention policy must be defined before launch

---

### 9.5 MEDIUM — WhatsApp Rate Limits and Availability

**Risk:** WhatsApp Business API has rate limits. High inbound volume during a product launch or outreach campaign could cause message delays or failures.

**Impact:** Delayed responses during peak periods. User frustration.

**Controls:**
- Monitor message volume against WhatsApp Business API tier limits
- Have email fallback ready: if WhatsApp is delayed, route to info@elimfilters.com
- Do not launch active WhatsApp marketing campaigns before the agent is stable

---

### 9.6 MEDIUM — Brand Misrepresentation

**Risk:** The agent makes statements that appear to be official ELIMFILTERS positions on topics outside its authority (legal, regulatory, competitor comparisons, performance guarantees).

**Impact:** Legal exposure, brand credibility damage.

**Controls:**
- Strict out-of-scope definitions (Section 3) enforced at the prompt level
- Agent consistently identifies itself as an AI assistant
- No superlative or guarantee language in agent responses

---

### 9.7 LOW — Knowledge Ecosystem Staleness

**Risk:** The Knowledge Ecosystem V1 is a static dataset. As new products, standards, or cross-references are added, the agent's knowledge becomes outdated.

**Impact:** Agent answers questions about old products or standards without knowing newer information exists.

**Controls:**
- Knowledge Ecosystem update process should trigger agent knowledge refresh
- Version-date all entity definitions (already in Knowledge Ecosystem structure)
- Quarterly review of agent responses against current product catalog

---

### 9.8 LOW — Distributor Program Misrepresentation

**Risk:** Agent describes distributor program terms in a way that creates expectations the program does not fulfill (exclusivity commitments, pricing promises, timeline guarantees).

**Impact:** Distributor candidates feel misled. Commercial disputes.

**Controls:**
- Agent delivers only the program overview (Section 4, Flow 4) — no specific terms
- Any detailed program question is routed to distribution_network@elimfilters.com
- Regular review of distributor inquiry transcripts for accuracy

---

## 10. V1 LAUNCH SCOPE

The first version of the agent is intentionally narrow. It launches with the highest-confidence capabilities and adds scope based on measured performance, not feature ambition.

### 10.1 IN SCOPE FOR V1 LAUNCH

| Capability | Knowledge Source | Confidence Level |
|-----------|-----------------|-----------------|
| OEM part number cross-reference | Part Search database | HIGH — database lookup only |
| Equipment-based filter identification | Part Search database | HIGH — database lookup only |
| ISO standard explanations (10 core standards) | Citation API | HIGH — entity-grounded |
| ELIMFILTERS technology explanations (7 technologies) | Citation API | HIGH — entity-grounded |
| Contamination mode explanations (5 modes) | Citation API | HIGH — entity-grounded |
| Industry filtration context (11 industries) | Citation API + KS | HIGH — entity-grounded |
| Distributor program overview + routing | Static copy | HIGH — no dynamic content |
| Warranty coverage overview + routing | Static copy | HIGH — no dynamic content |
| Escalation to 3 email addresses | Routing rules | HIGH — deterministic |
| Link delivery to Knowledge System pages | URL list | HIGH — static |

### 10.2 OUT OF SCOPE FOR V1 (FUTURE VERSIONS)

| Capability | Reason Deferred |
|-----------|----------------|
| Visual filter identification from photo | Requires image recognition model |
| Proactive maintenance interval reminders | Requires user identity and session continuity |
| Fleet-level filtration program design | Requires human engineering involvement |
| Multi-language support (Spanish, Portuguese) | V1 launches in English; add languages after flow validation |
| CRM integration (lead capture, history) | Requires CRM setup and data governance |
| Order placement or inquiry routing to ERP | Requires inventory system integration |
| Predictive contamination alerts | Requires telemetry data integration |
| Distributor-specific pricing lookup | Requires authenticated session and pricing system |
| Competitor cross-reference (Donaldson → ELIMFILTERS) | Part Search database is bidirectional — validate coverage first |

### 10.3 V1 LAUNCH CRITERIA (GO / NO-GO)

The agent must pass the following checks before launch:

| Check | Criteria | Owner |
|-------|---------|-------|
| Cross-reference accuracy test | 50 known OEM → ELIMFILTERS pairs tested; 0 incorrect matches returned | Technical team |
| Escalation flow test | All 7 escalation triggers tested; 100% routed correctly | QA |
| Out-of-scope rejection test | 20 pricing/inventory/legal questions tested; 0 answered | QA |
| Knowledge Ecosystem coverage audit | 10 core standards, 7 technologies, 5 contamination modes all answerable | Technical team |
| WhatsApp Business API compliance | Privacy disclosure at conversation start; opt-out path defined | Legal / operations |
| Email routing test | 30 test conversations; 100% routed to correct email address | QA |
| Formspree auto-reply configured | Distributor application confirmation email verified | Operations |
| Load test | 20 simultaneous conversations without delay or failure | Technical team |

### 10.4 V1 ROLLOUT SEQUENCE

```
Phase A — Internal testing (Weeks 1–2)
  ELIMFILTERS commercial and technical team uses the agent daily
  Goal: find escalation failures, wrong answers, and routing errors
  Volume: 50–100 test conversations

Phase B — Soft launch with distributors (Weeks 3–4)
  Authorized distributors notified of the WhatsApp number
  Agent presented as "beta" — feedback actively solicited
  Volume: estimated 50–200 conversations/month
  Review: weekly metrics review against Section 8 targets

Phase C — Public launch (Month 2)
  WhatsApp number added to:
    - /distributor-application page
    - /contact page
    - Distributor confirmation email template
    - Footer (optional)
  Volume: monitor against WhatsApp API tier limits
  Review: monthly metrics review; expand scope based on coverage gaps
```

### 10.5 V1 INFRASTRUCTURE REQUIREMENTS (SUMMARY)

| Component | Requirement |
|-----------|------------|
| WhatsApp Business API access | Required — Meta Business account, verified phone number |
| AI model with API access | Required — must support function calling / tool use for Citation API + Part Search queries |
| Citation API hosting | Complete — already at `elimfilters.com/api/citation/` |
| Part Search API access | Required — confirm whether `part-search.elimfilters.com` exposes an API or requires scraping; API preferred |
| Conversation logging | Required — WhatsApp message history for quality review |
| Escalation delivery | Required — email delivery from agent to three inboxes; verify SMTP or relay |
| Human handoff protocol | Required — when agent escalates, human must receive: (a) the escalation reason, (b) the conversation history, (c) the user's contact |

---

*Architecture designed: 2026-06-04*
*Input: Knowledge Ecosystem V1, Distributor Program Workbook, Prequalification Flow, Distributor Program Decision Workbook*
*Status: Operational design only — no code, no implementation*
