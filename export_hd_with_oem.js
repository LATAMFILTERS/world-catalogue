const fs = require("fs");

const out = [];

for (const line of fs.readFileSync("C:\\mann\\mann_hd_universe.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const oe = p.oe_numbers || {};

  if (Object.keys(oe).length)
    out.push(line);
}

fs.writeFileSync(
  "C:\\mann\\mann_hd_with_oem.jsonl",
  out.join("\n")
);

console.log("HD WITH OEM =", out.length);
