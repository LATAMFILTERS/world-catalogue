const http = require('node:http');
const https = require('node:https');

const HOP_BY_HOP = new Set([
  'connection','keep-alive','proxy-authenticate','proxy-authorization',
  'te','trailer','transfer-encoding','upgrade','expect'
]);

const RESULTS_ITEMS_SOURCE = 'const items = data.products || data.filters || [];';
const RESULTS_ITEMS_FIXED = 'const items = data.results || data.products || data.filters || [];';

function cleanRequestHeaders(req, target, forceIdentityEncoding = false) {
  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    const key = name.toLowerCase();
    if (value == null || HOP_BY_HOP.has(key) || key === 'host') continue;
    if (forceIdentityEncoding && key === 'accept-encoding') continue;
    headers[name] = value;
  }
  headers.host = target.host;
  if (forceIdentityEncoding) headers['accept-encoding'] = 'identity';
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
}

function shouldRepairResultsPage(req, target, proxyRes) {
  const contentType = String(proxyRes.headers['content-type'] || '').toLowerCase();
  return req.method === 'GET'
    && target.pathname.endsWith('/results.html')
    && proxyRes.statusCode === 200
    && contentType.includes('text/html');
}

function createBridgeServer(upstreamUrl) {
  const upstream = new URL(upstreamUrl);
  if (!['http:','https:'].includes(upstream.protocol)) {
    throw new Error('BRIDGE_UPSTREAM_URL must use http or https');
  }
  const transport = upstream.protocol === 'https:' ? https : http;
  return http.createServer((req, res) => {
    const target = new URL(req.url || '/', upstream);
    const isResultsRequest = req.method === 'GET' && target.pathname.endsWith('/results.html');
    const proxyReq = transport.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || undefined,
      method: req.method,
      path: `${target.pathname}${target.search}`,
      headers: cleanRequestHeaders(req, target, isResultsRequest)
    }, (proxyRes) => {
      if (!shouldRepairResultsPage(req, target, proxyRes)) {
        res.writeHead(proxyRes.statusCode || 502, cleanResponseHeaders(proxyRes.headers));
        proxyRes.pipe(res);
        return;
      }

      const chunks = [];
      proxyRes.on('data', (chunk) => chunks.push(chunk));
      proxyRes.on('end', () => {
        const upstreamHtml = Buffer.concat(chunks).toString('utf8');
        const repairedHtml = upstreamHtml.includes(RESULTS_ITEMS_FIXED)
          ? upstreamHtml
          : upstreamHtml.replace(RESULTS_ITEMS_SOURCE, RESULTS_ITEMS_FIXED);
        const body = Buffer.from(repairedHtml, 'utf8');
        const headers = cleanResponseHeaders(proxyRes.headers);
        delete headers['content-encoding'];
        delete headers['content-length'];
        delete headers.etag;
        delete headers['last-modified'];
        headers['cache-control'] = 'no-store';
        headers['content-length'] = body.length;
        res.writeHead(proxyRes.statusCode || 200, headers);
        res.end(body);
      });
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
