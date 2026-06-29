const fs = require('fs');

const elimLines = fs.readFileSync('C:\\mann\\mann_ld_elimfilters.jsonl', 'utf8').split('\n').filter(Boolean)
  .map(l => JSON.parse(l));

// Check what keys hold fitment
const sample = elimLines.slice(0, 5);
sample.forEach(r => {
  console.log('SKU:', r.elim_sku);
  console.log('  fitment_count:', r.fitment_count);
  console.log('  fitment type:', typeof r.fitment);
  if (r.fitment) {
    if (typeof r.fitment === 'string') {
      console.log('  fitment (string):', r.fitment.substring(0, 200));
    } else if (Array.isArray(r.fitment)) {
      console.log('  fitment (array len):', r.fitment.length);
      if (r.fitment.length > 0) console.log('  fitment[0]:', JSON.stringify(r.fitment[0]));
    } else {
      console.log('  fitment (obj):', JSON.stringify(r.fitment).substring(0, 200));
    }
  }
  console.log('  engine_year:', JSON.stringify(r.engine_year || null).substring(0, 200));
  console.log('  All keys:', Object.keys(r).join(', '));
  console.log();
});

// Find a record with actual fitment
const withFit = elimLines.find(r => r.fitment_count > 50);
if (withFit) {
  console.log('\n=== HIGH FITMENT SAMPLE ===');
  console.log('SKU:', withFit.elim_sku, '| fitment_count:', withFit.fitment_count);
  console.log('fitment type:', typeof withFit.fitment);
  if (withFit.engine_year) console.log('engine_year sample:', JSON.stringify(withFit.engine_year).substring(0, 500));
}

// Check engine_year structure
const withEngYear = elimLines.find(r => r.engine_year && typeof r.engine_year === 'object');
if (withEngYear) {
  console.log('\n=== ENGINE_YEAR SAMPLE ===');
  console.log('SKU:', withEngYear.elim_sku);
  console.log('engine_year:', JSON.stringify(withEngYear.engine_year).substring(0, 800));
}

// Also check source_sku / base_code join keys
const elimBaseCodes = new Set(elimLines.map(r => r.base_code).filter(Boolean));
const elimSourceSkus = new Set(elimLines.map(r => r.source_sku || r.base_code).filter(Boolean));
console.log('\nBase codes sample:', [...elimBaseCodes].slice(0, 10).join(', '));
