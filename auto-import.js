const fs = require('fs');
const path = require('path');

const CSV_DIR = 'C:\\Users\\VICTOR ABREU\\Desktop\\ELIMFILTERS_BACKEND';
const API_URL = 'https://world-catalogue-production.up.railway.app/api/import/crossref';

async function importCSV(csvPath) {
  const fileName = path.basename(csvPath);
  console.log(`\n📄 Processing: ${fileName}`);
  
  try {
    const csv = fs.readFileSync(csvPath, 'utf8');
    const lines = csv.split(/\r?\n/);
    
    console.log(`   Lines: ${lines.length}`);
    
    const payload = { lines };
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log(`   ✅ Cross-refs: ${result.totalCrossRefs || 0}`);
    console.log(`   ✅ Updated: ${result.updated || 0}`);
    console.log(`   ⚠️  Not found: ${result.notFound || 0}`);
    
    return { fileName, ...result };
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { fileName, error: error.message };
  }
}

async function main() {
  console.log('🚀 AUTO-IMPORT CROSS-REFERENCES\n');
  
  // Find all CSV files starting with "tabula-"
  const files = fs.readdirSync(CSV_DIR)
    .filter(f => f.startsWith('tabula-') && f.endsWith('.csv'))
    .map(f => path.join(CSV_DIR, f));
  
  console.log(`📊 Found ${files.length} CSV files\n`);
  
  const results = [];
  
  for (const file of files) {
    const result = await importCSV(file);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between requests
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  
  const totalUpdated = results.reduce((sum, r) => sum + (r.updated || 0), 0);
  const totalCrossRefs = results.reduce((sum, r) => sum + (r.totalCrossRefs || 0), 0);
  
  console.log(`\nTotal files processed: ${results.length}`);
  console.log(`Total cross-refs extracted: ${totalCrossRefs}`);
  console.log(`Total filters updated: ${totalUpdated}`);
  
  console.log('\n📋 Details:');
  results.forEach(r => {
    if (r.error) {
      console.log(`   ❌ ${r.fileName}: ${r.error}`);
    } else {
      console.log(`   ✅ ${r.fileName}: ${r.updated} updated`);
    }
  });
  
  // Save report
  fs.writeFileSync('import-report.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Report saved: import-report.json');
}

main().catch(console.error);