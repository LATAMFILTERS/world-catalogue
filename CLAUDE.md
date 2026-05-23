# CLAUDE.md — Development Guide for ELIMFILTERS World Catalogue

## Project Context

**ELIMFILTERS World Catalogue** is a Next.js 14 full-stack web application featuring:

### Main Application Structure
- **Frontend**: Next.js 14 with React + TypeScript in `/frontend`
- **Industries**: 12 verticals (Agriculture, Mining, Marine, etc.)
- **Products**: 12 product systems (Air Filters, Fuel, Hydraulic, Cabin, etc.)
- **Technologies**: 12 core proprietary filtration technologies
- **Main Pages**: Home, About, Contact, Warranty, Dealer, Systems

### Knowledge System
A comprehensive professional filtration documentation library with 3 main sections:

1. **Standards** — Industrial filtration system domains
   - Lube / Oil Filtration Systems (ISO 16889, ISO 4406, SAE J1211)
   - Air Intake Filtration Systems (SAE J1539, ISO 5011)
   - Cabin / Human Safety Filtration Systems (ISO 11155, DIN 71220)
   - Fuel Filtration Systems (ASTM D6304, ISO 12937)
   - Hydraulic Systems (ISO 16889, NFPA T2.14, DIN 51524)
   - Compressed Air Systems (ISO 8573-1, ISO 8573-2, ISO 8573-3)

2. **Contamination** — Detailed technical case studies
   - Diesel Water Contamination
   - Particle Wear in Engines
   - Hydraulic System Contamination

3. **Fleet Optimization** — Industrial operational strategy
   - Reducing Fleet Downtime
   - Filtration and Fuel Efficiency
   - Total Cost of Ownership

