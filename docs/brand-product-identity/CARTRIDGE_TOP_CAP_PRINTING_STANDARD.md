# ELIMFILTERS® Cartridge Filters — Top Cap Printing Standard

**Standard ID:** ELIM-CARTRIDGE-TOP-CAP-PRINT-001  
**Status:** APPROVED  
**Revision:** 1.0  
**Effective date:** 2026-09-04  
**Owner:** ELIMFILTERS® / Kleo Technology LLC  

## 1. Purpose

This document controls the visual and manufacturing standard for ELIMFILTERS® cartridge-filter identification when information is printed on the circular end cap rather than on the filter media.

It applies to conventional cartridge filters with a printable top cap and to cylindrical cartridges with equivalent end caps on both sides.

The filter media must remain unprinted. Adhesive labels or rectangular sleeves on the media are not part of this standard.

## 2. Master artwork source

All official marks must be taken from the controlled master-asset repository:

`frontend/public/assets/`

Mandatory assets include:

- ELIMFILTERS® master logo: `frontend/public/assets/Logotipo Elimfilters® con eslogan corporativo.png`
- HYDROCORE™: `frontend/public/assets/HYDROCORE_final.avif`
- SYNTAPORE™: `frontend/public/assets/SYNTAPORE_final.avif`

Logos must not be recreated, retyped, stretched, approximated, or redrawn.

## 3. Approved top-cap geometry

The approved cartridge design uses a **radial/circular composition** around the center hole.

The visual composition follows the actual circular geometry of the cap. The ELIMFILTERS® identity, SKU, product type, and technology identity must be arranged within the usable annular print area and remain clear of both the center opening and the external cap edge.

For the approved cylindrical cartridge design, the ELIMFILTERS® logo follows the upper arc of the cap. It is not presented as a straight rectangular lockup across the face.

The technology identity follows the lower arc or the approved radial position defined by the Golden Sample. SKU and product type occupy the remaining lateral/radial zones without crossing the protected center-hole area.

## 4. Cylindrical cartridges — both ends printed

When a cartridge has equivalent cylindrical end caps and no separate lower information area, the same approved circular artwork is repeated on both ends.

The two printed ends must be visually identical. A 180° rotation is permitted only when required by the assembly process and does not alter the artwork hierarchy.

No additional rear-specific layout is required for this configuration.

## 5. SKU and application rules

The SKU prefix must correspond to the actual product application. Technology identity alone does not determine the SKU prefix.

### Fuel filtration

- `EF5` through `EF9` = **Fuel Filter**
- Approved fuel-filter technology in this cartridge standard: **SYNTAPORE™**, unless another released product specification states otherwise.

### Fuel / water separation

- `ES5` through `ES9` = **Fuel / Water Separator**
- `ES9` specifically = **Fuel / Water Separator** using **HYDROCORE™** when specified for that product.

### Hydraulic filtration using HYDROCORE™

- `EH6` = **Hydraulic Filter** using **HYDROCORE™**.

Therefore, HYDROCORE™ has two explicitly approved cartridge applications under this release:

| SKU prefix | Printed product type | Technology |
|---|---|---|
| `ES9` | Fuel / Water Separator | HYDROCORE™ |
| `EH6` | Hydraulic Filter | HYDROCORE™ |

The printed Product Type and the SKU prefix must always agree with the actual engineering application.

## 6. Required printed information

Each printed cap must contain, as space permits within the approved circular grid:

1. ELIMFILTERS® master identity.
2. `TOTAL ASSETS PROTECTION`.
3. SKU / part number.
4. Product Type.
5. Approved technology identity.

The order and arc placement must follow the released master layout or SKU-specific artwork derived from it.

## 7. Print color

**Internal ink code:** `EF-INK-002`  
**Name:** ELIMFILTERS Neutral Grey  
**Pantone communication reference:** Pantone Cool Gray 11 C

Pantone is a production communication reference. Final production acceptance must be made against the approved physical print sample / Golden Sample and the released supplier ink specification.

## 8. Manufacturing controls

- The filter media remains natural and unprinted.
- No adhesive label is applied to the media under this standard.
- Printing is limited to the defined circular end-cap print surface.
- Maintain clear space from the center opening and outside edge.
- Preserve cap-hole proportion and actual product geometry; artwork must adapt to the real dimensions rather than forcing the product to match a generic mockup.
- Printing method may be pad printing, silk screen, or another factory-qualified process compatible with the cap material and service environment.
- Ink must meet the released adhesion, abrasion, cure, chemical-resistance, and legibility requirements for the product application.
- Mass production is not released until a physical Golden Sample has been approved.

## 9. Dimensional release data required per SKU

The factory release sheet for each SKU must record at minimum:

- Overall cartridge height (H)
- Outside diameter (OD)
- Top cap diameter (TCD)
- Bottom cap diameter (BCD)
- Center hole diameter (CHD)
- Usable annular print-area outer diameter
- Usable annular print-area inner diameter
- Printed-art orientation
- Exact SKU
- Product Type
- Technology
- Print process
- Ink manufacturer and ink code
- Cure conditions
- Golden Sample ID
- Revision and approval date

No fixed millimeter values are established in this brand standard; dimensions must come from the actual released engineering drawing for each cartridge.

## 10. HYDROCORE™ decision rule

For HYDROCORE™ cartridge products, production and artwork teams must use the following decision logic before artwork release:

```text
IF SKU begins with ES9
    Product Type = FUEL / WATER SEPARATOR
    Technology = HYDROCORE™
ELSE IF SKU begins with EH6
    Product Type = HYDRAULIC FILTER
    Technology = HYDROCORE™
ELSE
    Do not infer HYDROCORE™ application from appearance alone.
    Verify the released product specification before artwork approval.
```

This rule prevents a HYDROCORE™ mark from causing the wrong application description or SKU family to be printed.

## 11. Controlled source

The machine-readable companion standard is stored at:

`frontend/src/data/cartridge-printing-standards.json`

That file is the implementation reference for internal systems that need the approved SKU/application/technology mapping.

## 12. Revision record

| Revision | Date | Change | Status |
|---|---|---|---|
| 1.0 | 2026-09-04 | Initial controlled release. Includes circular cap artwork, two-end cylindrical rule, EF5–EF9 / ES5–ES9 family logic, and explicit HYDROCORE™ rules for ES9 and EH6. | APPROVED |
