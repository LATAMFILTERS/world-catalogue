# MASTER_IMPLEMENTATION_ROADMAP.md
## ELIMFILTERS® World Catalogue — Complete Implementation Roadmap

**Date**: 2026-06-02  
**Based on**: ECOSYSTEM_AUDIT.md · DEMAND_INTERCEPTION_LAYER.md · SEMANTIC_RANKING_LAYER.md · EXECUTION_BLUEPRINT_PHASE1_MAPPING.md · EXECUTION_BLUEPRINT_PHASE2_DOMAINS.md · CLAUDE.md Knowledge System Architecture  
**Note**: AI_ECOSYSTEM_BLUEPRINT.md does not exist in the repository. This roadmap consolidates all five existing strategy documents into a unified execution plan.

---

## QUICK WINS — Immediate Value, Low Effort

These items unblock other work or fix broken functionality with minimal risk.

| Item | Effort | Impact | Blocks |
|------|--------|--------|--------|
| Configure `DATABASE_URL` environment variable | 30 min | Restores `/api/search` | Phase 5 |
| Configure `GODADDY_MAIL_PASS` environment variable | 30 min | Restores contact form | Customer acquisition |
| Load Barlow Condensed font in `layout.tsx` | 15 min | Fixes footer typography | Brand consistency |
| Fix `NANOFORCE_HYDRAULIC` undefined in `knowledge-architecture.ts` | 15 min | Eliminates runtime error | Phase 4 |
| Add `type-check` script to `package.json` | 10 min | Enables CI type safety | All phases |
| Add `rel=canonical` to both TCO pages | 20 min | Prevents SEO penalty | Search authority |
| Add About, Warranty, Distributor links to Navigation | 30 min | Fixes orphan pages | UX completeness |
| Wire `trackKnowledgePageView()` to Knowledge System pages | 2 hrs | Activates semantic analytics | Phase 9 |

---

## HIGH IMPACT ITEMS — Disproportionate Return on Effort

| Item | Phase | Why High Impact |
|------|-------|----------------|
| Unified data layer (Single Source of Truth) | Phase 2 | Eliminates 4 parallel registries; all future content derives from one schema |
| Complete RetrievalBlock + AI Citation Layer on 26 pages | Phase 4 | Makes entire knowledge system machine-readable; enables AI citations |
| Demand Interception middleware (3 intent types) | Phase 4 | Converts search traffic into qualified knowledge engagement |
| Knowledge Graph API endpoint | Phase 4 | Enables LLM traversal of entire filtration knowledge network |
| Part Search in-app widget + industry filters | Phase 5 | Closes the gap between knowledge and commerce |
| Failure Analysis Center (contamination hub + matrix) | Phase 6 | Captures problem-intent traffic (20-30% of searches) |

---

## CRITICAL BLOCKERS — Must Resolve Before Dependent Phases

| Blocker | Affects | Resolution |
|---------|---------|-----------|
| `DATABASE_URL` not configured | Phase 5 Part Search backend, analytics stats | Environment variable injection |
| `knowledge-architecture.ts` has 6 technologies (catalogue has 12) | Phase 2, Phase 4 | Must unify before any content phase |
| `NANOFORCE_HYDRAULIC` undefined reference | Phase 4 query functions | Fix or remove the dangling reference |
| 26 Knowledge System pages lack RetrievalBlock | Phase 9 AI Citation Index | Must complete Phase 4 before Phase 9 |
| No Next.js middleware exists | Phase 4 Demand Interception | Middleware must be built before intent routing |
| PostHog SDK not loaded | Phase 9 behavioral analytics | SDK initialization required for intent data |

---

## PHASE 1 — Architecture Stabilization

### Objective

Eliminate all broken functionality, naming conflicts, and missing infrastructure before any content or feature work begins. Establish a clean, reliable baseline that every subsequent phase can build on without inheriting technical debt.

### Tasks

**1.1 — Fix Broken Backend Services**
- Inject `DATABASE_URL` (PostgreSQL on Railway) into the deployment environment
- Inject `GODADDY_MAIL_PASS` + `SMTP_USER` + `SMTP_HOST` + `SMTP_PORT` into the deployment environment
- Verify `/api/search?q=air` returns HTTP 200 with results
- Verify `POST /api/contact` delivers email to `info@elimfilters.com`
- Verify `/api/stats` returns HTTP 200 with current data

**1.2 — Fix Typography Regression**
- Add `Barlow` and `Barlow Condensed` to the `next/font/google` imports in `layout.tsx`
- Register the CSS variables `--font-barlow` and `--font-barlow-condensed`
- Update `Footer.tsx` to reference the CSS variables instead of bare font-family strings

**1.3 — Fix Knowledge Architecture Data Error**
- Remove `'NANOFORCE_HYDRAULIC'` from `INDUSTRIES.CONSTRUCTION.applicableTechnologies` in `knowledge-architecture.ts`
- Replace with the correct technology key that handles hydraulic contamination for construction (either `NANOFORCE` or leave for Phase 2 unification)
- Verify `getTechnologyByIndustry('CONSTRUCTION')` returns no undefined entries

**1.4 — Fix SEO Canonical Conflict**
- Add `<link rel="canonical" href="https://elimfilters.com/knowledge-system/fleet/total-cost-ownership/" />` to the fleet TCO page layout
- Add `<link rel="canonical" href="https://elimfilters.com/knowledge-system/compare/total-cost-ownership/" />` to the compare TCO page layout
- Update sitemap.xml to reflect the canonical differentiation

**1.5 — Fix Navigation Orphan Pages**
- Add `/about` link to the main `Navigation.tsx` desktop menu and mobile menu
- Add `/warranty` link to the Footer's "Support" column (already has `/contact` and `/distributor-application`)
- Verify all nav links resolve to 200 responses

**1.6 — Establish Developer Tooling**
- Add `"type-check": "tsc --noEmit"` to `package.json` scripts
- Remove `tailwindcss` and `autoprefixer` from devDependencies (unused, confirmed by audit)
- Remove `tailwind.config.ts` and `postcss.config.js` if no CSS module usage is found
- Add a `"verify": "npm run type-check && npm run lint && npm run build"` composite script

**1.7 — Extract SpotlightCard Component**
- Extract the `SpotlightCard` implementation from `app/page.tsx` into `components/SpotlightCard.tsx`
- Update `app/page.tsx` to import from the new location
- No behavioral changes — purely structural

### Dependencies

- None. Phase 1 has no upstream requirements.

### Risks

- `DATABASE_URL` credentials may require re-provisioning from Railway if the current connection string has expired (HEALTH_REPORT confirmed timeout to `66.33.22.248:18263`)
- Removing Tailwind is safe only if confirmed no `.tsx` file uses Tailwind class names — run `grep -r "className=" frontend/src` before removal
- Barlow font addition adds a small network request; confirm it is served via the existing Google Fonts connection preload in `layout.tsx`

### Estimated Effort

| Task | Effort |
|------|--------|
| Fix backend services (env vars) | 1–2 hours |
| Fix typography | 1 hour |
| Fix knowledge architecture error | 30 minutes |
| Fix SEO canonical | 30 minutes |
| Fix navigation | 1 hour |
| Developer tooling | 1 hour |
| Extract SpotlightCard | 1 hour |
| **Total** | **6–8 hours** |

### Success Criteria

