# ELIMFILTERS Product Image Pipeline Authority v2.6

Status: ACTIVE / FAIL-CLOSED

The product-image workflow is executable enforcement, not prose guidance.

## Mandatory order

`official manufacturer category/product page -> current SKU product page -> automated verified official source image acquisition -> fresh-source hash/evidence -> geometry signature -> live DB SKU/filter type -> technology + official assets -> manifest PASS -> Phase 1 -> explicit approval -> Phase 2 -> explicit approval -> Phase 3 -> explicit approval -> save approved JSON/master -> store approved render`.

No image tool may run before manifest PASS.

## Source authority

The primary geometry authority is the exact current official manufacturer product image resolved automatically from the current official product page.

A manual user screenshot is **not required**. The acquisition script creates an automated full-page screenshot for audit evidence, but the screenshot is not a blocking manual step.

For every render attempt:
- open the current official product page;
- verify the page contains the current part number;
- resolve/download the official current product image;
- persist image bytes and SHA-256 evidence;
- create an automated audit screenshot;
- prohibit cache, prior render, or another SKU as geometry source.

Executable source acquisition: `product-identity/scripts/acquire-manufacturer-source.mjs`.

## Gates

- `OFFICIAL_PRODUCT_PAGE_REQUIRED`: official manufacturer host and current part number must match.
- `OFFICIAL_SOURCE_IMAGE_REQUIRED`: exact current manufacturer product image must be downloaded and persisted.
- `FRESH_SOURCE_REQUIRED`: cache and previous masters/renders are forbidden as geometry source.
- `SOURCE_HASH_REQUIRED`: SHA-256 of current official source must be recorded.
- `GEOMETRY_SIGNATURE_REQUIRED`: current source geometry must be recorded before render.
- `DATABASE_SKU_REQUIRED`: query `world_catalogue.elimfilters_catalog` live with `resolve-competitor-sku.mjs`; exactly one exact match.
- `TECHNOLOGY_ASSET_REQUIRED`: derive technology from catalog result/filter type and resolve exactly one official binary asset from `frontend/public/assets/`.
- `LOGO_ASSET_REQUIRED`: `frontend/public/assets/logo-elimfilters.png` must exist.
- `MANIFEST_PASS_REQUIRED`: manifest must pass validation.
- `PHASE_APPROVAL_REQUIRED`: explicit user approval before advance.
- `PROTECTED_VIEW_LOCK_REQUIRED`: opposite approved view is immutable during single-view fixes.
- `RESULT_LINEAGE_REQUIRED`: lineage is application-verified using source evidence/hash/binding, DB result, resolved assets, output gen ID and post-render geometry/artwork checks. `edit_op:null` alone is not a rejection.

## Phase rules

Phase 1: geometry only. Preserve source silhouette, proportions, seams, rim, baseplate/open end, thread, gasket, inlet-hole/support pattern, central support/perforation pattern, perspective, relative scale, crop and composition.

Phase 2: only paint + authorized lithography over approved Phase-1 master. Container `#414141`; lithography `#CBCBCB`; official ELIMFILTERS logo; TOTAL ASSET PROTECTION; exact DB SKU; product descriptor; exact official technology; Powered Filtration; approved installation marks.

Phase 3: only explicitly requested micro-adjustment. Declare target view/property. A whole-composition regeneration for a one-view correction is invalid.

## Failure behavior

Any gate failure sets manifest `FAIL`, disables image generation and returns the exact STOP reason. Never use remembered SKU, remembered technology, another SKU's geometry, cached source, previous render geometry, generated logo/technology mark, or text-to-image fallback.

## Executables

- `product-identity/scripts/acquire-manufacturer-source.mjs`
- `product-identity/scripts/resolve-competitor-sku.mjs`
- `product-identity/scripts/resolve-technology-asset.mjs`
- `product-identity/scripts/build-render-manifest.mjs`
- `product-identity/scripts/preflight-product-image.mjs`
- `product-identity/scripts/validate-render-manifest.mjs`
- `product-identity/scripts/run-image-phase.mjs`
- `product-identity/scripts/validate-render-result.mjs`

Machine contract: `product-identity/pipelines/manufacturer-source-rebrand.v2.json`.
Hard gates: `product-identity/pipelines/render-hard-gates.v1.json`.
Legacy manual screenshot flow is retired for normal automated production; manual source evidence remains an emergency fallback only.
