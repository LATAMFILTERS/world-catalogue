# ELIMFILTERS World Catalogue

Professional filtration solutions documentation, product showcase, and industrial knowledge library built with Next.js 14.

## Overview

ELIMFILTERS is a comprehensive filtration engineering platform serving heavy-duty, mission-critical operations across:

- **12 Industry Verticals** (Agriculture, Automotive, Mining, Marine, Oil & Gas, Power Generation, etc.)
- **12 Product Systems** (Air, Fuel, Hydraulic, Cabin, Coolant, Lube filters and more)
- **12 Core Technologies** (SYNTRAX™, AQUAGUARD™, NANOFORCE™, SYNTEPORE™, DURATECH™, MICROKAPPA™)

### Knowledge System

A comprehensive professional filtration documentation library with 3 sections:

1. **Standards** — 6 industrial filtration system domains with integrated ISO/ASTM/SAE specifications
   - Lube / Oil Filtration Systems
   - Air Intake Filtration Systems
   - Cabin / Human Safety Filtration Systems
   - Fuel Filtration Systems
   - Hydraulic Systems
   - Compressed Air Systems

2. **Contamination** — Detailed technical case studies and failure mode analysis
   - Diesel Water Contamination
   - Particle Wear in Engines
   - Hydraulic System Contamination

3. **Fleet Optimization** — Industrial operational strategy and cost analysis
   - Reducing Fleet Downtime
   - Filtration and Fuel Efficiency
   - Total Cost of Ownership

### Asset Protection Layer

A unified global narrative framework that ties together all platform content under a single core message: **Protecting Industrial Assets Through Contamination Control**.

**Information Architecture Hierarchy:**
```
Contamination (Root Cause) → Asset Degradation (Impact) → 
Standards & Measurement (Assessment) → Protection Technologies (Solution) → 
Product Implementation (Deployment) → Fleet Optimization (Operations) → 
Sustainability Impact (Long-term)
```

**Key Implementation:**
- Home page includes Asset Protection strategy section with Information Architecture visualization
- Knowledge System hub introduces asset protection principles and how contamination impacts performance
- Technologies hub frames all solutions as engineered asset protection systems
- Consistency rules ensure professional tone and technical positioning across all pages
- No marketing language in technical documentation

## Project Structure

```
world-catalogue/
├── frontend/                          # Next.js 14 application
│   ├── src/
│   │   ├── app/                      # Page components
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── industries/           # 12 industry pages
│   │   │   ├── products/             # 12 product pages
│   │   │   ├── technologies/         # 12 technology pages
│   │   │   ├── knowledge-system/     # Knowledge library
│   │   │   │   ├── standards/        # 6 domain pages
│   │   │   │   ├── contamination/    # 3 case studies
│   │   │   │   └── fleet/            # 3 strategy pages
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── ...
│   │   ├── components/               # Reusable React components
│   │   │   ├── Navigation.tsx
│   │   │   ├── TechDetailPage.tsx
│   │   │   └── ...
│   │   ├── lib/                      # Utilities
│   │   │   └── knowledge-architecture.ts  # Knowledge system data
│   │   └── styles/
│   │
│   ├── public/
│   │   ├── locales/                  # i18n translations (11 languages)
│   │   │   ├── en/
│   │   │   ├── es/
│   │   │   ├── fr/
│   │   │   └── ...
│   │   └── images/
│   │
│   ├── out/                          # Static export (generated on build)
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── CLAUDE.md                         # Development guide
├── README.md                         # This file
└── .gitignore
```

## Technology Stack