- [ ] `/api/search?q=filter` returns structured results (HTTP 200)
- [ ] Contact form delivers email to `info@elimfilters.com`
- [ ] Footer renders in Barlow/Barlow Condensed typefaces
- [ ] `getTechnologyByIndustry('CONSTRUCTION')` returns array with no `undefined` entries
- [ ] Both TCO pages have distinct canonical tags
- [ ] `npm run type-check` exits with 0 errors
- [ ] `About` page reachable from main navigation

---

## PHASE 2 — Single Source of Truth

### Objective

Eliminate the four parallel, unsynchronized data registries (knowledge-architecture.ts, catalogue.json, techPagesData.ts, GEO_DEFINITIONS). Establish a single TypeScript schema that is the authoritative source for all technologies, industries, standards, and contamination data across the entire application. All pages derive their content from this schema — no hardcoded local arrays for catalogue data.

### Tasks

**2.1 — Audit All Existing Data Sources**
- Map every unique field used across: `knowledge-architecture.ts`, `catalogue.json` (industries, products, technologies), `techPagesData.ts`, and `GEO_DEFINITIONS` in `technologies/page.tsx`
- Document the field differences (e.g., `catalogue.json` has `features[]`, `benefits[]`, `stats`, `cta`; `knowledge-architecture.ts` has `relatedStandards[]`, `addressesContamination[]`, `keyMetrics`)
- Identify which fields are page-rendering fields vs. relational/graph fields vs. AI-definition fields

**2.2 — Design the Unified Schema**
- Design a master TypeScript interface that unifies all fields from all four sources into one type definition per entity class:
  - `UnifiedTechnology` — combines catalogue tech entry + knowledge-architecture tech entry + GEO_DEFINITIONS prose + techPagesData content
  - `UnifiedIndustry` — combines catalogue industry + knowledge-architecture industry (adds the 5 missing: Bus & Coach, Railway, Trucks & Fleets, Oil & Gas, Waste Municipal)
  - `UnifiedStandard` — knowledge-architecture standard + additional standards referenced in content (SAE J1539, ASTM D6304, NFPA T2.14, DIN 51524, ISO 8573-1, ISO 11155, ISO 12937)
  - `UnifiedContaminationMode` — existing contamination_modes + preparation for Phase 6 expansion
  - `UnifiedProduct` — catalogue products (systems), unchanged but typed

**2.3 — Migrate All 12 Technologies**
- For each, populate: `relatedStandards[]`, `addressesContamination[]`, `applicableIndustries[]`, `keyMetrics{}`, `description`, plus the GEO prose definition
- Verify all 12 technology slugs match `getTechLogoFile()` mappings exactly

**2.4 — Migrate All 12 Industries**
- Add the 5 missing industries to `knowledge-architecture.ts`: BUS_COACH, RAILWAY, TRUCKS_FLEETS, OIL_GAS, WASTE_MUNICIPAL
- For each, define: `contaminationExposure`, `primaryEquipment[]`, `relevantContamination[]`, `applicableTechnologies[]`, `applicableStandards[]`, `operatingConditions{}`

**2.5 — Migrate All Referenced Standards**
- Add to `knowledge-architecture.ts` STANDARDS: SAE_J1539, ASTM_D6304, NFPA_T214 (already present), DIN_51524, ISO_8573_1, ISO_11155, ISO_12937
- For each: `code`, `name`, `description`, `slug`, `applicableTo[]`, `relevantIndustries[]`, `relatedContamination[]`, `criticality`

**2.6 — Create the Unified Data Module**
- Create `/frontend/src/lib/unified-data.ts` that re-exports the single source of truth
- Create migration helper functions that transform unified data into the shape expected by existing page components
- Deprecate the direct catalogue.json import pattern — route all data through `unified-data.ts`

**2.7 — Verify All Pages Render Without Changes**
- Run `npm run build` and confirm 0 errors
- Verify technologies hub still shows 9 grid cards (display subset, not a data problem)
- Verify all dynamic routes (`/industries/[slug]`, `/systems/[slug]`, `/technologies/[slug]`) resolve correctly

### Dependencies

- Phase 1 must be complete (font loading, NANOFORCE_HYDRAULIC fix needed before data migration)

### Risks

- **Data loss risk**: Migrating catalogue.json data into TypeScript loses the hot-reloadable JSON format. If non-developer team members edit catalogue.json directly, they lose that ability. Mitigation: keep catalogue.json as the canonical source for product/system data; only extend knowledge-architecture.ts for the relational/AI layer.
- **Type collision risk**: `CatalogueItem` in `catalogue.ts` and knowledge-architecture types have overlapping but inconsistent fields. The migration interface must account for every existing field consumer.
- **Breaking change risk**: Any page that imports directly from `catalogue.json` or uses `knowledge-architecture.ts` query functions must be audited. At least 8 pages import from catalogue; all must be verified after migration.

### Estimated Effort

| Task | Effort |
|------|--------|
| Data source audit | 2 hours |
| Schema design | 3 hours |
| Technology migration (12) | 4 hours |
| Industry migration (12) | 3 hours |
| Standards migration (13) | 3 hours |
| Unified data module + helpers | 3 hours |
| Build verification | 2 hours |
| **Total** | **20–22 hours** |

### Success Criteria

- [ ] Single import (`unified-data.ts`) provides all technology, industry, standard, and contamination data
- [ ] `getTechnologyByIndustry('RAILWAY')` returns valid technology array (currently fails — industry missing)
- [ ] All 12 technologies appear in `TECHNOLOGIES` record with complete relational data
- [ ] All 12 industries appear in `INDUSTRIES` record with correct contamination exposure
- [ ] All 13 standards appear in `STANDARDS` record
- [ ] `npm run build` exits with 0 errors, 0 type errors
- [ ] No page content changes visible to end users

---

## PHASE 3 — Obsidian Integration

### Objective

Transform the unified knowledge graph into an Obsidian-compatible vault that provides a visual, bidirectional, human-navigable knowledge map of the entire ELIMFILTERS® filtration domain. The vault serves as the internal knowledge management layer — editable by subject matter experts in Obsidian, publishable back to the Next.js application via a build step.

### Tasks

**3.1 — Define the Obsidian Vault Architecture**
- Design the vault folder structure:
  ```
  /vault/
    /Technologies/    — One .md per technology (12 files)
    /Standards/       — One .md per standard (13+ files)
    /Industries/      — One .md per industry (12 files)
    /Contamination/   — One .md per contamination mode (3+ files)
    /Products/        — One .md per product system (12 files)
    /Knowledge/       — One .md per Knowledge System page (30+ files)
    /Fleet/           — Fleet optimization strategies
    /Canvas/          — Visual knowledge graph canvases
  ```
- Define the frontmatter schema for each node type (YAML fields: `type`, `domain`, `slug`, `standards[]`, `technologies[]`, `industries[]`, `contamination[]`)

**3.2 — Build the Vault Generator Script**
- Create `/scripts/generate-obsidian-vault.ts` that reads `unified-data.ts` and outputs `.md` files for every node
- For Technologies: generate node file with frontmatter + GEO prose definition + `[[WikiLinks]]` to related standards, contamination modes, industries
- For Standards: generate node file with standard description + `[[WikiLinks]]` to applicable technologies, relevant contamination modes, related system domains
- For Industries: generate node with operating conditions + `[[WikiLinks]]` to applicable technologies, relevant contamination, applicable standards
- For Contamination Modes: generate node with root causes, failure modes, quantified impacts + `[[WikiLinks]]` to resolving technologies, related standards

