import { loadPublicCatalogConfig, queryCatalog, parsePartList } from './lib/fram-usa-smtp-client.mjs';

const cfg = await loadPublicCatalogConfig();
for (const pn of ['PH4967','PH3614','PH3387','PH3387A']) {
  const list = await queryCatalog(`lookup=partlist&partno=${pn}`, { config: cfg, limit: 50 });
  const rec = parsePartList(list.xml).find(r => r.part_number === pn && r.supplier === 'Fram Filters');
  if (!rec) { console.log(pn, 'NOT_FOUND'); continue; }
  const detail = await queryCatalog(`lookup=partdetail&part=${rec.part_key}`, { config: cfg, limit: 500 });
  const attrs = [...detail.xml.matchAll(/<partsAttributes><attribute>([\s\S]*?)<\/attribute><value>([\s\S]*?)<\/value>/gi)]
    .map(m => [m[1].replace(/&amp;/g,'&'), m[2].replace(/&amp;/g,'&')]);
  const wanted = Object.fromEntries(attrs.filter(([k]) => /Height \(Inch\)|Outside Diameter|Weight - Each|Weight - Case|Height - Case|Length - Case|Width - Case|Filter Type|Associated Comment/i.test(k)));
  console.log(pn, rec.part_type, JSON.stringify(wanted));
}
