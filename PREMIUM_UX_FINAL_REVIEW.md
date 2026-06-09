# PREMIUM UX FINAL REVIEW
## ELIMFILTERS® — Design Direction Approval Document

**Review date:** June 2026  
**Scope:** Premium UX Layer — 6 HTML mockups evaluated  
**Decision required:** Approve / Approve with modifications / Reject  

---

## 1. WHAT IMPROVED

### 1.1 First Impression — Fundamental Change

**Before:** The homepage opens with "ENGINE FILTRATION / Heavy-Duty and Light-Duty" over a dark gradient. A visitor understands within 3 seconds that this is a filtration company website. They do not feel anything.

**After:** The homepage opens with "PROTECTING INDUSTRIAL ASSETS" over an amber dust particle field. A visitor understands within 3 seconds that contamination threatens their equipment and this brand protects it. The emotional register shifts from *information delivery* to *operational relevance*.

This is the most significant single improvement in the set. The headline change is one sentence. The surrounding visual context — the particle field, the color language, the brand claim replacing the category description — makes that sentence land differently.

**Verdict:** Material improvement. Approved.

---

### 1.2 Problem Communication — From Text to Experience

**Before:** "What you can't see is stopping your fleet" followed by three bullet points (Injector Erosion, Bearing Friction, Fuel Drainage) beside a mechanic stock photo. A visitor reads a claim.

**After:** Three scroll-triggered animated states show bearing gap narrowing as particles accumulate, injector nozzle scoring under contaminated diesel, proportional valve spool jamming at 4–10µm clearance. A visitor *sees* the failure mechanism before reading about it.

This is the most technically ambitious element in the mockup set. It is also the most persuasive. The principle — make the invisible visible — is the core brand claim made experiential. Engineering buyers who encounter this section will recognize the accuracy of the failure diagrams. That recognition builds trust that a paragraph of description cannot.

**Verdict:** High-priority improvement. Approved.

---

### 1.3 Technology Communication — Specification to Demonstration

**Before:** A comparison table with 9 rows. MACROCORE™, filter system, function, metric, industries. A distributor's technical buyer reads a spec sheet.

**After:** Particle capture animation shows a large particle stopping at the outer cellulose layer (yellow flash), a medium particle caught in the composite media (yellow flash), a small particle captured at the synthetic depth layer (yellow flash). Clean fluid exits. Then: an ISO 16889 performance curve with animated S-curve stroke-in, 99.5% callout at 10µm. A technical buyer *sees* how the filter works before they read the specification.

No LATAM filtration competitor presents this on a website. It positions ELIMFILTERS® as a technical peer with engineering buyers rather than a product supplier.

**Verdict:** High-priority improvement. Approved.

---

### 1.4 Industry Pages — Template to Context

**Before:** 12 pages that share one template (CategoryPage.tsx). Mining and Agriculture are visually identical — different words, same layout. A mining procurement manager sees a page that could belong to any industry.

**After:** Mining opens with silica dust particles drifting across the hero. A contamination callout card presents Mohs hardness comparison (silica 7.0 vs. engine liner 5–6) and ingestion rates by operating condition (3–8 g/hr normal, 12–25 g/hr during blasting). This is operational intelligence specific to the mining environment.

The industry-specific ambient overlays and contamination callout cards make each of the 12 pages feel designed for the buyer visiting it. The template structure is preserved; the visual layer above it is differentiated.

**Verdict:** Medium-priority improvement. Approved.

---

### 1.5 Knowledge System — Information to Reading Experience

**Before:** Long sequential pages with numbered section headers and body prose. Excellent content with no visual hierarchy to aid scanning or establish emphasis.

