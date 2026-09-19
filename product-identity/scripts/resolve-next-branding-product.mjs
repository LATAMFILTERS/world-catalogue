#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'patchright';
import { resolveCompetitorSku } from './resolve-competitor-sku.mjs';

const ROOT = process.cwd();
const PILOT_PLAN = 'product-identity/hd-standard/pilots/pilot-matrix-plan.v1.json';
const MASTER_DIR = 'product-identity/production-master';
const WEBSTORE_ID = '0ZEPL0000001Jv34AE';
const COMMERCE_API_VERSION = 'v67.0';
const APPROVED = new Set(['FINAL_APPROVED', 'APPROVED_GOLDEN_MASTER']);

const norm = (value) => String(value || '').trim().toUpperCase();
const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));

function parsePosition(value) {
  const match = String(value || '').match(/^(\d+)\s*\/\s*(\d+)$/);
  return match ? { position: Number(match[1]), total: Number(match[2]) } : null;
}

export function sourceCodeFromMaster(master = {}) {
  return norm(
    master.sourceCrossReference?.partNumber ??
    master.technical_source?.cross_reference?.code ??
    master.source_geometry?.code ??
    ''
  ) || null;
}
export function approvalStateFromMaster(master = {}) {
  return norm(
    master.visualMaster?.status ??
    master.media?.approval_state ??
    master.status ??
    ''
  ) || null;
}

export function pilotPositionFromMaster(master = {}) {
  return parsePosition(
    master.pilotPosition ??
    master.media?.pilot_position ??
    master.workflow?.currentPosition ??
    ''
  );
}

export function deriveNextSequenceProduct({ orderedProducts, masters, targetCount }) {
  if (!Array.isArray(orderedProducts) || orderedProducts.length < targetCount) {
    throw new Error('STOP_OFFICIAL_SEQUENCE_INCOMPLETE');
  }

  const approvedCodes = new Set();
  for (const master of masters) {
    const code = sourceCodeFromMaster(master);
    const state = approvalStateFromMaster(master);
    if (!code || !APPROVED.has(state)) continue;
    approvedCodes.add(code);
  }

  let completedPrefix = 0;
  for (let index = 0; index < targetCount; index += 1) {
    const product = orderedProducts[index];
    if (!approvedCodes.has(norm(product?.code))) break;
    completedPrefix = index + 1;
  }

  if (completedPrefix >= targetCount) {
    return {
      status: 'PILOT_SEQUENCE_COMPLETE',
      completed_prefix: completedPrefix,
      target_count: targetCount,
      next: null
    };
  }

  const product = orderedProducts[completedPrefix];
  return {
    status: 'REFERENCE_SELECTED',
    completed_prefix: completedPrefix,
    target_count: targetCount,
    next: {
      position: completedPrefix + 1,
      total: targetCount,
      catalog_page: product.catalog_page,
      catalog_position: product.catalog_position,
      competitor_brand: 'FLEETGUARD',
      competitor_code: norm(product.code),
      product_description: product.description,
      product_url: `https://www.fleetguard.com/product/${norm(product.code)}`
    }
  };
}

async function loadActivePilot() {
  const plan = await readJson(path.join(ROOT, PILOT_PLAN));
  const active = plan.sequence?.find((item) => item.status === 'active');
  if (!active) throw new Error('STOP_NO_ACTIVE_PRODUCT_IMAGE_PILOT');
  if (active.family !== 'spin_on') throw new Error(`STOP_UNSUPPORTED_ACTIVE_PILOT:${active.family}`);
  return active;
}

async function loadProductionMasters() {
  const dir = path.join(ROOT, MASTER_DIR);
  const names = (await fs.readdir(dir)).filter((name) => name.endsWith('.json'));
  const masters = [];
  for (const name of names) {
    try { masters.push(await readJson(path.join(dir, name))); } catch {}
  }
  return masters;
}
async function fetchFleetguardJson(url) {
  const response = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'ELIMFILTERS-branding-sequence/1.0' }
  });
  if (!response.ok) throw new Error(`STOP_FLEETGUARD_API_HTTP_${response.status}`);
  return response.json();
}

