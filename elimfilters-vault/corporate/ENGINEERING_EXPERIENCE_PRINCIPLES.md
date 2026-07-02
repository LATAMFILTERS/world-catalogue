# ELIMFILTERS® Engineering Experience Principles
## Constitutional Reference for Customer-Facing Engineering Intelligence
### Version 1.3 | Ratified: 2026-07-01 | Last amended: 2026-07-02 | Status: FROZEN

---

> This document defines the permanent principles governing every customer-facing experience
> produced by the ELIMFILTERS® Engineering Intelligence Platform.
>
> It is not a style guide. It is not a preference document. It is not subject to revision
> by engineering teams, marketing teams, or individual product decisions.
>
> Every future UI, customer journey, AI assistant, generated page, recommendation engine,
> and navigation structure must comply with these principles without exception.
>
> When an implementation conflicts with these principles, the implementation changes.
> The principles do not.

---

## Document Control

| Field | Value |
|---|---|
| Document | ENGINEERING_EXPERIENCE_PRINCIPLES |
| Version | 1.3 |
| Status | FROZEN — Constitutional Reference |
| Ratified | 2026-07-01 |
| Last amended | 2026-07-02 — Amendment A3: Principles 12 and 13 added (Engineering Humility; Decision Authority) |
| Authority Level | Constitutional — subordinate only to ELIMFILTERS_CORPORATE_CONSTITUTION |
| Location | elimfilters-vault/corporate/ |
| Scope | All customer-facing interfaces, journeys, pages, AI assistants, and navigation |
| Amendment Rule | Engineering Decision Record (EDR) required — cannot be amended inline |

---

## Position in Doctrine Hierarchy

```
ELIMFILTERS® CORPORATE CONSTITUTION                         [SUPREME]
    │
    ├── Engineering Experience Principles v1.0              [FROZEN — this document]
    │       │
    │       ├── Customer Journey Implementations            [may evolve]
    │       ├── Visual Design System                        [may evolve]
    │       └── UX Component Library                        [may evolve]
    │
    ├── Technical Doctrine Master                           [FROZEN]
    │       └── Engineering Foundation
    │               ├── Knowledge Graph                     [FROZEN schema]
    │               ├── Engineering Services                [FROZEN API]
    │               └── Vault Registry                      [versioned]
    │
    └── Commercial Architecture Master                      [FROZEN]
```

These principles govern the **experience layer** — the interface between the Engineering
Foundation and the customer. They do not govern the Foundation itself. The Foundation
is governed by the Technical Doctrine Master.

---

## Why These Principles Exist

The ELIMFILTERS® Engineering Intelligence Platform is built on a single conviction:

**Industrial customers make better equipment decisions when they understand engineering
before they encounter products.**

This conviction has operational consequences. It means the platform must be designed
to build engineering understanding as its primary function — and to allow commercial
conversion only when that understanding is established.

Without permanent principles, this conviction will be eroded by ordinary product
pressures: add a product CTA earlier, put the catalogue on the homepage, optimise
for click-through not comprehension. These are normal commercial impulses. They are
incompatible with the platform's mission.

These principles exist to make the erosion impossible.

---

## The Thirteen Permanent Principles

---

### Principle 1 — Customer Intent Before Products

> Every experience begins with the customer's intent.
> Never begin with products.

**What this means:**

The first question a customer encounters on any journey must be about their situation,
their equipment, their problem, or their goal — not about a product category or SKU.

A customer arriving at the platform with a hydraulic fault must be asked what fault
they are observing, not which hydraulic filter they use. A customer exploring air
intake protection must be asked about their operating environment and equipment class,
not invited to browse filter catalogues.

**What this prohibits:**

- Any page that opens with a product listing, product grid, or product search
- Any journey that begins with a filter specification without first establishing context
- Any CTA that precedes customer intent capture in a sequential journey
- Any homepage hero that leads with products rather than engineering value

**Compliance test:**

Read the first 200 words a customer encounters on any page or journey.
If a product name, SKU, or commercial invitation appears before a question about
the customer's situation, the implementation violates this principle.

---

### Principle 2 — Engineering Before Commerce

> Explain the engineering reasoning before presenting commercial recommendations.
> Every recommendation must be earned through explanation.

**What this means:**

A customer who understands why a contamination target matters will make a better
equipment decision than a customer who receives a product recommendation without
context. Engineering explanation is not optional content placed before a CTA —
it is the primary mechanism by which the platform creates value and earns trust.

Commercial content (product recommendations, part searches, lead capture forms)
is permitted only after the engineering reasoning that justifies it has been presented.

