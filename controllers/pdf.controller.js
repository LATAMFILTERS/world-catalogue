const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');

const MONGODB_URI = process.env.MONGODB_URI;
const PDF_DIR = path.join(__dirname, '../pdfs');

async function processPDF(req, res) {
  const { filename } = req.body;
  
  if (!filename) {
    return res.status(400).json({ error: 'Filename required' });
  }

  let client;
  
  try {
    const pdfPath = path.join(PDF_DIR, filename);
    
    // Check if file exists
    try {
      await fs.access(pdfPath);
    } catch {
      return res.status(404).json({ error: `PDF not found: ${filename}` });
    }

    console.log(`📄 Processing: ${filename}`);
    
    // Read PDF
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    
    console.log(`📊 Pages: ${data.numpages}`);
    console.log(`📝 Text length: ${data.text.length} chars`);
    
    // Extract cross-references using regex
    const lines = data.text.split('\n');
    const crossRefs = [];
    
    // Pattern for cross-references: PartNumber ... CrossRef ... BRAND
    const regex = /(\d+)[\.\s]+([A-Z0-9]+)\s+[\.\s]+([A-Z]+)/gi;
    
    for (const line of lines) {
      let match;
      while ((match = regex.exec(line)) !== null) {
        const donaldsonPart = match[1];
        const crossRef = match[2];
        const brand = match[3];
        
        if (donaldsonPart && crossRef && brand) {
          crossRefs.push({ donaldsonPart, crossRef, brand });
        }
      }
    }
    
    console.log(`✅ Extracted ${crossRefs.length} cross-references`);
    
    if (crossRefs.length === 0) {
      return res.json({
        success: false,
        filename,
        pages: data.numpages,
        message: 'No cross-references found - might be specs PDF',
        sampleText: data.text.substring(0, 500)
      });
    }

    // Update MongoDB
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('ELIMFILTERS_DB');
    const collection = db.collection('unified_filters');
    
    let updated = 0;
    let notFound = 0;
    
    for (const ref of crossRefs) {
      const filter = {
        $or: [
          { elimfiltersSKU: ref.donaldsonPart },
          { baseCode: ref.donaldsonPart },
          { oemCodes: ref.donaldsonPart }
        ]
      };

      const update = {
        $addToSet: {
          crossReferenceCodes: `${ref.brand}:${ref.crossRef}`
        }
      };

      const result = await collection.updateOne(filter, update);
      if (result.modifiedCount > 0 || result.matchedCount > 0) {
        updated++;
      } else {
        notFound++;
      }
    }
    
    res.json({
      success: true,
      filename,
      pages: data.numpages,
      totalCrossRefs: crossRefs.length,
      updated,
      notFound,
      message: `Processed ${filename}: ${updated} filters updated`
    });

  } catch (error) {
    console.error('❌ PDF processing error:', error);
    res.status(500).json({ 
      error: 'PDF processing failed', 
      message: error.message 
    });
  } finally {
    if (client) await client.close();
  }
}

module.exports = processPDF;