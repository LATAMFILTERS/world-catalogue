import express from 'express';

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'expect',
  'content-length',
  'content-encoding'
]);

export function createBridgeApp(upstreamBaseUrl: string, service: string) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.raw({ type: () => true, limit: '5mb' }));

  app.use(async (req, res) => {
    try {
      const target = new URL(req.originalUrl, upstreamBaseUrl);
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (!value || name.toLowerCase() === 'host' || hopByHopHeaders.has(name.toLowerCase())) continue;
        headers.set(name, Array.isArray(value) ? value.join(',') : value);
      }
      const init: RequestInit = { method: req.method, headers, redirect: 'manual' };
      if (req.method !== 'GET' && req.method !== 'HEAD' && Buffer.isBuffer(req.body) && req.body.length > 0) {
        init.body = new Blob([new Uint8Array(req.body)]);
      }

      const upstream = await fetch(target, init);
      res.status(upstream.status);
      upstream.headers.forEach((value, name) => {
        if (!hopByHopHeaders.has(name.toLowerCase())) res.setHeader(name, value);
      });
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (error) {
      console.error('Knowledge bridge request failed', error);
      res.status(502).json({ status: 'bridge_unavailable', service });
    }
  });

  return app;
}
