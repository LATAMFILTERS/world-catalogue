// Fix corrupted descriptions: remove ™ characters inserted between every letter
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function fixDescription(desc) {
  if (!desc || typeof desc !== 'string') return desc;
  // Remove ™ characters - they were inserted between letters
  return desc.replace(/™/g, '').trim();
}

function fixJsonDescription(desc) {
  if (!desc) return desc;
  // Handle both plain string and JSON object descriptions
  if (typeof desc === 'string') {
    // Try to parse as JSON first
    try {
      const obj = JSON.parse(desc);
      if (obj && typeof obj === 'object') {
        const fixed = {};
        for (const [lang, text] of Object.entries(obj)) {
          fixed[lang] = typeof text === 'string' ? fixDescription(text) : text;
        }
        return JSON.stringify(fixed);
      }
    } catch (e) {
      // Not JSON, treat as plain string
    }
    return fixDescription(desc);
  }
  return desc;
}

async function main() {
  // Count affected rows
  const countRes = await pool.query(`
    SELECT COUNT(*) as total FROM elimfilters_catalog
    WHERE description IS NOT NULL AND description LIKE '%™%'
  `);
  const total = parseInt(countRes.rows[0].total);
  console.log(`Descripciones corruptas encontradas: ${total}`);

  if (total === 0) {
    console.log('Nada que limpiar.');
    await pool.end();
    return;
  }

  // Fetch all corrupted rows
  const rows = await pool.query(`
    SELECT sku, description FROM elimfilters_catalog
    WHERE description IS NOT NULL AND description LIKE '%™%'
  `);

  let fixed = 0;
  let errors = 0;

  for (const row of rows.rows) {
    try {
      const cleaned = fixJsonDescription(row.description);
      if (cleaned !== row.description) {
        await pool.query(
          'UPDATE elimfilters_catalog SET description = $1 WHERE sku = $2',
          [cleaned, row.sku]
        );
        fixed++;
        if (fixed <= 10) {
          const preview = cleaned.substring(0, 80).replace(/\n/g, ' ');
          console.log(`  ${row.sku}: "${preview}..."`);
        }
      }
    } catch (e) {
      console.error(`  ERROR en ${row.sku}: ${e.message}`);
      errors++;
    }
  }

  if (fixed > 10) console.log(`  ... y ${fixed - 10} más`);
  console.log(`\nTotal corregidos: ${fixed}`);
  if (errors > 0) console.log(`Total errores: ${errors}`);

  // Verify
  const verifyRes = await pool.query(`
    SELECT COUNT(*) as remaining FROM elimfilters_catalog
    WHERE description IS NOT NULL AND description LIKE '%™%'
  `);
  console.log(`Restantes con ™: ${verifyRes.rows[0].remaining}`);

  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