**3.3 — Build the Obsidian ↔ Next.js Sync Layer**
- Design the "pull from vault" flow: vault frontmatter changes → `scripts/sync-from-vault.ts` → updates unified-data.ts
- Design the "push to vault" flow: unified-data.ts changes → `scripts/generate-obsidian-vault.ts` → regenerates vault files
- Establish which direction is authoritative per node type (unified-data.ts is canonical for structured data; Obsidian is canonical for prose content edits)

**3.4 — Build the Canvas Knowledge Graph**
- Create three Obsidian canvas files:
  - `Technology-to-Contamination.canvas` — shows which technologies address which contamination modes
  - `Standards-by-Domain.canvas` — organizes standards by filtration system domain
  - `Industry-Risk-Map.canvas` — maps industries by contamination exposure severity

**3.5 — Implement Dataview Integration**
- Tag all Knowledge System page `.md` files with the `SEMANTIC_DOMAINS` field from their Retrieval Blocks
- Create Obsidian Dataview queries that auto-generate:
  - Cross-reference tables: "All pages in Hydraulic Efficiency domain"
  - Missing link detection: "Standards referenced in content but without a dedicated page"
  - AI Citation coverage: "Pages with/without Canonical Knowledge Block"

**3.6 — Define the Editorial Workflow**
- Document: how subject matter experts use Obsidian to update prose definitions
- Document: how the sync script transfers approved edits back to the Next.js build
- Document: how to add a new technology, standard, or industry to both systems simultaneously

### Dependencies

- Phase 2 (Single Source of Truth) must be complete — vault generator reads from unified-data.ts
- Node.js/TypeScript tooling established in Phase 1

### Risks

- **Bidirectionality complexity**: If Obsidian edits and code edits happen simultaneously, merge conflicts arise in the sync layer. Mitigation: establish a clear "one direction at a time" editorial policy with git branches for vault edits.
- **Obsidian-specific syntax**: WikiLinks and canvas files use Obsidian-specific formats not native to standard Markdown. The sync layer must parse these formats carefully.
- **Content drift risk**: If prose in the vault diverges from page content in Next.js, users see inconsistent information. The sync script must be part of the CI build process.

### Estimated Effort

| Task | Effort |
|------|--------|
| Vault architecture design | 2 hours |
| Vault generator script | 6 hours |
| Sync layer (bidirectional) | 5 hours |
| Canvas knowledge graphs (3) | 4 hours |
| Dataview queries | 3 hours |
| Editorial workflow documentation | 2 hours |
| **Total** | **22–24 hours** |

### Success Criteria

- [ ] Running `npm run generate:vault` produces complete Obsidian vault from unified-data.ts
- [ ] Every Technology node has `[[WikiLinks]]` to all related Standards, Contamination Modes, and Industries
- [ ] Canvas files open in Obsidian and render the full knowledge graph
- [ ] Dataview query "Pages without AI Citation Layer" returns accurate list
- [ ] Editorial changes made in Obsidian and synced back produce no build errors

---

## PHASE 4 — Knowledge Graph

### Objective

Complete the ELIMFILTERS® Knowledge System to full specification across all 30 pages. Implement the Semantic Ranking Layer (internal linking), AI Citation Layer (Canonical Knowledge Blocks + JSON-LD), and Demand Interception Layer (intent routing) as designed in the three existing strategy documents. Build the two missing hub pages and the seven missing standard definition pages. Activate all semantic analytics.

### Tasks

**4.1 — Complete the 26 Incomplete Knowledge System Pages**  
_(Per EXECUTION_BLUEPRINT_PHASE2_DOMAINS.md — full domain assignments and link targets already mapped)_

For each of the 26 pages, execute in this order:

- **Add RetrievalBlock** with: `SEMANTIC_DOMAINS`, `SYSTEMS_AFFECTED`, `CONCEPT_TAXONOMY`, `RELEVANCE_LEVELS`, `INTERNAL_REFERENCES` (standards, contamination, technologies, fleet), `CITATION_METADATA` (source_uri, concept_id, version 1.0, last_updated)
- **Add 2–3 semantic internal links** in content paragraphs using the link types defined in SEMANTIC_RANKING_LAYER.md: Definition Link (1 max), Failure Mechanism Link (1–2), Standards Link (1), Technology Link (1–2), Operational Impact Link (1–2)
- **Add AI Citation Layer** with Canonical Knowledge Block (DEFINITION, SYSTEMS, FAILURE_IMPACT, RELATED_STANDARDS, RELATED_TECHNOLOGIES, INDUSTRIAL_ROLE, CITATION_REFERENCE) and JSON-LD TechArticle schema with `mentions.standards[]`, `mentions.technologies[]`, `mentions.contaminationModes[]`, and `relatedLink[]`

**Priority sequence for the 26 pages** (highest traffic / most linked-to first):
1. Standards: `lube-oil-systems`, `hydraulic-systems`, `air-intake-systems`, `fuel-systems`, `cabin-safety-systems`, `compressed-air-systems`
2. Standards definitions: `iso-4406`, `iso-16889`, `iso-5011`
3. Contamination: `particle-wear`, `diesel-water`, `hydraulic-system`
4. Fleet: `reducing-downtime`, `total-cost-ownership`, `fuel-efficiency`
5. Compare: `system-vs-commodity`, `evaluation-framework`, `oem-comparison`, `total-cost-ownership`
6. Hubs: main knowledge-system, bridges, standards, contamination, fleet, compare, science

**4.2 — Add Reframing Sections to Bridge Pages**  
_(Per DEMAND_INTERCEPTION_LAYER.md Section 4)_

Add the System-Level Reframing block immediately after the hero section on all 4 Bridge pages:
- `bridges/industrial-filtration` — "Industrial filtration is a contamination control system decision, not a filter brand selection problem"
- `bridges/oem-replacement` — Reframe toward asset protection during warranty period
- `bridges/aftermarket-selection` — Reframe toward contamination control metrics (Beta ratio, ISO codes)
- `bridges/fleet-solutions` — Reframe toward fleet-wide contamination control strategy

**4.3 — Build the Two Missing Hub Pages**  
_(Per DEMAND_INTERCEPTION_LAYER.md Section 3)_

**Contamination Control Hub** (`/knowledge-system/contamination-control-hub`):
- Hero: "Understanding Contamination-Caused Equipment Failure"
- Quick facts: 3 primary contamination modes (particle wear, diesel water, hydraulic contamination)
- Path selector: What's failing in your equipment? (air intake | fuel | lube oil | hydraulic | cabin | compressed air)
- Each path links to the relevant case study page
- Cross-links: Standards hub, Fleet hub
- RetrievalBlock and JSON-LD CollectionPage schema

**Fleet Optimization Hub** (`/knowledge-system/fleet-optimization-hub`):
- Hero: "Fleet-Level Filtration Strategy & Total Cost of Ownership"
- Fleet impact metrics: 30–50% equipment life extension, $260K/hr downtime cost, 89% TCO improvement
- Decision framework: fleet size × challenge type × equipment type → recommended strategy page
- Cross-links: Standards hub, Contamination hub
- RetrievalBlock and JSON-LD CollectionPage schema

**4.4 — Build Seven Missing Standard Definition Pages**

Create dedicated pages for standards referenced throughout the knowledge system but lacking their own page:

