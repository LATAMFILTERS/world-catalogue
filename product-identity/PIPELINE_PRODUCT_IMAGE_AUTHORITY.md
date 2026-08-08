# ELIMFILTERS Product Image Pipeline Authority

Status: ACTIVE

Purpose: Define the mandatory execution sequence for transforming a real manufacturer product image into an ELIMFILTERS product image without changing physical SKU geometry or inventing brand/data elements.

## Principle

The pipeline is not text-to-image. It is source-image transformation.

Every output must be grounded in three independent authorities:

1. Physical geometry: exact manufacturer product image for the exact competitor/reference code.
2. Product identity: `world_catalogue.elimfilters_catalog` exact cross-reference/SKU result.
3. Brand artwork: repository authority and actual official binary assets.

If any authority is missing, ambiguous, inaccessible or conflicting, the job stops.

## Mandatory sequence

### 1. Capture exact manufacturer source

Input is the exact manufacturer product page supplied for the target code.

Required artifacts:
- manufacturer product-page URL;
- clean direct product image URL or downloaded original image;
- audit screenshot of the real page when useful;
- manufacturer code.

The direct product image is the preferred geometry donor. A generated/recreated screenshot is invalid evidence.

### 2. Validate mechanical visibility

For spin-on filters, confirm that the source image set provides sufficient evidence for:
- body silhouette and proportions;
- top/bottom seams;
- baseplate;
- central thread;
- gasket;
- inlet-hole count and arrangement.

If baseplate/thread cannot be verified, status = `STOP_GEOMETRY_INCOMPLETE`.

### 3. Resolve ELIMFILTERS SKU from database

Use:

```bash
node product-identity/scripts/resolve-competitor-sku.mjs --code=<COMPETITOR_CODE> --brand=<BRAND> --duty=HEAVY_DUTY
```

Accepted result: exactly one catalog-backed match.

Rejected:
- zero matches;
- ambiguous matches;
- inferred SKU;
- competitor-code-derived SKU;
- remembered/hardcoded substitution.

### 4. Load authorities

Mandatory reads:
- `data/product-identity/authorities/cylindrical-print-layout-authority.json`
- `product-identity/ai-media/image-generation-rules.v1.json`
- `product-identity/brand-dna/elimfilters-brand.v1.json`
- exact `product-identity/production-master/<SKU>.json` when present.

### 5. Load actual brand assets

Mandatory binary source:
- `frontend/public/assets/logo-elimfilters.png`

Mandatory technology source:
- exact approved technology asset from `frontend/public/assets/`.

Do not describe these assets to an image model as a substitute for loading them. Do not recreate them typographically.

### 6. Lock geometry

Before the edit, record geometry invariants from source.

For spin-on:
- hole count;
- hole shape and positions;
- thread aperture size/appearance;
- gasket geometry;
- baseplate ring structure;
- body height/diameter ratio;
- perspective/orientation;
- seam positions.

The image edit may alter only surface color and authorized print artwork. Exposed mechanical components remain unchanged.

### 7. Apply approved ELIMFILTERS surface system

Container:
- `ELIMFILTERS DARK CHARCOAL`
- `#414141`
- semi-matte industrial appearance.

Lithography:
- `ELIMFILTERS LITHOGRAPHY SILVER`
- `#CBCBCB`
- metallic silver satin appearance.

Authorized hierarchy:
1. Installation Rotation Direction Marks
2. official ELIMFILTERS logo
3. TOTAL ASSET PROTECTION
4. exact ELIMFILTERS SKU
5. product descriptor
6. approved technology artwork/name
7. Powered Filtration

Same artwork both sides, proportionally fitted to exact printable area.

### 8. Prohibited additions

Do not add:
- QR;
- OEM/cross-reference text;
- technical specifications;
- efficiency claims;
- websites;
- badges;
- decorative icons;
- secondary colors;
- yellow/black marketing panels;
- GERMAN QUALITY;
- arbitrary characters around rotation marks;
- any text not in the central authority.

### 9. Image-tool requirement

The generation/edit operation must reference the real source manufacturer image.

It must not be run as text-to-image reconstruction.

If the tool cannot consume the real source image and required actual artwork assets, status = `STOP_TOOL_INPUTS_INCOMPLETE`.

No placeholder or simulation is permitted.

### 10. QC before user display

Required checks:
- exact resolved SKU printed;
- logo came from official binary asset;
- technology came from approved asset;
- source geometry retained;
- baseplate retained;
- thread retained;
- gasket retained;
- hole pattern retained;
- only approved charcoal/silver visual system;
- no extra text;
- rotation marks valid;
- no generated/recreated brand mark.

Failure means reject the candidate. Do not present a known-invalid image for approval.

## Pilot approval policy

Until the user explicitly approves an image:
- status remains `PENDING_USER_APPROVAL`;
- no next SKU;
- no batch run;
- no automation activation.

Explicit approval is required per pilot image.

## Current LF670 control case

Manufacturer code: `LF670`.

The real Fleetguard image is the geometry source. The visible baseplate has six inlet holes around the central threaded opening and the manufacturer gasket arrangement. That geometry is locked.

ELIMFILTERS SKU must be resolved at runtime from catalog data and then used exactly. No manually invented SKU form is allowed.

## Relationship to Claude skill

The enforcement instructions for Claude Code are in:

`.claude/skills/elimfilters-product-image-pipeline/SKILL.md`

That skill is the operational entry point. This document is the repository procedure and audit reference.
