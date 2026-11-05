import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { PROFILES, FRAMEWORKS, WCAG_SC, tagToSc, frameworksForSc } from './standards.js';
import { collectPageSignals, evaluatePage, evaluateSite } from './canada-checks.js';

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
 * @param {string}   [opts.profile]     aca | aoda | quebec | wcag22
 * @param {number}   [opts.maxPages]    crawl limit (1 = no crawling)
 * @param {boolean}  [opts.bestPractice] include axe best-practice rules
 * @param {number}   [opts.timeout]     navigation timeout ms
 * @param {function} [opts.onProgress]  (msg) => void
 */
export async function scan(opts) {
  const profileId = opts.profile || 'aca';
  const profile = PROFILES[profileId];
  if (!profile) throw new Error(`Unknown profile "${profileId}". Use one of: ${Object.keys(PROFILES).join(', ')}`);
  const maxPages = opts.maxPages ?? 1;
  const timeout = opts.timeout ?? 30000;
  const log = opts.onProgress || (() => {});
  const axeTags = [...profile.axeTags, ...(opts.bestPractice ? ['best-practice'] : [])];

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
  const browser = await chromium.launch(launch);
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-CA', ignoreHTTPSErrors: !!opts.ignoreHttpsErrors });
  const pages = [];
  const pageFlags = [];
  const started = new Date();

  try {
    while (queue.length && pages.length < maxPages) {
      const url = queue.shift();
      log(`Scanning ${url}`);
      const page = await context.newPage();
      const result = { url, title: '', status: null, error: null, issues: [] };
      try {
        const resp = await page.goto(url, { waitUntil: 'load', timeout });
        result.status = resp?.status() ?? null;
        if (result.status >= 400) throw new Error(`HTTP ${result.status}`);
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
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
  return buildReport({ pages, siteIssues, profileId, axeTags, started });
}

export function buildReport({ pages, siteIssues, profileId, axeTags, started }) {
  const all = [...pages.flatMap((p) => p.issues), ...siteIssues];
  const violations = all.filter((i) => i.type === 'violation');
  const reviews = all.filter((i) => i.type === 'review');

  const byImpact = Object.fromEntries(IMPACT_ORDER.map((k) => [k, 0]));
  for (const v of violations) byImpact[v.impact] += v.nodes.length;

  // Which success criteria fail, per framework
  const scannedOk = pages.some((p) => !p.error);
  const failingSc = new Set(violations.flatMap((v) => v.wcag));
  const frameworks = Object.values(FRAMEWORKS).map((fw) => {
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
    profile: profileId,
    primaryFramework: PROFILES[profileId].framework,
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
