'use strict';
const { Client } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL not set'); process.exit(1); }

const u = new URL(url.replace(/\?.*$/, ''));
console.log('Host:    ', u.hostname);
console.log('Port:    ', u.port || 5432);
console.log('DB:      ', u.pathname.slice(1));
console.log('User:    ', u.username);

const config = {
  host:     u.hostname,
  port:     parseInt(u.port) || 5432,
  database: u.pathname.slice(1),
  user:     decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  ssl:      { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
};

console.log('\nConnecting...');
const client = new Client(config);
client.connect()
  .then(() => client.query('SELECT COUNT(*) FROM elimfilters_catalog'))
  .then(r => { console.log('✅ Connected! Rows:', r.rows[0].count); return client.end(); })
  .catch(e => { console.error('❌ Error:', e.message, '\nCode:', e.code); process.exit(1); });
