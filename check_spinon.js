require('dotenv').config();
const { MongoClient } = require('mongodb');
async function main() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ELIMFILTERS_DB');
    
    // Ver todos los valores únicos de installationType
    const tipos = await db.collection('unified_filters').aggregate([
        { $group: { 
            _id: { instalacion: "$installationType", prefijo: "$prefix", tipo: "$filterType" }, 
            total: { $sum: 1 },
            ejemplo: { $first: "$elimfiltersSKU" }
        }},
        { $sort: { total: -1 } }
    ]).toArray();
    
    tipos.forEach(t => console.log(
        `Instalación: ${t._id.instalacion} | Prefijo: ${t._id.prefijo} | Tipo: ${t._id.tipo} | Total: ${t.total} | Ejemplo: ${t.ejemplo}`
    ));
    
    await client.close();
}
main().catch(console.error);