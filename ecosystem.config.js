/**
 * PM2 Ecosystem Config — ELIMFILTERS Search API
 *
 * WHEN TO USE:
 *   Single process (current):  up to ~150 concurrent users — just `node server.js`
 *   Cluster mode (this file):  300-2000 concurrent users — requires Redis (REDIS_URL)
 *
 * HOW TO ACTIVATE ON RENDER:
 *   1. Add REDIS_URL env var (Render Redis addon or Upstash free tier)
 *   2. Change Start Command from `node server.js` to `npx pm2-runtime ecosystem.config.js`
 *   3. Optionally set PM2_WORKERS env var to override worker count (default: CPU count)
 *
 * SCALING TIERS:
 *   150-300 users:  2 workers  (set PM2_WORKERS=2)
 *   300-600 users:  4 workers  (set PM2_WORKERS=4)
 *   600-2000 users: 8 workers  (set PM2_WORKERS=8, upgrade Render plan)
 *
 * NOTE: Redis is REQUIRED in cluster mode. Without it each worker has its own
 * in-memory cache and catalog_count is fetched separately by each worker.
 */

const workers = parseInt(process.env.PM2_WORKERS) || 'max'; // 'max' = one per CPU core

module.exports = {
  apps: [{
    name:          'elimfilters-api',
    script:        'server.js',
    instances:     workers,
    exec_mode:     'cluster',
    max_memory_restart: '400M',
    env: {
      NODE_ENV: 'production',
    },
    // Graceful reload: new workers accept connections before old ones die
    wait_ready:    true,
    listen_timeout: 8000,
    kill_timeout:  5000,
    // Restart policy
    max_restarts:  10,
    min_uptime:    '10s',
    // Logging
    merge_logs:    true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};
