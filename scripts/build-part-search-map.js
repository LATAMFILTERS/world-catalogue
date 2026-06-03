'use strict';

/**
 * build-part-search-map.js
 * Phase 4B — ELIMFILTERS AI Citation Index
 *
 * Builds PART_SEARCH_MAP.json from CITATION_INDEX.json by traversing three
 * path types:
 *   A: Problem → ContaminationMode → Technology → ProductFamily
 *   B: Industry → Problem → ContaminationMode → Technology → ProductFamily
 *   C: Technology → ProductFamily (direct)
 *
 * Output: elimfilters-vault/00-meta/PART_SEARCH_MAP.json
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 1. Load Citation Index
// ---------------------------------------------------------------------------
const CITATION_INDEX_PATH = path.join(
  __dirname,
  '..',
  'elimfilters-vault',
  '00-meta',
  'CITATION_INDEX.json'
);
const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  'elimfilters-vault',
  '00-meta',
  'PART_SEARCH_MAP.json'
);

const citationIndex = JSON.parse(fs.readFileSync(CITATION_INDEX_PATH, 'utf8'));
const entities = citationIndex.entities;
const edges = citationIndex.graph.edges;

// ---------------------------------------------------------------------------
// 2. Lookup helpers
// ---------------------------------------------------------------------------

/** Return all entities of a given type. */
function getByType(type) {
  return Object.values(entities).filter((e) => e.type === type);
}

/** Get all entity keys that are targets of edges FROM fromKey with the given relation. */
function getEdgeTargets(fromKey, relation) {
  return edges
    .filter((e) => e.from === fromKey && e.relation === relation)
    .map((e) => e.to)
    .filter((k) => entities[k]);
}

/** Get all entity keys that are sources of edges TO toKey with the given relation (inverse). */
function getEdgeSources(toKey, relation) {
  return edges
    .filter((e) => e.to === toKey && e.relation === relation)
    .map((e) => e.from)
    .filter((k) => entities[k]);
}

// ---------------------------------------------------------------------------
// 3. Traversal helpers
// ---------------------------------------------------------------------------

/**
 * Given a Technology key, find all ProductFamily keys that use that technology.
 * ProductFamily → uses_technology → Technology  (edge direction in graph)
 * So we need inverse: find PF keys where uses_technology points TO techKey.
 */
function getProductFamiliesForTechnology(techKey) {
  return getEdgeSources(techKey, 'uses_technology');
}

/**
 * Given a ContaminationMode key, find Technology keys that resolve it.
 * ContaminationMode → resolved_by → Technology
 */
function getTechnologiesForContaminationMode(cmKey) {
  return getEdgeTargets(cmKey, 'resolved_by');
}

/**
 * Given a Problem key, find ContaminationMode keys via root_contamination edges.
 * Problem → root_contamination → ContaminationMode
 */
function getContaminationModesForProblem(problemKey) {
  return getEdgeTargets(problemKey, 'root_contamination');
}

/**
 * Given an Industry key, find Problem keys where the problem has an
 * industry_frequency edge TO that industry.
 * Problem → industry_frequency → Industry  (inverse: look up sources)
 */
function getProblemsForIndustry(industryKey) {
  return getEdgeSources(industryKey, 'industry_frequency');
}

// ---------------------------------------------------------------------------
// 4. Build traversal paths
// ---------------------------------------------------------------------------

const traversalPaths = [];
let pathCounter = 0;

function makePathId(type, key) {
  pathCounter++;
  return `PATH_${type}_${key}_${String(pathCounter).padStart(3, '0')}`;
}

function stepObj(key) {
  const e = entities[key];
  return {
    key,
    type: e ? e.type : 'unknown',
    name: e ? e.name || key : key,
  };
}

// --- PATH TYPE A: Problem → ContaminationMode → Technology → ProductFamily ---
const problems = getByType('problem');

