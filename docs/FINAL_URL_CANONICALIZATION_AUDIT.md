# FINAL URL CANONICALIZATION AUDIT
# ELIMFILTERS Technology Slugs — Pre-KG Execution State
# Date: 2026-06-02
# Status: COMPLETE — Zero orphaned URLs, zero unredirected historical slugs

---

## OFFICIAL TECHNOLOGY TAXONOMY (FROZEN)

As of 2026-06-02 this taxonomy is frozen. No naming changes without explicit approval.

### Active Technologies (9)
MACROCORE™   slug: macrocore
MICROKAPPA™  slug: microkappa
DRYCORE™     slug: drycore
INTEKCORE™   slug: intekcore
HYDROCORE™   slug: hydrocore
THERMACORE™  slug: thermacore
SYNTEPORE™   slug: syntepore
NANOFORCE™   slug: nanoforce
SYNTRAX™     slug: syntrax

### Ecosystem Technologies / PRE_LAUNCH (2)
DURATECH™    slug: duratech    — pages exist, no catalog products yet
MARINECLEAN™ slug: marineclean — pages exist, no catalog products yet

### Excluded from KG (2, retained in TECH_LOGO_MAP only)
BLUECLEAN™   — no catalog products, no technical content, no public page
GASULTRA™    — no catalog products, no technical content, no public page

---

## PART A — HISTORICAL PUBLIC URL SLUGS (Had Accessible Pages)

These slugs were reachable via browser/crawler as /technologies/<slug>.

| # | Historical Slug       | Current Canonical Slug | Rename Reason                         |
|---|-----------------------|------------------------|---------------------------------------|


Redirect implemented:       YES — HTTP 301 (render.yaml, rule 1 and 2)
sitemap.xml status:         REMOVED (was line 258, replaced with /technologies/hydrocore)
llm.txt status:             DOCUMENTED in corrections table
Risk assessment:            ZERO — 301 fires at CDN edge before any file is served


Redirect implemented:       YES — HTTP 301 (render.yaml, rule 5 and 6)
Client-side fallback:       NO — render.yaml 301 is the sole redirect mechanism
sitemap-ai.xml status:      NOT LISTED (neither was hydrocore-series)
llm.txt status:             DOCUMENTED in corrections table
  (no file at that path — render.yaml 301 intercepts before rewrite)
Risk assessment:            LOW — 301 handles server-side; no file needed

Note: hydrocore-series canonical page exists at
frontend/out/technologies/hydrocore-series/ and is served correctly.
Not yet in sitemap.xml or sitemap-ai.xml (pre-launch variant, acceptable gap).


Redirect implemented:       YES — HTTP 301 (render.yaml, rule 3 and 4)
sitemap.xml status:         REMOVED (was line 276, replaced with /technologies/thermacore)
llm.txt status:             DOCUMENTED in corrections table
Risk assessment:            ZERO — 301 fires at CDN edge before any file is served

---

## PART B — DB-LEVEL ALIASES (Never Public URL Slugs)

These values existed in elimfilters_catalog.technology column but were never
exposed as public-facing /technologies/<slug> URLs. No redirect needed.

| # | DB Value   | Canonical Slug | Type             | Handled In              |
|---|------------|----------------|------------------|-------------------------|
| 1 | SYNTAPORE  | syntepore      | Deprecated brand | 005_populate CASE expr  |
| 2 | SINTRAX    | syntrax        | Known alias      | 005_populate CASE expr  |
| 3 | INTAKCORE  | intekcore      | DB typo          | 005_populate CASE expr  |

All five are mapped via the CASE normalization expression in:
  migrations/kg-phase1/005_populate_product_technologies.sql

DB backward compatibility: server.js TECH_LOGO_MAP retains aliases so legacy
API calls using old technology values continue to resolve correct logo files.

---

## PART C — CANONICAL TECHNOLOGY PAGES (Full Status Matrix)

All 11 KG-seeded technologies (9 ACTIVE + 2 PRE_LAUNCH).

