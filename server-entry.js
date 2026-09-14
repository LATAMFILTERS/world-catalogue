const bridgeUpstream = String(process.env.BRIDGE_UPSTREAM_URL || '').trim();

if (bridgeUpstream) {
  const { createBridgeServer } = require('./bridge-server');
  const port = Number(process.env.PORT || 10000);
  const host = '0.0.0.0';
  const server = createBridgeServer(bridgeUpstream);
  server.listen(port, host, () => {
    console.log(`[search-bridge] listening on ${host}:${port} -> ${bridgeUpstream}`);
  });
} else {
  require('./server-protocol');
}