| Standard | Slug | Primary Domain |
|----------|------|----------------|
| SAE J1539 | `/standards/sae-j1539` | Air Intake Filtration |
| ASTM D6304 | `/standards/astm-d6304` | Diesel Fuel Integrity |
| NFPA T2.14 | `/standards/nfpa-t214` | Hydraulic Efficiency |
| DIN 51524 | `/standards/din-51524` | Hydraulic Efficiency |
| ISO 8573-1 | `/standards/iso-8573` | Contamination Control |
| ISO 11155 | `/standards/iso-11155` | Contamination Control |
| ISO 12937 | `/standards/iso-12937` | Diesel Fuel Integrity |

Each page follows the 8-section content structure: Definition → Scope → Measurement Methodology → Industrial Relevance → System Applications → Related Contamination Modes → Related Technologies → RetrievalBlock + JSON-LD

**4.5 — Implement Demand Interception Middleware**  
_(Per DEMAND_INTERCEPTION_LAYER.md Section 7, Option A — Metadata-Driven)_

- Create `frontend/src/middleware.ts` — Next.js edge middleware
- Read incoming referrer URL and classify intent: Product (brand names, "alternative", "replacement") → route to `/bridges/industrial-filtration`; Problem (failure, contamination, wear, downtime) → route to contamination-control-hub; System (ISO, SAE, ASTM, standard, specification) → route to `/standards`
- Add intent metadata to page `<head>` as `<meta name="intent-type" content="product|problem|system">` for each Knowledge System page

**4.6 — Wire All Semantic Analytics**

- Call `trackKnowledgePageView(pathname, semanticDomain, conceptId)` in a `useEffect` on every Knowledge System page
- Call `trackKnowledgeTraversal(from, to, linkType)` on every semantic internal link click (add `onClick` to styled semantic links)
- Call `trackBridgeEntry(bridgePage, referrer)` on Bridge page mount
- Call `trackFleetConversion(step, fromPage)` at each Fleet funnel step
- Load PostHog SDK in `layout.tsx` (add to `<Script>` block after GTM)
- Load Microsoft Clarity in `layout.tsx` with project ID

### Dependencies

- Phase 1 (stable infrastructure) and Phase 2 (unified data) must be complete
- `EXECUTION_BLUEPRINT_PHASE2_DOMAINS.md` provides the complete link target map for all 26 pages — use as implementation spec

### Risks

- **Volume risk**: 26 pages is a large scope. Inconsistent implementation quality across pages is likely if done in a single pass. Mitigation: implement in the priority sequence defined in 4.1 and verify each batch before continuing.
- **SEO disruption risk**: Adding middleware redirects for intent-based routing changes URL behavior for existing indexed pages. Test thoroughly with `curl -I` before deploying.
- **Link quality risk**: Semantic links must appear naturally in content paragraphs, not as dedicated "see also" sections. Forced link insertion degrades content quality.

### Estimated Effort

| Task | Effort |
|------|--------|
| Complete 26 pages (RetrievalBlock + links + Citation Layer) | 20–25 hours |
| Bridge page reframing sections | 4 hours |
| Build 2 missing hub pages | 4 hours |
| Build 7 missing standard pages | 14 hours |
| Demand Interception middleware | 6 hours |
| Wire all analytics | 4 hours |
| **Total** | **52–57 hours** |

### Success Criteria

- [ ] All 30 Knowledge System pages have RetrievalBlock with complete semantic metadata
- [ ] All 30 pages have JSON-LD TechArticle schema (or CollectionPage for hubs)
- [ ] All 26 upgraded pages have 2–3 semantic internal links in content paragraphs
- [ ] All 4 Bridge pages have reframing sections after their heroes
- [ ] Contamination Control Hub and Fleet Optimization Hub are built and navigable
- [ ] All 7 missing standard pages are built and linked from the Standards hub
- [ ] `trackKnowledgePageView()` fires on every Knowledge System page view (verify in GA4 DebugView)
- [ ] Intent middleware routes brand-search traffic to Bridge pages (verify with browser referrer simulation)

---

## PHASE 5 — Part Search Intelligence Hub

### Objective

Transform the isolated Part Search application into an integrated intelligence hub that connects the knowledge system's contamination/standard/technology taxonomy directly to the product search experience. Users moving from knowledge content to product search should carry their context (industry, system type, contamination mode) into the search interface.

### Tasks

**5.1 — Instrument the Part Search Application**
- Establish a URL parameter contract between the Next.js catalogue and the Part Search HTML app:
  - `?technology=MACROCORE` — pre-filter results to MACROCORE-based products
  - `?industry=mining` — pre-filter to products applicable to the mining industry
  - `?system=air-intake` — pre-filter to air intake system products
  - `?standard=iso-5011` — pre-filter to ISO 5011-certified products
- Implement URL parameter parsing in `part-search/index.html`

**5.2 — Build In-App Search Widget**
- Create `components/PartSearchWidget.tsx` — a compact search bar with yellow CTA button
- Widget accepts a `context` prop: `{ technology?: string, industry?: string, system?: string }`
- On submit, constructs the Part Search URL with the appropriate query parameters and opens it in a new tab
- Widget includes a placeholder: "Enter part number or equipment model..."

**5.3 — Embed Search Widget on Technology Pages**
- Add `PartSearchWidget` to each `/technologies/[slug]` page with `context={{ technology: slug }}`
- Position: after the technology's primary content section, before FAQ
- Label: "Find Parts Using This Technology"

**5.4 — Embed Search Widget on Industry Pages**
- Add `PartSearchWidget` to each `/industries/[slug]` page with `context={{ industry: slug }}`
- Position: after the industry's contamination overview section
- Label: "Find Filters for Your Equipment"

**5.5 — Embed Search Widget on Knowledge System Pages**
- Add `PartSearchWidget` to each Standards Domain page with `context={{ system: slug }}`
- Position: within the RetrievalBlock section or after FAQ
- Label: "Find Filters Meeting These Standards"

**5.6 — Extend the WebSite SearchAction Schema**
- Update the `SearchAction` JSON-LD in `layout.tsx` to include domain-specific search entry points
- Add `hasPart` entries for technology-filtered, industry-filtered, and system-filtered search URLs

**5.7 — Build a Part Search Landing Page Within Next.js**
- Create `/search` route as a Next.js page that renders the `PartSearchWidget` in full-page layout
- Include contextual knowledge links: "Not sure what to search? Start with contamination type →"
- This gives the search function a canonical Next.js URL for SEO purposes rather than relying solely on the external subdomain

**5.8 — Create a "Knowledge → Product" Navigation Path**
- On contamination case study pages, after the prevention strategy section, add a "Find the Right Filter" CTA with pre-filled context based on the contamination mode's resolving technologies
- On Fleet pages, add "Standardize Your Fleet" CTA linking to Part Search pre-filtered by the fleet's primary system type

### Dependencies

- Phase 1 (`DATABASE_URL` must be working for Part Search backend queries)
- Phase 2 (unified technology/industry slugs must match Part Search filter parameters)
- Phase 4 (Knowledge System pages must be complete to embed the widget)

### Risks

