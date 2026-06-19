const fs = require("fs");

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  if (p.sku !== "SP1034/4")
    continue;

  console.log(Object.keys(p));

  console.log(JSON.stringify(p,null,2));

  break;
}
