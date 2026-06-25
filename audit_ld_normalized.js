const fs = require("fs");

const counts = {};

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  let t = p.filter_type || "UNKNOWN";

  if (t === "Luftfilter")
    t = "Air Filter";

  if (t === "Innenraumfilter")
    t = "Cabin Filter";

  if (t === "Kraftstofffilter")
    t = "Fuel Filter";

  counts[t] = (counts[t] || 0) + 1;
}

console.log(counts);
