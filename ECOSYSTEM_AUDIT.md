# ECOSYSTEM_AUDIT.md
## ELIMFILTERS® World Catalogue — Complete Repository Audit

**Date**: 2026-06-02  
**Branch**: `claude/dazzling-franklin-ALGY1`  
**Scope**: Full repository analysis — architecture, content, AI integrations, technical risks

---

## 1. WHAT ALREADY EXISTS

### 1.1 Application Architecture

| Layer | Technology | Status |
|-------|-----------|--------|
| Framework | Next.js 14.2.5 (static export mode) | ✅ Fully operational |
| Language | TypeScript 5 | ✅ Configured |
| Styling | Inline CSS (100% React `style` props) | ✅ Consistent |
| Animation | Framer Motion (motion/react v11) | ✅ Used throughout |
| i18n | react-i18next + i18next-http-backend | ✅ 11 languages |
| Fonts | Outfit, Space Grotesk, JetBrains Mono, Montserrat (Google Fonts) | ✅ Loaded in layout.tsx |
| Analytics | GA4 (G-T7STY4TY9C) + PostHog + Microsoft Clarity | ⚠️ GA4 only active; PostHog/Clarity declared but not initialized |
| Backend | Node.js server.js at repo root | ⚠️ DB/email broken (see Section 6) |
| Build output | `/frontend/out/` (static HTML) | ✅ Generated on build |

### 1.2 Navigation Structure

**Global Navigation** (`/frontend/src/components/Navigation.tsx`):
- Fixed top bar with blur on scroll
- Links: Industries · Systems · Technologies · Knowledge System · Contact
- "Find My Filter" CTA → `https://part-search.elimfilters.com` (external)
- Language switcher (geo-detected, hidden for US/CA visitors)
- Mobile hamburger menu with animated bars

**Missing from nav**: About, Warranty, Distributor Application (pages exist but are not linked)

**Footer** (`/frontend/src/components/Footer.tsx`):
- 4 columns: Company, Products, Support, Knowledge
- Social: LinkedIn, Instagram, YouTube
- Company info: "Kleo Technologies — Frisco, Texas"

### 1.3 Existing Routes

**Main Application Pages**
```
/                          → Home (page.tsx)
/about                     → About page
/contact                   → Contact form
/warranty                  → Warranty policy
/distributor-application   → Dealer application form
```

**Dynamic Catalogue Pages**
```
/industries                → Industries hub (12 cards from catalogue.json)
/industries/[slug]         → Dynamic industry page (slug-based)
/systems                   → Systems hub (12 products from catalogue.json)
/systems/[slug]            → Dynamic system page (SystemPageClient)
/technologies              → Technologies hub (9 cards displayed, 12 in data)
/technologies/[slug]       → Dynamic technology page (techPagesData.ts)
/products/[slug]           → Products (catalogued, legacy route)
```

**Knowledge System Routes (30 pages)**
```
/knowledge-system                                        → Main hub
/knowledge-system/science                               → Filtration Science
/knowledge-system/bridges                               → Bridge hub
/knowledge-system/bridges/industrial-filtration         → Bridge: Selection Framework
/knowledge-system/bridges/oem-replacement               → Bridge: OEM Replacement
/knowledge-system/bridges/aftermarket-selection         → Bridge: Aftermarket
/knowledge-system/bridges/fleet-solutions               → Bridge: Fleet Solutions
/knowledge-system/standards                             → Standards hub
/knowledge-system/standards/lube-oil-systems            → Lube Oil domain
/knowledge-system/standards/air-intake-systems          → Air Intake domain
/knowledge-system/standards/cabin-safety-systems        → Cabin Safety domain
/knowledge-system/standards/fuel-systems                → Fuel Systems domain
/knowledge-system/standards/hydraulic-systems           → Hydraulic Systems domain
/knowledge-system/standards/compressed-air-systems      → Compressed Air domain
/knowledge-system/standards/iso-4406                    → ISO 4406 definition
/knowledge-system/standards/iso-5011                    → ISO 5011 definition
/knowledge-system/standards/iso-16889                   → ISO 16889 definition
/knowledge-system/contamination                         → Contamination hub
/knowledge-system/contamination/particle-wear           → Particle Wear case study
/knowledge-system/contamination/diesel-water            → Diesel Water case study
/knowledge-system/contamination/hydraulic-system        → Hydraulic Contamination case study
/knowledge-system/fleet                                 → Fleet hub
/knowledge-system/fleet/reducing-downtime               → Reducing Downtime strategy
/knowledge-system/fleet/fuel-efficiency                 → Fuel Efficiency strategy
/knowledge-system/fleet/total-cost-ownership            → TCO strategy (Fleet)
/knowledge-system/compare                               → Compare hub
/knowledge-system/compare/system-vs-commodity           → System vs Commodity
/knowledge-system/compare/evaluation-framework          → Evaluation Framework
/knowledge-system/compare/oem-comparison                → OEM Comparison
/knowledge-system/compare/total-cost-ownership          → TCO analysis (Compare)
```

