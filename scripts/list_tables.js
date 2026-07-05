const { Client } = require("pg");

(async () => {

const db = new Client({
  connectionString: process.env.DATABASE_URL
});

await db.connect();

const r = await db.query(`
SELECT
table_name
FROM information_schema.tables
WHERE table_schema='public'
ORDER BY table_name;
`);

console.table(r.rows);

await db.end();

})().catch(e=>{
console.error(e);
process.exit(1);
});
