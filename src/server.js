import http from 'node:http';
import { scan } from './scanner.js';
import { toHtml } from './report.js';
import { PROFILES, FRAMEWORKS } from './standards.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function form(error = '') {
  const opts = Object.keys(PROFILES).map((p) => `<option value="${p}">${esc(FRAMEWORKS[PROFILES[p].framework].name)}</option>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Canada Accessibility Scanner</title>
<style>:root{--bg:#fff;--fg:#1b1b1b;--line:#8a8f98;--accent:#26374a;--card:#f5f6f8}
@media (prefers-color-scheme:dark){:root{--bg:#121417;--fg:#eceef1;--line:#5b616b;--accent:#9fc3ff;--card:#1c1f24}}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.5 system-ui,sans-serif}main{max-width:640px;margin:0 auto;padding:32px 16px}
h1{margin-top:0}label{display:block;font-weight:600;margin:16px 0 4px}input,select{width:100%;padding:10px;font:inherit;border:2px solid var(--line);border-radius:6px;background:var(--card);color:var(--fg)}
button{margin-top:20px;padding:12px 20px;font:inherit;font-weight:700;background:var(--accent);color:var(--bg);border:0;border-radius:6px;cursor:pointer}
:focus-visible{outline:3px solid #f5a623;outline-offset:2px}.err{color:#c62828;font-weight:600}.hint{font-size:.9rem;opacity:.8}</style></head>
<body><main><h1>🍁 Canada Accessibility Scanner</h1>
<p>Scan a website against WCAG and see how it maps to the Accessible Canada Act (EN 301 549), Ontario's AODA and Québec's SGQRI 008, plus official-languages checks.</p>
${error ? `<p class="err" role="alert">${esc(error)}</p>` : ''}
<form action="/scan" method="get">
<label for="url">Website URL</label><input id="url" name="url" type="url" required placeholder="https://example.ca" autocomplete="url">
<label for="profile">Compliance profile</label><select id="profile" name="profile">${opts}</select>
<label for="pages">Pages to crawl</label><input id="pages" name="pages" type="number" min="1" max="50" value="5">
<label for="lang">Report language / Langue du rapport</label><select id="lang" name="lang"><option value="en">English</option><option value="fr" lang="fr">Français</option></select>
<button type="submit">Run scan</button><p class="hint">Scans take ~5–15 seconds per page.</p>
</form></main></body></html>`;
}

export function startServer({ port = 3000, host = '127.0.0.1', executablePath } = {}) {
  let busy = false;
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, `http://${req.headers.host}`);
    const send = (code, body, type = 'text/html; charset=utf-8') => { res.writeHead(code, { 'content-type': type }); res.end(body); };
    if (u.pathname === '/') return send(200, form());
    if (u.pathname === '/health') return send(200, 'ok', 'text/plain');
    if (u.pathname === '/scan' || u.pathname === '/api/scan') {
      const target = u.searchParams.get('url');
      const profile = u.searchParams.get('profile') || 'aca';
      const pages = Math.min(50, Math.max(1, Number(u.searchParams.get('pages')) || 1));
      const lang = u.searchParams.get('lang') === 'fr' ? 'fr' : 'en';
      let parsed;
      try { parsed = new URL(target); if (!/^https?:$/.test(parsed.protocol)) throw new Error(); } catch { return send(400, form('Please enter a valid http(s) URL.')); }
      if (!PROFILES[profile]) return send(400, form('Unknown profile.'));
      if (busy) return send(429, form('A scan is already running — please try again in a moment.'));
      busy = true;
      try {
        const report = await scan({ urls: [parsed.href], profile, maxPages: pages, executablePath, onProgress: (m) => console.log(m) });
        if (u.pathname === '/api/scan') return send(200, JSON.stringify(report, null, 2), 'application/json');
        return send(200, toHtml(report, lang));
      } catch (e) {
        return send(500, form(`Scan failed: ${e.message}`));
      } finally { busy = false; }
    }
    send(404, 'Not found', 'text/plain');
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}
