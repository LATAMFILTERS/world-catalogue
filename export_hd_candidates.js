const fs = require("fs");

const file = "C:\\mann\\mann_master_gaps.jsonl";

for (const line of fs.readFileSync(file,"utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const oe = p.oe_numbers || {};

  if (!Object.keys(oe).length)
    continue;

  console.log(p.sku);
}