### 1.4 Industries (12 total in catalogue.json)

Agriculture · Automotive · Bus & Coach · Construction · Manufacturing · Marine · Mining · Oil & Gas · Power Generation · Railway · Trucks & Fleets · Waste Municipal

### 1.5 Systems / Products (12 in catalogue.json)

Air Filters · Fuel Filters · Oil Filters · Hydraulic Filters · Cabin Filters · Coolant Filters · Air Dryers · Fuel Separators · Housings & Accessories · Marine Filters · Kits · Other Systems

### 1.6 Technologies (12 in catalogue.json, 9 displayed on hub)

MACROCORE™ · SYNTEPORE™ · INTEKCORE™ · DRYCORE™ · AQUAGUARD™ · SYNTRAX™ · NANOFORCE™ · COOLTECH™ · MICROKAPPA™ · MARINECLEAN™ · DURATECH™ · Aquaguard Series

Technology logos: 12 `.png` files in `/public/assets/`  
Technology definitions: `techPagesData.ts` per-page data + `GEO_DEFINITIONS` object in technologies hub

### 1.7 Knowledge System Content State

| Category | Pages | Semantic Links | RetrievalBlock | AI Citation Layer |
|----------|-------|---------------|----------------|------------------|
| Bridge Pages | 4 | ✅ ~19 links total | ✅ Present | ✅ Full (JSON-LD + canonical block) |
| Hub Pages | 7 | ❌ None | ✅ Some | ❌ Incomplete |
| Standards Domains | 6 | ❌ None | ❌ Missing | ❌ Missing |
| Standards Definitions | 3 | ❌ None | ❌ Missing | ❌ Missing |
| Contamination Pages | 3 | ❌ None | ❌ Missing | ❌ Missing |
| Fleet Pages | 3 | ❌ None | ❌ Missing | ❌ Missing |
| Compare Pages | 4 | ❌ None | ❌ Missing | ❌ Missing |

**Only 4 of 30 Knowledge System pages are fully implemented** per the SEMANTIC_RANKING_LAYER + AI Citation Layer specifications.

### 1.8 Existing AI Integrations

**GEO Content Layer** — Machine-readable text blocks hidden in DOM  
- Home page: `display:none` div with factual company summary  
- Industries page: Direct Answer Block (visible, styled)  
- Technologies page: `GEO_DEFINITIONS` object (prose definitions per technology)

**RetrievalBlock Component** (`/src/components/RetrievalBlock.tsx`)  
- Collapsed by default (accessible to crawlers via DOM)  
- Contains: `SEMANTIC_DOMAINS`, `SYSTEMS_AFFECTED`, `CONCEPT_TAXONOMY`, `INTERNAL_REFERENCES`, `CITATION_METADATA`  
- Tracks expand/collapse events via analytics  
- Present on: Knowledge System hub, Standards hub, Science page, Bridge pages (4)

**JSON-LD Schemas** (implemented on multiple pages)  
- `Organization` schema in root `layout.tsx`  
- `WebSite` schema with `SearchAction` pointing to `part-search.elimfilters.com`  
- `CollectionPage`, `FAQPage` on Knowledge System hub  
- `ItemList` + `BreadcrumbList` + `FAQPage` on Technologies hub  
- `WebPage` + `FAQPage` + `BreadcrumbList` + `ItemList` on Industries hub

**Analytics Semantic Tracking** (`/src/lib/analytics.ts`)  
- `trackKnowledgePageView(path, domain, conceptId)` — semantic domain tagging  
- `trackKnowledgeTraversal(from, to, linkType)` — graph traversal events  
- `trackBridgeEntry(bridgePage, referrer)` — bridge page entry  
- `trackFleetConversion(step, fromPage)` — fleet funnel  
- `trackSearchIntent(query, intentType)` — intent classification  
- Microsoft Clarity custom tags: `semantic_domain`, `concept_id`

**Knowledge Architecture Graph** (`/src/lib/knowledge-architecture.ts`)  
- TypeScript data structures: TECHNOLOGIES (6), STANDARDS (6), CONTAMINATION_MODES (3), INDUSTRIES (7)  
- Query functions: `getTechnologyByIndustry`, `getContaminationByTechnology`, `getStandardsByTechnology`, `getRelatedTechnologies`, `mapKnowledgeNetwork`  
- Educational Pathways: TECHNICIAN_ONBOARDING, EQUIPMENT_OPERATOR, FLEET_MANAGER

**Geo-Language Detection** (`/src/lib/geoLanguage.ts`)  
- External API: `https://ip-api.com/json/`  
- 70+ country → language mappings  
- 7-day localStorage cache  
- US/CA suppresses language switcher

