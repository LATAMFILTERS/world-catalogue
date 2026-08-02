const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const product = {
  sku: 'EH60950',
  codigo_base: 'P170950',
  name: 'ELIMFILTERS DURAMAX Hydraulic Spin-On Filter',
  description: 'Medium-pressure hydraulic and hydrostatic spin-on filter. Direct replacement for John Deere AH128449.',
  filter_type: 'hydraulic',
  sub_type: 'Medium Pressure Hydraulic / Hydrostatic',
  technology: 'NANOFORCE™',
  installation_type: 'Spin-On',
  attachment_type: 'Threaded',
  thread_size: '1 3/8-12 UN',
  height_mm: 240,
  outer_diameter_mm: 97,
  gasket_od_mm: 70,
  gasket_id_mm: 63,
  micron_rating: '11 absolute / 4 nominal',
  nominal_efficiency: 'Beta 1000 at 11 micron; Beta 2 at 4 micron',
  filter_media: 'Synthetic microfiber glass / Synteq XP',
  oem_codes: [
    { code: 'AH128449', manufacturer: 'JOHN-DEERE' },
    { code: 'AT215172', manufacturer: 'JOHN-DEERE' },
    { code: '4160174', manufacturer: 'JOHN-DEERE' }
  ],
  competitor_codes: [
    { code: 'HF6557', manufacturer: 'FLEETGUARD' },
    { code: 'BT8852MPG', manufacturer: 'BALDWIN' },
    { code: 'BT734', manufacturer: 'BALDWIN' },
    { code: 'BT749', manufacturer: 'BALDWIN' },
    { code: '51819', manufacturer: 'WIX' }
  ],
  brand_crossrefs: {
    'JOHN-DEERE': ['AH128449', 'AT215172', '4160174'],
    FLEETGUARD: ['HF6557'],
    BALDWIN: ['BT8852MPG', 'BT734', 'BT749'],
    WIX: ['51819']
  },
  equipment_applications: [
    { type: 'COMBINE', engine: '- 9650', equipment: 'JOHN DEERE 9650' },
    { type: 'COMBINE', engine: 'JOHN DEERE 6081', equipment: 'JOHN DEERE 9650 CTS' },
    { type: 'COMBINE', engine: 'JOHN DEERE 6081H', equipment: 'JOHN DEERE 9650 STS' }
  ],
  enrichment_data: {
    product_line: 'DURAMAX™',
    system: 'Hydraulic / Hydrostatic',
    pressure_class: 'Medium Pressure',
    flow_direction: 'outside_to_inside',
    direct_replacement_for: 'JOHN-DEERE AH128449'
  },
  specs: {
    dimensions: {
      outer_diameter_mm: 97,
      outer_diameter_in: 3.82,
      length_mm: 240,
      length_in: 9.44,
      thread_size: '1 3/8-12 UN',
      gasket_od_mm: 70,
      gasket_od_in: 2.76,
      gasket_id_mm: 63,
      gasket_id_in: 2.48
    },
    media: {
      type: 'Synthetic high-technology media',
      material: 'Microfiber glass',
      reference: 'Synteq XP'
    },
    filtration: {
      absolute: { beta: 1000, micron: 11, efficiency_percent: 99.9 },
      nominal: { beta: 2, micron: 4 }
    },
    flow_direction: 'outside_to_inside'
  }
};

(async () => {
  try {
    await client.connect();
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT id FROM elimfilters_catalog
       WHERE UPPER(COALESCE(sku, '')) = UPPER($1)
          OR UPPER(COALESCE(codigo_base, '')) = UPPER($2)
       ORDER BY CASE WHEN UPPER(COALESCE(sku, '')) = UPPER($1) THEN 0 ELSE 1 END
       LIMIT 1`,
      [product.sku, product.codigo_base]
    );

    const values = [
      product.sku, product.codigo_base, product.name, product.description,
      product.filter_type, product.sub_type, product.technology,
      product.installation_type, product.attachment_type, product.thread_size,
      product.height_mm, product.outer_diameter_mm, product.gasket_od_mm,
      product.gasket_id_mm, product.micron_rating, product.nominal_efficiency,
      product.filter_media, JSON.stringify(product.oem_codes),
      JSON.stringify(product.competitor_codes), JSON.stringify(product.brand_crossrefs),
      JSON.stringify(product.equipment_applications), JSON.stringify(product.enrichment_data),
      JSON.stringify(product.specs)
    ];

    if (existing.rows.length === 0) {
      await client.query(
        `INSERT INTO elimfilters_catalog (
          sku,codigo_base,name,description,filter_type,sub_type,technology,
          installation_type,attachment_type,thread_size,height_mm,outer_diameter_mm,
          gasket_od_mm,gasket_id_mm,micron_rating,nominal_efficiency,filter_media,
          oem_codes,competitor_codes,brand_crossrefs,equipment_applications,
          enrichment_data,specs,duty,is_primary,created_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
          $18::jsonb,$19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,$23::jsonb,
          'heavy duty',true,NOW()
        )`, values
      );
      console.log('CREADO EH60950 / P170950');
    } else {
      await client.query(
        `UPDATE elimfilters_catalog SET
          sku=$1,codigo_base=$2,name=$3,description=$4,filter_type=$5,sub_type=$6,
          technology=$7,installation_type=$8,attachment_type=$9,thread_size=$10,
          height_mm=$11,outer_diameter_mm=$12,gasket_od_mm=$13,gasket_id_mm=$14,
          micron_rating=$15,nominal_efficiency=$16,filter_media=$17,oem_codes=$18::jsonb,
          competitor_codes=$19::jsonb,brand_crossrefs=$20::jsonb,
          equipment_applications=$21::jsonb,
          enrichment_data=COALESCE(enrichment_data,'{}'::jsonb) || $22::jsonb,
          specs=COALESCE(specs,'{}'::jsonb) || $23::jsonb,
          duty='heavy duty',is_primary=true
        WHERE id=$24`, [...values, existing.rows[0].id]
      );
      console.log('ACTUALIZADO EH60950 / P170950');
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('ERROR:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
})();
