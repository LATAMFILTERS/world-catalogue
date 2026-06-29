const fs = require('fs');

function parseCSV(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (const c of line) {
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { result.push(current); current = ''; }
    else current += c;
  }
  result.push(current);
  return result;
}

// Check join between elimfilters.jsonl and vehicle_applications CSV
const elimLines = fs.readFileSync('C:\\mann\\mann_ld_elimfilters.jsonl', 'utf8').split('\n').filter(Boolean)
  .map(l => JSON.parse(l));

const elimSkus = new Set(elimLines.map(r => r.elim_sku));
console.log('Elim SKUs sample:', [...elimSkus].slice(0, 10).join(', '));

const appsFile = fs.readFileSync('external_vehicle_applications_ld.csv', 'utf8').split('\n').filter(Boolean);
const appsHeaders = parseCSV(appsFile[0]);
console.log('Apps headers:', appsHeaders.join(', '));

// Count matches
let matched = 0;
const appSkuSamples = new Set();
for (const line of appsFile.slice(1, 20)) {
  const p = parseCSV(line);
  const obj = {};
  appsHeaders.forEach((h, i) => obj[h] = p[i] || '');
  appSkuSamples.add(obj.elimfilters_sku);
}
console.log('Apps SKU samples:', [...appSkuSamples].join(', '));

// How many app rows match elimfilters SKUs
const allAppLines = appsFile.slice(1).filter(Boolean);
let matchCount = 0;
const matchedSkus = new Set();
for (const line of allAppLines) {
  const p = parseCSV(line);
  const sku = p[0]; // elimfilters_sku is first column
  if (elimSkus.has(sku)) { matchCount++; matchedSkus.add(sku); }
}
console.log('\nTotal app rows:', allAppLines.length);
console.log('App rows matching elim SKUs:', matchCount);
console.log('Matched SKUs count:', matchedSkus.size);
console.log('Matched SKU sample:', [...matchedSkus].slice(0, 10).join(', '));

// Check elim record fitment counts
const withFitment = elimLines.filter(r => r.fitment_count > 0);
console.log('\nElim records with fitment_count > 0:', withFitment.length);
console.log('Sample fitment data:');
const sampleFit = elimLines.find(r => Array.isArray(r.fitment) && r.fitment.length > 0);
if (sampleFit) {
  console.log('SKU:', sampleFit.elim_sku, '| fitment count:', sampleFit.fitment.length);
  console.log('Sample fitment[0]:', JSON.stringify(sampleFit.fitment[0]));
}