**What this prohibits:**

- Presenting a recommended technology before explaining the contamination it addresses
- Showing a product part number before identifying the failure mechanism it prevents
- Displaying a price or delivery option before the engineering justification for the product
- Any "buy now" or "find parts" action appearing as the primary page action

**The ordering is non-negotiable:**

```
Contamination Mechanism Identified
    ↓
Failure Mode Understood
    ↓
Standard Measurement Target Established
    ↓
Technology Architecture Explained
    ↓
Product Recommendation Presented
```

---

### Principle 3 — Products Are Conclusions

> Products are the result of engineering reasoning. They are never the starting point.

**What this means:**

A product SKU is the final expression of a contamination control decision. Before
a customer can make that decision, they must understand the contamination they are
controlling, the standard that measures it, and the technology architecture that
addresses it. A product recommendation that skips this chain is a guess, not
an engineering recommendation.

The platform does not sell products. It delivers engineering conclusions that happen
to be implemented as products.

**What this prohibits:**

- Any page architecture that places products in the first or second visible content section
- Product carousels, featured products, or "popular filters" content anywhere in
  the Engineering Intelligence experience
- Any recommendation presented without a traceable engineering step chain
- Any product appearing in search results without contamination context in the
  same view

**The required pattern:**

Every product recommendation must appear alongside or after:
1. The contamination mode it addresses
2. The standard that defines the target cleanliness
3. The technology that controls the contamination
4. The confidence level of the recommendation

---

### Principle 4 — Every Page Answers One Engineering Question

> Every generated page must answer a specific engineering question.
> Pages exist to educate first. Convert second.

**What this means:**

A page without a clear engineering question it answers does not belong in the
Engineering Intelligence Platform. The question defines the page's purpose,
determines its content hierarchy, and establishes the customer intent it serves.

Examples of valid engineering questions:
- "Which contamination mechanisms affect hydraulic systems?"
- "What happens when water enters diesel fuel?"
- "How does dust ingestion reduce engine overhaul intervals?"
- "Which ISO standards govern air intake filtration?"
- "Why does particle size matter more than particle count in hydraulic systems?"

Examples of invalid page purposes:
- "Browse our hydraulic filter range"
- "Find your replacement filter"
- "ELIMFILTERS product catalogue"
- "Shop by equipment type"

**URL as the question proxy:**

The URL of every Engineering Intelligence page must be derivable from the
engineering question it answers. A URL that cannot be restated as an
engineering question is a signal that the page violates this principle.

---

### Principle 5 — URLs Represent Customer Language

> URLs must describe systems, applications, problems, or customer intent.
> Internal entity identifiers must never appear in customer-facing URLs.

**What this means:**

URLs are the customer's first signal about what a page contains. They must
communicate the engineering topic in natural language — the language a reliability
engineer, fleet manager, or maintenance supervisor would use, not the language
of the internal Knowledge Graph.

**Required URL patterns:**

```
/engineering/hydraulic-contamination          ✓  customer language
/engineering/diesel-water-contamination       ✓  customer language
/engineering/dust-ingestion                   ✓  customer language
/engineering/contamination/CONT-WEAR-HYD      ✗  internal entity ID
/engineering/technologies/TECH-NANOFORCE      ✗  internal entity ID (for topic pages)
```

**Permitted exceptions:**

Dynamic entity explorer pages (used internally by the Knowledge Graph traversal UI)
may use entity IDs in the path. These pages are not customer-facing topic pages.
They are graph navigation tools. They must not be surfaced as primary navigation
destinations or indexed as canonical content.

**The test:**

Show a URL to a reliability engineer who has never heard of ELIMFILTERS.
If they cannot predict the engineering topic from the URL alone, the URL
violates this principle.

---

### Principle 6 — Engineering Relationships Drive Navigation

> Navigation must emerge from the Knowledge Graph.
> Relationships between contamination, failure modes, technologies, standards
> and products define where a customer goes next — not arbitrary menu structures.

**What this means:**

When a customer reads about hydraulic contamination, the next destinations they
are offered must be derived from the engineering relationships in the Knowledge Graph:
the failure modes that contamination produces, the standards that measure it,
the technologies that control it, and the industries where it is most severe.

Navigation built from arbitrary product hierarchies, marketing categories, or
content management convenience is prohibited in the Engineering Intelligence
experience.

**Required navigation pattern:**

Every Engineering Intelligence page must present Related Topics derived from
the Knowledge Graph edges of the primary entity it discusses. These links
represent the engineering chain the customer is naturally traversing, not
arbitrary editorial selections.

