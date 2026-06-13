-- ============================================================================
-- 011_intekcore_macrocore_compatibility.sql
-- Links INTEKCORE housings to MACROCORE elements via Donaldson Family codes.
--
-- Source: donaldson_air-intake_results.json + donaldson_air_results.json
-- Method: cross_reference — shared Family attribute implies compatibility.
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
WHERE pm.model_code IN ('A092037', 'A112018', 'A112078', 'A132001')
  AND pe.element_code IN ('P129396', 'P129472', 'P140822', 'P141228', 'P151097', 'P181008', 'P181009', 'P181016', 'P181017', 'P182007', 'P182008', 'P182016')
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
WHERE pm.model_code IN ('B120271', 'B140044', 'B160049')
  AND pe.element_code IN ('P181015', 'P181019', 'P181021', 'P181028', 'P181030', 'P181099', 'P182015', 'P182028', 'P182099')
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
WHERE pm.model_code IN ('G092001', 'G092401', 'G112001', 'G112404', 'G112417', 'G112501', 'G112504', 'G132000')
  AND pe.element_code IN ('P142100', 'P148043', 'P148044', 'P150692', 'P150693', 'P150694', 'P150695', 'P153551', 'P154575', 'P537791')
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
WHERE pm.model_code IN ('G110119', 'G110120', 'G130079', 'G130089', 'G150048', 'G150049')
  AND pe.element_code IN ('P527484', 'P527682', 'P533930')
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
WHERE pm.model_code IN ('G110119', 'G110120', 'G130079', 'G130089', 'G150048', 'G150049')
  AND pe.element_code IN ('P527680', 'P527683', 'P533890')
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
WHERE pm.model_code IN ('A110052', 'A130115', 'A150138', 'A150141')
  AND pe.element_code IN ('P544243', 'P544301', 'P544741', 'P544950')
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
WHERE pm.model_code IN ('G052626', 'G065256', 'G080372', 'G120037', 'G160048')
  AND pe.element_code IN ('P148573', 'P148586', 'P181002', 'P181034', 'P181046', 'P181059', 'P181062', 'P181063', 'P181064', 'P181072', 'P182002', 'P182034', 'P182046', 'P182059', 'P182062', 'P182063', 'P182064', 'P182072')
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
WHERE pm.model_code IN ('G052626', 'G065256', 'G080372', 'G120037', 'G160048')
  AND pe.element_code IN ('P112212', 'P119372', 'P119373', 'P119374', 'P119375', 'P119410', 'P119539', 'P119778', 'P120307')
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
WHERE pm.model_code IN ('B045008', 'B055006', 'B065045')
  AND pe.element_code IN ('P604457', 'P609218', 'P609221')
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
WHERE pm.model_code IN ('B045008', 'B055006', 'B065045')
  AND pe.element_code IN ('P602427', 'P603729', 'P608599')
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
WHERE pm.model_code IN ('G042544', 'G042545', 'G052741', 'G052742', 'G057511', 'G057512', 'G057513', 'G057514', 'G065411', 'G065424', 'G065432', 'G065433', 'G070009', 'G070017', 'G070018', 'G070019', 'G070020', 'G082525', 'G082526', 'G082527', 'G082528', 'G090219', 'G090225', 'G100317', 'G100319')
  AND pe.element_code IN ('P532410', 'P780522', 'P781039', 'P821575', 'P822686', 'P822768', 'P827653', 'P828889', 'P831424', 'P831520')
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
WHERE pm.model_code IN ('G042544', 'G042545', 'G052741', 'G052742', 'G057511', 'G057512', 'G057513', 'G057514', 'G065411', 'G065424', 'G065432', 'G065433', 'G070009', 'G070017', 'G070018', 'G070019', 'G070020', 'G082525', 'G082526', 'G082527', 'G082528', 'G090219', 'G090225', 'G100317', 'G100319')
  AND pe.element_code IN ('P535396', 'P777639', 'P780523', 'P822769', 'P822858', 'P829332', 'P829333')
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
WHERE pm.model_code IN ('G052685', 'G052686', 'G065541', 'G065551', 'G080582', 'G080585', 'G090245', 'G090250', 'G100297', 'G100395', 'G100398', 'G110206', 'G110214', 'G120415', 'G120417', 'G130097', 'G130107', 'G140523', 'G140526', 'G150092', 'G160679', 'G180031', 'G180087')
  AND pe.element_code IN ('P532503', 'P532966', 'P536457', 'P537876', 'P549271', 'P549523', 'P600043', 'P601280', 'P601437', 'P601767', 'P601790', 'P777868', 'P781098')
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
WHERE pm.model_code IN ('G052685', 'G052686', 'G065541', 'G065551', 'G080582', 'G080585', 'G090245', 'G090250', 'G100297', 'G100395', 'G100398', 'G110206', 'G110214', 'G120415', 'G120417', 'G130097', 'G130107', 'G140523', 'G140526', 'G150092', 'G160679', 'G180031', 'G180087')
  AND pe.element_code IN ('P532504', 'P533781', 'P536492', 'P549277', 'P549530', 'P600047', 'P601286', 'P601476', 'P601774', 'P777869', 'P781102')
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
WHERE pm.model_code IN ('G180011', 'G210007', 'G210010')
  AND pe.element_code IN ('P181082', 'P182082')
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
WHERE pm.model_code IN ('G180011', 'G210007', 'G210010')
  AND pe.element_code IN ('P127309', 'P138722')
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
WHERE pm.model_code IN ('G140195', 'G160376', 'G160587')
  AND pe.element_code IN ('P124867', 'P181043', 'P181049', 'P182043', 'P182049')
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
WHERE pm.model_code IN ('G140195', 'G160376', 'G160587')
  AND pe.element_code IN ('P116446', 'P124860', 'P124866')
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
WHERE pm.model_code IN ('A052526', 'A052527', 'A065007', 'A065015', 'A080022', 'A100017', 'A100019', 'A120003', 'A120036')
  AND pe.element_code IN ('P148968', 'P181000', 'P181001', 'P181035', 'P181045', 'P181050', 'P181054', 'P182000', 'P182001', 'P182035', 'P182045', 'P182050', 'P182052', 'P182054')
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
WHERE pm.model_code IN ('B100002')
  AND pe.element_code IN ('P101038')
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
WHERE pm.model_code IN ('G042503', 'G052510', 'G052512', 'G065008', 'G065012', 'G065266', 'G080023', 'G080026', 'G100003', 'G100004', 'G120059', 'G120063', 'G140077', 'G140083', 'G160104')
  AND pe.element_code IN ('P122510', 'P122514', 'P148966', 'P148970', 'P181052')
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
WHERE pm.model_code IN ('D080056', 'D090055', 'D090266', 'D090278', 'D090285', 'D090287', 'D100366', 'D100384', 'D100390', 'D100391', 'D100397', 'D100398', 'D120320', 'D120338', 'D120339', 'D120340', 'D140078', 'D140088', 'D140110', 'D140111')
  AND pe.element_code IN ('DBA5394', 'DBA5395', 'DBA5396', 'DBA5397', 'DBA5398', 'DBA5399', 'DBA5400', 'P608533', 'P608665', 'P608666', 'P608667', 'P608675', 'P608676', 'P608677', 'P617631', 'P621983', 'P639937', 'P641172', 'P641175', 'P641176', 'P641182', 'P957050')
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
WHERE pm.model_code IN ('D080056', 'D090055', 'D090266', 'D090278', 'D090285', 'D090287', 'D100366', 'D100384', 'D100390', 'D100391', 'D100397', 'D100398', 'D120320', 'D120338', 'D120339', 'D120340', 'D140078', 'D140088', 'D140110', 'D140111')
  AND pe.element_code IN ('P600975', 'P601560', 'P606121', 'P607557', 'P615493')
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
WHERE pm.model_code IN ('G052828', 'G052829', 'G110468', 'G110469', 'G110474', 'G110475', 'G130372', 'G130374', 'G130375')
  AND pe.element_code IN ('P626096', 'P628805')
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
WHERE pm.model_code IN ('G052828', 'G052829', 'G110468', 'G110469', 'G110474', 'G110475', 'G130372', 'G130374', 'G130375')
  AND pe.element_code IN ('P626104', 'P628802')
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
WHERE pm.model_code IN ('G100161', 'G120251', 'G140261', 'G160035')
  AND pe.element_code IN ('P181031', 'P181033', 'P181036', 'P181037', 'P181068', 'P181071', 'P182031', 'P182032', 'P182033', 'P182036', 'P182037', 'P182068', 'P182071')
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
WHERE pm.model_code IN ('G200086', 'G200087')
  AND pe.element_code IN ('P181038', 'P181040', 'P182038', 'P182040')
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
WHERE pm.model_code IN ('G200086', 'G200087')
  AND pe.element_code IN ('P115070')
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
WHERE pm.model_code IN ('G200088', 'G290052', 'G290053', 'G290055', 'G290057')
  AND pe.element_code IN ('DBA7152', 'P608306')
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
WHERE pm.model_code IN ('G200088', 'G290052', 'G290053', 'G290055', 'G290057')
  AND pe.element_code IN ('P609518')
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
WHERE pm.model_code IN ('B140019', 'B160071')
  AND pe.element_code IN ('P127075')
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
WHERE pm.model_code IN ('B140019', 'B160071')
  AND pe.element_code IN ('P119371', 'P124837')
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
WHERE pm.model_code IN ('G120332', 'G140076', 'G160077', 'G160445', 'G161006', 'G161020')
  AND pe.element_code IN ('DBA7039', 'P181039', 'P181041', 'P181042', 'P181044', 'P182039', 'P182041', 'P182042', 'P182044')
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
WHERE pm.model_code IN ('G120332', 'G140076', 'G160077', 'G160445', 'G161006', 'G161020')
  AND pe.element_code IN ('P114931', 'P119370', 'P128408')
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
WHERE pm.model_code IN ('B080080', 'B100127', 'B120470')
  AND pe.element_code IN ('P608116', 'P611190', 'P611539')
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
WHERE pm.model_code IN ('B080080', 'B100127', 'B120470')
  AND pe.element_code IN ('P608391', 'P611189', 'P611540')
ON CONFLICT DO NOTHING;

COMMIT;