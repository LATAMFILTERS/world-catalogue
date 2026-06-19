const fs = require("fs");

const file = "C:\\mann\\mann_master_gaps.jsonl";

const HD = [
"CATERPILLAR",
"JOHN DEERE",
"NEW HOLLAND",
"CASE",
"CLAAS",
"KOMATSU",
"JCB",
"VOLVO",
"LIEBHERR",
"BOBCAT",
"BOMAG",
"THERMO KING",
"CUMMINS",
"MANITOU",
"KOBELCO",
"YANMAR",
"TAKEUCHI",
"DOOSAN",
"INGERSOLL",
"HITACHI",
"MERCEDES",
"MAN ",
"SCANIA",
"DAF",
"KENWORTH",
"FREIGHTLINER",
"INTERNATIONAL",
"IVECO",
"RENAULT TRUCKS",
"VOLVO TRUCKS",
"ASTRA",
"NEOPLAN",
"VAN HOOL",
"SOLARIS",
"VDL BUS"
];

let hd = 0;

const lines = fs.readFileSync(file,"utf8")
.split(/\r?\n/)
.filter(Boolean);

for (const line of lines) {

  const p = JSON.parse(line);

  let found = false;

  for (const f of (p.fitment || [])) {

    const make = (f.make || "").toUpperCase();

    if (HD.some(x => make.includes(x))) {
      found = true;
      break;
    }
  }

  if (found)
    hd++;
}

console.log("TOTAL HD =", hd);
console.log("TOTAL GAPS =", lines.length);
