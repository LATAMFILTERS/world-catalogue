'use strict';

// Guards the single-source-of-truth agreement between:
//   - frontend/src/lib/canonical-technologies.ts (the code the live site renders from)
//   - docs/brand/TECHNOLOGY_REGISTRY.md (the human-authored registry)
//   - frontend/catalogue.json (industry-level feature copy)
// and confirms the two retired postinstall patch scripts (apply-syntrax-source-fix.js,
// apply-intekcore-source-fix.js) never come back into package.json or a workflow.
//
// Run: node --test tests/canonical-technology-registry.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// domain slug (canonical-technologies.ts) -> System: label used in TECHNOLOGY_REGISTRY.md
const DOMAIN_TO_SYSTEM_LABEL = {
  'air-intake': 'Air Intake & Airflow Protection',
  'fuel-cleanliness': 'Fuel Cleanliness Protection',
  'lubrication': 'Lubrication Protection',
  'hydraulic': 'Hydraulic Protection',
  'cooling-system': 'Cooling System Protection',
};

function readCanonicalTechnologies() {
  const src = fs.readFileSync(
    path.join(ROOT, 'frontend/src/lib/canonical-technologies.ts'),
    'utf8'
  );
  const entries = [];
  const blockRe = /slug:\s*'([^']+)'[^}]*?name:\s*'([^']+)'[^}]*?domain:\s*'([^']+)'/gs;
  let m;
  while ((m = blockRe.exec(src))) {
    entries.push({ slug: m[1], name: m[2], domain: m[3] });
  }
  return entries;
}

function readTechnologyRegistryMd() {
  const md = fs.readFileSync(path.join(ROOT, 'docs/brand/TECHNOLOGY_REGISTRY.md'), 'utf8');
  const entries = {};
  // Sections look like:  \## NAME™ ... System: \n\n LABEL \n\n ... \---
  // The System: label can contain an escaped "\&", so the capture group must
  // not exclude backslash (only newline) — de-escape after capturing.
  const blockRe = /\\##\s*([A-Z0-9/]+™?)[\s\S]*?System:\s*\n+\s*([^\n]+?)\s*\n/g;
  let m;
  while ((m = blockRe.exec(md))) {
    const name = m[1].trim();
    const system = m[2].trim().replace(/\\&/g, '&');
    entries[name] = system;
  }
  return entries;
}

test('canonical-technologies.ts and TECHNOLOGY_REGISTRY.md agree on every technology-system association', () => {
  const canonical = readCanonicalTechnologies();
  const registry = readTechnologyRegistryMd();

  assert.ok(canonical.length > 0, 'canonical-technologies.ts parsed zero entries — parser or file broke');
  assert.ok(Object.keys(registry).length > 0, 'TECHNOLOGY_REGISTRY.md parsed zero entries — parser or file broke');

  for (const { name, domain } of canonical) {
    const expectedSystem = DOMAIN_TO_SYSTEM_LABEL[domain];
    assert.ok(expectedSystem, `Unknown domain "${domain}" for ${name} — add it to DOMAIN_TO_SYSTEM_LABEL`);

    const registrySystem = registry[name];
    assert.ok(
      registrySystem,
      `${name} exists in canonical-technologies.ts (domain: ${domain}) but has no matching "## ${name}" entry in TECHNOLOGY_REGISTRY.md`
    );
    assert.equal(
      registrySystem,
      expectedSystem,
      `${name}: canonical-technologies.ts says "${domain}" (${expectedSystem}), but TECHNOLOGY_REGISTRY.md says "${registrySystem}"`
    );
  }
});

test('catalogue.json has no industry "features" entry pairing a technology with the wrong domain label', () => {
  const canonical = readCanonicalTechnologies();
  const nameToDomainLabel = {};
  const shortLabel = {
    'air-intake': 'AIR INTAKE',
    'fuel-cleanliness': 'FUEL',
    'lubrication': 'LUBRICATION',
    'hydraulic': 'HYDRAULIC',
    'cooling-system': 'COOLANT',
  };
  for (const { name, domain } of canonical) {
    nameToDomainLabel[name.replace('™', '').toUpperCase()] = shortLabel[domain];
  }

  const catalogue = JSON.parse(fs.readFileSync(path.join(ROOT, 'frontend/catalogue.json'), 'utf8'));
  const violations = [];

  for (const item of catalogue.industries || []) {
    for (const feature of item.features || []) {
      const m = feature.match(/^([A-Z /]+?)\s*\/\s*([A-Za-z]+)™?$/);
      if (!m) continue;
      const statedDomain = m[1].trim();
      const techKey = m[2].toUpperCase();
      const expectedDomain = nameToDomainLabel[techKey];
      if (!expectedDomain) continue; // not one of the tracked technologies
      const matches =
        statedDomain === expectedDomain ||
        statedDomain.startsWith(expectedDomain) ||
        expectedDomain.startsWith(statedDomain);
      if (!matches) {
        violations.push(`${item.name}: feature "${feature}" declares "${statedDomain}" but ${techKey} belongs to "${expectedDomain}"`);
      }
    }
  }

  assert.deepEqual(violations, [], `catalogue.json has mismatched technology/domain features:\n${violations.join('\n')}`);
});

