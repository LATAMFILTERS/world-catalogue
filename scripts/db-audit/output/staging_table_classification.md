# Fase 4 — clasificación de tablas de staging/auditoría/cuarentena

Generado: 2026-08-12T16:12:32.561Z

Resumen: {"KEEP":9,"ACTIVE":32,"ARCHIVE_CANDIDATE":26}

| Tabla | Categoría | Filas~ | Tamaño | Nunca analizada (ANALYZE) | Consumidor vivo | Refs en migraciones | Export verificado |
|---|---|---|---|---|---|---|---|
| elimfilters_catalog | **KEEP** | 12182 | 138 MB | no | sí | 102 | no |
| ld_vehicle_applications | **KEEP** | 275642 | 94 MB | no | no | 0 | no |
| crossref_resolved_cache | **KEEP** | 745616 | 90 MB | no | sí | 6 | no |
| ld_competitor_cross_references | **KEEP** | 63528 | 12 MB | no | no | 0 | no |
| mann_oem_clean | **KEEP** | 44192 | 11 MB | no | no | 0 | no |
| ld_oem_cross_references | **KEEP** | 5843 | 1272 kB | no | no | 0 | no |
| ld_product_catalog | **KEEP** | 6306 | 896 kB | no | no | 0 | no |
| ld_production_readiness | **KEEP** | 6306 | 800 kB | no | no | 0 | no |
| ld_product_specifications | **KEEP** | 1124 | 312 kB | no | no | 0 | no |
| oem_codes_legacy | **ACTIVE** | 661645 | 129 MB | no | no | 1 | sí |
| kg_product_equipment | **ACTIVE** | 127340 | 21 MB | no | sí | 7 | no |
| backup_catalog_before_oil_hydraulic_crossrefs_20260705 | **ACTIVE** | 1980 | 18 MB | no | no | 1 | sí |
| kg_equipment_models | **ACTIVE** | 37751 | 7440 kB | no | sí | 9 | no |
| product_model | **ACTIVE** | 5424 | 3688 kB | no | no | 13 | no |
| product_element | **ACTIVE** | 2347 | 1776 kB | no | no | 13 | no |
| search_result_priority | **ACTIVE** | 9422 | 1768 kB | no | sí | 0 | no |
| manufacturer_learning_weights | **ACTIVE** | 11232 | 1496 kB | no | sí | 1 | no |
| alternative_group | **ACTIVE** | 2364 | 848 kB | no | no | 8 | no |
| kg_product_systems | **ACTIVE** | 4621 | 816 kB | no | no | 9 | no |
| kg_product_technologies | **ACTIVE** | 4622 | 808 kB | no | no | 9 | no |
| model_element_compatibility | **ACTIVE** | 2339 | 624 kB | no | no | 8 | no |
| alternative_group_member | **ACTIVE** | 2370 | 536 kB | no | no | 8 | no |
| duplicate_product_quarantine | **ACTIVE** | 53 | 464 kB | no | no | 1 | sí |
| cross_reference_master_legacy | **ACTIVE** | 1439 | 408 kB | no | no | 2 | sí |
| exact_part_reference | **ACTIVE** | 903 | 360 kB | no | no | 1 | no |
| kg_equipment_makes | **ACTIVE** | 423 | 208 kB | no | sí | 9 | no |
| knowledge_gaps | **ACTIVE** | -1 | 112 kB | sí | sí | 3 | no |
| bad_crossref_quarantine | **ACTIVE** | 187 | 88 kB | no | no | 1 | sí |
| kg_technologies | **ACTIVE** | -1 | 80 kB | sí | no | 12 | no |
| kg_systems | **ACTIVE** | -1 | 64 kB | sí | no | 13 | no |
| product_family | **ACTIVE** | -1 | 48 kB | sí | sí | 7 | no |
| kit_brand_codes | **ACTIVE** | -1 | 48 kB | sí | sí | 8 | no |
| schema_migrations | **ACTIVE** | -1 | 32 kB | sí | sí | 12 | no |
| maintenance_kits | **ACTIVE** | -1 | 32 kB | sí | sí | 13 | no |
| kit_components | **ACTIVE** | 46 | 32 kB | no | sí | 16 | no |
| t_cleanup | **ACTIVE** | -1 | 16 kB | sí | no | 1 | sí |
| v_products_with_eq | **ACTIVE** | -1 | 8192 bytes | sí | no | 2 | no |
| v_flagged_count | **ACTIVE** | -1 | 8192 bytes | sí | no | 1 | no |
| v_products_total | **ACTIVE** | -1 | 8192 bytes | sí | no | 3 | no |
| v_unmatched_makes | **ACTIVE** | -1 | 8192 bytes | sí | no | 1 | no |
| v_makes_with_models | **ACTIVE** | -1 | 8192 bytes | sí | no | 1 | no |
| mixed_duty_crossref_audit | **ARCHIVE_CANDIDATE** | 101563 | 10 MB | no | no | 0 | sí |
| hd_oil_crossrefs_that_hit_ld_oil | **ARCHIVE_CANDIDATE** | 32499 | 3048 kB | no | no | 0 | sí |
| hd_oil_ld_contamination_audit | **ARCHIVE_CANDIDATE** | 27844 | 2736 kB | no | no | 0 | sí |
| recovered_oil_hydraulic_crossrefs_stage | **ARCHIVE_CANDIDATE** | 1980 | 2632 kB | no | no | 0 | sí |
| search_result_priority_candidates_from_alternatives | **ARCHIVE_CANDIDATE** | 12781 | 1528 kB | no | no | 0 | sí |
| mixed_duty_action_candidates | **ARCHIVE_CANDIDATE** | 10467 | 1376 kB | no | no | 0 | sí |
| search_result_priority_candidates_from_alternatives_dedup | **ARCHIVE_CANDIDATE** | 9422 | 1352 kB | no | no | 0 | sí |
| hd_oil_ld_single_target_conflicts | **ARCHIVE_CANDIDATE** | 10267 | 1024 kB | no | no | 0 | sí |
| mann_donaldson_matches | **ARCHIVE_CANDIDATE** | 1963 | 536 kB | no | no | 0 | sí |
| ld_oem_duplicate_audit | **ARCHIVE_CANDIDATE** | 3673 | 384 kB | no | no | 0 | sí |
| mann_fleetguard_matches | **ARCHIVE_CANDIDATE** | 1189 | 280 kB | no | no | 0 | sí |
| suspected_filter_type_misclassification | **ARCHIVE_CANDIDATE** | 982 | 136 kB | no | no | 0 | sí |
| hd_equipment_inheritance_stage | **ARCHIVE_CANDIDATE** | 552 | 72 kB | no | no | 0 | sí |
| ld_air_oil_false_positive_review | **ARCHIVE_CANDIDATE** | -1 | 32 kB | sí | no | 0 | sí |
| ambiguous_ld_crossrefs | **ARCHIVE_CANDIDATE** | -1 | 32 kB | sí | no | 0 | sí |
| ld_severe_refs_by_manufacturer | **ARCHIVE_CANDIDATE** | 100 | 24 kB | no | no | 0 | sí |
| mixed_duty_aftermarket_safe_review | **ARCHIVE_CANDIDATE** | 113 | 24 kB | no | no | 0 | sí |
| ld_air_oil_duplicate_merge_candidates | **ARCHIVE_CANDIDATE** | 53 | 16 kB | no | no | 0 | sí |
| el80047_refs_to_el31275_stage | **ARCHIVE_CANDIDATE** | 69 | 16 kB | no | no | 0 | sí |
| t_safe_oil_cleanup | **ARCHIVE_CANDIDATE** | 54 | 16 kB | no | no | 0 | sí |
| ambiguous_ld_oem_refs | **ARCHIVE_CANDIDATE** | -1 | 16 kB | sí | no | 0 | sí |
| ld_severe_ref_classification | **ARCHIVE_CANDIDATE** | -1 | 16 kB | sí | no | 0 | sí |
| ld_air_sku_with_oil_crossrefs | **ARCHIVE_CANDIDATE** | 55 | 16 kB | no | no | 0 | sí |
| ld_oem_severe_duplicate_refs | **ARCHIVE_CANDIDATE** | -1 | 16 kB | sí | no | 0 | sí |
| ld_sku_prefix_type_mismatch | **ARCHIVE_CANDIDATE** | -1 | 8192 bytes | sí | no | 0 | sí |
| decision_explanations | **ARCHIVE_CANDIDATE** | -1 | 8192 bytes | sí | no | 0 | sí |
