-- ============================================================================
-- 012_intekcore_activate_durable.sql
-- Promotes INTEKCORE housings to durable status and aligns compatibility_class
-- on both housings and elements to a shared Family-code key.
--
-- Migration 004 inserted INTEKCORE as model_type=assembly, accepts_elements=FALSE.
-- Migration 004 also set MACROCORE elements compatibility_class by installation_type
-- (macrocore-round, macrocore-finned, etc.) which cannot serve as a unique
-- housing↔element key (multiple families share the same installation_type).
--
-- This migration adopts Donaldson Family codes as the compatibility_class key:
--   product_model.compatibility_class = macrocore-<family> (e.g. macrocore-fwa)
--   product_element.compatibility_class = macrocore-<family>
-- Both sides updated together for the 22 families with confirmed pairings.
--
-- Covers 22 common families.
-- Elements without a Family code keep their existing installation_type class.
-- All statements idempotent — safe to re-run.
-- ============================================================================

BEGIN;

-- ── Family EBA → macrocore-eba ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-eba'
WHERE model_code IN ('EA22037', 'EA22018', 'EA22078', 'EA22001');

UPDATE product_element
SET compatibility_class = 'macrocore-eba'
WHERE element_code IN ('EA19396', 'EA19472', 'EA10822', 'EA11228', 'EA11097', 'EA11008', 'EA11009', 'EA11016', 'EA11017', 'EA12007', 'EA12008', 'EA12016');

-- ── Family EBB → macrocore-ebb ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-ebb'
WHERE model_code IN ('EA20271', 'EA20044', 'EA20049');

UPDATE product_element
SET compatibility_class = 'macrocore-ebb'
WHERE element_code IN ('EA11015', 'EA11019', 'EA11021', 'EA181028', 'EA11030', 'EA11099', 'EA12015', 'EA12028', 'EA12099');

-- ── Family ECG → macrocore-ecg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-ecg'
WHERE model_code IN ('EA292001', 'EA22401', 'EA212001', 'EA22404', 'EA22417', 'EA22501', 'EA22504', 'EA22000');

UPDATE product_element
SET compatibility_class = 'macrocore-ecg'
WHERE element_code IN ('EA12100', 'EA18043', 'EA18044', 'EA10692', 'EA10693', 'EA10694', 'EA10695', 'EA13551', 'EA14575', 'EA17791');

-- ── Family EPG → macrocore-epg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-epg'
WHERE model_code IN ('EA20119', 'EA20120', 'EA20079', 'EA20089', 'EA20048', 'EA250049');

UPDATE product_element
SET compatibility_class = 'macrocore-epg'
WHERE element_code IN ('EA17484', 'EA17680', 'EA17682', 'EA17683', 'EA13890', 'EA13930');

-- ── Family ERA → macrocore-era ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-era'
WHERE model_code IN ('EA20052', 'EA20115', 'EA20138', 'EA20141');

UPDATE product_element
SET compatibility_class = 'macrocore-era'
WHERE element_code IN ('EA14243', 'EA14301', 'EA14741', 'EA14950');

-- ── Family FHG → macrocore-fhg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-fhg'
WHERE model_code IN ('EA22626', 'EA25256', 'EA20372', 'EA20037', 'EA260048');

UPDATE product_element
SET compatibility_class = 'macrocore-fhg'
WHERE element_code IN ('EA12212', 'EA19372', 'EA19373', 'EA19374', 'EA19375', 'EA19410', 'EA19539', 'EA19778', 'EA10307', 'EA18573', 'EA18586', 'EA11002', 'EA11034', 'EA11046', 'EA11059', 'EA11062', 'EA11063', 'EA11064', 'EA11072', 'EA12002', 'EA12034', 'EA12046', 'EA12059', 'EA12062', 'EA12063', 'EA12064', 'EA12072');

-- ── Family FKB → macrocore-fkb ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-fkb'
WHERE model_code IN ('EA25008', 'EA25006', 'EA25045');

