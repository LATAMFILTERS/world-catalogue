const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function buildSku(item, index) {
  // Use existing SKU if present, otherwise generate EA1-prefixed from donaldson code
  if (item.sku) return item.sku.toString().toUpperCase();
  const code = item.partNumber || item.part_number || item.codigo || item.code || String(index + 1).padStart(5, '0');
  return `EA1-${code.toString().toUpperCase()}`;
}

function parseApplications(item) {
  const apps = item.equipment_applications || item.equipmentApplications ||
               item.applications || item.equipment_compatibility || [];
  if (!Array.isArray(apps)) return [];
  return apps.map(a => {
    if (typeof a === 'string') return { machine: a };
    return {
      machine:  a.machine  || a.equipment || a.name  || '',
      year:     a.year     || a.year_range || '',
      type:     a.type     || '',
      engine:   a.engine   || ''
    };
  });
}

function parseOemCodes(item) {
  const codes = item.oem_codes || item.oemCodes || item.oem_cross_reference ||
                item.crossReferences || item.cross_references || [];
  if (!Array.isArray(codes)) return [];
  return codes.map(c => {
    if (typeof c === 'string') {
      const parts = c.split(' ');
      return { manufacturer: parts[0] || 'DONALDSON', code: parts.slice(1).join(' ') || c };
    }
    return { manufacturer: c.manufacturer || 'DONALDSON', code: c.code || c.part || '' };
  });
}

async function main() {
  const filePath = path.join(__dirname, 'donaldson-air-filters.json');
  if (!fs.existsSync(filePath)) {
    console.error('ERROR: donaldson-air-filters.json not found in', __dirname);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const items = Array.isArray(data) ? data : data.products || data.data || [data];

  console.log(`Loaded ${items.length} items from donaldson-air-filters.json`);

  const client = await pool.connect();
  try {
    // Count before
    const before = await client.query(
      "SELECT COUNT(*) FROM elimfilters_catalog WHERE filter_type = 'Air Filter'"
    );
    console.log(`Before: ${before.rows[0].count} Air Filter rows in elimfilters_catalog`);

    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const sku = buildSku(item, i);
      const technology = item.technology || item.mediaType || item.media_type || null;
      const equipment_applications = parseApplications(item);
      const oem_codes = parseOemCodes(item);
      const competitor_codes = item.competitor_codes || item.competitorCodes || [];

      const sql = `
        INSERT INTO elimfilters_catalog (
          sku, filter_type, technology, equipment_applications,
          oem_codes, competitor_codes,
          installation_type, micron_rating, duty
        ) VALUES (
          $1, 'Air Filter', $2, $3::jsonb,
          $4::jsonb, $5::jsonb,
          $6, $7, $8
        )
        ON CONFLICT (sku) DO UPDATE SET
          filter_type           = EXCLUDED.filter_type,
          technology            = EXCLUDED.technology,
          equipment_applications = EXCLUDED.equipment_applications,
          oem_codes             = EXCLUDED.oem_codes,
          competitor_codes      = EXCLUDED.competitor_codes,
          installation_type     = EXCLUDED.installation_type,
          micron_rating         = EXCLUDED.micron_rating,
          duty                  = EXCLUDED.duty
      `;

      const values = [
        sku,
        technology,
        JSON.stringify(equipment_applications),
        JSON.stringify(oem_codes),
        JSON.stringify(competitor_codes),
        item.installation_type || item.installationType || null,
        item.micron_rating     || item.micronRating     || null,
        item.duty              || null
      ];

      const res = await client.query(sql, values);
      if (res.rowCount > 0) {
        // ON CONFLICT UPDATE always returns rowCount=1; track via xmax
        inserted++;
      }
    }

    // Count after
    const after = await client.query(
      "SELECT COUNT(*) FROM elimfilters_catalog WHERE filter_type = 'Air Filter'"
    );
    console.log(`After:  ${after.rows[0].count} Air Filter rows in elimfilters_catalog`);
    console.log(`Processed ${items.length} items (inserted/updated).`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
