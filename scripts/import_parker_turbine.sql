INSERT INTO elimfilters_catalog
(
    sku,
    codigo_base,
    technology,
    filter_type,
    specs
)
VALUES
('ET90500','500FH','HYDROCORE/SERIES™','Fuel Water Separator Housing', '{"compatible_element_series":"2010","compatibility_authority":"Parker Racor"}'::jsonb),
('ET90900','900FH','HYDROCORE/SERIES™','Fuel Water Separator Housing', '{"compatible_element_series":"2040","compatibility_authority":"Parker Racor"}'::jsonb),
('ET91000','1000FH','HYDROCORE/SERIES™','Fuel Water Separator Housing', '{"compatible_element_series":"2020","compatibility_authority":"Parker Racor"}'::jsonb),

('ET92010P','2010P','HYDROCORE/SERIES™','Fuel Water Separator Cartridge', '{}'::jsonb),
('ET92010T','2010T','HYDROCORE/SERIES™','Fuel Water Separator Cartridge', '{}'::jsonb),
('ET92010S','2010S','HYDROCORE/SERIES™','Fuel Water Separator Cartridge', '{}'::jsonb),

('ET92020P','2020P','HYDROCORE/SERIES™','Fuel Water Separator Cartridge', '{}'::jsonb),
('ET92020T','2020T','HYDROCORE/SERIES™','Fuel Water Separator Cartridge', '{}'::jsonb),
('ET92020S','2020S','HYDROCORE/SERIES™','Fuel Water Separator Cartridge', '{}'::jsonb),

('ET92040P','2040P','HYDROCORE/SERIES™','Fuel Water Separator Cartridge', '{}'::jsonb),
('ET92040T','2040T','HYDROCORE/SERIES™','Fuel Water Separator Cartridge', '{}'::jsonb),
('ET92040S','2040S','HYDROCORE/SERIES™','Fuel Water Separator Cartridge', '{}'::jsonb)

ON CONFLICT (codigo_base)
DO UPDATE SET
    specs = COALESCE(elimfilters_catalog.specs, '{}'::jsonb) || EXCLUDED.specs,
    technology = EXCLUDED.technology,
    filter_type = EXCLUDED.filter_type;