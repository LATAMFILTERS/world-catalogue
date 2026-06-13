-- ============================================================================
-- 011_intekcore_macrocore_compatibility.sql
-- Links INTEKCORE housings to MACROCORE elements via Donaldson Family codes.
--
-- Source: donaldson_air-intake_results.json + donaldson_air_results.json
-- model_code / element_code = elimfilters SKU (EA2XXXX / EA1XXXX).
-- Method: cross_reference — shared Donaldson Family attribute.
-- Confidence: INFERRED
-- is_primary: TRUE for Type=Primary elements, FALSE for Safety/other.
--
-- Covers 22 family groups.
-- All statements idempotent — ON CONFLICT DO NOTHING.
-- ============================================================================

BEGIN;

-- ── Family EBA: 4 housings × 12 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code EBA — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22037', 'EA22018', 'EA22078', 'EA22001')
  AND pe.element_code IN ('EA19396', 'EA19472', 'EA10822', 'EA11228', 'EA11097', 'EA11008', 'EA11009', 'EA11016', 'EA11017', 'EA12007', 'EA12008', 'EA12016')
ON CONFLICT DO NOTHING;

-- ── Family EBB: 3 housings × 9 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code EBB — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20271', 'EA20044', 'EA20049')
  AND pe.element_code IN ('EA11015', 'EA11019', 'EA11021', 'EA181028', 'EA11030', 'EA11099', 'EA12015', 'EA12028', 'EA12099')
ON CONFLICT DO NOTHING;

-- ── Family ECG: 8 housings × 10 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code ECG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA292001', 'EA22401', 'EA212001', 'EA22404', 'EA22417', 'EA22501', 'EA22504', 'EA22000')
  AND pe.element_code IN ('EA12100', 'EA18043', 'EA18044', 'EA10692', 'EA10693', 'EA10694', 'EA10695', 'EA13551', 'EA14575', 'EA17791')
ON CONFLICT DO NOTHING;

-- ── Family EPG: 6 housings × 6 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code EPG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20119', 'EA20120', 'EA20079', 'EA20089', 'EA20048', 'EA250049')
  AND pe.element_code IN ('EA17484', 'EA17682', 'EA13930')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code EPG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20119', 'EA20120', 'EA20079', 'EA20089', 'EA20048', 'EA250049')
  AND pe.element_code IN ('EA17680', 'EA17683', 'EA13890')
ON CONFLICT DO NOTHING;

-- ── Family ERA: 4 housings × 4 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code ERA — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20052', 'EA20115', 'EA20138', 'EA20141')
  AND pe.element_code IN ('EA14243', 'EA14301', 'EA14741', 'EA14950')
ON CONFLICT DO NOTHING;

-- ── Family FHG: 5 housings × 27 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code FHG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22626', 'EA25256', 'EA20372', 'EA20037', 'EA260048')
  AND pe.element_code IN ('EA18573', 'EA18586', 'EA11002', 'EA11034', 'EA11046', 'EA11059', 'EA11062', 'EA11063', 'EA11064', 'EA11072', 'EA12002', 'EA12034', 'EA12046', 'EA12059', 'EA12062', 'EA12063', 'EA12064', 'EA12072')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code FHG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22626', 'EA25256', 'EA20372', 'EA20037', 'EA260048')
  AND pe.element_code IN ('EA12212', 'EA19372', 'EA19373', 'EA19374', 'EA19375', 'EA19410', 'EA19539', 'EA19778', 'EA10307')
ON CONFLICT DO NOTHING;

-- ── Family FKB: 3 housings × 6 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code FKB — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA25008', 'EA25006', 'EA25045')
  AND pe.element_code IN ('EA14457', 'EA19218', 'EA19221')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code FKB — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA25008', 'EA25006', 'EA25045')
  AND pe.element_code IN ('EA12427', 'EA13729', 'EA18599')
ON CONFLICT DO NOTHING;

