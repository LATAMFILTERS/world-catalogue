const fs = require("fs");

let withOEM = 0;
let withoutOEM = 0;

for (const line of fs.readFileSync("C:\\mann\\mann_catalog_ld.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const oe = p.oe_numbers || {};

  if (Object.keys(oe).length)
    withOEM++;
  else
    withoutOEM++;
}

console.log({withOEM,withoutOEM});
