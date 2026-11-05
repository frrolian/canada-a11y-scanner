import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { scan, shouldFail, toHtml, toMarkdown } from '../src/index.js';
import { tagToSc, frameworksForSc } from '../src/standards.js';
import { guessLanguage } from '../src/canada-checks.js';

const executablePath = process.env.CHROMIUM_PATH;
let server; let base;

before(async () => {
  server = http.createServer((req, res) => {
    const name = req.url.replace(/^\//, '').split('?')[0] || 'bad.html';
    const file = new URL(`./fixtures/${name}`, import.meta.url);
    if (!/^\w+\.html$/.test(name) || !existsSync(file)) { res.writeHead(404); return res.end('nf'); }
    res.writeHead(200, { 'content-type': 'text/html' }); res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test('tagToSc parses axe WCAG tags', () => {
  assert.equal(tagToSc('wcag111'), '1.1.1');
  assert.equal(tagToSc('wcag1410'), '1.4.10');
  assert.equal(tagToSc('wcag2aa'), null);
});

test('framework mapping respects AODA exemptions', () => {
  const fw = frameworksForSc(['1.2.5']);
  assert.ok(fw.aca);
  assert.equal(fw.aoda, undefined);
  assert.deepEqual(frameworksForSc(['1.4.10']).aoda, undefined);
  assert.deepEqual(frameworksForSc(['1.4.3']).aca, ['9.1.4.3']);
});

test('language guesser', () => {
  assert.equal(guessLanguage('Nous sommes heureux de vous accueillir sur notre site web'), 'fr');
  assert.equal(guessLanguage('We are happy to welcome you to our web site and thank you for the visit'), 'en');
});

test('bad page produces WCAG and Canada findings', { timeout: 60000 }, async () => {
  const r = await scan({ urls: [`${base}/bad.html`], profile: 'aca', executablePath });
  const ids = new Set(r.pages[0].issues.map((i) => i.id));
  for (const id of ['image-alt', 'color-contrast', 'label', 'ca-language-toggle-lang', 'ca-language-of-parts', 'ca-document-formats', 'ca-media-alternatives']) {
    assert.ok(ids.has(id), `expected ${id}, got ${[...ids].join(', ')}`);
  }
  assert.ok(r.siteIssues.some((i) => i.id === 'ca-accessibility-statement'));
  assert.equal(r.frameworks.find((f) => f.id === 'aca').status, 'fail');
  assert.ok(shouldFail(r, 'serious'));
  assert.match(toHtml(r, 'fr'), /Rapport d'accessibilité/);
  assert.match(toHtml(r, 'en'), /How to fix/);
  assert.match(toHtml(r, 'fr'), /Comment corriger/);
  assert.doesNotMatch(toHtml(r, 'en'), /Ask AI/);
  assert.match(toHtml(r, 'en', { ai: true, aiEndpoint: '/api/ask/x' }), /Ask AI how to fix this/);
  // standards: only the chosen ones are reported, and all rules for them are run
  const only = await scan({ urls: [`${base}/bad.html`], standards: ['aoda'], executablePath });
  assert.deepEqual(only.frameworks.map((f) => f.id), ['aoda']);
  assert.match(toMarkdown(r), /Canadian frameworks/);
});

test('good page is clean and crawling follows links', { timeout: 60000 }, async () => {
  const r = await scan({ urls: [`${base}/good.html`], profile: 'aca', executablePath });
  const violations = r.pages[0].issues.filter((i) => i.type === 'violation');
  assert.deepEqual(violations.map((v) => v.id), []);
  assert.equal(r.siteIssues.length, 0);
  assert.equal(shouldFail(r, 'minor'), false);

  const crawled = await scan({ urls: [`${base}/bad.html`], maxPages: 5, executablePath });
  assert.ok(crawled.pages.some((p) => p.url.endsWith('/good.html')));
});
