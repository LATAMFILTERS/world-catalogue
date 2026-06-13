/**
 * product-catalog-migration-routes.js
 * Express route module for product catalog migration and validation endpoints.
 *
 * Integration in server.js (add after dbConfig is defined):
 *   require('./scripts/product-catalog-migration-routes')(app, Client, dbConfig);
 *
 * Endpoints:
 *   GET /api/migrate/product-catalog?key=elim2026admin
 *     → Runs DDL (001_product_catalog_schema.sql). Idempotent.
 *
 *   GET /api/migrate/product-catalog-seed?key=elim2026admin
 *     → Runs HYDROCORE/SERIES™ seed data (002_hydrocore_seed_data.sql). Idempotent.
 *
 *   GET /api/migrate/product-catalog-validate?key=elim2026admin
 *     → Runs validation suite. Returns JSON report.
 *
 *   GET /api/product-catalog/housing/:modelCode
 *     → Returns housing model + all compatible elements + alternative groups.
 *     → Primary read endpoint for Recommendation Engine housing lookup.
 *
 *   GET /api/product-catalog/element/:elementCode
 *     → Returns element + its alternative group members.
 *     → Primary read endpoint for Recommendation Engine element alternative lookup.
 *
 *   GET /api/product-catalog/alternatives/:elementCode
 *     → Returns the full alternative group for a given element, with TYPE_A/TYPE_B
 *       classification computed relative to the group baseline.
 *
 *   GET /api/migrate/product-catalog-fix-500fg?key=elim2026admin
 *     → Runs 007_fix_500fg_micron_ratings.sql. Corrects SM-OR (2µm) and PM-OR (30µm)
 *       per Parker datasheet 15332 Rev G. Updates protection_spec, descriptions,
 *       alternative_group_member rankings, and model_element_compatibility.is_primary.
 *
 *   GET /api/migrate/product-catalog-intekcore-compat?key=elim2026admin
 *     → Runs 011_intekcore_macrocore_compatibility.sql. Links INTEKCORE housings to
 *       MACROCORE elements via shared Donaldson Family codes. ~2324 pairs across
 *       22 families. confidence: INFERRED, method: cross_reference.
 *
 *   GET /api/migrate/product-catalog-intekcore-durable?key=elim2026admin
 *     → Runs 012_intekcore_activate_durable.sql. Promotes INTEKCORE housings to
 *       model_type=durable, accepts_elements=TRUE. Sets compatibility_class=
 *       'macrocore-<family>' on both housings and their matched MACROCORE elements.
 */

const fs   = require('fs');
const path = require('path');

const ADMIN_KEY      = 'elim2026admin';
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

