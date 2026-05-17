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

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Python 3.8+ (for page generation)

### Installation

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`

## Deployment

Configured for Railway with:
- `railway.toml` — Build and start commands
- `nixpacks.toml` — Environment setup
- `.env` — Database and API credentials

## Git Workflow

All development on feature branches: `claude/[feature-description]-[ID]`

See **CLAUDE.md** for detailed workflow.

---

**Last Updated**: May 2026
**Pages**: 43 (12 industries + 12 products + 12 technologies + 7 main pages)