### 1.9 Search Architecture

**External Part Search**: `https://part-search.elimfilters.com`  
- Separate standalone HTML application (`/part-search/index.html`)  
- Uses canvas-based cinematic splash screen  
- Cross-references OEM and competitor codes  
- Integrated via `SearchAction` in JSON-LD and CTAs throughout the site

**Internal Search**: None — no in-app search  
**Backend API** (`/server.js`): `/api/search?q=` endpoint exists but returns 500 due to DB timeout

### 1.10 Semantic Domain Map (Documented)

Five semantic domains defined in `SEMANTIC_RANKING_LAYER.md`:
1. **Contamination Control Systems** (core)
2. **Hydraulic Efficiency Systems** (specialized)
3. **Diesel Fuel Integrity Systems** (specialized)
4. **Air Intake Filtration Systems** (specialized)
5. **Asset Protection Systems** (meta-domain)

---

## 2. WHAT PARTIALLY EXISTS

### 2.1 10-Point Architecture

Defined in `CLAUDE.md` as the standard for all Knowledge System pages:
- **Implemented fully**: Bridge pages only (4/30)
- **Implemented partially**: Hub pages have some points (hero, FAQs, stats) but lack Points 3–10
- **Not implemented**: 22 of 30 pages

### 2.2 Semantic Ranking Layer

Documented in `SEMANTIC_RANKING_LAYER.md` with complete domain assignments and linking rules:
- **Implemented**: Bridge pages — 4/4 pages with semantic links, domain tags, and RetrievalBlocks
- **Not implemented**: 26 pages remain without semantic links, domain tags, or Retrieval Blocks

### 2.3 AI Citation Layer

Documented in `CLAUDE.md` with full `CANONICAL KNOWLEDGE BLOCK` format:
- **Implemented**: Bridge pages — JSON-LD TechArticle, canonical block, version tracking
- **Not implemented**: 26 pages lack canonical blocks

### 2.4 technology Registry

Two technology registries exist in parallel but are not synchronized:
- `knowledge-architecture.ts`: 6 technologies (MACROCORE, NANOFORCE, MICROKAPPA, SYNTRAX, AQUAGUARD, DURATECH)
- `catalogue.json` + `techPagesData.ts`: 12 technologies (adds SYNTEPORE, INTEKCORE, DRYCORE, COOLTECH, MARINECLEAN, Aquaguard Series)
- `GEO_DEFINITIONS` in `technologies/page.tsx`: 12 prose definitions

These three registries are independent with no shared source of truth.

### 2.5 Standards Definition Pages

3 of the referenced standards have dedicated pages (iso-4406, iso-5011, iso-16889). Many others are referenced throughout the content but lack pages:
- SAE J1539, ASTM D6304, NFPA T2.14, DIN 51524, ISO 8573-1, ISO 11155, ISO 12937

### 2.6 Demand Interception Layer

Fully documented in `DEMAND_INTERCEPTION_LAYER.md` with intent classification (Product/Problem/System), routing architecture, three mandatory hub pages, and reframing content requirements:
- **Implemented**: None of the routing logic exists in code
- **Planned hubs not built**: `/knowledge-system/contamination-control-hub`, `/knowledge-system/fleet-optimization-hub`
- **Reframing content**: Not added to bridge pages as specified

### 2.7 Obsidian-Style Internal Linking

Strategy defined (see Semantic Ranking Layer). Sparse implementation:
- Bridge pages: ~19 internal links total
- All other 26 Knowledge System pages: 0 semantic links

### 2.8 Industry Data Synchronization

- `catalogue.json`: 12 industries with full content
- `knowledge-architecture.ts INDUSTRIES`: 7 industries (AGRICULTURE, CONSTRUCTION, MINING, MARINE, AUTOMOTIVE, MANUFACTURING, POWER_GENERATION)
- 5 industries are in the catalogue but absent from the knowledge architecture: Bus & Coach, Railway, Trucks & Fleets, Oil & Gas, Waste Municipal

---

## 3. WHAT DOES NOT EXIST

### 3.1 Blueprint Reference File

`AI_ECOSYSTEM_BLUEPRINT.md` — referenced in the task prompt — **does not exist** in the repository. The closest equivalents are `DEMAND_INTERCEPTION_LAYER.md`, `SEMANTIC_RANKING_LAYER.md`, and the `CLAUDE.md` documentation.

### 3.2 Missing Hub Pages

| Route | Status |
|-------|--------|
| `/knowledge-system/contamination-control-hub` | ❌ Does not exist |
| `/knowledge-system/fleet-optimization-hub` | ❌ Does not exist |

### 3.3 Missing Standard Pages

