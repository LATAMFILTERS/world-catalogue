import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const applications = [
  { type: 'COMBINE', engine: '- 9650', equipment: 'JOHN DEERE 9650' },
  { type: 'COMBINE', engine: 'JOHN DEERE 6081', equipment: 'JOHN DEERE 9650 CTS' },
  { type: 'COMBINE', engine: 'JOHN DEERE 6081H', equipment: 'JOHN DEERE 9650 STS' }
];

const products = [
  {
    sku: 'EF90668', codigo_base: 'P550668',
    name: 'ELIMFILTERS Primary Diesel Fuel Water Separator',
    description: 'Primary heavy-duty diesel fuel/water separator. Direct replacement for John Deere RE531703.',
    filter_type: 'fuel', sub_type: 'Primary Fuel / Water Separator', technology: 'SYNTAPORE™',
    installation_type: 'Spin-On', attachment_type: 'Threaded', thread_size: '1-14 UN',
    height_mm: 296.9, outer_diameter_mm: 108, micron_rating: null,
    nominal_efficiency: '95% emulsified water separation',
    filter_media: 'Cellulose / Water separation media',
    oem_codes: [{ code: 'RE531703', manufacturer: 'JOHN-DEERE' }],
    brand_crossrefs: { 'JOHN-DEERE': ['RE531703'] },
    enrichment_data: {
      system: 'Primary Diesel Fuel', role: 'primary_fuel_water_separator',
      direct_replacement_for: 'JOHN-DEERE RE531703',
      configuration: 'sealed_base_without_lower_drain_port',
      recommended_use: 'Heavy-duty primary filtration before the transfer pump',
      compatible_engine_families: ['JOHN DEERE POWERTECH 6.8L', 'JOHN DEERE POWERTECH 8.1L']
    },
    specs: {
      dimensions: { outer_diameter_mm: 108, outer_diameter_in: 4.25, length_mm: 296.9, length_in: 11.69, thread_size: '1-14 UN' },
      media: { type: 'Cellulose', function: 'Fuel filtration and water separation' },
      water_separation: { efficiency_percent: 95, contaminant: 'emulsified water' },
      configuration: { base: 'sealed', lower_drain_port: false },
      recommended_use: 'Primary heavy-duty protection for the fuel transfer pump'
    },
    is_primary: true
  },
  {
    sku: 'EF90669', codigo_base: 'P550669',
    name: 'ELIMFILTERS Secondary Diesel Fuel Water Separator',
    description: 'Secondary diesel fuel/water separator with sealed base. Direct replacement for John Deere RE522688.',
    filter_type: 'fuel', sub_type: 'Secondary Fuel / Water Separator', technology: 'SYNTAPORE™',
    installation_type: 'Spin-On', attachment_type: 'Threaded', thread_size: '7/8-14 UN',
    height_mm: 171, outer_diameter_mm: 108, micron_rating: '5',
    nominal_efficiency: '5 micron; 95% emulsified water separation',
    filter_media: 'High-density treated cellulose',
    oem_codes: [{ code: 'RE522688', manufacturer: 'JOHN-DEERE' }],
    brand_crossrefs: { 'JOHN-DEERE': ['RE522688'] },
    enrichment_data: {
      system: 'Secondary Diesel Fuel', role: 'secondary_fuel_water_separator',
      direct_replacement_for: 'JOHN-DEERE RE522688',
      configuration: 'sealed_base_without_manual_drain',
      structural_alternative: { codigo_base: 'P551027', configuration: 'Twist & Drain', relationship: 'alternative_with_manual_drain' }
    },
    specs: {
      dimensions: { outer_diameter_mm: 108, outer_diameter_in: 4.25, length_mm: 171, length_in: 6.73, thread_size: '7/8-14 UN' },
      media: { type: 'High-density treated cellulose' },
      filtration: { micron_rating: 5, function: 'Fine filtration before the injectors' },
      water_separation: { efficiency_percent: 95, contaminant: 'emulsified water' },
      configuration: { base: 'sealed', manual_drain: false },
      alternative: { codigo_base: 'P551027', feature: 'Twist & Drain' }
    },
    is_primary: false
  }
];

async function upsert(p) {
  const found = await client.query(
    `SELECT id FROM elimfilters_catalog
     WHERE UPPER(COALESCE(sku,''))=UPPER($1)
        OR UPPER(COALESCE(codigo_base,''))=UPPER($2)
     ORDER BY CASE WHEN UPPER(COALESCE(sku,''))=UPPER($1) THEN 0 ELSE 1 END
     LIMIT 1`, [p.sku, p.codigo_base]);

  const v = [p.sku,p.codigo_base,p.name,p.description,p.filter_type,p.sub_type,p.technology,
    p.installation_type,p.attachment_type,p.thread_size,p.height_mm,p.outer_diameter_mm,
    p.micron_rating,p.nominal_efficiency,p.filter_media,JSON.stringify(p.oem_codes),
    JSON.stringify([]),JSON.stringify(p.brand_crossrefs),JSON.stringify(applications),
    JSON.stringify(p.enrichment_data),JSON.stringify(p.specs),'heavy duty',p.is_primary];

  if (found.rows.length === 0) {
    await client.query(`INSERT INTO elimfilters_catalog (
      sku,codigo_base,name,description,filter_type,sub_type,technology,installation_type,
      attachment_type,thread_size,height_mm,outer_diameter_mm,micron_rating,nominal_efficiency,
      filter_media,oem_codes,competitor_codes,brand_crossrefs,equipment_applications,
      enrichment_data,specs,duty,is_primary,created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb,
      $18::jsonb,$19::jsonb,$20::jsonb,$21::jsonb,$22,$23,NOW())`, v);
    console.log(`CREADO ${p.sku} / ${p.codigo_base}`);
  } else {
    await client.query(`UPDATE elimfilters_catalog SET
      sku=$1,codigo_base=$2,name=$3,description=$4,filter_type=$5,sub_type=$6,technology=$7,
      installation_type=$8,attachment_type=$9,thread_size=$10,height_mm=$11,outer_diameter_mm=$12,
      micron_rating=$13,nominal_efficiency=$14,filter_media=$15,oem_codes=$16::jsonb,
      competitor_codes=$17::jsonb,brand_crossrefs=$18::jsonb,equipment_applications=$19::jsonb,
      enrichment_data=COALESCE(enrichment_data,'{}'::jsonb)||$20::jsonb,
      specs=COALESCE(specs,'{}'::jsonb)||$21::jsonb,duty=$22,is_primary=$23 WHERE id=$24`,
      [...v, found.rows[0].id]);
    console.log(`ACTUALIZADO ${p.sku} / ${p.codigo_base}`);
  }
}

try {
  await client.connect();
  await client.query('BEGIN');
  for (const p of products) await upsert(p);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('ERROR:', e.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
