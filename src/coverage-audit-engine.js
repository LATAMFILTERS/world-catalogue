function normalize(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}

function expandYear(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (String(value).length === 4) return n;
  return n <= 35 ? 2000 + n : 1900 + n;
}

function parseYears(application) {
  const text = String(application?.year_range || application?.year || '').trim();
  if (!text) return { explicit: false, years: [] };
  const dated = [...text.matchAll(/\b\d{1,2}\/(\d{2}|\d{4})\b/g)].map(m => expandYear(m[1])).filter(Boolean);
  const full = [...text.matchAll(/\b(19\d{2}|20\d{2})\b/g)].map(m => Number(m[1]));
  const values = dated.length ? dated : full;
  if (!values.length) return { explicit: false, years: [] };
  const start = values[0];
  const hasArrow = text.includes('→') || text.includes('->');
  const end = values.length > 1 ? values[values.length - 1] : (hasArrow ? null : start);
  const years = [];
  if (end !== null && end >= start && end - start <= 30) {
    for (let y = start; y <= end; y++) years.push(y);
  } else years.push(start);
  return { explicit: true, years };
}

function inferFuel(application) {
  const text = normalize([application?.model, application?.model_type, application?.engine, application?.engine_code].filter(Boolean).join(' '));
  if (/\b(DIESEL|D 4D|TDI|HDI|CDI|DCI|CRDI|TDCI|1ND TV|2AD FHV|2AD FTV)\b/.test(text)) return 'diesel';
  if (/\b(GASOLINE|PETROL|VVT|VVT I|VALVEMATIC|EFI|2ZR|1ZR|M20A|FI)\b/.test(text)) return 'gasoline';
  return 'unknown';
}

function inferMarket(application) {
  const text = normalize([application?.market, application?.region, application?.make, application?.model, application?.notes].filter(Boolean).join(' '));
  if (/\b(USA|US|NORTH AMERICA|CANADA|MEXICO)\b/.test(text)) return 'US';
  if (/\b(EUROPE|EUROPEAN|EUROPA|D 4D)\b/.test(text)) return 'EU';
  if (/\b(JAPAN|JDM)\b/.test(text)) return 'JP';
  return 'unknown';
}

function classify(row) {
  const text = normalize([row.filter_type, row.sub_type, row.technology, row.sku].filter(Boolean).join(' '));
  const sku = String(row.sku || '').toUpperCase();
  if (/\b(CABIN|POLLEN|HVAC|HABITACLE)\b/.test(text) || sku.startsWith('EC')) return 'cabin';
  if (/\b(OIL|LUBE|LUBRICATION)\b/.test(text) || sku.startsWith('EL')) return 'oil';
  if (/\b(FUEL|DIESEL|GASOLINE|WATER SEPARATOR)\b/.test(text) || sku.startsWith('EF')) return 'fuel';
  if (/\b(AIR|INTAKE)\b/.test(text) || sku.startsWith('EA')) return 'air';
  return 'other';
}

function validCursor(value) {
  return !value || /^[A-Z0-9_-]{2,100}$/.test(value);
}

