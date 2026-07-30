const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const isDev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3004', 10);
const hostname = '0.0.0.0';

const app = next({ dev: isDev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, hostname, () => {
    console.log(`✓ Server ready on http://${hostname}:${port}`);
    console.log(`  Environment: ${isDev ? 'development' : 'production'}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
