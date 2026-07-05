const fs = require("fs");
const { Client } = require("pg");

(async () => {

const db = new Client({
  connectionString: process.env.DATABASE_URL
});

await db.connect();

const sql = `
SELECT
    c.sku,
    c.duty,
    c.filter_type,
    c.codigo_base
FROM elimfilters_catalog c
WHERE NOT EXISTS (
    SELECT 1
    FROM oem_codes o
    WHERE o.catalog_id = c.id
)
ORDER BY
    c.duty,
    c.filter_type,
    c.sku;
`;

const r = await db.query(sql);

const csv =
[
"sku,duty,filter_type,codigo_base",
...r.rows.map(x=>`${x.sku},${x.duty},${x.filter_type},${x.codigo_base}`)
].join("\n");

fs.writeFileSync("missing_oem.csv",csv);

console.log("");
console.log("======================================");
console.log("TOTAL SIN OEM:",r.rows.length);
console.log("CSV: missing_oem.csv");
console.log("======================================");

await db.end();

})().catch(err=>{
console.error(err);
process.exit(1);
});
