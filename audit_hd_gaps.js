const fs = require("fs");

const file = "C:\\mann\\mann_master_gaps.jsonl";

let hd = 0;

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
  "HITACHI"
];

const lines = fs.readFileSync(file,"utf8")
  .split(/\r?\n/)
  .filter(Boolean);

for (const line of lines) {

  const p = JSON.parse(line);

  const fitment = p.fitment || [];

  let found = false;

  for (const f of fitment) {

    const make = (f.make || "").toUpperCase();

    if (HD.some(x => make.includes(x))) {
      found = true;
      break;
    }
  }

  if (found)
    hd++;
}

console.log("HD GAPS =", hd);
console.log("TOTAL GAPS =", lines.length);
