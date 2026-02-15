const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function importCrossReferences(req, res) {
  let csvData;
  
  // Handle different input formats
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
    
    // Skip headers (first 2 lines)
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Extract all cross-references from line
      // Pattern: PartNumber......... CrossRef ..... BRAND
      const regex = /(\d+)[\.\s]+([A-Z0-9]+)\s+[\.\s]+([A-Z]+)/g;
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        const donaldsonPart = match[1].trim();
        const crossRef = match[2].trim();
        const brand = match[3].trim();
        
        if (donaldsonPart && crossRef && brand) {
          crossRefs.push({ donaldsonPart, crossRef, brand });
        }
      }
    }

    console.log(`📊 Extracted ${crossRefs.length} cross-references from CSV`);

    // Update existing records in MongoDB
    for (const ref of crossRefs) {
      processed++;
      
      // Find by Donaldson part number in various fields
      const filter = {
        $or: [
          { elimfiltersSKU: ref.donaldsonPart },
          { baseCode: ref.donaldsonPart },
          { oemCodes: ref.donaldsonPart },
          { crossReferenceCodes: { $regex: ref.donaldsonPart, $options: 'i' } }
        ]
      };

      const update = {
        $addToSet: {
          crossReferenceCodes: `${ref.brand}:${ref.crossRef}`
        }
      };

      const result = await collection.updateOne(filter, update);
      if (result.modifiedCount > 0) {
        updated++;
      } else {
        notFound++;
      }
      
      // Log progress every 100 items
      if (processed % 100 === 0) {
        console.log(`Progress: ${processed}/${crossRefs.length} processed, ${updated} updated`);
      }
    }

    res.json({
      success: true,
      totalCrossRefs: crossRefs.length,
      processed,
      updated,
      notFound,
      message: `Successfully updated ${updated} filters with cross-references`
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
