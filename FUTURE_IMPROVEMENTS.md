# Future Improvements — Part Search

This is not a defect log. It records deliberate scope decisions and
tech-debt observations from the Part Search staging validation work, kept
here so they aren't lost rather than because they block anything.

## Share normalization/filtering logic between `/api/search` and `/api/autocomplete`

**Component:** `server.js` — `GET /api/autocomplete`
**Type:** Code duplication / tech debt, not a confirmed functional defect
**Production impact:** None identified — no incorrect suggestion text or data leak observed

### Description

`/api/search` builds its response through `buildFilterData()`, which routes every
OEM/competitor reference through `parseRefs()`. That function normalizes
manufacturer/code strings, repairs UTF-8 mojibake (`fixMojibake()`), and drops
entries whose "manufacturer" is actually an internal field name leaked by bad
scraper data (`THREADSIZE`, `GASKETOD`, `RELATEDPARTS`, `MAINTENANCEKITS`,
`APPLICABLEREGION`, etc. — see the `INVALID` set in `parseRefs()`).

`/api/autocomplete` does not go through this pipeline. It queries
`oem_codes`/`competitor_codes` directly via raw SQL (`UNION ALL` across SKU,
`codigo_base`, OEM, and competitor code prefixes) and labels each match with a
hardcoded `type` string per branch (`SKU`, `BASE CODE`, `OEM`, `CROSS-REF`).

### Observed effect

If a database row has a cross-reference entry whose `code` legitimately matches
the search prefix, but whose `manufacturer` field is one of the internal-only
values `parseRefs()` would filter out (e.g. a row where `RELATEDPARTS` was
scraped into the `manufacturer` position instead of a real code note), the
autocomplete suggestion for that `code` can be labeled with the wrong type
badge (e.g. `OEM` instead of the type it would have carried had it gone
through `parseRefs()`).

**What does not happen:** the internal field name itself is never shown to the
user, and the suggested code text is always correct. This is a cosmetic
metadata-classification quirk in the dropdown's type badge under a specific
edge-case data condition — not a data leak, and not a confirmed
production-impacting defect.

Verified via a seeded test row (`manufacturer: "RELATEDPARTS"`,
`code: "EL82100"`): the autocomplete suggestion for `EL82100` appeared with
`type: "OEM"` instead of its expected `type: "SKU"` classification, while the
suggested text itself remained the correct SKU.

### Recommended future improvement

Share the same normalization/filtering logic between `/api/search` and
`/api/autocomplete` — either have the autocomplete query route candidate rows
through `parseRefs()` before selecting a `type`, or extract the `INVALID` set
check into a shared helper both endpoints call, so the two endpoints cannot
diverge in behavior again.

---

## Verification Record

- **Date verified:** 2026-07-05
- **Current `main` commit:** `4b2cf724e2624f9674f77b117f013f920c8fb73a`
- **Current `staging` commit:** `7d7aacb66023e8787367e5d828adb00e6a4774aa`
- **Search implementation parity:** `git diff origin/main origin/staging -- server.js part-search/index.html part-search/results.html` returns empty — no functional differences remain between the search implementation on `main` and `staging`. The two branches differ only in unrelated commits (`main` has since received unrelated Knowledge System page updates that were never applied to `staging`).

Verification method: a local Postgres instance was provisioned and seeded with
representative test data (including the exact test cases used during PR #121
review: `P552100`, `LF3620`, `23518480`, plus synthetic rows for mojibake
corruption and internal-field-leak scenarios). The actual `server.js` from
each branch was run against it, and driven with real headless Chromium
against `index.html`/`results.html`. This confirms correct behavior in a
staging-equivalent environment, but **does not substitute for validation
against the real Render staging database and network**, which remains
required before any production deployment decision.
