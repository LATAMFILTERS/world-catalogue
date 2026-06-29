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

const specs = fs.readFileSync('external_specs_ld.csv', 'utf8').split('\n').slice(1).filter(Boolean);
const apps  = fs.readFileSync('external_vehicle_applications_ld.csv', 'utf8').split('\n').slice(1).filter(Boolean);
const oemRefs  = fs.readFileSync('oem_cross_references_external_ld.csv', 'utf8').split('\n').slice(1).filter(Boolean);
const compRefs = fs.readFileSync('external_cross_reference_master_ld.csv', 'utf8').split('\n').slice(1).filter(Boolean);

// Unique SKUs per segment from specs
const skusBySegment = {};
const uniqueSkus = new Set();
specs.forEach(line => {
  const p = parseCSV(line);
  const sku = p[0]; const seg = p[2];
  uniqueSkus.add(sku);
  if (!skusBySegment[seg]) skusBySegment[seg] = new Set();
  skusBySegment[seg].add(sku);
});
console.log('SPECS: Unique SKUs:', uniqueSkus.size);
Object.entries(skusBySegment).forEach(([seg, skus]) => console.log(' ', seg + ':', skus.size));

// Apps
const appSkus = new Set(apps.map(l => parseCSV(l)[0]));
const appSegments = {};
apps.forEach(l => {
  const p = parseCSV(l);
  appSegments[p[2]] = (appSegments[p[2]] || 0) + 1;
});
console.log('\nAPPS rows:', apps.length, '| SKUs with apps:', appSkus.size);
Object.entries(appSegments).forEach(([s, c]) => console.log(' ', s, ':', c));

// Makes
const makes = new Set(apps.map(l => parseCSV(l)[3]));
console.log('\nVehicle makes:', makes.size);

// OEM refs
const oemSkus = new Set(oemRefs.map(l => parseCSV(l)[0]));
console.log('\nOEM refs rows:', oemRefs.length, '| SKUs:', oemSkus.size);

// Competitor refs  
const compSkus = new Set(compRefs.map(l => parseCSV(l)[0]));
console.log('Comp refs rows:', compRefs.length, '| SKUs:', compSkus.size);

// Brands in competitor refs
const compBrands = {};
compRefs.forEach(l => {
  const p = parseCSV(l);
  compBrands[p[3]] = (compBrands[p[3]] || 0) + 1;
});
const topBrands = Object.entries(compBrands).sort((a,b) => b[1]-a[1]).slice(0, 15);
console.log('\nTop competitor brands:', JSON.stringify(topBrands));
