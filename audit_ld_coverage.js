const fs = require("fs");

const ld = new Set();

for (const line of fs.readFileSync("C:\\mann\\mann_catalog_ld.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {
  const p = JSON.parse(line);
  ld.add(p.sku);
}

let master = 0;
let gaps = 0;
let missing = 0;

for (const sku of ld) {

  let found = false;

  for (const line of fs.readFileSync("C:\\mann\\mann_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

    const p = JSON.parse(line);

    if (p.sku === sku) {
      master++;
      found = true;
      break;
    }
  }

  if (found)
    continue;

  for (const line of fs.readFileSync("C:\\mann\\mann_master_gaps.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

    const p = JSON.parse(line);

    if (p.sku === sku) {
      gaps++;
      found = true;
      break;
    }
  }

  if (!found)
    missing++;
}

console.log({
  ld_total: ld.size,
  found_in_master: master,
  found_in_gaps: gaps,
  missing
});
