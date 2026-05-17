# CLAUDE.md — Development Guide for ELIMFILTERS World Catalogue

## Project Context

**ELIMFILTERS World Catalogue** is a 43-page professional filtration documentation platform:
- 12 industry verticals (Agriculture, Mining, Marine, etc.)
- 12 product systems (Air, Fuel, Hydraulic, Cabin, etc.)
- 12 core technologies (SYNTRAX™, AQUAGUARD™, NANOFORCE™, etc.)
- 7 main pages (home, about, contact, warranty, dealer, etc.)

All pages use a **unified responsive HTML template** with dark theme and yellow accents (#FFF12D).

## Development Branch

**Always develop on**: `claude/create-elimfilters-manuals-iFz1q`

This is your persistent feature branch. All work commits to this branch.

## How Content Works

### Content is in `catalogue.json`

All page content (titles, descriptions, features, stats) lives in **catalogue.json**, not in HTML files.

### Pages are Generated

1. Update `catalogue.json` with new content
2. Run `python3 generate_pages.py`
3. Script regenerates all 43 HTML files from the template
4. Commit both the JSON and regenerated HTML

**Never edit HTML files directly** — changes will be lost on regeneration.

## Making Changes

### Edit Page Content

```bash
# 1. Edit catalogue.json
vim catalogue.json

# 2. Regenerate pages
python3 generate_pages.py

# 3. Test locally
npm start
# Visit http://localhost:3000

# 4. Commit
git add -A
git commit -m "content: Update [industry/product/technology] descriptions"
git push -u origin claude/create-elimfilters-manuals-iFz1q
```

### Edit Page Design/Layout

```bash
# 1. Edit template-unified.html
vim template-unified.html

# 2. Regenerate pages
python3 generate_pages.py

# 3. Test all pages look correct
npm start

# 4. Commit
git add template-unified.html
git add industries/ products/ technologies/
git commit -m "design: Update page layout/styling"
git push -u origin claude/create-elimfilters-manuals-iFz1q
```

### Add New Industry/Product/Technology

```bash
# 1. Add to catalogue.json
# Example for new industry:
{
  "name": "Rail Transit",
  "file": "rail-transit.html",
  "title": "RAIL TRANSIT PROTECTION",
  "subtitle": "HIGH-CAPACITY OPERATIONS",
  "description": "...",
  "features": ["...", "..."],
  "stats": {"percentages": ["99.9%", "100%"]},
  "cta": "FIND MY FILTER"
}

# 2. Regenerate
python3 generate_pages.py

# 3. Test
npm start

# 4. Commit
git add catalogue.json industries/rail-transit.html
git commit -m "feat: Add Rail Transit industry page"
git push -u origin claude/create-elimfilters-manuals-iFz1q
```

## Page Structure (Fixed)

All pages follow this exact structure:

```
1. HERO SECTION
   - Category tag (// INDUSTRY_ENGINEERING)
   - Main title (MAXIMIZING AVAILABILITY)
   - Yellow subtitle (DURING CRITICAL HARVEST)
   - Tagline (italicized description)
   - "Explore Features" button

2. KEY ADVANTAGES
   - h2 heading
   - Bulleted feature list (4-6 items with ✓ checkmarks)

3. ENGINEERING EXCELLENCE
   - Two-column grid: text + card
   - Left: h2 + paragraph
   - Right: "System Specifications" card

4. PERFORMANCE METRICS
   - h2 centered
   - 3-column grid of stat boxes
   - Each: large number + label

5. RECOMMENDED APPLICATIONS
   - Two-column grid: text + card
   - Left: "Primary Use Cases" list
   - Right: "Technologies Included" (tags)

6. CALL-TO-ACTION (yellow bg)
   - h2 "Ready to Upgrade?"
   - Paragraph
   - "Find My Filter" button → part-search.elimfilters.com

7. FOOTER
   - Copyright + category info
```

**Do not deviate from this structure** — all 43 pages must be identical except for content.

## Code Conventions

### JSON (catalogue.json)
```json
{
  "name": "Page Name",
  "file": "page-name.html",
  "title": "MAIN TITLE IN CAPS",
  "subtitle": "SECONDARY TITLE IN CAPS OR EMPTY STRING",
  "description": "Regular sentence case. Keep under 250 characters.",
  "features": ["Feature One", "Feature Two", "Feature Three"],
  "stats": {
    "percentages": ["99.9%", "100%", "0%"]
  },
  "cta": "BUTTON TEXT"
}
```

### HTML (template-unified.html)
- CSS is **inline in `<style>` tags** (no external stylesheets)
- Use CSS variables: `--volt` (#FFF12D), `--bg` (#000), `--border`
- Responsive: `clamp()` for fluid typography
- Mobile-first: breakpoint at 1024px
- No JavaScript (static pages)

### Styling
- Dark background: #000
- Yellow accent: #FFF12D
- Text color: #fff (white) / #aaa (muted)
- Borders: rgba(255,255,255,0.08)
- No shadows or animations (keep performance up)

## Commit Message Format

```
[type]: Brief description

[type] can be:
- feat:     New page, feature, or functionality
- fix:      Bug fixes
- content:  Content updates (text, descriptions)
- design:   Styling, layout, visual changes
- docs:     Documentation (README, CLAUDE.md)
- refactor: Code reorganization
```

**Example commits:**
```
feat: Add Rail Transit industry page
content: Update Agriculture feature descriptions
design: Adjust stat box spacing for mobile
docs: Add section to CLAUDE.md
```

**Always end with**:
```
https://claude.ai/code/session_01GSv1REFxpV1kcSJiNszcAx
```

## Git Workflow

### Starting work:
```bash
git checkout claude/create-elimfilters-manuals-iFz1q
git pull origin claude/create-elimfilters-manuals-iFz1q
```

### Making changes:
```bash
# Edit files
vim catalogue.json
python3 generate_pages.py
npm start  # test locally

# Stage changes
git add -A

# Commit with proper message
git commit -m "content: Update page descriptions"
git push -u origin claude/create-elimfilters-manuals-iFz1q
```

### Never:
- ❌ Commit directly to `main` or `master`
- ❌ Force push (`git push --force`)
- ❌ Edit HTML files directly (regenerate instead)
- ❌ Create random branches outside `claude/create-elimfilters-manuals-iFz1q`
- ❌ Add new npm packages without approval

## Local Testing

```bash
# Start server
npm start

# Test pages
http://localhost:3000/industries/agriculture.html
http://localhost:3000/products/airfilter.html
http://localhost:3000/technologies/syntrax.html

# Check responsiveness
- Desktop: Full page width
- Tablet: Reduce browser width to 768px
- Mobile: Reduce to 375px
```

## Troubleshooting

**Pages look broken after regeneration:**
- Check `catalogue.json` syntax (missing commas, quotes)
- Run `python3 generate_pages.py` again
- Verify `template-unified.html` hasn't been corrupted

**Content not updating:**
- Edit `catalogue.json` (not HTML)
- Run regeneration script
- Check file was overwritten: `ls -la industries/agriculture.html`

**Styling changes not showing:**
- Edit `template-unified.html` (CSS in `<style>` tag)
- Regenerate all pages
- Hard refresh browser: Ctrl+Shift+R

**Server won't start:**
```bash
npm install
npm start
```

## What's Next

After content is locked:
1. Configure server routes to serve pages correctly
2. Set up proper 404 handling
3. Add SEO meta tags (Open Graph, schema.org)
4. Deploy to Railway
5. Monitor performance and uptime

---

**Questions?** Check README.md for project overview or review existing pages in `/industries`, `/products`, `/technologies`.