function registerCoverageAuditEngine(app, pool, limiter) {
  app.get('/api/audit/coverage-engine', limiter, async (req, res) => {
    const make = String(req.query.make || '').trim().toUpperCase();
    const duty = String(req.query.duty || 'LIGHT_DUTY').trim().toUpperCase();
    const limit = Math.min(Math.max(Number(req.query.limit) || 250, 40), 800);
    const gapLimit = Math.min(Math.max(Number(req.query.gap_limit) || 100, 10), 500);
    const cursors = {
      air: String(req.query.after_air || '').trim().toUpperCase(),
      oil: String(req.query.after_oil || '').trim().toUpperCase(),
      fuel: String(req.query.after_fuel || '').trim().toUpperCase(),
      cabin: String(req.query.after_cabin || '').trim().toUpperCase(),
    };
    if (make && !/^[A-Z0-9 ._-]{2,40}$/.test(make)) return res.status(400).json({ success:false, error:'Invalid make.' });
    if (!['LIGHT_DUTY','HEAVY_DUTY','ALL'].includes(duty)) return res.status(400).json({ success:false, error:'Invalid duty.' });
    if (Object.values(cursors).some(value => !validCursor(value))) return res.status(400).json({ success:false, error:'Invalid category cursor.' });

    const quota = Math.max(10, Math.floor(limit / 4));
    const client = await pool.connect();
    try {
      await client.query("SET LOCAL statement_timeout = '15000'");
      const result = await client.query(`WITH eligible AS (
        SELECT c.sku, c.filter_type, c.sub_type, c.duty, c.technology, c.vehicle_applications,
          CASE
            WHEN c.sku LIKE 'EC%' OR UPPER(COALESCE(c.sub_type,'')) LIKE '%CABIN%' OR UPPER(COALESCE(c.filter_type,'')) LIKE '%CABIN%' THEN 'cabin'
            WHEN c.sku LIKE 'EL%' OR UPPER(COALESCE(c.filter_type,'')) LIKE '%OIL%' OR UPPER(COALESCE(c.filter_type,'')) LIKE '%LUBE%' THEN 'oil'
            WHEN c.sku LIKE 'EF%' OR UPPER(COALESCE(c.filter_type,'')) LIKE '%FUEL%' THEN 'fuel'
            WHEN c.sku LIKE 'EA%' OR UPPER(COALESCE(c.filter_type,'')) LIKE '%AIR%' THEN 'air'
            ELSE 'other'
          END AS audit_category
        FROM elimfilters_catalog c
        WHERE c.vehicle_applications IS NOT NULL
          AND jsonb_typeof(c.vehicle_applications) = 'array'
          AND ($1::text = '' OR c.vehicle_applications @> jsonb_build_array(jsonb_build_object('make',$1::text)))
          AND ($2::text = 'ALL' OR c.duty = $2::text)
      ), ranked AS (
        SELECT e.*,
          ROW_NUMBER() OVER (PARTITION BY e.audit_category ORDER BY e.sku) AS category_rank
        FROM eligible e
        WHERE (e.audit_category = 'air' AND ($3::text = '' OR e.sku > $3::text))
           OR (e.audit_category = 'oil' AND ($4::text = '' OR e.sku > $4::text))
           OR (e.audit_category = 'fuel' AND ($5::text = '' OR e.sku > $5::text))
           OR (e.audit_category = 'cabin' AND ($6::text = '' OR e.sku > $6::text))
      ), page_skus AS (
        SELECT * FROM ranked
        WHERE audit_category IN ('air','oil','fuel','cabin')
          AND category_rank <= $7::int
      )
      SELECT c.sku,c.filter_type,c.sub_type,c.duty,c.technology,c.audit_category,app.application,
             COUNT(DISTINCT c.sku) OVER (PARTITION BY c.audit_category)::int AS category_sku_count
      FROM page_skus c
      CROSS JOIN LATERAL jsonb_array_elements(c.vehicle_applications) app(application)
      WHERE ($1::text = '' OR UPPER(COALESCE(app.application->>'make','')) = $1::text)
      ORDER BY c.audit_category,c.sku`, [make,duty,cursors.air,cursors.oil,cursors.fuel,cursors.cabin,quota]);

      const groups = new Map();
      const quality = { rows_scanned:result.rows.length, rows_with_explicit_year:0, rows_missing_year:0, rows_unknown_fuel:0, rows_unknown_market:0, rows_missing_make:0, rows_missing_model:0 };
      const uniqueSkus = new Set(), uniqueMakes = new Set(), uniqueModels = new Set();
      const categorySkus = { air:new Set(), oil:new Set(), fuel:new Set(), cabin:new Set() };
      for (const row of result.rows) {
        const a = row.application || {}; const mk = normalize(a.make); const model = normalize([a.model,a.model_family,a.model_type].filter(Boolean).join(' '));
        const yi = parseYears(a); const fuel = inferFuel(a); const market = inferMarket(a); const category = classify(row);
        uniqueSkus.add(row.sku); if (categorySkus[category]) categorySkus[category].add(row.sku);
        if (mk) uniqueMakes.add(mk); else quality.rows_missing_make++; if (model) uniqueModels.add(mk+'|'+model); else quality.rows_missing_model++;
        yi.explicit ? quality.rows_with_explicit_year++ : quality.rows_missing_year++; if (fuel==='unknown') quality.rows_unknown_fuel++; if (market==='unknown') quality.rows_unknown_market++;
        for (const year of (yi.years.length ? yi.years : [null])) {
          const key=[mk||'UNKNOWN',model||'UNKNOWN',year||'UNKNOWN',fuel,market].join('|');
          if(!groups.has(key)) groups.set(key,{make:mk||null,model:model||null,year,fuel,market,categories:new Set(),skus:new Set(),application_rows:0,has_explicit_year:yi.explicit});
          const g=groups.get(key); g.categories.add(category); g.skus.add(row.sku); g.application_rows++;
        }
      }
      const required=['oil','air','cabin'];
      const units=[...groups.values()].map(g=>{const categories=[...g.categories].sort(); const missing=required.filter(c=>!g.categories.has(c)); let status='complete'; if(!g.has_explicit_year)status='invalid_year_evidence'; else if(g.fuel==='unknown'||g.market==='unknown')status='needs_context'; else if(missing.length===required.length)status='no_core_coverage'; else if(missing.length)status='partial'; return {make:g.make,model:g.model,year:g.year,fuel:g.fuel,market:g.market,status,priority_score:(!g.has_explicit_year?100:0)+(g.fuel==='unknown'?40:0)+(g.market==='unknown'?30:0)+(missing.length*20),categories,missing_core_categories:missing,sku_count:g.skus.size,skus:[...g.skus].sort().slice(0,20),application_rows:g.application_rows};});
      const statusCounts={}, categoryCounts={}; for(const u of units){statusCounts[u.status]=(statusCounts[u.status]||0)+1; for(const c of u.categories)categoryCounts[c]=(categoryCounts[c]||0)+1;}
      const nextCursors = {};
      const hasMoreByCategory = {};
      for (const category of ['air','oil','fuel','cabin']) {
        const values = [...categorySkus[category]].sort();
        nextCursors[category] = values.length ? values[values.length - 1] : (cursors[category] || null);
        hasMoreByCategory[category] = values.length === quota;
      }
      return res.json({success:true,engine_version:'coverage-audit-v5-balanced',read_only:true,scope:{make:make||'ALL',duty,sku_limit:limit,per_category_quota:quota,gap_limit:gapLimit,cursors},pagination:{returned_application_rows:result.rows.length,returned_skus:uniqueSkus.size,has_more:Object.values(hasMoreByCategory).some(Boolean),has_more_by_category:hasMoreByCategory,next_cursors:nextCursors},summary:{...quality,unique_skus:uniqueSkus.size,unique_makes:uniqueMakes.size,unique_models:uniqueModels.size,coverage_units:units.length,status_counts:statusCounts,category_unit_counts:categoryCounts,category_sku_counts:Object.fromEntries(Object.entries(categorySkus).map(([k,v])=>[k,v.size]))},priority_gaps:units.filter(u=>u.status!=='complete').sort((a,b)=>b.priority_score-a.priority_score||String(a.make).localeCompare(String(b.make))||String(a.model).localeCompare(String(b.model))).slice(0,gapLimit)});
    } catch (error) {
      console.error('[coverage-audit-engine-direct]', error.code || '', error.message);
      return res.status(500).json({success:false,error:'Coverage audit engine failed',code:error.code||null,detail:error.message});
    } finally { client.release(); }
  });
}

module.exports = { registerCoverageAuditEngine };
