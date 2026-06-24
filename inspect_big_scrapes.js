const fs = require("fs");

const files = [
"C:\\Users\\VICTOR ABREU\\Desktop\\world-catalogue\\scrape_reports\\fram-api-catalog.json",
"C:\\Users\\VICTOR ABREU\\Desktop\\world-catalogue\\scrape_reports\\airfilter-crossrefs-2026-04-06T17-24-46.json",
"C:\\Users\\VICTOR ABREU\\Desktop\\world-catalogue\\scrape_reports\\oilfilter-crossrefs-2026-04-07T06-51-07.json",
"C:\\Users\\VICTOR ABREU\\Desktop\\world-catalogue\\scrape_reports\\fuelfilter-crossrefs-2026-04-06T15-53-43.json",
"C:\\Users\\VICTOR ABREU\\Desktop\\world-catalogue\\scrape_reports\\elimfilters-catalog-2026-04-06_09-28-05.json"
];

for(const f of files){

  try{

    const data = JSON.parse(fs.readFileSync(f,"utf8"));

    let count = 0;

    if(Array.isArray(data)) count = data.length;
    else if(Array.isArray(data.products)) count = data.products.length;
    else if(Array.isArray(data.items)) count = data.items.length;
    else count = Object.keys(data).length;

    console.log("\n",f);
    console.log("COUNT =",count);

  }catch(e){
    console.log("\n",f);
    console.log("ERROR");
  }
}
