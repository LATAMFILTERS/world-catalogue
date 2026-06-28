SELECT COUNT(*) AS total_makes FROM kg_equipment_makes;
SELECT COUNT(*) AS unmatched FROM kg_equipment_makes WHERE notes IS NOT NULL;
SELECT slug, display_name, notes FROM kg_equipment_makes WHERE notes IS NOT NULL ORDER BY slug;