- **Cross-origin limitations**: The Next.js app and part-search app are on different origins (`elimfilters.com` vs `part-search.elimfilters.com`). URL parameter passing works, but session state and analytics cannot be shared without CORS configuration on the Part Search backend.
- **URL parameter contract drift**: If Part Search adds or renames parameters without updating the Next.js widget, context is silently lost. Mitigation: document the parameter contract in a shared spec file.
- **SEO risk for external subdomain**: Search engines may not associate `part-search.elimfilters.com` with `elimfilters.com` for domain authority. The `/search` internal route in 5.7 mitigates this.

### Estimated Effort

| Task | Effort |
|------|--------|
| URL parameter contract + Part Search instrumentation | 4 hours |
| PartSearchWidget component | 3 hours |
| Technology page integration (12 pages) | 3 hours |
| Industry page integration (12 pages) | 3 hours |
| Knowledge System page integration (30 pages) | 5 hours |
| Schema extension | 1 hour |
| `/search` Next.js page | 3 hours |
| Knowledge → Product navigation paths | 4 hours |
| **Total** | **26–28 hours** |

### Success Criteria

- [ ] Navigating to `/technologies/macrocore` and clicking "Find Parts Using This Technology" opens Part Search pre-filtered to MACROCORE products
- [ ] Navigating to `/industries/mining` and clicking "Find Filters for Your Equipment" opens Part Search pre-filtered to mining applications
- [ ] `/search` route renders the search widget with contextual knowledge navigation
- [ ] `WebSite` JSON-LD SearchAction schema validates in Google's Rich Results Test
- [ ] `trackSearchIntent()` fires with correct `intentType` when widget is submitted

---

## PHASE 6 — Failure Analysis Center

### Objective

Expand the Contamination section from 3 case studies into a comprehensive Failure Analysis Center — a systematized library of industrial failure modes, root causes, and prevention pathways. This center becomes the destination for all problem-intent search traffic and the authoritative reference for industrial failure mechanism understanding.

### Tasks

**6.1 — Build the Failure Mode Analysis Matrix**
- Create `/knowledge-system/contamination/failure-matrix` page
- Matrix structure: Equipment Type (rows) × Failure Mode (columns) × Severity (cell color)
- Equipment types: Engine, Hydraulic circuit, Fuel system, Air intake, Cabin, Compressed air system, Coolant system
- Failure modes: Particle wear, Water contamination, Varnish formation, Microbial growth, Corrosion, Cavitation, Thermal degradation, Oxidation
- Each cell: severity level (Low/Medium/High/Extreme) + link to the relevant case study or prevention page
- JSON-LD: `Dataset` schema for the matrix data

**6.2 — Build 4 Additional Contamination Case Studies**

Based on gaps identified in contamination coverage, create four new case study pages:

- **Compressed Air Contamination** (`/contamination/compressed-air`): Oil vapor carryover, liquid water accumulation, particulate from compressor wear, microbial growth in desiccant dryers. Related technology: DRYCORE. Standard: ISO 8573-1.
- **Cabin Air Contamination** (`/contamination/cabin-air`): PM2.5/PM10 diesel exhaust particulate, operator occupational exposure, allergen transmission, pesticide vapor in agricultural cabs. Related technology: MICROKAPPA. Standard: ISO 11155, EU Directive 2019/130.

**6.3 — Build the Root Cause Analysis (RCA) Tool**
- Create `/knowledge-system/contamination/rca` — an interactive decision tree
- User selects: equipment type → symptom → observable evidence → root cause → recommended standard + prevention strategy + technology
- Each decision step links to the relevant case study, standard page, or technology page
- Implemented as client-side state machine (no backend required for Phase 6; data-driven from unified-data.ts)

**6.4 — Build the Contamination Prevention Library**
- Create `/knowledge-system/contamination/prevention` — a structured guide to contamination prevention strategies
- Organized by: Pre-filter (ingression reduction), Primary filter (capture), Secondary filter (polishing), Condition monitoring (detection), Replacement protocol (management)
- Each strategy section links to applicable standards, technologies, and case studies

**6.5 — Enhance Existing 3 Case Studies**
- Add the Canonical Knowledge Block (AI Citation Layer) to all three existing case studies
- Add `ROOT CAUSE → PREVENTION STRATEGY` structured box per DEMAND_INTERCEPTION_LAYER.md Section 4B
- Add links to the new Failure Matrix from each case study
- Add links to the new RCA tool

**6.6 — Update the Contamination Hub**
- Update `/knowledge-system/contamination` hub page to link to all 7 case studies + Failure Matrix + RCA tool + Prevention Library
- Add the quick contamination mode selector (from DEMAND_INTERCEPTION_LAYER.md Hub 1 specification)
- Integrate with the Contamination Control Hub built in Phase 4

### Dependencies

- Phase 2 (unified-data.ts must have contamination mode data for new case studies)
- Phase 4 (existing case studies must have RetrievalBlocks before adding the RCA tool cross-links)

### Risks

- **Content accuracy risk**: Coolant, compressed air, cabin, and microbial contamination require specialized technical content. Incorrect quantified metrics (e.g., wrong ISO 8573-1 purity class thresholds) would damage credibility. Mitigation: technical review of each new case study before publishing.
- **RCA tool scope creep**: The decision tree can grow infinitely complex. Limit Phase 6 to the 3 main contamination domains (particle, water, hydraulic) with a maximum of 3 decision levels per path. Expand in Phase 7.

### Estimated Effort

| Task | Effort |
|------|--------|
| Failure Mode Analysis Matrix | 6 hours |
| 4 new contamination case studies | 16 hours |
| RCA decision tree tool | 10 hours |
| Contamination Prevention Library | 6 hours |
| Enhance existing 3 case studies | 4 hours |
| Update Contamination Hub | 2 hours |
| **Total** | **44–48 hours** |

### Success Criteria

- [ ] `/contamination/failure-matrix` renders with 7 equipment types × 8 failure modes with severity ratings
- [ ] 4 new case study pages are published and linked from the Contamination hub
- [ ] RCA tool guides users from symptom to prevention strategy in ≤ 4 clicks
- [ ] All 7 case studies have Canonical Knowledge Block + JSON-LD TechArticle
- [ ] Contamination hub links to all 7 case studies, Failure Matrix, RCA, and Prevention Library

---

## PHASE 7 — Resources Center

### Objective

Build a structured technical resources library that converts ELIMFILTERS® knowledge content into downloadable, shareable, and printable formats. Resources serve procurement teams (specification sheets), fleet managers (maintenance guides), and engineers (technical references) — creating a demand generation layer that incentivizes email capture and dealer registration.

### Tasks

**7.1 — Design the Resources Architecture**
- Create `/resources` as a new top-level section (add to Navigation)
- Sub-sections:
  - `/resources/spec-sheets` — Technology specification sheets (one per technology, 12 total)
  - `/resources/maintenance-guides` — Industry-specific maintenance interval guides (one per industry, 12 total)
  - `/resources/iso-reference` — Quick-reference cards for all ISO/SAE/ASTM standards in the knowledge system
  - `/resources/contamination-reports` — Downloadable contamination case study PDFs
  - `/resources/tco-calculator` — Total cost of ownership calculator (interactive)

**7.2 — Build the Resources Hub Page**
- Create `/resources/page.tsx` with category navigation grid
- Include: "Technical resources for procurement teams, fleet managers, and engineers"
- Filter by: category (spec sheets, guides, standards, reports) and industry or technology
- JSON-LD: `CollectionPage` with `DataCatalog` type for downloadable resources