test('the two retired postinstall patch scripts never come back', () => {
  const retiredScripts = ['apply-syntrax-source-fix.js', 'apply-intekcore-source-fix.js'];

  for (const script of retiredScripts) {
    assert.equal(
      fs.existsSync(path.join(ROOT, 'scripts', script)),
      false,
      `scripts/${script} was reintroduced — it was intentionally deleted and its content baked permanently into techPagesData.ts`
    );
  }

  const pkg = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
  for (const script of retiredScripts) {
    assert.equal(
      pkg.includes(script),
      false,
      `package.json references ${script} — it must not be re-added to postinstall/build/dev scripts`
    );
  }

  const workflowsDir = path.join(ROOT, '.github/workflows');
  if (fs.existsSync(workflowsDir)) {
    for (const file of fs.readdirSync(workflowsDir)) {
      const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
      for (const script of retiredScripts) {
        assert.equal(
          content.includes(script),
          false,
          `.github/workflows/${file} references ${script} — retired script must not run in CI`
        );
      }
    }
  }
});

test('FH Series (turbine elements) is attributed only to TURBOCORE™, never to the retired HYDROCORE/SERIES™', () => {
  const productRegistry = fs.readFileSync(path.join(ROOT, 'docs/brand/PRODUCT_REGISTRY.md'), 'utf8');
  const fhBlock = productRegistry.match(/\\## FH Series[\s\S]*?\\---/);
  assert.ok(fhBlock, 'FH Series section not found in PRODUCT_REGISTRY.md');
  assert.match(fhBlock[0], /TURBOCORE™/, 'FH Series must list TURBOCORE™ as its technology');
  assert.doesNotMatch(
    fhBlock[0],
    /HYDROCORE\/SERIES™/,
    'FH Series must not attribute HYDROCORE/SERIES™ (retired) as its technology'
  );

  const catalogue = JSON.parse(fs.readFileSync(path.join(ROOT, 'frontend/catalogue.json'), 'utf8'));
  const turbocoreProduct = (catalogue.industries || [])
    .concat(catalogue.products || [], catalogue.technologies || [])
    .find((p) => p.name === 'Turbocore Series');
  if (turbocoreProduct) {
    assert.deepEqual(
      turbocoreProduct.techTags || [],
      ['TURBOCORE™'],
      'catalogue.json "Turbocore Series" techTags must be exactly ["TURBOCORE™"] — no other technology may be asserted without an explicit approved source'
    );
    for (const field of ['features', 'benefits']) {
      const hasHydrocore = (turbocoreProduct[field] || []).some((line) => /HYDROCORE™/.test(line));
      assert.equal(
        hasHydrocore,
        false,
        `catalogue.json "Turbocore Series" ${field} must not assert HYDROCORE™ without an explicit approved source`
      );
    }
  }

  const serverSrc = fs.readFileSync(path.join(ROOT, 'server-original.js'), 'utf8');
  assert.match(
    serverSrc,
    /'\/technologies\/hydrocore-series':\s*'\/technologies\/turbocore'/,
    '/technologies/hydrocore-series must redirect to /technologies/turbocore, not /technologies/hydrocore'
  );
});

test('llm.txt never presents retired technology names as public AI knowledge — only server-original.js may hold them, as HTTP redirect keys', () => {
  const llm = fs.readFileSync(path.join(ROOT, 'frontend/public/llm.txt'), 'utf8');

  for (const retired of ['AQUAGUARD', 'COOLTECH', 'HYDROCORE/SERIES', 'HYDROCORE SERIES']) {
    assert.equal(
      llm.toUpperCase().includes(retired),
      false,
      `frontend/public/llm.txt must not mention retired name "${retired}" anywhere — it is public content served to AI systems, not a redirect mechanism`
    );
  }

  assert.match(llm, /^TURBOCORE™$/m, 'llm.txt must list TURBOCORE™ as an active technology');
});

test('FG Series and AQUAGUARD/SERIES™ have no technology reassignment until an official decision is recorded', () => {
  const productRegistry = fs.readFileSync(path.join(ROOT, 'docs/brand/PRODUCT_REGISTRY.md'), 'utf8');
  const fgBlock = productRegistry.match(/\\## FG Series[\s\S]*?\\---/);
  assert.ok(fgBlock, 'FG Series section not found in PRODUCT_REGISTRY.md');
  assert.doesNotMatch(
    fgBlock[0],
    /TURBOCORE™|HYDROCORE™|HYDROCORE\/SERIES™/,
    'FG Series must not be auto-assigned to any technology — only an explicit official decision may add one'
  );

  for (const activeFile of [
    'docs/brand/TECHNOLOGY_REGISTRY.md',
    'docs/brand/SYSTEM_REGISTRY.md',
    'docs/brand/PRODUCT_REGISTRY.md',
    'docs/brand/PROBLEM_REGISTRY.md',
    'docs/brand/BRAND_ARCHITECTURE.md',
    'docs/brand/AUDIT.md',
  ]) {
    const content = fs.readFileSync(path.join(ROOT, activeFile), 'utf8');
    assert.equal(
      content.includes('HYDROCORE/SERIES™'),
      false,
      `${activeFile} still references the retired HYDROCORE/SERIES™`
    );
    assert.equal(
      content.includes('AQUAGUARD/SERIES'),
      false,
      `${activeFile} must not assign AQUAGUARD/SERIES™ to any technology without an official decision`
    );
  }
});
