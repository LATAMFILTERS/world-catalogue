# PREMIUM UX LAYER — VISUAL PREVIEW
## ELIMFILTERS® — The Future Experience, Page by Page

**Document type:** Visual specification — no code, no implementation  
**Purpose:** Show the future experience as a visitor would navigate it  
**Constraint:** All current business functionality, SEO, Knowledge System, Part Search, and distributor flows preserved  

---

## HOW TO READ THIS DOCUMENT

Each section shows:
- **[BEFORE]** — ASCII wireframe of current state
- **[AFTER]** — ASCII wireframe of target state
- **[SCROLL CHOREOGRAPHY]** — What happens as the user scrolls, second by second
- **[MOTION SPECIFICATION]** — Timing, easing, trigger conditions
- **[VISUAL HIERARCHY]** — What the eye goes to first, second, third
- **[EMOTIONAL REGISTER]** — What the visitor feels, not just reads

The ASCII wireframes use these conventions:
```
█████  Solid dark area (background)
░░░░░  Image or video area
▓▓▓▓▓  Text block
╔═══╗  Container border
┌───┐  Card boundary
●      Particle / dot element
→      Direction of motion
↓      Scroll direction
⟳      Loop animation
```

---

# SECTION 1 — HOMEPAGE

## THE CURRENT STATE

```
╔══════════════════════════════════════════════════╗
║  [LOGO]     Industries  Technologies  Knowledge  ║
╚══════════════════════════════════════════════════╝

█████████████████████████████████████████████████
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░    E N G I N E   F I L T R A T I O N       ░░
░░    Heavy-Duty and Light-Duty               ░░
░░                                            ░░
░░    [EXPLORE SYSTEMS →]                     ░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
█████████████████████████████████████████████████

▓ 99.9%    +45%     20K+     GLOBAL ▓
▓ Eff.     Life     Cross    Distrib ▓

[ASSET PROTECTION NARRATIVE BLOCK]
[PROBLEM SECTION — MECHANIC IMAGE]
[WHY ELIMFILTERS SECTION]
[TECHNOLOGY SECTION]
[CTA CAROUSEL]
[FAQ]
```

**Assessment:** Text-forward. Parallax is subtle. Nothing makes you stop scrolling. The hero is an announcement, not a demonstration.

---

## THE FUTURE STATE

### LAYER 1 — THE OPENING FRAME (0 seconds, before scroll)

```
╔═══════════════════════════════════════════════════════════════╗
║  [E]  [LOGO]              Industries  Technologies  Knowledge ║
╚═══════════════════════════════════════════════════════════════╝

█████████████████████████████████████████████████████████████
█                                                           █
█  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  █
█  ░                                                     ░  █
█  ░   [Copper mine at dawn. Massive haul truck.        ░  █
█  ░    Dust rising in amber light. Scale is            ░  █
█  ░    overwhelming. Nothing moves yet.]               ░  █
█  ░                                                     ░  █
█  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  █
█                                                           █
█  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                     █
█  ▓                                ▓                     █
█  ▓  PROTECTING INDUSTRIAL ASSETS  ▓  ← arrives char    █
█  ▓  THROUGH CONTAMINATION CONTROL ▓    by char, left   █
█  ▓                                ▓    to right        █
█  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                     █
█                                                           █
█  // ELIMFILTERS® · INDUSTRIAL FILTRATION SYSTEMS         █
█  // PROTECTING EQUIPMENT ACROSS 12 INDUSTRIES            █
█                                                           █
█████████████████████████████████████████████████████████████
                         ↓ SCROLL
```

**What changed:**
- Hero image is full-bleed cinematic — a real industrial scene, not a gradient
- The title is the brand claim, not the product category
- "ENGINE FILTRATION" → "PROTECTING INDUSTRIAL ASSETS" — same information, different register
- The image communicates scale and consequence before a single word arrives

**Inspiration:** Tesla opens with the product in its environment. The environment communicates what the product does. ELIMFILTERS opens with the operating environment that needs protection.

---

### LAYER 2 — SCROLL BEGINS (user starts scrolling)

```
SCROLL POSITION: 10% down

█████████████████████████████████████████████████████████████
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░   [Mining scene slowly zooms in 3% as user scrolls]     ░
░   Title text holds position (sticky for 100px)          ░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
█                                                           █
█   ← STATS SECTION FADES IN FROM BELOW →                  █
█                                                           █
█   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    █
█   │              │ │              │ │              │    █
█   │    99.9%     │ │    +45%      │ │    20K+      │    █
█   │  ↑ counting  │ │  ↑ counting  │ │  ↑ counting  │    █
█   │              │ │              │ │              │    █
█   │  Filtration  │ │  Engine Life │ │  OEM Cross-  │    █
█   │  Efficiency  │ │  Extension   │ │  References  │    █
█   │              │ │              │ │              │    █
█   │  ─────────── │ │  ─────────── │ │  ─────────── │    █
█   │  From 8,000  │ │  From 8,000h │ │  Verified    │    █
█   │  to 11,600+  │ │  to 11,600+h │ │  against OEM │    █
█   │  hours per   │ │  per overhaul│ │  specs across│    █
█   │  overhaul    │ │  cycle       │ │  all systems │    █
█   └──────────────┘ └──────────────┘ └──────────────┘    █
█                                                           █
```

**New element: Stat contextualization lines**  
Each number now answers the implicit question: "What does this number mean for my operation?"  
`99.9% efficiency` → `At ISO 16889 β₁₀(c) ≥ 200 — one particle in 1,000 passes through`  
`+45% engine life` → `From 8,000 hours to 11,600+ hours per overhaul cycle`  
`20K+ OEM cross-refs` → `Verified against OEM specs across all systems`  

**Motion:** Counters count up from 0 as before. New: the contextualization lines fade in 400ms after the counter reaches its final number. The number lands first. The meaning follows. **The sequence creates emphasis.**

---

### LAYER 3 — THE INVISIBLE ENEMY (pinned section, 400px scroll range)

This is the most important section transformation on the entire site.

**CURRENT STATE:**
```
[MECHANIC IMAGE]  |  "What you can't see is stopping your fleet"
                  |  
                  |  → Injector Erosion
                  |  → Critical Bearing Friction  
                  |  → Fuel Drainage
```

**FUTURE STATE — PINNED PROGRESSIVE REVEAL:**

The viewport pins. The user scrolls through 400 pixels of vertical space while the section remains fixed. Three failure modes reveal sequentially, each triggered by scroll position.

