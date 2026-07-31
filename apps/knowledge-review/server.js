const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const isDev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3004', 10);
const hostname = '0.0.0.0';

const app = next({ dev: isDev });
const handle = app.getRequestHandler();

// Start server immediately to answer health checks
let appReady = false;
const server = createServer(async (req, res) => {
  // Respond to health checks immediately
  if (req.url === '/health' || req.url === '/health/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'knowledge-review' }));
    return;
  }

  // Wait for app to be ready for other requests
  if (!appReady) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Service initializing' }));
    return;
  }

  try {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error('Error handling request:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(port, hostname, () => {
  console.log(`✓ Server listening on http://${hostname}:${port}`);
  console.log(`  Environment: ${isDev ? 'development' : 'production'}`);
});

// Initialize Next.js app
app.prepare().then(() => {
  appReady = true;
  console.log('✓ Next.js app initialized and ready');
}).catch(err => {
  console.error('Failed to initialize Next.js app:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
