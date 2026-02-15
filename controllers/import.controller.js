const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function importCrossReferences(req, res) {
  let csvData;
  
  if (req.body.csvData) {
    csvData = typeof req.body.csvData === 'string' 
      ? req.body.csvData 
      : JSON.stringify(req.body.csvData);
  } else {
    return res.status(400).json({ error: 'No CSV data provided' });
  }

  let client;
  const crossRefs = [];
  let processed = 0;
  let updated = 0;
  let notFound = 0;

  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('ELIMFILTERS_DB');
    const collection = db.collection('unified_filters');

    const lines = csvData.split('\n');
    console.log(`📊 Total lines in CSV: ${lines.length}`);
    
    // Skip headers (first 2 lines)
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      if (!line || !line.trim()) continue;

      // FIXED REGEX: Match pattern like "00642050......... M065030 ..... FWD"
      const regex = /(\d+)[\.\s]+([A-Z0-9]+)\s+[\.\s]+([A-Z]+)/gi;
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

    console.log(`✅ Extracted ${crossRefs.length} cross-references from ${lines.length} lines`);

    if (crossRefs.length === 0) {
      return res.json({
        success: false,
        error: 'No cross-references extracted',
        linesProcessed: lines.length,
        message: 'Check CSV format'
      });
    }

    // Update existing records in MongoDB
    for (const ref of crossRefs) {
      processed++;
      
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
      
      if (processed % 100 === 0) {
        console.log(`Progress: ${processed}/${crossRefs.length}`);
      }
    }

    res.json({
      success: true,
      totalCrossRefs: crossRefs.length,
      processed,
      updated,
      notFound,
      message: `Updated ${updated} filters, ${notFound} not found in catalog`
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    res.status(500).json({ 
      error: 'Import failed', 
      message: error.message 
    });
  } finally {
    if (client) await client.close();
  }
}

module.exports = importCrossReferences;