**7.3 — Build Technology Specification Sheets**
- For each of the 12 technologies, create a printable specification card at `/resources/spec-sheets/[tech-slug]`
- Content per sheet: Technology name + tagline, contamination domain, ISO standards addressed, key performance metrics (from unified-data.ts `keyMetrics`), applicable industries, GEO prose definition
- Include: "Print" button triggering `window.print()` with print-optimized CSS

**7.4 — Build Industry Maintenance Guides**
- For each of the 12 industries, create a guide at `/resources/maintenance-guides/[industry-slug]`
- Content: Industry operating conditions, primary contamination threats, recommended filter systems, replacement interval guidance (hours-based vs condition-based), applicable standards
- Each guide references 3–5 technologies from that industry's `applicableTechnologies[]`

**7.5 — Build the ISO Quick Reference Library**
- Create `/resources/iso-reference/[standard-slug]` pages for all 13 standards
- Quick-reference format: Standard code, scope (1 sentence), measurement methodology (2–3 sentences), cleanliness targets (table), pass/fail criteria, applicable equipment
- These are shorter than the full standard definition pages in the Knowledge System — optimized for engineers who need the number, not the context

**7.6 — Build the TCO Calculator**
- Create `/resources/tco-calculator` as an interactive client-side calculator
- Inputs: fleet size, equipment type, current filter cost per unit, current service interval, estimated downtime cost per hour, estimated downtime events per year
- Outputs: current annual filtration cost, current annual downtime cost, system-approach projected savings (30–50% equipment life extension, 60–80% downtime reduction), 10-year TCO comparison
- Data sources: metrics from `knowledge-architecture.ts` FLEET_OPTIMIZATION and industry `operatingConditions`

**7.7 — Create a Gated Content Layer (Optional)**
- For downloadable PDF versions of contamination reports and maintenance guides, require email capture
- Implement simple form: name, email, company, fleet size → sends to `/api/contact` → delivers download link via email
- This creates a demand generation funnel from the knowledge system to the dealer/distributor network

**7.8 — Add Resources Links to Knowledge System Pages**
- On each technology page: link to the corresponding spec sheet in Resources
- On each industry page: link to the corresponding maintenance guide
- On each standards page: link to the ISO quick reference card
- On each contamination page: link to the downloadable contamination report (Phase 7.7)

### Dependencies

- Phase 2 (unified-data.ts is required to auto-generate spec sheets and guides from data)
- Phase 4 (Knowledge System must be complete to add reciprocal links)
- Phase 1 (`DATABASE_URL` working for email capture in 7.7)

### Risks

- **PDF generation complexity**: Server-side PDF generation from React components requires a headless browser or PDF library. For Phase 7, use print CSS (`@media print`) rather than server-generated PDFs to avoid infrastructure complexity.
- **Data freshness**: Spec sheets and maintenance guides generated from unified-data.ts will need manual updates when technology specs change. Mitigation: include a "generated on" timestamp and a link to the live page as the authoritative source.
- **Email capture compliance**: Collecting emails for gated downloads requires GDPR/CAN-SPAM compliance — privacy policy, unsubscribe mechanism, data processing disclosure. Legal review required before activating 7.7.

### Estimated Effort

| Task | Effort |
|------|--------|
| Resources hub architecture + hub page | 4 hours |
| Technology spec sheets (12) | 8 hours |
| Industry maintenance guides (12) | 10 hours |
| ISO quick reference library (13) | 6 hours |
| TCO calculator | 10 hours |
| Gated content layer | 6 hours |
| Reciprocal links to Knowledge System | 4 hours |
| **Total** | **48–52 hours** |

### Success Criteria

- [ ] `/resources` is accessible from the main navigation
- [ ] All 12 technology spec sheets render and print correctly
- [ ] All 12 industry maintenance guides are published
- [ ] TCO calculator produces output when fleet size, filter cost, and downtime cost are entered
- [ ] Email capture flow (if activated) delivers download link without exposing the direct PDF URL

---

## PHASE 8 — Academy

### Objective

Transform the three educational pathways defined in `knowledge-architecture.ts` (TECHNICIAN_ONBOARDING, EQUIPMENT_OPERATOR, FLEET_MANAGER) into a structured learning experience. The Academy makes ELIMFILTERS® the definitive filtration education platform in its competitive space, positioning the brand as the knowledge authority rather than a product vendor.

### Tasks

**8.1 — Design the Academy Architecture**
- Create `/academy` as a new top-level section (add to Navigation)
- Three primary learning tracks, each from `knowledge-architecture.ts EDUCATIONAL_PATHWAYS`:
  - **Technician Track** (`/academy/technician`) — TECHNICIAN_ONBOARDING pathway: Contamination Fundamentals → Technology Overview → Industry Specific → Preventive Maintenance
  - **Operator Track** (`/academy/operator`) — EQUIPMENT_OPERATOR pathway: Contamination Impacts → Filter Selection → Maintenance Intervals
  - **Fleet Manager Track** (`/academy/fleet-manager`) — FLEET_MANAGER pathway: Cost Analysis → Fleet Strategy → Compliance

**8.2 — Build the Academy Hub**
- Create `/academy/page.tsx` — track selection landing page
- Three prominent track cards with: audience description, learning outcomes, estimated time, difficulty level (Beginner/Intermediate/Advanced)
- "Where should I start?" diagnostic — 3 questions → recommended track
- JSON-LD: `Course` schema for each track

**8.3 — Build the Technician Track (4 modules)**

Module 1 — Contamination Fundamentals (`/academy/technician/contamination-fundamentals`):
- What is contamination? Particle size, water forms, chemical degradation
- How contamination enters fluid circuits (ingression, internal generation, cross-contamination)
- How to read ISO 4406 cleanliness codes
- Knowledge check: 5 questions

Module 2 — Technology Overview (`/academy/technician/technology-overview`):
- How filter media captures particles (inertial impaction, interception, diffusion)
- What Beta ratio means and how to use it
- Filter construction types (cellulose vs synthetic, spin-on vs element)
- Knowledge check: 5 questions

Module 3 — Industry Specific (`/academy/technician/industry-applications`):
- Contamination exposure by industry (from `INDUSTRIES.contaminationExposure`)
- Selecting filtration for your industry's environment
- Common failure modes per industry type
- Knowledge check: 5 questions

Module 4 — Preventive Maintenance (`/academy/technician/preventive-maintenance`):
- Condition-based vs calendar-based replacement
- How to use differential pressure monitoring
- How to interpret oil analysis reports
- Building a maintenance schedule
- Knowledge check: 5 questions + Completion certificate

**8.4 — Build the Operator Track (3 modules)**

Module 1 — Contamination Impacts (`/academy/operator/contamination-impacts`):
- What contamination does to your equipment (quantified: bearing life, fuel economy)
- Warning signs of contamination-related failure
- How to prevent the most common equipment failures

Module 2 — Filter Selection (`/academy/operator/filter-selection`):
- Matching filter to application (not brand to brand)
- Reading a filter specification: Beta ratio, collapse pressure, bypass threshold
- OEM vs aftermarket: the specification-based evaluation

Module 3 — Maintenance Intervals (`/academy/operator/maintenance-intervals`):
- How to determine when to change filters (condition, not calendar)
- Extending intervals safely: synthetic media advantages
- Documenting maintenance for warranty compliance

**8.5 — Build the Fleet Manager Track (3 modules)**

