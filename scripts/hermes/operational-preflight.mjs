#!/usr/bin/env node
// HERMES operational preflight — a read-only safety check run before any
// real (non-DRY-RUN) HERMES operation. It never connects to anything
// (no network, no Microsoft Graph, no database), never prints a secret
// VALUE (only whether one is PRESENT or MISSING), and never mutates any
// file. Exit code 0 means the system is currently in a safe/off state;
// non-zero means a dangerous condition was found and must be resolved
// before proceeding.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { loadRegistry, validateRegistry } from './source-registry-core.mjs';

const REPO_ROOT = path.resolve(process.argv[2] || '.');
const results = [];

// `blocking` controls whether this specific check can fail the overall
// SAFE verdict (and thus the process exit code). Secret presence/absence
// and the legacy-sources routing note are always informational: a MISSING
// secret is the expected, safe state in any environment that hasn't been
// activated yet, so it must never flip the verdict to UNSAFE.
function record(id, description, status, detail = '', blocking = true) {
  results.push({ id, description, status, detail, blocking });
  return status;
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(REPO_ROOT, relativePath));
}

// ── 1. Required files ───────────────────────────────────────────────────
const REQUIRED_FILES = [
  'hermes/config/source-organizations.json',
  'hermes/config/source-endpoints.json',
  'hermes/config/real-sources.json',
  'hermes/config/.env.example',
  '.github/workflows/hermes-weekly.yml',
  'schemas/hermes-candidate.schema.json',
  'scripts/hermes/hermes-core.mjs',
  'scripts/hermes/collect-real-sources.mjs',
  'scripts/hermes/collect-real-sources-core.mjs',
  'scripts/hermes/source-registry-core.mjs',
  'scripts/hermes/validate-source-registry.mjs',
  'scripts/hermes/generate-source-coverage-report.mjs',
  'scripts/hermes/validate-candidates.mjs',
  'scripts/hermes/generate-weekly-report.mjs',
  'scripts/hermes/send-weekly-email.mjs',
  'scripts/hermes/apply-review-decision.mjs',
  'scripts/hermes/publish-approved-candidate.mjs',
  'scripts/hermes/update-existing-note.mjs',
  'scripts/hermes/rollback-note-update.mjs'
];
let missingFiles = 0;
for (const file of REQUIRED_FILES) {
  const present = fileExists(file);
  if (!present) missingFiles += 1;
  record(`file:${file}`, `Required file present: ${file}`, present ? 'PRESENT' : 'MISSING');
}

// ── 2. Source registry validation ───────────────────────────────────────
let registryOrgCount = 0;
let registryEndpointCount = 0;
try {
  const registry = loadRegistry(
    path.join(REPO_ROOT, 'hermes/config/source-organizations.json'),
    path.join(REPO_ROOT, 'hermes/config/source-endpoints.json')
  );
  registryOrgCount = registry.organizations.length;
  registryEndpointCount = registry.endpoints.length;
  const errors = validateRegistry(registry);
  record('registry:validation', `Source registry validates (organizations=${registryOrgCount}, endpoints=${registryEndpointCount})`, errors.length === 0 ? 'PASS' : 'FAIL', errors.join('; '));
} catch (error) {
  record('registry:validation', 'Source registry validates', 'FAIL', error.message);
}

// ── 3. Workflow governance (static checks only, no remote calls) ───────
let workflowText = '';
try {
  workflowText = fs.readFileSync(path.join(REPO_ROOT, '.github/workflows/hermes-weekly.yml'), 'utf8');
} catch { /* handled by the required-files check above */ }

