const fs = require("fs");

const file = "C:\\mann\\mann_master_gaps.jsonl";

const HD = [
"CATERPILLAR","JOHN DEERE","NEW HOLLAND","CASE","CLAAS",
"KOMATSU","JCB","VOLVO","LIEBHERR","BOBCAT","BOMAG",
"THERMO KING","CUMMINS","MANITOU","KOBELCO","YANMAR",
"TAKEUCHI","DOOSAN","INGERSOLL","HITACHI","MERCEDES",
"MAN ","SCANIA","DAF","KENWORTH","FREIGHTLINER",
"INTERNATIONAL","IVECO","RENAULT TRUCKS","VOLVO TRUCKS",
"ASTRA","NEOPLAN","VAN HOOL","SOLARIS","VDL BUS"
];

let hdWithOE = 0;
let hdWithoutOE = 0;

for (const line of fs.readFileSync(file,"utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  let isHD = false;

  for (const f of (p.fitment || [])) {

    const make = (f.make || "").toUpperCase();

    if (HD.some(x => make.includes(x))) {
      isHD = true;
      break;
    }
  }

  if (!isHD)
    continue;

  const oe = p.oe_numbers || {};

  if (Object.keys(oe).length)
    hdWithOE++;
  else
    hdWithoutOE++;
}

console.log({
  hdWithOE,
  hdWithoutOE
});
