const fs = require("fs");

let hyd = 0;

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  if ((p.filter_type || "") === "Hydraulic Filter")
    hyd++;
}

console.log("HYDRAULIC IN LD =", hyd);
