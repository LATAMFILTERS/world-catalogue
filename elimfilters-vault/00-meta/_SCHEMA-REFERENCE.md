# Schema Reference

All YAML frontmatter fields across all entity types.
Source of truth for field names, types, and sync status.

---

## Universal Fields (all entity types)

| Field | Type | Required | Synced to UD |
|-------|------|----------|-------------|
| `type` | string (enum) | YES | No |
| `status` | string (enum) | YES | No |
| `key` | string | YES | Yes (read-only) |
| `in_unified_data` | boolean | YES | No |
| `tags` | string[] | YES | No |

---

## Technology — Active

| Field | Type | Required | Synced to UD | UD Field |
|-------|------|----------|-------------|---------|
| `tech_status` | `active` | YES | No | — |
| `name` | string | YES | UD→vault | `name` |
| `slug` | string | YES | UD→vault | `slug` |
| `domain` | string | YES | bidirectional | `domain` |
| `logo_file` | string | YES | UD→vault | `logoFile` |
| `category` | string | YES | bidirectional | `category` |
| `tagline` | string | YES | vault→UD | `tagline` |
| `geo_definition` | string | YES | vault→UD | `geoDefinition` |
| `comparison_function` | string | YES | vault→UD | `comparisonFunction` |
| `comparison_metric` | string | YES | vault→UD | `comparisonMetric` |
| `comparison_industries` | string | YES | vault→UD | `comparisonIndustries` |
| `applicable_industries` | wikilink[] | YES (min 1) | bidirectional | `applicableIndustries` |
| `related_standards` | wikilink[] | YES (min 1) | bidirectional | `relatedStandards` |
| `addresses_contamination` | wikilink[] | YES (min 1) | bidirectional | `addressesContamination` |
| `key_metrics` | object | NO | bidirectional | `keyMetrics` |
| `hero_tagline` | string | NO | vault only | — |
| `system_headline` | string | NO | vault only | — |
| `system_paragraphs` | string[] | NO | vault only | — |
| `ud_key` | string | YES | No | — |

## Technology — Deprecated

| Field | Type | Required | Synced to UD | UD Field |
|-------|------|----------|-------------|---------|
| `tech_status` | `deprecated` | YES | No | — |
| `deprecated_date` | string (ISO date) | YES | bidirectional | `deprecatedDate` |
| `replaced_by` | wikilink | YES (exactly 1) | bidirectional | `replacedBy` |
| `replaced_by_name` | string | YES | bidirectional | `replacedByName` |
| `sunset_note` | string | YES | vault→UD | `sunsetNote` |

## Technology — Ecosystem

| Field | Type | Required | Synced to UD | UD Field |
|-------|------|----------|-------------|---------|
| `tech_status` | `ecosystem` | YES | No | — |
| `program_type` | string | YES | vault→UD | `programType` |

---

## Industry

| Field | Type | Required | Synced to UD | UD Field |
|-------|------|----------|-------------|---------|
| `name` | string | YES | bidirectional | `name` |
| `slug` | string | YES | UD→vault | `slug` |
| `contamination_exposure` | ExposureLevel enum | YES | bidirectional | `contaminationExposure` |
| `primary_equipment` | string[] | YES | bidirectional | `primaryEquipment` |
| `operating_conditions` | object | YES | bidirectional | `operatingConditions` |
| `relevant_contamination` | wikilink[] | YES (min 1) | bidirectional | `relevantContamination` |
| `applicable_technologies` | wikilink[] | YES (min 1) | bidirectional | `applicableTechnologies` |
| `applicable_standards` | wikilink[] | YES (min 1) | bidirectional | `applicableStandards` |
| `common_problems` | wikilink[] | NO | vault only | — |
| `typical_product_families` | wikilink[] | NO | vault only | — |
| `catalogue_title` | string | NO | vault only | — |
| `catalogue_subtitle` | string | NO | vault only | — |
| `catalogue_description` | string | NO | vault only | — |
| `features` | string[] | NO | vault only | — |
| `benefits` | string[] | NO | vault only | — |
| `statistic` | string | NO | vault only | — |
| `statistic_source` | string | NO | vault only | — |
| `ud_key` | string | YES | No | — |

---

## System — Product-Line

| Field | Type | Required | Synced to UD | UD Field |
|-------|------|----------|-------------|---------|
| `system_class` | `product-line` | YES | No | — |
| `name` | string | YES | bidirectional | `name` |
| `slug` | string | YES | UD→vault | `slug` |
| `domain` | SystemDomain enum | YES | bidirectional | `domain` |
| `primary_technology` | wikilink | YES (exactly 1) | bidirectional | `primaryTechnology` |
| `supporting_technologies` | wikilink[] | NO | bidirectional | `supportingTechnologies` |
| `related_standards` | wikilink[] | YES (min 1) | vault only | — |
| `related_contamination` | wikilink[] | YES (min 1) | vault only | — |
| `related_components` | wikilink[] | NO | vault only | — |
| `related_problems` | wikilink[] | NO | vault only | — |
| `product_families` | wikilink[] | NO | vault only | — |
| `ud_key` | string | YES | No | — |

