# ELIMFILTERS Bot Protocol — Catalog Intelligence Matrix

## Protected scope

The central protocol, diagnostic sequence, memory, security middleware, channel formatting and guardrails are protected. This implementation changes only the catalog-resolution layer.

## Resolution matrix

| Case | Required input | Internal lookup | Groq web research | Final decision |
|---|---|---|---|---|
| ELIMFILTERS SKU supplied | SKU or base code | Exact normalized match in `sku` / `codigo_base` | No | Return only exact catalog rows |
| OEM code supplied | OEM code | Exact normalized match in `oem_codes` | No | Return only exact catalog rows |
| Competitor code supplied | External code | Exact normalized match in `competitor_codes` / `brand_crossrefs` | No | Return only exact catalog rows |
| Equipment application present internally | Manufacturer, model, engine, year when available | Ranked application match in `equipment_applications` | No | Return validated internal rows |
| Equipment application absent internally | Manufacturer, model, engine, year when available | No confirmed result | Yes: official manuals, OEM catalogs and technical sources | Extract OEM code(s), then re-query PostgreSQL |
| Groq finds OEM and PostgreSQL finds SKU | Equipment identity + sourced OEM | Exact OEM-to-SKU match | Completed | Return ELIMFILTERS SKU with traceability |
| Groq finds OEM but PostgreSQL has no SKU | Equipment identity + sourced OEM | No match | Completed | Return no recommendation; record catalog gap |
| Multiple OEM variants by year/configuration | Incomplete year, engine, VIN or serial context | Ambiguous | Optional research | Ask for the missing discriminator; do not guess |
| Multiple filter positions | Complete equipment identity | Match by filter type and position | Optional research | Return all validated filters grouped by function |
| Low-confidence or unsupported source | Any | No decisive match | Research result rejected | Do not recommend a SKU |

## Source hierarchy

1. Equipment or engine manufacturer documentation.
2. Official OEM parts catalogs.
3. Official technical manuals and service documentation.
4. Reputable technical catalog sources when official sources are unavailable.
5. Retail listings, forums and unsourced snippets are not sufficient for final validation.

## Mandatory validation gates

| Gate | Rule |
|---|---|
| Equipment identity | Manufacturer and model must be present before external research |
| Engine identity | Required when the equipment has multiple engine options |
| Year | Used when available; conflicting year ranges block automatic recommendation |
| OEM normalization | Remove spaces, hyphens and punctuation; compare uppercase alphanumeric form |
| Internal confirmation | The ELIMFILTERS SKU must exist in `elimfilters_catalog` |
| Evidence | Preserve source URLs and the OEM code used for the internal match |
| Confidence | Only high-confidence, application-consistent OEM results may trigger a SKU match |
| No fabrication | No SKU may be generated or inferred outside PostgreSQL |

## Output contract

The catalog layer returns:

- `products`: validated ELIMFILTERS rows only.
- `research`: whether external research was used, equipment identity, OEM candidates, sources and rejection reason.
- `match_type`: `internal_application`, `exact_reference`, or `external_oem_to_internal_sku`.
- `validated`: true only when PostgreSQL confirms the ELIMFILTERS product.

The protocol remains responsible for conversation state and presentation.