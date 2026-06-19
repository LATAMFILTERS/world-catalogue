const fs = require("fs");

const input = "C:\\mann\\mann_master_gaps.jsonl";
const output = "C:\\mann\\mann_hd_candidates.jsonl";

const HD = [
"CATERPILLAR","JOHN DEERE","NEW HOLLAND","CASE",
"CLAAS","KOMATSU","JCB","VOLVO","LIEBHERR",
"BOBCAT","BOMAG","THERMO KING","CUMMINS",
"MANITOU","KOBELCO","YANMAR","TAKEUCHI",
"DOOSAN","INGERSOLL","HITACHI","MERCEDES",
"MAN ","SCANIA","DAF","KENWORTH",
"FREIGHTLINER","INTERNATIONAL","IVECO",
"RENAULT TRUCKS","VOLVO TRUCKS","ASTRA",
"NEOPLAN","VAN HOOL","SOLARIS","VDL BUS"
];

let count = 0;
const out = [];

for (const line of fs.readFileSync(input,"utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  let isHD = false;

  for (const f of (p.fitment || [])) {

    const make = (f.make || "").toUpperCase();

    if (HD.some(x => make.includes(x))) {
      isHD = true;
      break;
    }
  }

  if (!isHD) continue;

  out.push(JSON.stringify(p));
  count++;
}

fs.writeFileSync(output,out.join("\n"));

console.log("HD candidates =", count);
