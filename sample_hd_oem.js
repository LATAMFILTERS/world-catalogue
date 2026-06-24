const fs = require("fs");

const file = "C:\\mann\\mann_master_gaps.jsonl";

let shown = 0;

for (const line of fs.readFileSync(file,"utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const oe = p.oe_numbers || {};

  if (!Object.keys(oe).length)
    continue;

  console.log("SKU:", p.sku);
  console.log("OEM:", JSON.stringify(oe));

  console.log("");

  shown++;

  if (shown >= 20)
    break;
}