for (const problem of problems) {
  const problemKey = problem.key || Object.keys(entities).find((k) => entities[k] === problem);

  // Find the key if not directly available as problem.key
  const pKey = Object.keys(entities).find((k) => entities[k] === problem);

  const contamModes = getContaminationModesForProblem(pKey);

  if (contamModes.length === 0) {
    // Problem with no contamination mode path
    const pathId = makePathId('A', pKey);
    traversalPaths.push({
      path_id: pathId,
      path_type: 'A',
      entry_node: pKey,
      entry_type: 'problem',
      industry: null,
      steps: [stepObj(pKey)],
      terminal_product_families: [],
      valid: false,
      validation_failures: ['V003: No terminal ProductFamily reached'],
    });
    continue;
  }

  for (const cmKey of contamModes) {
    const technologies = getTechnologiesForContaminationMode(cmKey);

    if (technologies.length === 0) {
      const pathId = makePathId('A', pKey);
      traversalPaths.push({
        path_id: pathId,
        path_type: 'A',
        entry_node: pKey,
        entry_type: 'problem',
        industry: null,
        steps: [stepObj(pKey), stepObj(cmKey)],
        terminal_product_families: [],
        valid: false,
        validation_failures: ['V003: No terminal ProductFamily reached (no technologies for contamination mode)'],
      });
      continue;
    }

    for (const techKey of technologies) {
      const productFamilies = getProductFamiliesForTechnology(techKey);

      const steps = [stepObj(pKey), stepObj(cmKey), stepObj(techKey)];
      const terminalPFs = productFamilies;

      const pathId = makePathId('A', pKey);
      const validationFailures = validatePath(steps, terminalPFs);

      traversalPaths.push({
        path_id: pathId,
        path_type: 'A',
        entry_node: pKey,
        entry_type: 'problem',
        industry: null,
        steps,
        terminal_product_families: terminalPFs,
        valid: validationFailures.length === 0,
        validation_failures: validationFailures.length > 0 ? validationFailures : undefined,
      });
    }
  }
}

// --- PATH TYPE B: Industry → Problem → ContaminationMode → Technology → ProductFamily ---
const industries = getByType('industry');

for (const industry of industries) {
  const indKey = Object.keys(entities).find((k) => entities[k] === industry);
  const industryProblems = getProblemsForIndustry(indKey);

  if (industryProblems.length === 0) {
    // Industry with no problems — no path
    continue;
  }

  for (const pKey of industryProblems) {
    const contamModes = getContaminationModesForProblem(pKey);

    if (contamModes.length === 0) {
      const pathId = makePathId('B', indKey);
      traversalPaths.push({
        path_id: pathId,
        path_type: 'B',
        entry_node: indKey,
        entry_type: 'industry',
        industry: indKey,
        steps: [stepObj(indKey), stepObj(pKey)],
        terminal_product_families: [],
        valid: false,
        validation_failures: ['V003: No terminal ProductFamily reached'],
      });
      continue;
    }

    for (const cmKey of contamModes) {
      const technologies = getTechnologiesForContaminationMode(cmKey);

      if (technologies.length === 0) {
        const pathId = makePathId('B', indKey);
        traversalPaths.push({
          path_id: pathId,
          path_type: 'B',
          entry_node: indKey,
          entry_type: 'industry',
          industry: indKey,
          steps: [stepObj(indKey), stepObj(pKey), stepObj(cmKey)],
          terminal_product_families: [],
          valid: false,
          validation_failures: ['V003: No terminal ProductFamily reached (no technologies)'],
        });
        continue;
      }

      for (const techKey of technologies) {
        const productFamilies = getProductFamiliesForTechnology(techKey);

        const steps = [stepObj(indKey), stepObj(pKey), stepObj(cmKey), stepObj(techKey)];
        const terminalPFs = productFamilies;

        const pathId = makePathId('B', indKey);
        const validationFailures = validatePath(steps, terminalPFs);

        traversalPaths.push({
          path_id: pathId,
          path_type: 'B',
          entry_node: indKey,
          entry_type: 'industry',
          industry: indKey,
          steps,
          terminal_product_families: terminalPFs,
          valid: validationFailures.length === 0,
          validation_failures: validationFailures.length > 0 ? validationFailures : undefined,
        });
      }
    }
  }
}

// --- PATH TYPE C: Technology → ProductFamily (direct) ---
const technologies = getByType('technology');

for (const tech of technologies) {
  const techKey = Object.keys(entities).find((k) => entities[k] === tech);
  const productFamilies = getProductFamiliesForTechnology(techKey);

  const steps = [stepObj(techKey)];
  const terminalPFs = productFamilies;

  const pathId = makePathId('C', techKey);
  const validationFailures = validatePath(steps, terminalPFs);

  traversalPaths.push({
    path_id: pathId,
    path_type: 'C',
    entry_node: techKey,
    entry_type: 'technology',
    industry: null,
    steps,
    terminal_product_families: terminalPFs,
    valid: validationFailures.length === 0,
    validation_failures: validationFailures.length > 0 ? validationFailures : undefined,
  });
}

