import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { PROFILES, FRAMEWORKS, WCAG_SC, tagToSc, frameworksForSc } from './standards.js';
import { collectPageSignals, evaluatePage, evaluateSite } from './canada-checks.js';
import { detectPlatformInPage, describeElementsInPage, PLATFORMS } from './platform.js';

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const SKIP_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|gz|png|jpe?g|gif|svg|webp|mp4|mp3|avi|mov|css|js|json|xml|ico|woff2?|ttf)(\?|#|$)/i;
const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'];

function normalizeAxe(r, type) {
  const wcag = [...new Set(r.tags.map(tagToSc).filter(Boolean))];
  return {
    id: r.id,
    source: 'axe',
    type,
    impact: r.impact || 'minor',
    help: r.help,
    description: r.description,
    helpUrl: r.helpUrl,
    wcag,
    bestPractice: r.tags.includes('best-practice'),
    nodes: r.nodes.slice(0, 50).map((n) => ({ target: n.target, html: n.html, failureSummary: n.failureSummary })),
  };
}

function enrich(issue) {
  return { ...issue, frameworks: frameworksForSc(issue.wcag || []) };
}

async function sitemapUrls(url) {
  const res = await fetch(url);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

/**
 * Scan one or more URLs.
 * @param {object} opts
 * @param {string[]} opts.urls          start URLs (or a sitemap.xml)
 * @param {string[]} [opts.standards]   any of aca, aoda, quebec, wcag22 (default: all four)
 * @param {string}   [opts.profile]     single standard (older option, same as standards: [profile])
 * @param {number}   [opts.maxPages]    crawl limit (1 = no crawling)
 * @param {boolean}  [opts.bestPractice] include axe best-practice rules
 * @param {number}   [opts.timeout]     navigation timeout ms
 * @param {function} [opts.onProgress]  (msg) => void
 */
export async function scan(opts) {
  const standards = [...new Set(opts.standards?.length ? opts.standards : opts.profile ? [opts.profile] : Object.keys(PROFILES))];
  for (const s of standards) if (!PROFILES[s]) throw new Error(`Unknown standard "${s}". Use any of: ${Object.keys(PROFILES).join(', ')}`);
  const maxPages = opts.maxPages ?? 1;
  const timeout = opts.timeout ?? 45000;
  const log = opts.onProgress || (() => {});
  // Run the rules for every chosen standard in one pass, so each one is reported accurately.
  const axeTags = [...new Set(standards.flatMap((s) => PROFILES[s].axeTags)), ...(opts.bestPractice ? ['best-practice'] : [])];

  let queue = [];
  for (const u of opts.urls) {
    if (/sitemap[^/]*\.xml(\?|$)/i.test(u)) queue.push(...(await sitemapUrls(u)));
    else queue.push(u);
  }
  queue = queue.map((u) => new URL(u).href);
  const origins = new Set(queue.map((u) => new URL(u).origin));
  const seen = new Set(queue.map((u) => u.split('#')[0]));
  const crawl = maxPages > queue.length;

  const launch = {};
  if (opts.executablePath) launch.executablePath = opts.executablePath;
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  if (proxy) launch.proxy = { server: proxy, bypass: process.env.NO_PROXY || process.env.no_proxy || '127.0.0.1,localhost' };
  // Docker/cloud hosts have a tiny /dev/shm; without this flag Chromium can hang or crash.
  launch.args = ['--disable-dev-shm-usage'];
  const browser = await chromium.launch(launch);
  // Some sites block "HeadlessChrome". Use the normal Chrome user agent and say who we are.
  const ua = (await browser.newPage().then(async (p) => { const v = await p.evaluate(() => navigator.userAgent); await p.close(); return v; }))
    .replace('HeadlessChrome', 'Chrome') + ' CanadaA11yScanner/1.0';
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-CA', userAgent: ua, ignoreHTTPSErrors: !!opts.ignoreHttpsErrors });
  const pages = [];
  const pageFlags = [];
  let detected = null;
  const started = new Date();

  try {
    while (queue.length && pages.length < maxPages) {
      const url = queue.shift();
      log(`Scanning ${url}`);
      opts.onPage?.({ current: pages.length + 1, max: Math.min(maxPages, pages.length + 1 + queue.length), maxPages, url });
      const page = await context.newPage();
      const result = { url, title: '', status: null, error: null, issues: [] };
      try {
        // Wait for the page's HTML, not for every image, ad and tracker to finish.
        let resp = null;
        try {
          resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
        } catch (err) {
          // Timed out, but if some of the page has arrived, scan what we have.
          const hasContent = await page.evaluate(() => !!document.body && document.body.innerHTML.trim().length > 0).catch(() => false);
          if (!/Timeout/i.test(err.message) || !hasContent) throw err;
          result.partial = true;
          log('  ~ page was still loading after the time limit; scanning what loaded');
        }
        result.status = resp?.status() ?? null;
        if (result.status >= 400) throw new Error(`HTTP ${result.status}`);
        // Give scripts and styles a little time to finish, without waiting forever.
        await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
        await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
        result.title = await page.title();
        result.url = page.url();

        await page.addScriptTag({ content: AXE_SOURCE });
        const axe = await page.evaluate(async (tags) => window.axe.run(document, {
          runOnly: { type: 'tag', values: tags },
          resultTypes: ['violations', 'incomplete'],
        }), axeTags);
        result.issues.push(...axe.violations.map((r) => normalizeAxe(r, 'violation')));
        result.issues.push(...axe.incomplete.map((r) => normalizeAxe(r, 'review')));

        const signals = await page.evaluate(collectPageSignals);
        const { issues, flags } = evaluatePage(signals);
        result.issues.push(...issues);
        pageFlags.push(flags);

        // Which website builder made this site? The first page that loads decides.
        if (!detected) detected = await page.evaluate(detectPlatformInPage).catch(() => null);
        // Describe each problem element in plain words, and take small pictures of them.
        await addContext(page, result.issues, opts.screenshots !== false).catch((e) => log(`  ~ could not describe elements: ${e.message.split('\n')[0]}`));

        if (crawl) {
          for (const l of signals.links) {
            try {
              const u = new URL(l.href);
              u.hash = '';
              if (!origins.has(u.origin) || !/^https?:$/.test(u.protocol) || SKIP_EXT.test(u.pathname)) continue;
              if (!seen.has(u.href)) { seen.add(u.href); queue.push(u.href); }
            } catch { /* ignore bad hrefs */ }
          }
        }
      } catch (err) {
        result.error = err.message.split('\n')[0];
        log(`  ! ${result.error}`);
      } finally {
        await page.close();
      }
      result.issues = result.issues.map(enrich)
        .sort((a, b) => (a.type === b.type ? 0 : a.type === 'violation' ? -1 : 1) || IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact));
      pages.push(result);
    }
  } finally {
    await browser.close();
  }

  const siteIssues = pageFlags.length ? evaluateSite(pageFlags).map(enrich) : [];
  const chosen = opts.platform && opts.platform !== 'auto' && PLATFORMS[opts.platform] ? opts.platform : null;
  const platform = chosen
    ? { id: chosen, version: detected?.id === chosen ? detected.version : null, builder: detected?.id === chosen ? detected.builder : null, source: 'chosen', detected: detected?.id || 'unknown' }
    : { ...(detected || { id: 'unknown', version: null, builder: null }), source: 'auto' };
  return buildReport({ pages, siteIssues, standards, axeTags, started, platform });
}

const SHOTS_PER_PAGE = 24;
const SHOTS_PER_ISSUE = 3;

async function addContext(page, issues, screenshots) {
  const selectors = new Set();
  for (const i of issues) for (const n of i.nodes) {
    const t = n.target;
    if (Array.isArray(t) && t.length === 1 && typeof t[0] === 'string' && t[0] !== 'site') selectors.add(t[0]);
  }
  if (!selectors.size) return;
  const desc = await page.evaluate(describeElementsInPage, [...selectors]);
  for (const i of issues) for (const n of i.nodes) {
    const sel = Array.isArray(n.target) && n.target.length === 1 ? n.target[0] : null;
    if (sel && desc[sel]) n.where = desc[sel];
  }
  if (!screenshots) return;
  let budget = SHOTS_PER_PAGE;
  const ordered = [...issues].sort((a, b) => (a.type === 'violation' ? 0 : 1) - (b.type === 'violation' ? 0 : 1));
  for (const i of ordered) {
    let perIssue = SHOTS_PER_ISSUE;
    for (const n of i.nodes) {
      if (budget <= 0) return;
      if (perIssue <= 0) break;
      const sel = Array.isArray(n.target) && n.target.length === 1 ? n.target[0] : null;
      if (!sel || sel === 'html' || sel === 'site' || n.where?.kind === 'page') continue;
      try {
        const loc = page.locator(sel).first();
        await loc.scrollIntoViewIfNeeded({ timeout: 2000 });
        const box = await loc.boundingBox({ timeout: 2000 });
        if (!box || box.width < 2 || box.height < 2) continue;
        const vp = page.viewportSize();
        const pad = 10;
        const x = Math.max(0, box.x - pad); const y = Math.max(0, box.y - pad);
        const width = Math.min(vp.width - x, box.width + pad * 2, 900);
        const height = Math.min(vp.height - y, box.height + pad * 2, 360);
        if (width < 4 || height < 4) continue;
        // Highlight the element while we take the picture
        const undo = await loc.evaluate((el) => { const o = el.style.outline; const oo = el.style.outlineOffset; el.style.outline = '3px solid #d4351c'; el.style.outlineOffset = '2px'; return [o, oo]; });
        const buf = await page.screenshot({ clip: { x, y, width, height }, type: 'jpeg', quality: 60, timeout: 3000, animations: 'disabled' });
        await loc.evaluate((el, [o, oo]) => { el.style.outline = o; el.style.outlineOffset = oo; }, undo).catch(() => {});
        n.shot = `data:image/jpeg;base64,${buf.toString('base64')}`;
        budget--; perIssue--;
      } catch { /* element hidden, detached or offscreen: skip the picture */ }
    }
  }
}

export function buildReport({ pages, siteIssues, standards, axeTags, started, platform = { id: 'unknown', source: 'auto' } }) {
  const all = [...pages.flatMap((p) => p.issues), ...siteIssues];
  const violations = all.filter((i) => i.type === 'violation');
  const reviews = all.filter((i) => i.type === 'review');

  const byImpact = Object.fromEntries(IMPACT_ORDER.map((k) => [k, 0]));
  for (const v of violations) byImpact[v.impact] += v.nodes.length;

  // Which success criteria fail, per framework
  const scannedOk = pages.some((p) => !p.error);
  const failingSc = new Set(violations.flatMap((v) => v.wcag));
  const frameworks = standards.map((id) => FRAMEWORKS[PROFILES[id].framework]).map((fw) => {
    const failing = [...failingSc].filter((sc) => fw.includes(sc)).sort(scSort);
    return {
      id: fw.id, short: fw.short, name: fw.name, jurisdiction: fw.jurisdiction, wcag: fw.wcag,
      failingCriteria: failing.map((sc) => ({ sc, name: WCAG_SC[sc]?.name, level: WCAG_SC[sc]?.level, clause: fw.clause(sc) })),
      status: failing.length ? 'fail' : scannedOk ? 'pass-automated' : 'not-scanned',
    };
  });

  const totalNodes = violations.reduce((n, v) => n + v.nodes.length, 0);
  const weighted = byImpact.critical * 10 + byImpact.serious * 5 + byImpact.moderate * 2 + byImpact.minor;
  const scanned = pages.filter((p) => !p.error).length;
  const score = scanned === 0 ? null : Math.max(0, Math.round(100 - Math.min(100, (weighted / scanned) * 1.5)));

  return {
    tool: 'canada-a11y-scanner',
    version: '1.0.0',
    standards,
    platform,
    profile: standards.join(','),
    primaryFramework: PROFILES[standards[0]].framework,
    axeTags,
    startedAt: started.toISOString(),
    finishedAt: new Date().toISOString(),
    summary: {
      pagesScanned: pages.length,
      pagesWithErrors: pages.filter((p) => p.error).length,
      violationRules: new Set(violations.map((v) => v.id)).size,
      violationInstances: totalNodes,
      needsReview: reviews.length,
      byImpact,
      score,
    },
    frameworks,
    siteIssues,
    pages,
  };
}

function scSort(a, b) {
  const pa = a.split('.').map(Number); const pb = b.split('.').map(Number);
  return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
}

export function shouldFail(report, failOn) {
  if (!failOn || failOn === 'none') return false;
  const idx = IMPACT_ORDER.indexOf(failOn);
  if (idx < 0) throw new Error(`--fail-on must be one of: none, ${IMPACT_ORDER.join(', ')}`);
  return IMPACT_ORDER.slice(0, idx + 1).some((k) => report.summary.byImpact[k] > 0);
}