-- ── Family FPG: 25 housings × 17 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code FPG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22544', 'EA22545', 'EA22741', 'EA22742', 'EA27511', 'EA27512', 'EA27513', 'EA27514', 'EA25411', 'EA25424', 'EA25432', 'EA25433', 'EA20009', 'EA270017', 'EA20018', 'EA270019', 'EA20020', 'EA22525', 'EA282526', 'EA282527', 'EA22528', 'EA20219', 'EA20225', 'EA20317', 'EA20319')
  AND pe.element_code IN ('EA12410', 'EA10522', 'EA181039', 'EA121575', 'EA12686', 'EA12768', 'EA17653', 'EA18889', 'EA11424', 'EA131520')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code FPG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22544', 'EA22545', 'EA22741', 'EA22742', 'EA27511', 'EA27512', 'EA27513', 'EA27514', 'EA25411', 'EA25424', 'EA25432', 'EA25433', 'EA20009', 'EA270017', 'EA20018', 'EA270019', 'EA20020', 'EA22525', 'EA282526', 'EA282527', 'EA22528', 'EA20219', 'EA20225', 'EA20317', 'EA20319')
  AND pe.element_code IN ('EA135396', 'EA17639', 'EA10523', 'EA12769', 'EA12858', 'EA19332', 'EA19333')
ON CONFLICT DO NOTHING;

-- ── Family FRG: 23 housings × 24 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code FRG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22685', 'EA22686', 'EA25541', 'EA25551', 'EA20582', 'EA20585', 'EA20245', 'EA20250', 'EA20297', 'EA20395', 'EA200398', 'EA20206', 'EA20214', 'EA20415', 'EA20417', 'EA20097', 'EA20107', 'EA20523', 'EA20526', 'EA20092', 'EA20679', 'EA20031', 'EA20087')
  AND pe.element_code IN ('EA12503', 'EA12966', 'EA16457', 'EA17876', 'EA19271', 'EA19523', 'EA10043', 'EA101280', 'EA11437', 'EA11767', 'EA11790', 'EA17868', 'EA1781098')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code FRG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22685', 'EA22686', 'EA25541', 'EA25551', 'EA20582', 'EA20585', 'EA20245', 'EA20250', 'EA20297', 'EA20395', 'EA200398', 'EA20206', 'EA20214', 'EA20415', 'EA20417', 'EA20097', 'EA20107', 'EA20523', 'EA20526', 'EA20092', 'EA20679', 'EA20031', 'EA20087')
  AND pe.element_code IN ('EA12504', 'EA13781', 'EA16492', 'EA19277', 'EA19530', 'EA10047', 'EA11286', 'EA11476', 'EA11774', 'EA17869', 'EA181102')
ON CONFLICT DO NOTHING;

-- ── Family FTG: 3 housings × 4 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code FTG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20011', 'EA20007', 'EA20010')
  AND pe.element_code IN ('EA11082', 'EA12082')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code FTG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20011', 'EA20007', 'EA20010')
  AND pe.element_code IN ('EA17309', 'EA18722')
ON CONFLICT DO NOTHING;

-- ── Family FVG: 3 housings × 8 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code FVG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20195', 'EA260376', 'EA20587')
  AND pe.element_code IN ('EA14867', 'EA11043', 'EA11049', 'EA12043', 'EA12049')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code FVG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20195', 'EA260376', 'EA20587')
  AND pe.element_code IN ('EA16446', 'EA14860', 'EA14866')
ON CONFLICT DO NOTHING;

-- ── Family FWA: 9 housings × 14 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code FWA — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22526', 'EA22527', 'EA25007', 'EA25015', 'EA20022', 'EA20017', 'EA20019', 'EA20003', 'EA20036')
  AND pe.element_code IN ('EA18968', 'EA11000', 'EA11001', 'EA11035', 'EA11045', 'EA11050', 'EA11054', 'EA12000', 'EA12001', 'EA12035', 'EA12045', 'EA12050', 'EA182052', 'EA12054')
ON CONFLICT DO NOTHING;

-- ── Family FWB: 1 housings × 1 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code FWB — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20002')
  AND pe.element_code IN ('EA11038')
ON CONFLICT DO NOTHING;

-- ── Family FWG: 15 housings × 5 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code FWG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22503', 'EA22510', 'EA22512', 'EA2065008', 'EA25012', 'EA25266', 'EA20023', 'EA20026', 'EA200003', 'EA20004', 'EA20059', 'EA20063', 'EA20077', 'EA20083', 'EA20104')
  AND pe.element_code IN ('EA12510', 'EA12514', 'EA18966', 'EA18970', 'EA11052')
ON CONFLICT DO NOTHING;

