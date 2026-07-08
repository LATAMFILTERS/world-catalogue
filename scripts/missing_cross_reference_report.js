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
    c.codigo_base,
    c.duty,
    c.filter_type
FROM elimfilters_catalog c
LEFT JOIN cross_reference_master x
    ON x.elimfilters_sku = c.sku
WHERE x.elimfilters_sku IS NULL
ORDER BY
    c.duty,
    c.filter_type,
    c.sku;
`;

const r = await db.query(sql);

const csv = [
"sku,codigo_base,duty,filter_type",
...r.rows.map(x =>
`${x.sku},${x.codigo_base || ""},${x.duty},${x.filter_type}`)
].join("\n");

fs.writeFileSync("missing_cross_reference.csv", csv);

console.log("==================================");
console.log("TOTAL:", r.rows.length);
console.log("Archivo: missing_cross_reference.csv");
console.log("==================================");

await db.end();

})().catch(err=>{
console.error(err);
process.exit(1);
});