// ---------------------------------------------------------------------------
// 5. Validation function
// ---------------------------------------------------------------------------

/**
 * Validate a traversal path:
 *   V001: All step keys exist in CITATION_INDEX entities
 *   V002: All terminal ProductFamily keys exist in CITATION_INDEX entities
 *   V003: Path has at least one terminal ProductFamily
 *   V004: No duplicate keys in steps (cycle check)
 */
function validatePath(steps, terminalPFs) {
  const failures = [];

  // V001: All step keys exist
  for (const step of steps) {
    if (!entities[step.key]) {
      failures.push(`V001: Step key '${step.key}' not found in CITATION_INDEX`);
    }
  }

  // V002: All terminal PF keys exist
  for (const pfKey of terminalPFs) {
    if (!entities[pfKey]) {
      failures.push(`V002: Terminal ProductFamily key '${pfKey}' not found in CITATION_INDEX`);
    }
  }

  // V003: At least one terminal ProductFamily
  if (terminalPFs.length === 0) {
    failures.push('V003: Path has no terminal ProductFamily');
  }

  // V004: No duplicate keys in steps
  const stepKeys = steps.map((s) => s.key);
  const uniqueKeys = new Set(stepKeys);
  if (uniqueKeys.size !== stepKeys.length) {
    const dupes = stepKeys.filter((k, i) => stepKeys.indexOf(k) !== i);
    failures.push(`V004: Duplicate keys in steps (cycle): ${[...new Set(dupes)].join(', ')}`);
  }

  return failures;
}

// ---------------------------------------------------------------------------
// 6. Build product_family_index
// ---------------------------------------------------------------------------
const allProductFamilies = getByType('product-family');
const productFamilyIndex = {};

for (const pf of allProductFamilies) {
  const pfKey = Object.keys(entities).find((k) => entities[k] === pf);

  const reachableVia = traversalPaths
    .filter((p) => p.terminal_product_families.includes(pfKey))
    .map((p) => p.path_id);

  const entryProblems = [
    ...new Set(
      traversalPaths
        .filter((p) => p.terminal_product_families.includes(pfKey) && p.entry_type === 'problem')
        .map((p) => p.entry_node)
    ),
  ];

  const entryIndustries = [
    ...new Set(
      traversalPaths
        .filter((p) => p.terminal_product_families.includes(pfKey) && p.entry_type === 'industry')
        .map((p) => p.entry_node)
    ),
  ];

  const entryTechnologies = [
    ...new Set(
      traversalPaths
        .filter((p) => p.terminal_product_families.includes(pfKey) && p.entry_type === 'technology')
        .map((p) => p.entry_node)
    ),
  ];

  // Get uses_technology, meets_standards, target_industries from edges
  const usesTechnology = getEdgeTargets(pfKey, 'uses_technology');
  const meetsStandards = getEdgeTargets(pfKey, 'meets_standards');
  const targetIndustries = getEdgeTargets(pfKey, 'target_industries');

  productFamilyIndex[pfKey] = {
    name: pf.name || pfKey,
    reachable_via: reachableVia,
    entry_problems: entryProblems,
    entry_industries: entryIndustries,
    entry_technologies: entryTechnologies,
    uses_technology: usesTechnology.length === 1 ? usesTechnology[0] : usesTechnology,
    meets_standards: meetsStandards,
    target_industries: targetIndustries,
  };
}

// ---------------------------------------------------------------------------
// 7. Unmapped entity analysis
// ---------------------------------------------------------------------------

// ProductFamily keys with no path reaching them
const allPFKeys = allProductFamilies.map(
  (pf) => Object.keys(entities).find((k) => entities[k] === pf)
);
const reachedPFKeys = new Set(
  traversalPaths.flatMap((p) => p.terminal_product_families)
);
const productFamiliesUnreachable = allPFKeys.filter((k) => !reachedPFKeys.has(k));

// Technology keys with no ProductFamily
const allTechKeys = technologies.map(
  (t) => Object.keys(entities).find((k) => entities[k] === t)
);
const technologiesWithoutFamilies = allTechKeys.filter(
  (techKey) => getProductFamiliesForTechnology(techKey).length === 0
);

