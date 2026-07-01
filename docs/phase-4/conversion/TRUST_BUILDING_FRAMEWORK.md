# TRUST BUILDING FRAMEWORK
## ELIMFILTERS Engineering Intelligence Platform — Phase 4

---

## 1. What Trust Means in Industrial B2B

In consumer e-commerce, trust is built quickly: reviews, brand recognition, secure checkout.

In industrial B2B, trust is built slowly and lost immediately. A maintenance manager
or fleet operator who selects a filtration system is staking their professional
reputation on that decision. If the equipment fails, they are accountable.

**The trust requirement is not about the filter. It is about the decision that can be defended.**

The platform must help customers build a defensible engineering case, not just a product preference.

---

## 2. The Seven Trust Signals

These are the signals that build trust in an industrial engineering context.
Each signal must appear on the platform in the correct sequence.

### T-1: Problem Recognition
**Signal:** "This platform understands what I'm dealing with."

The visitor must see their operational reality described accurately.
Not in marketing language. In operational and engineering language.

Examples of correct problem framing:
- "Filter blinding in high-dust environments reduces engine volumetric efficiency by 8–12% before bypass threshold is reached."
- "Water accumulation above 0.05% in diesel fuel initiates microbial growth within 72 hours at temperatures above 15°C."
- "Hydraulic particle contamination above ISO 20/18/15 reduces proportional valve service life from 8,000 hours to under 2,000 hours."

**Platform implementation:** ProblemExplorer, FailureModeCard, ContaminationCard — all rendering exact graph node properties, never marketing summaries.

**Trust earned:** Recognition. "These people have seen this problem before."

---

### T-2: Mechanism Explanation
**Signal:** "This platform explains WHY it happens, not just THAT it happens."

The cause chain must be visible and technically accurate.

Structure: `[Root cause] → [Physical mechanism] → [Measurable degradation] → [Failure consequence]`

Example (FM-HYD-001):
```
Particle contamination (ISO class 20/18/15)
→ Hard particles enter valve clearances (5–10µm gap)
→ Surface scoring of valve spool
→ Increased leakage → pressure loss → response time degradation
→ Proportional valve replacement: $800–$4,000 per unit
```

**Platform implementation:** FailureModeCard expanded view — causeChain rendered as numbered steps, not prose.

**Trust earned:** Competence. "These people know the engineering, not just the product."

---

### T-3: Scientific Grounding
**Signal:** "This explanation is traceable to established standards."

Every engineering claim must reference an applicable standard.
The standard code must be visible. The scope of the standard must be explained.
The relevance to the specific claim must be stated.

Example:
```
"ISO 16889 defines Beta ratio (βx) as the ratio of particles upstream
to downstream of a filter at size x µm. A filter rated β10(c) = 200
removes 99.5% of particles ≥ 10µm under multi-pass test conditions."
```

**Platform implementation:** CitationPanel (compact) on every engineering claim.
StandardCard renders issuingBody, scope, and relevance.

**Trust earned:** Evidence. "This is not opinion. This is established engineering."

---

### T-4: Technology Architecture
**Signal:** "The solution is engineering, not product substitution."

The platform must explain the technology behind the product before
presenting the product. The visitor must understand what physical
mechanism is being applied, not just which SKU to order.

Example:
```
MACROCORE Technology:
"Multi-layer macro-fiber depth media engineered for high-dust air intake
environments. The macro-fiber structure creates progressive density gradients
that capture particles at different depth layers, extending service life
compared to surface-loading media while maintaining volumetric efficiency."
```

Only after this is understood does the product (EA10695) appear.

**Platform implementation:** TechnologyCard (full mode). Technology pages
generated from TECHNOLOGY_ARCHITECTURE nodes. Never replaced with product spec sheets.

**Trust earned:** Architecture conviction. "I understand what I'm buying and why."

---

### T-5: Field Validation
**Signal:** "This is not theoretical. This has been observed in the field."

Engineering Memory nodes record field observations, design decisions,
and lessons learned. These are the most powerful trust signal because
they demonstrate that the knowledge is operational, not academic.

