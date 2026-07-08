const { Client } = require("pg");

(async () => {

const db = new Client({
  connectionString: process.env.DATABASE_URL
});

await db.connect();

const sql = `
SELECT
    duty,
    filter_type,

    COUNT(*) total,

    COUNT(*) FILTER (
        WHERE competitor_codes IS NULL
           OR jsonb_array_length(competitor_codes)=0
    ) sin_competidor,

    COUNT(*) FILTER (
        WHERE oem_codes IS NULL
           OR jsonb_array_length(oem_codes)=0
    ) sin_oem

FROM elimfilters_catalog

GROUP BY duty, filter_type

ORDER BY duty, filter_type;
`;

const r = await db.query(sql);

console.table(r.rows);

await db.end();

})();
