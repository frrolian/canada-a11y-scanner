import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { startServer } from '../src/server.js';

let fixtures; let app; let fx; let base;
before(async () => {
  fixtures = http.createServer((req, res) => {
    const file = new URL(`./fixtures/${req.url.slice(1) || 'good.html'}`, import.meta.url);
    if (!/^\/\w+\.html$/.test(req.url) || !existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': 'text/html' }); res.end(readFileSync(file));
  });
  await new Promise((r) => fixtures.listen(0, '127.0.0.1', r));
  fx = `http://127.0.0.1:${fixtures.address().port}`;
  app = await startServer({ port: 0, executablePath: process.env.CHROMIUM_PATH });
  base = `http://127.0.0.1:${app.address().port}`;
});
after(() => { app.close(); fixtures.close(); });

const post = (body) => fetch(`${base}/scan`, { method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body) });

test('form page renders in English and French', async () => {
  assert.match(await (await fetch(base)).text(), /Start scan/);
  assert.match(await (await fetch(`${base}/?lang=fr`)).text(), /Lancer l'analyse/);
});

test('validation errors are shown', async () => {
  const r = await post({ url: '', pages: '99', lang: 'en' });
  assert.equal(r.status, 400);
  const html = await r.text();
  assert.match(html, /There is a problem/);
  assert.match(html, /aria-invalid="true"/);
  assert.doesNotMatch(html, /—/);
});

test('scan runs as a job with progress and produces a report', { timeout: 90000 }, async () => {
  const r = await post({ url: `${fx}/good.html`, pages: '2', standards: 'aoda', lang: 'en', reportLang: 'fr' });
  assert.equal(r.status, 303);
  const loc = r.headers.get('location');
  const id = /\/job\/([0-9a-f-]+)/.exec(loc)[1];
  assert.match(await (await fetch(base + loc)).text(), /Scan in progress/);
  let j;
  for (let i = 0; i < 120; i++) {
    j = await (await fetch(`${base}/api/job/${id}`)).json();
    if (j.state === 'done' || j.state === 'failed') break;
    await new Promise((s) => setTimeout(s, 500));
  }
  assert.equal(j.state, 'done', j.error);
  const report = await (await fetch(`${base}/report/${id}`)).text();
  assert.match(report, /Rapport d'accessibilité/);
  assert.match(report, /analyser un autre site/);
  assert.match(report, /Envoyer par courriel/);
  assert.match(report, /name="standards"/);
  assert.doesNotMatch(report, /🍁/);
  const dl = await fetch(`${base}/report/${id}/download`);
  assert.match(dl.headers.get('content-disposition'), /attachment/);
});

test('unreachable site fails cleanly', { timeout: 60000 }, async () => {
  const r = await post({ url: 'http://127.0.0.1:1/nothing', pages: '1', standards: 'aca', lang: 'en' });
  const id = /\/job\/([0-9a-f-]+)/.exec(r.headers.get('location'))[1];
  let j;
  for (let i = 0; i < 100; i++) {
    j = await (await fetch(`${base}/api/job/${id}`)).json();
    if (j.state === 'done' || j.state === 'failed') break;
    await new Promise((s) => setTimeout(s, 300));
  }
  assert.equal(j.state, 'failed');
  assert.match(j.error, /Could not open the website/);
});

test('choosing no standard shows an error', async () => {
  const r = await post({ url: 'example.ca', pages: '1', lang: 'en' });
  assert.equal(r.status, 400);
  assert.match(await r.text(), /Choose at least one standard/);
});

test('AI endpoint is off without a key', async () => {
  const r = await fetch(`${base}/api/ask/00000000-0000-0000-0000-000000000000`, { method: 'POST', body: '{"ref":"s-0","lang":"en"}' });
  assert.equal(r.status, 503);
});
