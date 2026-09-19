#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();

export function parseArgs(argv = process.argv.slice(2)) {
  return Object.fromEntries(argv.map((arg) => {
    const [key, ...value] = arg.replace(/^--/, '').split('=');
    return [key, value.join('=')];
  }));
}

export function parseFleetguardMechanicalSpecs(text = '') {
  const clean = String(text).replace(/\r/g, '');
  const value = (label) => {
    const match = clean.match(new RegExp(`${label}\\s*[\\t ]+([^\\n]+)`, 'i'));
    return match?.[1]?.trim() || null;
  };
  return {
    thread_size: value('Thread Size'),
    gasket_inside_diameter: value('Gasket Inside Diameter'),
    largest_outside_diameter: value('Largest Outside Diameter'),
    gasket_outside_diameter: value('Gasket Outside Diameter'),
    height: value('Height')
  };
}
export function assertCompleteMechanicalSpecs(specs) {
  const required = [
    'thread_size',
    'gasket_inside_diameter',
    'largest_outside_diameter',
    'gasket_outside_diameter',
    'height'
  ];
  const missing = required.filter((key) => !specs?.[key]);
  if (missing.length) {
    throw new Error(`STOP_MECHANICAL_SPEC_MISSING:${missing.join(',')}`);
  }
  return true;
}

function runJson(script, argv) {
  const result = spawnSync(process.execPath, [script, ...argv], {
    cwd: ROOT,
    encoding: 'utf8',
    env: process.env,
    timeout: 120000,
    maxBuffer: 32 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `FAILED:${script}`).trim());
  }
  return JSON.parse(result.stdout);
}
async function loadBrowser() {
  try { return (await import('playwright')).chromium; }
  catch {
    try { return (await import('patchright')).chromium; }
    catch { throw new Error('STOP_MECHANICAL_BROWSER_TOOL_MISSING'); }
  }
}

