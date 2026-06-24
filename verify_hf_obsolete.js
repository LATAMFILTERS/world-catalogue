const fs = require("fs");
const obsolete = fs.readFileSync(
  "hf_obsolete_confirmed.txt",
  "utf8"
).split(/\r?\n/).filter(Boolean);

console.log("OBSOLETOS:", obsolete.length);
console.log(obsolete);
