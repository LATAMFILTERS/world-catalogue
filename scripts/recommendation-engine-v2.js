/**
 * recommendation-engine-v2.js
 * Deterministic recommendation engine for ELIMFILTERS product catalog.
 *
 * Architecture:
 *   INPUT: element_code or part_number
 *       ↓
 *   COMPATIBILITY GATE (binary — fail = DISQUALIFIED, no override)
 *       ↓
 *   CLASSIFICATION: BASELINE / TYPE_A (upgrade) / TYPE_B (operational alternative)
 *       ↓
 *   SCORING: confidence × protection_alignment
 *       ↓
 *   TRACEABILITY CHAIN (every result cites its source document)
 *       ↓
 *   OUTPUT: structured result — AI uses this as explanation input only
 *
 * AI role: explanation layer only. This engine is the source of truth.
 * No AI-generated product claims. Every recommendation is DB-grounded.
 */

'use strict';

// ── Confidence weights ────────────────────────────────────────────────────────
const CONFIDENCE_WEIGHTS = {
  CONFIRMED: 1.0,
  INFERRED:  0.7,
  PENDING:   0.3,
};

// ── Confidence floor label ────────────────────────────────────────────────────
function confidenceLabel(weight) {
  if (weight >= 1.0) return 'HIGH';
  if (weight >= 0.7) return 'MEDIUM';
  return 'LOW';
}

// ── findAlternatives ──────────────────────────────────────────────────────────
// Core RE function. Returns scored + classified alternatives for an element.
// All results pass the compatibility gate (compatibility_class must match).
// TYPE_A: protection_level > baseline → technology upgrade
// TYPE_B: protection_level <= baseline, different operational_objective
//
async function findAlternatives(client, elementCode) {
  const code = elementCode.trim().toUpperCase();

  // Step 1: Resolve the queried element
  const elementResult = await client.query(`
    SELECT pe.*, pf.family_name, pf.technology, pf.system
    FROM product_element pe
    JOIN product_family pf ON pf.id = pe.family_id
    WHERE UPPER(pe.element_code) = $1
    LIMIT 1
  `, [code]);

  if (!elementResult.rows.length) {
    return { status: 'NOT_FOUND', element_code: code };
  }
  const element = elementResult.rows[0];

  // Step 2: Find the alternative group this element belongs to
  const groupResult = await client.query(`
    SELECT
      ag.id AS group_id, ag.group_code, ag.group_name,
      ag.technology, ag.system, ag.compatibility_class,
      ag.differentiation_axis, ag.compatibility_basis,
      ag.compatibility_source, ag.compatibility_verified_at,
      ag.compatibility_verified_by,
      agm.is_baseline, agm.protection_level,
      agm.operational_objective, agm.rank_in_group
    FROM alternative_group ag
    JOIN alternative_group_member agm ON agm.group_id = ag.id
    WHERE agm.element_id = $1
    LIMIT 1
  `, [element.id]);

  if (!groupResult.rows.length) {
    return {
      status: 'NO_GROUP',
      element_code: code,
      message: 'Element exists but is not assigned to any alternative group.',
    };
  }
  const groupRow = groupResult.rows[0];

  // Step 3: Get baseline protection level (required for TYPE_A/TYPE_B split)
  const baselineResult = await client.query(`
    SELECT agm.protection_level, pe.element_code
    FROM alternative_group_member agm
    JOIN product_element pe ON pe.id = agm.element_id
    WHERE agm.group_id = $1 AND agm.is_baseline = TRUE
    LIMIT 1
  `, [groupRow.group_id]);

  if (!baselineResult.rows.length) {
    return {
      status: 'VALIDATION_ERROR',
      code: 'baseline_missing',
      group_code: groupRow.group_code,
      message: `Group '${groupRow.group_code}' has no baseline member. Cannot classify TYPE_A/TYPE_B.`,
    };
  }
  const baseline_level = parseInt(baselineResult.rows[0].protection_level);
  const baseline_code  = baselineResult.rows[0].element_code;

  // Step 4: Get all group members
  const membersResult = await client.query(`
    SELECT
      pe.id AS element_id,
      pe.element_code,
      pe.elimfilters_sku,
      pe.media_grade,
      pe.seal_type,
      pe.compatibility_class,
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
  `, [groupRow.group_id]);

  // Step 5: Apply compatibility gate + classify + score each member
  const results = membersResult.rows.map(m => {
    // ── Compatibility gate ──────────────────────────────────────────────────
    if (m.compatibility_class !== element.compatibility_class) {
      return {
        element_code:  m.element_code,
        gate:          'DISQUALIFIED',
        reason:        'compatibility_class_mismatch',
        candidate_class: m.compatibility_class,
        required_class:  element.compatibility_class,
      };
    }

    // ── Classification ──────────────────────────────────────────────────────
    let alternative_type;
    if (m.is_baseline) {
      alternative_type = 'BASELINE';
    } else if (parseInt(m.protection_level) > baseline_level) {
      alternative_type = 'TYPE_A';   // technology upgrade
    } else {
      alternative_type = 'TYPE_B';   // operational alternative
    }

    // ── Score ───────────────────────────────────────────────────────────────
    // Using group-level confidence (all members verified via same source doc)
    const confidence_weight = CONFIDENCE_WEIGHTS['CONFIRMED'];  // group source doc
    const protection_score  = parseInt(m.protection_level) / 5;
    const composite_score   = (confidence_weight * 0.6) + (protection_score * 0.4);

    return {
      element_code:        m.element_code,
      elimfilters_sku:     m.elimfilters_sku,
      media_grade:         m.media_grade,
      seal_type:           m.seal_type,
      compatibility_class: m.compatibility_class,
      protection_spec:     m.protection_spec,
      description:         m.description,
      is_baseline:         m.is_baseline,
      protection_level:    parseInt(m.protection_level),
      operational_objective: m.operational_objective,
      compatibility_note:  m.compatibility_note,
      rank_in_group:       m.rank_in_group,
      alternative_type,
      gate:            'PASS',
      score:           parseFloat(composite_score.toFixed(4)),
      confidence: {
        level:  'CONFIRMED',
        label:  'HIGH',
        weight: confidence_weight,
        source: groupRow.compatibility_source,
        basis:  groupRow.compatibility_basis,
        verified_at: groupRow.compatibility_verified_at,
      },
    };
  });

  const passed       = results.filter(r => r.gate === 'PASS');
  const disqualified = results.filter(r => r.gate === 'DISQUALIFIED');

  const baseline_member = passed.find(r => r.alternative_type === 'BASELINE') || null;
  const type_a          = passed.filter(r => r.alternative_type === 'TYPE_A')
                                .sort((a, b) => a.protection_level - b.protection_level);
  const type_b          = passed.filter(r => r.alternative_type === 'TYPE_B')
                                .sort((a, b) => a.rank_in_group - b.rank_in_group);

  // Confidence floor across all passed members
  const min_confidence_weight = passed.reduce(
    (min, m) => m.confidence.weight < min ? m.confidence.weight : min, 1.0
  );

  return {
    status: 'OK',
    queried_element: {
      element_code:        element.element_code,
      elimfilters_sku:     element.elimfilters_sku,
      technology:          element.technology,
      system:              element.system,
      compatibility_class: element.compatibility_class,
      media_grade:         element.media_grade,
      protection_spec:     element.protection_spec,
    },
    group: {
      group_code:           groupRow.group_code,
      group_name:           groupRow.group_name,
      technology:           groupRow.technology,
      compatibility_class:  groupRow.compatibility_class,
      differentiation_axis: groupRow.differentiation_axis,
      compatibility_source: groupRow.compatibility_source,
      compatibility_basis:  groupRow.compatibility_basis,
    },
    baseline:  baseline_member,
    TYPE_A:    type_a,
    TYPE_B:    type_b,
    disqualified,
    summary: {
      total_candidates:   passed.length,
      type_a_count:       type_a.length,
      type_b_count:       type_b.length,
      disqualified_count: disqualified.length,
    },
    traceability: {
      engine:             'Recommendation Engine v2',
      version:            '2.0.0',
      method:             'compatibility_class_gate + protection_level_ranking',
      source_document:    groupRow.compatibility_source,
      confidence_floor:   confidenceLabel(min_confidence_weight),
      all_confirmed:      min_confidence_weight >= 1.0,
      baseline_element:   baseline_code,
    },
  };
}

