import { app } from './app.js';
import { checkDatabase, pool } from './db.js';
import { config } from './config.js';

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
