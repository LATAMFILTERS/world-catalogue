'use strict';

const { spawn } = require('node:child_process');
const path = require('node:path');

let timer = null;
let running = false;

async function checkOnce() {
  if (running) return;
  try {
    const { getNodeHeartbeat } = await import('../scripts/hermes/hermes-ha-control.mjs');
    const heartbeat = await getNodeHeartbeat('LENOVO');
    const staleMinutes = Math.max(10, Number(process.env.ELIM_HERMES_FAILOVER_STALE_MINUTES || 20));

    if (heartbeat && Number(heartbeat.age_minutes) <= staleMinutes) {
      console.log(`[hermes-failover-watch] STANDBY: Lenovo heartbeat age=${Number(heartbeat.age_minutes).toFixed(1)}m status=${heartbeat.status}`);
      return;
    }

    console.warn(`[hermes-failover-watch] Lenovo heartbeat stale or missing; evaluating failover. staleThreshold=${staleMinutes}m`);
    running = true;
    const runner = path.join(process.cwd(), 'scripts', 'hermes', 'render-failover-run.mjs');
    const child = spawn(process.execPath, [runner], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ELIM_RUNTIME_NODE: 'RENDER',
        ELIM_RUNTIME_ROLE: 'FAILOVER'
      },
      stdio: 'inherit'
    });
    child.on('exit', (code, signal) => {
      running = false;
      console.log(`[hermes-failover-watch] failover runner exited code=${code} signal=${signal || ''}`);
    });
    child.on('error', (error) => {
      running = false;
      console.error('[hermes-failover-watch] failed to start runner', error);
    });
  } catch (error) {
    console.error('[hermes-failover-watch] check failed', error);
  }
}

function startRenderFailoverWatcher() {
  if (process.env.ELIM_HERMES_FAILOVER_ENABLED !== 'true') {
    console.log('[hermes-failover-watch] disabled');
    return;
  }
  if (timer) return;

  const minutes = Math.max(5, Number(process.env.ELIM_HERMES_FAILOVER_CHECK_MINUTES || 15));
  console.log(`[hermes-failover-watch] enabled: check every ${minutes}m`);
  setTimeout(() => checkOnce(), 30000).unref();
  timer = setInterval(() => checkOnce(), minutes * 60 * 1000);
  timer.unref();
}

module.exports = { startRenderFailoverWatcher, checkOnce };
