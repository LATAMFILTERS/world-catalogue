const data = require("./duplicates_detailed.json");
const fs = require("fs");

const deleteList = data
  .filter(x =>
    x.oem === 0 &&
    x.cross === 0 &&
    x.equip === 0
  )
  .map(x => x.sku);

fs.writeFileSync(
  "safe_delete_duplicates.json",
  JSON.stringify(deleteList,null,2)
);

console.log("SKUS A BORRAR:", deleteList.length);
