import { loadPublicCatalogConfig, queryCatalog, parsePartList } from './lib/fram-usa-smtp-client.mjs';

const config = await loadPublicCatalogConfig();
const probes = ['PH*','PH4*','PH49*','PH496*','CA*','CA10*','CF*','CF10*','G*','G7*','G73*'];
for (const pattern of probes) {
  const result = await queryCatalog(`lookup=partlist&partno=${encodeURIComponent(pattern)}`, { config, limit: 500 });
  const total = result.xml.match(/totalrecords="(\d+)"/i)?.[1] ?? '?';
  const records = parsePartList(result.xml);
  const fram = records.filter(record => /^Fram Filters$/i.test(record.supplier || ''));
  console.log(JSON.stringify({ pattern, total, parsed: records.length, fram: fram.length, sample: fram.slice(0, 5).map(r => r.part_number) }));
}
