# AEO agent delivery rollout — production gate (2026-10-29)

Scope: `elimfilters.com` homepage and public technical pages only. No product reference, governance, database, agent API, MCP, OAuth, or commerce changes.

## A. Render static-site header (manual configuration, pending)

Target Render service: `elimfilters-frontend` (`srv-d86ik4rbc2fs73b1ipeg`), workspace `elimfilters`.

Render Dashboard → Static Site → Settings → Headers → Add header:

- **Path:** `/`
- **Name:** `Link`
- **Value:** `</llms.txt>; rel="alternate"; type="text/plain", </sitemap-index.xml>; rel="sitemap"; type="application/xml"`

Note: these links are real public discovery documents; the markup asserts no API or authenticated services. Check that Render accepts the header and that Cloudflare forwards it on the canonical public domain. If a relation is not recognized by the selected checker, do not invent a different service to gain points. Avoid setting `Link` on all page routes until effects on caching and redirects are assessed.

This repo's `render.yaml` currently declares only the separate `elimfilters-search-pro` web bridge. **Do not replace it with a static-site blueprint** to configure headers: that would risk modifying unrelated infrastructure.

## B. Cloudflare Markdown for Agents (zone-level switch, pending)

Cloudflare Dashboard → `elimfilters.com` zone → AI Crawl Control → Markdown for Agents. Enable only when the zone's plan supports the feature (Cloudflare documentation specifies Pro/Business/Enterprise). Prefer validating with a few non-sensitive public pages before broad enablement; do not alter crawlers' rules or disclose blocked product records.

Verify:

```powershell
$r = Invoke-WebRequest 'https://elimfilters.com/' -Headers @{ Accept='text/markdown'; 'Cache-Control'='no-cache' } -UseBasicParsing
$r.StatusCode
$r.Headers['Content-Type']
```

Expected: HTTP 200, `Content-Type: text/markdown`. Verify regular `Accept: text/html` continues to receive `text/html`. Test a product page and knowledge page; inspect content quality, including JSON-LD carried as Markdown. If HTML persists, **BLOCKED**: do not claim feature enabled.

## C. Independent production verification

```powershell
node scripts/seo-geo-audit/audit-agent-discovery-delivery.mjs
```

Accept only true observed values for `checks.linkDiscovery` and `checks.markdownDelivery`. The script intentionally treats optional checks as advisory so existing production gates remain independent.

Then rerun Cloudflare Agent-Ready scan for `https://elimfilters.com/` and compare each scored axis with the 2026-10-29 baseline: Discoverability 2/4, Content 0/1, Bot Access 1/2, API/Auth/MCP/Skills 0/8. Scores may differ and do not measure referral conversions.

## NO-GO controls

The 227 catalog references remain BLOCKED in their independent review. No database or SKU technical evidence changes. Do not publish fictitious MCP / OAuth / API manifests or certify higher AI search ranking from these interface checks.
