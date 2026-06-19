const fs = require("fs");

const codes = fs.readFileSync(
  "fleetguard_first100.txt",
  "utf8"
).split(/\r?\n/).filter(Boolean);

const obsoleteHints = [];

for (const c of codes) {
  if (/^AF1\d{3}/.test(c)) obsoleteHints.push(c);
}

console.log("POSIBLES OBSOLETOS:");
console.log(obsoleteHints.join("\n"));
console.log("\nTOTAL:", obsoleteHints.length);
