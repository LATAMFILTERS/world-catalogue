const fs = require("fs");

const out = [];

for (const file of [
  "C:\\mann\\mann_hd_candidates.jsonl",
  "C:\\mann\\mann_hd_hydraulic.jsonl"
]) {

  for (const line of fs.readFileSync(file,"utf8").split(/\r?\n/).filter(Boolean)) {
    out.push(line);
  }
}

fs.writeFileSync(
  "C:\\mann\\mann_hd_universe.jsonl",
  out.join("\n")
);

console.log("HD UNIVERSE =", out.length);
