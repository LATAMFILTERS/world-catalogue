#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.HERMES_GROQ_MODEL || 'groq/compound';
const INPUT = path.resolve(process.env.HERMES_HD_PACKAGING_PLAN || 'hermes/hd-packaging/latest.json');
const OUTPUT_DIR = path.resolve(process.env.HERMES_HD_PACKAGING_EVIDENCE_DIR || 'hermes/official-evidence');
const STATE_DIR = path.resolve('hermes/state/hd-packaging');
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? Math.max(1, Number(LIMIT_ARG.slice(8))) : Math.max(1, Number(process.env.HERMES_HD_PACKAGING_RESEARCH_LIMIT || 50));
const MANUFACTURER_ARG = process.argv.find((arg) => arg.startsWith('--manufacturer='));
const MANUFACTURER_FILTER = MANUFACTURER_ARG ? MANUFACTURER_ARG.slice(15).trim().toUpperCase() : null;
const TIMEOUT_MS = Math.max(10_000, Number(process.env.HERMES_RESEARCH_TIMEOUT_MS || 30_000));
const MAX_EVIDENCE_CHARS = Math.max(2000, Number(process.env.HERMES_RESEARCH_MAX_EVIDENCE_CHARS || 18000));

function hash(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }
function normalizePart(value) { return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function normalizeManufacturer(value) { return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function stripFence(value) { return String(value || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim(); }
function atomic(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); const tmp = `${file}.tmp-${process.pid}`; fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); fs.renameSync(tmp, file); }
function readJson(file, fallback = null) { try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); } catch { return fallback; } }
function hostname(url) { try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch { return null; } }
function plain(html) { return String(html).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim(); }

function buildTasks(plan) {
  const orgPlan = plan.manufacturer_plan || {};
  const orgByNormalizedName = new Map();
  for (const value of Object.values(orgPlan)) {
    const names = [value.organization_id, value.organization_name].filter(Boolean);
    for (const name of names) orgByNormalizedName.set(normalizeManufacturer(name), value);
  }

  const tasks = new Map();
  for (const row of plan.unresolved || []) {
    for (const ref of row.references || []) {
      const manufacturer = String(ref.manufacturer || '').trim();
      const partNumber = String(ref.part_number || '').trim();
      if (!manufacturer || !partNumber) continue;
      if (MANUFACTURER_FILTER && !normalizeManufacturer(manufacturer).includes(MANUFACTURER_FILTER)) continue;
      const key = `${normalizeManufacturer(manufacturer)}::${normalizePart(partNumber)}`;
      if (!tasks.has(key)) {
        const org = orgByNormalizedName.get(normalizeManufacturer(manufacturer)) || null;
        tasks.set(key, {
          key,
          manufacturer,
          part_number: partNumber,
          normalized_part_number: normalizePart(partNumber),
          organization_id: org?.organization_id || null,
          organization_name: org?.organization_name || manufacturer,
          official_domain: org?.official_domain || null,
          affected_skus: new Set(),
          families: new Set(),
        });
      }
      const task = tasks.get(key);
      task.affected_skus.add(row.sku);
      task.families.add(row.family);
    }
  }

  return [...tasks.values()].map((task) => ({
    ...task,
    affected_skus: [...task.affected_skus].sort(),
    families: [...task.families].sort(),
  })).sort((a, b) => b.affected_skus.length - a.affected_skus.length || a.key.localeCompare(b.key));
}

function systemPrompt(task) {
  return `You are HERMES researching industrial filter packaging data. Use live web search and website visiting. Find the strongest PRIMARY/OFFICIAL source for manufacturer ${task.manufacturer}, part number ${task.part_number}. The goal is UNIT PACKAGED dimensions and UNIT PACKAGED weight, not bare product dimensions and not master-carton dimensions. Never infer, estimate, convert from unrelated products, or substitute a cross reference. If the official source does not provide all four required values, return UNRESOLVED. Prefer an official product page, official API, official technical PDF, or official catalogue. Return strict JSON only.`;
}

