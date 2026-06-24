const fs = require("fs");

const codes = fs.readFileSync(
  "fleetguard_empty_unique.txt",
  "utf8"
).split(/\r?\n/).filter(Boolean);

const sample = codes.slice(0,100);

fs.writeFileSync(
  "fleetguard_first100.txt",
  sample.join("\n")
);

console.log("CREADOS:", sample.length);
