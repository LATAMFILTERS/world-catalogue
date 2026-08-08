# ELIMFILTERS Product Image Pipeline Authority v2

Status: ACTIVE / FAIL-CLOSED

The product-image workflow is executable enforcement, not prose guidance.

## Mandatory order

`manufacturer URL -> browser screenshot -> real source image -> live DB SKU/filter type -> technology + official assets -> manifest PASS -> Phase 1 -> explicit approval -> Phase 2 -> explicit approval -> Phase 3 -> explicit approval -> save approved JSON/master`.

No image tool may run before manifest PASS.

## Gates

- `SOURCE_SCREENSHOT_REQUIRED`: persist a real browser screenshot.
- `SOURCE_IMAGE_REQUIRED`: persist exact manufacturer source image bytes.
- `DATABASE_SKU_REQUIRED`: query `world_catalogue.elimfilters_catalog` live with `resolve-competitor-sku.mjs`; exactly one exact match.
- `TECHNOLOGY_ASSET_REQUIRED`: derive technology from catalog result/filter type and resolve exactly one official binary asset from `frontend/public/assets/`.
- `LOGO_ASSET_REQUIRED`: `frontend/public/assets/logo-elimfilters.png` must exist.
- `MANIFEST_PASS_REQUIRED`: manifest must pass schema/file/gate validation.
- `EDIT_ONLY_REQUIRED`: every render is an edit of exact source/approved master.
- `PHASE_APPROVAL_REQUIRED`: explicit user approval before advance.
- `PROTECTED_VIEW_LOCK_REQUIRED`: opposite approved view is immutable during single-view fixes.
- `RESULT_LINEAGE_REQUIRED`: render metadata must prove edit lineage; null/missing edit operation is rejected.

## Phase rules

Phase 1: geometry only. Preserve source silhouette, proportions, seams, rim, baseplate, thread, gasket, inlet holes, construction, perspective, relative scale, crop and composition.

Phase 2: only paint + authorized lithography over approved Phase-1 master. Container `#414141`; lithography `#CBCBCB`; official ELIMFILTERS logo; TOTAL ASSET PROTECTION; exact DB SKU; product descriptor; exact official technology; Powered Filtration; approved installation marks.

Phase 3: only explicitly requested micro-adjustment. Declare target view/property. A whole-composition regeneration for a one-view correction is invalid.

## Failure behavior

Any gate failure sets manifest `FAIL`, disables image generation and returns the exact STOP reason. Never use remembered SKU, remembered technology, another SKU's geometry, synthetic screenshot/source, generated logo/technology mark, or text-to-image fallback.

## Executables

- `product-identity/scripts/capture-manufacturer-screenshot.mjs`
- `product-identity/scripts/fetch-manufacturer-image.mjs`
- `product-identity/scripts/resolve-competitor-sku.mjs`
- `product-identity/scripts/resolve-technology-asset.mjs`
- `product-identity/scripts/build-render-manifest.mjs`
- `product-identity/scripts/validate-render-manifest.mjs`
- `product-identity/scripts/run-image-phase.mjs`
- `product-identity/scripts/validate-render-result.mjs`

Machine contract: `product-identity/pipelines/manufacturer-source-rebrand.v2.json`.
Manifest schema: `product-identity/pipelines/render-manifest.schema.json`.
Legacy `manufacturer-source-rebrand.v1.json` is retired and deleted.