**The chain that must be navigable:**

```
Contamination Mode
    ↓ produces
Failure Modes
    ↓ measured by
Applicable Standards
    ↓ controlled by
Technology Architectures
    ↓ implemented as
Product Families
    ↓ applied in
Industry Applications
    ↓ optimised through
Fleet Strategies
```

Every position on this chain must be navigable from every adjacent position.
No node in the chain may be a dead end.

---

### Principle 7 — Explain Every Recommendation

> Every recommendation produced by the platform must include full engineering justification.
> Recommendations without explanation are commercial suggestions. They are not engineering recommendations.

**What this means:**

When the platform recommends a technology, a product, or a protection strategy,
it must show the reasoning. A customer who cannot trace a recommendation to
engineering principles cannot validate it, cannot explain it to colleagues,
and cannot act on it with confidence.

**Required elements in every recommendation:**

1. **Engineering Justification** — The contamination mechanism or failure mode the recommendation addresses
2. **Supporting Engineering Principles** — The physical or chemical principles that make this approach effective
3. **Technology Architecture** — How the recommended technology implements the solution
4. **Applicable Standards** — The ISO, ASTM, or SAE standard that measures whether the recommendation achieves its target
5. **Confidence Level** — Whether the recommendation is derived from direct graph traversal, inferred from related entities, or generalised from domain knowledge
6. **Engineering Memory** — Any operational context or prior observation relevant to this entity and customer context

**What this prohibits:**

- "Recommended for your equipment" without specifying why
- Confidence scores without an explanation of what they represent
- Technology names without explaining the contamination mechanism they address
- Any recommendation that cannot be fully re-derived from the Knowledge Graph

---

### Principle 8 — Trust Before Conversion

> The platform earns trust before requesting any commercial action.
> Every CTA appears only after sufficient engineering understanding has been established.

**What this means:**

A customer who has read a product recommendation and not yet understood the
engineering behind it has not established the trust required for a commercial
action. Trust is measured in engineering understanding, not in page scroll depth
or time-on-page.

The platform must sequence every journey so that trust-building content
precedes commercial content. This is not a recommendation — it is a structural
requirement enforced by the 10-point page architecture.

**The trust sequence (non-negotiable order):**

1. Customer problem identified
2. Operational consequences explained (quantified)
3. Engineering mechanism explained
4. Applicable standards presented
5. Technology architecture mapped
6. Protection strategy defined
← **Trust established. Commercial action permitted below this line.**
7. Product recommendation presented
8. Engineering references (Knowledge Graph)
9. Related topics (cross-navigation)
10. Next recommended journey

**What this prohibits:**

- CTA buttons above section 7 in any 10-point page
- Lead capture forms appearing before engineering explanation
- "Request a quote" actions in hero sections or navigation bars
  within the Engineering Intelligence experience
- Interstitial commercial interruptions within engineering content sections

---

### Principle 9 — Engineering Conversations

> Every customer journey must feel like a consultation with an experienced
> reliability engineer. Never like a catalogue wizard.

**What this means:**

The language, structure, and pacing of every customer interaction must
reflect how an experienced reliability engineer thinks and communicates:
systematically, technically, specifically, and without commercial bias.

An experienced reliability engineer does not say: "Our premium hydraulic filter
provides superior contamination control." They say: "At ISO 4406 17/15/12, your
proportional valve spools are operating within their design clearance. Above
19/17/14, you will begin to see silting-induced stiction within 500–1,000 hours.
Your current element selection is not rated to maintain 17/15/12 at your circuit
flow rate."

**Required language characteristics:**

- Technical specificity: ISO codes, micron ratings, Beta ratios, operating pressures, clearance tolerances
- Quantified impacts: hours of component life, percentage efficiency loss, downtime frequency, cost per event
- Neutral framing: "maintains ISO 4406 16/14/11" not "superior cleanliness"
- Failure chain reasoning: "contamination exceeds target → wear accelerates → clearance grows → failure"
- No marketing adjectives: no "premium", "advanced", "industry-leading", "superior", "best-in-class"

**The test:**

Read any generated paragraph and ask: could an experienced reliability engineer
at a mining company have written this? If yes, it passes. If it sounds like a
product brochure, it fails.

---

### Principle 10 — Single Source of Engineering Truth

> The Experience Layer never duplicates engineering knowledge.
> All engineering content is generated from the Foundation through the
> Knowledge Graph through Engineering Services.

**What this means:**