// ── findCrossReferenceRE ──────────────────────────────────────────────────────
// Resolves an external part number (Racor, OEM, competitor) to an ELIMFILTERS
// product in the product catalog tables.
// Falls through to elimfilters_catalog brand_crossrefs if not found in catalog.
//
async function findCrossReferenceRE(client, partNumber) {
  const q = partNumber.trim().toUpperCase();

  // Check product_element by element_code or racor_equivalent
  const elementResult = await client.query(`
    SELECT pe.*, pf.family_name, pf.technology, pf.system
    FROM product_element pe
    JOIN product_family pf ON pf.id = pe.family_id
    WHERE UPPER(pe.element_code) = $1 OR UPPER(pe.racor_equivalent) = $1
    LIMIT 1
  `, [q]);

  if (elementResult.rows.length) {
    const el = elementResult.rows[0];
    return {
      status:  'FOUND',
      source:  'product_catalog.product_element',
      input:   partNumber,
      type:    'element',
      result: {
        element_code:    el.element_code,
        elimfilters_sku: el.elimfilters_sku,
        technology:      el.technology,
        system:          el.system,
        family_name:     el.family_name,
        racor_equivalent: el.racor_equivalent,
        compatibility_class: el.compatibility_class,
        media_grade:     el.media_grade,
      },
      confidence: 'CONFIRMED',
    };
  }

  // Check product_model by model_code or racor_equivalent
  const modelResult = await client.query(`
    SELECT pm.*, pf.family_name, pf.technology, pf.system
    FROM product_model pm
    JOIN product_family pf ON pf.id = pm.family_id
    WHERE UPPER(pm.model_code) = $1 OR UPPER(pm.racor_equivalent) = $1
    LIMIT 1
  `, [q]);

  if (modelResult.rows.length) {
    const m = modelResult.rows[0];
    return {
      status: 'FOUND',
      source: 'product_catalog.product_model',
      input:  partNumber,
      type:   'housing',
      result: {
        model_code:      m.model_code,
        elimfilters_sku: m.elimfilters_sku,
        technology:      m.technology,
        system:          m.system,
        family_name:     m.family_name,
        racor_equivalent: m.racor_equivalent,
        compatibility_class: m.compatibility_class,
        has_heater:      m.has_heater,
      },
      confidence: 'CONFIRMED',
    };
  }

  // Fall through to elimfilters_catalog brand_crossrefs
  const catalogResult = await client.query(`
    SELECT sku, technology, filter_type, description,
           brand_crossrefs, oem_codes, competitor_codes
    FROM elimfilters_catalog
    WHERE brand_crossrefs::text ILIKE $1
       OR oem_codes::text       ILIKE $1
       OR competitor_codes::text ILIKE $1
    LIMIT 3
  `, [`%${q}%`]);

  if (catalogResult.rows.length) {
    return {
      status: 'FOUND',
      source: 'elimfilters_catalog',
      input:  partNumber,
      type:   'catalog_match',
      results: catalogResult.rows.map(r => ({
        sku:         r.sku,
        technology:  r.technology,
        filter_type: r.filter_type,
        description: r.description,
      })),
      confidence: 'INFERRED',
      note: 'Match found in elimfilters_catalog cross-reference data. ' +
            'Not yet linked to product_catalog tables.',
    };
  }

  return {
    status:     'NOT_FOUND',
    input:      partNumber,
    confidence: 'INSUFFICIENT_EVIDENCE',
    message:    'Part number not found in product catalog or elimfilters_catalog cross-references.',
  };
}

