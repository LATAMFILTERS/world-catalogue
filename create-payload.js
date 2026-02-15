const fs = require('fs');

console.log('🔧 Creating clean payload with Node.js...\n');

// Read CSV as string
const csv = fs.readFileSync('../ELIMFILTERS_BACKEND/tabula-donaldson Cross Ref.csv', 'utf8');

// Split into lines
const lines = csv.split(/\r?\n/);
console.log(`📊 Total lines: ${lines.length}`);
console.log(`📋 Line 3: ${lines[2].substring(0, 80)}...`);

// Create payload
const payload = { lines: lines };

// Write JSON
fs.writeFileSync('../ELIMFILTERS_BACKEND/payload-node.json', JSON.stringify(payload), 'utf8');

console.log('\n✅ payload-node.json created');

// Verify
const test = JSON.parse(fs.readFileSync('../ELIMFILTERS_BACKEND/payload-node.json', 'utf8'));
console.log(`\n✓ Verified: ${test.lines.length} lines`);
console.log(`✓ Line 3 is string: ${typeof test.lines[2] === 'string'}`);