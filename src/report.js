import { FRAMEWORKS } from './standards.js';
import { fixFor } from './fixes.js';

const T = {
  en: {
    title: 'Accessibility Report', subtitle: 'WCAG scan with Canadian compliance mapping',
    profile: 'Standards', pages: 'Pages scanned', violations: 'Violations', instances: 'Failing elements',
    review: 'Needs manual review', score: 'Automated score', frameworks: 'Canadian frameworks',
    pass: 'No automated failures', fail: 'Failures found', failing: 'Failing criteria',
    site: 'Site-wide findings', page: 'Page', error: 'Could not scan', none: 'No issues detected by automated checks on this page.',
    learn: 'Learn more', fix: 'How to fix', elements: 'Affected elements', refs: 'Canadian references',
    impact: { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' },
    type: { violation: 'Violation', review: 'Review' },
    disclaimer: 'Automated tools detect roughly 30–40% of accessibility barriers. A clean result is not proof of compliance with the Accessible Canada Act, AODA or any other law. Combine with manual keyboard, screen-reader and usability testing with people with disabilities. This report is not legal advice.',
    generated: 'Generated',
    howToFix: 'How to fix', example: 'Example',
    askTitle: 'Ask AI about this problem', askLabel: 'Your question (optional)', askPlaceholder: 'How do I fix this on my site?',
    askBtn: 'Ask AI how to fix this', asking: 'Asking the AI…', askNote: 'AI answers can be wrong. Check the advice before changing your site.',
  },
  fr: {
    title: "Rapport d'accessibilité", subtitle: 'Analyse WCAG avec correspondance aux normes canadiennes',
    profile: 'Normes', pages: 'Pages analysées', violations: 'Non-conformités', instances: 'Éléments en échec',
    review: 'Vérification manuelle requise', score: 'Score automatisé', frameworks: 'Cadres canadiens',
    pass: 'Aucun échec automatisé', fail: 'Échecs détectés', failing: 'Critères en échec',
    site: "Constats à l'échelle du site", page: 'Page', error: "Impossible d'analyser", none: 'Aucun problème détecté automatiquement sur cette page.',
    learn: 'En savoir plus', fix: 'Correction', elements: 'Éléments touchés', refs: 'Références canadiennes',
    impact: { critical: 'Critique', serious: 'Grave', moderate: 'Modéré', minor: 'Mineur' },
    type: { violation: 'Non-conformité', review: 'À vérifier' },
    disclaimer: "Les outils automatisés détectent environ 30 à 40 % des obstacles. Un résultat sans erreur ne prouve pas la conformité à la Loi canadienne sur l'accessibilité, à la LAPHO ou à toute autre loi. Complétez par des tests manuels (clavier, lecteur d'écran) et des tests avec des personnes en situation de handicap. Ce rapport ne constitue pas un avis juridique.",
    generated: 'Généré le',
    howToFix: 'Comment corriger', example: 'Exemple',
    askTitle: "Demander à l'IA", askLabel: 'Votre question (facultatif)', askPlaceholder: 'Comment corriger ce problème sur mon site?',
    askBtn: "Demander à l'IA comment corriger", asking: "Question envoyée à l'IA…", askNote: "Les réponses de l'IA peuvent contenir des erreurs. Vérifiez les conseils avant de modifier votre site.",
  },
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function issueHtml(i, t, lang = 'en', ctx = {}) {
  const fix = fixFor(i.id, lang);
  const fw = Object.keys(i.frameworks || {}).map((k) => `<span class="chip">${esc(FRAMEWORKS[k].short)}</span>`).join('');
  const wcag = (i.wcag || []).map((sc) => `<span class="chip sc">WCAG ${esc(sc)}</span>`).join('');
  const refs = (i.canadaRefs || []).map((r) => `<li>${esc(r)}</li>`).join('');
  const nodes = i.nodes.map((n) => `<li><code class="sel">${esc([].concat(n.target).join(' '))}</code>
      <pre>${esc(n.html)}</pre>${n.failureSummary ? `<p class="fix">${esc(n.failureSummary)}</p>` : ''}</li>`).join('');
  return `<details class="issue ${esc(i.impact)} ${esc(i.type)}">
    <summary><span class="badge ${esc(i.impact)}">${esc(t.impact[i.impact] || i.impact)}</span>
      <span class="badge type">${esc(t.type[i.type])}</span>
      <strong>${esc(i.help)}</strong> <span class="muted">(${i.nodes.length}) · ${esc(i.id)}</span></summary>
    <div class="body">
      <p>${esc(i.description)}</p>
      <p>${wcag}${fw}</p>
      ${refs ? `<p class="h">${t.refs}</p><ul>${refs}</ul>` : ''}
      ${i.helpUrl ? `<p><a href="${esc(i.helpUrl)}" target="_blank" rel="noopener">${t.learn}<span class="visually-hidden"> (${esc(i.id)})</span></a></p>` : ''}
      ${fix ? `<div class="howto"><p class="h">${t.howToFix}</p><ol>${fix.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>${fix.code ? `<p class="h">${t.example}</p><pre>${esc(fix.code)}</pre>` : ''}</div>` : ''}
      ${ctx.ai ? `<div class="ai" data-ref="${esc(ctx.ref)}"><p class="h">${t.askTitle}</p>
        <label for="q-${esc(ctx.ref)}">${t.askLabel}</label>
        <textarea id="q-${esc(ctx.ref)}" rows="2" maxlength="500" placeholder="${esc(t.askPlaceholder)}"></textarea>
        <p><button type="button" class="btn ai-ask">${t.askBtn}</button></p>
        <div class="ai-answer" aria-live="polite"></div><p class="note">${t.askNote}</p></div>` : ''}
      <p class="h">${t.elements}</p><ol class="nodes">${nodes}</ol>
    </div></details>`;
}

export function toHtml(report, lang = 'en', opts = {}) {
  const t = T[lang] || T.en;
  const s = report.summary;
  const fw = report.frameworks.map((f) => `<li class="fw ${f.status === 'fail' ? 'bad' : 'good'} ${report.frameworks.length === 1 ? 'primary' : ''}">
      <h3>${esc(f.short)}</h3><p class="muted">${esc(f.name)}</p><p class="muted">${esc(f.jurisdiction)}</p>
      <p><strong>${f.status === 'fail' ? `✗ ${t.fail}` : f.status === 'not-scanned' ? '-' : `✓ ${t.pass}`}</strong></p>
      ${f.failingCriteria.length ? `<p class="h">${t.failing}</p><ul>${f.failingCriteria.map((c) => `<li>${esc(c.sc)} ${esc(c.name)} (${esc(c.level)})${c.clause && f.id === 'aca' ? `, EN 301 549 ${esc(c.clause)}` : ''}</li>`).join('')}</ul>` : ''}
    </li>`).join('');
  const pages = report.pages.map((p, n) => `<section class="page" aria-labelledby="p${n} u${n}">
      <h3 id="p${n}">${esc(p.title || p.url)}</h3><p><a id="u${n}" href="${esc(p.url)}">${esc(p.url)}</a></p>
      ${p.error ? `<p class="err">${t.error}: ${esc(p.error)}</p>` : p.issues.length ? p.issues.map((i, k) => issueHtml(i, t, lang, { ai: opts.ai, ref: `p-${n}-${k}` })).join('') : `<p>${t.none}</p>`}
    </section>`).join('');

  return `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.title}: ${esc(report.pages[0]?.url || '')}</title>
<style>
:root{--bg:#fff;--fg:#1b1b1b;--muted:#555;--card:#f5f6f8;--line:#d6d8dc;--red:#a4001d;--accent:#26374a;--green:#1e6b2e;--crit:#7a0010;--ser:#b3261e;--mod:#8a5300;--min:#3d5a80}
@media (prefers-color-scheme:dark){:root{--bg:#121417;--fg:#eceef1;--muted:#a8adb5;--card:#1c1f24;--line:#33373e;--red:#ff8a8a;--accent:#9fc3ff;--green:#7fd38f;--crit:#ff8f9c;--ser:#ff9d8f;--mod:#ffc46b;--min:#9fc3ff}}
*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--fg)}
header{background:var(--accent);color:#fff;padding:24px 16px}@media (prefers-color-scheme:dark){header{color:#121417}}
header h1{margin:0 0 4px;font-size:1.6rem}main{max-width:1100px;margin:0 auto;padding:16px}
a{color:var(--accent)}.muted{color:var(--muted);font-size:.9rem}.h{font-weight:600;margin-bottom:4px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;list-style:none;padding:0}
.stats li,.fw{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px}
.stats b{display:block;font-size:1.8rem}.fws{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;list-style:none;padding:0}
.fw h3{margin:0}.fw.bad{border-left:6px solid var(--red)}.fw.good{border-left:6px solid var(--green)}.fw.primary{outline:2px solid var(--accent)}
.issue{border:1px solid var(--line);border-radius:8px;margin:8px 0;background:var(--card)}
.issue summary{cursor:pointer;padding:10px 12px}.issue .body{padding:0 12px 12px}
.badge{display:inline-block;font-size:.75rem;font-weight:700;border-radius:4px;padding:1px 6px;margin-right:4px;color:#fff;background:var(--min)}
.badge.critical{background:var(--crit)}.badge.serious{background:var(--ser)}.badge.moderate{background:var(--mod)}.badge.type{background:transparent;color:var(--fg);border:1px solid var(--line)}
@media (prefers-color-scheme:dark){.badge{color:#121417}}
.chip{display:inline-block;font-size:.8rem;border:1px solid var(--line);border-radius:12px;padding:0 8px;margin:2px 4px 2px 0}
pre{white-space:pre-wrap;word-break:break-all;background:var(--bg);border:1px solid var(--line);padding:6px;border-radius:4px;font-size:.8rem}
.sel{font-size:.8rem;word-break:break-all}.fix{font-size:.9rem;color:var(--muted);white-space:pre-line}
.page{border-top:2px solid var(--line);margin-top:24px}.err{color:var(--red)}
.disclaimer{background:var(--card);border-left:6px solid var(--mod);padding:12px;border-radius:4px}
.visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
:focus-visible{outline:3px solid var(--mod);outline-offset:2px}
.toolbar{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;margin:8px 0 16px;font-weight:600}.toolbar a{padding:8px 0}
.report-actions{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:16px;margin:16px 0}
.report-actions h2{margin:0 0 12px;font-size:1.2rem}.buttons{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 8px}
.btn{display:inline-block;min-height:44px;padding:10px 18px;font:inherit;font-weight:700;border-radius:6px;border:2px solid var(--accent);background:var(--accent);color:#fff;text-decoration:none;cursor:pointer}
.btn.secondary{background:transparent;color:var(--accent)}
@media (prefers-color-scheme:dark){.btn{color:#121417}.btn.secondary{color:var(--accent)}}
.note{color:var(--muted);font-size:.9rem;margin:0 0 16px}
.rescan fieldset{border:0;padding:0;margin:0}.rescan legend{font-weight:600;margin-bottom:6px;padding:0}.checks{display:flex;flex-wrap:wrap;gap:8px 20px}.check{display:flex;align-items:center;gap:8px;min-height:44px}.check input{width:22px;height:22px;accent-color:var(--accent)}
.rescan select{min-height:44px;padding:8px;font:inherit;color:var(--fg);background:var(--bg);border:2px solid var(--muted);border-radius:6px;max-width:100%}
@media print{.toolbar,.report-actions,.ai{display:none}header{background:none;color:#000}}
.howto{border-left:4px solid var(--green);padding:4px 0 4px 12px;margin:12px 0}
.ai{border:1px solid var(--line);border-radius:8px;padding:12px;margin:12px 0;background:var(--bg)}
.ai label{display:block;font-weight:600;margin-bottom:4px}
.ai textarea{width:100%;font:inherit;padding:8px;color:var(--fg);background:var(--card);border:2px solid var(--muted);border-radius:6px}
.ai-answer{margin-top:8px}.ai-answer:empty{display:none}.ai-answer .err{color:var(--red);font-weight:600}
.ai-answer ol,.ai-answer ul{padding-left:1.4em}
</style></head>
<body>
<header><h1>${t.title}</h1><p>${t.subtitle} · ${t.profile}: <strong>${esc(report.frameworks.map((f) => f.short).join(', '))}</strong> · ${t.generated} ${esc(report.finishedAt.slice(0, 16).replace('T', ' '))} UTC</p></header>
<main>
${opts.nav || ''}
<h2 class="visually-hidden">${lang === 'fr' ? 'Sommaire' : 'Summary'}</h2>
<ul class="stats">
<li><b>${s.score ?? '-'}</b>${t.score}</li><li><b>${s.pagesScanned}</b>${t.pages}</li>
<li><b>${s.violationRules}</b>${t.violations}</li><li><b>${s.violationInstances}</b>${t.instances}</li>
<li><b>${s.needsReview}</b>${t.review}</li>
${Object.entries(s.byImpact).map(([k, v]) => `<li><b>${v}</b>${t.impact[k]}</li>`).join('')}
</ul>
<p class="disclaimer">${t.disclaimer}</p>
<h2>${t.frameworks}</h2><ul class="fws">${fw}</ul>
${report.siteIssues.length ? `<h2>${t.site}</h2>${report.siteIssues.map((i, k) => issueHtml(i, t, lang, { ai: opts.ai, ref: `s-${k}` })).join('')}` : ''}
<h2>${t.page}s</h2>${pages}
</main>${opts.ai ? aiScript(lang, t, opts.aiEndpoint) : ''}</body></html>`;
}

function aiScript(lang, t, endpoint) {
  return `<script>
(function(){
  function esc(s){return s.replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  // Escape first, then turn a little markdown into HTML (code blocks, bold, lists, paragraphs).
  function fmt(md){
    var parts=md.split(/\\n?\`\`\`[a-zA-Z]*\\n?/), out='';
    for(var k=0;k<parts.length;k++){
      if(k%2){ out+='<pre><code>'+esc(parts[k].replace(/\\n$/,''))+'</code></pre>'; continue; }
      var blocks=parts[k].trim().split(/\\n\\s*\\n/);
      blocks.forEach(function(b){
        if(!b.trim())return;
        var lines=b.split('\\n'), inline=function(x){return esc(x).replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>').replace(/\`([^\`]+)\`/g,'<code>$1</code>');};
        if(lines.every(function(l){return /^\\s*\\d+[.)]\\s/.test(l)||/^\\s{2,}/.test(l);})) out+='<ol>'+lines.filter(function(l){return /^\\s*\\d+[.)]\\s/.test(l);}).map(function(l){return '<li>'+inline(l.replace(/^\\s*\\d+[.)]\\s/,''))+'</li>';}).join('')+'</ol>';
        else if(lines.every(function(l){return /^\\s*[-*]\\s/.test(l);})) out+='<ul>'+lines.map(function(l){return '<li>'+inline(l.replace(/^\\s*[-*]\\s/,''))+'</li>';}).join('')+'</ul>';
        else out+='<p>'+lines.map(function(l){return inline(l.replace(/^#+\\s*/,''));}).join('<br>')+'</p>';
      });
    }
    return out;
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('.ai-ask'); if(!b||b.getAttribute('aria-disabled')==='true')return;
    var box=b.closest('.ai'), out=box.querySelector('.ai-answer'), q=box.querySelector('textarea').value;
    b.setAttribute('aria-disabled','true'); var label=b.textContent; b.textContent=${JSON.stringify(t.asking)};
    out.innerHTML='<p>'+esc(${JSON.stringify(t.asking)})+'</p>';
    fetch(${JSON.stringify(endpoint)},{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ref:box.getAttribute('data-ref'),question:q,lang:${JSON.stringify(lang)}})})
      .then(function(r){return r.json();})
      .then(function(j){ out.innerHTML = j.answer ? fmt(j.answer) : '<p class="err">'+esc(j.error||'Error')+'</p>'; })
      .catch(function(){ out.innerHTML='<p class="err">'+esc(${JSON.stringify(lang === 'fr' ? "L'IA n'a pas pu répondre. Réessayez plus tard." : 'The AI could not answer. Try again later.')})+'</p>'; })
      .finally(function(){ b.removeAttribute('aria-disabled'); b.textContent=label; });
  });
})();
</script>`;
}

export function toMarkdown(report) {
  const s = report.summary;
  const icon = { critical: '🔴', serious: '🟠', moderate: '🟡', minor: '🔵' };
  let md = `## Accessibility scan: ${report.frameworks.map((f) => f.short).join(', ')}\n\n`;
  md += `| Score | Pages | Violations | Failing elements | Needs review | Critical | Serious | Moderate | Minor |\n|---|---|---|---|---|---|---|---|---|\n`;
  md += `| **${s.score ?? '-'}** | ${s.pagesScanned} | ${s.violationRules} | ${s.violationInstances} | ${s.needsReview} | ${s.byImpact.critical} | ${s.byImpact.serious} | ${s.byImpact.moderate} | ${s.byImpact.minor} |\n\n`;
  md += `### Canadian frameworks\n\n| Framework | Standard | Result | Failing criteria |\n|---|---|---|---|\n`;
  for (const f of report.frameworks) {
    md += `| ${f.short} | ${f.wcag} | ${f.status === 'fail' ? '❌ fail' : f.status === 'not-scanned' ? 'not scanned' : '✅ no automated failures'} | ${f.failingCriteria.map((c) => c.sc).join(', ') || '-'} |\n`;
  }
  const rows = [];
  for (const p of report.pages) {
    for (const i of p.issues.filter((x) => x.type === 'violation')) {
      rows.push(`| ${icon[i.impact] || ''} ${i.impact} | \`${i.id}\` | ${i.help.replace(/\|/g, '\\|')} | ${i.wcag.join(', ') || '-'} | ${i.nodes.length} | ${p.url} |`);
    }
  }
  if (rows.length) md += `\n### Violations\n\n| Impact | Rule | Issue | WCAG | Count | Page |\n|---|---|---|---|---|---|\n${rows.slice(0, 100).join('\n')}\n`;
  if (rows.length > 100) md += `\n_…and ${rows.length - 100} more. See the HTML report artifact._\n`;
  const review = [...report.siteIssues, ...report.pages.flatMap((p) => p.issues.filter((i) => i.source === 'canada' && i.type === 'review'))];
  const uniq = [...new Map(review.map((i) => [i.id, i])).values()];
  if (uniq.length) md += `\n### Canada-specific items to review\n\n${uniq.map((i) => `- **${i.help}**: ${i.description}`).join('\n')}\n`;
  md += `\n> Automated testing finds only part of accessibility barriers; manual testing is still required. Not legal advice.\n`;
  return md;
}
