const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
let source = fs.readFileSync(target, 'utf8');
const marker = '// COVERAGE_AUDIT_ENGINE_20260714';

if (!source.includes(marker)) {
  const anchor = "// VEHICLE_COVERAGE_AUDIT_20260714";
  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex === -1) throw new Error('Vehicle coverage audit anchor not found');

  const routeEnd = source.indexOf("\n});", anchorIndex);
  if (routeEnd === -1) throw new Error('Vehicle coverage audit route end not found');
  const insertAt = routeEnd + 4;

  const block = `

${marker}
// Read-only catalogue quality engine. It audits the vehicle applications already
// present in PostgreSQL; it does not claim coverage for vehicles absent from the DB.
app.get('/api/audit/coverage-engine', searchLimiter, async (req, res) => {
  const make = String(req.query.make || '').trim().toUpperCase();
  const duty = String(req.query.duty || 'LIGHT_DUTY').trim().toUpperCase();
  const limit = Math.min(Math.max(Number(req.query.limit) || 5000, 100), 10000);
  const gapLimit = Math.min(Math.max(Number(req.query.gap_limit) || 100, 10), 500);

  if (make && !/^[A-Z0-9 ._-]{2,40}$/.test(make)) {
    return res.status(400).json({ success: false, error: 'Invalid make.' });
  }
  if (!['LIGHT_DUTY', 'HEAVY_DUTY', 'ALL'].includes(duty)) {
    return res.status(400).json({ success: false, error: 'duty must be LIGHT_DUTY, HEAVY_DUTY or ALL.' });
  }

  const client = await pool.connect();
  try {
    await client.query("SET LOCAL statement_timeout = '20000'");
    const rowsResult = await client.query(
      \`SELECT
         c.sku,
         c.filter_type,
         c.sub_type,
         c.duty,
         c.technology,
         app.application
       FROM elimfilters_catalog c
       CROSS JOIN LATERAL jsonb_array_elements(c.vehicle_applications) app(application)
       WHERE c.vehicle_applications IS NOT NULL
         AND jsonb_typeof(c.vehicle_applications) = 'array'
         AND ($1::text = '' OR UPPER(COALESCE(app.application->>'make','')) = $1::text)
         AND ($2::text = 'ALL' OR c.duty = $2::text)
       ORDER BY c.sku
       LIMIT $3::int\`,
      [make, duty, limit]
    );

    const normalize = (value) => String(value || '')
      .normalize('NFKD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim();

    const expandYear = (value) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return null;
      if (String(value).length === 4) return n;
      return n <= 35 ? 2000 + n : 1900 + n;
    };

    const parseYears = (application) => {
      const text = String(application?.year_range || application?.year || '').trim();
      if (!text) return { explicit: false, start: null, end: null, years: [] };
      const dated = [...text.matchAll(/\\b\\d{1,2}\\/(\\d{2}|\\d{4})\\b/g)]
        .map(match => expandYear(match[1])).filter(Boolean);
      const full = [...text.matchAll(/\\b(19\\d{2}|20\\d{2})\\b/g)]
        .map(match => Number(match[1]));
      const values = dated.length ? dated : full;
      if (!values.length) return { explicit: false, start: null, end: null, years: [] };
      const start = values[0];
      const hasArrow = text.includes('→') || text.includes('->');
      const end = values.length > 1 ? values[values.length - 1] : (hasArrow ? null : start);
      const years = [];
      if (end !== null && end >= start && end - start <= 30) {
        for (let year = start; year <= end; year++) years.push(year);
      } else {
        years.push(start);
      }
      return { explicit: true, start, end, years };
    };

    const inferFuel = (application) => {
      const text = normalize([application?.model, application?.model_type, application?.engine, application?.engine_code].filter(Boolean).join(' '));
      if (/\\b(DIESEL|D 4D|TDI|HDI|CDI|DCI|CRDI|TDCI|1ND TV|2AD FHV|2AD FTV)\\b/.test(text)) return 'diesel';
      if (/\\b(GASOLINE|PETROL|VVT|VVT I|VALVEMATIC|EFI|2ZR|1ZR|M20A)\\b/.test(text)) return 'gasoline';
      return 'unknown';
    };

    const inferMarket = (application) => {
      const text = normalize([application?.market, application?.region, application?.model, application?.notes].filter(Boolean).join(' '));
      if (/\\b(USA|US|NORTH AMERICA|CANADA|MEXICO)\\b/.test(text)) return 'US';
      if (/\\b(EUROPE|EUROPEAN|EUROPA|D 4D)\\b/.test(text)) return 'EU';
      if (/\\b(JAPAN|JDM)\\b/.test(text)) return 'JP';
      return 'unknown';
    };

    const classify = (row) => {
      const text = normalize([row.filter_type, row.sub_type, row.technology, row.sku].filter(Boolean).join(' '));
      const sku = String(row.sku || '').toUpperCase();
      if (/\\b(CABIN|POLLEN|HVAC|HABITACLE)\\b/.test(text) || sku.startsWith('EC')) return 'cabin';
      if (/\\b(OIL|LUBE|LUBRICATION)\\b/.test(text) || sku.startsWith('EL')) return 'oil';
      if (/\\b(FUEL|DIESEL|GASOLINE|WATER SEPARATOR)\\b/.test(text) || sku.startsWith('EF')) return 'fuel';
      if (/\\b(COOLANT|COOLING|ANTIFREEZE)\\b/.test(text)) return 'coolant';
      if (/\\b(TRANSMISSION|GEARBOX|ATF|CVT)\\b/.test(text)) return 'transmission';
      if (/\\b(AIR|INTAKE)\\b/.test(text) || sku.startsWith('EA')) return 'air';
      return 'other';
    };

    const groups = new Map();
    const quality = {
      rows_scanned: rowsResult.rows.length,
      rows_with_explicit_year: 0,
      rows_missing_year: 0,
      rows_unknown_fuel: 0,
      rows_unknown_market: 0,
      rows_missing_make: 0,
      rows_missing_model: 0
    };
    const uniqueSkus = new Set();
    const uniqueMakes = new Set();
    const uniqueModels = new Set();

    for (const row of rowsResult.rows) {
      const app = row.application || {};
      const makeName = normalize(app.make);
      const modelName = normalize([app.model, app.model_family, app.model_type].filter(Boolean).join(' '));
      const yearInfo = parseYears(app);
      const fuel = inferFuel(app);
      const market = inferMarket(app);
      const category = classify(row);

      uniqueSkus.add(row.sku);
      if (makeName) uniqueMakes.add(makeName); else quality.rows_missing_make++;
      if (modelName) uniqueModels.add(makeName + '|' + modelName); else quality.rows_missing_model++;
      if (yearInfo.explicit) quality.rows_with_explicit_year++; else quality.rows_missing_year++;
      if (fuel === 'unknown') quality.rows_unknown_fuel++;
      if (market === 'unknown') quality.rows_unknown_market++;

      const years = yearInfo.years.length ? yearInfo.years : [null];
      for (const year of years) {
        const key = [makeName || 'UNKNOWN', modelName || 'UNKNOWN', year || 'UNKNOWN', fuel, market].join('|');
        if (!groups.has(key)) {
          groups.set(key, {
            make: makeName || null,
            model: modelName || null,
            year,
            fuel,
            market,
            categories: new Set(),
            skus: new Set(),
            application_rows: 0,
            has_explicit_year: yearInfo.explicit
          });
        }
        const group = groups.get(key);
        group.categories.add(category);
        group.skus.add(row.sku);
        group.application_rows++;
      }
    }

    const requiredCore = ['oil', 'air', 'cabin'];
    const units = [...groups.values()].map(group => {
      const categories = [...group.categories].sort();
      const missing = requiredCore.filter(category => !group.categories.has(category));
      let status = 'complete';
      if (!group.has_explicit_year) status = 'invalid_year_evidence';
      else if (group.fuel === 'unknown' || group.market === 'unknown') status = 'needs_context';
      else if (missing.length === requiredCore.length) status = 'no_core_coverage';
      else if (missing.length) status = 'partial';
      const priority_score =
        (!group.has_explicit_year ? 100 : 0) +
        (group.fuel === 'unknown' ? 40 : 0) +
        (group.market === 'unknown' ? 30 : 0) +
        (missing.length * 20);
      return {
        make: group.make,
        model: group.model,
        year: group.year,
        fuel: group.fuel,
        market: group.market,
        status,
        priority_score,
        categories,
        missing_core_categories: missing,
        sku_count: group.skus.size,
        skus: [...group.skus].sort().slice(0, 20),
        application_rows: group.application_rows
      };
    });

    const statusCounts = units.reduce((acc, unit) => {
      acc[unit.status] = (acc[unit.status] || 0) + 1;
      return acc;
    }, {});
    const categoryCounts = {};
    for (const unit of units) {
      for (const category of unit.categories) categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }

    const priorityGaps = units
      .filter(unit => unit.status !== 'complete')
      .sort((a, b) => b.priority_score - a.priority_score || String(a.make).localeCompare(String(b.make)) || String(a.model).localeCompare(String(b.model)))
      .slice(0, gapLimit);

    return res.json({
      success: true,
      engine_version: '20260714-coverage-audit-v1',
      read_only: true,
      scope: { make: make || 'ALL', duty, row_limit: limit, gap_limit: gapLimit },
      limitation: 'This engine audits applications already stored in the catalogue. It cannot identify vehicle models that are completely absent without an external vehicle universe.',
      summary: {
        ...quality,
        unique_skus: uniqueSkus.size,
        unique_makes: uniqueMakes.size,
        unique_models: uniqueModels.size,
        coverage_units: units.length,
        status_counts: statusCounts,
        category_unit_counts: categoryCounts
      },
      priority_gaps: priorityGaps
    });
  } catch (error) {
    console.error('[coverage-audit-engine]', error.code || '', error.message);
    return res.status(500).json({
      success: false,
      error: 'Coverage audit engine failed',
      code: error.code || null,
      detail: error.message
    });
  } finally {
    client.release();
  }
});
`;

  source = source.slice(0, insertAt) + block + source.slice(insertAt);
  fs.writeFileSync(target, source, 'utf8');
  console.log('[coverage-audit-engine] read-only engine enabled');
} else {
  console.log('[coverage-audit-engine] already enabled');
}
