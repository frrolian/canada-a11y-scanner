# Canada Accessibility Scanner (`ca11y`)

An automated website accessibility scanner built on [axe-core](https://github.com/dequelabs/axe-core) and Playwright that maps every finding to **Canadian accessibility requirements**:

| Standard id | Framework | Technical standard |
|---|---|---|
| `aca` | **Accessible Canada Act**: CAN/ASC-EN 301 549:2024, clause 9 | WCAG 2.1 AA |
| `aoda` | **Ontario AODA**: IASR O. Reg. 191/11, s.14 | WCAG 2.0 AA (excl. 1.2.4 live captions & 1.2.5 audio description) |
| `quebec` | **Québec**: SGQRI 008 2.0 | WCAG 2.0 AA |
| `wcag22` | WCAG 2.2 AA (future-proofing) | WCAG 2.2 AA |

By default one scan checks **all four**, and the report shows pass/fail for each. You can also pick only the ones you need. For ACA, each failure also shows the matching EN 301 549 clause (e.g. WCAG 1.4.3 → clause 9.1.4.3).

### Canada-specific checks (beyond axe-core)

| Check | What it looks for | Basis |
|---|---|---|
| `ca-language-toggle` | A link to the other official language (Français/English or `hreflang`) | Official Languages Act, Canada.ca standards |
| `ca-language-toggle-lang` | "Français" link without `lang="fr"` (screen readers mispronounce it) | WCAG 3.1.2 |
| `ca-language-of-parts` | French passages on English pages (or the reverse) without a `lang` attribute | WCAG 3.1.2 |
| `ca-official-language` | Page language that isn't English or French | Official Languages Act |
| `ca-accessibility-statement` | A site-wide link to an accessibility plan/statement | ACA Part 4, AODA IASR s.3–4 |
| `ca-feedback-process` | An accessibility feedback/contact mechanism | ACA Part 4, AODA IASR s.11 |
| `ca-document-formats` | PDF/Office documents that need accessible or alternate formats | EN 301 549 clause 10, AODA IASR s.12 |
| `ca-media-alternatives` | Video/audio needing captions, described video and transcripts | WCAG 1.2.x, EN 301 549 clause 7 |

Reports are available in **English or French** (`--lang fr`).

> ⚠️ Automated tools catch only about 30–40% of accessibility barriers. A clean scan does **not** prove legal compliance. Also test manually with a keyboard and screen readers, and with people with disabilities. This tool does not give legal advice; confirm requirements for your organization with the official sources.

---

## Quick start (local)

Requires Node.js 18+.

```bash
npm install
npx playwright install chromium
```

**Command line:**

```bash
npx ca11y scan https://www.example.ca --max-pages 10
npx ca11y scan https://www.example.ca --standards aca,aoda
```

Reports land in `a11y-report/` (`report.html`, `report.json`, `report.md`).

**Web interface:**

```bash
npm start
```

Then open http://localhost:3000, enter a URL, choose a profile and run the scan.

### CLI options

```
ca11y scan <url...> [options]
  -s, --standards <list>  aca,aoda,quebec,wcag22   (default: all four)
  -m, --max-pages <n>     Crawl same-site links up to n pages (default: 1)
  -o, --out <dir>         Output directory (default: a11y-report)
  -f, --format <list>     html,json,md
  -l, --lang <en|fr>      HTML report language
      --urls-file <file>  One URL per line
      --fail-on <level>   Exit 1 on critical|serious|moderate|minor (default: none)
      --best-practice     Include axe-core best-practice rules
      --timeout <ms>      Page load timeout
ca11y serve [--port 3000]
```

You can also pass a `sitemap.xml` URL to scan every page it lists.

---

## Use it in GitHub

### 1. Scan any site from the Actions tab
This repo ships with `.github/workflows/accessibility-scan.yml`. Go to **Actions → Accessibility scan → Run workflow**, enter a URL and pick a profile. You get:
- a summary table on the workflow run page
- the full HTML/JSON report as a downloadable artifact

It also runs weekly. To choose which sites it scans, set a repository variable **`A11Y_URLS`** (Settings → Secrets and variables → Actions → Variables).

### 2. Gate pull requests in another repo
```yaml
- uses: YOUR-USERNAME/canada-a11y-scanner@v1
  with:
    urls: https://staging.example.ca
    standards: aca,aoda   # any of aca, aoda, quebec, wcag22 (default: all)
    max-pages: 20
    fail-on: serious      # fail the build on serious/critical issues
    report-lang: en       # or fr
```
Outputs: `score`, `violations`.

To publish the action, push a tag: `git tag v1 && git push origin v1`.

### 3. Run it as a web app (Docker)
```bash
docker build -t ca11y .
docker run -p 3000:3000 ca11y
```

The image works on any container host (Render, Fly.io, Cloud Run, Azure, etc.). The web UI runs one scan at a time. If you expose it publicly, put authentication in front of it, because it fetches any URL it's given.

### 4. Optional: AI "how to fix" helper
Every report already includes free, built-in **How to fix** steps (English and French) for common problems.

You can also add an **Ask AI how to fix this** button to each problem in the web app. It uses Claude and **costs money per question**, so it stays off until you add a key:

| Setting (environment variable) | What it does | Default |
|---|---|---|
| `ANTHROPIC_API_KEY` | Your Claude API key from console.anthropic.com. Turns the button on. | not set (AI off) |
| `AI_MODEL` | Which Claude model answers | `claude-opus-5-5` |
| `AI_DAILY_LIMIT` | Most AI questions per day for the whole site | `50` |
| `AI_HOURLY_LIMIT_PER_VISITOR` | Most AI questions per visitor per hour | `10` |

On Render: **your service → Environment → Add Environment Variable**. Set a spending limit in the Anthropic console as well. To spend less per question, set `AI_MODEL` to `claude-haiku-5-5`.

---

## Development

```bash
npm test
```

Tests run against the fixtures in `test/fixtures/`. CI (`.github/workflows/ci.yml`) runs these tests and a self-test of the Action on every push and pull request.

### Project layout
```
bin/ca11y.js           CLI entry point
src/scanner.js         Playwright crawler + axe-core runner + scoring
src/canada-checks.js   Official-languages / ACA / AODA checks
src/standards.js       WCAG criteria → Canadian framework mapping
src/report.js          HTML (EN/FR) and Markdown reports
src/fixes.js           Built-in plain-language fix steps (EN/FR)
src/ai.js              Optional AI helper (Claude API)
src/server.js          Local web interface
action.yml             Reusable GitHub Action
```

## License
MIT