| Standard | Referenced In | Page Exists |
|----------|--------------|-------------|
| SAE J1539 | knowledge-architecture.ts, multiple pages | ❌ |
| ASTM D6304 | knowledge-architecture.ts, standards hub | ❌ |
| NFPA T2.14 | knowledge-architecture.ts, hydraulic page | ❌ |
| DIN 51524 | knowledge-architecture.ts | ❌ |
| ISO 8573-1 | contamination pages, compressed air domain | ❌ |
| ISO 11155 | cabin safety domain | ❌ |
| ISO 12937 | fuel systems domain | ❌ |

### 3.4 Missing Features (per Blueprint Documents)

- **Intent classification middleware** — No Next.js middleware exists
- **Query parameter routing** (`?intent=product|problem|system`) — Not implemented
- **Product access restrictions** — Direct `/products/[slug]` access is unrestricted
- **Condition-based replacement calculator** — Referenced in fleet pages, not built
- **ROI calculators** — Mentioned in CLAUDE.md Next Tasks, not built
- **Particle counting training resources** — Referenced, not built
- **AI Citation Index** — Machine-readable registry of all definitions (Phase 6 of Citation Layer)
- **Personalized intent routing** — Phase 6 of Demand Interception Layer

### 3.5 Missing Analytics Implementations

- `trackKnowledgePageView()` — Function defined in analytics.ts but not called on any page
- `trackKnowledgeTraversal()` — Defined, not wired to any link clicks
- `trackBridgeEntry()` — Defined, not called
- `trackFleetConversion()` — Defined, not called
- `trackSearchIntent()` — Defined, not called
- PostHog initialization — Declared in analytics.ts but no PostHog SDK loaded
- Microsoft Clarity — `window.clarity` calls in analytics.ts but script not injected

### 3.6 No Type-check Script

`package.json` has no `type-check` script despite CLAUDE.md referencing `npm run type-check`. Only `lint` exists.

---

## 4. REUSABLE COMPONENTS

| Component | File | Usage | Reusability |
|-----------|------|-------|-------------|
| `Navigation` | `Navigation.tsx` | Global — all pages via layout or direct import | ✅ High |
| `Footer` | `Footer.tsx` | Global — home page and some sections | ⚠️ Medium (not in layout, manually added) |
| `RetrievalBlock` | `RetrievalBlock.tsx` | Knowledge System pages | ✅ High — drop-in with children |
| `AnimateIn` | `AnimateIn.tsx` | Entrance animations | ✅ High — used across pages |
| `StaggerContainer` + `itemVariants` | `AnimateIn.tsx` | Grid animations | ✅ High — technologies hub |
| `StatCounter` | `StatCounter.tsx` | Animated numeric counters | ✅ Medium |
| `CTASection` | `CTASection.tsx` | CTA blocks | ✅ Medium |
| `TechCard` | `TechCard.tsx` | Technology cards | ✅ Medium |
| `TechDetailPage` | `TechDetailPage.tsx` | Technology detail view | ✅ High — template pattern |
| `CategoryPage` | `CategoryPage.tsx` | Category listing template | ✅ High |
| `CategoryGrid` | `CategoryGrid.tsx` | Grid for category display | ✅ Medium |
| `FeatureList` | `FeatureList.tsx` | Feature bullet lists | ✅ Medium |
| `ScrollProgress` | `ScrollProgress.tsx` | Page scroll indicator | ✅ Medium |
| `CustomCursor` | `CustomCursor.tsx` | Custom mouse cursor | ✅ Low (decorative) |
| `ClientProviders` | `ClientProviders.tsx` | i18n + React context wrapper | ✅ High — global |
| `Analytics` | `Analytics.tsx` | GA4 analytics component | ✅ High — global |
| `Hero` | `Hero.tsx` | Page hero sections | ✅ Medium |

**Product-specific page components** (in `/components/`, one per product type):
AirfilterPage, AquaguardPage, CabinPage, CoolantPage, DryerPage, FuelPage, FuelSeparatorPage, HousingPage, HydraulicPage, KitsPage, MarinePage, OilPage

These are template components instantiated by `/products/[slug]/page.tsx` and `/systems/[slug]/SystemPageClient.tsx`.

**SpotlightCard** — Defined inline in `page.tsx` (Home page). Not extracted to a component despite being used multiple times. Candidate for extraction.

**NavLink** — Defined inline in `Navigation.tsx`. Self-contained, not reusable externally.

---

## 5. REUSABLE ROUTES

### 5.1 Dynamic Slug Pattern

The `[slug]` pattern is fully implemented and reusable for all catalogue sections:
```
/industries/[slug]  → getItemBySlug('industries', slug)
/systems/[slug]     → getItemBySlug('products', slug)
/technologies/[slug]→ getItemBySlug('technologies', slug)
```

Adding a new industry/system/technology requires only a `catalogue.json` entry. No new page file needed.

