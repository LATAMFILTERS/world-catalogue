# Agent-readiness baseline (2026-10-28)

Status: **NO-GO for deployment changes**. This is a source audit, not a claim of live readiness.

Run from the repository root:

```bash
node scripts/seo-geo-audit/validate-agent-readiness.mjs
```

The command is read-only and exits nonzero on policy conflicts. It does not query the catalogue database, expose SKU applications, change Cloudflare, or install MCP services.

## Observed blockers

- Both `frontend/public/robots.txt` and `frontend/src/app/robots.ts` define the same URL with different policies. Verify the actual build/output and choose one authoritative source after review.
- The dynamic robots policy mixes a broad `/api/` disallow with an `/api/citation/` allow; crawler-specific interpretation needs verification.
- Published HTTP responses for discovery files, cache headers, hreflang, and Cloudflare bot rules have **not** been verified in this change.
- Any product-facing agent API must reuse the existing evidence/presentation guard. Historical applications lacking current evidence must not be emitted as verified fitments.

## Acceptance requirements for follow-on change

1. Confirm the authoritative generated `robots.txt` in `frontend/out/` and the deployed `/robots.txt`.
2. Reconcile policies without disabling existing admin, coverage, or non-indexable route protections.
3. Confirm HTTP 200 and valid content for `/llms.txt`, `/sitemap.xml`, `/sitemap-ai.xml`, and the citation index; verify sitemap routes against generated content, including ES/EN/PT.
4. Confirm that machine-readable product data respects evidence governance; reject test data and missing verification.
5. Run existing build/postbuild checks and a separate public-deployment verification before setting PASS.
6. Do not enable autonomous purchasing, publishing, or write-enabled MCP as part of discovery work.

This document intentionally records outstanding work, not completion.
