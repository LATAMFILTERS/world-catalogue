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
let lastHealthCheckTime = Date.now();

const server = createServer(async (req, res) => {
  // Parse URL to check for query string
  const url = req.url.split('?')[0];

  // Respond to health checks immediately - simple and reliable
  if (url === '/health' || url === '/health/') {
    lastHealthCheckTime = Date.now();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // Wait for app to be ready for other requests
  if (!appReady) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'initializing' }));
    return;
  }

  try {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error('Error handling request:', err.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
    process.exit(1);
  }
});

server.listen(port, hostname, () => {
  console.log(`✓ Server listening on http://${hostname}:${port}`);
  console.log(`  PID: ${process.pid}`);
  console.log(`  Environment: ${isDev ? 'development' : 'production'}`);
});

// Initialize Next.js app with timeout
const initTimeout = setTimeout(() => {
  console.error('App initialization timeout - took too long');
  process.exit(1);
}, 30000); // 30 second timeout

app.prepare()
  .then(() => {
    clearTimeout(initTimeout);
    appReady = true;
    console.log('✓ Next.js app ready - accepting requests');
    console.log(`  Uptime: ${Math.round((Date.now() - startTime) / 1000)}s`);
  })
  .catch(err => {
    clearTimeout(initTimeout);
    console.error('✗ Failed to initialize Next.js app:', err.message);
    console.error(err.stack);
    process.exit(1);
  });

// Track startup time
const startTime = Date.now();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Monitor health periodically
setInterval(() => {
  const timeSinceCheck = Date.now() - lastHealthCheckTime;
  if (timeSinceCheck > 60000) {
    console.warn(`⚠ No health checks in ${Math.round(timeSinceCheck / 1000)}s`);
  }
}, 30000);
