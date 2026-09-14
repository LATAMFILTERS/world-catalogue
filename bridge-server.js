const http = require('node:http');
const https = require('node:https');

const HOP_BY_HOP = new Set([
  'connection','keep-alive','proxy-authenticate','proxy-authorization',
  'te','trailer','transfer-encoding','upgrade','expect'
]);

function cleanRequestHeaders(req, target) {
  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    const key = name.toLowerCase();
    if (value == null || HOP_BY_HOP.has(key) || key === 'host') continue;
    headers[name] = value;
  }
  headers.host = target.host;
  if (req.headers.host) headers['x-forwarded-host'] = req.headers.host;
  return headers;
}

function cleanResponseHeaders(headers) {
  const out = {};
  for (const [name, value] of Object.entries(headers)) {
    if (value == null || HOP_BY_HOP.has(name.toLowerCase())) continue;
    out[name] = value;
  }
  return out;
}function createBridgeServer(upstreamUrl) {
  const upstream = new URL(upstreamUrl);
  if (!['http:','https:'].includes(upstream.protocol)) {
    throw new Error('BRIDGE_UPSTREAM_URL must use http or https');
  }
  const transport = upstream.protocol === 'https:' ? https : http;
  return http.createServer((req, res) => {
    const target = new URL(req.url || '/', upstream);
    const proxyReq = transport.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || undefined,
      method: req.method,
      path: `${target.pathname}${target.search}`,
      headers: cleanRequestHeaders(req, target)
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, cleanResponseHeaders(proxyRes.headers));
      proxyRes.pipe(res);
    });
    proxyReq.on('error', (error) => {
      if (res.headersSent) return res.destroy(error);
      const body = Buffer.from(JSON.stringify({ error: 'bridge_upstream_unavailable' }));
      res.writeHead(502, {'content-type':'application/json; charset=utf-8','cache-control':'no-store','content-length':body.length});
      res.end(body);
    });
    req.on('aborted', () => proxyReq.destroy());
    req.pipe(proxyReq);
  });
}

module.exports = { createBridgeServer };