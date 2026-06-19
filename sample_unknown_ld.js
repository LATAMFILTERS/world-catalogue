const fs = require("fs");

let shown = 0;

for (const line of fs.readFileSync("C:\\mann\\mann_ld_master.jsonl","utf8").split(/\r?\n/).filter(Boolean)) {

  const p = JSON.parse(line);

  const t = p.filter_type || "UNKNOWN";

  if (t !== "UNKNOWN")
    continue;

  console.log(JSON.stringify(p,null,2));
  console.log("================================");

  shown++;

  if (shown >= 10)
    break;
}
