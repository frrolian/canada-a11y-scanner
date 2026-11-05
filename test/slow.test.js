import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { scan } from '../src/scanner.js';

let srv; let base; const agents = [];
before(async () => {
  srv = http.createServer((req, res) => {
    agents.push(req.headers['user-agent']);
    if (req.url.startsWith('/never.png')) return; // a resource that never loads (stuck ad/tracker)
    res.writeHead(200, { 'content-type': 'text/html' });
    if (req.url === '/stuck-image') return res.end('<!doctype html><html lang="en"><title>t</title><body><main><h1>Hi</h1><img src="/never.png"></main></body></html>');
    if (req.url === '/never-finishes') return res.write('<!doctype html><html lang="en"><title>t</title><body><main><h1>Hi</h1><img src="x.png">'); // HTML never completes
    res.end('ok');
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${srv.address().port}`;
});
after(() => { srv.closeAllConnections(); srv.close(); });

test('a resource that never loads does not break the scan', { timeout: 60000 }, async () => {
  const r = await scan({ urls: [`${base}/stuck-image`], timeout: 8000, executablePath: process.env.CHROMIUM_PATH });
  assert.equal(r.pages[0].error, null);
  assert.ok(r.pages[0].issues.some((i) => i.id === 'image-alt'));
});

test('a page that never finishes loading is scanned as far as it got', { timeout: 60000 }, async () => {
  const r = await scan({ urls: [`${base}/never-finishes`], timeout: 5000, executablePath: process.env.CHROMIUM_PATH });
  assert.equal(r.pages[0].error, null);
  assert.equal(r.pages[0].partial, true);
  assert.ok(r.pages[0].issues.some((i) => i.id === 'image-alt'));
});

test('the browser does not announce itself as HeadlessChrome', () => {
  assert.ok(agents.length > 0);
  for (const a of agents) { assert.doesNotMatch(a, /HeadlessChrome/); assert.match(a, /CanadaA11yScanner/); }
});
