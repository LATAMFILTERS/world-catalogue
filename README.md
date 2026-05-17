# ELIMFILTERS World Catalogue

Professional filtration solutions documentation and product catalogue for industrial, commercial, and municipal applications.

## Overview

ELIMFILTERS is a comprehensive filtration engineering platform serving heavy-duty, mission-critical operations across:
- **12 Industry Verticals** (Agriculture, Automotive, Mining, Marine, Oil & Gas, Power Generation, etc.)
- **12 Product Systems** (Air, Fuel, Hydraulic, Cabin, Coolant, Lube filters and more)
- **12 Core Technologies** (SYNTRAX™, AQUAGUARD™, NANOFORCE™, SYNTEPORE™, etc.)

## Project Structure

```
world-catalogue/
├── www/                          # Static website files
│   └── index.html               # Landing page
├── industries/                  # 12 industry vertical pages
│   ├── agriculture.html
│   ├── automotive.html
│   ├── mining.html
│   └── ... (12 total)
├── products/                    # 12 product system pages
│   ├── airfilter.html
│   ├── fuel.html
│   ├── hydraulic.html
│   └── ... (12 total)
├── technologies/                # 12 technology pages
│   ├── syntrax.html
│   ├── aquaguard.html
│   ├── nanoforce.html
│   └── ... (12 total)
├── server.js                    # Express.js backend
├── routes/                      # API routes (chat, knowledge, webhooks)
├── services/                    # Business logic
├── template-unified.html        # Master template for all pages
├── catalogue.json              # Content database (extracted from HTML)
├── generate_pages.py           # Script to regenerate pages
├── README.md                   # This file
└── CLAUDE.md                   # Claude Code instructions
```

## Technology Stack

- **Frontend**: Vanilla HTML/CSS (no frameworks, light-weight)
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (Railway deployment)
- **Styling**: Custom CSS with responsive grid layouts
- **Fonts**: Montserrat (impact/headings), Inter (body), JetBrains Mono (code/tech)
- **Color Scheme**: Dark theme (#000) with yellow accent (#FFF12D)

## Page Architecture

All pages follow a **unified template** with consistent structure:

1. **Hero Section** — Title, subtitle, tagline, CTA
2. **Key Advantages** — Feature list (4-6 items)
3. **Engineering Excellence** — Overview paragraph + specs card
4. **Performance Metrics** — 3 stat boxes with key numbers
5. **Recommended Applications** — Use cases + technologies
6. **Call-to-Action** — "Find My Filter" button linking to SKU search
7. **Footer** — Copyright and branding

### Responsive Design
- Desktop: 2-column grids, full layouts
- Tablet: 1 column, adjusted padding
- Mobile: Single column, optimized typography

## Content Management

### Updating Page Content

Pages are generated from **catalogue.json** using `generate_pages.py`:

```bash
python3 generate_pages.py
```

To modify content:
1. Edit `catalogue.json` with new data (title, features, stats, etc.)
2. Run the generation script
3. Commit both the JSON and regenerated HTML

### Adding a New Industry/Product/Technology

1. Add entry to `catalogue.json` under appropriate category
2. Run `python3 generate_pages.py`
3. Verify generated HTML looks correct
4. Commit changes

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Python 3.8+ (for page generation)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Server runs on `http://localhost:3000`

### API Endpoints

- `GET /api/status` — Health check
- `POST /api/chat` — Chatbot interface
- `POST /api/groq-chat` — AI-powered responses
- `POST /api/leads` — Lead capture
- `POST /api/knowledge` — Knowledge base queries
- `POST /webhook/whatsapp` — WhatsApp integration

## Deployment

### Railway Deployment

Configuration files:
- `railway.toml` — Build and start commands
- `nixpacks.toml` — Environment setup
- `.env.example` — Required environment variables

Environment variables required:
```
DATABASE_URL=postgresql://...
GROQ_API_KEY=...
GOOGLE_PRIVATE_KEY=...
TWILIO_AUTH_TOKEN=...
DB_PASSWORD=...
```

### Build & Deploy

```bash
# Local build test
npm run build

# Deploy to Railway
git push origin main
```

## Code Conventions

### HTML Pages
- All pages use `template-unified.html` as base
- CSS is inline in `<style>` tags for portability
- No external component libraries (keep it light)
- Mobile-first responsive design
- Semantic HTML5 structure

### JavaScript (Backend)
- Express.js middleware pattern
- Error handling with try/catch
- UTF-8 encoding on all responses
- CORS enabled for cross-origin requests

### JSON Data
- `catalogue.json` is the single source of truth for content
- Update JSON, regenerate pages, commit both
- Keep data structure flat (no deeply nested objects)

## File Naming Conventions

- **HTML files**: kebab-case (e.g., `air-filters.html`)
- **Folders**: lowercase plural (e.g., `industries/`, `products/`)
- **JSON keys**: camelCase (e.g., `categoryTag`, `featureList`)
- **CSS classes**: kebab-case (e.g., `.font-impact`, `.stat-box`)

## Performance Notes

- Pages are static HTML (no JavaScript execution needed)
- CSS is minified inline
- Images are external (CDN hosted at elimfilters.com)
- No npm modules bundled in HTML
- Server serves ~35KB per page gzipped

## Git Workflow

All development happens on feature branches:
- Branch naming: `claude/[feature-description]-[ID]`
- Commit message format: `[type]: Description` (feat, fix, docs, refactor, test)
- Include session URL in commit messages for traceability

See **CLAUDE.md** for detailed workflow.

## Support & Maintenance

### Common Tasks

**Regenerate all pages after content update:**
```bash
python3 generate_pages.py
git add -A
git commit -m "content: Update catalogue pages"
git push origin branch-name
```

**Add new technology:**
1. Add to `catalogue.json` under `technologies`
2. Run generation script
3. Test locally: `http://localhost:3000/technologies/[name].html`

**Fix styling across all pages:**
1. Edit `template-unified.html`
2. Regenerate pages
3. Commit template + regenerated pages

## License

© 2026 ELIMFILTERS. All rights reserved.

## Contact

- **Website**: https://elimfilters.com
- **Support**: Contact form on website
- **Technical Issues**: Report via GitHub issues

---

**Last Updated**: May 2026
**Pages**: 43 (12 industries + 12 products + 12 technologies + 7 main pages)
**Template Version**: 1.0 (Unified responsive design)