## System — Protection Domain

| Field | Type | Required | Synced to UD | UD Field |
|-------|------|----------|-------------|---------|
| `system_class` | `protection-domain` | YES | No | — |
| `protection_number` | string | NO | vault only | — |
| `headline` | string | NO | vault only | — |
| `protection_description` | string | NO | vault only | — |
| `contaminants` | string[] | NO | vault only | — |
| `equipment` | string[] | NO | vault only | — |
| `product_families` | wikilink[] | YES (min 1) | vault only | — |
| `industries_served` | wikilink[] | NO | vault only | — |

---

## Standard

| Field | Type | Required | Synced to UD | UD Field |
|-------|------|----------|-------------|---------|
| `code` | string | YES | UD→vault | `code` |
| `name` | string | YES | bidirectional | `name` |
| `slug` | string | YES | UD→vault | `slug` |
| `body` | string (enum) | YES | vault only | — |
| `specification_type` | string (enum) | YES | vault only | — |
| `criticality` | PRIMARY/SECONDARY | YES | bidirectional | `criticality` |
| `domain` | string[] | NO | vault only | — |
| `applicable_to_technologies` | wikilink[] | YES (min 1) | bidirectional | `applicableTo` |
| `applicable_to_systems` | wikilink[] | NO | vault only | — |
| `applicable_to_industries` | wikilink[] | NO | vault only | — |
| `related_contamination` | wikilink[] | NO | vault only | — |
| `related_standards` | wikilink[] | NO | vault only | — |
| `kb_description` | string | NO | vault only | — |
| `ud_description` | string | NO | UD→vault | `description` |
| `measures` | string | NO | vault only | — |
| `unit` | string | NO | vault only | — |
| `typical_target` | string | NO | vault only | — |
| `ud_key` | string | YES (if in UD) | No | — |

---

## Component

| Field | Type | Required | Synced to UD | Notes |
|-------|------|----------|-------------|-------|
| `component_class` | string (enum) | YES | No | Not in UD |
| `host_equipment` | string[] | NO | No | — |
| `typical_clearance` | string | NO | No | — |
| `failure_modes` | string[] | NO | No | — |
| `failure_threshold` | string | NO | No | — |
| `failure_consequences` | string | NO | No | — |
| `sensitive_to_contamination` | wikilink[] | YES (min 1) | No | — |
| `located_in_systems` | wikilink[] | YES (min 1) | No | — |
| `protected_by_technologies` | wikilink[] | YES (min 1) | No | — |
| `protection_standard` | wikilink | NO | No | — |
| `typical_filter_families` | wikilink[] | NO | No | — |

---

## Problem

| Field | Type | Required | Synced to UD | Notes |
|-------|------|----------|-------------|-------|
| `problem_statement` | string | YES | No | User-language symptom |
| `domain` | string | YES | No | — |
| `root_contamination` | wikilink | YES (exactly 1) | No | Part Search entry |
| `industry_frequency` | wikilink[] | YES (min 1) | No | — |
| `resolved_by_technologies` | wikilink[] | YES (min 1) | No | Matches ContamMode |
| `symptom_indicators` | string[] | NO | No | — |
| `contributing_factors` | string[] | NO | No | — |
| `affects_components` | wikilink[] | NO | No | — |
| `affects_systems` | wikilink[] | NO | No | — |
| `applicable_standards` | wikilink[] | NO | No | — |
| `recommended_product_families` | wikilink[] | NO | No | — |
| `mtbf_reduction` | string | NO | No | Quantified impact |
| `cost_impact` | string | NO | No | — |
| `downtime_impact` | string | NO | No | — |
| `documented_in_case_studies` | wikilink[] | NO | No | — |

---

## ProductFamily

| Field | Type | Required | Synced to UD | Notes |
|-------|------|----------|-------------|-------|
| `label` | string | YES | No | From systems/page.tsx |
| `slug` | string | YES | No | — |
| `description` | string | YES | No | Editorial |
| `uses_technology` | wikilink | YES (exactly 1) | No | — |
| `belongs_to_domain` | wikilink | YES (exactly 1) | No | System key |
| `meets_standards` | wikilink[] | NO | No | — |
| `target_industries` | wikilink[] | NO | No | — |
| `contains_skus` | wikilink[] | NO | No | Curated subset |
| `sku_count_approx` | integer | NO | No | Estimate |
| `performance_rating` | string | NO | No | — |

---

## ExposureLevel values

`EXTREME` · `HIGH` · `MEDIUM-HIGH` · `MEDIUM` · `LOW-MEDIUM` · `LOW`

## SystemDomain values

`Air Intake` · `Fuel Cleanliness` · `Lubrication` · `Hydraulic` · `Compressed Air` · `Cooling System` · `Cabin Protection`

## specification_type values

`test-method` · `cleanliness-code` · `performance-rating` · `design-spec` · `classification`

## component_class values

`engine` · `hydraulic` · `fuel` · `cabin` · `compressed-air` · `coolant` · `lube-oil`