- **Framework**: Next.js 14 with React 19 + TypeScript
- **Styling**: Inline CSS (no external stylesheets)
- **Animations**: Framer Motion (motion/react)
- **Internationalization**: i18next (11 languages)
- **Build Output**: Static HTML/CSS/JS export
- **Color Scheme**: Dark theme (#000) with yellow accent (#FFF12D)
- **Typography**: Outfit (headlines), Inter (body), JetBrains Mono (code/labels)

## Page Architecture

### Main Pages
- **Home** (`/`) — Landing page with product showcase
- **Industries** (`/industries/[slug]`) — 12 industry verticals with filtration solutions
- **Products** (`/products/[slug]`) — 12 product system pages with detailed specs
- **Technologies** (`/technologies/[slug]`) — 12 technology pages with related knowledge links
- **Systems** (`/systems`) — System integration overview
- **About, Contact, Warranty, Dealer** — Company information pages

### Knowledge System Pages
- **Standards Hub** (`/knowledge-system/standards/`) — 6 domain cards with navigation
- **Domain Pages** (e.g., `/knowledge-system/standards/lube-oil-systems/`)
  - 8-section structure: Overview, Challenges, Standards, Impact, Related, Technologies, Design, FAQ
  - Internal cross-navigation to related systems
  - Integrated ISO/ASTM specifications (not isolated specs)

- **Contamination Hub** (`/knowledge-system/contamination/`) — 3 case study cards
- **Case Study Pages** — Detailed failure mode analysis with technical depth

- **Fleet Hub** (`/knowledge-system/fleet/`) — 3 strategy cards
- **Strategy Pages** — Operational economics and ROI analysis

## Local Development

### Prerequisites
- Node.js 18+ with npm
- Git

### Installation & Setup

```bash
# Clone repository
git clone <repo-url>
cd world-catalogue

# Install dependencies
cd frontend && npm install

# Checkout development branch
git checkout claude/create-elimfilters-manuals-iFz1q
```

### Development Workflow

```bash
# 1. Create/edit React component
vim frontend/src/app/knowledge-system/standards/[system]/page.tsx

# 2. Build
npm run build

# 3. Test locally (static export)
npx serve@latest -l 3000 -s out

# 4. Visit http://localhost:3000
# Check: All links work, animations smooth, layout responsive

# 5. Stage and commit
git add frontend/src/
git add frontend/out/
git commit -m "feat: [description]

- Bullet points of changes

https://claude.ai/code/session_[ID]"

# 6. Push to feature branch
git push -u origin claude/create-elimfilters-manuals-iFz1q
```

### Available Scripts

```bash
npm run build      # Build for production (static export)
npm run type-check # TypeScript type checking
npm run dev        # Development server (requires different next.config setup)
```

## Content Management

All page content is defined as React components in TypeScript:

```typescript
// Example: Create new Standards domain page
'use client';
import Link from 'next/link';
import { motion } from 'motion/react';

const STANDARDS = [
  { code: 'ISO XXXX', desc: 'Standard description.' },
];

export default function DomainPage() {
  return (
    <main style={{ background: '#000', color: '#fff' }}>
      {/* Hero section with motion animations */}
      {/* Content sections 1-8 */}
      {/* Related systems navigation */}
    </main>
  );
}
```

### Internationalization

All pages support 11 languages (EN, ES, FR, IT, NL, RU, ZH, JA, AR, FA, PT):

```bash
# Add translation
vim frontend/public/locales/en/translation.json
# Add: { "nav.knowledge": "Knowledge System" }

# Update all language files
vim frontend/public/locales/es/translation.json
vim frontend/public/locales/fr/translation.json
# ... etc for all 11 languages
```

## Code Conventions

### Styling
- **Dark background**: `#000`
- **Yellow accent**: `#FFF12D`
- **Text color**: `#fff` (white), `rgba(255,255,255,0.5)` (muted)
- **Borders**: `rgba(255,255,255,0.06)` to `rgba(255,255,255,0.08)`
- **Responsive**: Use `clamp()` for fluid typography and spacing

### React Components
- Use `'use client'` directive for client-side features
- Inline CSS via React `style` prop
- Framer Motion for animations
- TypeScript for type safety

### Commit Message Format

```
[type]: Brief description

Longer explanation with details.
- Bullet points for multiple changes

https://claude.ai/code/session_[ID]
```

Types: `feat`, `fix`, `content`, `design`, `build`, `docs`, `refactor`, `chore`

## Knowledge Architecture System

The Knowledge System includes a TypeScript data structure (`lib/knowledge-architecture.ts`) that maps:

- **Technologies** → applicable standards, contamination modes, industries
- **Standards** → related technologies and application domains
- **Contamination Modes** → root causes, failure modes, and technology solutions
- **Industries** → exposure levels and applicable technologies

Query functions available:
- `getTechnologyByIndustry(industry)`
- `getContaminationByTechnology(tech)`
- `getStandardsByTechnology(tech)`
- `getRelatedTechnologies(tech)`
- `getIndustriesBySeverity(severity)`
- `mapKnowledgeNetwork()` — Complete system graph

Use in pages to create dynamic links and recommendations.

## Deployment

### Static Export Build

The project uses Next.js static export (`output: export` in next.config.js):

```bash
npm run build
# Generates: frontend/out/ directory (ready for deployment)

# Test locally before deploying
npx serve@latest -l 3000 -s out
```

Output directory contains complete static site (HTML, CSS, JS) ready for:
- CDN hosting (Cloudflare, Netlify)
- Static file servers (S3, Railway)
- Traditional web servers (Apache, Nginx)

### Environment Variables

Create `.env.local` if using dynamic features:

```bash
# Frontend only — no backend API calls
NEXT_PUBLIC_SITE_URL=https://elimfilters.com
```

## Performance

- **Page size**: ~140 KB per Knowledge System page
- **Load time**: <1s on broadband
- **Mobile responsive**: Tested at 375px, 768px, 1024px+
- **Animations**: Smooth 60fps with Framer Motion
- **SEO ready**: Meta tags, semantic HTML, Open Graph

## Git Workflow

### Branch Strategy

- **Main branch**: `main` (production)
- **Development branch**: `claude/create-elimfilters-manuals-iFz1q` (all feature development)
- **Never**: Force push, commit directly to main, create random branches

### Commit Messages

Always include session URL for traceability:

```
https://claude.ai/code/session_01GSv1REFxpV1kcSJiNszcAx
```

See **CLAUDE.md** for detailed development instructions.

## File Naming Conventions

- **Page components**: kebab-case folders, `page.tsx` inside
  - Example: `frontend/src/app/knowledge-system/standards/lube-oil-systems/page.tsx`
- **Components**: PascalCase
  - Example: `TechDetailPage.tsx`, `Navigation.tsx`
- **Utilities**: camelCase
  - Example: `knowledge-architecture.ts`
- **Styles**: Inline React styles (no external files)

## Troubleshooting

### Build fails

```bash
npm run type-check  # Find TypeScript errors
npm run build -- --no-cache  # Force rebuild
```

### Pages not updating

- Verify you edited files in `src/app/` (not `/out/`)
- Run `npm run build` to regenerate static files
- Hard refresh browser: `Ctrl+Shift+R`

### Port conflicts

```bash
pkill -f "serve@latest"
npx serve@latest -l 3001 -s out  # Use different port
```

### Animation issues

- Ensure component has `'use client'` directive
- Verify `motion` imported: `import { motion } from 'motion/react'`
- Check browser console for JavaScript errors

## Support & Maintenance

**Comprehensive guides**:
- **CLAUDE.md** — Development instructions and workflows
- **Knowledge Architecture** — System design and relationships
- **Git history** — Implementation examples in commit messages

**Common tasks**:
1. Add new Standards domain → Create 8-section page in `/knowledge-system/standards/`
2. Update translations → Edit JSON files in `/public/locales/`
3. Create technology link → Add "Related Knowledge" cards to technology pages
4. Deploy new content → Build, test locally, commit, push to feature branch

## License

© 2026 ELIMFILTERS. All rights reserved.

## Contact

- **Website**: https://elimfilters.com
- **Email**: elimfilters@gmail.com
- **Technical**: See CLAUDE.md for development instructions

---

**Last Updated**: May 2026
**Pages**: 43+ (12 industries + 12 products + 12 technologies + 7 main + Knowledge System)
**Knowledge System**: Standards (6 domains) + Contamination (3 studies) + Fleet (3 strategies)
**Languages**: 11 (EN, ES, FR, IT, NL, RU, ZH, JA, AR, FA, PT)
**Framework**: Next.js 14 with React 19 + TypeScript
