const fs = require("fs");

const file = "C:\\mann\\mann_master_gaps.jsonl";

const counts = {};

const lines = fs.readFileSync(file,"utf8")
  .split(/\r?\n/)
  .filter(Boolean);

for (const line of lines) {

  const p = JSON.parse(line);

  const type = (p.filter_type || "UNKNOWN").trim();

  counts[type] = (counts[type] || 0) + 1;
}

Object.entries(counts)
  .sort((a,b) => b[1] - a[1])
  .forEach(([type,count]) => {
    console.log(
      count.toString().padStart(6),
      type
    );
  });
