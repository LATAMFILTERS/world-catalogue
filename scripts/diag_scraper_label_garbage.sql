-- Read-only. Measures how many oem_codes/competitor_codes entries have a
-- spec-table label (scraped by mistake) as their "code" value instead of a
-- real cross-reference part number -- e.g. {"code": "LENGTH", "manufacturer":
-- "9.65 inch / 245.11 mm"} or {"code": "AF25139M", "manufacturer": "AF4908"}
-- (a genuine code sitting in the manufacturer slot). Confirmed present on
-- EL80051 and EA17682; run this to see how widespread it is before writing
-- a catalog-wide cleanup UPDATE.

WITH bad AS (
  SELECT c.sku, 'oem_codes' AS field, e->>'code' AS code, e->>'manufacturer' AS manufacturer
  FROM elimfilters_catalog c, jsonb_array_elements(c.oem_codes) e
  WHERE UPPER(TRIM(e->>'code')) IN (
    'LENGTH','THREADSIZE','LARGESTOD','LARGESTID','HEIGHT','WIDTH','INNERDIAMETER','OUTERDIAMETER',
    'PRODUCTDESCRIPTION','PRODUCT DESCRIPTION','RELATEDPARTS','RELATED PARTS','REPLACES','REPLACEDBY',
    'REPLACED BY','MEDIATYPE','DOWNLOADSPECS','DOWNLOAD SPECS','EFFICIENCY','FAMILY','STYLE','TYPE'
  )
  UNION ALL
  SELECT c.sku, 'competitor_codes' AS field, e->>'code' AS code, e->>'manufacturer' AS manufacturer
  FROM elimfilters_catalog c, jsonb_array_elements(c.competitor_codes) e
  WHERE UPPER(TRIM(e->>'code')) IN (
    'LENGTH','THREADSIZE','LARGESTOD','LARGESTID','HEIGHT','WIDTH','INNERDIAMETER','OUTERDIAMETER',
    'PRODUCTDESCRIPTION','PRODUCT DESCRIPTION','RELATEDPARTS','RELATED PARTS','REPLACES','REPLACEDBY',
    'REPLACED BY','MEDIATYPE','DOWNLOADSPECS','DOWNLOAD SPECS','EFFICIENCY','FAMILY','STYLE','TYPE'
  )
)
SELECT field, count(DISTINCT sku) AS skus_affected, count(*) AS entries FROM bad GROUP BY field;
