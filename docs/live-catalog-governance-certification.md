# Live catalogue governance certification (read-only)

This audit is **not a production deployment**. It compares current catalog rows in PostgreSQL to public `GET /api/search?q=<SKU>` output and uses `lib/application-presentation-guard.js` to select evidence-retained or evidence-verified samples.

From repository root on ELIMSERVER, with Node.js dependencies already installed:

```powershell
$env:DATABASE_URL_READONLY = '<existing dedicated PostgreSQL SELECT-only credential>'
$env:CATALOG_PUBLIC_SEARCH_BASE = 'https://part-search.elimfilters.com'
node scripts/seo-geo-audit/verify-live-catalog-governance.cjs
```

Do not put the password in a committed file or terminal transcript. If there is no existing read-only credential, report `BLOCKED` rather than substituting a privileged database account.

The command initiates a `BEGIN TRANSACTION READ ONLY` and explicitly checks `transaction_read_only=on`. It does not modify records. Output: `out/live-catalog-governance.json` (untracked). It samples up to 120 active SKUs per duty, never asserts coverage of all SKUs.

**Interpretation:** `PASS` only when all selected tests and exact code comparisons pass. `FAIL` means contradictory observed data. `BLOCKED` means missing evidence, missing rows, missing public fields, an inaccessible endpoint, or missing credentials. Where the public endpoint does not expose both OEM and competitor arrays, the equivalence classification cannot be certified from that response and is marked `BLOCKED`.

Before changing any server config, inspect whether a read-only role already exists. Do not enable POST endpoints, agent writes, evidence promotion, or deployment based on source-only checks.