### 5.2 Knowledge System Sub-routing

All Knowledge System sections follow the same pattern:
```
/knowledge-system/[section]         → Hub page
/knowledge-system/[section]/[page]  → Leaf page
```

Each `layout.tsx` in the Knowledge System tree is minimal (metadata only), making the pattern trivially extensible.

### 5.3 The 8-Section Content Pattern

Every Knowledge System leaf page follows a consistent structure:
1. Fixed back-navigation link
2. Hero section with gradient + breadcrumb tag + h1 + description
3. 6-8 numbered content sections (01/ through 0N/)
4. FAQ section
5. Related systems navigation grid
6. RetrievalBlock

This pattern is implicitly reusable as a content template but is not currently extracted into a shared component.

---

## 6. TECHNICAL RISKS

### 6.1 Database Failure (HIGH)
`/server.js` connects to PostgreSQL via `DATABASE_URL`. The HEALTH_REPORT confirms a timeout (`ETIMEDOUT 66.33.22.248:18263`). The `/api/search` and `/api/stats` endpoints return HTTP 500. The part-search app and the contact form depend on this.

### 6.2 SMTP Not Configured (HIGH)
`GODADDY_MAIL_PASS` is not set. The contact form at `/contact` calls `/api/contact` which attempts GoDaddy SMTP and returns HTTP 500.

### 6.3 Third-Party GeoIP Dependency (MEDIUM)
`geoLanguage.ts` calls `https://ip-api.com/json/` with a 3-second timeout. This third-party service has no SLA. Failure silently falls back to `en`/`US` — acceptable but undocumented. The rate limit on ip-api.com free tier (45 requests/minute) could trigger at high traffic.

### 6.4 Font Not Loaded (MEDIUM)
`Footer.tsx` uses `fontFamily: "'Barlow Condensed', sans-serif"` and `fontFamily: 'Barlow, sans-serif'`. Neither `Barlow` nor `Barlow Condensed` is loaded in `layout.tsx` (which loads Space Grotesk, Outfit, JetBrains Mono, Montserrat). The footer text will fall back to system sans-serif — visibly inconsistent.

### 6.5 Duplicate TCO Routes (MEDIUM)
Two pages cover "Total Cost of Ownership":
- `/knowledge-system/fleet/total-cost-ownership`
- `/knowledge-system/compare/total-cost-ownership`

These are two separate files with different content angles. No canonical tag differentiates them for search engines. Risk of duplicate content penalty.

### 6.6 PostHog/Clarity Not Initialized (LOW-MEDIUM)
`analytics.ts` calls `window.posthog?.capture()` and `window.clarity?.('set', ...)`. Neither PostHog SDK nor Clarity script is loaded anywhere in the app. All PostHog and Clarity calls silently no-op. Analytics data for knowledge graph traversal and retrieval block interactions is being lost.

### 6.7 Static Build vs. Dynamic Search (LOW-MEDIUM)
The site is a Next.js static export (`output: 'export'` implied by the build producing `/out/`). The `SearchAction` in the `WebSite` JSON-LD schema points to `part-search.elimfilters.com`, which is a separate external app. However, the server.js backend (which handles `/api/search`) would need to be a separately running process. The architecture is dual: static frontend + separate Node.js backend + separate part-search HTML app. This split is not documented and creates deployment complexity.

### 6.8 Accessibility: Navigation Missing About Page (LOW)
The `About` page (`/about`), `Warranty` page (`/warranty`), and `Distributor Application` page (`/distributor-application`) all exist as full pages but are absent from the main Navigation component. They are only reachable via the Footer.

---

## 7. TECHNICAL DEBT

### 7.1 Two Unsynchronized Technology Registries
`knowledge-architecture.ts` defines 6 technologies. `catalogue.json` defines 12. `techPagesData.ts` has individual page data. `GEO_DEFINITIONS` in `technologies/page.tsx` has 12 prose definitions. These are four independent data sources that must be manually kept in sync. Any addition to one is not reflected in the others.

### 7.2 Two Unsynchronized Industry Registries
`knowledge-architecture.ts` has 7 industries. `catalogue.json` has 12. Bus & Coach, Railway, Trucks & Fleets, Oil & Gas, and Waste Municipal are missing from the knowledge architecture, meaning `getTechnologyByIndustry()` and `mapKnowledgeNetwork()` cannot serve these 5 industries.

### 7.3 26 Knowledge System Pages Not Upgraded
Per `EXECUTION_BLUEPRINT_PHASE1_MAPPING.md`, only 4 bridge pages are complete. 26 pages lack:
- Semantic domain assignment
- Internal knowledge links (2-3 per page)
- RetrievalBlock with machine-readable data
- AI Citation Layer (Canonical Knowledge Block + JSON-LD TechArticle)
- 10-Point Architecture compliance

