'use strict';

const http = require('http');
const https = require('https');

const upstreamText = String(process.env.BRIDGE_UPSTREAM_URL || '').trim();
if (!upstreamText) throw new Error('BRIDGE_UPSTREAM_URL is required in Render bridge mode');

const upstream = new URL(upstreamText);
if (!['http:', 'https:'].includes(upstream.protocol)) {
  throw new Error('BRIDGE_UPSTREAM_URL must use http or https');
}

const port = Number(process.env.PORT || 10000);
const host = process.env.HOST || '0.0.0.0';
const transport = upstream.protocol === 'https:' ? https : http;
const hopByHop = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'expect'
]);

function cleanHeaders(headers, target) {
  const out = {};
  for (const [name, value] of Object.entries(headers)) {
    if (value == null || hopByHop.has(name.toLowerCase()) || name.toLowerCase() === 'host') continue;
    out[name] = value;
  }
  out.host = target.host;
  return out;
}

const server = http.createServer((req, res) => {
  const target = new URL(req.url || '/', upstream);
  const headers = cleanHeaders(req.headers, target);
  if (req.headers.host) headers['x-forwarded-host'] = req.headers.host;

  const proxyReq = transport.request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || undefined,
    method: req.method,
    path: `${target.pathname}${target.search}`,
    headers
  }, (proxyRes) => {
    const responseHeaders = {};
    for (const [name, value] of Object.entries(proxyRes.headers)) {
      if (value == null || hopByHop.has(name.toLowerCase())) continue;
      responseHeaders[name] = value;
    }
    res.writeHead(proxyRes.statusCode || 502, responseHeaders);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error('[render-bridge] upstream error:', error.message);
    if (res.headersSent) return res.destroy(error);
    const body = Buffer.from(JSON.stringify({ error: 'bridge_upstream_unavailable' }));
    res.writeHead(502, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'content-length': body.length
    });
    res.end(body);
  });

  req.on('aborted', () => proxyReq.destroy());
  req.pipe(proxyReq);
});

server.listen(port, host, () => {
  console.log(`[render-bridge] listening on ${host}:${port} -> ${upstream.origin}`);
});

const shutdown = (signal) => {
  console.log(`[render-bridge] ${signal} received`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