Example (hypothetical Engineering Memory):
```
ENGINEERING MEMORY — TECH-NANOFORCE
"Field observation: In hydraulic presses operating at 350 bar with
bi-directional flow, standard β10(c) = 75 media showed accelerated
blinding due to back-flush particle redistribution. NANOFORCE media
was engineered with asymmetric fiber orientation to resist reverse-flow
particle migration. Validated in field trial: 40% extension of service interval."
```

**Platform implementation:** EngineeringMemoryPanel — rendered when HAS_MEMORY
relationships exist on an entity. Distinct visual treatment (bordered, monospace).

**Trust earned:** Field proof. "This knowledge comes from real situations, not a datasheet."

---

### T-6: Traceable Recommendations
**Signal:** "The recommendation is not a guess. I can see exactly how it was derived."

A recommendation that cannot be explained is a risk to the customer.
If they cannot defend the recommendation to their team or manager,
they will not act on it.

Every recommendation must show:
- The starting entity (problem or asset)
- The relationship path through the graph
- The confidence level and why
- The standards it satisfies
- The citations supporting each step

**Platform implementation:** RecommendationPanel with full RecommendationStep[] trace
and EngineeringReasoningChain visual.

**Trust earned:** Defensible conviction. "I can present this recommendation with evidence."

---

### T-7: Institutional Credibility
**Signal:** "ELIMFILTERS has the expertise to back this up."

This signal appears last, not first. Institutional credibility claimed
before trust is earned reads as marketing. Institutional credibility
earned through the preceding six signals reads as validation.

Elements:
- Provenance panel (governanceStatus, sourceRegistry, EDR references)
- Number of engineering entities in the Knowledge Graph
- Standards referenced (ISO, SAE, ASTM, NFPA — specific codes, not generic claims)
- Industries and equipment types covered

**Platform implementation:** ProvenancePanel. Knowledge Graph summary in platform footer.
"94 engineering entities. 185 knowledge relationships. 12 technology architectures.
12 engineering principles. All traceable to source."

**Trust earned:** Authority. "These people have invested in systematic engineering knowledge."

---

## 3. Trust Sequence

The seven signals must appear in this order. No signal should be skipped.
No signal should appear before its predecessor.

```
T-1  Problem Recognition      ← first contact, immediate
T-2  Mechanism Explanation    ← after problem confirmed
T-3  Scientific Grounding     ← alongside mechanism (inline citations)
T-4  Technology Architecture  ← after mechanism understood
T-5  Field Validation         ← alongside technology (memory panel)
T-6  Traceable Recommendations ← after technology understood
T-7  Institutional Credibility ← after recommendation received
```

Products appear after T-6. CTAs (consultation, quote, lead) appear after T-7.

---

## 4. Trust Destroyers

These destroy trust instantly and must never appear on the platform:

| Trust Destroyer | Why |
|---|---|
| "Industry-leading technology" | Unverifiable marketing claim |
| "99.9% efficiency" without ISO reference | Meaningless without test method |
| "Best in class" | Comparative without evidence |
| Recommendation without reasoning | Feels arbitrary, not engineered |
| Marketing adjectives in engineering context | Signals lack of substance |
| Incorrect technology-system mappings | Demonstrates ignorance |
| Fabricated performance numbers | Destroys all credibility immediately |
| Unexplained engineering claims | Cannot be verified or defended |

The AI Citation Layer audit (documented in CLAUDE.md) identified and corrected
fabricated performance claims in translations. This framework prohibits recurrence.

---

## 5. Trust Recovery

When a visitor leaves without converting, the trust gap was in one of these places:

1. Problem not recognized (T-1 failed) → Improve problem vocabulary in ProblemExplorer
2. Explanation too generic (T-2 failed) → Review causeChain quality in failure mode nodes
3. No standards cited (T-3 failed) → Audit CitationPanel coverage
4. Technology not explained (T-4 failed) → Improve TechnologyCard full-mode content
5. No field validation (T-5 failed) → Add Engineering Memory to relevant nodes (registry work)
6. Recommendation unexplained (T-6 failed) → Never ship unexplained recommendations
7. No institutional signal (T-7 failed) → Ensure ProvenancePanel visible on all entity pages

**Trust recovery is primarily a Knowledge Graph improvement, not a UI improvement.**
The platform renders what the graph contains. If the content is weak, the graph is incomplete.
