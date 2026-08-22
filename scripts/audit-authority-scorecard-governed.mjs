import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const reportDir = path.join(root, 'reports', 'seo-geo');
const jsonReport = path.join(reportDir, 'authority-scorecard.json');
const mdReport = path.join(reportDir, 'authority-scorecard.md');

const baseAudit = spawnSync(process.execPath, [path.join(root, 'scripts', 'audit-authority-scorecard.mjs')], {
  cwd: root,
  encoding: 'utf8',
});

if (baseAudit.stdout) process.stdout.write(baseAudit.stdout);
if (baseAudit.stderr) process.stderr.write(baseAudit.stderr);
if (baseAudit.status !== 0) process.exit(baseAudit.status ?? 1);

if (!fs.existsSync(jsonReport)) {
  console.error('[authority-scorecard-governed] authority-scorecard.json is missing');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(jsonReport, 'utf8'));
const allPages = Array.isArray(report.pages) ? report.pages : [];

const canonicalized = [];
const pages = [];
for (const page of allPages) {
  const expectedCanonical = `https://elimfilters.com${page.route}`;
  const actualCanonical = page.metrics?.canonical ?? '';
  if (actualCanonical && actualCanonical !== expectedCanonical) {
    canonicalized.push({
      route: page.route,
      canonical: actualCanonical,
      type: page.type,
      scoreBeforeExclusion: page.score,
    });
    continue;
  }
  pages.push(page);
}

const strategicTypes = new Set(['industry','system','technology','family','knowledge-hub','standard','engineering','comparison']);
const strategic = pages.filter((page) => strategicTypes.has(page.type));

const average = (items) => items.length
  ? Number((items.reduce((sum, item) => sum + item.score, 0) / items.length).toFixed(1))
  : 0;

const summary = {
  ...report.summary,
  generatedAt: new Date().toISOString(),
  totalIndexablePagesAudited: pages.length,
  strategicPagesAudited: strategic.length,
  authorityReady: pages.filter((page) => page.authorityReady).length,
  strongIncomplete: pages.filter((page) => page.tier === 'strong-incomplete').length,
  belowTarget: pages.filter((page) => page.tier === 'below-target').length,
  notAuthorityReady: pages.filter((page) => page.tier === 'not-authority-ready').length,
  blockedByCriticalDefect: pages.filter((page) => page.blockers?.length).length,
  averageScore: average(pages),
  strategicAverageScore: average(strategic),
  canonicalizedUrlsExcluded: canonicalized.length,
};

fs.writeFileSync(jsonReport, `${JSON.stringify({ summary, pages, canonicalized }, null, 2)}\n`);

const rows = strategic
  .slice()
  .sort((a, b) => a.score - b.score || a.route.localeCompare(b.route))
  .map((page) => `| ${page.score} | ${page.type} | ${page.blockers?.length ? 'BLOCKED' : page.tier} | ${page.route} | ${(page.blockers?.[0] || page.warnings?.slice(0, 2).join(' / ') || '—').replaceAll('|', '\\|')} |`)
  .join('\n');

const canonicalRows = canonicalized
  .slice(0, 50)
  .map((page) => `| ${page.route} | ${page.canonical} |`)
  .join('\n');

const md = `# ELIMFILTERS Authority Audit Scorecard\n\nGenerated: ${summary.generatedAt}\nStandard: v${summary.standardVersion}\n\n## Summary\n\n- Self-canonical indexable pages audited: ${summary.totalIndexablePagesAudited}\n- Strategic pages audited: ${summary.strategicPagesAudited}\n- Average score: ${summary.averageScore}/100\n- Strategic average: ${summary.strategicAverageScore}/100\n- Authority-ready: ${summary.authorityReady}\n- Strong incomplete: ${summary.strongIncomplete}\n- Below target: ${summary.belowTarget}\n- Not authority-ready: ${summary.notAuthorityReady}\n- Critical blockers: ${summary.blockedByCriticalDefect}\n- Canonicalized/consolidated URLs excluded from authority scoring: ${summary.canonicalizedUrlsExcluded}\n\n## Strategic remediation queue\n\nLowest scores appear first. GSC demand is applied separately to determine business remediation order.\n\n| Score | Type | Status | Route | Primary blocker / deficits |\n|---:|---|---|---|---|\n${rows}\n\n## Canonicalized URLs excluded\n\nThese URLs remain visible for consolidation/legacy handling but do not compete as autonomous authority pages.\n\n| Route | Canonical target |\n|---|---|\n${canonicalRows || '| — | — |'}\n`;

fs.writeFileSync(mdReport, md);

console.log(`[authority-scorecard-governed] PASS — ${pages.length} self-canonical indexable pages; strategic average ${summary.strategicAverageScore}/100; ${summary.authorityReady} authority-ready; ${summary.blockedByCriticalDefect} blocked; ${canonicalized.length} canonicalized URLs excluded`);