async function groqResearch(task, apiKey) {
  const body = {
    model: MODEL,
    temperature: 0,
    max_completion_tokens: 1800,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt(task) },
      { role: 'user', content: JSON.stringify({
        manufacturer: task.manufacturer,
        part_number: task.part_number,
        official_domain_hint: task.official_domain,
        required_json: {
          status: 'VERIFIED or UNRESOLVED',
          source_url: 'absolute official URL or null',
          source_type: 'official_api | official_pdf | aftermarket_catalogue | oem_catalogue | technical_bulletin',
          packaged_length: 'number or null',
          packaged_width: 'number or null',
          packaged_height: 'number or null',
          dimension_unit: 'cm | mm | in | m or null',
          packaged_weight: 'number or null',
          weight_unit: 'kg | g | lb or null',
          packaged_volume_m3: 'number or null',
          evidence_text: 'short exact-context paraphrase identifying the packaging fields',
          confidence: '0..1',
        },
      }) },
    ],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Groq-Model-Version': 'latest' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Groq HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Groq returned no content');
    return JSON.parse(stripFence(content));
  } finally {
    clearTimeout(timer);
  }
}

async function fetchEvidence(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': 'ELIMFILTERS-HERMES/2.1 (+hd-packaging-research)' } });
    if (!response.ok) return { ok: false, status: response.status, text: '', error: `HTTP ${response.status}` };
    const text = plain(await response.text()).slice(0, MAX_EVIDENCE_CHARS);
    return { ok: text.length >= 80, status: response.status, text, error: text.length >= 80 ? null : 'INSUFFICIENT_CONTENT' };
  } catch (error) {
    return { ok: false, status: null, text: '', error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

function convertLengthToCm(value, unit) {
  const n = Number(value); if (!Number.isFinite(n) || n <= 0) return null;
  const u = String(unit || '').toLowerCase();
  if (u === 'mm') return n / 10;
  if (u === 'in') return n * 2.54;
  if (u === 'm') return n * 100;
  if (u === 'cm') return n;
  return null;
}

function convertWeightToKg(value, unit) {
  const n = Number(value); if (!Number.isFinite(n) || n <= 0) return null;
  const u = String(unit || '').toLowerCase();
  if (u === 'g') return n / 1000;
  if (u === 'lb') return n / 2.2046226218;
  if (u === 'kg') return n;
  return null;
}

function validateResult(task, result, evidence) {
  const errors = [];
  if (result?.status !== 'VERIFIED') errors.push('status_not_verified');
  const sourceUrl = String(result?.source_url || '').trim();
  if (!/^https:\/\//i.test(sourceUrl)) errors.push('source_url_invalid');
  if (task.official_domain) {
    const expected = hostname(task.official_domain);
    const actual = hostname(sourceUrl);
    if (!expected || !actual || !(actual === expected || actual.endsWith(`.${expected}`))) errors.push('source_domain_not_official');
  }
  if (!evidence.ok) errors.push(`evidence_fetch_${evidence.error || 'failed'}`);
  if (evidence.text && !evidence.text.toUpperCase().replace(/[^A-Z0-9]/g,'').includes(task.normalized_part_number)) errors.push('part_number_not_visible_in_fetched_evidence');

  const length = convertLengthToCm(result?.packaged_length, result?.dimension_unit);
  const width = convertLengthToCm(result?.packaged_width, result?.dimension_unit);
  const height = convertLengthToCm(result?.packaged_height, result?.dimension_unit);
  const weight = convertWeightToKg(result?.packaged_weight, result?.weight_unit);
  if (![length,width,height,weight].every(Boolean)) errors.push('packaging_dimensions_or_weight_incomplete');
  if (!Number.isFinite(Number(result?.confidence)) || Number(result.confidence) < 0.75) errors.push('confidence_below_0_75');

  return {
    ok: errors.length === 0,
    errors,
    normalized: errors.length ? null : {
      unit_packaged_length_cm: Number(length.toFixed(3)),
      unit_packaged_width_cm: Number(width.toFixed(3)),
      unit_packaged_height_cm: Number(height.toFixed(3)),
      unit_packaged_weight_kg: Number(weight.toFixed(3)),
      unit_packaged_volume_m3: Number(result?.packaged_volume_m3) > 0 ? Number(Number(result.packaged_volume_m3).toFixed(6)) : null,
    },
  };
}

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is required for live HERMES packaging research');
  const plan = readJson(INPUT);
  if (!plan) throw new Error(`Packaging plan not found: ${INPUT}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(STATE_DIR, { recursive: true });

  const allTasks = buildTasks(plan);
  const statePath = path.join(STATE_DIR, 'research-state.json');
  const state = readJson(statePath, { schema_version: '1.0.0', completed: {}, unresolved: {} });
  const pending = allTasks.filter((task) => !state.completed[task.key]).slice(0, LIMIT);
  const records = [];
  const results = [];

  for (const task of pending) {
    try {
      const result = await groqResearch(task, apiKey);
      if (result?.status !== 'VERIFIED' || !result?.source_url) {
        state.unresolved[task.key] = { task, reason: result?.reason || 'NO_COMPLETE_OFFICIAL_PACKAGING_DATA', checked_at: new Date().toISOString() };
        results.push({ key: task.key, status: 'UNRESOLVED' });
        atomic(statePath, state);
        continue;
      }

      const evidence = await fetchEvidence(result.source_url);
      const validation = validateResult(task, result, evidence);
      if (!validation.ok) {
        state.unresolved[task.key] = { task, reason: validation.errors.join(';'), source_url: result.source_url, checked_at: new Date().toISOString() };
        results.push({ key: task.key, status: 'REJECTED', errors: validation.errors });
        atomic(statePath, state);
        continue;
      }

      const record = {
        organization_id: task.organization_id || normalizeManufacturer(task.manufacturer).toLowerCase().replace(/[^a-z0-9]+/g,'_'),
        organization_name: task.organization_name || task.manufacturer,
        manufacturer: task.manufacturer,
        part_number: task.part_number,
        product_family: task.families[0] || null,
        source_type: result.source_type || 'aftermarket_catalogue',
        source_url: result.source_url,
        source_hash: hash(evidence.text),
        captured_at: new Date().toISOString(),
        published_at: null,
        evidence_level: 'PRIMARY',
        workflow_status: 'PENDING_REVIEW',
        confidence: Number(result.confidence),
        approval_required: true,
        automatic_publication_allowed: false,
        dimensions: {
          packaged_length_cm: validation.normalized.unit_packaged_length_cm,
          packaged_width_cm: validation.normalized.unit_packaged_width_cm,
          packaged_height_cm: validation.normalized.unit_packaged_height_cm,
        },
        technical_specs: {
          unit_packaged_length_cm: validation.normalized.unit_packaged_length_cm,
          unit_packaged_width_cm: validation.normalized.unit_packaged_width_cm,
          unit_packaged_height_cm: validation.normalized.unit_packaged_height_cm,
          unit_packaged_weight_kg: validation.normalized.unit_packaged_weight_kg,
          unit_packaged_volume_m3: validation.normalized.unit_packaged_volume_m3,
        },
        research_context: {
          affected_skus: task.affected_skus,
          evidence_text: result.evidence_text || null,
          engine: 'GROQ_COMPOUND_LIVE_WEB',
          model: MODEL,
        },
      };
      records.push(record);
      state.completed[task.key] = { source_url: result.source_url, completed_at: new Date().toISOString(), affected_skus: task.affected_skus };
      delete state.unresolved[task.key];
      results.push({ key: task.key, status: 'VERIFIED', affected_skus: task.affected_skus.length, source_url: result.source_url });
      atomic(statePath, state);
    } catch (error) {
      state.unresolved[task.key] = { task, reason: String(error?.message || error), checked_at: new Date().toISOString() };
      results.push({ key: task.key, status: 'ERROR', error: String(error?.message || error) });
      atomic(statePath, state);
      if (/429|rate limit/i.test(String(error?.message || error))) break;
    }
  }

  let output = null;
  if (records.length) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    output = path.join(OUTPUT_DIR, `hd-packaging-official-evidence-${stamp}.json`);
    atomic(output, { schema_version: '1.0.0', generated_at: new Date().toISOString(), records, discoveries: records });
  }

  const summary = {
    total_distinct_reference_tasks: allTasks.length,
    attempted_this_run: results.length,
    verified: results.filter((r) => r.status === 'VERIFIED').length,
    unresolved: results.filter((r) => r.status === 'UNRESOLVED').length,
    rejected: results.filter((r) => r.status === 'REJECTED').length,
    errors: results.filter((r) => r.status === 'ERROR').length,
    evidence_output: output,
    state: path.relative(process.cwd(), statePath),
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(`[HERMES HD packaging research] ${error.stack || error.message}`);
  process.exit(1);
});