async function discoverOfficialSequence(activePilot) {
  const eligibleDescriptionPrefix = String(activePilot.eligible_product_description_prefix || '').trim().toLowerCase();
  if (!activePilot.category_id || !activePilot.category_url || !eligibleDescriptionPrefix) {
    throw new Error('STOP_ACTIVE_PILOT_SOURCE_SCOPE_INCOMPLETE');
  }

  const browser = await chromium.launch({ headless: true });
  let snapshot = null;
  try {
    const page = await browser.newPage({ locale: 'en-US', viewport: { width: 1440, height: 1200 } });
    const response = await page.goto(activePilot.category_url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!response?.ok()) throw new Error(`STOP_FLEETGUARD_CATEGORY_HTTP_${response?.status() || 0}`);

    for (let attempt = 0; attempt < 30; attempt += 1) {
      snapshot = await page.evaluate(() => ({
        text: document.body?.innerText || '',
        cards: [...document.querySelectorAll('h2.product-name')].map((element, index) => ({
          code: String(element.textContent || '').trim().toUpperCase(),
          product_id: element.getAttribute('data-id') || '',
          catalog_position: index + 1
        }))
      }));
      if (snapshot.cards.length >= 20) break;
      await page.mouse.wheel(0, 1400);
      await page.waitForTimeout(1000);
    }
  } finally {
    await browser.close();
  }

  if (!snapshot || snapshot.cards.length < 20) {
    throw new Error('STOP_FLEETGUARD_SEQUENCE_NOT_RENDERED');
  }

  const ids = snapshot.cards.map((card) => card.product_id).filter(Boolean);
  if (ids.length !== snapshot.cards.length) {
    throw new Error('STOP_FLEETGUARD_PRODUCT_IDS_INCOMPLETE');
  }

  const batchParams = new URLSearchParams({
    ids: ids.join(','),
    includeAttributeSetInfo: 'true',
    includeQuantityRule: 'true',
    includeProductSellingModels: 'true',
    includeGroupByAttributeVariationInfo: 'true',
    language: 'en',
    asGuest: 'true',
    htmlEncode: 'false'
  });
  const batchUrl = `https://www.fleetguard.com/webruntime/api/services/data/${COMMERCE_API_VERSION}/commerce/webstores/${WEBSTORE_ID}/products?${batchParams}`;
  const batch = await fetchFleetguardJson(batchUrl);
  const byId = new Map((batch.products || []).map((product) => [product.id, product]));

  const eligible = snapshot.cards.flatMap((card) => {
    const product = byId.get(card.product_id) || {};
    const fields = product.fields || {};
    const code = norm(fields.ProductCode || fields.StockKeepingUnit || product.name || card.code);
    const description = String(fields.CNPR_ShortDescRT__c || fields.Description || '').trim();
    if (!code || !description.toLowerCase().startsWith(eligibleDescriptionPrefix)) return [];
    return [{
      code,
      description,
      catalog_page: 1,
      catalog_position: card.catalog_position
    }];
  });

  if (eligible.length < activePilot.target_count) {
    throw new Error('STOP_OFFICIAL_SEQUENCE_INCOMPLETE');
  }

  const pageMatch =
    snapshot.text.match(/Page\s+1\s+of\s+(\d+)/i) ||
    snapshot.text.match(/P[aá]gina\s+1\s+de\s+(\d+)/i);

  return {
    category_url: activePilot.category_url,
    category_id: activePilot.category_id,
    raw_total: null,
    reported_pages: pageMatch ? Number(pageMatch[1]) : null,
    ordered_products: eligible
  };
}
async function main() {
  const activePilot = await loadActivePilot();
  const official = await discoverOfficialSequence(activePilot);
  const masters = await loadProductionMasters();
  const selection = deriveNextSequenceProduct({
    orderedProducts: official.ordered_products,
    masters,
    targetCount: activePilot.target_count
  });

  let catalogResolution = null;
  if (selection.next) {
    catalogResolution = await resolveCompetitorSku({
      sourceCode: selection.next.competitor_code,
      sourceBrand: 'FLEETGUARD',
      duty: 'HEAVY_DUTY'
    });
  }

  const result = {
    ok: true,
    status: selection.status,
    authority: {
      pilot_plan: PILOT_PLAN,
      active_pilot_id: activePilot.pilot_id,
      manufacturer: activePilot.manufacturer,
      filter_type: activePilot.filter_type,
      eligible_product_description_prefix: activePilot.eligible_product_description_prefix,
      category_id: official.category_id,
      category_url: official.category_url,
      raw_category_total: official.raw_total,
      official_reported_pages: official.reported_pages
    },
    completed_prefix: selection.completed_prefix,
    target_count: selection.target_count,
    next: selection.next,
    catalog_resolution: catalogResolution,
    captured_at: new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));
}

const direct = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (direct) main().catch((error) => {
  console.error(JSON.stringify({ ok: false, status: 'STOP_REVIEW', reason: error.message }, null, 2));
  process.exit(2);
});