module.exports = function registerProductCatalogRoutes(app, Client, dbConfig) {

  // ── Migration: DDL ──────────────────────────────────────────────────────────
  app.get('/api/migrate/product-catalog', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const ddl = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '001_product_catalog_schema.sql'), 'utf8'
      );
      await client.query(ddl);
      res.json({ success: true, message: 'Product catalog schema created (idempotent)' });
    } catch(e) {
      console.error('[product-catalog migrate]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Migration: Seed data ────────────────────────────────────────────────────
  app.get('/api/migrate/product-catalog-seed', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const seed = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '002_hydrocore_seed_data.sql'), 'utf8'
      );
      await client.query(seed);
      res.json({ success: true, message: 'HYDROCORE/SERIES™ seed data inserted (idempotent)' });
    } catch(e) {
      console.error('[product-catalog seed]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Migration: Validate ─────────────────────────────────────────────────────
  app.get('/api/migrate/product-catalog-validate', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();

      // Row counts
      const tables = [
        'product_family', 'product_model', 'product_element',
        'model_element_compatibility', 'alternative_group', 'alternative_group_member',
      ];
      const row_counts = {};
      for (const t of tables) {
        const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
        row_counts[t] = parseInt(r.rows[0].count);
      }

      // One baseline per group — LEFT JOIN detects zero-baseline groups as well as duplicates
      const baseline = await client.query(`
        SELECT ag.group_code, COUNT(agm.element_id) AS baseline_count
        FROM alternative_group ag
        LEFT JOIN alternative_group_member agm
          ON agm.group_id = ag.id AND agm.is_baseline = TRUE
        GROUP BY ag.group_code ORDER BY ag.group_code
      `);
      const baseline_valid = baseline.rows.every(r => parseInt(r.baseline_count) === 1);

      // Compatibility class mismatches
      const compat = await client.query(`
        SELECT COUNT(*) AS mismatches
        FROM model_element_compatibility mec
        JOIN product_model  pm ON pm.id = mec.product_model_id
        JOIN product_element pe ON pe.id = mec.product_element_id
        WHERE pm.compatibility_class != pe.compatibility_class
      `);
      const compat_mismatches = parseInt(compat.rows[0].mismatches);

      // Orphan elements
      const orphans = await client.query(`
        SELECT pe.element_code
        FROM product_element pe
        LEFT JOIN alternative_group_member agm ON agm.element_id = pe.id
        WHERE agm.element_id IS NULL
      `);

      // PENDING confidence records
      const pending = await client.query(`
        SELECT COUNT(*) AS c FROM model_element_compatibility
        WHERE compatibility_confidence = 'PENDING'
      `);

      // SKU linkage
      const unlinked_models   = await client.query(`SELECT COUNT(*) AS c FROM product_model    WHERE elimfilters_sku IS NULL`);
      const unlinked_elements = await client.query(`SELECT COUNT(*) AS c FROM product_element   WHERE elimfilters_sku IS NULL`);

      const overall_pass = baseline_valid
        && compat_mismatches === 0
        && orphans.rows.length === 0;

      res.json({
        success: true,
        overall: overall_pass ? 'PASS' : 'FAIL',
        row_counts,
        checks: {
          one_baseline_per_group: {
            pass: baseline_valid,
            detail: baseline.rows,
          },
          compatibility_class_integrity: {
            pass: compat_mismatches === 0,
            mismatches: compat_mismatches,
          },
          no_orphan_elements: {
            pass: orphans.rows.length === 0,
            orphans: orphans.rows.map(r => r.element_code),
          },
          pending_compatibility: {
            count: parseInt(pending.rows[0].c),
            note: 'PENDING records cap Recommendation Engine confidence at LOW',
          },
          sku_linkage: {
            unlinked_models:   parseInt(unlinked_models.rows[0].c),
            unlinked_elements: parseInt(unlinked_elements.rows[0].c),
            note: 'Cross-reference lookups require SKU assignment in elimfilters_catalog',
          },
        },
      });
    } catch(e) {
      console.error('[product-catalog validate]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Read: Housing model + compatible elements ───────────────────────────────
  // GET /api/product-catalog/housing/1000FH
  app.get('/api/product-catalog/housing/:modelCode', async (req, res) => {
    const code = (req.params.modelCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'modelCode required' });
    const client = new Client(dbConfig);
    try {
      await client.connect();

      const model = await client.query(`
        SELECT pm.*, pf.family_name, pf.technology, pf.system
        FROM product_model pm
        JOIN product_family pf ON pf.id = pm.family_id
        WHERE UPPER(pm.model_code) = $1 LIMIT 1
      `, [code]);
      if (!model.rows.length) return res.status(404).json({ error: 'not found', model_code: code });

      const elements = await client.query(`
        SELECT
          pe.*,
          mec.is_primary,
          mec.compatibility_confidence,
          mec.compatibility_source
        FROM model_element_compatibility mec
        JOIN product_element pe ON pe.id = mec.product_element_id
        WHERE mec.product_model_id = $1
        ORDER BY pe.media_grade
      `, [model.rows[0].id]);

      res.json({
        model:    model.rows[0],
        elements: elements.rows,
        count:    elements.rows.length,
      });
    } catch(e) { res.status(500).json({ error: e.message }); }
    finally { await client.end(); }
  });

  // ── Read: Element + its alternative group ──────────────────────────────────
  // GET /api/product-catalog/element/2020SM-OR
  app.get('/api/product-catalog/element/:elementCode', async (req, res) => {
    const code = (req.params.elementCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'elementCode required' });
    const client = new Client(dbConfig);
    try {
      await client.connect();

      const el = await client.query(`
        SELECT pe.*, pf.family_name, pf.technology, pf.system
        FROM product_element pe
        JOIN product_family pf ON pf.id = pe.family_id
        WHERE UPPER(pe.element_code) = $1 LIMIT 1
      `, [code]);
      if (!el.rows.length) return res.status(404).json({ error: 'not found', element_code: code });

      const group_membership = await client.query(`
        SELECT agm.*, ag.group_code, ag.group_name, ag.differentiation_axis
        FROM alternative_group_member agm
        JOIN alternative_group ag ON ag.id = agm.group_id
        WHERE agm.element_id = $1
      `, [el.rows[0].id]);

      res.json({
        element:          el.rows[0],
        group_membership: group_membership.rows,
      });
    } catch(e) { res.status(500).json({ error: e.message }); }
    finally { await client.end(); }
  });

  // ── Read: Full alternative group for an element ────────────────────────────
  // GET /api/product-catalog/alternatives/2020SM-OR
  // Returns all group members with TYPE_A/TYPE_B classification vs baseline.
  app.get('/api/product-catalog/alternatives/:elementCode', async (req, res) => {
    const code = (req.params.elementCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'elementCode required' });
    const client = new Client(dbConfig);
    try {
      await client.connect();

      // Find the group this element belongs to
      const group_row = await client.query(`
        SELECT ag.id AS group_id, ag.group_code, ag.group_name,
               ag.technology, ag.system, ag.differentiation_axis,
               ag.compatibility_source, ag.compatibility_verified_at,
               ag.compatibility_basis
        FROM product_element pe
        JOIN alternative_group_member agm ON agm.element_id = pe.id
        JOIN alternative_group ag ON ag.id = agm.group_id
        WHERE UPPER(pe.element_code) = $1
        LIMIT 1
      `, [code]);
      if (!group_row.rows.length) {
        return res.status(404).json({
          error: 'element not found or not in any alternative group',
          element_code: code,
        });
      }
      const group = group_row.rows[0];

      // Get baseline protection level
      const baseline_row = await client.query(`
        SELECT agm.protection_level
        FROM alternative_group_member agm
        WHERE agm.group_id = $1 AND agm.is_baseline = TRUE
        LIMIT 1
      `, [group.group_id]);
      if (!baseline_row.rows.length) {
        return res.status(500).json({
          error:       'validation_error',
          code:        'baseline_missing',
          message:     `Alternative group '${group.group_code}' has no baseline member. ` +
                       'TYPE_A/TYPE_B classification requires exactly one is_baseline = TRUE member.',
          group_code:  group.group_code,
        });
      }
      const baseline_level = parseInt(baseline_row.rows[0].protection_level);

      // Get all members with TYPE_A/TYPE_B classification
      const members = await client.query(`
        SELECT
          pe.element_code,
          pe.elimfilters_sku,
          pe.media_grade,
          pe.seal_type,
          pe.protection_spec,
          pe.description,
          agm.is_baseline,
          agm.protection_level,
          agm.operational_objective,
          agm.compatibility_note,
          agm.rank_in_group
        FROM alternative_group_member agm
        JOIN product_element pe ON pe.id = agm.element_id
        WHERE agm.group_id = $1
        ORDER BY agm.rank_in_group
      `, [group.group_id]);

      const members_classified = members.rows.map(m => ({
        ...m,
        alternative_type: m.is_baseline
          ? 'BASELINE'
          : parseInt(m.protection_level) > baseline_level
            ? 'TYPE_A'
            : 'TYPE_B',
      }));

      res.json({
        group:   group,
        members: members_classified,
        count:   members_classified.length,
        queried_element: code,
      });
    } catch(e) { res.status(500).json({ error: e.message }); }
    finally { await client.end(); }
  });

  // ── Migration: HYDROCORE/SERIES™ 500FG series ───────────────────────────────
  app.get('/api/migrate/product-catalog-500fg', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '005_hydrocore_500fg_series.sql'), 'utf8'
      );
      await client.query(sql);
      res.json({ success: true, message: 'HYDROCORE/SERIES™ 500FG series migrated (idempotent)' });
    } catch(e) {
      console.error('[product-catalog 500fg]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Migration: Phase A — all technologies ───────────────────────────────────
  app.get('/api/migrate/product-catalog-phase-a', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '004_phase_a_all_technologies.sql'), 'utf8'
      );
      await client.query(sql);

      // Row counts after migration
      const counts = {};
      for (const t of ['product_family', 'product_model', 'product_element']) {
        const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
        counts[t] = parseInt(r.rows[0].count);
      }
      res.json({
        success: true,
        message: 'Phase A: all technology families + products migrated (idempotent)',
        row_counts: counts,
      });
    } catch(e) {
      console.error('[product-catalog phase-a]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Migration: Phase B — singleton alternative_groups for MACROCORE/MICROKAPPA
  app.get('/api/migrate/product-catalog-phase-b', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '006_phase_b_singleton_alternative_groups.sql'), 'utf8'
      );
      await client.query(sql);

      const counts = {};
      for (const t of ['alternative_group', 'alternative_group_member']) {
        const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
        counts[t] = parseInt(r.rows[0].count);
      }
      const orphans = await client.query(`
        SELECT COUNT(*) FROM product_element pe
        LEFT JOIN alternative_group_member agm ON agm.element_id = pe.id
        WHERE agm.element_id IS NULL
      `);
      res.json({
        success:          true,
        message:          'Phase B: MACROCORE + MICROKAPPA singleton groups created (idempotent)',
        row_counts:       counts,
        remaining_orphans: parseInt(orphans.rows[0].count),
      });
    } catch(e) {
      console.error('[product-catalog phase-b]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Migration 010: Assign ELIMFILTERS SKUs to 2020/2040 series elements ──────
  // GET /api/migrate/product-catalog-elements-sku?key=elim2026admin
  app.get('/api/migrate/product-catalog-elements-sku', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '010_hydrocore_elements_sku.sql'), 'utf8'
      );
      await client.query(sql);

      const verify = await client.query(`
        SELECT element_code, elimfilters_sku
        FROM product_element
        WHERE element_code IN (
          '2020PM-OR','2020TM-OR','2020SM-OR',
          '2040PM-OR','2040TM-OR','2040SM-OR'
        )
        ORDER BY element_code
      `);

      res.json({ success: true, records: verify.rows });
    } catch(e) {
      console.error('[product-catalog elements-sku]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Migration 012: Activate INTEKCORE as durable + align compatibility_class ──
  // GET /api/migrate/product-catalog-intekcore-durable?key=elim2026admin
  // Promotes 163 INTEKCORE housings to model_type=durable, accepts_elements=TRUE.
  // Sets compatibility_class='macrocore-<family>' on both housings and elements.
  app.get('/api/migrate/product-catalog-intekcore-durable', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '012_intekcore_activate_durable.sql'), 'utf8'
      );
      await client.query(sql);

      const verify = await client.query(`
        SELECT
          COUNT(*) FILTER (WHERE model_type = 'durable' AND accepts_elements = TRUE
                           AND compatibility_class LIKE 'macrocore-%')  AS intekcore_durable,
          COUNT(*) FILTER (WHERE model_type = 'assembly')               AS still_assembly,
          COUNT(DISTINCT compatibility_class)                            AS distinct_classes
        FROM product_model
        WHERE model_code LIKE 'EA2%'
      `);

      const elementCheck = await client.query(`
        SELECT COUNT(*) AS elements_updated
        FROM product_element
        WHERE element_code LIKE 'EA1%'
          AND compatibility_class LIKE 'macrocore-%'
          AND LENGTH(compatibility_class) > LENGTH('macrocore-') + 3
      `);

      res.json({
        success: true,
        message: 'Migration 012: INTEKCORE housings activated as durable with family-based compatibility_class',
        housings: verify.rows[0],
        elements: elementCheck.rows[0],
      });
    } catch(e) {
      console.error('[product-catalog intekcore-durable]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Migration 011: INTEKCORE ↔ MACROCORE compatibility (Family codes) ─────────
  // GET /api/migrate/product-catalog-intekcore-compat?key=elim2026admin
  // Links INTEKCORE housings to MACROCORE elements via Donaldson Family codes.
  // 22 family groups, ~2324 compatibility pairs. confidence: INFERRED.
  app.get('/api/migrate/product-catalog-intekcore-compat', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '011_intekcore_macrocore_compatibility.sql'), 'utf8'
      );
      await client.query(sql);

      const verify = await client.query(`
        SELECT
          COUNT(*)                                       AS total_pairs,
          COUNT(*) FILTER (WHERE mec.is_primary = TRUE)  AS primary_pairs,
          COUNT(*) FILTER (WHERE mec.is_primary = FALSE) AS safety_pairs,
          COUNT(DISTINCT mec.product_model_id)           AS housings_linked,
          COUNT(DISTINCT mec.product_element_id)         AS elements_linked
        FROM model_element_compatibility mec
        JOIN product_model pm   ON pm.id = mec.product_model_id
        JOIN product_element pe ON pe.id = mec.product_element_id
        WHERE pm.model_code   LIKE 'EA2%'
          AND pe.element_code LIKE 'EA1%'
          AND mec.compatibility_method     = 'cross_reference'
          AND mec.compatibility_confidence = 'INFERRED'
      `);

      res.json({
        success: true,
        message: 'Migration 011: INTEKCORE↔MACROCORE compatibility linked via Donaldson Family codes',
        stats: verify.rows[0],
      });
    } catch(e) {
      console.error('[product-catalog intekcore-compat]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Migration 009: Assign ELIMFILTERS SKUs to 900/1000 FH housings ──────────
  // GET /api/migrate/product-catalog-housing-sku?key=elim2026admin
  app.get('/api/migrate/product-catalog-housing-sku', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '009_hydrocore_series_housing_sku.sql'), 'utf8'
      );
      await client.query(sql);

      const verify = await client.query(`
        SELECT model_code, elimfilters_sku
        FROM product_model
        WHERE model_code IN ('900FH','902FH','1000FH','1002FH')
        ORDER BY model_code
      `);

      res.json({ success: true, records: verify.rows });
    } catch(e) {
      console.error('[product-catalog housing-sku]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Migration 008: Assign ELIMFILTERS SKUs to 500FG series ──────────────────
  // GET /api/migrate/product-catalog-500fg-sku?key=elim2026admin
  app.get('/api/migrate/product-catalog-500fg-sku', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '008_500fg_elimfilters_sku.sql'), 'utf8'
      );
      await client.query(sql);

      const verify = await client.query(`
        SELECT 'model' AS type, model_code AS code, elimfilters_sku
        FROM product_model WHERE model_code = '500FG'
        UNION ALL
        SELECT 'element', element_code, elimfilters_sku
        FROM product_element WHERE element_code IN ('2010SM-OR','2010TM-OR','2010PM-OR')
        ORDER BY type DESC, code
      `);

      res.json({ success: true, records: verify.rows });
    } catch(e) {
      console.error('[product-catalog 500fg-sku]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Migration 007: Fix 500FG micron ratings ──────────────────────────────────
  // GET /api/migrate/product-catalog-fix-500fg?key=elim2026admin
  // Corrects SM-OR (2µm) and PM-OR (30µm) per Parker datasheet 15332 Rev G.
  app.get('/api/migrate/product-catalog-fix-500fg', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '007_fix_500fg_micron_ratings.sql'), 'utf8'
      );
      await client.query(sql);

      const verify = await client.query(`
        SELECT pe.element_code,
               (pe.protection_spec->>'micron_nominal')::int AS micron_nominal,
               agm.is_baseline,
               agm.protection_level,
               agm.operational_objective,
               mec.is_primary
        FROM product_element pe
        JOIN alternative_group_member agm ON agm.element_id = pe.id
        JOIN alternative_group ag ON ag.id = agm.group_id AND ag.group_code = 'HYDROCORE-2010'
        LEFT JOIN model_element_compatibility mec ON mec.product_element_id = pe.id
          AND mec.product_model_id = (SELECT id FROM product_model WHERE model_code = '500FG')
        WHERE pe.element_code IN ('2010SM-OR', '2010TM-OR', '2010PM-OR')
        ORDER BY agm.rank_in_group
      `);

      res.json({
        success: true,
        message: 'Migration 007: 500FG micron ratings corrected per Parker datasheet 15332 Rev G',
        elements: verify.rows,
      });
    } catch(e) {
      console.error('[product-catalog fix-500fg]', e.message);
      res.status(500).json({ success: false, error: e.message });
    } finally { await client.end(); }
  });

  // ── Inspect: Phase B planning data ──────────────────────────────────────────
  // GET /api/migrate/phase-b-inspect?key=elim2026admin
  // Returns MACROCORE alternative group candidates (grouped by codigo_base)
  // and INTEKCORE housing sample — used to plan Phase B migration structure.
  app.get('/api/migrate/phase-b-inspect', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();

      // MACROCORE: groups with 2+ SKUs — these are alternative group candidates
      const macroGroups = await client.query(`
        SELECT
          codigo_base,
          COUNT(*)                              AS variant_count,
          array_agg(sku ORDER BY sku)           AS skus,
          MIN(installation_type)                AS installation_type,
          array_agg(description ORDER BY sku)   AS descriptions
        FROM elimfilters_catalog
        WHERE REPLACE(technology, '™', '') = 'MACROCORE'
          AND codigo_base IS NOT NULL
        GROUP BY codigo_base
        HAVING COUNT(*) > 1
        ORDER BY variant_count DESC, codigo_base
        LIMIT 30
      `);

      // MACROCORE: single-SKU entries (no alternatives)
      const macroSingle = await client.query(`
        SELECT COUNT(DISTINCT codigo_base) AS single_sku_groups
        FROM elimfilters_catalog
        WHERE REPLACE(technology, '™', '') = 'MACROCORE'
          AND codigo_base IS NOT NULL
        GROUP BY codigo_base
        HAVING COUNT(*) = 1
      `);

      // MACROCORE: installation_type breakdown
      const macroInstall = await client.query(`
        SELECT installation_type, COUNT(*) AS total_skus,
               COUNT(DISTINCT codigo_base) AS unique_bases
        FROM elimfilters_catalog
        WHERE REPLACE(technology, '™', '') = 'MACROCORE'
        GROUP BY installation_type
        ORDER BY total_skus DESC
      `);

      // INTEKCORE: sample of housing records with full data
      const intekSample = await client.query(`
        SELECT sku, codigo_base, installation_type, description
        FROM elimfilters_catalog
        WHERE REPLACE(technology, '™', '') = 'INTEKCORE'
        ORDER BY installation_type, sku
        LIMIT 30
      `);

      // INTEKCORE: installation_type breakdown
      const intekInstall = await client.query(`
        SELECT installation_type, COUNT(*) AS total_skus,
               COUNT(DISTINCT codigo_base) AS unique_bases
        FROM elimfilters_catalog
        WHERE REPLACE(technology, '™', '') = 'INTEKCORE'
        GROUP BY installation_type
        ORDER BY total_skus DESC
      `);

      res.json({
        macrocore: {
          alternative_group_candidates: macroGroups.rows,
          single_sku_count:             macroSingle.rows.length,
          installation_type_breakdown:  macroInstall.rows,
        },
        intekcore: {
          installation_type_breakdown: intekInstall.rows,
          sample:                      intekSample.rows,
        },
      });
    } catch(e) {
      console.error('[phase-b-inspect]', e.message);
      res.status(500).json({ error: e.message });
    } finally { await client.end(); }
  });

  // ── Inspect: elimfilters_catalog data grouped by technology ─────────────────
  // GET /api/migrate/catalog-inspect?key=elim2026admin
  app.get('/api/migrate/catalog-inspect', async (req, res) => {
    if (req.query.key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
    const client = new Client(dbConfig);
    try {
      await client.connect();

      // Technologies present
      const techs = await client.query(`
        SELECT technology, COUNT(*) AS total,
               COUNT(DISTINCT filter_type) AS filter_types,
               COUNT(DISTINCT installation_type) AS install_types
        FROM elimfilters_catalog
        WHERE technology IS NOT NULL
        GROUP BY technology
        ORDER BY total DESC
      `);

      // Per-technology: filter_types, installation_types, sample codigo_base values
      const detail = {};
      for (const row of techs.rows) {
        const tech = row.technology;

        const breakdown = await client.query(`
          SELECT filter_type, installation_type, COUNT(*) AS cnt
          FROM elimfilters_catalog
          WHERE technology = $1
          GROUP BY filter_type, installation_type
          ORDER BY cnt DESC
        `, [tech]);

        const samples = await client.query(`
          SELECT sku, codigo_base, filter_type, installation_type, description
          FROM elimfilters_catalog
          WHERE technology = $1
          ORDER BY sku
          LIMIT 8
        `, [tech]);

        detail[tech] = {
          total: parseInt(row.total),
          breakdown: breakdown.rows,
          samples: samples.rows,
        };
      }

      res.json({ technologies: techs.rows, detail });
    } catch(e) {
      res.status(500).json({ error: e.message });
    } finally { await client.end(); }
  });

};
