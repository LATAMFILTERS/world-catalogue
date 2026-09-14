const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createBridgeServer } = require('../bridge-server');

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}
function close(server) { return new Promise((resolve) => server.close(resolve)); }
function request(port, path, { method='GET', body='' }={}) {
  return new Promise((resolve, reject) => {
    const req = http.request({host:'127.0.0.1',port,path,method,headers:body?{'content-type':'application/json'}:{}}, (res) => {
      const chunks=[]; res.on('data',c=>chunks.push(c));
      res.on('end',()=>resolve({status:res.statusCode, body:Buffer.concat(chunks).toString()}));
    });
    req.on('error', reject); if(body) req.write(body); req.end();
  });
}

test('bridge preserves path, query, method and body', async () => {
  const upstream = http.createServer((req,res) => {
    const chunks=[]; req.on('data',c=>chunks.push(c));
    req.on('end',()=>{res.setHeader('content-type','application/json');res.end(JSON.stringify({method:req.method,url:req.url,body:Buffer.concat(chunks).toString()}));});
  });
  const upPort = await listen(upstream);
  const bridge = createBridgeServer(`http://127.0.0.1:${upPort}`);
  const bridgePort = await listen(bridge);  try {
    const body='{"x":1}';
    const r=await request(bridgePort,'/api/search?q=R90T',{method:'POST',body});
    assert.equal(r.status,200);
    assert.deepEqual(JSON.parse(r.body),{method:'POST',url:'/api/search?q=R90T',body});
  } finally {
    await close(bridge); await close(upstream);
  }
});

test('bridge returns 502 when upstream is unavailable', async () => {
  const bridge=createBridgeServer('http://127.0.0.1:9');
  const port=await listen(bridge);
  try {
    const r=await request(port,'/health');
    assert.equal(r.status,502);
    assert.equal(JSON.parse(r.body).error,'bridge_upstream_unavailable');
  } finally { await close(bridge); }
});