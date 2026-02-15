const fs = require('fs').promises;
const path = require('path');
const pdfjsLib = require('pdfjs-dist');

const PDF_DIR = 'C:\\Users\\VICTOR ABREU\\Elimfilters-Orchestrator\\catalogos_pdf';

const PRIORITY_PDFS = [
  'donaldson Cross Ref.pdf',
  'Cross Reference Donaldson.pdf',
  'mann-filter-cross-reference-list-2024-26-interactive.pdf',
  'LT19457D-fleetguard cross reference.pdf',
  'EMAM_Baldwin_Extreme_Performance_Nanofiber_Air_Filter_Cross-Reference_Application_Guide_Form368.pdf'
];

async function analyzePDF(pdfPath) {
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = new Uint8Array(dataBuffer);
    const loadingTask = pdfjsLib.getDocument({ data, standardFontDataUrl: null });
    const pdfDoc = await loadingTask.promise;
    
    const fileName = path.basename(pdfPath);
    const numPages = pdfDoc.numPages;
    
    console.log(`\n📄 ${fileName}`);
    console.log(`   Pages: ${numPages}`);
    
    let hasTable = false;
    let hasCrossRef = false;
    let hasSpecs = false;
    
    for (let i = 1; i <= Math.min(3, numPages); i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ').toLowerCase();
      
      if (text.includes('cross') && text.includes('ref')) hasCrossRef = true;
      if (text.includes('specification') || text.includes('dimensions')) hasSpecs = true;
      if (text.match(/\d+\s+[a-z0-9-]+\s+[a-z0-9-]+/i)) hasTable = true;
    }
    
    const analysis = {
      file: fileName,
      pages: numPages,
      hasTable,
      hasCrossRef,
      hasSpecs,
      recommended: (hasCrossRef || hasSpecs) && numPages < 50
    };
    
    console.log(`   ✓ Cross-Ref: ${hasCrossRef}`);
    console.log(`   ✓ Specs: ${hasSpecs}`);
    console.log(`   ✓ Tables: ${hasTable}`);
    console.log(`   ${analysis.recommended ? '⭐ RECOMMENDED' : '⚠️  Skip (too large or no useful data)'}`);
    
    return analysis;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🔍 ANALYZING PDFs FOR USEFUL DATA...\n');
  
  const results = [];
  
  for (const fileName of PRIORITY_PDFS) {
    const pdfPath = path.join(PDF_DIR, fileName);
    try {
      await fs.access(pdfPath);
      const result = await analyzePDF(pdfPath);
      if (result) results.push(result);
    } catch {
      console.log(`\n⚠️  ${fileName} - NOT FOUND`);
    }
  }
  
  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(60));
  
  const recommended = results.filter(r => r.recommended);
  console.log(`\n⭐ RECOMMENDED FOR PROCESSING (${recommended.length}):`);
  recommended.forEach(r => {
    console.log(`   - ${r.file} (${r.pages} pages)`);
  });
  
  console.log('\n✅ Next step: Extract data from recommended PDFs');
}

main().catch(console.error);
