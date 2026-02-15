const { MongoClient } = require('mongodb');
const csv = require('csv-parser');
const { Readable } = require('stream');

const MONGODB_URI = process.env.MONGODB_URI;

async function importCrossReferences(req, res) {
  if (!req.file && !req.body.csvData) {
    return res.status(400).json({ error: 'No CSV file or data provided' });
  }

  let client;
  const results = [];
  const errors = [];

  try {
    // Connect to MongoDB
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('ELIMFILTERS_DB');
    const collection = db.collection('unified_filters');

    // Get CSV data
    const csvData = req.file ? req.file.buffer.toString() : req.body.csvData;
    const stream = Readable.from(csvData);

    // Parse CSV
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Parse cross-references from columns
            const crossRefs = [];
            
            // Process columns (assuming format: BRAND | SKU | BRAND | SKU ...)
            const keys = Object.keys(row);
            for (let i = 0; i < keys.length; i += 2) {
              const brand = row[keys[i]]?.trim();
              const sku = row[keys[i + 1]]?.trim();
              
              if (brand && sku) {
                crossRefs.push({ brand, sku });
              }
            }

            if (crossRefs.length > 0) {
              results.push({ crossRefs });
            }
          } catch (err) {
            errors.push({ row, error: err.message });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Insert into MongoDB
    if (results.length > 0) {
      const insertResult = await collection.insertMany(results);
      
      res.json({
        success: true,
        inserted: insertResult.insertedCount,
        total: results.length,
        errors: errors.length,
        errorDetails: errors.slice(0, 10) // First 10 errors
      });
    } else {
      res.status(400).json({ error: 'No valid data to import' });
    }

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: 'Import failed', 
      message: error.message 
    });
  } finally {
    if (client) await client.close();
  }
}

module.exports = importCrossReferences;