```
SCROLL POSITION: Enters pinned zone (0/400)

████████████████████████████████████████████████
█                                              █
█   WHAT YOU CAN'T SEE                        █
█   IS STOPPING YOUR FLEET                    █
█                                              █
█   ┌────────────────────────────────────┐    █
█   │                                    │    █
█   │   [ENGINE OIL CIRCUIT — CLEAN]     │    █
█   │                                    │    █
█   │   ●●●●  Fluid particles            │    █
█   │   → → →  Flow direction            │    █
█   │                                    │    █
█   │   BEARING SURFACE — INTACT         │    █
█   │   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │    █
█   │                                    │    █
█   └────────────────────────────────────┘    █
█                                              █
████████████████████████████████████████████████
```

```
SCROLL POSITION: 100/400 — FIRST FAILURE MODE REVEALS

████████████████████████████████████████████████
█                                              █
█   WHAT YOU CAN'T SEE                        █
█   IS STOPPING YOUR FLEET                    █
█                                              █
█   ┌────────────────────────────────────┐    █
█   │                                    │    █
█   │   [ENGINE OIL CIRCUIT — LOADING]   │    █
█   │                                    │    █
█   │   ●●●●●●●●  Particles multiply     │    █
█   │   ●● ● ●●● ●  (animated drift)     │    █
█   │   → →●→ →●→   flowing to bearing   │    █
█   │                                    │    █
█   │   PARTICLE WEAR IN BEARINGS        │    █
█   │   ▓▓▓░░░▓▓▓░░░▓▓  ← gaps forming  │    █
█   │   [YELLOW GLOW on damaged areas]   │    █
█   │                                    │    █
█   └────────────────────────────────────┘    █
█                                              █
█   ○──────────────────────────────────────   █
█   ↑ PARTICLE WEAR                           █
█   Hard particles (silica, metal oxides)     █
█   trapped between moving surfaces create    █
█   micro-cutting. Bearing clearance          █
█   reduces. Seizure risk increases.          █
█   ── Failure interval: 2,000–3,000 hrs ──   █
█                                              █
████████████████████████████████████████████████
```

```
SCROLL POSITION: 200/400 — SECOND FAILURE MODE

████████████████████████████████████████████████
█                                              █
█   [ANIMATION TRANSITIONS — cross-fade]      █
█   [Engine circuit fades, fuel system fades] █
█                                             █
█   ┌────────────────────────────────────┐   █
█   │   [FUEL INJECTOR — CLOSE VIEW]     │   █
█   │                                    │   █
█   │   ≋≋≋≋  Water molecules            │   █
█   │   ● ●●  Particulate               │   █
█   │   → → →  Flowing toward nozzle    │   █
█   │                                    │   █
█   │   INJECTOR NOZZLE CROSS-SECTION    │   █
█   │   ╔══╗  ← deposits accumulating   │   █
█   │   ║░░║  ← spray pattern degrading │   █
█   │   ╚══╝                             │   █
█   └────────────────────────────────────┘   █
█                                             █
█   ●──────────────────────────────────────  █
█   ↑ INJECTOR STICTION / EROSION            █
█   Water-contaminated diesel corrodes       █
█   precision injector tolerances.           █
█   Spray pattern degrades. Combustion       █
█   efficiency drops 12–18%.                 █
█   ── Replacement cost: $800–$2,400/unit ── █
████████████████████████████████████████████████
```

```
SCROLL POSITION: 300/400 — THIRD FAILURE MODE

████████████████████████████████████████████████
█   ┌────────────────────────────────────┐    █
█   │   [HYDRAULIC VALVE — CLOSE VIEW]   │    █
█   │                                    │    █
█   │   ●●●●●●●●●●●● particles dense    │    █
█   │   → jamming valve spool            │    █
█   │                                    │    █
█   │   VALVE SPOOL                      │    █
█   │   ┌─────[░░░]─────┐  ← stuck       │    █
█   │   │     [///]     │  ← scoring     │    █
█   │   └───────────────┘                │    █
█   └────────────────────────────────────┘    █
█                                              █
█   ●──────────────────────────────────────   █
█   ↑ PROPORTIONAL VALVE FAILURE              █
█   Particles >4µm jam or score               █
█   proportional valve spools at              █
█   tolerances of 4–10µm clearance.           █
█   ── Machine response failure: sudden ──    █
████████████████████████████████████████████████
```

```
SCROLL POSITION: 400/400 — SECTION RELEASES

[Section unpins. User continues scrolling downward.]

[TRANSITION: All three failure mode diagrams shrink 
 to icon size and arrange side-by-side as the user 
 scrolls past. They become the "three problems" summary 
 at the top of the Protection section below.]
```

**Inspiration:** Stripe's developer docs use pinned sections to walk through API flow step-by-step while the user scrolls. Apple uses the same pattern to reveal iPhone camera features one at a time. Here: the failure modes are the "features in reverse" — showing what the technology prevents, not what it does.

**Emotional register:** By the time the user exits this section, they understand what contamination does to real industrial equipment. They have seen it, not just read it. The information was always on the site. The experience of *understanding it* is new.

---

### LAYER 4 — PROTECTION REVEAL (below the pinned section)

```
SCROLL POSITION: Exits pinned zone + 100px

████████████████████████████████████████████████
█                                              █
█  [THREE FAILURE ICONS ALREADY VISIBLE]      █
█  Particle Wear  |  Injector Stiction  |  Valve Failure
█                                              █
█  ──────────────────────────────────────────  █
█                                              █
█  THE SAME SYSTEMS. PROTECTED.               █
█                                              █
█  [ANIMATION: Yellow sweep line moves L→R]   █
█  [As line passes each failure icon,          █
█   icon transforms: damage diagram →         █
█   clean diagram. Red glow → green glow.]    █
█                                              █
█  ELIMFILTERS® FILTRATION SYSTEM             █
█  Controls contamination before it reaches  █
█  bearing surfaces, injector nozzles,        █
█  and proportional valve spools.             █
█                                              █
█  [EXPLORE PROTECTION SYSTEMS →]             █
█                                              █
████████████████████████████████████████████████
```

