const { Client } = require("pg");

(async () => {

const db = new Client({
  connectionString: process.env.DATABASE_URL
});

await db.connect();

const sql = `
SELECT
COUNT(*) FILTER (
WHERE oem_codes IS NULL
OR jsonb_array_length(oem_codes)=0
) AS sin_oem,

COUNT(*) FILTER (
WHERE competitor_codes IS NULL
OR jsonb_array_length(competitor_codes)=0
) AS sin_competidor,

COUNT(*) FILTER (
WHERE equipment_applications IS NULL
OR jsonb_array_length(equipment_applications)=0
) AS sin_equipo,

COUNT(*) AS total

FROM elimfilters_catalog;
`;

const r = await db.query(sql);

console.table(r.rows);

await db.end();

})().catch(err=>{
console.error(err);
process.exit(1);
});