Engineering definitions, contamination descriptions, failure mode explanations,
standard scopes, technology capabilities, and operational impact metrics exist
once — in the vault, registered in the Knowledge Graph, accessible through
Engineering Services.

The Experience Layer renders this content. It does not author it.

**The access hierarchy is non-negotiable:**

```
Vault Registry (source of record)
    ↓
Knowledge Graph (structured relationships)
    ↓
Engineering Services (access API)
    ↓
Experience Layer (rendering)
    ↓
Customer
```

**What this prohibits:**

- Hardcoding engineering content (contamination descriptions, ISO code definitions,
  technology capabilities, failure mode explanations) directly in page components
- Creating page-specific copies of engineering knowledge that diverge from vault
  source of record over time
- Authoring engineering content in the Experience Layer that has not been registered
  in the vault
- Bypassing Engineering Services to access the Knowledge Graph directly from
  page components
- Duplicate technology descriptions in multiple pages with different wording

**The consequence:**

When the vault is updated — a standard revised, a technology specification changed,
a new failure mode documented — the Experience Layer reflects the change without
modification. Pages are renderers, not authors.

---

### Principle 11 — Customer Questions Drive Engineering Knowledge

> The platform always begins with the customer's question and translates it
> into governed engineering knowledge before presenting recommendations.
>
> The customer never needs to understand internal engineering classifications,
> entity identifiers, graph structures, or system architecture.
>
> The customer expresses a question, a symptom, a risk, or an objective.
> The platform is responsible for the translation.

**The canonical statement:**

The platform always begins with the customer's question and translates it into
governed engineering knowledge before presenting recommendations.

The customer operates in their language: systems, problems, symptoms, equipment,
risks, and operational objectives. The platform operates in engineering language:
contamination mechanisms, failure modes, cleanliness standards, technology
architectures, and protection strategies. The Experience Layer is the translator.
The customer never crosses into the platform's internal vocabulary.

**What the customer expresses. What the platform translates.**

| Customer Expression | Platform Translation |
|---|---|
| "Which contamination mechanisms affect hydraulic systems?" | Contamination modes, failure chains, ISO targets, protection technologies |
| "What happens when water enters diesel fuel?" | Water ingress pathways, injector erosion mechanics, ASTM D6304, water separation technologies |
| "How does dust ingestion damage engines?" | Abrasive wear mechanism, Mohs hardness differential, ISO 5011, intake filtration specification |
| "My actuators are drifting" | Hydraulic contamination diagnosis, ISO 4406 deviation, spool stiction failure mode |
| "I want to reduce unplanned downtime" | Fleet contamination control strategy, CBM intervals, TCO framework |
| "Which standards apply to my fuel system?" | ASTM D6304, ISO 12937, ISO 16332 — each explained in context |

The customer never encounters entity identifiers, graph traversal outputs, internal
classification codes, or implementation terminology. These are the platform's
internal instruments. They produce the answer. They are not the answer.

**Scope — this principle applies to every customer interaction surface:**

- **Generated Pages** — URL and H1 heading encode the customer's question; governed
  engineering knowledge answers it
- **Search** — customer queries in natural language return engineering knowledge,
  not entity lists
- **Customer Journeys** — each step asks about the customer's situation in their
  own language; engineering reasoning is produced internally
- **AI Assistant** — the assistant receives customer language and translates
  through governed engineering knowledge before responding
- **Recommendations** — every recommendation is expressed as an engineering
  answer to the customer's question, not as an entity match
- **Engineering Consultations** — the structured diagnostic process operates
  in customer language throughout; internal classifications are used to drive
  reasoning, not presented to the customer

**The required translation architecture:**

```
Customer Question / Symptom / Risk / Objective
    ↓  [Experience Layer — translation]
Governed Engineering Knowledge
    (contamination mechanism, failure mode, standard, technology, protection strategy)
    ↓  [Experience Layer — rendering]
Engineering Explanation in customer language
    ↓
Technology Architecture (named, not identified)
    ↓
Protection Strategy
    ↓
Recommended Products
    ↓
Related Engineering Topics in customer language
```

The translation step is non-negotiable. No customer-facing surface may skip it
and present governed engineering knowledge in its internal form.

**Implementation independence:**

This principle does not prescribe the mechanism used to translate customer
questions into engineering knowledge. The current implementation uses a
Knowledge Graph with entity-relationship traversal. Future implementations
may use different technical approaches. The principle governs the experience
contract — what the customer encounters — not the technical means of fulfilling it.

