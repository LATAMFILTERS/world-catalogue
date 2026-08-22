# ELIMFILTERS SEO/GEO Authority Standard

Version: 1.0
Status: Draft operating standard
Scope: Public indexable ELIMFILTERS pages

## Objective

Every public indexable ELIMFILTERS page must be understandable as a distinct, authoritative entity by both search engines and AI answer systems. The standard is intended to prevent thin pages, intent overlap, weak entity signals, poor internal linking, duplicate metadata, and technically valid pages that still lack sufficient topical authority.

A page is considered at target level only when it satisfies its page-type intent, technical SEO requirements, semantic/entity requirements, evidence governance, internal relationship requirements, and minimum content depth appropriate to the query intent.

## Authority score

Every page is scored out of 100 points.

- 90–100: Authority-ready. Eligible for priority indexing and internal promotion.
- 80–89: Strong but incomplete. Publishable, but must enter improvement queue.
- 70–79: Below target. Existing indexed pages may remain live but require remediation.
- Below 70: Not authority-ready. New pages should not be published/indexed at this level unless explicitly approved.

Target for strategic pages: 90+.
Minimum publication threshold for new indexable pages: 80.

## Scoring model

### 1. Search intent ownership — 15 points

The page must own one primary search intent.

Requirements:
- One explicit primary intent.
- Primary intent must be different from nearby pages.
- Title, H1, opening answer, body structure, schema and internal anchors must reinforce the same intent.
- Secondary topics may support the page but must not create a competing primary intent.
- Glossary, Engineering Reference, Diagram, Standard, Industry, System, Technology, Family and Product pages must not be interchangeable.

Automatic failure conditions:
- Two indexable pages are intentionally targeting the same primary intent without a canonical/consolidation strategy.
- Title/H1/body/schema describe materially different intents.

### 2. Technical SEO integrity — 15 points

Requirements:
- HTTP 200 for intended indexable page.
- Exactly one canonical URL.
- Canonical is normalized to ELIMFILTERS URL policy, including trailing slash where applicable.
- No accidental noindex.
- No duplicate slash/non-slash internal route variants emitted by the site.
- Valid title and meta description.
- Exactly one H1.
- Included in the correct sitemap when indexable.
- No legacy URL should resolve as an avoidable 404 when a direct successor exists.

Target title guidance:
- Prefer roughly 45–65 visible characters when possible.
- Do not duplicate the ELIMFILTERS brand through both local metadata and the global title template.

Target meta guidance:
- Prefer roughly 120–160 characters.
- State the page purpose and technical value without generic marketing filler.

### 3. Direct-answer / GEO readiness — 15 points

The page must contain a concise answerable opening block that an AI system can extract without reconstructing the whole page.

Requirements:
- First substantive section answers the page's primary question or defines its subject directly.
- Answer normally appears within the first 150–250 words.
- Uses complete factual statements rather than slogan-only copy.
- Defines important terminology before using highly specialized language.
- Where appropriate, includes structured facts, steps, criteria, comparisons or relationships that can be cited independently.
- Avoids unsupported superlatives and unsupported numerical claims.

### 4. Topical depth — 15 points

Depth is measured by coverage, not word count alone.

The page should explain the subject sufficiently for its page type.

Typical strategic-page coverage:
- What it is / what problem it addresses.
- Where it applies.
- Relevant contaminants, failure mechanisms or operating conditions.
- Protected assets/components.
- Relevant protection systems.
- Technical selection or interpretation criteria.
- Operational implications.
- Related standards, technologies, problems and supporting knowledge where relevant.

Indicative depth ranges, not hard quotas:
- Glossary: 250–600 words when the concept is simple; more when technically necessary.
- Standard reference: 600–1,500+ words depending on scope.
- Engineering reference/article: 1,000–2,500+ words when warranted.
- Industry authority page: normally 900–1,800+ words of genuinely industry-specific content.
- System/technology authority page: normally 800–1,800+ words when warranted.
- Hub/collection page: enough original explanatory content to establish purpose and relationships, not only a card grid.

A longer page does not score higher if the text is repetitive or generic.

### 5. Entity and semantic graph — 15 points

Requirements:
- The page clearly identifies its principal entity/topic.
- Schema type matches page function.
- Stable @id and URL relationships are used where applicable.
- isPartOf / publisher / about / hasPart / breadcrumb relationships are used when semantically appropriate.
- Relevant internal entities are explicitly linked: Industry ↔ System ↔ Technology ↔ Problem ↔ Standard ↔ Family/Product.
- Entity naming must follow the current ELIMFILTERS taxonomy.
- Structured data must describe visible page content; schema must not invent content or claims.

### 6. Internal linking and knowledge relationships — 10 points

Requirements:
- Page is not an orphan.
- Incoming links exist from at least one relevant hub or parent context.
- Outgoing links lead to the next logical technical layer.
- Anchor text describes the destination meaningfully.
- Links follow canonical routes.
- Strategic pages should normally connect to 4–10 genuinely relevant internal resources when the subject supports them.

