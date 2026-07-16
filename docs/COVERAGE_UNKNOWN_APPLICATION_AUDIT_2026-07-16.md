# Coverage Audit — Products Without Confirmed Applications

Date: 2026-07-16

## Finding

The previous coverage audit did not evaluate the full catalogue. Its repository query only selected SKUs with non-empty `vehicle_applications` arrays. Consequently:

- `equipment_applications` were not audited;
- products with no vehicle application were excluded even when equipment applications existed;
- products with neither vehicle nor equipment applications were invisible to the audit;
- hydraulic products without confirmed equipment could be grouped into a generic unknown/review bucket without a precise cause.

## Implemented correction

The audit now reads, without modifying catalogue rows:

1. vehicle application rows;
2. equipment application rows;
3. one explicit `none` row for every SKU with no published application in either source.

The review queue now separates evidence-based reasons:

- `hydraulic_without_published_equipment`;
- `product_without_published_application`;
- `oem_reference_present_without_application`;
- `cross_reference_present_without_application`;
- `equipment_application_unclassified`;
- `missing_make` / `missing_model`;
- `lifecycle_or_oem_restriction_requires_verification`.

## Interpretation boundary

Missing applications do **not** prove that a product is obsolete, discontinued, licensed, restricted, or OEM-only. Those states require an external manufacturer, lifecycle, technical, or contractual source. The audit therefore produces a suggested research disposition rather than inventing a cause.

## Expected result

The report can now quantify:

- hydraulic SKUs without published equipment;
- all other product categories without published applications;
- products that still have OEM codes or competitor references but no applications;
- equipment records that exist but cannot yet be normalized;
- actionable review queues instead of one generic unknown bucket.

## Safety

The coverage query is read-only with respect to `elimfilters_catalog`. No catalogue row is inserted, updated, deleted, or normalized in place.
