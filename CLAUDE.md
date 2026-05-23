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