**Motion:** The yellow sweep line is the brand accent (#FFF12D) moving across the screen. It visually "cleans" the damage diagrams as it passes. This is a 1.5-second animation, triggered once on scroll entry. It directly connects the yellow brand color to the idea of protection and cleanliness.

**This moment is the brand promise made visible.**

---

# SECTION 2 — TECHNOLOGIES

## CURRENT STATE

```
╔══════════════════════════════════════════════╗
║  NINE EXCLUSIVE PROTECTION ARCHITECTURES    ║
╚══════════════════════════════════════════════╝

[Prose narrative section]

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ MACROCORE™      │ │ SYNTAPORE™      │ │ INTEKCORE™      │
│ Air Intake      │ │ Air Intake      │ │ Air Intake      │
│ [description]   │ │ [description]   │ │ [description]   │
│ [feature pills] │ │ [feature pills] │ │ [feature pills] │
│ DISCOVER →      │ │ DISCOVER →      │ │ DISCOVER →      │
└─────────────────┘ └─────────────────┘ └─────────────────┘

[3-column grid continues for 9 technologies]

[Comparison table]
```

**Assessment:** Grid format treats all 9 technologies as equivalent. Reading about MACROCORE™ feels like reading a spec sheet. There is no visual demonstration of the engineering.

---

## FUTURE STATE — TECHNOLOGIES HUB

### Opening: Technology Carousel (Horizontal Scroll)

```
╔═══════════════════════════════════════════════════════════╗
║  [E] ELIMFILTERS®          Industries  Technologies  KS  ║
╚═══════════════════════════════════════════════════════════╝

████████████████████████████████████████████████████████████
█                                                          █
█  NINE PROTECTION ARCHITECTURES                          █
█  // Engineered for contamination control across         █
█  // air, fuel, hydraulic, lubrication, and cabin systems█
█                                                          █
████████████████████████████████████████████████████████████

[HORIZONTAL SCROLL GALLERY — Desktop]
[User scrolls DOWN; cards scroll RIGHT]

┌──────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │←─── card 1 (visible)
│  ░                               ░  │
│  ░  [Extreme close-up: layered   ░  │
│  ░   filter media cross-section. ░  │
│  ░   Fibers visible. Particles   ░  │
│  ░   suspended in amber fluid.]  ░  │
│  ░                               ░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                      │
│  SYSTEM 01: AIR INTAKE              │
│  ─────────────────────────────────  │
│  MACROCORE™                         │
│  Depth-loading cellulose-synthetic  │
│  composite media. β₁₀(c) ≥ 200.    │
│  18µm absolute particle capture.    │
│                                      │
│  [DISCOVER MACROCORE™ →]            │
└──────────────────────────────────────┘
          ┌─────────────────────────┐  ← card 2 (partially visible)
          │  ░░░░░░░░░░░░░░░░░░░░  │
          │  [Next technology image]│
          │  SYNTAPORE™            │
          └─────────────────────────┘
                    ┌──────────────┐  ← card 3 (edge hint)
                    │  ...         │
                    └──────────────┘

  ○ ● ○ ○ ○ ○ ○ ○ ○  ← position indicator (9 dots)
```

**Scroll behavior:** As the user scrolls vertically past the "Nine Protection Architectures" heading, the horizontal scroll gallery enters. The cards move rightward proportional to vertical scroll position. The user always controls navigation through their native scroll gesture — no hijacking, no drag required. After card 9, the gallery exits and vertical scroll resumes normally.

**Inspiration:** This is the Apple "scroll to reveal features" pattern applied to a product line. Each technology gets a moment at full attention before the next arrives.

**What the card image communicates:**
- MACROCORE: Amber-lit filter media cross-section — fibrous depth, visible layering
- AQUAGUARD: Water droplets beading off hydrophobic membrane surface
- NANOFORCE: Abstract visualization of nanofiber mesh (SEM-style aesthetic)
- SYNTRAX: Oil flowing through clean synthetic media — viscosity visible
- MICROKAPPA: Human-scale — clean white cabin air filter against dark background
- DRYCORE: Compressed air flowing through dryer element — condensate visible
- DURATECH: Exploded view of high-capacity element construction
- THERMACORE: Cross-section showing coolant filter media with deposit capture
- INTEKCORE: Side-by-side with MACROCORE to show the composite distinction

---

### Technology Detail Page — The Mechanism Visualization

**CURRENT STATE (TechDetailPage.tsx):**
```
[Hero with background image]
[Technology name + specifications]
[Feature list]
[Industries served]
[FAQ section]
```

**FUTURE STATE — MACROCORE™ as example:**

```
╔═══════════════════════════════════════════════════════════╗
║  ← TECHNOLOGIES                                          ║
╚═══════════════════════════════════════════════════════════╝

████████████████████████████████████████████████████████████
█                                                          █
█  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  █
█  ░  [Extreme close-up of filter media under light.   ░  █
█  ░   Fiber lattice visible. Depth and texture.]      ░  █
█  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  █
█                                                          █
█  SYSTEM 01 · AIR INTAKE FILTRATION                     █
█  ─────────────────────────────────────────────────────  █
█  MACROCORE™                                            █
█  Depth-Loading Cellulose-Synthetic Composite Media     █
█                                                          █
████████████████████████████████████████████████████████████
```

**MECHANISM VISUALIZATION — the new centerpiece:**

```
AFTER SCROLL: 200px into page

┌─────────────────────────────────────────────────────────┐
│                                                         │
│   HOW MACROCORE™ CAPTURES CONTAMINATION                │
│   ─────────────────────────────────────────────────    │
│                                                         │
│   [ANIMATION — 8 second loop]                          │
│                                                         │
│   PARTICLE SIZE REFERENCE          FILTER CROSS-SECTION │
│                                                         │
│   ████ Human hair    70µm          ════════════════     │
│   ███  Fine dust  10-100µm         ║ OUTER SURFACE ║    │
│   ██   MACROCORE    18µm  ←──      ║ cellulose     ║    │
│   █    NANOFORCE     1µm           ║ pre-filter    ║    │
│                                    ╠═══════════════╣    │
│   ● ● ● ● ● ●  Particles →        ║ COMPOSITE     ║    │
│   ● → → → → →  approaching        ║ media layer   ║    │
│       ↓ filter                     ╠═══════════════╣    │
│   ● ●          Large particles →  ║ SYNTHETIC     ║    │
│        ●  ●    stopped outer layer ║ depth layer   ║    │
│            ●   Medium particles →  ╠═══════════════╣    │
│                 captured mid-layer ║ INNER SUPPORT ║    │
│                          ↓         ════════════════     │
│                    CLEAN AIR →                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Animation description:**
1. Particles drift rightward from left edge toward the cross-section diagram
2. Large particles (represented as larger dots) stop at the outer cellulose layer — a brief yellow flash marks capture
3. Medium particles penetrate the first layer but are caught in the composite layer — yellow flash
4. Small particles caught at the synthetic depth layer — yellow flash
5. Clean fluid (no particles) exits the right side of the cross-section
6. Loop: particle stream restarts from left

**Duration:** 8 seconds per loop. SVG-based animation, no video required.

**Technical note in the UI:**
```
   β₁₀(c) ≥ 200
   ─────────────────────────────────────────────
   At 10 microns: 99.5% of particles captured
   1 particle per 200 passes through
   ISO 16889 laboratory-verified
```

**Inspiration:** Stripe's homepage animations show data flowing through their payment network. The particle capture animation uses the same principle — making an invisible technical process visible through simple motion. No complex 3D required.

---

### Interactive Performance Curve (Technology Detail Pages)

This element has no equivalent on any competitor's website.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   FILTRATION EFFICIENCY vs. PARTICLE SIZE              │
│   ISO 16889 Performance Data                           │
│   ─────────────────────────────────────────────────    │
│                                                         │
│  100%│                              ╭──────────────     │
│     │                         ╭────╯                   │
│  75% │                    ╭───╯                        │
│     │               ╭────╯                             │
│  50% │          ╭───╯                                  │
│     │      ╭───╯                                       │
│  25% │ ╭───╯                                           │
│      │╭╯                                               │
│   0% └────────────────────────────────────────────    │
│       1µm  2µm  4µm  6µm  10µm  15µm  20µm  30µm      │
│                                                         │
│   ──────────────────────────────────────────────────   │
│   Hover the curve to see efficiency at each particle   │
│   size. Compare to OEM specification on request.       │
│                                                         │
│   [Hover point marker — yellow dot follows cursor]     │
│                                                         │
│   At 10µm: β₁₀(c) = 200 → 99.5% capture efficiency   │
│            ↑ appears as user hovers 10µm mark          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Why this matters:** Filtration engineers evaluate products using Beta ratio graphs. No industrial filtration brand in LATAM presents this data interactively on their website. A Chilean mining procurement engineer encountering this element will immediately recognize it as serious engineering communication — not a marketing site.

---

# SECTION 3 — INDUSTRIES

## CURRENT STATE

```
[12 industry cards in a grid]
[Each card: industry name + image + short description]
[Click → /industries/[slug]]

[Industry detail page — CategoryPage.tsx template]
[Hero image + heading]
[Direct answer block]
[FAQ section]
[Product references]
```

**Assessment:** All 12 industries are presented identically. A Mining operator and an Agriculture operator see the same structure with different words. The visual language does not communicate industrial context.

---

## FUTURE STATE — MINING INDUSTRY as example

### Industry Hub (Grid)

```
MINING CARD — BEFORE:

┌─────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░  [Mine stock photo]       ░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  MINING                         │
│  Extreme contamination in       │
│  open-pit and underground ops   │
│  EXPLORE →                      │
└─────────────────────────────────┘


MINING CARD — AFTER:

┌─────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░  [Haul truck in pit. Scale]░  │
│  ░                            ░  │
│  ░  [On hover: subtle dust    ░  │  ← ambient particle
│  ░   particle overlay fades   ░  │    overlay on hover
│  ░   in. Particles drift      ░  │    (CSS animation,
│  ░   across the image.]       ░  │    ~20 translucent dots)
│  ░                            ░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                 │
│  MINING                         │
│  ISO 17/15/12 contamination     │  ← technical spec
│  targets. Silica ingestion:     │    instead of
│  primary failure mechanism.     │    marketing description
│                                 │
│  [EXPLORE MINING SYSTEMS →]     │
│  ─────────────────────────────  │
│  ▓▓ Air  ▓▓ Hydraulic  ▓▓ Lube  │  ← system tags
└─────────────────────────────────┘
```

**Hover behavior:**
When the user hovers a Mining card, 15-20 semi-transparent dots (simulating dust/silica particles) drift slowly across the card image from left to right. They fade in at the left edge and fade out at the right. Duration per dot: 3-4 seconds. Density is low — this is atmospheric, not dramatic.

**The effect:** Without any text change, the card communicates contamination. The visitor sees the problem they face in the industry they operate in.

---

### Industry Detail Page — Mining

**CURRENT STATE:**
```
[Hero image: mine]
[MINING header]
[Direct answer block]
[FAQ: 5 questions]
[Product references]
```

**FUTURE STATE:**

```
████████████████████████████████████████████████████████████
█                                                          █
█  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  █
█  ░                                                   ░  █
█  ░  [Open-pit mine. Dawn. Haul trucks at scale.]     ░  █
█  ░  [Ambient dust particle overlay active.]          ░  █
█  ░                                                   ░  █
█  ░  // INDUSTRIAL APPLICATION · MINING               ░  █
█  ░                                                   ░  █
█  ░  MINING FILTRATION SYSTEMS                        ░  █
█  ░  Equipment protection in extreme                  ░  █
█  ░  contamination environments                       ░  █
█  ░                                                   ░  █
█  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  █
████████████████████████████████████████████████████████████

[INDUSTRY-SPECIFIC CONTAMINATION CALLOUT — new element]

┌─────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════╗  │
│  ║  PRIMARY FAILURE MECHANISM: SILICA INGESTION     ║  │
│  ║  ─────────────────────────────────────────────── ║  │
│  ║                                                   ║  │
│  ║  Silica (SiO₂) Mohs hardness: 7                  ║  │
│  ║  Engine cylinder liner hardness: 5-6              ║  │
│  ║                                                   ║  │
│  ║  Silica particles harder than the surfaces       ║  │
│  ║  they contaminate. Abrasive wear rate increases  ║  │
│  ║  exponentially above ISO 19/17/14 cleanliness.   ║  │
│  ║                                                   ║  │
│  ║  Mining environment ingestion rate:              ║  │
│  ║  3-8 g/hour in normal open-pit conditions        ║  │
│  ║  12-25 g/hour during blasting and loading        ║  │
│  ║                                                   ║  │
│  ║  ELIMFILTERS® target: ISO 16/14/11 or better     ║  │
│  ╚═══════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────┘
```

**What this accomplishes:** A mining procurement manager reading this page knows immediately that ELIMFILTERS understands their operating environment. Mohs hardness comparison is not found on competitor websites. The contamination ingestion rate by condition is operational intelligence, not marketing.

**Same structure, five different contamination callouts — the ones that matter:**
- Mining: Silica ingestion, hardness comparison, ingestion rates
- Agriculture: Chaff and organic particulate in hydraulic systems during harvest season
- Marine: Salt water emulsification of diesel — accelerated injector corrosion
- Construction: Cement dust, calcium carbonate, concrete silica in engine air intake
- Oil & Gas: H₂S-contaminated condensate in compressed air systems

---

# SECTION 4 — KNOWLEDGE SYSTEM

## DESIGN PRINCIPLE

The Knowledge System content is excellent and cannot be changed. The reading experience can be elevated without touching a single word.

**What changes:** Layout, typography rhythm, in-text metric highlights, section progress indicator, reading experience.
**What does not change:** All content, all SEO structure, all schema markup, all FAQ content, all internal link architecture.

---

## CURRENT STATE (Standards page — example)

```
[Back link]

[HERO: title, description]

01 / SYSTEM OVERVIEW
[Heading]
[2-3 paragraphs]

02 / CONTAMINATION CHALLENGES
[Bullet list]

03 / ASSOCIATED STANDARDS
[Standards grid]

[...continues to section 8]
```

---

## FUTURE STATE — READING EXPERIENCE

### The Reading Layout

```
╔═══════════════════════════════════════════════════════════╗
║  ← STANDARDS                                             ║
╚═══════════════════════════════════════════════════════════╝

████████████████████████████████████████████████████████████
[HERO — unchanged]
████████████████████████████████████████████████████████████

PAGE BODY — NEW LAYOUT:

┌──┬─────────────────────────────────────────┬──────────┐
│  │                                         │          │
│  │  01 / SYSTEM OVERVIEW                   │  01 ←──  │
│  │                                         │  02      │  ← section
│  │  Lube Oil Filtration Systems maintain   │  03      │    progress
│  │  measurable cleanliness codes           │  04      │    indicator
│  │  (ISO 4406) in engine oil through       │  05      │    (right rail)
│  │  multi-stage filtration...              │  06      │
│  │                                         │  07      │
│  │  Optimal cleanliness targets extend     │  08      │
│  │  bearing life                           │          │
│  │  ┌──────────────────────────────────┐  │          │
│  │  │  3–5× bearing life extension     │  │          │  ← pullquote
│  │  │  ISO 16/14/11 vs. commodity      │  │          │    metric
│  │  │  approach at 19/17/14            │  │          │    highlight
│  │  └──────────────────────────────────┘  │          │
│  │                                         │          │
│  │  The relationship between cleanliness   │          │
│  │  code and equipment life is not linear: │          │
│  │  a two-step improvement in ISO code     │          │
│  │  (e.g., from 18/16/13 to 16/14/11)     │          │
│  │  typically produces a                   │          │
│  │                                         │          │
│  │  ▓ +40–60% bearing life extension ▓    │          │  ← inline metric
│  │                                         │          │    in yellow
│  │  rather than a proportional gain.       │          │
│  │  This is the exponential contamination  │          │
│  │  degradation curve defined in           │          │
│  │  ISO 4406 research.                     │          │
│  │                                         │          │
└──┴─────────────────────────────────────────┴──────────┘
```

**Section progress indicator:**
The right rail shows all 8 section numbers (01-08). The current section is highlighted in yellow (#FFF12D). As the user scrolls, the active number changes. This is purely navigational state driven by scroll position — no animation, no motion. Just a persistent landmark.

**Inline metric highlights:**
Quantified technical results appearing in the text are rendered in larger type and yellow:
- `+40–60% bearing life extension` — slightly larger, yellow
- `ISO 16/14/11` — when it appears as a cleanliness target, small yellow background pill
- `β₁₀(c) ≥ 200` — yellow text color when cited as a performance specification

**Pullquote treatment:**
The most operationally significant statement in each section is extracted into a full-width pullquote box. Yellow left border, slightly larger text, dark background inside the main dark background (rgba(255,241,45,0.05) — barely perceptible yellow tint). Creates visual rhythm in long text.

**Emotional register:** Reading a Knowledge System page feels like reading an engineering journal article, not a marketing FAQ. The information density is unchanged. The visual organization makes the information feel considered and authoritative.

---

# SECTION 5 — DISTRIBUTOR EXPERIENCE

## CURRENT STATE

```
[/distributor-application page]
[Form: name, company, country, phone, years, industries, message]
[Submit via Formspree]
```

**Assessment:** Functional. Cold. A prospect who has traveled from a LinkedIn outreach message to this page is being asked to fill out a form without any context about what they're entering, what the program offers, or who they're dealing with.

---

## FUTURE STATE — DISCOVERY EXPERIENCE

### Pre-Form Narrative (does not change the form itself)

```
[/distributor-application]

████████████████████████████████████████████████████████████
█                                                          █
█  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  █
█  ░                                                   ░  █
█  ░  [Team at industrial site. Professional.          ░  █
█  ░   Not stock photography — if possible, real       ░  █
█  ░   ELIMFILTERS® distributor or team at operation]  ░  █
█  ░                                                   ░  █
█  ░  // DISTRIBUTOR PROGRAM · LATAM                   ░  █
█  ░                                                   ░  █
█  ░  BECOME AN ELIMFILTERS®                           ░  █
█  ░  AUTHORIZED DISTRIBUTOR                           ░  █
█  ░                                                   ░  █
█  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  █
████████████████████████████████████████████████████████████

PROGRAM SUMMARY — before the form:

┌────────────────────────────────────────────────────────┐
│                                                        │
│  WHAT WE'RE LOOKING FOR                               │
│  ──────────────────────────────────────────────────   │
│                                                        │
│  ┌─────────────────┐  ┌─────────────────┐             │
│  │ ✓ Established   │  │ ✓ Territorial   │             │
│  │   sales team    │  │   coverage      │             │
│  └─────────────────┘  └─────────────────┘             │
│  ┌─────────────────┐  ┌─────────────────┐             │
│  │ ✓ Industrial    │  │ ✓ Existing      │             │
│  │   sector exp.   │  │   customer base │             │
│  └─────────────────┘  └─────────────────┘             │
│                                                        │
│  INDUSTRIES:  Mining  |  Agriculture  |  Transport     │
│               Construction  |  Oil & Gas  |  +more    │
│                                                        │
│  TERRITORIES: Mexico · Colombia · Chile · Peru         │
│               Ecuador · Brazil · Panama · Costa Rica   │
│                                                        │
└────────────────────────────────────────────────────────┘

[DISTRIBUTOR APPLICATION FORM — unchanged]
```

**What changes:** The form is preceded by a brief program summary. The prospect understands what they're applying for before they complete it. This reduces abandonment and pre-qualifies intent.

---

### Distributor Discovery Flyout (Homepage CTA)

The homepage CTA carousel shows "ONLY THE BEST SELL ELIMFILTERS®." Clicking it currently goes directly to /distributor-application.

**Future state:** An intermediate flyout panel slides in from the right.

```
HOMEPAGE → CLICK "BECOME A DISTRIBUTOR" CTA

[Full page dims to 40% opacity — backdrop visible behind panel]

┌─────────────────────────────────────────────────────┐
│                                              [✕ CLOSE]
│                                                     │
│  ELIMFILTERS® DISTRIBUTOR PROGRAM                  │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Authorized distributors serve mining,             │
│  agriculture, construction, transportation,        │
│  and oil & gas operations across Latin America.    │
│                                                     │
│  IS YOUR TERRITORY AVAILABLE?                      │
│                                                     │
│  [COLOMBIA    ○]  Available                        │
│  [MEXICO      ○]  Available                        │
│  [CHILE       ○]  Available                        │
│  [PERU        ○]  Available                        │
│  [ECUADOR     ○]  Available                        │
│  [VENEZUELA   ○]  Contact us                       │
│  [OTHER       ○]  _______________                  │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  [APPLY NOW →]          [DOWNLOAD PROGRAM PDF →]   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Motion:** Panel slides in from the right (400ms, ease-out). Backdrop fades to 40% opacity simultaneously. Close button (✕) or backdrop click dismisses.

**Value:** Prospect gets immediate territory availability signal before committing to a full application. Pre-qualifies interest. Reduces "submitted form to see if territory is open" applications.

---

# SECTION 6 — MOBILE EXPERIENCE

## CURRENT STATE

The site uses clamp() for responsive typography and auto-fit grids. This makes the site technically responsive — it works on mobile. The mobile experience is not designed for mobile; it is the desktop experience at a smaller viewport.

**The key problem:** Industrial buyers in Colombia, Chile, and Venezuela research vendors on mobile. A distribution manager at a mining operation will look up ELIMFILTERS® on their phone at a job site. They should have an experience that feels built for them.

---

## MOBILE — HOMEPAGE

**CURRENT:**
```
[Small hero image]
[Title text — smaller]
[Stats in 2×2 grid]
[Sections stacked]
[Long scroll]
```

**FUTURE — 375px viewport:**

```
╔═══════════════════════════════════╗
║  [E]  [LOGO]        [≡ MENU]     ║  ← hamburger
╚═══════════════════════════════════╝

███████████████████████████████████
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░                               ░
░  [Mine at dawn. Portrait      ░  ← hero image cropped
░   crop. Machine fills frame.] ░    to portrait ratio
░                               ░    for phone screens
░  PROTECTING                   ░
░  INDUSTRIAL ASSETS            ░
░                               ░
░  // ELIMFILTERS®              ░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
███████████████████████████████████

[STATS — 2×2 grid, large numbers]

┌──────────────┐ ┌──────────────┐
│   99.9%      │ │    +45%      │
│ Efficiency   │ │ Engine Life  │
└──────────────┘ └──────────────┘
┌──────────────┐ ┌──────────────┐
│    20K+      │ │   GLOBAL     │
│ OEM Refs     │ │ Distribution │
└──────────────┘ └──────────────┘

[PINNED SECTION — simplified for mobile]
[Instead of 3-step scroll reveal:]
[Tab interface: tap to switch between]
[Particle Wear | Injector | Valve]
[Active tab shows diagram + text]

[TECHNOLOGIES — vertical stack cards]
[Each card: full-width, tap to expand]

[INDUSTRIES — horizontal scroll chips]
[Mining] [Agriculture] [Transport] [+9]
```

**Mobile navigation drawer:**

```
[≡ MENU tap]

┌───────────────────────────────────┐
│  [✕]         ELIMFILTERS®        │
│  ─────────────────────────────── │
│                                   │
│  → Industries                    │
│    Mining  Agriculture  Transport │
│    Construction  Marine  +more   │
│                                   │
│  → Technologies                  │
│    MACROCORE  NANOFORCE  SYNTRAX │
│    AQUAGUARD  +5 more            │
│                                   │
│  → Knowledge System              │
│    Standards  Contamination      │
│    Fleet  Compare                │
│                                   │
│  → Part Search ↗                │
│  → Become a Distributor         │
│  → Contact                      │
│                                   │
│  ─────────────────────────────── │
│  📧 info@elimfilters.com         │
└───────────────────────────────────┘
```

**Navigation drawer behavior:** Slides in from the left (320px wide). Backdrop dims. Each section can be tapped to expand sub-items. Sub-items are direct links. The key addition: Part Search and Become a Distributor are prominent — these are the two highest-conversion actions.

---

## MOBILE — TECHNOLOGY DETAIL PAGE

**The mechanism animation on mobile:**

The SVG particle animation is viewport-aware. On mobile:
- Animation is simplified (fewer particles, 2 visible layers instead of 4)
- Animation is triggered on tap, not on scroll entry (scroll-triggered animation on mobile can be choppy on low-end Android devices)
- Performance curve is simplified to a static chart with tap-to-reveal data points

```
[Mobile — technology detail, 375px]

████████████████████████████████████
[MACROCORE™ header]
████████████████████████████████████

HOW IT WORKS

┌──────────────────────────────────┐
│                                  │
│  [Simplified particle animation] │
│  [2-layer cross-section]         │
│  [Tap to play ▶]                │
│                                  │
│  PARTICLE SIZE REFERENCE         │
│  ────────────────────────────    │
│  ████ Dust     10-100µm          │
│  ██   MACROCORE  18µm  ←──      │
│  █    NANOFORCE   1µm            │
│                                  │
└──────────────────────────────────┘

β₁₀(c) ≥ 200
99.5% capture at 10 microns
```

---

# SECTION 7 — VISUAL STORYTELLING: THE THREE KEY SEQUENCES

These are the most important new visual elements. All three can be built without video production — SVG + Framer Motion or Lottie files.

---

## SEQUENCE 1 — THE INVISIBLE ENEMY (Already shown in Section 1)

**Summary:**  
Pinned section. Particle contamination flows toward three industrial systems. Each failure mode reveals in sequence as user scrolls. Yellow sweep "cleans" the scene when protection is introduced. Duration: 400px of scroll = approximately 30-45 seconds of engagement.  

**Build complexity:** Medium. SVG diagrams + Framer Motion scroll-driven animation.  
**Lottie alternative:** Commission 3 Lottie files (one per failure mode) at ~$200-400 each.

---

## SEQUENCE 2 — THE FILTRATION MECHANISM (Technology Detail Pages)

**Visual design — full specification:**

```
[ANIMATION FRAME SEQUENCE — MACROCORE™]

FRAME 0 (static, before trigger):
████████████████████████████████████████
█  APPROACHING CONTAMINATION           █
█                                      █
█  Large particle  ●                   █  ← outer layer right edge
█  Medium particle    ●                █  ← mid-layer right edge
█  Fine particle         ●             █  ← inner layer right edge
█                                      █
█  [FILTER CROSS-SECTION — static]    █
████████████████████████████████████████

FRAME 1 (0.5s — particles drift left):
█  ●──────────────────→  [OUTER WALL]  █
█     ●──────────────→  [COMPOSITE]   █
█        ●──────────→  [SYNTHETIC]    █
█                                      █

FRAME 2 (1.2s — large particle hits outer):
█  ●●  [CAPTURED]  [YELLOW FLASH]     █
█     ●───────────→  [COMPOSITE]      █
█        ●────────→  [SYNTHETIC]      █

FRAME 3 (2.0s — medium captured mid-layer):
█  ●●  [captured]                     █
█     ●●  [CAPTURED]  [YELLOW FLASH]  █
█        ●──────────→  [SYNTHETIC]    █

FRAME 4 (2.8s — fine particle caught):
█  ●●  [captured]                     █
█     ●●  [captured]                  █
█        ●●  [CAPTURED]  [FLASH]      █

FRAME 5 (3.5s — clean fluid exits):
█  ●●  ●●  ●●  [all captured]         █
█                                      █
█  ────────────────  CLEAN FLUID  →   █
█                                      █
█  [Green indicator: CLEAN AIR]       █
```

**Color language:**
- Incoming particles: white dots (contamination in suspension)
- Capture flash: #FFF12D (yellow — ELIMFILTERS brand color = protection = clean)
- Captured particles: fade to dark (neutralized)
- Clean fluid exit: white line with soft glow

**The color language embeds the brand:** the moment of protection is yellow. Every time the animation loops, the viewer associates yellow with the act of filtering.

---

## SEQUENCE 3 — FLEET CONSEQUENCE (Homepage Stats / Fleet Section)

**Visual design:**

```
TWO COLUMNS — side by side

LEFT COLUMN                     RIGHT COLUMN
──────────────────────────────  ──────────────────────────────
COMMODITY FILTRATION            SYSTEM FILTRATION
                                
[Equipment age indicator]       [Equipment age indicator]
  ████░░░░░░  40% life used       ████░░░░░░  40% life used
  (both start at same state)      (both start at same state)

[ANIMATION BEGINS — 8 seconds]

Year 1:                         Year 1:
  ████████░░  85% life used       ██████░░░░  65% life used
  [Orange warning glow]           [No glow]

Year 2:                         Year 2:
  ████████████  OVERHAUL          ████████░░  80% life used
  [$42,000 cost indicator]        [No glow]

Year 3:                         Year 3:
  ████░░░░░░  40% life used       ██████████  FIRST OVERHAUL
  [Counter: $42K spent]           [$42,000 cost — delayed]

Year 5:                         Year 5:
  OVERHAUL #2                     ████████░░  80% life used
  [Counter: $84K spent]           [Counter: $42K spent]

Year 7:                         Year 7:
  OVERHAUL #3                     OVERHAUL #2
  [Counter: $126K spent]          [Counter: $84K spent]

Year 10:                        Year 10:
  OVERHAUL #4 + EARLY REPLACE     OPERATING NORMALLY
  [Counter: $168K + $250K]        [Counter: $84K total]

TOTAL 10-YEAR COST:             TOTAL 10-YEAR COST:
  $418,000                        $126,000
  [RED]                           [GREEN]
```

**Final frame:**
```
  LEFT: $418,000     RIGHT: $126,000
  ─────────────────────────────────────
           70% LOWER LIFETIME COST
           WITH SYSTEM FILTRATION
  ─────────────────────────────────────
```

**The animation makes the TCO argument visceral.** The numbers in the Knowledge System documents support this. The animation makes it land without requiring the visitor to read three pages.

---

# SECTION 8 — PROGRESSIVE REVEAL SECTIONS

Progressive reveal is the pattern where content within a section appears sequentially, driven by either scroll position or a brief timer. The visitor experiences the information as a narrative rather than as a static block.

## WHERE TO USE IT

### 1. Homepage Hero — Text Arrival Sequence

**Current:** Split-text character animation — all characters animate in simultaneously in 0.5s.

**Future — staggered arrival with meaning:**
```
[0.0s]  Screen dark. Mining scene fades in over 1.5s.

[1.5s]  Small monospace text arrives first:
         // ELIMFILTERS® · INDUSTRIAL FILTRATION SYSTEMS
         (fast, low to high opacity, 0.3s)

[2.0s]  Main headline arrives, word by word:
         PROTECTING   [pause 0.1s]
         INDUSTRIAL   [pause 0.1s]
         ASSETS       [pause 0.1s]

[2.8s]  Subtitle arrives:
         THROUGH CONTAMINATION CONTROL

[3.5s]  CTA button fades in:
         [EXPLORE SYSTEMS →]

[4.0s]  Scroll indicator appears:
         ↓  [thin yellow line, pulsing]
```

The arrival sequence tells a story: system → context → claim → call to action. The viewer has 4 seconds of deliberate pacing before they're expected to act.

### 2. Technology Hub — Card Population

**Current:** All 9 technology cards appear simultaneously via stagger animation.

**Future — left to right population:**
Cards arrive left to right with 100ms stagger per card. First card: fully visible as the section enters viewport. Last card: arrives 800ms later. The effect: the product line appears to be building itself.

### 3. Standards Page — Section Reveal

**Current:** Each section header (01, 02, 03...) fades in on viewport entry.

**Future — section header pre-announce:**
When a new section is about to enter the viewport (500px before), a small indicator appears in the right rail showing the upcoming section number. It pulses once (opacity: 0.3 → 1.0 → 0.3 → 1.0 over 400ms), then holds at full opacity as the section arrives. The visitor has a subliminal sense of what's coming.

---

# SECTION 9 — PREMIUM INDUSTRIAL DESIGN LANGUAGE

## THE VISUAL REGISTER

ELIMFILTERS® is not a consumer brand. The visual language must communicate engineering seriousness, industrial precision, and operational authority. This is distinct from the visual language of consumer technology (Apple) or financial technology (Stripe).

**The ELIMFILTERS® visual register must communicate:**

| Quality | Visual Expression |
|---------|------------------|
| Engineering precision | Monospace typeface for all specifications and ISO codes |
| Industrial scale | Full-viewport images of operating environments, not close-up product photography |
| Operational authority | Quantified data presented without qualification ("3–5× bearing life" not "up to 5× bearing life") |
| Contamination expertise | Visual representations of contamination — particles, cross-sections, failure diagrams |
| System thinking | Network/flow diagrams showing contamination pathways and protection points |

## TYPOGRAPHY HIERARCHY

```
PAGE LEVEL:

HEADLINE          Outfit Bold 700, clamp(2.5rem, 5vw, 4rem)
                  ALL CAPS for section headings
                  Mixed case for content headings

SUBHEADLINE       Outfit SemiBold 600, clamp(1.2rem, 2.5vw, 1.8rem)

BODY              Inter Regular 400, 0.95rem, line-height 1.75
                  Muted: rgba(255,255,255,0.7)

LABEL/EYEBROW     JetBrains Mono 400, 0.7rem, letter-spacing 0.15em
                  // SECTION LABEL · CONTEXT
                  
SPECIFICATION     JetBrains Mono 500, 0.85rem, color #FFF12D
                  β₁₀(c) ≥ 200  |  ISO 16889  |  18µm absolute

METRIC CALLOUT    Outfit Bold 700, clamp(2rem, 4vw, 3rem), color #FFF12D
                  Used for key statistics pulled from body text
```

**The monospace / sans-serif distinction carries meaning:**
- Monospace (JetBrains Mono) = technical specifications, ISO codes, data
- Sans-serif (Outfit, Inter) = narrative text, headings, descriptions

A reader who scans the page sees yellow monospace text as signal: this is data, this is measurable, this is engineered.

## COLOR USAGE — PRECISE RULES

```
SURFACE COLORS:
  Background:        #000000  (pure black — not charcoal)
  Card surface:      rgba(255,255,255,0.03)
  Card hover:        rgba(255,255,255,0.06)
  Section divider:   rgba(255,255,255,0.06)

ACCENT COLORS:
  Primary accent:    #FFF12D  (ELIMFILTERS yellow)
  Accent subtle:     rgba(255,241,45,0.15)
  Accent border:     rgba(255,241,45,0.25)
  Accent background: rgba(255,241,45,0.05)

TEXT COLORS:
  Primary:           #FFFFFF
  Secondary:         rgba(255,255,255,0.70)
  Tertiary:          rgba(255,255,255,0.50)
  Disabled:          rgba(255,255,255,0.30)

STATUS COLORS:
  Protection active: #FFF12D (yellow — good, protected)
  Failure state:     rgba(255,80,80,0.8) (red — damage)
  Warning:           rgba(255,165,0,0.8) (amber — degrading)
  Clean/clear:       rgba(255,255,255,0.9) (white — clean)
```

**The status color system reinforces the brand story:**
Yellow means protection. Red means failure. The animations use these colors to communicate system state without any text.

---

# SECTION 10 — PALANTIR REFERENCE: THE INFORMATION AS INFRASTRUCTURE VISUAL

Palantir's visual language treats data as infrastructure — something that flows, organizes itself, and reveals patterns. ELIMFILTERS' Knowledge System has an equivalent opportunity.

## THE KNOWLEDGE NETWORK VISUALIZATION

**Current Knowledge System hub:**
```
[Statistics]
[5 section cards: Standards, Contamination, Science, Compare, Fleet]
[FAQ]
```

**Premium addition — Knowledge Network entrance:**

On the Knowledge System hub, before the section cards appear, a brief network visualization builds itself:

```
[KNOWLEDGE NETWORK — builds over 2 seconds]

                    ● Particle Wear
                   /
● Contamination ──●── ● Water Contamination
                   \
                    ● Hydraulic Contamination
                         |
                    ● ISO 16889 ──────── ● MACROCORE™
                    ● ISO 4406  ─────────● NANOFORCE™
                    ● ISO 5011  ─────────● AQUAGUARD™
                         |
                    ● Reducing Downtime ─● Fleet Optimization
                    ● Total Cost of Ownership
```

**Animation sequence:**
1. Central node "CONTAMINATION" appears (0.0s)
2. Three contamination type nodes branch from it (0.3s each)
3. Standards nodes appear (0.8s) with lines connecting to contamination
4. Technology nodes appear (1.2s) with lines connecting to standards
5. Fleet/Outcome nodes appear (1.6s)
6. Network holds for 0.5s then fades to 30% opacity
7. Section cards appear over the faded network

**What this communicates:** The knowledge system is a system — interconnected, not a collection of isolated articles. The visitor understands the architecture before they enter it.

**Inspiration:** Palantir's product visualizations show data as a living network. The network metaphor implies that the information has been organized, not just written. ELIMFILTERS' knowledge architecture is genuinely networked (the `knowledge-architecture.ts` file already models these relationships). The visualization makes that architecture visible.

---

# FINAL ASSESSMENT

## Would This Modernization Increase Trust, Engagement, and Distributor Conversion?

### Trust

**Yes — substantially.**

Trust in industrial B2B contexts is built on two signals: demonstrated expertise and demonstrated attention to the customer's specific operational context.

The current site demonstrates expertise through content. The Premium UX Layer demonstrates expertise through *form matching content* — the precision of the visual language matches the precision of the engineering knowledge. When a mining procurement manager sees a Mohs hardness comparison and a silica ingestion rate table in the industry page, they recognize a peer. The visual seriousness of the page amplifies that recognition.

The contamination particle animations and mechanism visualizations are particularly trust-building. They are the kind of content that only an organization that genuinely understands filtration engineering would produce. Competitors who are presenting spec sheets in PDF format cannot match this.

**Estimated trust impact:** Significant. Visitors who reach technology detail pages are likely procurement engineers or technical decision-makers. The interactive performance curve and mechanism animation are the equivalent of a technical reference publication — they signal that ELIMFILTERS® has committed to communicating the engineering, not just selling the product.

### Engagement

**Yes — measurably.**

The pinned problem section alone will extend average homepage engagement time by 30–60 seconds. A visitor who currently bounces after the hero (the most common drop-off point) may now spend 30 seconds watching three failure modes reveal before ever reaching the product section.

The Knowledge System reading improvements (section progress, pullquote highlights, inline metric color) reduce cognitive load for long-form content. Readers who currently abandon at section 3 of an 8-section Standards page may now complete the page because the visual hierarchy guides them.

The technology horizontal scroll gallery will increase technology page exploration. Currently a visitor sees the comparison table and leaves. The gallery format creates a navigational experience that rewards exploration.

**Estimated engagement impact:** Time-on-page increases across Homepage (+45–90 seconds), Technology pages (+60–120 seconds), Industry pages (+30–60 seconds). Knowledge System page completion rate increases.

### Distributor Conversion

**Yes — at the critical moments that matter.**

The distributor flyout on the homepage (territory availability check before application) reduces friction for qualified candidates and filters out unqualified applicants earlier. A Colombian automotive parts distributor who clicks "Become a Distributor" and sees "Colombia — Available" has an immediate motivational reinforcement that does not exist today.

The pre-form narrative on the application page (what we're looking for, industries, territories) ensures that prospects who reach the form understand the program before investing time in completing it. Incomplete form abandonment rates decrease when visitors understand why they're filling out the form.

The overall premium experience — visual seriousness, engineering depth, contamination expertise — builds the brand credibility that justifies a $6,000 USD opening order to a distributor who has never previously stocked the brand. A distributor evaluating whether to commit to ELIMFILTERS® versus continuing with Baldwin or WIX will compare the brand experience. The Premium UX Layer makes that comparison favorable.

**Estimated distributor conversion impact:** Moderate to significant. The experience does not close deals — conversations and account managers do. But the experience determines whether a prospect takes the next step or returns to a competitor's page. The current experience is adequate. The Premium UX Layer makes it compelling.

---

### The Core Argument

ELIMFILTERS® has built an engineering knowledge system that no competitor in Latin America has matched. The content is the competitive advantage. The Premium UX Layer's job is one thing: **make the quality of the engineering visible at first impression.**

A visitor who spends 90 seconds on the current homepage understands that ELIMFILTERS® sells industrial filters and has a lot of technical information.

A visitor who spends 90 seconds on the Premium UX homepage has watched contamination destroy three industrial systems, seen the moment of protection in yellow, and understands why an ISO cleanliness code is the difference between 3,000 hours and 15,000 hours of bearing life.

**That visitor does not call another supplier first.**

---

*PREMIUM_UX_LAYER_VISUAL_PREVIEW.md — ELIMFILTERS® — June 2026*  
*Visual specification only. No implementation. No code.*