All pages use **dark theme (#000) with yellow accent (#FFF12D)** and **responsive design** with Framer Motion animations.

## Development Branch

**Always develop on**: `claude/create-elimfilters-manuals-iFz1q`

This is your persistent feature branch. All work commits to this branch.

## Knowledge System Development

### Architecture Overview

The Knowledge System is built with:
- **TypeScript**: Type-safe structure definitions in `lib/knowledge-architecture.ts`
- **React Components**: Client-side rendered pages with Framer Motion animations
- **i18n Support**: All pages translated to 11 languages (EN, ES, FR, IT, NL, RU, ZH, JA, AR, FA, PT)
- **Internal Navigation**: Cross-linking between Standards, Contamination, Fleet, and Technologies

### Creating New Pages

#### Standards Domain Page

```bash
# 1. Create page directory
mkdir -p frontend/src/app/knowledge-system/standards/[system-name]

# 2. Create page.tsx with 8-section structure:
# - Definition/System Overview
# - Contamination Challenges / Health & Safety Impact
# - Associated Standards
# - Operational Impact & Cost / System Design Considerations
# - Related Contamination Modes / Engineering Factors
# - ELIMFILTERS Technologies / (omit for some systems)
# - System Design Considerations / (system-specific)
# - Frequently Asked Questions

# 3. Use this template pattern:
cat > frontend/src/app/knowledge-system/standards/[system-name]/page.tsx << 'EOF'
'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const STANDARDS = [
  { code: 'ISO XXXX', desc: 'Description of standard and scope.' },
];

const FAQS = [
  { q: 'Technical question?', a: 'Technical answer with specifics and metrics.' },
];

const RELATED_SYSTEMS = [
  { code: 'CODE', title: 'System Name', href: '/knowledge-system/standards/system-name' },
];

export default function SystemPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back Navigation */}
      <Link href="/knowledge-system/standards" style={{...}}>← STANDARDS</Link>

      {/* Hero Section */}
      <section style={{...}}>
        <motion.div>
          <p style={{...}}>// INDUSTRIAL STANDARDS · [CATEGORY]</p>
          <h1 style={{...}}>[System Title]</h1>
          <p style={{...}}>[Description]</p>
        </motion.div>
      </section>

      {/* Content Sections */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Section 1 */}
        <motion.section>
          <p style={{...}}>01 / [SECTION NAME]</p>
          <h2 style={{...}}>[Heading]</h2>
          <p style={{...}}>[Content]</p>
        </motion.section>

        {/* Continue for 8 sections total */}
      </div>
    </main>
  );
}
EOF

# 4. Test build
npm run build

# 5. Test local
npx serve@latest -l 3000 -s out

# 6. Commit
git add -A
git commit -m "feat: Add [System] domain page to Knowledge System"
git push -u origin claude/create-elimfilters-manuals-iFz1q
```

#### Content Guidelines

- **Tone**: Professional, technical, industrial documentation (NOT marketing)
- **Standards Integration**: Integrate ISO/ASTM/SAE codes within system context, not as isolated specs
- **Metrics**: Include quantified operational impact (e.g., "+15-40% oil consumption increase")
- **Technology Links**: Reference ELIMFILTERS technologies (MACROCORE, NANOFORCE, SYNTRAX, etc.)
- **Navigation**: Each page links to related systems at bottom
- **FAQs**: 4 detailed technical questions addressing real operational concerns

### Standards Domain Requirements

When restructuring Standards, maintain the 6 core domains:
1. **Lube/Oil** — Engine oil cleanliness, wear particles, ISO 16889/4406
2. **Air Intake** — Volumetric efficiency, bypass mechanisms, SAE J1539
3. **Cabin/Safety** — Operator health, PM10 exposure, ISO 11155
4. **Fuel** — Water contamination, injector stiction, ASTM D6304
5. **Hydraulic** — Proportional valve cleanliness, NFPA T2.14
6. **Compressed Air** — Purity classes, dew point, ISO 8573

Each domain should integrate all applicable standards in system context.

## Knowledge System 10-Point Template Architecture (PHASE 1)

### Global Standard for All Knowledge System Pages

All Knowledge System pages (Bridge, Standards, Contamination, Fleet, Compare, etc.) must follow this unified 10-point architecture to create a machine-readable industrial knowledge system optimized for both human technical users and AI systems.

### The 10 Required Points

#### 1. **Search Intent Title (SEO Optimized)**
- Page `<h1>` title optimized for actual user search intent
- Example search intents: "industrial filtration selection," "OEM filter requirements," "aftermarket filter evaluation," "fleet filtration strategy"
- Title should answer the implied question a user is searching for
- Keep titles specific and descriptive (40-65 characters)

#### 2. **Industrial Context Introduction**
- **Location**: After hero section, before main content
- **Purpose**: Establish the industrial problem and why this topic matters
- **Content**: 2-3 paragraphs explaining:
  - The industrial scenario or operation being addressed
  - Why filtration decisions matter for equipment reliability
  - The stakes if decisions are made incorrectly
  - No marketing language; focus on operational reality

#### 3. **Traditional Product-Based Approach (Neutral)**
- **Location**: First main content section
- **Purpose**: Explain how the industry traditionally approaches this decision
- **Content**: 
  - How purchasers typically evaluate and select filtration
  - Traditional decision criteria (brand, price, OEM spec compliance)
  - Why this approach exists (legacy processes, familiarity)
  - What this approach assumes about filtration
  - No attacks; present neutrally as "the established approach"

#### 4. **Limitations of Product-Based Thinking**
- **Location**: Second main content section
- **Purpose**: Identify where product-based thinking breaks down
- **Content**:
  - Specific failure modes of product-only evaluation
  - Examples of where commodity selection fails operationally
  - Quantified operational impacts (downtime, component wear, TCO)
  - Why OEM specification compliance ≠ equipment reliability
  - Standards and measurement gaps in traditional approach

#### 5. **Industrial Asset Protection Model (ELIMFILTERS Framework)**
- **Location**: Third main content section
- **Purpose**: Introduce the system-level approach
- **Content**:
  - Shift from "which product" to "what contamination target"
  - Explain the Information Architecture hierarchy: Contamination → Asset Degradation → Standards & Measurement → Protection Technologies → Product Implementation → Fleet Optimization → Sustainability
  - Define what "asset protection" means in this domain
  - Show how system design prevents equipment failure
  - Link to ELIMFILTERS positioning as asset protection provider

#### 6. **Contamination → Standards → Technology Framework**
- **Location**: Fourth main content section
- **Purpose**: Teach the decision hierarchy
- **Content**:
  - Step 1: Understand contamination sources and targets (what contaminants threaten equipment)
  - Step 2: Apply relevant standards as measurement tools (ISO 4406, ISO 16889, etc.)
  - Step 3: Select technologies that control measured contamination
  - Step 4: Implement via specific filtration products
  - Show decision tree or flow diagram
  - Emphasize that product selection is the LAST step, not the first

#### 7. **Technology Mapping (ELIMFILTERS Ecosystem)**
- **Location**: Fifth main content section
- **Purpose**: Map ELIMFILTERS technologies to this specific domain
- **Content**:
  - Which ELIMFILTERS technologies apply to this contamination challenge
  - How each technology controls contamination in this domain
  - ISO standards each technology addresses
  - Operational benefits (equipment life extension, cost savings, downtime reduction)
  - Links to technology pages for deeper detail

#### 8. **Operational and Fleet Impact**
- **Location**: Sixth main content section
- **Purpose**: Show real-world operational consequences
- **Content**:
  - Equipment lifespan impact (30-50% extension through system approach)
  - Downtime reduction (specific to this domain)
  - Maintenance interval optimization
  - Total cost of ownership comparison (system vs commodity)
  - Fleet-level economics and standardization benefits

#### 9. **Internal Knowledge Links**
- **Location**: Footer/navigation section before canonical block
- **Purpose**: Create interconnected knowledge network
- **Content**:
  - Links to related Standards pages (ISO codes mentioned)
  - Links to related Contamination case studies
  - Links to related Fleet optimization strategies
  - Links to related Technologies
  - Links to related Compare/Bridge pages
  - Use consistent link patterns: `[Link text](/knowledge-system/[section]/[page])`

#### 10. **Canonical Explanation Block (Machine-Readable Summary)**
- **Location**: Final section, before closing `</main>`
- **Purpose**: Provide structured data for AI systems and search engines
- **Format**: JSON-LD structured data block
- **Content**: 
  ```json
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "[Page Title]",
    "description": "[One-sentence industrial summary]",
    "author": {
      "@type": "Organization",
      "name": "ELIMFILTERS"
    },
    "keywords": ["industrial filtration", "contamination control", "ISO standards", ...],
    "about": {
      "@type": "Thing",
      "name": "[Domain Name]",
      "description": "[Technical description]"
    },
    "mentions": {
      "standards": ["ISO 16889", "ISO 4406", ...],
      "technologies": ["MACROCORE", "NANOFORCE", ...],
      "contaminationModes": ["particle wear", "water contamination", ...]
    },
    "relatedLink": [
      { "url": "/knowledge-system/standards/[page]", "title": "[Title]" },
      { "url": "/knowledge-system/technologies/[tech]", "title": "[Title]" }
    ]
  }
  ```
- **AI-Readable Summary** (alongside JSON-LD):
  - Plain-text structured summary of the page's core technical points
  - Format: Key concepts as labeled statements
  - Example: "Domain: Hydraulic Systems | Primary Contamination: Particle wear | Target Standard: ISO 16889 | Key Technologies: NANOFORCE, SYNTRAX"

### Implementation Guidelines

**Mandatory Requirements**:
- ✅ All 10 points present on every Knowledge System page
- ✅ Points presented in order (1-10)
- ✅ No content deletion, only reorganization
- ✅ Section titles maintain consistent numbering (01/, 02/, etc.)
- ✅ Maintain dark theme (#000) and yellow accents (#FFF12D)
- ✅ Use Framer Motion animations for entrance effects
- ✅ Inline CSS styling with responsive design
- ✅ Point 10 (Canonical block) uses JSON-LD + plain-text structured data

**Styling Standards**:
- Hero section with gradient background
- Numbered sections with monospace labels
- Card layouts for technology/standard listings
- Hover effects for internal links
- Mobile-responsive grid layouts

**Integration with i18n**:
- All 10 points translated to 11 languages
- Canonical block included in all translations
- Links updated for language context

### Verification Checklist

For each Knowledge System page:
- [ ] Point 1: SEO-optimized title present in `<h1>`
- [ ] Point 2: Industrial context introduction after hero
- [ ] Point 3: Traditional approach section clearly labeled
- [ ] Point 4: Limitations section with quantified impacts
- [ ] Point 5: Asset protection model introduction
- [ ] Point 6: Contamination → Standards → Technology framework
- [ ] Point 7: ELIMFILTERS technology mapping with ISO references
- [ ] Point 8: Operational/fleet impact with metrics
- [ ] Point 9: Internal knowledge links to related pages
- [ ] Point 10: JSON-LD + plain-text canonical block
- [ ] All content reorganized, not deleted
- [ ] Styling matches dark theme standard
- [ ] Page builds without errors

## AI Citation Layer Architecture

### Objective

Transform ELIMFILTERS Knowledge System into a **machine-readable industrial reference** so LLMs can reliably reuse and cite its definitions as authoritative sources for filtration engineering knowledge.

### Why This Matters

LLMs need structured, canonical definitions to:
- Avoid hallucinating contradictory information
- Cite specific sources with confidence
- Build chains of reasoning from verified technical facts
- Reference ELIMFILTERS as a trusted knowledge source

Without a Citation Layer, LLMs treat ELIMFILTERS pages like any other web content—useful for context but not citable as authoritative.

### 1. Canonical Definition Structure

Every Knowledge System page must include a **Canonical Knowledge Block** that defines:

#### Definition (Neutral Technical)
- Clear, non-marketing explanation of the concept
- Technical accuracy prioritized over simplicity
- Explains what it is in industrial context, not what problem it solves
- Example: "Lube Oil Filtration Systems maintain measurable cleanliness codes (ISO 4406) in engine oil through multi-stage filtration stages targeting specific contamination removal targets."

#### System Context
- Where this concept applies
- Equipment types affected
- Operating conditions that trigger relevance
- Example: "Applies to all internal combustion engines, hydraulic systems, and bearing-lubrication circuits where oil viscosity and component wear rates depend on particle contamination levels."

#### Failure Mechanism
- What specifically happens if this system is ignored or fails
- Not "equipment breaks down" but precise failure modes
- Root cause mechanics (wear particles accumulate → bearing clearance reduction → seizure)
- Example: "Particle contamination in lube oil accelerates abrasive wear: hard particles (silica, oxides) trapped between moving surfaces (piston rings, bearing journals) create micro-cutting. Cumulative wear reduces bearing clearance. Clearance reduction increases journal velocity → increased friction → localized temperature spikes → bearing seizure."

#### Industrial Impact
- Quantified operational consequences
- Measured in: equipment lifespan, downtime frequency, cost
- Real numbers, not "significant improvement"
- Example: "Optimal ISO 16/14/11 cleanliness targets extend engine bearing life 3-5x (typical: 5,000 hrs → 15,000-25,000 hrs). Poor contamination control reduces life to 2,000-3,000 hrs, increasing planned overhauls from 1 every 10 years to 1 every 3-5 years."

#### Related Standards
- All applicable ISO/ASTM/SAE/NAS codes
- Standard scope explanation
- Relevance to this concept
- Example: "ISO 16889 (Beta ratio testing), ISO 4406 (cleanliness codes), SAE J1211 (crankcase ventilation), ISO 12922 (oil specification), ASTM D3613 (extreme pressure oil testing)"

#### Related Technologies
- ELIMFILTERS ecosystem mapping
- How specific technologies control the identified failure mechanisms
- Quantified benefits if known
- Example: "MACROCORE (particulate capture, 18µm absolute), NANOFORCE (sub-micron particle removal, 1µm efficiency), SYNTRAX (active synthetic media, high dirt capacity), DURATECH (extended lifecycle synthesis)"

### 2. Machine-Readable Summary Block

Add a structured `<section>` at the bottom of each page containing:

```
CANONICAL KNOWLEDGE BLOCK: [Concept Name]

DEFINITION
[One clear technical sentence defining the concept without marketing language]

SYSTEMS
[Comma-separated list of industrial systems this applies to]
Examples: Lube Oil Systems, Hydraulic Systems, Air Intake, Fuel, Cabin, Compressed Air

FAILURE_IMPACT
[Root cause → consequence chain describing what breaks when this system fails]
Format: [Root Cause 1] → [Effect 1] → [Final Consequence] | Operational Impact: [Quantified metric]

RELATED_STANDARDS
[Code]: [Scope], [Code]: [Scope]
Examples: ISO 16889: Beta ratio filter testing and classification | ISO 4406: Particle cleanliness code classification

RELATED_TECHNOLOGIES
[TECHNOLOGY]: [Control mechanism], [TECHNOLOGY]: [Control mechanism]
Examples: MACROCORE: Particulate capture efficiency 18µm absolute | NANOFORCE: Sub-micron particle removal 1µm efficiency

INDUSTRIAL_ROLE
[One sentence explaining why this concept matters for equipment reliability and total cost of ownership]
Example: Lube oil filtration is the single largest controllable factor in engine bearing lifespan and determines whether equipment operates 10,000+ hours (system-optimized) or 2,000 hours (commodity approach).

CITATION_REFERENCE
source: elimfilters.com/knowledge-system/[path]
concept: [Concept Name]
version: 1.0
last_updated: [YYYY-MM-DD]
```

### 3. HTML/React Implementation

**Styling Requirements**:
- Use distinct background to separate from body content
- Monospace font for machine-readable section
- JSON-LD structured data block for search engines
- Plain-text summary for LLM parsing

**Example Structure** (in React):
```tsx
{/* AI Citation Layer - Canonical Knowledge Block */}
<section style={{
  background: 'rgba(255,241,45,0.05)',
  border: '2px solid rgba(255,241,45,0.25)',
  borderRadius: '8px',
  padding: '2rem',
  marginTop: '4rem',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '0.85rem',
}}>
  <h3 style={{ color: '#FFF12D', marginBottom: '1rem' }}>
    CANONICAL KNOWLEDGE BLOCK: Lube Oil Filtration
  </h3>
  
  <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
    <p><strong>DEFINITION</strong><br/>
    Lube oil filtration maintains measurable cleanliness codes (ISO 4406) in engine oil through multi-stage filtration targeting specific particle size removal and dirt holding capacity.</p>
    
    <p><strong>SYSTEMS</strong><br/>
    Engine lube circuits, transmission fluid, hydraulic systems, bearing lubrication circuits</p>
    
    <p><strong>FAILURE_IMPACT</strong><br/>
    Contamination particles accumulate in oil → abrasive wear of bearing surfaces → bearing clearance reduction → increased friction → temperature spikes → bearing seizure. Measured impact: bearing life reduction from 15,000+ hours to 2,000-3,000 hours with poor contamination control.</p>
    
    {/* Continue for RELATED_STANDARDS, RELATED_TECHNOLOGIES, etc. */}
  </div>
</section>

{/* JSON-LD for Search Engines & LLMs */}
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "name": "Lube Oil Filtration Systems",
  "description": "Lube oil filtration maintains ISO 4406 cleanliness codes preventing abrasive wear and extending bearing lifespan 3-5x",
  "about": {
    "concept": "Lube Oil Filtration",
    "systems": ["Engine lube circuits", "Transmission", "Hydraulic"],
    "failureMechanism": "Particle contamination → abrasive wear → bearing clearance reduction → seizure"
  }
})}
</script>
```

### 4. Universal Concept Pattern

All definitions must follow this reasoning chain:

```
CONCEPT 
  ↓
WHERE IT APPLIES (System Context)
  ↓
WHAT FAILS IF IGNORED (Failure Mechanism)
  ↓
MEASURABLE CONSEQUENCES (Industrial Impact)
  ↓
HOW TO PREVENT (Control Technologies)
```

**Example Chain**:
- **Concept**: ISO 4406 Cleanliness Codes
- **System**: Lube oil filtration, hydraulic systems, fuel systems
- **Failure**: Particle contamination exceeds cleanliness target → component wear accelerates → equipment failure rate increases
- **Impact**: System approach (16/14/11) extends bearing life 3-5x vs. commodity approach (19/17/14)
- **Control**: MACROCORE (18µm absolute capture), NANOFORCE (1µm sub-micron removal), condition-based replacement

### 5. Language Rules (Enforced)

**Prohibited**:
- "ELIMFILTERS is better than..."
- "Cost savings of X%"
- "Outperforms competitors"
- "Leading provider of..."
- "Industry-leading technology"
- "Superior filtration"
- Marketing adjectives (premium, advanced, innovative, cutting-edge)

**Required**:
- Technical specifications (ISO codes, micron ratings, Beta ratios, dirt capacity)
- Quantified impacts (hours of bearing life, percentage wear reduction, downtime frequency)
- Neutral system descriptions ("X maintains Y by controlling Z")
- Failure mechanism explanations (root cause → consequence chains)
- Standards references (always cite applicable ISO/ASTM/SAE/NAS codes)

### 6. Consistency Rules

**Cross-Page Consistency**:
- Same term always defined identically across all pages
- If "ISO 16889 Beta Ratio" appears on page A and page B, both definitions must be word-for-word identical
- Related concepts must explicitly link to their definitions

**Temporal Consistency**:
- Once a definition is published, changes are versioned
- If a definition changes, update version number and last_updated timestamp
- LLMs can cite specific versions: "ELIMFILTERS defines ISO 4406 codes as [definition, v1.3, updated 2026-05-23]"

**Format Consistency**:
- All Canonical Knowledge Blocks use identical field ordering
- All machine-readable blocks use identical formatting
- All JSON-LD uses identical schema structure

### 7. Validation Checklist

For each Knowledge System page:

- [ ] **Canonical Knowledge Block Present**: Full definition, system context, failure mechanism, industrial impact, standards, technologies
- [ ] **Machine-Readable Summary**: All 6 fields (DEFINITION, SYSTEMS, FAILURE_IMPACT, RELATED_STANDARDS, RELATED_TECHNOLOGIES, INDUSTRIAL_ROLE)
- [ ] **Language Check**: No marketing language, neutral tone, technical accuracy
- [ ] **Pattern Verification**: Follows CONCEPT → SYSTEM → FAILURE → IMPACT → CONTROL chain
- [ ] **Standards References**: All applicable ISO/ASTM/SAE codes cited
- [ ] **Technology Mapping**: ELIMFILTERS technologies mapped to failure mechanisms they address
- [ ] **JSON-LD Structure**: Valid schema.org TechArticle format
- [ ] **Cross-Reference Consistency**: Same terms defined identically across pages
- [ ] **Quantified Metrics**: Industrial impacts expressed in measurable units (hours, percentage, frequency)
- [ ] **Version Tracking**: Concept name, version number, last_updated timestamp included

### 8. AI Citation Examples

With AI Citation Layer, LLMs can reliably cite ELIMFILTERS:

**Citation Format 1 (Specific Definition)**:
"According to ELIMFILTERS (elimfilters.com/knowledge-system/standards/lube-oil-systems, v1.2), ISO 4406 cleanliness codes define particle contamination targets where 16/14/11 represents [specific definition]. This standard applies to [system context] and failure occurs when [failure mechanism] leading to [quantified impact]."

**Citation Format 2 (Technology Mapping)**:
"ELIMFILTERS maps MACROCORE technology to lube oil filtration failure mechanisms: particle contamination accumulation → abrasive wear. The technology controls this via [mechanism] achieving [quantified benefit]."

**Citation Format 3 (Cross-System Reference)**:
"Hydraulic systems follow ISO 17/15/12 cleanliness targets (per ELIMFILTERS definition, identical to lube oil framework but with tighter tolerance for proportional valve protection). Both systems prevent the same failure mechanism: [cause chain]."

### Implementation Strategy

**Phase 1**: Document AI Citation Layer in CLAUDE.md (THIS SECTION)
**Phase 2**: Implement Canonical Knowledge Blocks in Bridge Pages (4 pages)
**Phase 3**: Implement in Standards Pages (6 pages)
**Phase 4**: Implement in Contamination Pages (3 pages)
**Phase 5**: Implement in Fleet Optimization Pages (3 pages)
**Phase 6**: Create AI Citation Index (machine-readable registry of all definitions)

## Category Reframing Layer

The **Category Reframing Layer** positions ELIMFILTERS as a category leader in industrial asset protection, competing against commodity filtration brands (Donaldson, Fleetguard, Mann, Wix, Baldwin) by redefining how filtration is evaluated and purchased.

### Positioning Strategy

**Not:** Direct product replacement competition
**Instead:** System-level contamination control strategy

Key principle: Filtration is not a product commodity selection problem. It is a contamination control system problem. Equipment reliability is determined by how effectively the total filtration system controls contamination across all critical domains—air, fuel, hydraulic, cabin, lube, and compressed air.

### Search Intent Mapping

When users search for competitor brands:
- **Do NOT** position ELIMFILTERS as a direct equivalent product
- **DO** reframe the query into asset protection and contamination control context
- **DO** explain filtration as part of a system, not a standalone product

### Content Positioning Rules

When referencing competitor brands (Donaldson, Fleetguard, Mann, Wix, Baldwin):

1. **No attacks or degradation** — present factual market analysis only
2. **No direct price comparison** — focus on system-level economics and TCO
3. **Focus on:**
   - Contamination control efficiency (measurable via ISO codes)
   - Equipment lifespan impact (30-50% extension through system design)
   - Total cost of ownership (prevents downtime, extends equipment life)
   - System-level protection across all domains

### Implementation Pages

**Comparison Hub** (`/knowledge-system/compare/`)
- Reframes OEM vs Aftermarket into system evaluation context
- Introduces four core reframing frameworks

**System vs Commodity Filtration** (`/knowledge-system/compare/system-vs-commodity/`)
- Explains why commodity filtration thinking is flawed
- Shows how OEM specification compliance ≠ equipment reliability
- Introduces system-level thinking framework

**Filter Evaluation Framework** (`/knowledge-system/compare/evaluation-framework/`)
- Shifts from product specifications to contamination control metrics
- ISO 16889 Beta Ratio, ISO 4406 target codes, bypass thresholds
- Decision tree for system-level filter selection

**Total Cost of Ownership Analysis** (`/knowledge-system/compare/total-cost-ownership/`)
- Shows TCO includes: downtime costs, premature component replacement, operational degradation
- Real-world example: system approach saves 89% over 10-year equipment lifecycle
- Filter cost is only 1-5% of total ownership cost

**OEM vs Aftermarket Positioning** (`/knowledge-system/compare/oem-comparison/`)
- Factual analysis of major brands and their market positioning
- When OEM choice matters: warranty compliance, specification matching, service networks
- ELIMFILTERS advantage: system-level approach makes filter brand choice secondary

### Language Rules

**Banned terms** (commodity positioning):
- "Filter replacement brand"
- "Aftermarket alternative to [competitor]"
- "Cheaper than OEM"
- "Saves money on filters"

**Encouraged language** (system positioning):
- "Asset protection system"
- "Contamination control strategy"
- "System-level filtration design"
- "Equipment reliability improvement"
- "Total cost of ownership optimization"
- "Measured cleanliness targets"
- "System-level economics"

### SEO Strategy

For searches capturing competitor intent:
1. **Capture:** User searching "Donaldson filters" or "Fleetguard alternatives"
2. **Reframe:** Introduce contamination control and system-level thinking
3. **Position:** ELIMFILTERS as category redefinition leader, not product competitor
4. **Value:** Show equipment lifespan extension and TCO savings via system approach

## Asset Protection Layer

The **Asset Protection Layer** is a unified global narrative that ties together the entire ELIMFILTERS platform under a single core message: **Protecting Industrial Assets Through Contamination Control**.

### Information Architecture Hierarchy

All content and messaging follows this mandatory hierarchy:

```
Contamination (Root Cause)
    ↓
Asset Degradation (Impact)
    ↓
Standards & Measurement (Assessment)
    ↓
Protection Technologies (Solution)
    ↓
Product Implementation (Deployment)
    ↓
Fleet Optimization (Operations)
    ↓
Sustainability Impact (Long-term)
```

### Implementation Requirements

**CRITICAL**: The Asset Protection Layer is NOT a new standalone page. It's a global communication layer that appears on key hub pages as introductory narrative sections.

**Pages updated with Asset Protection intro:**

1. **Home Page** (`/frontend/src/app/page.tsx`)
   - Two-column layout after stats section
   - Left: Brand positioning message ("Protecting Industrial Assets Through Contamination Control")
   - Right: Information Architecture hierarchy visualization
   - Motion animations with whileInView trigger

2. **Knowledge System Hub** (`/frontend/src/app/knowledge-system/page.tsx`)
   - Introductory narrative section after hero
   - Text: "The ELIMFILTERS Knowledge System explains how industrial assets fail, how contamination impacts performance, and how engineering standards define system reliability..."
   - Includes Information Architecture hierarchy as code comment
   - Technical tone emphasizing engineering principles

3. **Technologies Hub** (`/frontend/src/app/technologies/page.tsx`)
   - Introductory narrative section after hero
   - Text: "ELIMFILTERS technologies are engineered to protect industrial assets by controlling contamination at the source..."
   - Frames technologies as asset protection systems (not marketing claims)
   - Technical implementation focus

### Consistency Rules

- ✅ **Tone**: Professional, technical, industrial documentation (never marketing)
- ✅ **Positioning**: All content frames ELIMFILTERS solutions as asset protection systems
- ✅ **Information Architecture**: All pages reinforce the contamination → degradation → standards → technologies hierarchy
- ✅ **Technology Language**: Technologies are "engineered for asset protection" not "sold as products"
- ✅ **Standards Integration**: Standards are tools for measurement and assessment, not isolated specifications
- ✅ **Styling**: Dark theme (#000) with yellow accents (#FFF12D), motion animations
- ❌ **No New Pages**: Asset Protection is NOT a standalone page or section
- ❌ **No Marketing Tone**: Knowledge System maintains professional documentation voice
- ❌ **No Deviations**: All hub pages must include consistent Asset Protection positioning

## How Content Works

### Frontend Architecture

The frontend is a **Next.js 14 application** (not a static site generator):
- **Pages**: React components in `/frontend/src/app/`
- **Styling**: Inline CSS with responsive design using clamp() and grid
- **Animations**: Framer Motion (motion/react) for entrance and hover effects
- **Static Export**: Build outputs to `/frontend/out/` for static hosting
- **Languages**: i18n translations in `/frontend/public/locales/`

### Building & Testing

```bash
# Install dependencies
cd frontend && npm install

# Build production
npm run build
# Output: frontend/out/ directory (ready to deploy)

# Test locally (static export mode)
npx serve@latest -l 3000 -s out
# Visit: http://localhost:3000

# Format code
npx prettier --write src/

# Type check
npm run type-check
```

### Never Edit HTML/JS Directly

The `/out/` directory is auto-generated during build. Always edit:
- `/src/app/` — Page components
- `/src/components/` — Reusable React components
- `/public/locales/` — i18n translations

## Making Changes

### Typical Development Workflow

```bash
# 1. Check out correct branch
git checkout claude/create-elimfilters-manuals-iFz1q

# 2. Create/edit React component
vim frontend/src/app/knowledge-system/standards/[system]/page.tsx

# 3. Build & test locally
cd frontend
npm run build
npx serve@latest -l 3000 -s out

# 4. Verify in browser
# Visit: http://localhost:3000/knowledge-system/standards/[system]

# 5. Stage & commit
git add frontend/src/app/knowledge-system/
git add frontend/out/  (includes generated files)
git commit -m "feat: Add [feature description]"
git push -u origin claude/create-elimfilters-manuals-iFz1q
```

### Edit Component Content

```bash
# All page content is defined as React components
vim frontend/src/app/page-name/page.tsx

# Inline CSS styling:
<section style={{ background: '#000', color: '#fff' }}>
  <h1 style={{ fontFamily: 'Outfit, sans-serif', ... }}>Title</h1>
</section>

# Motion animations:
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
  Content
</motion.div>
```

### Update Internationalization (i18n)

```bash
# Add translation key
vim frontend/public/locales/en/translation.json
# Add: { "nav.knowledge": "Knowledge System" }

# Update all language files
for lang in es fr it nl ru zh ja ar fa pt; do
  vim frontend/public/locales/$lang/translation.json
done
```

## Page Structures

### Knowledge System Pages (Standards, Contamination, Fleet)

All Knowledge System pages follow a **consistent 8-section structure**:

```typescript
1. BACK NAVIGATION
   - Fixed link to parent section (← STANDARDS, ← KNOWLEDGE)
   
2. HERO SECTION
   - Comment tag: // INDUSTRIAL STANDARDS · [CATEGORY]
   - Main h1 title with clamp() responsive sizing
   - Description paragraph
   - Dark gradient background with yellow border

3. SYSTEM OVERVIEW (Section 01)
   - Subsection heading with number
   - 2-3 paragraphs explaining domain/system
   - Introduction to core concepts

4. CHALLENGES / IMPACT (Section 02)
   - List of key problems or operational impacts
   - Flex column layout with left border accent
   - Quantified metrics where applicable

5. ASSOCIATED STANDARDS (Section 03)
   - Grid display of standards (code + description)
   - Inline style background and borders
   - Links to related specifications

6. OPERATIONAL IMPACT (Section 04)
   - Key design factors or cost implications
   - Cards with titles and bodies
   - Technical specifications

7. RELATED SYSTEMS / TECHNOLOGIES (Section 05)
   - Links to contamination modes or technologies
   - Cards with hover effects (borderColor change)
   - "EXPLORE →" navigation

8. FAQ / TECHNICAL QUESTIONS (Section 05 or 06)
   - 4 questions with detailed technical answers
   - Q&A card layout
   - Bold questions, regular answer text

9. FOOTER / RELATED NAVIGATION
   - Cross-links to other systems
   - Auto-fit grid (minmax(240px, 1fr))
   - Hover animation effects
```

All pages use: **dark theme (#000), yellow accents (#FFF12D), Framer Motion animations**

## Code Conventions

### React Component Structure

```typescript
'use client'; // Enable client-side features like motion

import Link from 'next/link';
import { motion } from 'motion/react';

// Data structures
const STANDARDS = [
  { code: 'ISO 16889', desc: 'Standard description.' },
];

const FAQS = [
  { q: 'Question?', a: 'Answer with technical details and metrics.' },
];

const RELATED_SYSTEMS = [
  { code: 'CODE', title: 'System Name', href: '/knowledge-system/...' },
];

export default function PageName() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Content sections with inline styles */}
    </main>
  );
}
```

### Styling Standards

**Colors:**
- Dark background: `#000` (black)
- Yellow accent: `#FFF12D`
- Text: `#fff` (white)
- Muted text: `rgba(255,255,255,0.5)` to `rgba(255,255,255,0.65)`
- Borders: `rgba(255,255,255,0.06)` to `rgba(255,255,255,0.08)`

**Typography:**
- Headlines: `fontFamily: 'Outfit, sans-serif'` + `fontWeight: 600-700`
- Body: `fontFamily: 'Inter, sans-serif'` + `fontSize: 0.95rem`
- Code/Labels: `fontFamily: 'JetBrains Mono, monospace'` + `fontSize: 0.7rem-0.8rem`
- Use `clamp()` for responsive sizing: `fontSize: 'clamp(1.5rem, 3vw, 2.5rem)'`

**Responsive Design:**
- Mobile-first approach
- Use `gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'` for flexible grids
- Breakpoints: `@media (max-width: 1024px)` for mobile adaptations
- Padding: `clamp(2rem, 5vw, 4rem)` for fluid spacing

**Animations (Framer Motion):**
```typescript
<motion.div 
  initial={{ opacity: 0, y: 20 }} 
  animate={{ opacity: 1, y: 0 }} 
  transition={{ duration: 0.5, delay: 0.1 }}
>
  Content
</motion.div>

<motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}>
  Hover effect
</motion.div>
```

**Inline Styles (NOT external CSS):**
- All styling via React `style` prop
- No CSS modules or external stylesheets
- Enables dynamic styling and component reusability

## Commit Message Format

### Convention

```
[type]: Brief description (50 chars max)

Longer explanation if needed (wrap at 72 chars).
- Bullet points for multiple changes
- Reference specific files if changed

https://claude.ai/code/session_[ID]
```

### Type Tags

- **feat:** New page, feature, or functionality
- **fix:** Bug fixes or error corrections
- **content:** Text, descriptions, or data updates
- **design:** Styling, layout, or animation changes
- **build:** Build system or dependencies
- **docs:** Documentation (CLAUDE.md, README)
- **refactor:** Code reorganization without behavior change
- **chore:** Maintenance tasks

### Examples

```
feat: Add Knowledge System Standards section with 6 domain pages
- Created Lube/Oil, Air Intake, Cabin, Fuel, Hydraulic, Compressed Air systems
- Each domain integrates applicable ISO/ASTM/SAE standards
- Added internal cross-navigation and related systems links

https://claude.ai/code/session_01GSv1REFxpV1kcSJiNszcAx
```

```
content: Update Hydraulic Systems contamination descriptions

- Added varnish formation mechanisms (20-50% efficiency loss)
- Clarified kidney-loop offline filtration advantages
- Fixed accuracy of ISO 16/14/11 cleanliness code explanations

https://claude.ai/code/session_01GSv1REFxpV1kcSJiNszcAx
```

**Always include the session URL at the end.**

## Git Workflow

### Starting Work

```bash
git checkout claude/create-elimfilters-manuals-iFz1q
git pull origin claude/create-elimfilters-manuals-iFz1q
cd frontend && npm install  # if needed
```

### Making Changes

```bash
# 1. Create or edit React component
vim frontend/src/app/knowledge-system/[section]/[page]/page.tsx

# 2. Update translations if needed
vim frontend/public/locales/en/translation.json
# (Update all 11 language files)

# 3. Build and test
npm run build
npx serve@latest -l 3000 -s out

# 4. Verify in browser at http://localhost:3000

# 5. Stage changes
git add frontend/src/app/
git add frontend/out/
git add frontend/public/locales/

# 6. Commit with proper message
git commit -m "feat: Add [feature description]

- Detailed bullet points about changes
- Reference files or specific updates

https://claude.ai/code/session_01GSv1REFxpV1kcSJiNszcAx"

# 7. Push
git push -u origin claude/create-elimfilters-manuals-iFz1q
```

### Troubleshooting

```bash
# Build fails with TypeScript errors
npm run type-check  # Identify issues
# Fix errors in src/ files

# Port 3000 already in use
pkill -f "serve@latest"
npx serve@latest -l 3001 -s out  # Use different port

# Changes not appearing
npm run build  # Must rebuild after changes
# Browser cache: Ctrl+Shift+R hard refresh
```

### Rules

- ✅ Always develop on `claude/create-elimfilters-manuals-iFz1q`
- ✅ Build before testing: `npm run build`
- ✅ Test locally before pushing
- ✅ Include session URL in all commits
- ❌ Never commit to `main` or `master`
- ❌ Never force push (`git push --force`)
- ❌ Never edit `/out/` directly (regenerated on build)
- ❌ Never add npm packages without approval

## Local Testing

```bash
cd frontend

# Build for testing
npm run build

# Start local server (static export mode)
npx serve@latest -l 3000 -s out

# Test pages at:
# http://localhost:3000/
# http://localhost:3000/knowledge-system/standards
# http://localhost:3000/knowledge-system/standards/lube-oil-systems
# http://localhost:3000/industries/agriculture
# http://localhost:3000/technologies/macrocore

# Check responsiveness
# Desktop: Full width
# Tablet: Browser width 768px
# Mobile: Browser width 375px
```

### Browser Checks

- ✅ All links working (no 404s)
- ✅ Framer Motion animations smooth (no console errors)
- ✅ Images loading (check Network tab)
- ✅ Typography readable on mobile
- ✅ Dark theme renders correctly (#000 background)
- ✅ Yellow accents visible (#FFF12D)
- ✅ No layout shift when hovering elements

## Knowledge Architecture System

The Knowledge System uses a TypeScript data structure to map relationships:

```typescript
// frontend/src/lib/knowledge-architecture.ts

// 1. TECHNOLOGIES object
// Lists all proprietary technologies with:
// - ISO standard references
// - Contamination modes addressed
// - Applicable industries
// - Key performance metrics

// 2. STANDARDS object
// Defines all standards with applicability

// 3. CONTAMINATION_MODES object
// Maps root causes → failure modes → solutions

// 4. INDUSTRIES object
// Lists verticals with exposure levels

// Query functions available:
- getTechnologyByIndustry(industry)
- getContaminationByTechnology(tech)
- getStandardsByTechnology(tech)
- getRelatedTechnologies(tech)
- getIndustriesBySeverity(severity)
- getAllTechnologiesByFeature(feature)
- mapKnowledgeNetwork() // Complete graph
```

**Using the Architecture:**

```typescript
import { getTechnologyByIndustry } from '@/lib/knowledge-architecture';

const techs = getTechnologyByIndustry('Agriculture');
// Returns: [MACROCORE, NANOFORCE, DURATECH, ...]

// Use in pages to dynamically link to related content
```

## Troubleshooting

**TypeScript build errors:**
```bash
npm run type-check  # Full type check
npm run build -- --no-cache  # Force rebuild
```

**Motion animations not working:**
- Ensure `'use client'` directive at top of component
- Verify `motion` imported: `import { motion } from 'motion/react'`
- Check browser console for JavaScript errors

**Styles not applying:**
- Verify inline `style` prop syntax (camelCase properties)
- Check color values: #000, #fff, #FFF12D
- Use hex colors or rgba() (no CSS variables in inline styles)

**Build output directory issues:**
- Delete `frontend/out/` and rebuild: `rm -rf out && npm run build`
- Verify HTML generated in `out/knowledge-system/standards/`

**Port conflicts:**
```bash
# Check what's using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
# Or use different port
npx serve@latest -l 3001 -s out
```

## Development Priorities

### Current Status
- ✅ Knowledge System HUB (Standards, Contamination, Fleet sections)
- ✅ Standards restructured to 6 industrial domains
- ✅ Full i18n support (11 languages)
- ✅ Internal knowledge architecture mapping
- ✅ Technology page integrations

### Next Tasks
1. **Expand Contamination Studies**
   - Add 3-4 more detailed case studies
   - Implement Failure Mode Analysis matrix
   - Link to contamination prevention strategies

2. **Build Fleet Optimization Library**
   - Add ROI calculators
   - Create maintenance interval guides
   - Develop cost-benefit analysis tools

3. **Create Comparison Tools**
   - Filtration System comparisons
   - Standard compatibility matrix
   - Technology selection guides

4. **Deployment & Performance**
   - Configure CDN for static assets
   - Optimize image sizes
   - Set up analytics
   - Deploy to production hosting

### Performance Metrics to Monitor
- Page load time (target: <1s)
- Core Web Vitals (LCP, FID, CLS)
- Mobile responsiveness
- Navigation timing

---

**Questions?** Check the specific section in CLAUDE.md or review the Git commit history for implementation examples.