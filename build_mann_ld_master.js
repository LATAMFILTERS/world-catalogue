const fs = require("fs");

const ld = new Set();

for (const line of fs.readFileSync("C:\\mann\\mann_catalog_ld.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {
  ld.add(JSON.parse(line).sku);
}

const out = [];

for (const file of [
  "C:\\mann\\mann_master.jsonl",
  "C:\\mann\\mann_master_gaps.jsonl"
]) {

  for (const line of fs.readFileSync(file,"utf8").split(/\r?\n/).filter(Boolean)) {

    const p = JSON.parse(line);

    if (ld.has(p.sku))
      out.push(JSON.stringify(p));
  }
}

fs.writeFileSync(
  "C:\\mann\\mann_ld_master.jsonl",
  out.join("\n")
);

console.log("LD MASTER =", out.length);
