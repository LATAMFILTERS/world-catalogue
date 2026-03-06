require('dotenv').config();
const { MongoClient } = require('mongodb');
async function main() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ELIMFILTERS_DB');
    const prefixes = await db.collection('unified_filters').aggregate([
        { $group: { _id: "$prefix", total: { $sum: 1 }, ejemplo: { $first: "$elimfiltersSKU" }, tipo: { $first: "$filterType" }, instalacion: { $first: "$installationType" } } },
        { $sort: { total: -1 } }
    ]).toArray();
    prefixes.forEach(p => console.log(`Prefijo: ${p._id} | Total: ${p.total} | Tipo: ${p.tipo} | Instalación: ${p.instalacion} | Ejemplo: ${p.ejemplo}`));
    await client.close();
}
main().catch(console.error);