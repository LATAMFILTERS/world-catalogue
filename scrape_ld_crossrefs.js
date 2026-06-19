const fs = require("fs");
const { chromium } = require("playwright");

const INPUT = "C:\\mann\\mann_catalog_ld.jsonl";
const OUT_DIR = "C:\\mann\\ld_crossrefs_run";
fs.mkdirSync(OUT_DIR,{recursive:true});

const OUT_CSV = `${OUT_DIR}\\ld_cross_reference_master.csv`;
const CHECKPOINT = `${OUT_DIR}\\checkpoint.json`;
const LOG = `${OUT_DIR}\\scraper.log`;

function log(x){
  const line = `[${new Date().toISOString()}] ${x}`;
  console.log(line);
  fs.appendFileSync(LOG,line+"\n");
}

function siteFor(type){
  type = (type||"").toLowerCase();
  if(type.includes("oil")) return "https://www.oilfilter-crossreference.com/";
  if(type.includes("fuel")) return "https://www.fuelfilter-crossreference.com/";
  if(type.includes("air")) return "https://www.airfilter-crossreference.com/";
  if(type.includes("cabin")) return "https://www.airfilter-crossreference.com/";
  return null;
}

function cleanSku(s){
  return String(s||"").replace("_MANN-FILTER","").trim();
}

function csvEscape(v){
  v = String(v ?? "");
  return `"${v.replace(/"/g,'""')}"`;
}

function parsePairs(text){
  const brands = [
    "MANN","MAHLE","HENGST","BOSCH","FRAM","FILTRON","PURFLUX","UFI","SOFIMA",
    "WIX","NAPA","PUROLATOR","ACDELCO","AC DELCO","CHAMPION","SCT","KNECHT",
    "FEBI","MECAFILTER","CLEAN FILTERS","COOPERS","CROSLAND","TECNOCAR"
  ];

  const rows = [];
  const lines = text.split(/\n+/).map(x=>x.trim()).filter(Boolean);

  for(let i=0;i<lines.length-1;i++){
    const brand = lines[i].toUpperCase();
    const code = lines[i+1].trim();

    if(brands.includes(brand) && /^[A-Z0-9][A-Z0-9\-./ ]{2,40}$/i.test(code)){
      rows.push({brand,code});
    }
  }

  return rows;
}

async function searchSku(page, site, sku){
  await page.goto(site,{waitUntil:"domcontentloaded",timeout:60000});

  const selectors = [
    'input[type="search"]',
    'input[name*="search" i]',
    'input[id*="search" i]',
    'input[type="text"]'
  ];

  let input = null;

  for(const sel of selectors){
    const el = await page.$(sel);
    if(el){ input = el; break; }
  }

  if(!input) return [];

  await input.fill(sku);
  await input.press("Enter");
  await page.waitForTimeout(5000);

  const text = await page.locator("body").innerText({timeout:30000});
  return parsePairs(text);
}

(async()=>{

  if(!fs.existsSync(OUT_CSV)){
    fs.writeFileSync(
      OUT_CSV,
      "mann_sku,segment,reference_brand,reference_code,source_site,confidence\n"
    );
  }

  const products = fs.readFileSync(INPUT,"utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map(x=>JSON.parse(x));

  let start = 0;

  if(fs.existsSync(CHECKPOINT)){
    start = JSON.parse(fs.readFileSync(CHECKPOINT,"utf8")).index || 0;
  }

  log(`TOTAL ${products.length}`);
  log(`START ${start}`);

  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();

  for(let i=start;i<products.length;i++){

    const p = products[i];
    const sku = cleanSku(p.sku);
    const segment = p.filter_type || "";
    const site = siteFor(segment);

    if(!site){
      log(`SKIP ${sku} ${segment}`);
      continue;
    }

    try{
      log(`SEARCH ${i+1}/${products.length} ${sku} ${segment}`);

      const pairs = await searchSku(page, site, sku);

      const unique = new Map();

      for(const r of pairs){
        const key = `${r.brand}|${r.code}`;
        unique.set(key,r);
      }

      for(const r of unique.values()){
        fs.appendFileSync(
          OUT_CSV,
          [
            csvEscape(sku),
            csvEscape(segment),
            csvEscape(r.brand),
            csvEscape(r.code),
            csvEscape(site),
            csvEscape("candidate")
          ].join(",")+"\n"
        );
      }

      fs.writeFileSync(CHECKPOINT,JSON.stringify({index:i+1,sku},null,2));

      log(`FOUND ${sku} ${unique.size}`);

      await page.waitForTimeout(2500);

    }catch(e){
      log(`ERROR ${sku} ${e.message}`);
      fs.writeFileSync(CHECKPOINT,JSON.stringify({index:i+1,sku,error:e.message},null,2));
      await page.waitForTimeout(10000);
    }
  }

  await browser.close();

  log("DONE");

})();
