-- Applied 2026-11-16 together with run_367/run_368 (record of the statement; backups: ld_cross_W962_EL33776_before.json, ld_cross_W962_family_before.json).
-- ld_catalog.ld_competitor_cross_references sent MANN W 962, W 962/6 and W 962/14 to the Light Duty FRAM PH3776 (EL33776), so the public
-- search never reached the Heavy Duty principal EL83771. Operator ruling: W 962 is ONE principal with its alternative products.
BEGIN;
DELETE FROM ld_catalog.ld_competitor_cross_references
 WHERE id IN (131528,131529,131530) AND elimfilters_sku='EL33776' AND competitor_part_number IN ('W962','W962/6','W962/14') AND source_sku='PH3776';
COMMIT;
