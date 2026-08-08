---
name: elimfilters-product-image-pipeline
description: Mandatory fail-closed workflow for creating or editing ELIMFILTERS cylindrical product images from real manufacturer source imagery. Preserves exact SKU geometry and forces catalog SKU resolution plus official GitHub artwork assets before any image-generation/editing step.
activation: Trigger whenever a user asks to generate, create, edit, transform, render, rebrand, approve, or automate an ELIMFILTERS filter image, especially when Fleetguard/Donaldson/manufacturer imagery, a competitor part number, a product URL, a screenshot, a SKU, lithography, logo, color, baseplate, thread, gasket, or spin-on geometry is involved.
---

# ELIMFILTERS Product Image Pipeline

This skill is mandatory for ELIMFILTERS product-image work. It is fail-closed. Do not bypass a gate to make progress.

## Non-negotiable rule

NEVER create an ELIMFILTERS product image from text alone when a real source product image is required.

The image operation MUST be an edit/transformation grounded in the real manufacturer product image and the actual official artwork assets. A text-only recreation, simulated screenshot, reconstructed product, inferred baseplate, generated logo, generated technology mark, or guessed SKU is prohibited.

If a required binary/image source is not physically available to the image-editing operation, STOP. Do not generate a substitute.

## Sources of authority

Read these before every render/edit job:

1. `data/product-identity/authorities/cylindrical-print-layout-authority.json`
2. `product-identity/ai-media/image-generation-rules.v1.json`
3. `product-identity/brand-dna/elimfilters-brand.v1.json`
4. Exact SKU production master in `product-identity/production-master/<SKU>.json` when it exists.
5. Exact source-image record in `product-identity/source-images/<SKU>.json` or pilot record when applicable.
6. `product-identity/PIPELINE_PRODUCT_IMAGE_AUTHORITY.md`
7. `product-identity/pipelines/manufacturer-source-rebrand.v1.json`

If these conflict, the central cylindrical authority controls visual artwork; exact manufacturer image controls physical geometry; catalog DB controls SKU/cross-reference.

## Required pipeline — execute in this order

### Gate 1 — Real manufacturer source

Obtain the exact manufacturer product image from the user-provided page or direct manufacturer image URL.

Required:
- real source image, not an AI reconstruction;
- exact competitor/manufacturer code visible or independently verified;
- exact geometry visible;
- for spin-on filters, the baseplate/thread/gasket/hole pattern must be visible in the source set.

A browser screenshot is acceptable as audit evidence, but the clean manufacturer product image is preferred as the geometry source.

Forbidden:
- generating a screenshot;
- creating a visual approximation of the source page;
- using image search as a substitute when the user supplied the exact manufacturer page;
- borrowing geometry from another SKU.

If source cannot be obtained: `STOP_SOURCE_MISSING`.

### Gate 2 — Catalog resolution

Resolve competitor code to ELIMFILTERS SKU from `world_catalogue.elimfilters_catalog` using the repository resolver.

Command pattern:
`node product-identity/scripts/resolve-competitor-sku.mjs --code=<CODE> --brand=<BRAND> --duty=HEAVY_DUTY`

Rules:
- zero exact matches → STOP;
- multiple conflicting matches → STOP;
- no inferred SKU;
- no SKU built from competitor number;
- no hardcoded fallback unless the catalog itself contains that exact resolved relation.

The resolved SKU is the ONLY SKU allowed in the artwork.

### Gate 3 — Physical geometry lock

Treat source manufacturer image pixels/geometry as immutable except surface appearance.

Preserve exactly:
- overall silhouette;
- height/diameter ratio;
- top and bottom seam geometry;
- baseplate geometry;
- thread opening and thread appearance;
- gasket location and geometry;
- hole count, hole shape, angular positions, relative spacing and visible pattern;
- valves and construction details;
- perspective and orientation of each product view;
- relative scale between multiple views.

Do not redraw the baseplate. Do not regenerate the thread. Do not alter hole count.

If the generated/edit output changes any locked mechanical feature: REJECT output; do not present it as a candidate.

### Gate 4 — Load official binary artwork

The following assets must be physically loaded from repository files into the edit operation, not described by text and not recreated:

- Logo: `frontend/public/assets/logo-elimfilters.png`
- Technology artwork: exact approved file in `frontend/public/assets/` for the resolved category/technology.

The official logo must be used as the actual source asset. Typography resembling the logo is NOT acceptable.

If an official asset cannot be loaded/materialized/downloaded: `STOP_ASSET_MISSING`.

### Gate 5 — Artwork authority

Apply only the approved cylindrical artwork:
- container: `ELIMFILTERS DARK CHARCOAL`, digital master `#414141`;
- lithography: `ELIMFILTERS LITHOGRAPHY SILVER`, digital master `#CBCBCB`;
- official ELIMFILTERS logo asset;
- `TOTAL ASSET PROTECTION`;
- exact resolved ELIMFILTERS SKU;
- approved product descriptor;
- technology artwork/name from category;
- `Powered Filtration`;
- approved Installation Rotation Direction Marks;
- same artwork on both sides, adapted proportionally to exact container printable area.

No extra text.

Forbidden unless central authority is revised:
- yellow brand graphics;
- pure white lithography;
- black secondary print;
- QR codes;
- OEM/cross-reference text on can artwork;
- technical spec panels;
- efficiency/performance claims;
- website URLs;
- badges/icons;
- `GERMAN QUALITY`;
- arbitrary arrows or technical characters;
- generated replacement logo;
- generated replacement technology logo.

### Gate 6 — Edit, do not reconstruct

The image model/tool must receive the real manufacturer image as the referenced image target/source.

Instruction semantics:
- preserve source geometry and composition;
- change only can surface color and authorized lithography;
- leave exposed metal, gasket, thread and mechanical parts physically unchanged except unavoidable lighting integration;
- do not create a new product from scratch.

If the tool cannot reference the real source image and official artwork assets in the same job, STOP rather than run text-to-image.

### Gate 7 — Pre-display QC

Before showing a candidate image, verify:
- source was real manufacturer image;
- exact catalog SKU used;
- official logo asset used;
- official technology asset used;
- baseplate matches source;
- thread matches source;
- gasket matches source;
- hole count/pattern matches source;
- proportions match source;
- charcoal and silver system only;
- no unauthorized text or colors;
- SKU is present and readable;
- no hallucinated characters in rotation marks;
- product descriptor and technology are correct.

Any failure = reject internally and regenerate only from the same authoritative inputs. Never rationalize a deviation.

## Human approval gate

During pilot validation, generated image status is always `PENDING_USER_APPROVAL`.

Do not:
- mark it approved automatically;
- advance to next SKU;
- start batch automation;
- treat silence as approval.

Only an explicit user approval closes the SKU.

## Fleetguard pilot rule

For the current Fleetguard Spin-On Lube pilot, items are processed sequentially. Existing approved items remain locked. Unapproved item must be completed and explicitly approved before moving forward.

For LF670 specifically, the manufacturer source geometry includes the real six-hole visible baseplate pattern and its exact central thread/gasket arrangement. Do not substitute another baseplate or infer geometry from specifications.

## Output language

When execution succeeds, show the candidate image with minimal commentary. When a gate fails, state the exact failing gate and stop. Do not fill the gap with a simulated image.