Any successor system must preserve this contract: customer language in,
engineering knowledge out, internal classification invisible.

**What this prohibits:**

- URLs containing internal entity identifiers as the primary customer-facing path
- Page headings that are entity labels rather than customer questions
- Search results that surface internal classification codes without translation
- AI assistant responses that reference internal entity IDs or graph terminology
- Recommendation outputs that present entity matches without engineering explanation
- Any customer-facing surface that requires the customer to understand internal
  system architecture to interpret what they are seeing

**The test:**

Show any customer-facing surface to a reliability engineer who has never used
the platform. If they encounter a term, identifier, or classification that
belongs to the platform's internal architecture rather than to the engineering
domain itself, the surface violates this principle.

Note: ISO codes, Beta ratios, and ISO 4406 particle counts are engineering
domain language — they are not internal platform identifiers. They are permitted
and required. Entity IDs such as CONT-*, TECH-*, FM-* are internal platform
identifiers. They are prohibited in customer-facing surfaces.

**Amendment record:** A1 — Added 2026-07-01 as Principle 11 with implementation-
specific language. A2 — Redefined 2026-07-01: principle rewritten to be
implementation-agnostic. "Knowledge Graph" removed as a named dependency;
principle now governs the experience contract independent of the underlying
technology mechanism. Scope expanded to cover all six customer interaction
surfaces: generated pages, search, customer journeys, AI assistant,
recommendations, and engineering consultations.

---

### Principle 12 — Engineering Humility

> The platform shall never fabricate engineering certainty.
>
> If the available engineering evidence is insufficient to produce a technically
> defensible recommendation, the platform must explicitly state that additional
> engineering information is required.
>
> A correct refusal is superior to an incorrect recommendation.

**What this means:**

The platform's authority derives from its engineering credibility. That credibility
is built over time by being reliably accurate when it speaks and reliably honest
when it cannot. A platform that speculates in order to appear confident is more
dangerous than one that acknowledges the limits of its knowledge.

When evidence is insufficient, the platform says so. When evidence is conflicting,
the platform says so. When the minimum conditions for responsible reasoning have
not been established, the platform requests only what is needed to proceed — and
nothing more.

**Three forms of fabrication that are permanently prohibited:**

| Form | Description |
|---|---|
| Certainty fabrication | Presenting a hypothesis as an established fact |
| Coverage fabrication | Implying knowledge of a domain the platform does not cover |
| Confidence fabrication | Presenting a LOW or PROHIBITED output as if it were MEDIUM or HIGH |

**The precedence rule:**

This principle takes precedence over user convenience, time pressure, commercial
opportunity, and any implicit expectation that the platform will always have an
answer. The platform earns trust through accuracy and honesty about its limits —
not through the appearance of competence.

**What this prohibits:**

- Any hedging language that obscures the actual evidence state ("probably," "likely,"
  "in most cases" used to present unsupported conclusions as approximate facts)
- Any response that produces a recommendation while omitting required disclosure
  about the confidence level or inference type
- Confidence levels assigned to satisfy a request rather than to reflect evidence
- Any response that provides partial engineering content framed as if it were complete

**The test:**

For any response: if the evidence state were PROHIBITED or LOW, would this response
still appear confident? If yes, it violates this principle.

---

### Principle 13 — Decision Authority

> No engineering recommendation may bypass the Engineering Decision Engine.
>
> The platform may reason only after it has earned the right to reason.

**What this means:**

The Engineering Decision Engine is the authorization layer for all engineering
reasoning. It does not perform reasoning. It authorizes it. A recommendation
that reaches a customer without Decision Engine authorization is unauthorized
— regardless of how confidently or correctly it was formed.

This principle governs every surface on which the platform makes or implies
an engineering recommendation.

**Governed surfaces:**

| Surface | Requirement |
|---|---|
| AI Assistant | Every engineering judgment requires Decision Engine authorization |
| Engineering Search | Results that imply a recommendation require authorization |
| Product Recommendation Engine | Every product presented as a recommendation requires authorization |
| Generated Engineering Pages | Section 07 recommendations are authorized at page generation time |
| Dealer Portal | All dealer-facing engineering recommendations require authorization |
| API Endpoints | Any endpoint returning a recommendation requires authorization |
| Future Autonomous Agents | All agents acting on behalf of the platform require authorization |

**The three governing bodies and their distinct jurisdictions:**

```
The Knowledge Graph governs truth.
    ↓ (what relationships exist)
The Decision Engine governs permission.
    ↓ (whether reasoning is authorized)
The AI Reasoning Engine governs explanation.
    ↓ (how authorized conclusions are expressed)
```

