# R2 → catalogue images

The existing Part Search process on Lenovo owns the reconciliation loop. It starts
after the existing PostgreSQL pool is constructed. No new service, GitHub cron,
Cloudflare Worker, queue, database connection pool or dependency is required.
GitHub's approved-master publisher is unchanged; the reconciler consumes its
existing `products/<SKU>/manifest.json` format and existing legacy product uploads.

## Behaviour

- Run on startup and 60 seconds after each completed pass; retry errors next pass.
- List **all pages** in `elimfilters-renders`, including previously uploaded files.
- Match only existing active catalogue SKUs. Never create a product.
- Select the latest upload per SKU. For an approved manifest require its SKU, status, key and SHA-256
  to agree. Hold malformed manifests instead of falling back to another image.
- Legacy accepted names are `SKU.png|jpg|jpeg|webp` and
  `SKU[-<description>]-approved[-opt].png|jpg|jpeg|webp` (case insensitive).
  Also recognize reviewed, uniquely SKU-prefixed user-upload filenames with a
  literal space before `Microkappa`, `Syntrax`, `(1)` or `(2)` (such as
  `EL31665 Syntrax.png` and `ET92040P (1).png`). Arbitrary suffixes,
  source pictures and non-SKU prefixes remain excluded.
  Pick the latest R2 LastModified per SKU; equal timestamps are held as ambiguous
  unless a single canonical manifest resolves that publication batch. A newer
  direct legacy upload supersedes an older manifest; legacy names must be final,
  upload-approved product images, not work-in-progress references.
  Source/reference/candidate/rejected/superseded directories are excluded.
  Banners, unmatched names, and arbitrary filenames are not product associations.
- Hash actual image bytes and verify matching bytes through the public CDN before
  updating `elimfilters_catalog.image_url`. Use a SHA-versioned public URL so
  replacements of the same key do not retain an older cached image.
- ETag detects replacements within the same LastModified timestamp.
- Preserve every other catalogue field. Record the previous URL in
  `public.catalog_r2_image_history` in the same transaction as the change.
- PostgreSQL advisory lock prevents concurrent reconciler processes. Row locks
  and a comparison with the initial URL prevent overwriting concurrent external edits.
  An external edit after a prior sync is held for review, not silently reversed.
- Never remove images when an R2 listing/object disappears. Never revert to an
  older R2 version. Logs report updated/unchanged/ambiguous/error counts.

## Runtime configuration

The existing Lenovo runtime must have:

```dotenv
ELIM_RUNTIME_NODE=LENOVO
ELIM_RUNTIME_ROLE=PRIMARY
ELIM_DOMAIN=WORLD_CATALOGUE
ELIM_SCHEDULER_ENABLED=true
R2_ACCOUNT_ID=<existing Cloudflare account ID>
R2_IMAGE_SYNC_ACCESS_KEY_ID=<R2 read-only key scoped to elimfilters-renders>
R2_IMAGE_SYNC_SECRET_ACCESS_KEY=<matching secret>
```

Existing `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` are accepted as fallbacks.
Backup-bucket-only credentials are insufficient. No credentials are committed or
logged. `R2_IMAGE_SYNC_ENABLED=false` explicitly disables this loop.
`R2_IMAGE_SYNC_INTERVAL_MS` defaults to 60000 and must be at least 10000.
R2 and CDN calls retain TLS validation and fail after 30 seconds.

Deploy the reviewed commit to the **existing Lenovo checkout**, set these values
in its existing private environment and restart the existing Part Search process.
Cloud/CI/STANDBY nodes cannot start the loop. Missing credentials produce a
`[r2-catalog-sync] BLOCKED` log; they do not imply successful activation.
The database role must be able to create the two operational ledger tables and
update the catalogue image URL. Existing catalogue triggers remain enabled.

## Required production acceptance (not replaced by unit tests)

1. Capture an existing SKU's current image URL and unrelated catalogue fields.
2. Upload a valid named product image or publish its approved manifest in R2.
3. Observe a successful `[r2-catalog-sync]` pass on the actual Lenovo runtime.
4. Query PostgreSQL to verify the new URL/hash/history and unchanged unrelated fields.
5. Load the product through public Part Search and verify the new image bytes.
6. Replace that same R2 key; repeat to verify the versioned URL changes.

Disable `R2_IMAGE_SYNC_ENABLED` before a manual rollback. Restore the previous
URL from the history only if the current URL still equals that history entry's
new URL, so a rollback cannot overwrite a subsequent unrelated edit.

`node --test tests/r2-catalog-image-sync.test.js` exercises pagination, exact SKU
matching, manifest/hash/CDN rejection, retry, transaction behaviour, idempotence,
ETag replacement, age protection and runtime ownership using controlled doubles.
It is **not** evidence of live R2 access, PostgreSQL permissions or deployment.

## November 2026 production reconciliation checkpoint

Cloudflare R2 `elimfilters-renders/fleetguard/page-1/01-20/` currently has
137 product-directory objects. Of those, 135 are traceable to unique
ELIMFILTERS SKU prefixes (including nine reviewed filename suffixes). The
remaining files `P502042.png` and `fleetguard_ET97784.png` require identity
review and must not be auto-associated. The R2-to-Part-Search edge fallback
is a *display* mechanism; it cannot prove a database row was updated.

Persisting images is a separate, Lenovo-only operation. Verify that the
existing Part Search process on the Lenovo has the configured environment
above, R2 bucket-read permission, and write rights to the *actual Part Search*
PostgreSQL database. Deploy the reviewed code to that **existing** process;
never create a second writer. Its startup/poll log must report actual
`[r2-catalog-sync]` outcome (updated / unchanged / ambiguous / errors).
Check the `catalog_r2_image_sync` ledger and the final
`elimfilters_catalog.image_url` for each active mapped SKU, including
`EL83191`, `EL87483` and `EL31665`. Success requires durable URLs
containing the SHA-256 version and verified corresponding public CDN bytes.
If any prerequisites are unavailable, record **BLOCKED** rather than
claiming the database was synchronized.

SEO/GEO/AEO is a **separate acceptance gate**: exact-SKU results currently
declare `<meta name="robots" content="noindex, nofollow">`. Persisting the
image URL does not override that exclusion. Before introducing indexing or
Product structured data, audit canonical public product URLs, template
rendering, approved product claims and the intended indexation policy.
Do not remove `noindex` from general search-result pages simply to make
uploaded images discoverable.
