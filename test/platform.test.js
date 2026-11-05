import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { scan, toHtml } from '../src/index.js';
import { describeWhere } from '../src/report.js';

let srv; let base;
before(async () => {
  srv = http.createServer((req, res) => {
    const f = new URL(`./fixtures/${req.url.slice(1)}`, import.meta.url);
    if (!/^\/\w+\.html$/.test(req.url) || !existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': 'text/html' }); res.end(readFileSync(f));
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${srv.address().port}`;
});
after(() => srv.close());
const opts = { executablePath: process.env.CHROMIUM_PATH };

test('detects Squarespace 7.1 and gives Squarespace steps in plain language', { timeout: 60000 }, async () => {
  const r = await scan({ urls: [`${base}/squarespace.html`], ...opts });
  assert.equal(r.platform.id, 'squarespace');
  assert.equal(r.platform.version, '7.1');
  const img = r.pages[0].issues.find((i) => i.id === 'image-alt');
  assert.ok(img, 'image-alt found');
  const where = describeWhere(img.nodes[0].where, 'en');
  assert.match(where, /Image block/);
  assert.match(where, /section 1 of the page/);
  assert.ok(img.nodes[0].shot?.startsWith('data:image/jpeg;base64,'), 'has a picture');
  const html = toHtml(r, 'en');
  assert.match(html, /Built with <strong>Squarespace 7\.1<\/strong>/);
  assert.match(html, /How to fix it on Squarespace 7\.1/);
  assert.match(html, /Image alt text/);
  assert.match(html, /Your to-do list/);
  assert.match(html, /Copy fix prompt/);
  assert.match(html, /For developers/);
  const fr = toHtml(r, 'fr');
  assert.match(fr, /Comment corriger sur Squarespace 7\.1/);
  assert.match(fr, /dans le bloc Image/);
});

test('detects Wix and WordPress', { timeout: 60000 }, async () => {
  const w = await scan({ urls: [`${base}/wix.html`], screenshots: false, ...opts });
  assert.equal(w.platform.id, 'wix');
  assert.match(toHtml(w, 'en'), /What&#39;s in the image\?/);
  const wp = await scan({ urls: [`${base}/wordpress.html`], screenshots: false, ...opts });
  assert.equal(wp.platform.id, 'wordpress');
  assert.equal(wp.platform.builder, 'Block editor');
  assert.match(toHtml(wp, 'en'), /Alternative text/);
});

test('a platform you choose overrides detection', { timeout: 60000 }, async () => {
  const r = await scan({ urls: [`${base}/wix.html`], platform: 'squarespace', screenshots: false, ...opts });
  assert.equal(r.platform.id, 'squarespace');
  assert.equal(r.platform.source, 'chosen');
  assert.equal(r.platform.detected, 'wix');
});