The AI Reasoning Engine does not grant its own permission. It receives
authorization from the Decision Engine and explains what the Decision Engine
has authorized. This separation is permanent.

**What this prohibits:**

- Any engineering recommendation produced without a completed Decision Engine evaluation
- Any system, agent, or interface that bypasses the Decision Engine to produce recommendations faster
- Any product recommendation that is not preceded by an authorized engineering recommendation
- Treating the Decision Engine as an optional layer for "simple" or "obvious" requests

**The boundary between Principles 12 and 13:**

Principle 12 (Engineering Humility) governs what the platform claims to know.
Principle 13 (Decision Authority) governs who may authorize what is claimed.

Both are constitutional constraints. Neither is waivable.

**Amendment record:** A3 — Added 2026-07-02.

---

## The 10-Point Page Architecture

Every Engineering Intelligence topic page must implement the following structure
in the following order. This architecture is the physical expression of Principles
1 through 10 combined.

```
01 / CUSTOMER PROBLEM
     Principle 1, 4, 9
     The engineering question this page answers.
     The symptom-first problem statement in customer language.

02 / OPERATIONAL CONSEQUENCES
     Principle 2, 8
     Quantified operational and economic impact.
     No engineering explanation yet — consequences first, then mechanism.

03 / ENGINEERING EXPLANATION
     Principle 2, 9, 10
     Root cause mechanics.
     Failure chain from contamination to component failure.
     Technical language, quantified where possible.

04 / APPLICABLE STANDARDS
     Principle 2, 7, 10
     ISO/ASTM/SAE/NFPA standards with scope and relevance.
     Each standard explained in context, not listed in isolation.

05 / TECHNOLOGY ARCHITECTURE
     Principle 2, 3, 7, 10
     Technologies mapped to specific failure mechanisms.
     Each technology explained by what it controls, not what it is.
     Links to entity explorer pages (not to product pages).

06 / PROTECTION STRATEGY
     Principle 2, 3, 9
     System-level engineering actions.
     Ordered implementation sequence.
     No products — strategy precedes product selection.

07 / RECOMMENDED PRODUCTS
     Principle 3, 8
     Products presented as the conclusion of reasoning.
     Part search or CTACard.
     First commercial content on the page.

08 / ENGINEERING REFERENCES
     Principle 7, 10
     EngineeringRecommendationsSection — Knowledge Graph derived.
     Full recommendation step traces visible.
     Engineering Memory panel where applicable.

09 / RELATED TOPICS
     Principle 6
     Cross-links derived from Knowledge Graph relationships.
     Navigation to adjacent contamination modes, standards,
     technologies, and industry applications.

10 / NEXT RECOMMENDED JOURNEY
     Principle 1, 6, 9
     Reactive path: Problem Diagnosis journey.
     Proactive path: Asset Protection journey.
     Customer selects based on their current intent.
```

---

## Governance

---

### What May Evolve (No EDR Required)

The following may change without an Engineering Decision Record, provided
they do not alter the principles or their implementation requirements:

| Layer | What may evolve |
|---|---|
| Visual Design | Typography, colour palette, spacing, animation curves, component aesthetics |
| UX Implementation | Component library, interaction patterns, responsive behaviour, animation library |
| Page Content | Addition of new pages following the 10-point architecture |
| Knowledge Graph | Addition of new entities, relationships, engineering memory entries |
| Engineering Services | Performance improvements, new service functions (not removal of existing) |
| Cross-links | Addition of new Related Topics links as new pages are created |
| URL patterns | Addition of new customer-intent URL patterns |

---

### What Requires an Engineering Decision Record

The following changes require a formal EDR before implementation:

| Change | Why EDR Required |
|---|---|
| Modifying the 10-point page architecture order | Alters trust-building sequence governed by Principles 1, 2, 3, 8 |
| Introducing commercial content before section 07 | Direct violation of Principle 8; EDR must justify exception |
| Introducing a new navigation pattern not derived from Knowledge Graph | May violate Principle 6; requires graph relationship justification |
| Adding a recommendation type without engineering step traces | Violates Principle 7; requires alternative justification mechanism |
| Creating page content outside the Foundation → Graph → Services chain | Violates Principle 10; requires documented exception and reconciliation plan |
| Changing any URL pattern from customer language to entity identifier | Violates Principle 5 |
| Introducing a customer journey that begins with product selection | Violates Principles 1 and 3 |
| Modifying the trust sequence within a customer journey | Violates Principle 8 |

