const fs = require("fs");

const codes = fs.readFileSync(
  "fleetguard_empty_unique.txt",
  "utf8"
).split(/\r?\n/).filter(Boolean);

console.log("TOTAL:", codes.length);
console.log("LISTO PARA CLASIFICAR");