### 7.4 SpotlightCard Not Extracted
`SpotlightCard` is a sophisticated interactive component (radial gradient mouse-tracking spotlight) defined inline in `app/page.tsx`. It is used 3 times on the home page. It should be extracted to `/components/SpotlightCard.tsx` for reuse across Knowledge System and product pages.

### 7.5 No type-check Script
`package.json` only has `dev`, `build`, `start`, `lint`. The CLAUDE.md workflow references `npm run type-check` which doesn't exist. TypeScript errors are only caught during `build`.

### 7.6 Tailwind Installed but Unused
`tailwindcss@^3.4.1` is a devDependency. The `tailwind.config.ts` is present. However, all styling is done via inline CSS. Tailwind is loaded as a build dependency but produces no CSS output. This is dead weight.

### 7.7 SYNTRAX / SINTRAX Naming Inconsistency
`knowledge-architecture.ts` uses `SYNTRAX`. `catalogue.js` `getTechLogoFile` maps `'Syntrax'` to `'logo-sintrax.png'`. The asset file is `sintrax(fn).avif`. The public-facing technology name appears as "SYNTRAX" in content but "sintrax" in assets. This creates a silent mismatch between display name and asset path.

### 7.8 NANOFORCE_HYDRAULIC Referenced but Does Not Exist
In `knowledge-architecture.ts`, the CONSTRUCTION industry references `'NANOFORCE_HYDRAULIC'` as an applicable technology. No `NANOFORCE_HYDRAULIC` entry exists in the TECHNOLOGIES record. Calling `getTechnologyByIndustry('CONSTRUCTION')` will return `undefined` in the array, causing runtime errors if callers do not guard against it.

### 7.9 Back Navigation Pattern Inconsistency
Some Knowledge System pages use a `← HOME` back button (Technologies, Industries), while others use `← KNOWLEDGE` or `← STANDARDS` or `← BRIDGES`. This is inconsistent UX with no defined rule.

### 7.10 Analytics Functions Defined but Never Called
`trackKnowledgePageView`, `trackKnowledgeTraversal`, `trackBridgeEntry`, `trackFleetConversion`, `trackSearchIntent` are all exported from analytics.ts but are not called in any page component. The semantic intent classification system is fully designed but produces zero data.

---

## 8. ARCHITECTURE CONFLICTS

### 8.1 Three-App Architecture Without Clear Separation

The repository hosts three distinct applications with no shared build system or clear deployment boundary:

| App | Location | Technology | Purpose |
|-----|----------|-----------|---------|
| Main Catalogue | `/frontend/` | Next.js 14 | Product catalogue + knowledge system |
| Backend API | `/server.js` (root) | Node.js + Express | Search, contact, stats APIs |
| Part Search | `/part-search/index.html` | Vanilla HTML/JS | OEM cross-reference search |

These three apps have separate tech stacks, separate deployment requirements, and no shared data layer. The `server.js` is a separate process from Next.js. The part-search HTML is served from `part-search.elimfilters.com` (separate domain).

### 8.2 knowledge-architecture.ts Is a Data Island

The `knowledge-architecture.ts` file is a sophisticated relational graph (Technologies ↔ Standards ↔ Contamination ↔ Industries), but it is **not used in any page component**. The Knowledge System pages hardcode their own local data arrays. The graph exists as a standalone library but is disconnected from the rendered content.

### 8.3 Canonical Tag Conflict: Duplicate TCO Pages

`/knowledge-system/fleet/total-cost-ownership` and `/knowledge-system/compare/total-cost-ownership` both serve "Total Cost of Ownership" content with no `rel=canonical` differentiation. This creates a search engine indexing conflict.

### 8.4 Search Architecture Split

The `WebSite` JSON-LD `SearchAction` targets `part-search.elimfilters.com`. The server.js has an internal `/api/search` endpoint. These are two separate, non-integrated search systems. Users arriving via schema.org search targets go to an external domain; users using the internal API (when it works) go to the Node.js backend. There is no unified search layer.

### 8.5 Technologies Page vs. Knowledge Architecture Technology Count

The technologies hub page renders `catalogue.technologies` (12 entries). The `TECH_COMPARISON` table shows 9 technologies. The `knowledge-architecture.ts` defines 6. These three counts reflect three different categorization schemes in the same application with no reconciliation.

### 8.6 Navigation Excludes Knowledge-Critical Pages

The global navigation links to `/knowledge-system` as a single entry point but omits direct links to `/knowledge-system/standards`, `/knowledge-system/contamination`, `/knowledge-system/fleet`, and `/knowledge-system/compare`. The Footer's "Knowledge" column links to three sub-sections (Knowledge System, Standards, Fleet Optimization) but not Contamination or Compare. This creates an asymmetric discovery path.

---

