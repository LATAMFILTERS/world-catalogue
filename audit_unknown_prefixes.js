const fs = require("fs");

const counts = {};

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  if ((p.filter_type || "") !== "UNKNOWN")
    continue;

  const sku = p.sku || "";

  const prefix = sku.replace(/[0-9].*$/,"");

  counts[prefix] = (counts[prefix] || 0) + 1;
}

Object.entries(counts)
.sort((a,b)=>b[1]-a[1])
.slice(0,50)
.forEach(([k,v])=>console.log(v.toString().padStart(6),k));
