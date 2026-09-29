import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { exec } from 'node:child_process';

const SITE_URL = 'sc-domain:elimfilters.com';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}`;
const args = Object.fromEntries(process.argv.slice(2).map((arg, i, arr) => {
  if (!arg.startsWith('--')) return [arg, true];
  const key = arg.slice(2);
  const next = arr[i + 1];
  return [key, next && !next.startsWith('--') ? next : true];
}));
const credentialsPath = args.credentials || process.env.GSC_OAUTH_CLIENT;
if (!credentialsPath) throw new Error('Pass --credentials <client_secret.json> or set GSC_OAUTH_CLIENT.');

const secretDir = path.join(os.homedir(), '.elimfilters-secrets');
const tokenPath = args.token || path.join(secretDir, 'gsc-url-inspection-token.json');
const reportPath = args.report || path.join(secretDir, 'industrial-process-url-inspection.json');
fs.mkdirSync(secretDir, { recursive: true });

const clientJson = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const client = clientJson.installed || clientJson.web;
if (!client?.client_id || !client?.client_secret) throw new Error('Invalid OAuth client JSON.');
const urls = [
  'https://elimfilters.com/industrial-process/',
  'https://elimfilters.com/industrial-process/aeremis/',
  'https://elimfilters.com/industrial-process/aeremis/general-air-filtration/',
  'https://elimfilters.com/industrial-process/aeremis/he-criva/',
  'https://elimfilters.com/industrial-process/aeremis/ma-trea/',
  'https://elimfilters.com/industrial-process/partion/',
  'https://elimfilters.com/industrial-process/partion/fumevra/',
  'https://elimfilters.com/industrial-process/coalvex/',
  'https://elimfilters.com/industrial-process/coalvex/coaleris/',
  'https://elimfilters.com/industrial-process/coalvex/gas-liquid-separation/',
  'https://elimfilters.com/industrial-process/flurexis/',
  'https://elimfilters.com/industrial-process/flurexis/hyltris/',
  'https://elimfilters.com/industrial-process/flurexis/lubreva/',
  'https://elimfilters.com/industrial-process/flurexis/dewatis/',
  'https://elimfilters.com/industrial-process/flurexis/oilrevex/',
  'https://elimfilters.com/industrial-process/aquvexis/',
  'https://elimfilters.com/industrial-process/aquvexis/depth-filtration/',
  'https://elimfilters.com/industrial-process/aquvexis/adsovex/',
  'https://elimfilters.com/industrial-process/aquvexis/membravex/',
  'https://elimfilters.com/industrial-process/aquvexis/ionvexa/',
];

function openBrowser(url) {
  if (process.platform === 'win32') exec(`start "" "${url}"`);
  else if (process.platform === 'darwin') exec(`open "${url}"`);
  else exec(`xdg-open "${url}"`);
}
async function exchangeCode(code) {
  const body = new URLSearchParams({
    code,
    client_id: client.client_id,
    client_secret: client.client_secret,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function refreshToken(refresh_token) {
  const body = new URLSearchParams({
    refresh_token,
    client_id: client.client_id,
    client_secret: client.client_secret,
    grant_type: 'refresh_token',
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  return res.json();
}