Module 1 — Cost Analysis (`/academy/fleet-manager/cost-analysis`):
- Total cost of ownership framework (uses TCO Calculator from Phase 7)
- How to quantify contamination-related downtime costs
- Building the business case for system-level filtration

Module 2 — Fleet Strategy (`/academy/fleet-manager/fleet-strategy`):
- Fleet-level standardization: reducing SKU complexity
- Phased deployment: assess → standardize → optimize
- Procurement consolidation and supplier rationalization

Module 3 — Compliance (`/academy/fleet-manager/compliance`):
- Which ISO/SAE standards are mandatory vs advisory
- How to document compliance for OEM warranty preservation
- Environmental and occupational health standards (EU Directive 2019/130, OSHA PM2.5)

**8.6 — Build the Knowledge Check System**
- Client-side question/answer engine with 3 question types: multiple choice, true/false, image-based (e.g., "Which ISO cleanliness code represents dirtier fluid?")
- Score tracking in `localStorage` — no backend required for Phase 8
- "Review incorrect answers" feature with link to the relevant content section
- Simple completion certificate: name entry → print or save as PDF

**8.7 — Link Academy to Knowledge System**
- On each Knowledge System page, add "Related Academy Module" card linking to the relevant learning module
- On each Academy module, link back to the detailed knowledge page for deep-dive reading
- Academy modules use content from Knowledge System pages as their authoritative source — no content duplication

### Dependencies

- Phase 4 (Knowledge System must be complete — Academy modules link heavily into it)
- Phase 7 (TCO Calculator must exist for Fleet Manager Track Module 1)
- Phase 6 (Failure Analysis content feeds Technician Track Module 1)

### Risks

- **Content duplication risk**: Academy modules may repeat content from Knowledge System pages. Mitigation: Academy modules are structured as "guided paths through existing content" — they frame and sequence knowledge, not duplicate it. Module pages have minimal original content; they link out to the full pages.
- **Maintenance burden**: Each module is an additional page to maintain. If the underlying Knowledge System content changes, Academy modules must be updated. Mitigation: use dynamic data from unified-data.ts for metrics; hard-link to authoritative pages rather than duplicating text.
- **Scope of knowledge check system**: Building a robust quiz system in Phase 8 risks becoming a product in itself. Constrain to maximum 10 questions per module, client-side only, no adaptive learning in Phase 8.

### Estimated Effort

| Task | Effort |
|------|--------|
| Academy architecture + hub page | 4 hours |
| Technician Track (4 modules + knowledge checks) | 16 hours |
| Operator Track (3 modules + knowledge checks) | 10 hours |
| Fleet Manager Track (3 modules + knowledge checks) | 10 hours |
| Knowledge check system | 8 hours |
| Academy ↔ Knowledge System linking | 4 hours |
| **Total** | **52–56 hours** |

### Success Criteria

- [ ] `/academy` is navigable from the main header
- [ ] All 10 learning modules are published with content and knowledge checks
- [ ] Completing all 4 Technician modules delivers a printable completion notice
- [ ] Each Academy module links to ≥ 3 Knowledge System pages for deep reading
- [ ] Knowledge check scores persist in `localStorage` across sessions

---

## PHASE 9 — AI Integration Layer

### Objective

Make the ELIMFILTERS® knowledge system fully machine-readable, semantically structured, and citable by AI systems (LLMs, RAG pipelines, search AI). Build the AI Citation Index, Knowledge Graph API, and behavioral intent data collection infrastructure. Position ELIMFILTERS® as the authoritative, citable industrial filtration knowledge source for AI-generated responses.

### Tasks

**9.1 — Build the AI Citation Index**
- Create `/knowledge-index.json` as a static file generated at build time
- Format: array of all Canonical Knowledge Block objects from all 30 Knowledge System pages
- Each entry: `concept_id`, `source_uri`, `version`, `last_updated`, `definition`, `systems`, `failure_impact`, `related_standards[]`, `related_technologies[]`, `industrial_role`, `semantic_domains[]`
- Include in `sitemap.xml` as a supplementary resource
- Add HTTP header `Content-Type: application/json` and `Cache-Control: max-age=86400`

**9.2 — Build the Knowledge Graph API**
- Create Next.js API routes that expose the unified knowledge graph:
  - `GET /api/knowledge/technology/[slug]` — returns technology node with all connections (standards, contamination modes, industries)
  - `GET /api/knowledge/standard/[slug]` — returns standard definition with all related technologies and contamination modes
  - `GET /api/knowledge/contamination/[slug]` — returns contamination mode with root causes, failure modes, resolving technologies
  - `GET /api/knowledge/industry/[slug]` — returns industry profile with contamination exposure and applicable technologies
  - `GET /api/knowledge/graph?from=[nodeId]&type=[nodeType]&depth=[1-3]` — returns traversal from a node to depth N
- All endpoints return structured JSON with `@context: schema.org` headers
- Rate limiting: 100 requests/minute per IP (edge middleware)

**9.3 — Activate Behavioral Intent Classification**

_(Phase 4 wired the analytics functions; Phase 9 activates the classification system)_

- Build the intent classification service in `analytics.ts`:
  - Analyze incoming `document.referrer` on page load
  - Extract search query from referrer (Google, Bing, DuckDuckGo URL patterns)
  - Classify query against intent rules from `DEMAND_INTERCEPTION_LAYER.md` Section 1B
  - Fire `trackSearchIntent(query, intentType)` with classified result
- Build the intent analytics dashboard (PostHog funnel or GA4 exploration):
  - Product Intent → Bridge Page conversion rate
  - Problem Intent → Contamination Hub engagement
  - System Intent → Standards page depth
  - Intent → Knowledge System → Part Search → Contact funnel

**9.4 — Implement Structured Data for AI Crawlers**

Per the AI Citation Layer specification in `CLAUDE.md`:

- Add `DefinedTerm` JSON-LD to all 13 standard definition pages:
  ```json
  { "@type": "DefinedTerm", "name": "ISO 4406", "inDefinedTermSet": "Industrial Filtration Standards", "description": "..." }
  ```
- Add `HowTo` JSON-LD to RCA tool pages (Phase 6) — the step-by-step failure diagnosis process qualifies as a `HowTo` schema
- Add `Dataset` JSON-LD to the Failure Mode Analysis Matrix (Phase 6)
- Add `Course` JSON-LD to Academy track pages (Phase 8)
- Add `LearningResource` JSON-LD to Academy modules

**9.5 — Build the LLM-Optimized Summary Layer**

For each of the 30 Knowledge System pages, add a machine-readable structured summary block immediately before the closing `</main>` tag:

```
<!-- LLM:CANONICAL-START
CONCEPT: [concept name]
DOMAIN: [primary semantic domain]
DEFINITION: [one-sentence technical definition]
SYSTEMS: [comma-separated system list]
FAILURE_IMPACT: [root cause → consequence chain]
STANDARDS: [code: scope pairs]
TECHNOLOGIES: [technology: mechanism pairs]
INDUSTRIAL_ROLE: [one-sentence importance statement]
CITATION: elimfilters.com/knowledge-system/[path] | version 1.x | [date]
LLM:CANONICAL-END -->
```

These HTML comments are visible to crawlers that read raw HTML (including AI training pipelines) but invisible to users.

**9.6 — Implement Cross-Page Definition Consistency Validation**

