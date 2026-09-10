'use strict';

require('dotenv').config();
const http = require('http');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const {
  createNotification,
  listNotifications,
  updateNotificationStatus,
  summary,
} = require('../lib/native-notifications');

const PORT = Number(process.env.WORLD_NOTIFICATION_PORT || 8791);
const HOST = process.env.WORLD_NOTIFICATION_HOST || '127.0.0.1';
const MAX_BODY_BYTES = 256000;
const LOGO_E_DATA_URI = `data:image/png;base64,${readFileSync(resolve(__dirname, '../frontend/public/images/logo-e.png')).toString('base64')}`;

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Payload too large'), { statusCode: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Invalid JSON'), { statusCode: 400 }); }
}

function render(rows, stats) {
  const cards = rows.map((n) => `<article class="item ${esc(String(n.priority).toLowerCase())}">
    <div class="brandrow"><img class="brandmark" src="${LOGO_E_DATA_URI}" alt="ELIMFILTERS E"><div class="content"><div class="top"><strong>${esc(n.title)}</strong><span>${esc(n.priority)}</span></div>
    <p>${esc(n.message)}</p>
    <div class="meta">WORLD CATALOGUE · ${esc(n.module)} · ${esc(n.recipient_key)} · ${esc(n.status)} · ${esc(new Date(n.created_at).toLocaleString())}</div>
    ${n.deep_link ? `<a href="${esc(n.deep_link)}">Open record</a>` : ''}
    <div class="actions">
      <button data-id="${esc(n.id)}" data-action="read">Read</button>
      <button data-id="${esc(n.id)}" data-action="acknowledge">Acknowledge</button>
      <button data-id="${esc(n.id)}" data-action="resolve">Resolve</button>
    </div></div></div>
  </article>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ELIMFILTERS World Notifications</title><style>
body{font-family:Segoe UI,Arial,sans-serif;background:#0b0b0b;color:#f5f5f5;margin:0}.wrap{max-width:1000px;margin:auto;padding:24px}h1{margin:0 0 6px}.summary{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}.pill{background:#171717;border:1px solid #333;border-radius:10px;padding:10px 14px}.item{background:#141414;border:1px solid #303030;border-left:5px solid #777;border-radius:10px;padding:16px;margin:12px 0}.item.high{border-left-color:#e7b416}.item.critical{border-left-color:#d84040}.item.warning{border-left-color:#c77f18}.brandrow{display:flex;align-items:flex-start;gap:14px}.brandmark{width:44px;height:44px;object-fit:contain;flex:0 0 44px}.content{min-width:0;flex:1}.top{display:flex;justify-content:space-between;gap:12px}.meta{font-size:12px;color:#999;margin:8px 0}.actions{display:flex;gap:8px;margin-top:10px}button{background:#252525;color:#fff;border:1px solid #444;padding:8px 10px;border-radius:6px;cursor:pointer}a{color:#ddd}</style></head><body><div class="wrap"><h1>ELIMFILTERS® World Notification Center</h1><div>Catalogue · Web · Knowledge · Nodal Center</div><div class="summary"><div class="pill">Unread: <b>${stats.unread ?? 0}</b></div><div class="pill">High: <b>${stats.high_open ?? 0}</b></div><div class="pill">Critical: <b>${stats.critical_open ?? 0}</b></div></div>${cards || '<p>No notifications.</p>'}</div><script>
document.addEventListener('click',async(e)=>{const b=e.target.closest('button[data-id]');if(!b)return;await fetch('/api/notifications/'+b.dataset.id+'/'+b.dataset.action,{method:'POST'});location.reload();});setTimeout(()=>location.reload(),30000);
</script></body></html>`;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (req.method === 'GET' && url.pathname === '/health') return sendJson(res, 200, { ok: true, service: 'world-catalogue-native-notifications' });
    if (req.method === 'GET' && url.pathname === '/api/notifications') {
      const query = Object.fromEntries(url.searchParams.entries());
      return sendJson(res, 200, { notifications: await listNotifications(query), summary: await summary(query.recipientKey) });
    }
    if (req.method === 'POST' && url.pathname === '/api/notifications') {
      const body = await readJson(req);
      return sendJson(res, 201, { notification: await createNotification(body) });
    }
    const match = url.pathname.match(/^\/api\/notifications\/([^/]+)\/(read|acknowledge|resolve)$/);
    if (req.method === 'POST' && match) {
      const status = match[2] === 'read' ? 'READ' : match[2] === 'acknowledge' ? 'ACKNOWLEDGED' : 'RESOLVED';
      return sendJson(res, 200, { notification: await updateNotificationStatus(match[1], status) });
    }
    if (req.method === 'GET' && url.pathname === '/') {
      const rows = await listNotifications({ limit: 100 });
      const stats = await summary();
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(render(rows, stats));
    }
    return sendJson(res, 404, { error: 'not_found' });
  } catch (error) {
    console.error('[world-notification-center]', error.code || error.name || 'ERROR');
    return sendJson(res, error.statusCode || 500, { error: error.statusCode ? error.message : 'internal_error' });
  }
});

server.listen(PORT, HOST, () => console.log(`ELIMFILTERS World Notification Center http://${HOST}:${PORT}`));