**After:** Right-rail section progress indicator (01–08, active section highlighted). Inline metric highlights in yellow (#FFF12D) where key data appears in prose. Yellow-bordered pullquote blocks for the most operationally significant statements. Palantir-inspired knowledge network graph on the hub page showing contamination → standards → technologies as a connected system.

The content does not change. The reader's experience of navigating it does. Technical buyers who read long-form documentation — which is exactly who the knowledge system is built for — will complete more pages and extract more value.

**Verdict:** Medium-priority improvement. Approved.

---

### 1.6 Distributor Entry Point — Cold Form to Qualified Pathway

**Before:** CTA "BECOME A DISTRIBUTOR" → immediate form. Cold. A prospect who has never interacted with the program is asked to fill in a form before understanding what they are applying for.

**After:** CTA → territory flyout panel (slides in from right, cubic-bezier, 420px). Panel shows territory availability by country (Colombia/Mexico/Chile/Peru/Ecuador: Available; Venezuela: Contact us). Prospect confirms their territory is open before investing time in an application. Then: application page opens with a pre-form program summary (what ELIMFILTERS looks for, industries, territories) before the form fields.

This change does not alter the form, the Formspree integration, or the conversion flow. It adds one qualifying step and one contextualizing step that reduce unqualified applications and reduce form abandonment from qualified candidates who didn't understand what they were applying for.

**Verdict:** High-priority improvement. Approved.

---

### 1.7 Color Language — Aesthetic to Semantic

**Before:** Yellow (#FFF12D) is a brand accent. It appears on borders, headings, and buttons.

**After:** Yellow means protection. Every moment in the animations where contamination is captured — particles hitting filter media layers, failure diagrams converting to clean diagrams — is marked with a yellow flash. The brand color is now the color of the filtration act itself.

Red means failure (damage zones, failure states). Green means clear (fluid exiting filter clean).

This is subtle and will not be explicitly noticed by visitors. It will be felt. Color consistently applied with semantic meaning creates cognitive associations that accumulate over a page visit and deepen brand identity.

**Verdict:** Implicit improvement. Approve and enforce consistently in all future development.

---

## 2. WHAT SHOULD NOT BE IMPLEMENTED

### 2.1 The Full Pinned Scroll Section — As Specified

**The specification:** 400px of vertical scroll space, viewport pinned, three failure modes revealed sequentially as the user scrolls through the pinned zone.

**The risk:** iOS Safari has inconsistent behavior with position: sticky inside scroll containers. The pinned section behavior (scroll-driven reveal within a fixed viewport) is one of the most frequently broken patterns across browsers and devices. A mining operations manager checking the site on an older Android browser or an iPhone in low-power mode may get a broken experience — content jumps, fails to pin, or blocks scrolling entirely.

**The replacement:** Implement the three failure modes as a tab interface on mobile (tap to switch between Particle Wear / Injector / Valve) and as a horizontal reveal with a "Read more" expand on desktop. Preserve all content. Drop the scroll-pinning mechanism.

**What to keep from the concept:** All three SVG failure mode diagrams and their animations. The yellow protection sweep at the end. The content is approved. The pinning mechanism is not.

---

### 2.2 The Interactive Beta Ratio Performance Curve — In V1

**The specification:** An SVG performance curve where hovering at a point on the curve reveals the efficiency value at that particle size.

**The risk:** The curve must be based on actual laboratory test data (ISO 16889 certified). Rendering a curve that does not match the actual certified test results would be technically misleading to engineering buyers — the exact audience most likely to verify it. Until test reports are available and the curve data is confirmed, do not publish an interactive performance curve.

**What to keep:** The static S-curve shown in the mockup (without interactive data labels) is acceptable as a visual representation of general filtration efficiency behavior. Label it "Representative filtration efficiency curve — contact for ISO 16889 test data" until certified data is available.

---

### 2.3 The Knowledge Network Graph — On Hub Page V1

**The specification:** An SVG network diagram with contamination root → failure mode nodes → ISO standard nodes → technology nodes, building itself with CSS animations on page load.

**The risk:** The Knowledge System hub page already has strong SEO performance with its current FAQ and statistics section. Adding a complex SVG animation above the fold may slow initial page render (LCP impact), push the direct answer block below the fold, and add JavaScript complexity to a page that is currently clean static HTML. The SEO cost may exceed the engagement benefit.

**What to keep:** The concept is correct — the knowledge system is a network, not a list. Implement the network graph as a *below-the-fold* section, after the main content cards, not above them. This preserves the SEO structure while adding the visual depth element for engaged visitors who scroll.

---

### 2.4 Ambient Particle Animations on All 12 Industry Pages Simultaneously

**The specification:** Industry-specific ambient particle overlays (dust for mining/construction, organic particulates for agriculture, salt spray for marine) on all 12 industry detail pages.

**The risk:** 12 independently-specified CSS particle systems is a significant engineering investment for uncertain incremental return. Mining and Agriculture are the highest-priority LATAM industries. Building industry-specific particle animations for Bus Coach, Railway, and Waste Municipal in the first development phase diverts effort from higher-impact work.

**What to implement instead:** Build the particle overlay as a configurable component with 3-4 particle presets (dust/silica, organic/chaff, salt spray, industrial vapor). Apply to the 5 highest-priority industries first: Mining, Agriculture, Construction, Oil & Gas, Marine. Remaining 7 industries inherit the default ambient treatment.

---

### 2.5 The Horizontal Scroll Technology Gallery — On Mobile

**The specification:** As user scrolls vertically past the Technology heading, technology cards scroll horizontally, driven by scroll position.

**The risk:** Scroll-hijacking (where vertical scroll drives horizontal content movement) is natively confusing on touch devices. iOS and Android treat horizontal and vertical scroll gestures as distinct — intercepting vertical scroll to drive horizontal card movement produces unpredictable behavior on mobile and fails accessibility guidelines (WCAG 2.5.4).

**What to implement instead:** On desktop: horizontal scroll gallery as specified. On mobile: vertical stack of technology cards with a "swipe to explore" horizontal chip row at the top. The swipe gesture on a dedicated horizontal strip is native mobile behavior. Scroll hijacking is not.

---

## 3. ESTIMATED IMPLEMENTATION EFFORT

All estimates assume one experienced Next.js / Framer Motion frontend engineer. No new packages. No architectural changes.

### Phase 0 — Quick Wins (3–4 days)

| Item | Hours |
|------|-------|
| Stat context lines on homepage | 2h |
| Yellow inline metric highlights (Knowledge System) | 3h |
| Section progress rail (Knowledge System pages) | 4h |
| Pullquote block styling | 2h |
| CTA carousel progress indicator | 2h |
| Hover states on technology grid cards | 2h |
| Page transition fade (layout.tsx) | 2h |
| Pre-form program summary on distributor page | 3h |
| Footer brand statement | 1h |
| **Phase 0 total** | **~21 hours** |

### Phase 1 — Homepage Transformation (2–3 weeks)

| Item | Hours |
|------|-------|
| Hero headline + particle field (20 CSS particles, no pinning) | 8h |
| "PROTECTING INDUSTRIAL ASSETS" headline refactor | 2h |
| Three failure mode animated SVGs (bearing, injector, valve) | 16h |
| Tab interface for failure modes (desktop + mobile) | 8h |
| Yellow protection sweep animation | 4h |
| Stat cards with context lines | 3h |
| **Phase 1 total** | **~41 hours** |

### Phase 2 — Technology Pages (3–4 weeks)

| Item | Hours |
|------|-------|
| Technology card horizontal gallery (desktop) | 12h |
| Technology card vertical stack + chip row (mobile) | 8h |
| Filter mechanism SVG animation (3 layers, 3 particle sizes) | 20h |
| Static performance curve SVG (no interactive data yet) | 6h |
| Technology card ambient backgrounds (9 technologies) | 8h |
| **Phase 2 total** | **~54 hours** |

### Phase 3 — Industry Differentiation (3–4 weeks)

| Item | Hours |
|------|-------|
| Particle overlay component (configurable presets) | 10h |
| Contamination callout card component | 6h |
| Industry-specific data (5 priority industries) | 8h |
| Apply to 5 priority industries | 5h |
| Apply default treatment to remaining 7 industries | 3h |
| Mobile-optimized industry hero (portrait crop) | 6h |
| **Phase 3 total** | **~38 hours** |

### Phase 4 — Knowledge System + Distributor (2 weeks)

| Item | Hours |
|------|-------|
| Knowledge network graph (below-the-fold, hub page) | 12h |
| Territory flyout panel (homepage CTA) | 8h |
| Mobile navigation drawer | 10h |
| **Phase 4 total** | **~30 hours** |

### Total Effort Summary

| Phase | Duration | Hours | Priority |
|-------|----------|-------|----------|
| Phase 0: Quick Wins | 3–4 days | 21h | Immediate |
| Phase 1: Homepage | 2–3 weeks | 41h | High |
| Phase 2: Technology | 3–4 weeks | 54h | High |
| Phase 3: Industries | 3–4 weeks | 38h | Medium |
| Phase 4: KS + Distributor | 2 weeks | 30h | Medium |
| **TOTAL** | **11–15 weeks** | **~184 hours** | — |

At 40 hours/week: **~5 months, one engineer.**  
At 20 hours/week (part-time): **~9 months.**  
Accelerated with two engineers: **~8 weeks for Phases 0–2.**

---

## 4. RECOMMENDED ROLLOUT SEQUENCE

### Week 1–2 — Phase 0: Quick Wins (ship immediately, zero risk)

Execute all 9 quick wins. These are purely additive — no existing functionality changes. The site improves on day 1 with minimal engineering time. Visible to distributors and prospects immediately.

**Gate:** Phase 0 ships before any distributor outreach begins.

---

### Week 3–6 — Phase 1: Homepage Transformation (highest ROI)

The homepage is the first thing every prospect, distributor candidate, and media contact sees. The three failure mode SVG animations and the particle field deliver the highest perception shift per engineering hour of any item in the list.

**Gate:** Phase 1 ships before trade show appearances (Expomina, Exponor, Expocanidra 2026).

---

### Week 7–12 — Phase 2: Technology Pages (engineering credibility)

Technology detail pages are where technical buyers — procurement engineers, fleet managers, maintenance chiefs — make their evaluation. The mechanism animation and performance curve (static) are the elements most likely to convert a technical evaluator into a distribution advocate.

**Gate:** Phase 2 ships before the first distributor discovery calls with technical stakeholders.

---

### Week 13–16 — Phase 3: Industry Differentiation (territory relevance)

Industry pages are the entry point for search traffic from industry-specific queries ("filtration mining Colombia", "filtros hidráulicos agricultura"). Making these pages feel designed for the specific buyer improves both organic conversion and distributor discovery call quality.

**Gate:** Phase 3 ships within 6 months of program launch.

---

### Month 5–6 — Phase 4: Knowledge System + Distributor (depth engagement)

The knowledge network graph and territory flyout are engagement-depth improvements. They matter most once the brand has enough traffic and distributor candidates to generate meaningful conversion data. Phase 4 is informed by what Phases 0–3 reveal about visitor behavior.

**Gate:** Phase 4 ships after first 3 distributor agreements are signed and baseline analytics are established.

---

## 5. FINAL RECOMMENDATION

### APPROVE WITH MODIFICATIONS

**Approved as specified:**
- ✅ Homepage headline and brand claim shift
- ✅ Dust particle ambient field (homepage hero)
- ✅ Three failure mode SVG animations (non-pinned implementation)
- ✅ Yellow protection sweep reveal
- ✅ Stat cards with operational context lines
- ✅ Technology horizontal scroll gallery (desktop only)
- ✅ Filter mechanism particle capture animation
- ✅ Static performance curve (pending test data for interactive version)
- ✅ Industry contamination callout cards (5 priority industries first)
- ✅ Mining silica ambient particle overlay
- ✅ Knowledge System section progress rail
- ✅ Inline metric highlights in yellow
- ✅ Pullquote block styling
- ✅ Territory flyout panel on distributor CTA
- ✅ Pre-form program summary on application page
- ✅ All Phase 0 quick wins

**Not approved (requires modification before implementation):**
- ❌ Pinned scroll section → replace with tab interface (browser compatibility)
- ❌ Interactive Beta ratio curve → static curve only until ISO 16889 test data confirmed
- ❌ Knowledge network graph above the fold → move below main content section
- ❌ Particle animations on all 12 industry pages simultaneously → 5 priority industries first
- ❌ Horizontal scroll gallery on mobile → vertical stack with horizontal chip row

**Rationale for "Approve with Modifications" rather than full Approve:**

The Premium UX Layer is directionally correct. The design language, the emphasis on making contamination visible, and the shift from specification to demonstration are all appropriate for the brand and the buyer. The modifications are not rejections — they are adjustments to specific implementation risks that would undermine the quality of the overall experience if delivered as originally specified.

The result of "Approve with Modifications" is: 90% of the mockup concepts implemented, with 5 adjustments that make the remaining 10% more reliable, more performant, and more technically honest.

**The test for approval:** Would a mining procurement manager in Bogotá who visits the post-Phase-1 homepage form a stronger first impression of ELIMFILTERS® than today? Yes. Would they be more likely to respond to a LinkedIn message from ELIMFILTERS® after seeing this site? Yes. Would a distributor candidate in Santiago evaluate the brand more seriously? Yes.

**The Premium UX Layer is approved with the specified modifications. Begin Phase 0 immediately.**

---

## WORKSTREAM CLOSURE

The Premium UX workstream is now complete. The following documents have been produced:

| Document | Purpose | Status |
|----------|---------|--------|
| `WEBSITE_EXPERIENCE_MODERNIZATION_AUDIT.md` | Current UX assessment + opportunity map | ✅ Complete |
| `PREMIUM_UX_LAYER_VISUAL_PREVIEW.md` | Page-by-page experience specification | ✅ Complete |
| `PREMIUM_UX_MOCKUPS/01-homepage-hero.html` | Visual mockup — desktop + mobile | ✅ Complete |
| `PREMIUM_UX_MOCKUPS/02-contamination-animation.html` | Visual mockup — failure mode animations | ✅ Complete |
| `PREMIUM_UX_MOCKUPS/03-technology-gallery.html` | Visual mockup — gallery + mechanism | ✅ Complete |
| `PREMIUM_UX_MOCKUPS/04-industry-page.html` | Visual mockup — mining industry | ✅ Complete |
| `PREMIUM_UX_MOCKUPS/05-knowledge-system.html` | Visual mockup — reading experience | ✅ Complete |
| `PREMIUM_UX_MOCKUPS/06-distributor-experience.html` | Visual mockup — territory flyout + form | ✅ Complete |
| `PREMIUM_UX_MOCKUPS/index.html` | Mockup gallery + viewing instructions | ✅ Complete |
| `PREMIUM_UX_FINAL_REVIEW.md` | This document — approval decision | ✅ Complete |

**Decision:** Approve with Modifications  
**Approved priority order:**

| Phase | Scope | Sequence |
|-------|-------|----------|
| UX-1 | Homepage Hero · Knowledge System Enhancements · Industry Page Improvements | First |
| UX-2 | Contamination Animation · Technology Gallery | Second — after UX-1 measured |
| UX-3 | Distributor Experience | Third — after UX-2 measured |

**Instruction:** Implement progressively. Measure impact between phases. Do not implement all six simultaneously.  
**Workstream status:** APPROVED — UX-1 implementation in progress

---

*PREMIUM_UX_FINAL_REVIEW.md — ELIMFILTERS® — June 2026*