- Create `scripts/validate-definitions.ts` — a build-time script that:
  - Extracts all Canonical Knowledge Block definitions from all 30 pages
  - Checks that the same concept (e.g., "ISO 4406") has word-for-word identical definitions wherever it appears
  - Flags inconsistencies as build warnings
  - Reports version numbers and last_updated timestamps across all occurrences of a concept

**9.7 — Build the AI Visibility Report**

- Create `/admin/ai-visibility` (password-protected or build-time report) that shows:
  - Per-page: AI Citation Layer coverage (complete/partial/missing)
  - Per-concept: cross-page definition consistency score
  - Global: LLM-readable summary coverage, JSON-LD schema types present
  - Retrieval Block interaction rates from GA4
  - Known AI citation occurrences (tracked via branded search queries)

**9.8 — Register with AI Knowledge Sources**

- Submit `knowledge-index.json` to Bing IndexNow API
- Submit structured pages to Google Search Console for enhanced indexing
- Add `llms.txt` to the domain root (emerging standard for AI crawler permissions):
  - Allow: Knowledge System pages, Resources pages
  - Allow: `knowledge-index.json`
  - Disallow: Admin, API routes

**9.9 — Temporal Consistency and Versioning System**

- Add version tracking to all Canonical Knowledge Blocks:
  - `version: 1.x` format — increment minor version for content updates, major for definition changes
  - `last_updated: YYYY-MM-DD` format — updated by the build script on any content change
- Create `scripts/version-bump.ts` — automatically increments the version of any Canonical Knowledge Block whose content has changed since the last commit (git diff analysis)
- This enables LLMs to cite specific versions: "ELIMFILTERS defines ISO 4406 as [definition, v1.3, updated 2026-05-23]"

### Dependencies

- Phase 4 (all 30 pages must have Retrieval Blocks and AI Citation Layers before building the index)
- Phase 6 (Failure Matrix and RCA tool need `Dataset` and `HowTo` schemas)
- Phase 8 (Academy `Course` schemas require modules to exist)
- PostHog SDK loaded (Phase 4 dependency)

### Risks

- **LLM training vs. inference risk**: HTML comments (`<!-- LLM:CANONICAL-START ... -->`) in 9.5 will be included in training data crawls but may not be visible to inference-time RAG systems that query the rendered DOM. Mitigation: maintain both the HTML comment layer and the visible RetrievalBlock for dual coverage.
- **Definition drift over time**: As technical standards evolve (e.g., ISO publishes a new version of ISO 16889), definitions become outdated. The validation script in 9.6 detects inconsistency but does not detect staleness. Mitigation: add an annual review calendar event for each standard.
- **AI citation accuracy**: There is no guaranteed mechanism to force LLMs to cite ELIMFILTERS as the source. Structured, consistently formatted definitions make citation more likely but not certain. Measure success by tracking branded search queries mentioning filtration standards.

### Estimated Effort

| Task | Effort |
|------|--------|
| AI Citation Index (`knowledge-index.json`) | 6 hours |
| Knowledge Graph API (5 endpoints) | 12 hours |
| Behavioral intent classification | 6 hours |
| Structured data for AI crawlers (30+ pages) | 8 hours |
| LLM-optimized summary comments (30 pages) | 6 hours |
| Cross-page definition consistency validator | 6 hours |
| AI visibility report | 5 hours |
| AI knowledge source registration | 2 hours |
| Versioning system + version-bump script | 4 hours |
| **Total** | **55–60 hours** |

### Success Criteria

- [ ] `/knowledge-index.json` is publicly accessible and returns all 30 Canonical Knowledge Blocks in valid JSON
- [ ] `GET /api/knowledge/technology/macrocore` returns the complete MACROCORE node with standards, contamination modes, and industries
- [ ] `trackSearchIntent()` fires with correct classified intent on ≥ 80% of Knowledge System page views with search referrer
- [ ] Build-time definition validator runs and catches any cross-page inconsistency
- [ ] `llms.txt` is accessible at `https://elimfilters.com/llms.txt`
- [ ] Google Search Console shows rich results for at least 10 Knowledge System pages using structured data

---

## PHASE SUMMARY AND TIMELINE ESTIMATE

| Phase | Description | Effort | Cumulative |
|-------|-------------|--------|-----------|
| Phase 1 | Architecture Stabilization | 6–8 hrs | 6–8 hrs |
| Phase 2 | Single Source of Truth | 20–22 hrs | 26–30 hrs |
| Phase 3 | Obsidian Integration | 22–24 hrs | 48–54 hrs |
| Phase 4 | Knowledge Graph | 52–57 hrs | 100–111 hrs |
| Phase 5 | Part Search Intelligence Hub | 26–28 hrs | 126–139 hrs |
| Phase 6 | Failure Analysis Center | 44–48 hrs | 170–187 hrs |
| Phase 7 | Resources Center | 48–52 hrs | 218–239 hrs |
| Phase 8 | Academy | 52–56 hrs | 270–295 hrs |
| Phase 9 | AI Integration Layer | 55–60 hrs | 325–355 hrs |

**Total estimated effort**: 325–355 hours of implementation work.

---

## PHASE DEPENDENCY MAP

```
Phase 1 (Stabilization)
    │
    ├──► Phase 2 (Single Source of Truth)
    │         │
    │         ├──► Phase 3 (Obsidian Integration)  [parallel to Phase 4]
    │         │
    │         └──► Phase 4 (Knowledge Graph)
    │                   │
    │                   ├──► Phase 5 (Part Search Hub)
    │                   │
    │                   ├──► Phase 6 (Failure Analysis)
    │                   │         │
    │                   │         └──► Phase 7 (Resources Center)
    │                   │                   │
    │                   │                   └──► Phase 8 (Academy)
    │                   │                             │
    │                   └─────────────────────────────┴──► Phase 9 (AI Layer)
```

**Parallel work possible**:
- Phase 3 (Obsidian) can run in parallel with Phase 4 (Knowledge Graph) after Phase 2 is complete
- Phase 5 (Part Search) can begin after Phase 4 completes, in parallel with Phase 6
- Phase 7 and Phase 8 can be developed in parallel after their respective dependencies are met

---

## RECOMMENDED SPRINT STRUCTURE

Given the dependency map and effort estimates, a 2-week sprint model:

| Sprint | Phases | Focus |
|--------|--------|-------|
| Sprint 1 | Phase 1 | Fix all blockers, establish clean baseline |
| Sprint 2–3 | Phase 2 | Build unified data layer |
| Sprint 4 | Phase 3 | Obsidian vault generation |
| Sprint 5–7 | Phase 4 | Complete Knowledge System (26 pages + hubs + standards) |
| Sprint 8 | Phase 5 | Part Search integration |
| Sprint 9–10 | Phase 6 | Failure Analysis Center |
| Sprint 11–12 | Phase 7 | Resources Center |
| Sprint 13–14 | Phase 8 | Academy |
| Sprint 15–16 | Phase 9 | AI Integration Layer |

**Estimated calendar**: 32 weeks at 10–12 productive hours per week.

---

*Roadmap generated: 2026-06-02*  
*Source documents: ECOSYSTEM_AUDIT.md · DEMAND_INTERCEPTION_LAYER.md · SEMANTIC_RANKING_LAYER.md · EXECUTION_BLUEPRINT_PHASE1_MAPPING.md · EXECUTION_BLUEPRINT_PHASE2_DOMAINS.md · CLAUDE.md*  
*Repository: latamfilters/world-catalogue*
