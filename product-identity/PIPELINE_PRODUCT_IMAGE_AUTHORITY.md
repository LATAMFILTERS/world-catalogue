# ELIMFILTERS Product Image Pipeline Authority

Status: ACTIVE

Purpose: enforce source-image editing with immutable SKU geometry and phased approvals. The pipeline is not text-to-image.

## Authority order

1. Exact manufacturer image controls physical geometry.
2. Approved phase master controls geometry/composition of subsequent phases.
3. `world_catalogue.elimfilters_catalog` controls ELIMFILTERS SKU.
4. Cylindrical print authority controls paint and lithography.

Missing/ambiguous inputs stop execution.

## State machine

`SOURCE_LOCKED -> GEOMETRY_APPROVED -> PAINT_LITHO_APPROVED -> FINAL_APPROVED`

### Phase 0 — Source lock

Required: exact manufacturer code, exact manufacturer source image bytes, and sufficient spin-on base/thread/gasket/hole visibility. A browser screenshot may document the source, but synthetic/recreated screenshots or products are invalid.

### Phase 1 — Geometry only

Purpose: preserve and approve physical geometry. No ELIMFILTERS branding is applied here.

The real manufacturer source image must be the referenced edit target. Preserve silhouette, height/diameter ratio, body length, seams, rim, baseplate, thread, gasket, hole count/shape/positions, valves, perspective, orientation, relative scale, crop and composition.

Do not recolor, relabel or rebrand during Phase 1 unless the user explicitly requests a neutral geometry proof; even then it must remain a source-image edit, never reconstruction.

Approval freezes the exact image lineage as `GEOMETRY_APPROVED`.

### Phase 2 — Paint + lithography only

Input MUST be the approved Phase 1 geometry master. Do not regenerate a new product.

Allowed changes only:
- container surface paint;
- authorized lithography.

Paint: `ELIMFILTERS DARK CHARCOAL` `#414141`, semi-matte industrial.

Lithography: `ELIMFILTERS LITHOGRAPHY SILVER` `#CBCBCB`, metallic silver satin.

Required hierarchy:
1. Installation Rotation Direction Marks
2. official ELIMFILTERS logo asset
3. TOTAL ASSET PROTECTION
4. exact DB-resolved ELIMFILTERS SKU
5. product descriptor
6. official technology artwork/name
7. Powered Filtration

Same artwork both sides, proportionally fitted. Mechanical geometry remains immutable.

### Phase 3 — Micro-adjustments only

Only the explicitly requested view/property may change. Declare target view (`VERTICAL_ONLY`, `HORIZONTAL_ONLY`, `BOTH`) and target property before edit. Everything else is immutable. No cumulative unsolicited changes.

## Catalog gate

Resolve exact SKU with:

```bash
node product-identity/scripts/resolve-competitor-sku.mjs --code=<COMPETITOR_CODE> --brand=<BRAND> --duty=HEAVY_DUTY
```

Exactly one catalog-backed match required. No inferred, remembered, or competitor-derived SKU.

## Binary artwork gate

Phase 2+ requires actual binary assets physically loaded into the edit:
- `frontend/public/assets/logo-elimfilters.png`
- exact approved technology asset from `frontend/public/assets/`

Text descriptions do not satisfy this gate.

## Render manifest

Before every image-tool call record:
- phase
- competitor_code
- resolved_sku when Phase 2+
- source_image_id_or_path
- source_image_is_real_manufacturer=true
- geometry_master_id_or_path when Phase 2+
- official_logo_asset_path when Phase 2+
- official_technology_asset_path when Phase 2+
- edit_scope
- immutable_elements
- allowed_changes
- RENDER_INPUTS_VERIFIED=true

Missing required field = STOP.

## Image-tool enforcement

Every valid operation must be an EDIT of a real referenced source/master image. If the operation has no referenced image lineage, behaves as text-to-image/new generation, or reports no edit source, reject it automatically and do not present it as valid output.

## Prohibited output

No QR, OEM/cross-reference text, technical specs, efficiency/service-life claims, websites, badges, decorative icons, secondary print colors, GERMAN QUALITY, arbitrary rotation characters, generated replacement logo, or generated replacement technology artwork.

## Pre-display QC

Compare candidate against immutable source/master: silhouette, proportions, seams, baseplate, thread, gasket, hole pattern, perspective, relative scale and composition. Phase 2+ must also match exact SKU, official assets, charcoal `#414141`, silver `#CBCBCB`, approved hierarchy and no extra text/colors.

Any mismatch means reject internally.

## Pilot approval policy

No automatic approval, no advance on silence, no next SKU before explicit approval, and no batch automation before user authorization.

## Control cases

LF670 geometry is unique to LF670 and must never be reused.

LF3620 must use its own exact Fleetguard source image and geometry. LF670 hole pattern, proportions, crop or reconstructed geometry are prohibited.

## Claude skill

Operational enforcement: `.claude/skills/elimfilters-product-image-pipeline/SKILL.md`
