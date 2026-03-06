const { MongoClient } = require('mongodb');
require('dotenv').config();
async function main() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ELIMFILTERS_DB');
    const total = await db.collection('unified_filters').countDocuments({ elimfiltersSKU: /^EL8/ });
    const sinAltura = await db.collection('unified_filters').countDocuments({ elimfiltersSKU: /^EL8/, 'specifications.height_mm': '' });
    const conAltura = await db.collection('unified_filters').countDocuments({ elimfiltersSKU: /^EL8/, 'specifications.height_mm': { $ne: '' } });
    console.log('Total EL8:', total);
    console.log('Con height_mm:', conAltura);
    console.log('Sin height_mm (solo height_in):', sinAltura);
    await client.close();
}
main().catch(console.error);