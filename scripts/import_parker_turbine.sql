INSERT INTO elimfilters_catalog
(
    sku,
    codigo_base,
    technology,
    filter_type
)
VALUES
('ET90500','500FH','HYDROCORE/SERIES™','Fuel Water Separator Housing'),
('ET90900','900FH','HYDROCORE/SERIES™','Fuel Water Separator Housing'),
('ET91000','1000FH','HYDROCORE/SERIES™','Fuel Water Separator Housing'),

('ET92010P','2010P','HYDROCORE/SERIES™','Fuel Water Separator Cartridge'),
('ET92010T','2010T','HYDROCORE/SERIES™','Fuel Water Separator Cartridge'),
('ET92010S','2010S','HYDROCORE/SERIES™','Fuel Water Separator Cartridge'),

('ET92020P','2020P','HYDROCORE/SERIES™','Fuel Water Separator Cartridge'),
('ET92020T','2020T','HYDROCORE/SERIES™','Fuel Water Separator Cartridge'),
('ET92020S','2020S','HYDROCORE/SERIES™','Fuel Water Separator Cartridge'),

('ET92040P','2040P','HYDROCORE/SERIES™','Fuel Water Separator Cartridge'),
('ET92040T','2040T','HYDROCORE/SERIES™','Fuel Water Separator Cartridge'),
('ET92040S','2040S','HYDROCORE/SERIES™','Fuel Water Separator Cartridge')

ON CONFLICT (codigo_base)
DO NOTHING;