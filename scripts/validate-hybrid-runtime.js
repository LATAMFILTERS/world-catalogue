const node = String(process.env.ELIM_RUNTIME_NODE || 'LENOVO').toUpperCase();
const role = String(process.env.ELIM_RUNTIME_ROLE || 'PRIMARY').toUpperCase();
const domain = String(process.env.ELIM_DOMAIN || 'WORLD_CATALOGUE').toUpperCase();
const scheduler = String(process.env.ELIM_SCHEDULER_ENABLED || 'false').toLowerCase() === 'true';

const validNodes = new Set(['LENOVO', 'RENDER', 'GITHUB']);
const validRoles = new Set(['PRIMARY', 'STANDBY', 'CI']);

const errors = [];
if (!validNodes.has(node)) errors.push(`invalid ELIM_RUNTIME_NODE=${node}`);
if (!validRoles.has(role)) errors.push(`invalid ELIM_RUNTIME_ROLE=${role}`);
if (domain !== 'WORLD_CATALOGUE') errors.push(`world-catalogue requires ELIM_DOMAIN=WORLD_CATALOGUE, received ${domain}`);
if ((role === 'STANDBY' || role === 'CI') && scheduler) {
  errors.push(`${role} nodes may not run recurring production schedulers`);
}

if (errors.length) {
  console.error('[hybrid-runtime] INVALID');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'OK',
  runtime_node: node,
  runtime_role: role,
  domain,
  scheduler_enabled: scheduler,
  crm_write_access: 'INTERFACE_ONLY'
}));