UPDATE product_element
SET compatibility_class = 'macrocore-fkb'
WHERE element_code IN ('EA12427', 'EA13729', 'EA14457', 'EA18599', 'EA19218', 'EA19221');

-- ── Family FPG → macrocore-fpg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-fpg'
WHERE model_code IN ('EA22544', 'EA22545', 'EA22741', 'EA22742', 'EA27511', 'EA27512', 'EA27513', 'EA27514', 'EA25411', 'EA25424', 'EA25432', 'EA25433', 'EA20009', 'EA270017', 'EA20018', 'EA270019', 'EA20020', 'EA22525', 'EA282526', 'EA282527', 'EA22528', 'EA20219', 'EA20225', 'EA20317', 'EA20319');

UPDATE product_element
SET compatibility_class = 'macrocore-fpg'
WHERE element_code IN ('EA12410', 'EA135396', 'EA17639', 'EA10522', 'EA10523', 'EA181039', 'EA121575', 'EA12686', 'EA12768', 'EA12769', 'EA12858', 'EA17653', 'EA18889', 'EA19332', 'EA19333', 'EA11424', 'EA131520');

-- ── Family FRG → macrocore-frg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-frg'
WHERE model_code IN ('EA22685', 'EA22686', 'EA25541', 'EA25551', 'EA20582', 'EA20585', 'EA20245', 'EA20250', 'EA20297', 'EA20395', 'EA200398', 'EA20206', 'EA20214', 'EA20415', 'EA20417', 'EA20097', 'EA20107', 'EA20523', 'EA20526', 'EA20092', 'EA20679', 'EA20031', 'EA20087');

UPDATE product_element
SET compatibility_class = 'macrocore-frg'
WHERE element_code IN ('EA12503', 'EA12504', 'EA12966', 'EA13781', 'EA16457', 'EA16492', 'EA17876', 'EA19271', 'EA19277', 'EA19523', 'EA19530', 'EA10043', 'EA10047', 'EA101280', 'EA11286', 'EA11437', 'EA11476', 'EA11767', 'EA11774', 'EA11790', 'EA17868', 'EA17869', 'EA1781098', 'EA181102');

-- ── Family FTG → macrocore-ftg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-ftg'
WHERE model_code IN ('EA20011', 'EA20007', 'EA20010');

UPDATE product_element
SET compatibility_class = 'macrocore-ftg'
WHERE element_code IN ('EA17309', 'EA18722', 'EA11082', 'EA12082');

-- ── Family FVG → macrocore-fvg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-fvg'
WHERE model_code IN ('EA20195', 'EA260376', 'EA20587');

UPDATE product_element
SET compatibility_class = 'macrocore-fvg'
WHERE element_code IN ('EA16446', 'EA14860', 'EA14866', 'EA14867', 'EA11043', 'EA11049', 'EA12043', 'EA12049');

-- ── Family FWA → macrocore-fwa ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-fwa'
WHERE model_code IN ('EA22526', 'EA22527', 'EA25007', 'EA25015', 'EA20022', 'EA20017', 'EA20019', 'EA20003', 'EA20036');

UPDATE product_element
SET compatibility_class = 'macrocore-fwa'
WHERE element_code IN ('EA18968', 'EA11000', 'EA11001', 'EA11035', 'EA11045', 'EA11050', 'EA11054', 'EA12000', 'EA12001', 'EA12035', 'EA12045', 'EA12050', 'EA182052', 'EA12054');

-- ── Family FWB → macrocore-fwb ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-fwb'
WHERE model_code IN ('EA20002');

UPDATE product_element
SET compatibility_class = 'macrocore-fwb'
WHERE element_code IN ('EA11038');

-- ── Family FWG → macrocore-fwg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-fwg'
WHERE model_code IN ('EA22503', 'EA22510', 'EA22512', 'EA2065008', 'EA25012', 'EA25266', 'EA20023', 'EA20026', 'EA200003', 'EA20004', 'EA20059', 'EA20063', 'EA20077', 'EA20083', 'EA20104');

