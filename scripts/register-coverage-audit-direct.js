const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
let source = fs.readFileSync(target, 'utf8');
const marker = '// COVERAGE_AUDIT_DIRECT_V4';

if (!source.includes(marker)) {
  const anchor = `const pool = new Pool(dbConfig);\npool.on('connect', client => {\n  client.query("SET statement_timeout = '8000'").catch(() => {});\n});`;
  if (!source.includes(anchor)) throw new Error('Pool anchor not found for direct coverage audit registration');
  const registration = `${anchor}\n\n${marker}\nconst { registerCoverageAuditEngine } = require('./src/coverage-audit-engine');\nregisterCoverageAuditEngine(app, pool, searchLimiter);\nconsole.log('[coverage-audit-engine] direct v4 registered');`;
  source = source.replace(anchor, registration);
  fs.writeFileSync(target, source, 'utf8');
} else {
  console.log('[coverage-audit-engine] direct v4 already registered');
}
