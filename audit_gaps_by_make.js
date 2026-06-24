const fs = require("fs");

const file = "C:\\mann\\mann_master_gaps.jsonl";

const counts = {};

const lines = fs.readFileSync(file,"utf8")
  .split(/\r?\n/)
  .filter(Boolean);

for (const line of lines) {

  const p = JSON.parse(line);

  if (!Array.isArray(p.fitment))
    continue;

  for (const f of p.fitment) {

    const make = (f.make || "UNKNOWN").trim();

    counts[make] = (counts[make] || 0) + 1;
  }
}

Object.entries(counts)
  .sort((a,b) => b[1] - a[1])
  .slice(0,100)
  .forEach(([make,count]) => {
    console.log(
      count.toString().padStart(6),
      make
    );
  });
