const { Client } = require('pg');

const dbConfig = {
  host: 'ballast.proxy.rlwy.net',
  port: 18263,
  database: 'railway',
  user: 'postgres',
  password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  client_encoding: 'UTF8',
  ssl: { rejectUnauthorized: false }
};

function parseRefs(arr){
  if(!arr) return [];
  if (typeof arr === 'string') {
    try {
      arr = JSON.parse(arr);
    } catch (e) {
      console.error('Failed to parse refs string:', e.message);
      return [];
    }
  }
  if (!Array.isArray(arr)) {
    console.error('Refs is not an array:', typeof arr, arr);
    return [];
  }
  return arr.map(item => ({
    manufacturer: item.manufacturer || item.brand || 'UNKNOWN',
    code: item.code
  }));
}

function extractText(val, lang = 'en') {
  if (!val) return null;
  if (typeof val === 'object') return val[lang] || val.en || val.es || Object.values(val)[0] || null;
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return p[lang] || p.en || p.es || Object.values(p)[0] || val; } catch { return val; }
  }
  return String(val);
}

function buildFilterData(row, lang = 'en'){
  return {
    elimfilters_sku: row.sku,
    codigo_base: row.codigo_base,
    description: extractText(row.description, lang),
    filter_type: extractText(row.filter_type, lang),
    filter_subtype: row.sub_type || null,
    technology: row.technology || null,
    nominal_efficiency: row.nominal_efficiency || null,
    burst_pressure_psi: row.burst_pressure_psi || null,
    collapse_pressure_psi: row.collapse_pressure_psi || null,
    duty: row.duty || null,
    oem_codes: parseRefs(row.oem_codes),
    competitor_codes: parseRefs(row.competitor_codes),
    equipment_applications: row.equipment_applications || []
  };
}

async function run() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log('Connected to Railway successfully!');

    // 1. Get table columns
    const columnsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'elimfilters_catalog'
    `);
    console.log('\n--- Columns of elimfilters_catalog ---');
    columnsRes.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });

    // 2. Query a row to inspect content
    console.log('\n--- Querying SKU EL82100 ---');
    const rowRes = await client.query(`
      SELECT * FROM elimfilters_catalog WHERE sku = 'EL82100'
    `);
    if (rowRes.rows.length > 0) {
      const row = rowRes.rows[0];
      const rowCopy = { ...row };
      delete rowCopy.equipment_applications; // delete application list to make logs readable
      console.log('Found row (without equipment_applications):', JSON.stringify(rowCopy, null, 2));

      // Test buildFilterData
      console.log('\n--- Testing buildFilterData on EL82100 ---');
      try {
        const filterData = buildFilterData(row, 'es');
        delete filterData.equipment_applications;
        console.log('buildFilterData result (without equipment_applications):', JSON.stringify(filterData, null, 2));
      } catch (err) {
        console.error('buildFilterData failed:', err);
      }
    } else {
      console.log('EL82100 not found in Railway!');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