## 9. OBSIDIAN INTEGRATION OPPORTUNITIES

The knowledge architecture and semantic linking strategy already follows an Obsidian-style bidirectional graph model. The infrastructure for Obsidian-compatible export exists in concept:

### 9.1 Existing Conceptual Graph

`knowledge-architecture.ts` defines a typed graph:
- Nodes: Technologies, Standards, Contamination Modes, Industries
- Edges: `relatedStandards[]`, `addressesContamination[]`, `applicableIndustries[]`, `resolvedBy[]`
- Query functions: `mapKnowledgeNetwork(nodeId, nodeType)` — returns full connection graph

This is directly expressible as Obsidian vault links (`[[Technology: MACROCORE]]`, `[[Standard: ISO 16889]]`).

### 9.2 Implementation Opportunity: Obsidian Vault Export

A build script could generate `.md` files from `knowledge-architecture.ts` + page content, creating:
- One `.md` file per Technology, Standard, Contamination Mode, Industry
- `[[WikiLinks]]` between related nodes
- Frontmatter: `type`, `domain`, `standards`, `technologies`, `industries`
- Obsidian canvas visualization of the knowledge graph

### 9.3 Bidirectional Link Tracking

The Semantic Ranking Layer already defines link types (Definition, Failure Mechanism, Standards, Technology, Operational Impact). These map directly to Obsidian link type annotations and could power a visual knowledge graph.

### 9.4 Retrieval Block as Obsidian Dataview Source

The `CANONICAL KNOWLEDGE BLOCK` format in the RetrievalBlock is machine-parseable. An Obsidian Dataview plugin could query these blocks to build cross-reference tables across the entire knowledge system.

---

## 10. PART SEARCH INTEGRATION OPPORTUNITIES

### 10.1 Current State

Part Search exists as a standalone HTML application at `/part-search/index.html`, served separately at `part-search.elimfilters.com`. It uses vanilla JavaScript with canvas-based particle animations and queries the Node.js backend via `/api/search`.

### 10.2 Opportunities

**A. In-App Search Widget**  
Add a compact part number lookup widget to the home page, technology pages, and industry pages. Posts to the external Part Search URL with a pre-filled query parameter. No backend change needed.

**B. Cross-Reference on Technology Pages**  
Each technology page (`/technologies/[slug]`) could include a "Find Parts Using This Technology" link with pre-filtered search: `https://part-search.elimfilters.com?technology=MACROCORE`. Requires Part Search to accept URL parameters.

**C. Industry-Filtered Search Entry Points**  
Each industry page could link to Part Search pre-filtered by equipment type: `?industry=mining`. Maps directly to the existing industry taxonomy in `catalogue.json`.

**D. Inline Search on Knowledge System Pages**  
Standards pages (e.g., `/standards/lube-oil-systems`) could include a "Find Filters for This System" inline search that routes to Part Search with domain pre-filter.

**E. SearchAction Schema Enhancement**  
Currently, the `WebSite` JSON-LD `SearchAction` points to Part Search. This could be extended to include domain-specific search intents per the semantic domain architecture.

---

## 11. AI INTEGRATION OPPORTUNITIES

### 11.1 Immediate (Infrastructure Exists, Wiring Missing)

**A. Wire Analytics Tracking Functions**  
All 5 semantic analytics functions exist in `analytics.ts` but are never called. Adding `trackKnowledgePageView()` calls to Knowledge System page `useEffect` hooks would immediately enable semantic intent data collection.

**B. Activate PostHog + Microsoft Clarity**  
Load PostHog SDK and Clarity script in `layout.tsx`. Both are declared in analytics.ts. This enables session recording, heatmaps on knowledge pages, and AI-readable behavioral segmentation.

**C. Complete Retrieval Blocks on 26 Pages**  
The `RetrievalBlock` component is ready. Adding it to the 26 incomplete pages makes the entire Knowledge System machine-readable with structured semantic metadata.

### 11.2 Near-Term (Architecture Partially Ready)

**D. AI Citation Index**  
A static JSON endpoint (`/api/knowledge-index.json` or `/knowledge-index.json` as a static file) exposing all Canonical Knowledge Block data from all 30 pages. LLMs could fetch this as a single structured reference document.

**E. Canonical Knowledge Blocks on All Pages**  
The 10-Point Architecture Point 10 (Canonical Explanation Block) + the AI Citation Layer `CANONICAL KNOWLEDGE BLOCK` need to be added to the 26 incomplete pages. This is the highest-priority AI readiness task.

**F. Intent Classification Analytics**  
`trackSearchIntent()` in analytics.ts is designed to capture query intent. Wiring this to the Part Search integration and any search inputs would begin building an intent dataset.

### 11.3 Structural (Requires New Development)

