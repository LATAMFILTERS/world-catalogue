require('dotenv').config();
const { MongoClient } = require('mongodb');
async function main() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ELIMFILTERS_DB');
    const result = await db.collection('unified_filters').aggregate([
        { $group: { 
            _id: "$prefix",
            total: { $sum: 1 },
            tipos: { $addToSet: "$installationType" },
            filterTypes: { $addToSet: "$filterType" }
        }},
        { $sort: { total: -1 } }
    ]).toArray();
    result.forEach(r => console.log(
        `Prefijo: ${r._id} | Total: ${r.total} | Tipos filtro: ${r.filterTypes} | Instalaciones: ${r.tipos}`
    ));
    await client.close();
}
main().catch(console.error);