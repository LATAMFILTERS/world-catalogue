// Sonda de lectura: repite las consultas que hace el search mientras corren las migraciones y mide latencias.
// Uso: node probe.cjs <segundos> <salida.json>   (DATABASE_URL en el entorno)
const { Client } = require('C:/ELIMSERVER/worktrees/search-cutover/node_modules/pg');
const fs = require('fs');
const [secs, out] = [Number(process.argv[2] || 120), process.argv[3]];
const queries = [
  ["exact_sku", "SELECT * FROM elimfilters_catalog_active_v WHERE UPPER(REPLACE(sku,'-','')) = 'EL30158' LIMIT 1"],
  ["codigo_base", "SELECT * FROM elimfilters_catalog_active_v WHERE codigo_base = 'P550463' LIMIT 5"],
  ["ld_apps", "SELECT count(*) FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku = 'EL30158'"],
  ["excluded_check", "SELECT 1 FROM elimfilters_catalog WHERE sku = 'ET90011' AND catalog_active = false"],
];
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query("SET application_name = 'rehearsal-read-probe'");
  const stats = {}; const slow = []; const end = Date.now() + secs * 1000;
  while (Date.now() < end) {
    for (const [name, sql] of queries) {
      const t0 = process.hrtime.bigint();
      let err = null;
      try { await c.query(sql); } catch (e) { err = e.message; }
      const ms = Number(process.hrtime.bigint() - t0) / 1e6;
      const s = (stats[name] ??= { n: 0, max: 0, sum: 0, errors: 0 });
      s.n++; s.sum += ms; s.max = Math.max(s.max, ms); if (err) s.errors++;
      if (ms > 250 || err) slow.push({ at: new Date().toISOString(), name, ms: Math.round(ms), err });
    }
    await new Promise(r => setTimeout(r, 100));
  }
  await c.end();
  for (const s of Object.values(stats)) { s.avg = +(s.sum / s.n).toFixed(1); s.max = +s.max.toFixed(1); delete s.sum; }
  fs.writeFileSync(out, JSON.stringify({ stats, slow_over_250ms: slow }, null, 2));
})().catch(e => { fs.writeFileSync(out, JSON.stringify({ fatal: e.message })); process.exit(1); });