**G. Knowledge Graph API**  
Expose `knowledge-architecture.ts` functions as a JSON API endpoint (`/api/knowledge?node=MACROCORE&type=technology`). LLMs could traverse the knowledge graph programmatically to find related standards, contamination modes, and technologies.

**H. Demand Interception Middleware**  
Implement the intent classification routing from `DEMAND_INTERCEPTION_LAYER.md` as Next.js middleware (`middleware.ts`). Classify incoming traffic by intent and route to appropriate Knowledge System entry points.

**I. Structured Data for Each Standard**  
Add `DefinedTerm` JSON-LD schema to each standard definition page (ISO 4406, ISO 16889, ISO 5011). This enables LLMs to cite ELIMFILTERS definitions with schema-validated authority.

**J. Per-Page TechArticle JSON-LD**  
Bridge pages have TechArticle JSON-LD. The 22 remaining Knowledge System pages need TechArticle schemas with `mentions`, `about`, and `citation` properties per the AI Citation Layer specification.

---

## 12. RECOMMENDED IMPLEMENTATION ORDER

### Priority 1 — Fix Broken Infrastructure (Blockers)

1. **Configure `DATABASE_URL`** — Restores `/api/search` and contact form
2. **Configure `GODADDY_MAIL_PASS`** — Restores contact form email delivery
3. **Load Barlow Condensed font** in `layout.tsx` — Fixes footer typography regression
4. **Fix `NANOFORCE_HYDRAULIC` reference** in `knowledge-architecture.ts` — Eliminates runtime undefined error

### Priority 2 — Complete the AI Readiness Layer (Core Mission)

5. **Add `RetrievalBlock` to 26 Knowledge System pages** — Machine-readable metadata on all pages
6. **Add AI Citation Layer (Canonical Knowledge Block + JSON-LD TechArticle)** to 26 pages — Full AI citation capability
7. **Wire `trackKnowledgePageView()` calls** into Knowledge System pages — Enables semantic intent data
8. **Add `rel=canonical`** to differentiate the two TCO pages

### Priority 3 — Extend Knowledge Architecture (Content Completeness)

9. **Sync `knowledge-architecture.ts` to 12 technologies** — Align with catalogue.json
10. **Sync `knowledge-architecture.ts` to 12 industries** — Add missing 5 verticals
11. **Build missing standard pages** (SAE J1539, ASTM D6304, ISO 8573-1, ISO 11155) — Fill referenced but missing content
12. **Build Contamination Control Hub** (`/knowledge-system/contamination-control-hub`) — Required hub per Demand Interception Layer
13. **Build Fleet Optimization Hub** (`/knowledge-system/fleet-optimization-hub`) — Required hub per Demand Interception Layer

### Priority 4 — Implement Demand Interception (Conversion Layer)

14. **Add semantic links (2-3 per page)** to the 26 incomplete Knowledge System pages per SEMANTIC_RANKING_LAYER.md
15. **Add reframing content sections** to 4 Bridge pages per DEMAND_INTERCEPTION_LAYER.md
16. **Implement Next.js middleware** for intent-based routing

### Priority 5 — Platform Unification (Technical Debt Reduction)

17. **Extract `SpotlightCard`** from `page.tsx` to `/components/SpotlightCard.tsx`
18. **Add `type-check` script** to `package.json`
19. **Remove Tailwind** (unused devDependency) or adopt it
20. **Add `AI_ECOSYSTEM_BLUEPRINT.md`** — The referenced document does not exist; create it to consolidate the 4 existing strategy documents
21. **Activate PostHog + Clarity** by loading their SDKs in `layout.tsx`
22. **Add About, Warranty, Distributor links** to main Navigation

---

## SUMMARY TABLE

| Area | Complete | Partial | Missing |
|------|---------|---------|---------|
| Application infrastructure | ✅ | — | — |
| Navigation | ✅ | — | Missing About/Warranty links |
| Industries (12) | ✅ | — | 5 not in knowledge-architecture.ts |
| Systems (12) | ✅ | — | — |
| Technologies (12) | ✅ | — | knowledge-architecture.ts has only 6 |
| Knowledge System (30 pages) | 4 pages | 7 hub pages | 19 leaf pages |
| AI Citation Layer | 4 pages | — | 26 pages |
| Semantic Ranking Layer | 4 pages | — | 26 pages |
| Demand Interception Layer | 0 pages | Documented | All 30 pages |
| Fleet Optimization | 3 pages (content) | — | Hub page |
| Contamination Hub | — | 3 case study pages | Dedicated hub |
| Part Search integration | External app | — | In-app widget |
| Analytics (semantic) | GA4 | — | PostHog/Clarity/traversal |
| Backend API | Running | — | DB/email broken |

---

*Audit generated: 2026-06-02*  
*Repository: latamfilters/world-catalogue*  
*Branch: claude/dazzling-franklin-ALGY1*