**EDR format:**

```
EDR-[number]: [Change description]
Date: [YYYY-MM-DD]
Principle(s) affected: [list]
Justification: [technical or operational reason this exception is necessary]
Alternative considered: [what other approach was evaluated]
Decision: [Approved / Rejected]
Approved by: [role]
```

---

### What Is Permanently Frozen

The following are immutable. No EDR can amend them. Only a formal amendment
to this document through the Constitution amendment process can change them.

| Frozen Element | Principle |
|---|---|
| Customer intent precedes products in every journey | 1 |
| Engineering reasoning precedes commercial content | 2 |
| Products appear only as conclusions, never as starting points | 3 |
| Every page answers a single engineering question | 4 |
| Customer-facing URLs use natural language, not entity identifiers | 5 |
| Navigation is derived from Knowledge Graph relationships | 6 |
| Recommendations include all 6 required justification elements | 7 |
| Commercial actions appear only after engineering trust is established | 8 |
| Customer language is technical, not commercial | 9 |
| Engineering content flows exclusively from Vault → Graph → Services → Experience | 10 |
| The 10-point page architecture ordering | Architecture |
| The trust sequence (sections 01–06 precede section 07) | Architecture |
| Customer questions always translated into governed engineering knowledge before recommendations | 11 |
| Customer never encounters internal entity identifiers, graph terminology, or system architecture | 11 |
| All six customer interaction surfaces (pages, search, journeys, AI, recommendations, consultations) begin with customer language | 11 |
| The translation contract is preserved independent of underlying technical implementation | 11 |
| The platform never fabricates engineering certainty | 12 |
| A correct refusal is superior to an incorrect recommendation | 12 |
| No engineering recommendation bypasses the Engineering Decision Engine | 13 |
| The AI Reasoning Engine does not grant its own authorization | 13 |
| The platform may reason only after it has earned the right to reason | 13 |

---

## Separation of Concerns

| Layer | What it governs | Who may change it | EDR required |
|---|---|---|---|
| **Engineering Foundation** | Vault registry, Knowledge Graph schema, Engineering Services API | Technical architects | Yes, always |
| **Experience Principles** | This document — customer interaction rules | Constitution amendment process only | Full amendment process |
| **Visual Design** | Typography, colour, spacing, motion | Design team | No |
| **UX Implementation** | Component library, interactions, responsiveness | Engineering team | No |
| **Journey Implementations** | Specific customer journey flows | Product team | If principles affected |
| **Page Content** | New 10-point pages, new cross-links | Engineering team | No |

**The critical distinction:**

The Engineering Foundation governs what is true about industrial filtration.
The Experience Principles govern how that truth is communicated to customers.
Visual Design and UX Implementation govern how the communication looks and feels.

A visual redesign cannot alter Experience Principles.
A UX improvement cannot alter Engineering Foundation.
An Experience Principle change cannot alter Engineering Foundation truth.

These layers are independent. Governance violations occur when changes
in one layer are treated as if they belong to another.

---

## Compliance Checklist

For every new page, journey, AI assistant, or navigation pattern:

**Principle 1 — Customer Intent Before Products**
- [ ] First customer-facing content is about their situation, not products

**Principle 2 — Engineering Before Commerce**
- [ ] Engineering explanation precedes every recommendation

**Principle 3 — Products Are Conclusions**
- [ ] Products appear in section 07 or later in every experience

**Principle 4 — Every Page Answers One Engineering Question**
- [ ] The engineering question is stated or implied in the H1 heading

**Principle 5 — URLs Represent Customer Language**
- [ ] URL contains no entity identifiers (CONT-*, TECH-*, FM-*, EP-*, STD-*)

**Principle 6 — Engineering Relationships Drive Navigation**
- [ ] Related Topics section derives links from Knowledge Graph edges

**Principle 7 — Explain Every Recommendation**
- [ ] All 6 recommendation elements present (justification, principles, technology, standards, confidence, memory)

**Principle 8 — Trust Before Conversion**
- [ ] No commercial CTA visible before section 07

**Principle 9 — Engineering Conversations**
- [ ] Language is technical, specific, and quantified — not commercial or promotional

**Principle 10 — Single Source of Engineering Truth**
- [ ] No hardcoded engineering knowledge in page component
- [ ] All engineering content routed through Engineering Services

