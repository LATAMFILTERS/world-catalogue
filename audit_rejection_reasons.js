const fs = require("fs");

const file = "C:\\mann\\mann_master_gaps.jsonl";

let withOEM = 0;
let withoutOEM = 0;

const types = {};

for (const line of fs.readFileSync(file,"utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const hasOEM =
    p.oe_numbers &&
    Object.keys(p.oe_numbers).length > 0;

  if (hasOEM)
    withOEM++;
  else
    withoutOEM++;

  const t = p.filter_type || "UNKNOWN";

  types[t] = (types[t] || 0) + 1;
}

console.log({
  withOEM,
  withoutOEM
});

console.log(types);