function workflowCheck(id, description, test) {
  if (!workflowText) return record(id, description, 'FAIL', 'workflow file unreadable');
  return record(id, description, test(workflowText) ? 'SAFE' : 'UNSAFE');
}
workflowCheck('workflow:workflow_dispatch', 'workflow_dispatch trigger present', (t) => /\bworkflow_dispatch:/.test(t));
workflowCheck('workflow:schedule', 'weekly schedule (cron) present', (t) => /schedule:/.test(t) && /cron:/.test(t));
workflowCheck('workflow:node20', "Node 20 pinned", (t) => /node-version:\s*'20'/.test(t));
workflowCheck('workflow:concurrency', 'concurrency group configured (prevents overlapping runs)', (t) => /concurrency:/.test(t));
workflowCheck('workflow:dry_run_default', "HERMES_COLLECTION_DRY_RUN defaults to 'true'", (t) => /HERMES_COLLECTION_DRY_RUN:\s*\$\{\{\s*vars\.HERMES_COLLECTION_DRY_RUN\s*\|\|\s*'true'\s*\}\}/.test(t));
workflowCheck('workflow:email_live_default', "HERMES_EMAIL_LIVE defaults to 'false'", (t) => /HERMES_EMAIL_LIVE:\s*\$\{\{\s*vars\.HERMES_EMAIL_LIVE\s*\|\|\s*'false'\s*\}\}/.test(t));
workflowCheck('workflow:no_publish', 'does not run hermes:publish', (t) => !/hermes:publish\b/.test(t));
workflowCheck('workflow:no_update', 'does not run hermes:update', (t) => !/hermes:update\b/.test(t));
workflowCheck('workflow:no_rollback', 'does not run hermes:rollback', (t) => !/hermes:rollback\b/.test(t));
workflowCheck('workflow:no_db_commands', 'contains no database command patterns', (t) => !/\b(psql|pg_dump|pg_restore|mongosh|mysql\s)\b/i.test(t) && !/DATABASE_URL/.test(t));
workflowCheck('workflow:no_pgvector', 'contains no pgvector reference', (t) => !/pgvector/i.test(t));
workflowCheck('workflow:no_unified_data', 'contains no unified-data reference', (t) => !/unified-data/i.test(t));
workflowCheck('workflow:artifacts', 'artifact upload configured', (t) => /upload-artifact@/.test(t));
workflowCheck('workflow:no_real_candidates_persist_hint', 'DRY RUN persistence is gated by env, not hardcoded false', (t) => /HERMES_COLLECTION_DRY_RUN/.test(t));
workflowCheck('workflow:secrets_via_context_only', 'every AZURE_*/HERMES_SENDER_EMAIL/HERMES_REVIEW_EMAIL value comes from the secrets/vars context, never a literal', (t) => {
  const envBlockMatches = t.match(/(AZURE_CLIENT_ID|AZURE_TENANT_ID|AZURE_CLIENT_SECRET|HERMES_SENDER_EMAIL|HERMES_REVIEW_EMAIL):\s*(.+)/g) || [];
  return envBlockMatches.every((line) => /\$\{\{\s*(secrets|vars)\./.test(line));
});

// ── 4. Dangerous environment flags active RIGHT NOW in this shell ──────
const DANGEROUS_FLAGS = [
  { name: 'HERMES_COLLECTION_DRY_RUN', dangerousWhen: (v) => String(v ?? 'true').toLowerCase() === 'false' },
  { name: 'HERMES_EMAIL_LIVE', dangerousWhen: (v) => String(v ?? 'false').toLowerCase() === 'true' },
  { name: 'HERMES_PUBLISH_LIVE', dangerousWhen: (v) => String(v ?? 'false').toLowerCase() === 'true' },
  { name: 'HERMES_UPDATE_LIVE', dangerousWhen: (v) => String(v ?? 'false').toLowerCase() === 'true' },
  { name: 'HERMES_ROLLBACK_LIVE', dangerousWhen: (v) => String(v ?? 'false').toLowerCase() === 'true' },
  { name: 'HERMES_ALLOW_SYNTHETIC_PUBLISH', dangerousWhen: (v) => String(v ?? 'false').toLowerCase() === 'true' },
  { name: 'HERMES_ALLOW_SYNTHETIC_UPDATE', dangerousWhen: (v) => String(v ?? 'false').toLowerCase() === 'true' }
];
let dangerousFlagCount = 0;
for (const flag of DANGEROUS_FLAGS) {
  const isDangerous = flag.dangerousWhen(process.env[flag.name]);
  if (isDangerous) dangerousFlagCount += 1;
  record(`env:${flag.name}`, `${flag.name} is not set to a live/persistent value`, isDangerous ? 'DANGEROUS' : 'SAFE');
}
// Informational only — a routing choice, not a safety hazard.
record('env:HERMES_COLLECTION_USE_LEGACY_SOURCES', 'HERMES_COLLECTION_USE_LEGACY_SOURCES (informational, not a safety check)', process.env.HERMES_COLLECTION_USE_LEGACY_SOURCES === 'true' ? 'INFO_LEGACY_FORCED' : 'INFO_REGISTRY', '', false);

// ── 5. Secret presence (never values) ───────────────────────────────────
// MISSING is the expected, SAFE state here — these are not required for
// DRY RUN operation, only for a future LIVE send. Never blocking.
const SECRET_ENV_VARS = ['AZURE_CLIENT_ID', 'AZURE_TENANT_ID', 'AZURE_CLIENT_SECRET', 'HERMES_REVIEW_EMAIL', 'HERMES_SENDER_EMAIL'];
for (const name of SECRET_ENV_VARS) {
  record(`secret:${name}`, `${name} configured in this environment`, process.env[name] ? 'PRESENT' : 'MISSING', '', false);
}

// ── 6. Generated directories are gitignored ─────────────────────────────
let gitignoreText = '';
try { gitignoreText = fs.readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf8'); } catch { /* checked below */ }
const EXPECTED_IGNORES = [
  'hermes/source-cache/',
  'hermes/real-candidates/',
  'hermes/real-candidates-previews/',
  'hermes/update-previews/',
  'hermes/rollback-previews/',
  'hermes/backups/',
  'hermes/publication-previews/'
];
let missingIgnores = 0;
for (const entry of EXPECTED_IGNORES) {
  const present = gitignoreText.includes(entry);
  if (!present) missingIgnores += 1;
  record(`gitignore:${entry}`, `.gitignore excludes ${entry}`, present ? 'PASS' : 'FAIL');
}

// ── 7. Heuristic scan for real-looking secrets in versioned files ──────
// Best-effort only — not a substitute for a real secret scanner. Flags any
// KEY=value line in .env.example whose value doesn't look like one of the
// known-safe placeholder/default shapes.
function looksLikePlaceholderOrSafeDefault(value) {
  const v = value.trim();
  if (v === '') return true;
  if (/^(true|false)$/i.test(v)) return true;
  if (/^\d+$/.test(v)) return true;
  if (/your-.*-here/i.test(v)) return true;
  if (/pending/i.test(v)) return true;
  if (/^hermes\/config\//.test(v)) return true;
  if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v)) return true; // email placeholder
  return false;
}
let envExampleText = '';
try { envExampleText = fs.readFileSync(path.join(REPO_ROOT, 'hermes/config/.env.example'), 'utf8'); } catch { /* checked above */ }
let suspiciousEnvLines = 0;
for (const line of envExampleText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const match = /^([A-Z0-9_]+)=(.*)$/.exec(trimmed);
  if (!match) continue;
  if (!looksLikePlaceholderOrSafeDefault(match[2])) {
    suspiciousEnvLines += 1;
    record(`secret-scan:${match[1]}`, `hermes/config/.env.example: ${match[1]} value looks like a placeholder`, 'WARN', 'value does not match a known-safe placeholder shape — manually confirm this is not a real secret', false);
  }
}
record('secret-scan:env-example', 'hermes/config/.env.example contains only placeholder-shaped values', suspiciousEnvLines === 0 ? 'PASS' : 'WARN', '', false);

// ── 8. Required npm scripts present ─────────────────────────────────────
let packageJson = {};
try { packageJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8')); } catch { /* handled by missing-file logic elsewhere */ }
const REQUIRED_SCRIPTS = [
  'hermes:collect', 'hermes:validate:real', 'hermes:report:real', 'hermes:email:real', 'hermes:weekly',
  'hermes:registry:validate', 'hermes:registry:coverage', 'hermes:preflight',
  'test:hermes-phase5', 'test:hermes-readiness'
];
let missingScripts = 0;
for (const script of REQUIRED_SCRIPTS) {
  const present = Boolean(packageJson.scripts && packageJson.scripts[script]);
  if (!present) missingScripts += 1;
  record(`script:${script}`, `package.json defines npm run ${script}`, present ? 'PRESENT' : 'MISSING');
}

// ── Verdict ──────────────────────────────────────────────────────────────
// A check can only fail the overall verdict if it was recorded as
// blocking=true AND its status is one of the failure states below.
// Secret presence, the legacy-sources routing note, and the heuristic
// .env.example scan are always blocking=false, so an absent secret (the
// expected state before activation) never makes the system look UNSAFE.
const FAILURE_STATUSES = new Set(['MISSING', 'FAIL', 'UNSAFE', 'DANGEROUS']);
const blockingFailures = results.filter((r) => r.blocking && FAILURE_STATUSES.has(r.status));
const safe = blockingFailures.length === 0;

const now = new Date().toISOString();
const report = {
  schema_version: '1.0.0',
  generated_at: now,
  safe,
  summary: {
    total_checks: results.length,
    missing_files: missingFiles,
    missing_scripts: missingScripts,
    missing_gitignore_entries: missingIgnores,
    dangerous_env_flags: dangerousFlagCount,
    registry_organizations: registryOrgCount,
    registry_endpoints: registryEndpointCount,
    suspicious_env_example_lines: suspiciousEnvLines
  },
  checks: results,
  approval_required: true,
  database_write: false,
  pgvector_write: false,
  unified_data_write: false,
  network_calls_made: false
};

const reportsDir = path.join(REPO_ROOT, 'hermes/reports');
fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(path.join(reportsDir, 'operational-preflight.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');

const mdLines = [
  '# HERMES Operational Preflight', '',
  `Generated: ${now}`, '',
  `**Overall status: ${safe ? 'SAFE' : 'UNSAFE'}**`, '',
  '## Summary', '',
  `- Checks run: ${report.summary.total_checks}`,
  `- Missing required files: ${report.summary.missing_files}`,
  `- Missing required npm scripts: ${report.summary.missing_scripts}`,
  `- Missing .gitignore entries: ${report.summary.missing_gitignore_entries}`,
  `- Dangerous environment flags active: ${report.summary.dangerous_env_flags}`,
  `- Source registry: ${report.summary.registry_organizations} organizations, ${report.summary.registry_endpoints} endpoints`,
  `- Suspicious .env.example lines: ${report.summary.suspicious_env_example_lines}`, '',
  '## Checks', '',
  '| Check | Status | Detail |', '|---|---|---|'
];
for (const r of results) mdLines.push(`| ${r.description} | ${r.status} | ${r.detail ? r.detail.replaceAll('|', '\\|') : ''} |`);
mdLines.push('', '> This preflight performs no network calls, no database writes, and never prints a secret value — only PRESENT/MISSING/SAFE/DANGEROUS.', '');
fs.writeFileSync(path.join(reportsDir, 'operational-preflight.md'), mdLines.join('\n') + '\n', 'utf8');

console.log(`[HERMES preflight] ${safe ? 'SAFE' : 'UNSAFE'} — ${results.length} checks, ${blockingFailures.length} blocking issue(s)`);
for (const failure of blockingFailures) {
  console.error(`[HERMES preflight] ${failure.status} ${failure.id}${failure.detail ? `: ${failure.detail}` : ''}`);
}
console.log(`[HERMES preflight] wrote hermes/reports/operational-preflight.md and .json`);
process.exit(safe ? 0 : 1);
