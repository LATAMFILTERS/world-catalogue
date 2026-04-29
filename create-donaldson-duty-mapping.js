const fs = require("fs");

const donaldsonProducts = [
  { part: "P169071", dbl: "DBL0832", type: "LUBE FILTER, SPIN-ON FULL FLOW", oem: ["Mack", "New Flyer"] },
  { part: "P173489", dbl: "DBL3998", type: "LUBE FILTER, SPIN-ON FULL FLOW DONALDSON BLUE", oem: ["Big A", "Mack", "Leyland-DAF"] },
  { part: "P502007", dbl: "DBL4560", type: "LUBE FILTER, SPIN-ON FULL FLOW", oem: [] },
  { part: "P502008", dbl: "DBL7300", type: "LUBE FILTER, SPIN-ON COMBINATION", oem: [] },
  { part: "P502009", dbl: "DBL7345", type: "LUBE FILTER, SPIN-ON FULL FLOW", oem: [] },
  { part: "P502015", dbl: "DBL7349", type: "LUBE FILTER, SPIN-ON FULL FLOW", oem: [] },
];

// Clasificar duty por OEM + tipo
function classifyDuty(product) {
  const heavyDutyOEMs = ["Mack", "Volvo", "Navistar", "Detroit", "CAT", "Cummins"];
  const isHD = heavyDutyOEMs.some(oem => product.oem.includes(oem)) || 
              product.type.includes("COMBINATION") ||
              product.dbl.match(/DBL[34]/); // DBL3xxx, DBL4xxx = HD

  return isHD ? "HD" : "LD";
}

const mapping = {
  timestamp: new Date().toISOString(),
  source: "Donaldson Catalog (manual classification)",
  products: donaldsonProducts.map(p => ({
    part_number: p.part,
    dbl: p.dbl,
    type: p.type,
    duty: classifyDuty(p),
    oem: p.oem,
  }))
};

fs.writeFileSync("donaldson_duty_classified.json", JSON.stringify(mapping, null, 2));
console.log("✅ Classification: donaldson_duty_classified.json");
console.log(JSON.stringify(mapping, null, 2));