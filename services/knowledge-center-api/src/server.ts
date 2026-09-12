import { createBridgeApp } from './bridge.js';

const bridgeUpstream = process.env.BRIDGE_UPSTREAM_URL?.trim();
const port = Number(process.env.PORT ?? 3002);

if (bridgeUpstream) {
  const app = createBridgeApp(bridgeUpstream, 'knowledge-center-api');
  const server = app.listen(port, () => {
    console.log(`Knowledge Center API bridge listening on port ${port} -> ${bridgeUpstream}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received; shutting down Knowledge Center API bridge`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} else {
  const [{ app }, { checkDatabase, pool }, { config }] = await Promise.all([
    import('./app.js'),
    import('./db.js'),
    import('./config.js')
  ]);

  await checkDatabase();
  const server = app.listen(config.PORT, () => {
    console.log(`Knowledge Center API listening on port ${config.PORT}`);
  });
  async function shutdown(signal: string) {
    console.log(`${signal} received; shutting down Knowledge Center API`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}