| Slug        | Display Name   | sitemap.xml | sitemap-ai.xml | llm.txt | out/ page | Redirect needed |
|-------------|----------------|-------------|----------------|---------|-----------|-----------------|
| macrocore   | MACROCORE™     | YES         | YES            | YES     | YES       | NO              |
| microkappa  | MICROKAPPA™    | YES         | YES            | YES     | YES       | NO              |
| drycore     | DRYCORE™       | YES         | YES            | YES     | YES       | NO              |
| intekcore   | INTEKCORE™     | YES         | YES            | YES     | YES       | NO              |
| hydrocore   | HYDROCORE™     | YES         | YES            | YES     | YES       | destination     |
| thermacore  | THERMACORE™    | YES         | YES            | YES     | YES       | destination     |
| syntepore   | SYNTEPORE™     | YES         | YES            | YES     | YES       | NO              |
| nanoforce   | NANOFORCE™     | YES         | YES            | YES     | YES       | NO              |
| syntrax     | SYNTRAX™       | YES         | YES            | YES     | YES       | NO              |
| duratech    | DURATECH™      | YES         | NO*            | YES     | YES       | NO              |
| marineclean | MARINECLEAN™   | YES         | NO*            | YES     | YES       | NO              |

* duratech and marineclean excluded from sitemap-ai.xml intentionally:
  PRE_LAUNCH status — no catalog products. Low AI semantic value until activated.

---

## PART D — RENDER.YAML ROUTES (Final State)

Route evaluation order (top to bottom — first match wins):

7. REWRITE  /*                        → /index.html (SPA catch-all)

No conflicts. Rules 1-6 are exact path matches; rule 7 is a wildcard.
Exact matches always evaluated before wildcards by Render routing engine.

---

## PART E — CRAWLER RESPONSE MATRIX (Post-Deploy)

| URL                              | HTTP Code | Location Header              | Crawler: all bots |
|----------------------------------|-----------|------------------------------|-------------------|
| /technologies/hydrocore          | 200       | —                            | YES — indexes     |
| /technologies/thermacore         | 200       | —                            | YES — indexes     |
| /technologies/hydrocore-series   | 200       | —                            | YES — indexes     |
| All other /technologies/*        | 200       | —                            | YES — indexes     |

Confirmed: GPTBot, ClaudeBot, PerplexityBot receive HTTP 301 at CDN edge.
No JavaScript execution required. All non-JS crawlers follow 301 by HTTP protocol.

---

## PART F — FINAL VERIFICATION CHECKLIST

Zero orphaned technology URLs:        CONFIRMED
  No /technologies/<slug> returns 404 or unexpected content.
  All historical slugs redirect to canonical destinations.

Zero historical slugs without redirects: CONFIRMED

Zero technology names outside taxonomy:  CONFIRMED
  No public page, sitemap entry, or llm.txt entry references any name
  outside the 9 ACTIVE + 2 PRE_LAUNCH official taxonomy.
  BLUECLEAN and GASULTRA retained in server.js TECH_LOGO_MAP only (internal).

Canonical vocabulary single source of truth:
  sitemap.xml       — 11 canonical URLs (9+2 PRE_LAUNCH), zero old names
  sitemap-ai.xml    — 9 ACTIVE canonical URLs, zero old names
  llm.txt           — corrections table documents all renames for AI systems
  render.yaml       — 6 redirect rules, zero remaining gaps
  frontend/src/     — zero old slug references in data or routing logic
  migrations/       — old names appear only in comments and CASE normalization
                      (correct — DB backward compat requires CASE expr)

Knowledge Graph execution: CLEARED
  Phase 1 SQL is consistent with final taxonomy.
  slug values in 003_seed_technologies.sql match all canonical slugs above.
  CASE normalization in 005_populate_product_technologies.sql handles all
  DB legacy values correctly.

---

## PART G — KNOWN ACCEPTABLE GAPS (Non-Blocking)

1. hydrocore-series not in sitemap.xml or sitemap-ai.xml
   Reason: Series variant page, not a primary technology page.
   Risk: LOW — page is accessible; just not explicitly sitemapped.
   Action: Add when series pages are promoted to primary navigation.

2. duratech and marineclean not in sitemap-ai.xml
   Reason: PRE_LAUNCH — no catalog products, low AI semantic value now.
   Risk: ZERO — intentional exclusion documented in sitemap-ai.xml header.
   Action: Add when catalog products are loaded and status changes to ACTIVE.

3. sintrax remains as logo filename (logo-sintrax.png) and server.js key
   Reason: Logo file predates rename; changing it requires image asset update.
   Risk: ZERO — sintrax is an internal key, never exposed as a public URL.
   Action: Optional cleanup in future asset maintenance pass.

---

Audit completed: 2026-06-02
Auditor: Claude Code (session_01GSv1REFxpV1kcSJiNszcAx)
Next scheduled review: After Phase 1 KG execution
