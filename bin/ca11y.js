#!/usr/bin/env node
import { mkdirSync, writeFileSync, appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { scan, shouldFail } from '../src/scanner.js';
import { toHtml, toMarkdown } from '../src/report.js';
import { PROFILES } from '../src/standards.js';

const HELP = `🍁 ca11y — accessibility scanner with Canadian compliance mapping

Usage:
  ca11y scan <url...> [options]     Scan one or more URLs (or a sitemap.xml)
  ca11y serve [--port 3000]         Launch the local web interface

Scan options:
  -p, --profile <id>      ${Object.keys(PROFILES).join(' | ')}  (default: aca)
                            aca    = Accessible Canada Act / CAN/ASC-EN 301 549 (WCAG 2.1 AA)
                            aoda   = Ontario AODA (WCAG 2.0 AA)
                            quebec = Québec SGQRI 008 (WCAG 2.0 AA)
                            wcag22 = WCAG 2.2 AA
  -m, --max-pages <n>     Crawl same-site links up to n pages (default: 1)
  -o, --out <dir>         Output directory (default: a11y-report)
  -f, --format <list>     html,json,md  (default: html,json,md)
  -l, --lang <en|fr>      HTML report language (default: en)
      --urls-file <file>  Read URLs from a file (one per line)
      --fail-on <level>   Exit 1 if violations at/above: critical|serious|moderate|minor|none (default: none)
      --best-practice     Also run axe-core best-practice rules
      --timeout <ms>      Page load timeout (default: 30000)
  -h, --help
`;

function parse(argv) {
  const o = { _: [], profile: 'aca', maxPages: 1, out: 'a11y-report', format: 'html,json,md', lang: 'en', failOn: 'none', port: 3000 };
  const alias = { p: 'profile', m: 'max-pages', o: 'out', f: 'format', l: 'lang', h: 'help' };
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i];
    if (!a.startsWith('-')) { o._.push(a); continue; }
    a = a.replace(/^--?/, '');
    let [k, v] = a.split('=');
    k = alias[k] || k;
    const camel = k.replace(/-(\w)/g, (_, c) => c.toUpperCase());
    if (['help', 'bestPractice'].includes(camel)) { o[camel] = true; continue; }
    if (v === undefined) v = argv[++i];
    o[camel] = v;
  }
  o.maxPages = Number(o.maxPages);
  return o;
}

const args = parse(process.argv.slice(2));
const cmd = args._.shift();

if (args.help || !cmd) { console.log(HELP); process.exit(cmd || args.help ? 0 : 1); }

if (cmd === 'serve') {
  const { startServer } = await import('../src/server.js');
  const port = Number(process.env.PORT || args.port);
  const host = process.env.HOST || args.host || '127.0.0.1';
  await startServer({ port, host, executablePath: process.env.CHROMIUM_PATH });
  console.log(`🍁 Canada Accessibility Scanner running at http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
} else if (cmd === 'scan') {
  let urls = args._;
  if (args.urlsFile) urls = urls.concat(readFileSync(args.urlsFile, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#')));
  if (!urls.length) { console.error('Error: provide at least one URL.\n'); console.log(HELP); process.exit(2); }
  try {
    const report = await scan({
      urls, profile: args.profile, maxPages: Math.max(args.maxPages, urls.length), bestPractice: args.bestPractice,
      timeout: Number(args.timeout || 30000), ignoreHttpsErrors: process.env.CA11Y_IGNORE_HTTPS_ERRORS === '1', executablePath: process.env.CHROMIUM_PATH,
      onProgress: (m) => console.error(m),
    });
    mkdirSync(args.out, { recursive: true });
    const formats = args.format.split(',').map((s) => s.trim());
    const md = toMarkdown(report);
    if (formats.includes('json')) writeFileSync(join(args.out, 'report.json'), JSON.stringify(report, null, 2));
    if (formats.includes('html')) writeFileSync(join(args.out, 'report.html'), toHtml(report, args.lang));
    if (formats.includes('md')) writeFileSync(join(args.out, 'report.md'), md);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);

    const s = report.summary;
    console.log(`\n🍁 Profile ${report.profile} — score ${s.score ?? 'n/a'}/100`);
    console.log(`   ${s.pagesScanned} page(s), ${s.violationRules} rule violations across ${s.violationInstances} elements (critical ${s.byImpact.critical}, serious ${s.byImpact.serious}, moderate ${s.byImpact.moderate}, minor ${s.byImpact.minor}), ${s.needsReview} to review`);
    for (const f of report.frameworks) console.log(`   ${f.status === 'fail' ? '✗' : f.status === 'not-scanned' ? '-' : '✓'} ${f.short.padEnd(18)} ${f.failingCriteria.map((c) => c.sc).join(', ') || 'no automated failures'}`);
    console.log(`   Reports written to ${args.out}/`);
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `score=${s.score}\nviolations=${s.violationInstances}\n`);
    if (s.pagesWithErrors === s.pagesScanned) { console.error('\nError: no pages could be scanned.'); process.exit(2); }
    if (shouldFail(report, args.failOn)) { console.error(`\nFailing: violations at or above "${args.failOn}" found.`); process.exit(1); }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(2);
  }
} else {
  console.error(`Unknown command "${cmd}"\n`); console.log(HELP); process.exit(2);
}
