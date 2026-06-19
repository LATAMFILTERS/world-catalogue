const fs = require("fs");

const out = [];

for (const line of fs.readFileSync("C:\\mann\\mann_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  if ((p.filter_type || "") === "Hydraulic Filter")
    out.push(JSON.stringify(p));
}

for (const line of fs.readFileSync("C:\\mann\\mann_master_gaps.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  if ((p.filter_type || "") === "Hydraulic Filter")
    out.push(JSON.stringify(p));
}

fs.writeFileSync(
  "C:\\mann\\mann_hd_hydraulic.jsonl",
  out.join("\n")
);

console.log("HYDRAULIC =", out.length);