// Problem keys with no complete path to a ProductFamily
const allProblemKeys = problems.map(
  (p) => Object.keys(entities).find((k) => entities[k] === p)
);
const problemsWithoutPaths = allProblemKeys.filter((pKey) => {
  const completePaths = traversalPaths.filter(
    (p) =>
      p.entry_node === pKey &&
      p.path_type === 'A' &&
      p.valid &&
      p.terminal_product_families.length > 0
  );
  return completePaths.length === 0;
});

// ---------------------------------------------------------------------------
// 8. Coverage summary
// ---------------------------------------------------------------------------
const validPaths = traversalPaths.filter((p) => p.valid);
const typeACount = traversalPaths.filter((p) => p.path_type === 'A').length;
const typeBCount = traversalPaths.filter((p) => p.path_type === 'B').length;
const typeCCount = traversalPaths.filter((p) => p.path_type === 'C').length;
const typeAValid = traversalPaths.filter((p) => p.path_type === 'A' && p.valid).length;
const typeBValid = traversalPaths.filter((p) => p.path_type === 'B' && p.valid).length;
const typeCValid = traversalPaths.filter((p) => p.path_type === 'C' && p.valid).length;

// Problems reaching at least one PF
const problemsCoverage = allProblemKeys.filter((pKey) =>
  traversalPaths.some(
    (p) => p.entry_node === pKey && p.valid && p.terminal_product_families.length > 0
  )
).length;

// Industries reaching at least one PF
const industriesCoverage = industries
  .map((i) => Object.keys(entities).find((k) => entities[k] === i))
  .filter((indKey) =>
    traversalPaths.some(
      (p) => p.entry_node === indKey && p.valid && p.terminal_product_families.length > 0
    )
  ).length;

// Technologies reaching at least one PF
const techsCoverage = allTechKeys.filter((techKey) =>
  getProductFamiliesForTechnology(techKey).length > 0
).length;

const coverageSummary = {
  problems_with_complete_paths: `${problemsCoverage}/${allProblemKeys.length}`,
  industries_with_complete_paths: `${industriesCoverage}/${industries.length}`,
  technologies_with_product_families: `${techsCoverage}/${allTechKeys.length}`,
  product_families_reachable: `${reachedPFKeys.size}/${allPFKeys.length}`,
};

// ---------------------------------------------------------------------------
// 9. Assemble output
// ---------------------------------------------------------------------------
const output = {
  meta: {
    version: '1.0',
    generated: new Date().toISOString(),
    source_index: 'elimfilters-vault/00-meta/CITATION_INDEX.json',
    source_index_version: citationIndex.meta.version,
    path_count: traversalPaths.length,
    valid_path_count: validPaths.length,
    product_family_count: allPFKeys.length,
    coverage_summary: coverageSummary,
    generator: 'scripts/build-part-search-map.js',
    note: 'Phase 4B — Part Search traversal map from Citation Index',
  },
  traversal_paths: traversalPaths,
  product_family_index: productFamilyIndex,
  unmapped_entities: {
    product_families_unreachable: productFamiliesUnreachable,
    technologies_without_families: technologiesWithoutFamilies,
    problems_without_paths: problemsWithoutPaths,
  },
};

// ---------------------------------------------------------------------------
// 10. Write output
// ---------------------------------------------------------------------------
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');

// ---------------------------------------------------------------------------
// 11. Print summary
// ---------------------------------------------------------------------------
console.log('PART SEARCH MAP COMPILER — Phase 4B');
console.log('=====================================');
console.log(`Traversal paths built:    ${traversalPaths.length}`);
console.log(`  Type A (Problem→PF):    ${typeACount}  (${typeAValid} valid)`);
console.log(`  Type B (Industry→PF):   ${typeBCount}  (${typeBValid} valid)`);
console.log(`  Type C (Technology→PF): ${typeCCount}  (${typeCValid} valid)`);
console.log(`Valid paths:              ${validPaths.length}`);
console.log(`Invalid paths:            ${traversalPaths.length - validPaths.length}`);
console.log('');
console.log(`Product families mapped:  ${reachedPFKeys.size}/${allPFKeys.length}`);
console.log(`Unmapped families:        ${productFamiliesUnreachable.length}`);
console.log(`Technologies without PF:  ${technologiesWithoutFamilies.length}`);
console.log(`Problems without paths:   ${problemsWithoutPaths.length}`);
console.log('');
console.log(`OUTPUT: elimfilters-vault/00-meta/PART_SEARCH_MAP.json`);
