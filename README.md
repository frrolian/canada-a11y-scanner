# 🍁 Canada Accessibility Scanner (`ca11y`)

An automated website accessibility scanner built on [axe-core](https://github.com/dequelabs/axe-core) and Playwright that maps every finding to **Canadian accessibility requirements**:

| Profile | Framework | Technical standard |
|---|---|---|
| `aca` *(default)* | **Accessible Canada Act**: CAN/ASC-EN 301 549:2024, clause 9 | WCAG 2.1 AA |
| `aoda` | **Ontario AODA**: IASR O. Reg. 191/11, s.14 | WCAG 2.0 AA (excl. 1.2.4 live captions & 1.2.5 audio description) |
| `quebec` | **Québec**: SGQRI 008 2.0 | WCAG 2.0 AA |
| `wcag22` | WCAG 2.2 AA (future-proofing) | WCAG 2.2 AA |

Every report shows results against **all four frameworks**, so you can see your ACA, AODA and Québec status from one scan. For ACA, each failure also shows the matching EN 301 549 clause (e.g. WCAG 1.4.3 → clause 9.1.4.3).

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
npx ca11y scan https://www.example.ca --max-pages 10 --profile aca
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
  -p, --profile <id>      aca | aoda | quebec | wcag22   (default: aca)
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
    profile: aca          # aca | aoda | quebec | wcag22
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
src/server.js          Local web interface
action.yml             Reusable GitHub Action
```

## License
MIT