**Principle 11 — Customer Questions Drive Engineering Knowledge**
- [ ] The customer interaction begins with a question, symptom, risk, or objective in customer language
- [ ] No internal entity identifiers, graph terminology, or system architecture terms appear in any customer-facing surface
- [ ] The engineering answer is expressed in customer language (engineering domain terms permitted; internal platform identifiers prohibited)
- [ ] The engineering question the surface answers can be stated in one sentence without referencing an internal identifier
- [ ] This applies across all six surfaces: generated page, search, journey step, AI response, recommendation, consultation

**Principle 12 — Engineering Humility**
- [ ] No conclusion is presented at a higher confidence level than the evidence supports
- [ ] Any PROHIBITED or UNKNOWN state produces an explicit statement that reasoning cannot proceed
- [ ] No hedging language obscures the actual evidence state
- [ ] Every recommendation disclosure is complete — no inference is hidden

**Principle 13 — Decision Authority**
- [ ] The Engineering Decision Engine evaluation has been completed before any recommendation is rendered
- [ ] No recommendation surface bypasses the Decision Engine
- [ ] Products are not recommended without an authorized engineering recommendation preceding them

**Architecture**
- [ ] 10-point section structure present and in correct order

---

## Amendment Process

This document may not be amended by engineering decision alone.

Amendments require:

1. **Proposal** — Written description of the amendment with justification
2. **Principle impact analysis** — Assessment of which principles are affected and how
3. **Constitutional review** — Confirmation the amendment does not conflict with the ELIMFILTERS_CORPORATE_CONSTITUTION
4. **Ratification** — Formal approval at the authority level that ratified this document
5. **Version increment** — New version number, ratification date, and amendment log entry
6. **Vault update** — Updated file committed with full audit trail

Minor amendments (clarifications that do not alter principle scope) increment the minor version.
Major amendments (changes to principle scope or the 10-point architecture) require full constitutional review.

---

## Relation to the Corporate Constitution

The ELIMFILTERS® Corporate Constitution (Supreme v1.0) establishes in Section 2:

> ELIMFILTERS® protects industrial and commercial assets through contamination control engineering.

And in its commercial principles:

> The customer's engineering problem is always the starting point.
> Engineering credibility precedes commercial intent.

These Engineering Experience Principles are the operational implementation of those constitutional provisions in the customer-facing platform. They do not extend or modify the Constitution. They implement it.

Any conflict between these principles and the Corporate Constitution is resolved in favour of the Corporate Constitution.

---

## Citation Reference

```
CANONICAL GOVERNANCE BLOCK: Engineering Experience Principles

DOCUMENT
Engineering Experience Principles v1.0

STATUS
FROZEN — Constitutional reference for all customer-facing Engineering Intelligence experiences.

GOVERNING AUTHORITY
Subordinate to ELIMFILTERS_CORPORATE_CONSTITUTION (Supreme v1.0).
Supersedes all journey-level, page-level, and component-level design decisions
within the Engineering Intelligence Platform.

SCOPE
All customer-facing interfaces, journeys, pages, AI assistants, recommendation
engines, and navigation structures produced for the ELIMFILTERS® Engineering
Intelligence Platform.

THIRTEEN PRINCIPLES (FROZEN)
01: Customer Intent Before Products
02: Engineering Before Commerce
03: Products Are Conclusions
04: Every Page Answers One Engineering Question
05: URLs Represent Customer Language
06: Engineering Relationships Drive Navigation
07: Explain Every Recommendation
08: Trust Before Conversion
09: Engineering Conversations
10: Single Source of Engineering Truth
11: Customer Questions Drive Engineering Knowledge
12: Engineering Humility
13: Decision Authority

ARCHITECTURE
10-point page structure required on all topic pages.
Trust sequence (01–06) must precede commercial content (07).
This ordering is non-negotiable and permanently frozen.

AMENDMENT RULE
EDR required for deviations. Full constitutional amendment process required
for changes to frozen elements. Visual design and UX implementation layers
may evolve without EDR.

CITATION_REFERENCE
source: elimfilters-vault/corporate/ENGINEERING_EXPERIENCE_PRINCIPLES.md
document: Engineering Experience Principles
version: 1.3
ratified: 2026-07-01
amended: 2026-07-02 (A3 — Principles 12 and 13 added)
status: FROZEN
```

---

*ELIMFILTERS® Engineering Experience Principles v1.3*
*Ratified: 2026-07-01 | Amended: 2026-07-02 (A3 — Principles 12 and 13 added: Engineering Humility, Decision Authority)*
*Status: FROZEN — Constitutional Reference*
*Authority: Subordinate only to ELIMFILTERS_CORPORATE_CONSTITUTION (Supreme v1.0)*
