CREATE OR REPLACE VIEW catalog_customer_readiness_v AS
SELECT sku,codigo_base,duty,technology,filter_type,canonical_source_brand,canonical_source_status,
 (canonical_source_brand IS NULL OR canonical_source_status IS DISTINCT FROM 'VERIFIED') AS needs_source_verification,
 (coalesce(jsonb_array_length(equipment_applications),0)=0 AND coalesce(jsonb_array_length(vehicle_applications),0)=0) AS needs_applications,
 (coalesce(jsonb_array_length(competitor_codes),0)=0 AND coalesce(jsonb_array_length(oem_codes),0)=0) AS needs_crossrefs,
 (image_url IS NULL OR btrim(image_url)='') AS needs_image,
 (height_mm IS NULL AND product_length_mm IS NULL AND outer_diameter_mm IS NULL AND inner_diameter_mm IS NULL) AS needs_dimensions,
 (coalesce(logistics_data_complete,false)=false) AS needs_packaging,
 (canonical_source_brand IS NOT NULL AND canonical_source_status='VERIFIED'
  AND (coalesce(jsonb_array_length(equipment_applications),0)>0 OR coalesce(jsonb_array_length(vehicle_applications),0)>0)
  AND (coalesce(jsonb_array_length(competitor_codes),0)>0 OR coalesce(jsonb_array_length(oem_codes),0)>0)) AS core_traceability_ready
FROM elimfilters_catalog;
