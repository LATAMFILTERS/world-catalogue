const fs = require("fs");

const out = [];

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const sku = (p.sku || "").toUpperCase();

  if (/^SP/.test(sku))
    continue;

  if ((p.filter_type || "") === "Hydraulic Filter")
    continue;

  out.push(JSON.stringify(p));
}

fs.writeFileSync(
  "C:\\mann\\mann_ld_ready.jsonl",
  out.join("\n")
);

console.log("LD READY =", out.length);
