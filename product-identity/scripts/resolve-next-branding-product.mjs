#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'patchright';
import { resolveCompetitorSku } from './resolve-competitor-sku.mjs';

const ROOT = process.cwd();
const PILOT_PLAN = 'product-identity/hd-standard/pilots/pilot-matrix-plan.v1.json';
const MASTER_DIR = 'product-identity/production-master';
const CATEGORY_URL = 'https://www.fleetguard.com/es/category/SpinOnLubeFilters';
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

export function deriveNextSequenceProduct({ orderedCodes, masters, targetCount }) {
  if (!Array.isArray(orderedCodes) || orderedCodes.length < targetCount) {
    throw new Error('STOP_OFFICIAL_SEQUENCE_INCOMPLETE');
  }

  const approvedByPosition = new Map();
  for (const master of masters) {
    const pilot = pilotPositionFromMaster(master);
    const code = sourceCodeFromMaster(master);
    const state = approvalStateFromMaster(master);
    if (!pilot || !code || !APPROVED.has(state)) continue;
    approvedByPosition.set(pilot.position, { code, state, sku: master.sku ?? null });
  }

  let completedPrefix = 0;
  for (let position = 1; position <= targetCount; position += 1) {
    const approved = approvedByPosition.get(position);
    if (!approved) break;
    const official = norm(orderedCodes[position - 1]);
    if (official !== approved.code) {
      throw new Error(`STOP_SEQUENCE_CONTINUITY_MISMATCH:${position}:${approved.code}:${official}`);
    }
    completedPrefix = position;
  }
  if (completedPrefix >= targetCount) {
    return {
      status: 'PILOT_SEQUENCE_COMPLETE',
      completed_prefix: completedPrefix,
      target_count: targetCount,
      next: null
    };
  }

  const nextPosition = completedPrefix + 1;
  return {
    status: 'REFERENCE_SELECTED',
    completed_prefix: completedPrefix,
    target_count: targetCount,
    next: {
      position: nextPosition,
      total: 20,
      competitor_brand: 'FLEETGUARD',
      competitor_code: norm(orderedCodes[nextPosition - 1]),
      product_url: `https://www.fleetguard.com/product/${norm(orderedCodes[nextPosition - 1])}`
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
async function discoverOfficialPageOne() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ locale: 'es-ES', viewport: { width: 1440, height: 1200 } });
    const response = await page.goto(CATEGORY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!response?.ok()) throw new Error(`STOP_FLEETGUARD_CATEGORY_HTTP_${response?.status() || 0}`);

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const snapshot = await page.evaluate(() => ({
        text: document.body?.innerText || '',
        links: [...document.querySelectorAll('a[href*="/product/"]')].map((a) => a.href)
      }));
      const ordered = [];
      const seen = new Set();
      const pushCode = (raw) => {
        const code = String(raw || '').toUpperCase();
        if (!/^LF[A-Z0-9-]+$/.test(code) || seen.has(code)) return;
        seen.add(code);
        ordered.push(code);
      };
      for (const href of snapshot.links) {
        const match = href.match(/\/product\/([^/?#]+)/i);
        if (match?.[1]) pushCode(match[1]);
      }
      if (ordered.length < 20) {
        for (const code of (snapshot.text.match(/\bLF[A-Z0-9-]+\b/gi) || [])) pushCode(code);
      }
      if (ordered.length >= 20) {
        const pageMatch = snapshot.text.match(/P[aá]gina\s+1\s+de\s+(\d+)/i);
        return {
          category_url: CATEGORY_URL,
          reported_pages: pageMatch ? Number(pageMatch[1]) : null,
          ordered_codes: ordered.slice(0, 20)
        };
      }
      await page.mouse.wheel(0, 1400);
      await page.waitForTimeout(1000);
    }
    throw new Error('STOP_FLEETGUARD_SEQUENCE_NOT_RENDERED');
  } finally {
    await browser.close();
  }
}
async function main() {
  const activePilot = await loadActivePilot();
  const official = await discoverOfficialPageOne();
  const masters = await loadProductionMasters();
  const selection = deriveNextSequenceProduct({
    orderedCodes: official.ordered_codes,
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
      category_url: official.category_url,
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