-- ── Family PSD: 20 housings × 27 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code PSD — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20056', 'EA20055', 'EA20266', 'EA20278', 'EA20285', 'EA20287', 'EA20366', 'EA20384', 'EA20390', 'EA20391', 'EA20397', 'EA20398', 'EA20320', 'EA20338', 'EA20339', 'EA20340', 'EA20078', 'EA20088', 'EA20110', 'EA20111')
  AND pe.element_code IN ('EA15394', 'EA15395', 'EA15396', 'EA15397', 'EA15398', 'EA15399', 'EA15400', 'EA18533', 'EA108665', 'EA108666', 'EA18667', 'EA108675', 'EA108676', 'EA108677', 'EA17631', 'EA11983', 'EA19937', 'EA11172', 'EA11175', 'EA11176', 'EA11182', 'EA17050')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code PSD — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20056', 'EA20055', 'EA20266', 'EA20278', 'EA20285', 'EA20287', 'EA20366', 'EA20384', 'EA20390', 'EA20391', 'EA20397', 'EA20398', 'EA20320', 'EA20338', 'EA20339', 'EA20340', 'EA20078', 'EA20088', 'EA20110', 'EA20111')
  AND pe.element_code IN ('EA10975', 'EA11560', 'EA16121', 'EA17557', 'EA15493')
ON CONFLICT DO NOTHING;

-- ── Family PowerPleat: 9 housings × 4 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code PowerPleat — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22828', 'EA22829', 'EA20468', 'EA20469', 'EA20474', 'EA20475', 'EA230372', 'EA20374', 'EA20375')
  AND pe.element_code IN ('EA16096', 'EA18805')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code PowerPleat — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA22828', 'EA22829', 'EA20468', 'EA20469', 'EA20474', 'EA20475', 'EA230372', 'EA20374', 'EA20375')
  AND pe.element_code IN ('EA16104', 'EA18802')
ON CONFLICT DO NOTHING;

-- ── Family SBG: 4 housings × 13 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code SBG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20161', 'EA20251', 'EA20261', 'EA20035')
  AND pe.element_code IN ('EA11031', 'EA11033', 'EA11036', 'EA11037', 'EA11068', 'EA11071', 'EA12031', 'EA12032', 'EA12033', 'EA12036', 'EA12037', 'EA12068', 'EA12071')
ON CONFLICT DO NOTHING;

-- ── Family SRG: 2 housings × 5 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code SRG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20086', 'EA200087')
  AND pe.element_code IN ('EA181038', 'EA11040', 'EA12038', 'EA12040')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code SRG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20086', 'EA200087')
  AND pe.element_code IN ('EA15070')
ON CONFLICT DO NOTHING;

-- ── Family SSG: 5 housings × 3 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code SSG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA200088', 'EA290052', 'EA20053', 'EA290055', 'EA20057')
  AND pe.element_code IN ('EA17152', 'EA18306')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code SSG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA200088', 'EA290052', 'EA20053', 'EA290055', 'EA20057')
  AND pe.element_code IN ('EA19518')
ON CONFLICT DO NOTHING;

-- ── Family STB: 2 housings × 3 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code STB — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA240019', 'EA20071')
  AND pe.element_code IN ('EA17075')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code STB — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA240019', 'EA20071')
  AND pe.element_code IN ('EA19371', 'EA14837')
ON CONFLICT DO NOTHING;

-- ── Family STG: 6 housings × 12 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code STG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20332', 'EA20076', 'EA260077', 'EA20445', 'EA21006', 'EA21020')
  AND pe.element_code IN ('EA17039', 'EA11039', 'EA11041', 'EA11042', 'EA11044', 'EA12039', 'EA12041', 'EA12042', 'EA12044')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code STG — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20332', 'EA20076', 'EA260077', 'EA20445', 'EA21006', 'EA21020')
  AND pe.element_code IN ('EA14931', 'EA19370', 'EA18408')
ON CONFLICT DO NOTHING;

-- ── Family XRB: 3 housings × 6 elements ──────────────────────────
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, TRUE,
  'Donaldson Family code XRB — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20080', 'EA20127', 'EA20470')
  AND pe.element_code IN ('EA18116', 'EA11190', 'EA11539')
ON CONFLICT DO NOTHING;
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id,
  is_primary, compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
) SELECT
  pm.id, pe.id, FALSE,
  'Donaldson Family code XRB — shared across housing and element product data',
  NOW(), 'cross_reference', 'INFERRED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code IN ('EA20080', 'EA20127', 'EA20470')
  AND pe.element_code IN ('EA18391', 'EA111189', 'EA11540')
ON CONFLICT DO NOTHING;

COMMIT;