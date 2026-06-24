const fs = require("fs");

const rows = fs.readFileSync("ld_missing_crossrefs.txt","utf8")
  .split(/\r?\n/)
  .filter(Boolean);

const stats = {};

for(const sku of rows){

  const p =
    sku.startsWith("CUK") ? "CUK" :
    sku.startsWith("CU")  ? "CU"  :
    sku.startsWith("FP")  ? "FP"  :
    sku.startsWith("WK")  ? "WK"  :
    sku.startsWith("WDK") ? "WDK" :
    sku.startsWith("HU")  ? "HU"  :
    sku.startsWith("W")   ? "W"   :
    sku.startsWith("H")   ? "H"   :
    sku.startsWith("C")   ? "C"   :
    "OTHER";

  stats[p] = (stats[p] || 0) + 1;
}

console.table(
  Object.entries(stats)
    .sort((a,b)=>b[1]-a[1])
    .map(([family,total])=>({family,total}))
);

