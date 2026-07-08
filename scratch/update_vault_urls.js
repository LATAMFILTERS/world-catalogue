const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(__dirname, '..', 'elimfilters-vault');

// Mapping based on next.config.mjs redirects
const REPLACEMENTS = [
  // Specific standards
  { from: 'knowledge-system/standards/lube-oil-systems', to: 'knowledge-center/systems/lubrication-protection' },
  { from: 'knowledge-system/standards/hydraulic-systems', to: 'knowledge-center/systems/hydraulic-protection' },
  { from: 'knowledge-system/standards/air-intake-systems', to: 'knowledge-center/systems/air-intake-protection' },
  { from: 'knowledge-system/standards/fuel-systems', to: 'knowledge-center/systems/fuel-cleanliness-protection' },
  { from: 'knowledge-system/standards/cabin-safety-systems', to: 'knowledge-center/systems/cabin-air-protection' },
  { from: 'knowledge-system/standards/compressed-air-systems', to: 'knowledge-center/standards/iso-8573-1' },
  
  // Contamination specific mappings
  { from: 'knowledge-system/contamination/hydraulic-system', to: 'knowledge-center/engineering/contamination-control' },
  { from: 'knowledge-system/contamination/hydraulic-contamination', to: 'knowledge-center/engineering/contamination-control' },
  { from: 'knowledge-system/contamination/particle-wear', to: 'knowledge-center/engineering/contamination-control' },
  { from: 'knowledge-system/contamination/diesel-water', to: 'knowledge-center/engineering/fluid-cleanliness' },
  { from: 'knowledge-system/contamination/varnish-formation', to: 'knowledge-center/engineering/contamination-control' },
  { from: 'knowledge-system/contamination/fuel-injector-wear', to: 'knowledge-center/engineering/fluid-cleanliness' },
  { from: 'knowledge-system/contamination/compressed-air-contamination', to: 'knowledge-center/standards/iso-8573-1' },
  { from: 'knowledge-system/contamination/coolant-contamination', to: 'knowledge-center/systems/cooling-system-protection' },
  { from: 'knowledge-system/contamination/cabin-air-contamination', to: 'knowledge-center/systems/cabin-air-protection' },
  
  // Generic sections
  { from: 'knowledge-system/technologies/', to: 'knowledge-center/technologies/' },
  { from: 'knowledge-system/industries/', to: 'knowledge-center/industries/' },
  { from: 'knowledge-system/standards/', to: 'knowledge-center/standards/' },
  { from: 'knowledge-system/contamination/', to: 'knowledge-center/engineering/' },
  { from: 'knowledge-system/fleet/', to: 'knowledge-center/technical-library/' },
  { from: 'knowledge-system/bridges/', to: 'knowledge-center/' },
  { from: 'knowledge-system/compare/', to: 'knowledge-center/' },
  { from: 'knowledge-system/components/', to: 'knowledge-center/glossary/' },
  
  // Fallback hub redirect
  { from: 'knowledge-system', to: 'knowledge-center' }
];

function walk(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(walk(fullPath));
    } else if (file.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const r of REPLACEMENTS) {
    if (content.includes(r.from)) {
      // Avoid replacing if it has already been processed or matches a longer block
      const regex = new RegExp(r.from, 'g');
      content = content.replace(regex, r.to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.relative(VAULT_DIR, filePath)}`);
  }
}

const mdFiles = walk(VAULT_DIR);
console.log(`Found ${mdFiles.length} Markdown files in vault.`);
mdFiles.forEach(processFile);
console.log('Finished updating vault URLs.');
