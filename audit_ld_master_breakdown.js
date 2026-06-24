const fs = require("fs");

const counts = {};

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const t = p.filter_type || "UNKNOWN";

  counts[t] = (counts[t] || 0) + 1;
}

console.log(counts);
