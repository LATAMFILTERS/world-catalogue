const fs = require("fs");

const file = "C:\\mann\\mann_hd_oem_master.csv";

const oems = new Set();

const lines = fs.readFileSync(file,"utf8")
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean);

for (const line of lines) {

  const parts = line.split(",");

  const oem = parts[2]
    .replace(/"/g,"")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g,"");

  if (oem)
    oems.add(oem);
}

console.log("OEM únicos =", oems.size);