UPDATE product_element
SET compatibility_class = 'macrocore-fwg'
WHERE element_code IN ('EA12510', 'EA12514', 'EA18966', 'EA18970', 'EA11052');

-- ── Family PSD → macrocore-psd ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-psd'
WHERE model_code IN ('EA20056', 'EA20055', 'EA20266', 'EA20278', 'EA20285', 'EA20287', 'EA20366', 'EA20384', 'EA20390', 'EA20391', 'EA20397', 'EA20398', 'EA20320', 'EA20338', 'EA20339', 'EA20340', 'EA20078', 'EA20088', 'EA20110', 'EA20111');

UPDATE product_element
SET compatibility_class = 'macrocore-psd'
WHERE element_code IN ('EA15394', 'EA15395', 'EA15396', 'EA15397', 'EA15398', 'EA15399', 'EA15400', 'EA10975', 'EA11560', 'EA16121', 'EA17557', 'EA18533', 'EA108665', 'EA108666', 'EA18667', 'EA108675', 'EA108676', 'EA108677', 'EA15493', 'EA17631', 'EA11983', 'EA19937', 'EA11172', 'EA11175', 'EA11176', 'EA11182', 'EA17050');

-- ── Family PowerPleat → macrocore-powerpleat ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-powerpleat'
WHERE model_code IN ('EA22828', 'EA22829', 'EA20468', 'EA20469', 'EA20474', 'EA20475', 'EA230372', 'EA20374', 'EA20375');

UPDATE product_element
SET compatibility_class = 'macrocore-powerpleat'
WHERE element_code IN ('EA16096', 'EA16104', 'EA18802', 'EA18805');

-- ── Family SBG → macrocore-sbg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-sbg'
WHERE model_code IN ('EA20161', 'EA20251', 'EA20261', 'EA20035');

UPDATE product_element
SET compatibility_class = 'macrocore-sbg'
WHERE element_code IN ('EA11031', 'EA11033', 'EA11036', 'EA11037', 'EA11068', 'EA11071', 'EA12031', 'EA12032', 'EA12033', 'EA12036', 'EA12037', 'EA12068', 'EA12071');

-- ── Family SRG → macrocore-srg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-srg'
WHERE model_code IN ('EA20086', 'EA200087');

UPDATE product_element
SET compatibility_class = 'macrocore-srg'
WHERE element_code IN ('EA15070', 'EA181038', 'EA11040', 'EA12038', 'EA12040');

-- ── Family SSG → macrocore-ssg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-ssg'
WHERE model_code IN ('EA200088', 'EA290052', 'EA20053', 'EA290055', 'EA20057');

UPDATE product_element
SET compatibility_class = 'macrocore-ssg'
WHERE element_code IN ('EA17152', 'EA18306', 'EA19518');

-- ── Family STB → macrocore-stb ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-stb'
WHERE model_code IN ('EA240019', 'EA20071');

UPDATE product_element
SET compatibility_class = 'macrocore-stb'
WHERE element_code IN ('EA19371', 'EA14837', 'EA17075');

-- ── Family STG → macrocore-stg ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-stg'
WHERE model_code IN ('EA20332', 'EA20076', 'EA260077', 'EA20445', 'EA21006', 'EA21020');

UPDATE product_element
SET compatibility_class = 'macrocore-stg'
WHERE element_code IN ('EA17039', 'EA14931', 'EA19370', 'EA18408', 'EA11039', 'EA11041', 'EA11042', 'EA11044', 'EA12039', 'EA12041', 'EA12042', 'EA12044');

-- ── Family XRB → macrocore-xrb ──────────────────────
UPDATE product_model
SET model_type = 'durable',
    accepts_elements = TRUE,
    compatibility_class = 'macrocore-xrb'
WHERE model_code IN ('EA20080', 'EA20127', 'EA20470');

UPDATE product_element
SET compatibility_class = 'macrocore-xrb'
WHERE element_code IN ('EA18116', 'EA18391', 'EA111189', 'EA11190', 'EA11539', 'EA11540');

COMMIT;