Industry-page relationship model:
Industry → operating conditions → contamination/failure risks → protection systems → technologies → product families → supporting engineering/standards.

### 7. Evidence and claim governance — 10 points

Requirements:
- Technical claims must be supportable by validated ELIMFILTERS knowledge or approved evidence.
- Public pages must not present proprietary third-party claims as ELIMFILTERS facts.
- Competitor names/technologies are not used in ELIMFILTERS-facing authority copy except where explicitly approved for a necessary neutral context.
- Numerical performance claims require evidence and appropriate context.
- If evidence is insufficient, use qualitative technical language rather than fabricated precision.

### 8. User usefulness and conversion path — 5 points

Requirements:
- A technical reader can determine what to do next.
- CTA matches intent: learn, compare, identify application, search a part, contact support, or apply as a distributor.
- Commercial CTA does not overwhelm informational intent.
- Page is readable by engineers, fleet managers, maintenance professionals and decision-makers without reducing the technical level to generic marketing language.

## Page-type ownership rules

### Industry
Primary intent: how asset protection/filtration applies to a specific operating industry.
Must be industry-specific, not a system page with the industry name swapped in.

### System
Primary intent: how a protection system works, what it protects, and how it is selected/applied.

### Technology
Primary intent: technical principle and role of an ELIMFILTERS technology within one or more protection systems.

### Product family
Primary intent: organize and explain a coherent product family by system role, duty class, selection logic and application context.

### Knowledge Center hub
Primary intent: navigate and explain the knowledge architecture. It must add explanatory value beyond a directory of cards.

### Glossary
Primary intent: definition — “what does X mean?”

### Engineering Reference / Engineering Article
Primary intent: technical interpretation, design, application, diagnosis or implementation.

### Diagram
Primary intent: visual/functional explanation or chart interpretation.

### Standard
Primary intent: neutral reference to the scope, purpose, terminology and technical relevance of a standard.

### Comparison
Primary intent: explain meaningful differences, selection implications and contexts between two methods/concepts.

## Industry Authority Page minimum structure

Every strategic industry page should normally contain:

1. Direct answer / industry protection summary.
2. Operating environment and duty profile.
3. Critical asset groups.
4. Primary contamination and degradation mechanisms.
5. Protection-system map.
6. System-specific application sections: air, fuel, lubrication, hydraulic and cooling when applicable.
7. Selection/engineering considerations.
8. Maintenance and reliability implications.
9. Related standards and technical knowledge.
10. Related ELIMFILTERS systems/technologies/families.
11. Appropriate application-support CTA.

Not every industry must force all five systems. Only relevant relationships should be published.

## GSC prioritization overlay

Authority score determines quality. GSC determines remediation order.

Priority increases when a page has:
- meaningful impressions;
- zero or weak clicks;
- ranking between approximately positions 10–80 where improvement is plausible;
- clear non-branded technical query demand;
- high commercial or strategic relevance;
- thin or incomplete authority coverage;
- avoidable technical defects such as 404s or metadata duplication.

Pages with no current GSC demand are not ignored, but they are normally improved after pages where Google is already testing the site for relevant queries.

## GEO-specific acceptance criteria

A strategic page is GEO-ready when:
- the subject can be summarized accurately from the opening answer;
- key relationships are stated explicitly, not implied only through navigation;
- important technical statements are self-contained and context-rich;
- schema reinforces rather than contradicts visible content;
- the page provides enough distinctive information to be useful as a source;
- entity names and URLs are stable;
- related concepts are internally linked through a coherent knowledge graph;
- factual claims can be traced internally to governed evidence.

## Automation / validator targets

The following checks should progressively become automated:

- canonical normalization;
- HTTP/indexability status;
- sitemap inclusion;
- title duplication and length warnings;
- meta-description length warnings;
- H1 count;
- minimum direct-answer presence;
- schema presence/type/@id normalization;
- internal canonical link normalization;
- orphan-page detection;
- word-count/depth warning by page type;
- prohibited legacy paths;
- competing primary-intent detection;
- GSC impression/click/position overlay;
- authority score generation.

## Rollout order

1. Establish this standard.
2. Implement an automated Authority Audit scorecard.
3. Score all strategic public pages.
4. Remediate highest-value gaps using GSC demand and business relevance.
5. Apply the publication threshold to newly generated or substantially revised pages.
6. Re-score after each deployment and monitor GSC after recrawl.

## Initial operating target

The immediate objective is not to make every page identical to Mining. It is to bring every page to the same quality threshold while preserving distinct intent and subject matter.

Strategic target: 90/100 or higher.
New indexable page minimum: 80/100.
Any critical technical defect (404, invalid canonical, unintended noindex, material intent collision) overrides the numerical score and blocks Authority-ready status.
