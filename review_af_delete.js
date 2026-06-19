const fs = require("fs");

const codes = fs.readFileSync(
  "af_old_candidates.txt",
  "utf8"
).split(/\r?\n/).filter(Boolean);

console.log("DELETE CANDIDATES:");
codes.forEach(c => console.log(c));

console.log("\nTOTAL:", codes.length);
