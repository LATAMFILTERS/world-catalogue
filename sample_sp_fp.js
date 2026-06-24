const fs = require("fs");

let found = 0;

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const sku = (p.sku || "").toUpperCase();

  if (!/^(SP|FP)/.test(sku))
    continue;

  console.log("SKU:", p.sku);
  console.log("DESC:", p.description?.substring(0,250));
  console.log("TYPE:", p.filter_type);
  console.log("================================");

  found++;

  if (found >= 20)
    break;
}
