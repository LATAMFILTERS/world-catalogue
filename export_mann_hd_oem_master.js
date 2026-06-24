const fs = require("fs");

const input = "C:\\mann\\mann_hd_candidates.jsonl";
const output = "C:\\mann\\mann_hd_oem_master.csv";

const rows = [];

rows.push("mann_sku,oem_brand,oem_code");

for (const line of fs.readFileSync(input,"utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const oe = p.oe_numbers || {};

  for (const brand of Object.keys(oe)) {

    for (const code of oe[brand]) {

      rows.push([
        p.sku,
        `"${brand.replace(/"/g,'""')}"`,
        `"${String(code).replace(/"/g,'""')}"`
      ].join(","));
    }
  }
}

fs.writeFileSync(output, rows.join("\n"));

console.log("CSV generado");
console.log(output);
