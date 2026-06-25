const fs = require("fs");

const ld = new Set();

for (const line of fs.readFileSync("C:\\mann\\mann_catalog_ld.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {
  ld.add(JSON.parse(line).sku);
}

const master = new Set();

for (const line of fs.readFileSync("C:\\mann\\mann_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {
  master.add(JSON.parse(line).sku);
}

const gaps = new Set();

for (const line of fs.readFileSync("C:\\mann\\mann_master_gaps.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {
  gaps.add(JSON.parse(line).sku);
}

let inMaster = 0;
let inGaps = 0;
let missing = 0;

for (const sku of ld) {

  if (master.has(sku)) {
    inMaster++;
    continue;
  }

  if (gaps.has(sku)) {
    inGaps++;
    continue;
  }

  missing++;
}

console.log({
  ld_total: ld.size,
  found_in_master: inMaster,
  found_in_gaps: inGaps,
  missing
});
