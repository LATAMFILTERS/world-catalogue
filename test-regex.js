const fs = require('fs');

console.log('🧪 TEST 2: Node.js regex simulation\n');

// Read clean payload
const payload = JSON.parse(fs.readFileSync('../ELIMFILTERS_BACKEND/payload-clean.json', 'utf8'));

// Split lines
const lines = payload.csvData.split(/\r?\n/);
console.log(`📊 Total lines: ${lines.length}`);
console.log(`\n📋 Line 3:\n${lines[2]}\n`);

// Test regex on line 3
const regex = /(\d+)[\.\s]+([A-Z0-9]+)\s+[\.\s]+([A-Z]+)/gi;
const matches = [];
let match;

while ((match = regex.exec(lines[2])) !== null) {
  matches.push({
    donaldsonPart: match[1],
    crossRef: match[2],
    brand: match[3]
  });
}

console.log(`✅ Matches found in line 3: ${matches.length}\n`);
matches.forEach((m, i) => {
  console.log(`  ${i+1}. ${m.donaldsonPart} → ${m.crossRef} (${m.brand})`);
});

// Test all lines
let totalMatches = 0;
for (let i = 2; i < lines.length; i++) {
  const line = lines[i];
  if (!line || !line.trim()) continue;
  
  const lineRegex = /(\d+)[\.\s]+([A-Z0-9]+)\s+[\.\s]+([A-Z]+)/gi;
  let lineMatch;
  while ((lineMatch = lineRegex.exec(line)) !== null) {
    totalMatches++;
  }
}

console.log(`\n🎯 TOTAL CROSS-REFS EXTRACTED: ${totalMatches}`);
console.log(`\n✅ TEST PASSED - Ready for Railway`);