async function fetchOfficialMechanicalSpecs(productUrl, code) {
  const chromium = await loadBrowser();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ locale: 'en-US', viewport: { width: 1440, height: 1400 } });
    const response = await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!response?.ok()) throw new Error(`STOP_MECHANICAL_PRODUCT_PAGE_HTTP_${response?.status() || 0}`);
    await page.waitForTimeout(7000);
    const bodyText = await page.locator('body').innerText();
    if (!bodyText.toUpperCase().includes(code)) throw new Error('STOP_MECHANICAL_PRODUCT_CODE_NOT_ON_PAGE');
    const specs = parseFleetguardMechanicalSpecs(bodyText);
    assertCompleteMechanicalSpecs(specs);
    return { body_text: bodyText, specs, resolved_url: page.url() };
  } finally {
    await browser.close();
  }
}
export function buildMechanicalEvidence({ code, productUrl, source, specs }) {
  return {
    schema_version: '1.0',
    evidence_type: 'ELIMFILTERS_MECHANICAL_REFERENCE',
    status: 'PASS',
    manufacturer: 'FLEETGUARD',
    competitor_code: code,
    product_page: productUrl,
    resolved_official_page_url: source.resolved_official_page_url,
    source_image_path: source.source_image_path,
    source_image_sha256: source.source_image_sha256,
    screenshot_path: source.screenshot_path,
    screenshot_sha256: source.screenshot_sha256,
    official_specs: specs,
    vertical_filter_geometry: 'Preserve the exact upright LF691A canister silhouette, end contours, diameter, height-to-diameter ratio and all visible seams from the fresh official source image.',
    horizontal_filter_geometry: 'Preserve the exact horizontal LF691A body and the complete front-facing mounting interface from the fresh official source image; no generic substitute or redraw is permitted.',
    overall_silhouette: 'Exact LF691A silhouette from the current Fleetguard source image is immutable.',
    body_proportions: `Official largest OD ${specs.largest_outside_diameter}; official height ${specs.height}. Preserve the source-image proportions exactly.`,
    top_rim: 'Preserve the exact rolled/rimmed end geometry visible in the current official source image.'
  };
}
export function completeMechanicalEvidence(base) {
  const specs = base.official_specs;
  return {
    ...base,
    baseplate_or_open_end: 'The horizontal filter mounting face is a hard mechanical lock. Preserve the exact metal plate contour, recesses, reliefs, central opening, surrounding ports and their spatial relationships from the official source image.',
    thread_geometry: `Official Fleetguard thread size: ${specs.thread_size}. Preserve the exact central threaded opening geometry shown in the source; generic threaded faces are forbidden.`,
    gasket_geometry: `Official gasket ID: ${specs.gasket_inside_diameter}; official gasket OD: ${specs.gasket_outside_diameter}. Preserve exact annular gasket placement and proportions from the source image.`,
    inlet_hole_count_shape_and_positions: 'Preserve the exact visible inlet-port count, individual shapes, diameters, angular positions and spacing from the source image. Do not infer, add, remove, regularize or substitute holes.',
    support_pattern: 'Preserve every visible stamped-metal support, recess, land and relief on the mounting face exactly as shown by the official source.',
    central_support_or_perforation_pattern: 'Preserve the exact central opening and all immediately surrounding mechanical detail from the official source; no generic spin-on baseplate pattern is allowed.',
    camera_perspective: 'Preserve the official source perspective and the mounting-face viewing angle so the mechanical interface remains directly auditable.',
    relative_scale: 'Both depicted filters represent LF691A; preserve their source-relative scale and common physical proportions.',
    composition: 'Use the fresh Fleetguard LF691A source image as the sole geometry authority. Rendering must be an edit of this source, not a newly invented product.',
    mechanical_lock: {
      mounting_face_exact_match_required: true,
      central_thread_exact_match_required: true,
      gasket_exact_match_required: true,
      inlet_ports_exact_match_required: true,
      body_geometry_exact_match_required: true,
      generic_spin_on_face_forbidden: true,
      other_sku_geometry_forbidden: true
    }
  };
}
async function main() {
  const args = parseArgs();
  const brand = String(args.brand || '').toUpperCase();
  const code = String(args.code || '').toUpperCase();
  const productUrl = args['product-url'];
  if (brand !== 'FLEETGUARD' || !code || !productUrl) {
    throw new Error('Usage: --brand=FLEETGUARD --code=<code> --product-url=<official-product-url>');
  }

  const source = runJson('product-identity/scripts/acquire-manufacturer-source.mjs', [
    `--brand=${brand}`,
    `--code=${code}`,
    `--product-url=${productUrl}`
  ]);
  if (!source.verified_fresh_source || source.cache_used || source.previous_master_used) {
    throw new Error('STOP_MECHANICAL_FRESH_SOURCE_POLICY_FAILED');
  }
  if (!source.source_image_sha256 || !source.screenshot_sha256) {
    throw new Error('STOP_MECHANICAL_SOURCE_HASH_MISSING');
  }

  const official = await fetchOfficialMechanicalSpecs(productUrl, code);
  const evidence = completeMechanicalEvidence(buildMechanicalEvidence({
    code, productUrl, source, specs: official.specs
  }));

  const outDir = args['out-dir'] || path.join('product-identity', 'geometry-evidence');
  await fs.mkdir(outDir, { recursive: true });
  const evidencePath = args.out || path.join(outDir, `${code}.json`);
  await fs.writeFile(evidencePath, JSON.stringify(evidence, null, 2) + '\n');

  console.log(JSON.stringify({
    ok: true,
    status: 'MECHANICAL_REFERENCE_VALIDATED',
    manufacturer: brand,
    competitor_code: code,
    product_url: productUrl,
    resolved_official_page_url: official.resolved_url,
    source_image_sha256: source.source_image_sha256,
    screenshot_sha256: source.screenshot_sha256,
    evidence_path: evidencePath,
    official_specs: official.specs,
    geometry_status: 'PASS',
    mechanical_lock: evidence.mechanical_lock
  }, null, 2));
}

const direct = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (direct) main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    status: 'STOP_REVIEW',
    reason: error.message
  }, null, 2));
  process.exit(2);
});