// ── getHousingWithAlternatives ────────────────────────────────────────────────
// Returns a housing model and all its compatible elements, with each element's
// alternative group pre-loaded for the Recommendation Engine.
//
async function getHousingWithAlternatives(client, modelCode) {
  const code = modelCode.trim().toUpperCase();

  const modelResult = await client.query(`
    SELECT pm.*, pf.family_name, pf.technology, pf.system
    FROM product_model pm
    JOIN product_family pf ON pf.id = pm.family_id
    WHERE UPPER(pm.model_code) = $1 OR UPPER(pm.racor_equivalent) = $1
    LIMIT 1
  `, [code]);

  if (!modelResult.rows.length) {
    return { status: 'NOT_FOUND', model_code: code };
  }
  const model = modelResult.rows[0];

  const elementsResult = await client.query(`
    SELECT
      pe.element_code, pe.elimfilters_sku, pe.media_grade,
      pe.seal_type, pe.compatibility_class, pe.protection_spec, pe.description,
      mec.is_primary, mec.compatibility_confidence,
      mec.compatibility_source, mec.compatibility_method
    FROM model_element_compatibility mec
    JOIN product_element pe ON pe.id = mec.product_element_id
    WHERE mec.product_model_id = $1
    ORDER BY mec.is_primary DESC, pe.media_grade
  `, [model.id]);

  // For each element, get its alternative group membership
  const elements = await Promise.all(elementsResult.rows.map(async el => {
    const groupResult = await client.query(`
      SELECT ag.group_code, agm.is_baseline, agm.protection_level,
             agm.operational_objective, agm.rank_in_group
      FROM alternative_group_member agm
      JOIN alternative_group ag ON ag.id = agm.group_id
      WHERE agm.element_id = (
        SELECT id FROM product_element WHERE element_code = $1 LIMIT 1
      )
      LIMIT 1
    `, [el.element_code]);

    const group_info = groupResult.rows.length ? groupResult.rows[0] : null;

    return {
      ...el,
      compatibility_confidence_weight: CONFIDENCE_WEIGHTS[el.compatibility_confidence] || 0.5,
      group_code:           group_info?.group_code || null,
      is_baseline:          group_info?.is_baseline || false,
      protection_level:     group_info ? parseInt(group_info.protection_level) : null,
      operational_objective: group_info?.operational_objective || null,
    };
  }));

  return {
    status: 'OK',
    model: {
      model_code:          model.model_code,
      elimfilters_sku:     model.elimfilters_sku,
      technology:          model.technology,
      system:              model.system,
      family_name:         model.family_name,
      compatibility_class: model.compatibility_class,
      has_heater:          model.has_heater,
      heater_voltage_v:    model.heater_voltage_v,
      description:         model.description,
    },
    compatible_elements: elements,
    element_count: elements.length,
    primary_element: elements.find(e => e.is_primary) || null,
    traceability: {
      engine:  'Recommendation Engine v2',
      version: '2.0.0',
      method:  'model_element_compatibility + compatibility_class_gate',
    },
  };
}

module.exports = {
  findAlternatives,
  findCrossReferenceRE,
  getHousingWithAlternatives,
  CONFIDENCE_WEIGHTS,
  confidenceLabel,
};
