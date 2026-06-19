const fs = require("fs");

const file = "C:\\mann\\mann_ld_elimfilters.jsonl";

const counts = {};

for (const line of fs.readFileSync(file,"utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const seg = p.segment || p.filter_type || "UNKNOWN";

  counts[seg] = (counts[seg] || 0) + 1;
}

console.log(counts);
