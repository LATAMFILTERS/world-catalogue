const fs = require('fs');

const records = fs.readFileSync('scripts/mann_ld_import_ready.jsonl', 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l));

// Check makes quality
const allMakes = new Set(records.flatMap(r => r.vehicle_makes));
console.log('Total unique makes:', allMakes.size);

// Filter out noise (numbers, single chars, etc.)
const goodMakes = [...allMakes].filter(m => /^[A-Za-z]/.test(m) && m.length > 1);
const noiseMakes = [...allMakes].filter(m => !/^[A-Za-z]/.test(m) || m.length <= 1);
console.log('Good makes:', goodMakes.length);
console.log('Noise makes:', noiseMakes.length, noiseMakes.slice(0, 20).join(', '));

// Sample fitment parsing for a record with high fitment count
const sample = records.find(r => r.vehicle_applications.length > 10);
if (sample) {
  console.log('\nSample SKU:', sample.sku);
  console.log('Fitment count:', sample.vehicle_applications.length);
  console.log('Sample apps:', JSON.stringify(sample.vehicle_applications.slice(0, 3), null, 2));
}

// Check engines
const allEngines = new Set(records.flatMap(r => r.engines));
const goodEngines = [...allEngines].filter(e => e && e.length > 2 && /[A-Za-z\d]/.test(e));
console.log('\nTotal engines:', allEngines.size, '| Good engines:', goodEngines.length);
console.log('Sample engines:', goodEngines.slice(0, 10).join(', '));

// Count by category and dims coverage
console.log('\nCategory breakdown:');
const byType = {};
records.forEach(r => { byType[r.filter_type] = (byType[r.filter_type] || 0) + 1; });
console.log(JSON.stringify(byType));

// OEM/comp coverage
const withOem = records.filter(r => r.oem_codes.length > 0).length;
const withComp = records.filter(r => r.competitor_codes.length > 0).length;
const withApps = records.filter(r => r.vehicle_applications.length > 0).length;
const withDims = records.filter(r => r.outer_diameter_mm !== null || r.height_mm !== null).length;
console.log(`\nWith OEM refs: ${withOem}/${records.length}`);
console.log(`With comp refs: ${withComp}/${records.length}`);
console.log(`With apps: ${withApps}/${records.length}`);
console.log(`With dims: ${withDims}/${records.length}`);
