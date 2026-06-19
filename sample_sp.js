const fs = require("fs");

let shown = 0;

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const sku = (p.sku || "").toUpperCase();

  if (!/^SP/.test(sku))
    continue;

  console.log("SKU:", p.sku);
  console.log("DESC:", p.description?.substring(0,250));
  console.log("");

  shown++;

  if (shown >= 20)
    break;
}
