const fs = require("fs");

const files = [
  "C:\\mann\\mann_skus.json",
  "C:\\mann\\mann_classified.jsonl",
  "C:\\mann\\mann_enriched.jsonl",
  "C:\\mann\\mann_master.jsonl",
  "C:\\mann\\mann_master_gaps.jsonl",
  "C:\\mann\\mann_ld_elimfilters.jsonl",
  "C:\\mann\\mann_catalog_ld.jsonl"
];

for (const file of files) {

  if (!fs.existsSync(file)) {
    console.log(file, "NO EXISTE");
    continue;
  }

  const txt = fs.readFileSync(file, "utf8").trim();

  let count = 0;

  if (file.endsWith(".jsonl")) {
      count = txt
        ? txt.split("\n").filter(Boolean).length
        : 0;
  } else {
      const data = JSON.parse(txt);

      count = Array.isArray(data)
          ? data.length
          : Object.keys(data).length;
  }

  console.log(file, count);
}
