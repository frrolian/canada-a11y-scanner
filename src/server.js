import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { scan } from './scanner.js';
import { toHtml } from './report.js';
import { aiEnabled, askAi, checkLimits, aiErrorMessage } from './ai.js';

const MAX_PAGES = Number(process.env.MAX_PAGES_LIMIT || 20);
const MAX_QUEUE = 10;
const JOB_TTL_MS = 2 * 60 * 60 * 1000;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- text (English / French) ----------
const T = {
  en: {
    name: 'Canada Accessibility Scanner',
    intro: 'Check a website for accessibility barriers. Results are matched to the Accessible Canada Act, Ontario\'s AODA, Québec\'s accessibility standard and WCAG.',
    other: 'Français', otherLang: 'fr',
    url: 'Website address', urlHint: 'Example: canada.ca or https://www.example.com',
    platformQ: 'What was the website built with?', platformHint: 'We detect this automatically. Change it only if the detection is wrong.',
    platforms: { auto: 'Detect automatically', squarespace: 'Squarespace', wix: 'Wix', wordpress: 'WordPress', shopify: 'Shopify', webflow: 'Webflow', ai: 'An AI builder (Lovable, Bolt, v0…)', custom: 'Custom code', unknown: 'Other / not sure' },
    profile: 'Which standards should we check?', profileHint: 'Choose one or more. All are checked in a single scan.',
    profiles: {
      aca: ['Accessible Canada Act', 'Federal rules. Uses WCAG 2.1 AA (EN 301 549). Recommended for most sites.'],
      aoda: ['Ontario (AODA)', 'Ontario rules. Uses WCAG 2.0 AA.'],
      quebec: ['Québec (SGQRI 008)', 'Québec public bodies. Uses WCAG 2.0 AA.'],
      wcag22: ['WCAG 2.2 AA', 'The newest international standard. The strictest option.'],
    },
    pages: 'How many pages to check', pagesHint: `From 1 to ${MAX_PAGES}. More pages take longer. Each page takes about 5 to 15 seconds.`,
    reportLang: 'Report language',
    start: 'Start scan', starting: 'Starting…',
    errSummary: 'There is a problem',
    errUrl: 'Enter a website address, like canada.ca',
    errUrlBad: 'Enter a valid website address, like canada.ca',
    errPages: `Enter a number from 1 to ${MAX_PAGES}`,
    errStandards: 'Choose at least one standard',
    aiLimit: 'The AI helper has reached its limit. Try again later, or use the How to fix steps.', aiOff: 'The AI helper is not turned on for this site.',
    errBusy: 'The scanner is busy right now. Try again in a few minutes.',
    errNotFound: 'This scan was not found. Scans are kept for 2 hours.',
    footer: 'Automated checks find only part of accessibility barriers. Always test with a keyboard, a screen reader and real users. This tool does not give legal advice.',
    // progress
    progressTitle: 'Scan in progress',
    queued: (n) => (n === 1 ? 'Waiting: 1 scan is ahead of you.' : `Waiting: ${n} scans are ahead of you.`),
    startingBrowser: 'Starting the browser…',
    scanning: (c, m) => `Checking page ${c} of up to ${m}`,
    building: 'Building your report…',
    done: 'Scan complete. Opening your report…',
    failed: 'The scan could not be completed.',
    elapsed: 'Time elapsed', seconds: 's',
    keepOpen: 'Keep this page open. Your report will open by itself when the scan is done.',
    noscript: 'Refresh this page to see the latest progress.',
    viewReport: 'View your report', tryAgain: 'Start a new scan',
    newScan: '← Scan another website', download: 'Download report',
    home: '← Home: scan another website', reportActions: 'Report navigation', saveShare: 'Save or share this report',
    print: 'Print or save as PDF', email: 'Email this report',
    emailSubject: 'Accessibility report', emailBody: 'Here is the accessibility report:', emailNote: 'Links to reports work for 2 hours. To keep a report, download it or save it as a PDF.',
    rescanLabel: 'Check the same website against other standards', rescan: 'Scan again',
    scanOf: 'Scanning',
  },
  fr: {
    name: "Analyseur d'accessibilité canadien",
    intro: "Vérifiez si un site Web présente des obstacles à l'accessibilité. Les résultats sont associés à la Loi canadienne sur l'accessibilité, à la LAPHO de l'Ontario, au standard du Québec et aux WCAG.",
    other: 'English', otherLang: 'en',
    url: 'Adresse du site Web', urlHint: 'Exemple : canada.ca ou https://www.exemple.com',
    platformQ: 'Avec quoi le site a-t-il été créé?', platformHint: 'Nous le détectons automatiquement. Changez-le seulement si la détection est erronée.',
    platforms: { auto: 'Détecter automatiquement', squarespace: 'Squarespace', wix: 'Wix', wordpress: 'WordPress', shopify: 'Shopify', webflow: 'Webflow', ai: 'Un outil IA (Lovable, Bolt, v0…)', custom: 'Code sur mesure', unknown: 'Autre / je ne sais pas' },
    profile: 'Quelles normes voulez-vous vérifier?', profileHint: 'Choisissez-en une ou plusieurs. Toutes sont vérifiées en une seule analyse.',
    profiles: {
      aca: ["Loi canadienne sur l'accessibilité", 'Règles fédérales. Utilise les WCAG 2.1 AA (EN 301 549). Recommandé pour la plupart des sites.'],
      aoda: ['Ontario (LAPHO)', "Règles de l'Ontario. Utilise les WCAG 2.0 AA."],
      quebec: ['Québec (SGQRI 008)', 'Organismes publics du Québec. Utilise les WCAG 2.0 AA.'],
      wcag22: ['WCAG 2.2 AA', 'La norme internationale la plus récente. L\'option la plus stricte.'],
    },
    pages: 'Nombre de pages à vérifier', pagesHint: `De 1 à ${MAX_PAGES}. Plus il y a de pages, plus c'est long. Chaque page prend environ 5 à 15 secondes.`,
    reportLang: 'Langue du rapport',
    start: "Lancer l'analyse", starting: 'Démarrage…',
    errSummary: 'Il y a un problème',
    errUrl: 'Entrez une adresse Web, par exemple canada.ca',
    errUrlBad: 'Entrez une adresse Web valide, par exemple canada.ca',
    errPages: `Entrez un nombre de 1 à ${MAX_PAGES}`,
    errStandards: 'Choisissez au moins une norme',
    aiLimit: "L'assistant IA a atteint sa limite. Réessayez plus tard ou suivez les étapes « Comment corriger ».", aiOff: "L'assistant IA n'est pas activé sur ce site.",
    errBusy: "L'analyseur est occupé. Réessayez dans quelques minutes.",
    errNotFound: 'Cette analyse est introuvable. Les analyses sont conservées 2 heures.',
    footer: "Les vérifications automatisées ne détectent qu'une partie des obstacles. Testez toujours avec un clavier, un lecteur d'écran et de vrais utilisateurs. Cet outil ne donne pas d'avis juridique.",
    progressTitle: 'Analyse en cours',
    queued: (n) => (n === 1 ? 'En attente : 1 analyse avant la vôtre.' : `En attente : ${n} analyses avant la vôtre.`),
    startingBrowser: 'Démarrage du navigateur…',
    scanning: (c, m) => `Vérification de la page ${c} sur ${m} maximum`,
    building: 'Création du rapport…',
    done: 'Analyse terminée. Ouverture du rapport…',
    failed: "L'analyse n'a pas pu être terminée.",
    elapsed: 'Temps écoulé', seconds: 's',
    keepOpen: "Gardez cette page ouverte. Le rapport s'ouvrira automatiquement à la fin de l'analyse.",
    noscript: 'Actualisez cette page pour voir la progression.',
    viewReport: 'Voir le rapport', tryAgain: 'Lancer une nouvelle analyse',
    newScan: '← Analyser un autre site', download: 'Télécharger le rapport',
    home: '← Accueil : analyser un autre site', reportActions: 'Navigation du rapport', saveShare: 'Enregistrer ou partager ce rapport',
    print: 'Imprimer ou enregistrer en PDF', email: 'Envoyer par courriel',
    emailSubject: "Rapport d'accessibilité", emailBody: "Voici le rapport d'accessibilité :", emailNote: 'Les liens vers les rapports fonctionnent pendant 2 heures. Pour garder un rapport, téléchargez-le ou enregistrez-le en PDF.',
    rescanLabel: 'Vérifier le même site selon d\'autres normes', rescan: 'Analyser de nouveau',
    scanOf: 'Analyse de',
  },
};

// ---------- shared page shell ----------
const CSS = `
:root{--bg:#ffffff;--fg:#1b1b1b;--muted:#474c55;--line:#6b7079;--field:#ffffff;--card:#f3f5f8;--accent:#1d3a5f;--on-accent:#ffffff;--error:#b00020;--ok:#1e6b2e;--focus:#0b57d0;--bar:#1d3a5f;--track:#d9dde3}
@media (prefers-color-scheme:dark){:root{--bg:#121417;--fg:#eceef1;--muted:#c0c5cd;--line:#8a919b;--field:#1c1f24;--card:#1c1f24;--accent:#a8c8ff;--on-accent:#0b1a2e;--error:#ff9a90;--ok:#86d993;--focus:#ffd166;--bar:#a8c8ff;--track:#3a3f47}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:18px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.skip{position:absolute;left:-9999px}.skip:focus{left:16px;top:8px;background:var(--bg);padding:8px;z-index:9}
header.top{display:flex;justify-content:space-between;align-items:center;gap:16px;max-width:720px;margin:0 auto;padding:16px}
header.top .brand{font-weight:700;color:var(--fg);text-decoration:none}
main{max-width:720px;margin:0 auto;padding:0 16px 48px}
h1{font-size:2rem;line-height:1.2;margin:8px 0 12px}
a{color:var(--accent);text-underline-offset:3px}
p{margin:0 0 16px}
.field{margin:28px 0}
label,legend{display:block;font-weight:700;font-size:1.1rem;margin-bottom:4px;padding:0}
.hint{color:var(--muted);margin:0 0 8px;font-size:1rem}
input[type=text],input[type=number]{width:100%;min-height:48px;padding:10px 12px;font:inherit;color:var(--fg);background:var(--field);border:2px solid var(--line);border-radius:6px}
input[type=number]{max-width:8em}
select{width:100%;max-width:28em;min-height:48px;padding:10px 12px;font:inherit;color:var(--fg);background:var(--field);border:2px solid var(--line);border-radius:6px}
fieldset{border:0;margin:0;padding:0}
.choice{display:flex;gap:12px;align-items:flex-start;padding:12px;border:2px solid var(--line);border-radius:8px;margin-bottom:8px;cursor:pointer;background:var(--field)}
.choice:has(input:checked){border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.choice input{width:24px;height:24px;border-radius:4px;margin:2px 0 0;flex:none;accent-color:var(--accent)}
.choice span{display:block}.choice .d{color:var(--muted);font-size:1rem;font-weight:400}
.row{display:flex;gap:8px;flex-wrap:wrap}.row .choice{flex:1 1 160px}
button,.btn{display:inline-block;min-height:48px;padding:12px 24px;font:inherit;font-weight:700;color:var(--on-accent);background:var(--accent);border:2px solid var(--accent);border-radius:6px;cursor:pointer;text-decoration:none}
button[aria-disabled=true]{opacity:.75;cursor:progress}
.btn.secondary{background:transparent;color:var(--accent)}
:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.error-summary{border:3px solid var(--error);border-radius:8px;padding:16px;margin:16px 0}
.error-summary h2{margin:0 0 8px;font-size:1.25rem}
.error-msg{color:var(--error);font-weight:700;margin:0 0 6px}
input[aria-invalid=true]{border-color:var(--error);border-width:3px}
footer{max-width:720px;margin:0 auto;padding:16px;color:var(--muted);font-size:.95rem;border-top:1px solid var(--line)}
.panel{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:20px;margin:16px 0}
.status{font-size:1.25rem;font-weight:700;margin-bottom:12px}
.url{word-break:break-all;color:var(--muted);font-size:1rem}
.bar{height:16px;background:var(--track);border-radius:8px;overflow:hidden;margin:8px 0 12px}
.bar>div{height:100%;width:0;background:var(--bar);border-radius:8px;transition:width .4s ease}
.bar.indeterminate>div{width:30%;animation:slide 1.4s ease-in-out infinite}
@keyframes slide{0%{margin-left:-30%}100%{margin-left:100%}}
@media (prefers-reduced-motion:reduce){.bar>div{transition:none}.bar.indeterminate>div{animation:none;width:100%;opacity:.5}}
.spinner{display:inline-block;width:1em;height:1em;border:3px solid var(--track);border-top-color:var(--bar);border-radius:50%;animation:spin 1s linear infinite;vertical-align:-2px;margin-right:8px}
@keyframes spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.spinner{animation:none}}
.err{color:var(--error)}
.visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;

function shell(lang, title, body, { switchHref } = {}) {
  const t = T[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>${CSS}</style></head>
<body><a class="skip" href="#main">${lang === 'fr' ? 'Passer au contenu principal' : 'Skip to main content'}</a>
<header class="top"><a class="brand" href="/?lang=${lang}">${esc(t.name)}</a>
${switchHref !== null ? `<a href="${esc(switchHref || `/?lang=${t.otherLang}`)}" lang="${t.otherLang}" hreflang="${t.otherLang}">${t.other}</a>` : ''}</header>
<main id="main">${body}</main>
<footer><p>${esc(t.footer)}</p></footer></body></html>`;
}

function formPage(lang, values = {}, errors = {}) {
  const t = T[lang];
  const v = { url: '', standards: Object.keys(T.en.profiles), pages: '3', reportLang: lang, platform: 'auto', ...values };
  const platformOpts = Object.entries(t.platforms).map(([id, name]) => `<option value="${id}" ${v.platform === id ? 'selected' : ''}>${esc(name)}</option>`).join('');
  const errList = Object.entries(errors);
  const summary = errList.length ? `<div class="error-summary" role="alert" tabindex="-1" id="error-summary" aria-labelledby="error-title">
    <h2 id="error-title">${t.errSummary}</h2><ul>${errList.map(([k, m]) => `<li><a href="#${k === 'busy' ? 'url' : k}">${esc(m)}</a></li>`).join('')}</ul></div>` : '';
  const fieldErr = (k) => (errors[k] ? `<p class="error-msg" id="${k}-error"><span class="visually-hidden">${lang === 'fr' ? 'Erreur :' : 'Error:'} </span>${esc(errors[k])}</p>` : '');
  const desc = (k) => [`${k}-hint`, errors[k] ? `${k}-error` : ''].filter(Boolean).join(' ');

  const profiles = Object.entries(t.profiles).map(([id, [name, d]]) => `<label class="choice"><input type="checkbox" name="standards" value="${id}" ${v.standards.includes(id) ? 'checked' : ''} ${errors.standards ? 'aria-describedby="standards-error"' : ''}>
    <span>${esc(name)}<span class="d">${esc(d)}</span></span></label>`).join('');

  const body = `<h1>${esc(t.name)}</h1><p>${esc(t.intro)}</p>${summary}
<form action="/scan" method="post" novalidate id="scan-form">
<input type="hidden" name="lang" value="${lang}">
<div class="field"><label for="url">${t.url}</label><p class="hint" id="url-hint">${esc(t.urlHint)}</p>${fieldErr('url')}
<input type="text" id="url" name="url" inputmode="url" autocomplete="url" spellcheck="false" autocapitalize="none" value="${esc(v.url)}" aria-describedby="${desc('url')}" ${errors.url ? 'aria-invalid="true"' : ''}></div>
<div class="field"><label for="platform">${t.platformQ}</label><p class="hint" id="platform-hint">${esc(t.platformHint)}</p>
<select id="platform" name="platform" aria-describedby="platform-hint">${platformOpts}</select></div>
<div class="field"><fieldset id="standards"><legend>${t.profile}</legend><p class="hint">${esc(t.profileHint)}</p>${fieldErr('standards')}${profiles}</fieldset></div>
<div class="field"><label for="pages">${t.pages}</label><p class="hint" id="pages-hint">${esc(t.pagesHint)}</p>${fieldErr('pages')}
<input type="number" id="pages" name="pages" min="1" max="${MAX_PAGES}" value="${esc(v.pages)}" aria-describedby="${desc('pages')}" ${errors.pages ? 'aria-invalid="true"' : ''}></div>
<div class="field"><fieldset><legend>${t.reportLang}</legend><div class="row">
<label class="choice"><input type="radio" name="reportLang" value="en" ${v.reportLang !== 'fr' ? 'checked' : ''}><span lang="en">English</span></label>
<label class="choice"><input type="radio" name="reportLang" value="fr" ${v.reportLang === 'fr' ? 'checked' : ''}><span lang="fr">Français</span></label>
</div></fieldset></div>
<button type="submit" id="go">${t.start}</button>
</form>
<script>
(function(){
  var s=document.getElementById('error-summary'); if(s) s.focus();
  var f=document.getElementById('scan-form'), b=document.getElementById('go'), sent=false;
  f.addEventListener('submit',function(e){ if(sent){e.preventDefault();return;} sent=true; b.setAttribute('aria-disabled','true'); b.textContent=${JSON.stringify(t.starting)}; });
  window.addEventListener('pageshow',function(){ sent=false; b.removeAttribute('aria-disabled'); b.textContent=${JSON.stringify(t.start)}; });
})();
</script>`;
  return shell(lang, errList.length ? `${t.errSummary}: ${t.name}` : t.name, body);
}

function progressPage(lang, job) {
  const t = T[lang];
  const st = statusText(job, lang);
  const pct = job.state === 'running' && job.max ? Math.round(((job.current - 0.5) / job.max) * 100) : 0;
  const body = `<h1>${t.progressTitle}</h1>
<p class="url">${t.scanOf} <strong>${esc(job.url)}</strong></p>
<div class="panel">
  <p class="status" id="status" role="status"><span class="spinner" aria-hidden="true" id="spin"></span><span id="status-text">${esc(st)}</span></p>
  <div class="bar ${job.state === 'running' && job.current ? '' : 'indeterminate'}" id="bar" role="progressbar" aria-labelledby="status-text" aria-valuemin="0" aria-valuemax="100" ${job.state === 'running' && job.current ? `aria-valuenow="${pct}"` : ''}><div style="width:${pct}%"></div></div>
  <p class="url" id="current">${job.currentUrl ? esc(job.currentUrl) : ''}</p>
  <p>${t.elapsed}: <span id="elapsed">0</span>${t.seconds}</p>
</div>
<p>${esc(t.keepOpen)}</p>
<noscript><p><a href="">${t.noscript}</a></p></noscript>
<p><a href="/?lang=${lang}">${t.home}</a></p>
<div id="actions"></div>
<script>
(function(){
  var id=${JSON.stringify(job.id)}, lang=${JSON.stringify(lang)}, started=${job.created};
  var T=${JSON.stringify({ building: t.building, done: t.done, failed: t.failed, startingBrowser: t.startingBrowser, viewReport: t.viewReport, tryAgain: t.tryAgain })};
  var statusText=document.getElementById('status-text'), bar=document.getElementById('bar'), cur=document.getElementById('current'), el=document.getElementById('elapsed'), spin=document.getElementById('spin');
  function q(n){return lang==='fr'?(n===1?'En attente : 1 analyse avant la vôtre.':'En attente : '+n+' analyses avant la vôtre.'):(n===1?'Waiting: 1 scan is ahead of you.':'Waiting: '+n+' scans are ahead of you.');}
  function s(c,m){return lang==='fr'?'Vérification de la page '+c+' sur '+m+' maximum':'Checking page '+c+' of up to '+m;}
  function setText(x){ if(statusText.textContent!==x) statusText.textContent=x; }
  setInterval(function(){ el.textContent=Math.round((Date.now()-started)/1000); },1000);
  function poll(){
    fetch('/api/job/'+id).then(function(r){return r.json();}).then(function(j){
      if(j.state==='queued'){ setText(q(j.position)); bar.className='bar indeterminate'; bar.removeAttribute('aria-valuenow'); }
      else if(j.state==='running'){
        if(!j.current){ setText(T.startingBrowser); }
        else if(j.building){ setText(T.building); bar.className='bar'; bar.firstChild.style.width='100%'; bar.setAttribute('aria-valuenow',100); }
        else { setText(s(j.current,j.max)); var p=Math.round((j.current-0.5)/j.max*100); bar.className='bar'; bar.firstChild.style.width=p+'%'; bar.setAttribute('aria-valuenow',p); cur.textContent=j.currentUrl||''; }
      }
      else if(j.state==='done'){ setText(T.done); bar.className='bar'; bar.firstChild.style.width='100%'; bar.setAttribute('aria-valuenow',100); spin.remove(); location.href='/report/'+id; return; }
      else { spin.remove(); setText(T.failed+(j.error?' '+j.error:'')); statusText.parentNode.classList.add('err'); bar.remove();
        document.getElementById('actions').innerHTML='<a class="btn" href="/?lang='+lang+'">'+T.tryAgain+'</a>'; return; }
      setTimeout(poll,1500);
    }).catch(function(){ setTimeout(poll,3000); });
  }
  poll();
})();
</script>`;
  return shell(lang, `${t.progressTitle}: ${t.name}`, body, { switchHref: null });
}

function statusText(job, lang) {
  const t = T[lang];
  if (job.state === 'queued') return t.queued(job.position);
  if (job.state === 'running') return !job.current ? t.startingBrowser : job.building ? t.building : t.scanning(job.current, job.max);
  if (job.state === 'done') return t.done;
  return `${t.failed} ${job.error || ''}`;
}

function reportNav(job, rl, origin) {
  const t = T[rl];
  const other = rl === 'fr' ? 'en' : 'fr';
  const link = `${origin}/report/${job.id}?lang=${rl}`;
  const subject = encodeURIComponent(`${t.emailSubject}: ${job.url}`);
  const bodyTxt = encodeURIComponent(`${t.emailBody}\n\n${link}\n\n${t.emailNote}`);
  const opts = Object.entries(t.profiles).map(([id, [name]]) => `<label class="check"><input type="checkbox" name="standards" value="${id}" ${job.standards.includes(id) ? 'checked' : ''}> ${esc(name)}</label>`).join('');
  return `<nav class="toolbar" aria-label="${t.reportActions}">
  <a href="/?lang=${rl}">${t.home}</a>
  <a href="/report/${job.id}?lang=${other}" lang="${other}" hreflang="${other}">${T[other].other === 'English' ? 'Français' : 'English'}</a>
</nav>
<div class="report-actions">
  <h2>${t.saveShare}</h2>
  <p class="buttons">
    <a class="btn" href="/report/${job.id}/download?lang=${rl}">${t.download}</a>
    <button type="button" class="btn secondary" onclick="document.querySelectorAll('details').forEach(function(d){d.open=true});window.print()">${t.print}</button>
    <a class="btn secondary" href="mailto:?subject=${subject}&amp;body=${bodyTxt}">${t.email}</a>
  </p>
  <p class="note">${t.emailNote}</p>
  <form action="/scan" method="post" class="rescan">
    <input type="hidden" name="url" value="${esc(job.url)}"><input type="hidden" name="pages" value="${job.maxPages}">
    <input type="hidden" name="lang" value="${rl}"><input type="hidden" name="reportLang" value="${rl}"><input type="hidden" name="platform" value="${esc(job.platform || 'auto')}">
    <fieldset><legend>${t.rescanLabel}</legend><span class="checks">${opts}</span></fieldset>
    <p><button type="submit" class="btn">${t.rescan}</button></p>
  </form>
</div>`;
}

function friendlyError(raw, lang) {
  const fr = lang === 'fr';
  const why =
    /Timeout/i.test(raw) ? (fr ? "Le site a mis trop de temps à répondre. Il est peut-être lent, en panne ou bloque les outils automatisés. Réessayez, ou essayez une autre page du site." : 'The website took too long to respond. It may be slow, down, or blocking automated tools. Try again, or try a different page on the site.')
    : /ERR_NAME_NOT_RESOLVED/i.test(raw) ? (fr ? "Cette adresse n'existe pas. Vérifiez l'orthographe." : 'This address does not exist. Check the spelling.')
    : /ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ERR_CONNECTION_CLOSED/i.test(raw) ? (fr ? "Le site a refusé la connexion. Il est peut-être en panne." : 'The website refused the connection. It may be down.')
    : /ERR_CERT|SSL/i.test(raw) ? (fr ? "Le certificat de sécurité du site n'est pas valide." : "The website's security certificate is not valid.")
    : /HTTP 40[13]/.test(raw) ? (fr ? "Le site exige une connexion ou bloque les outils automatisés." : 'The website needs a login or is blocking automated tools.')
    : /HTTP 404/.test(raw) ? (fr ? "Cette page est introuvable (erreur 404)." : 'This page was not found (error 404).')
    : /HTTP 5\d\d/.test(raw) ? (fr ? "Le site a une erreur de serveur. Réessayez plus tard." : 'The website has a server error. Try again later.')
    : '';
  const lead = fr ? "Impossible d'ouvrir le site." : 'Could not open the website.';
  return why ? `${lead} ${why}` : `${lead} ${raw}`;
}

// ---------- job queue (one scan at a time) ----------
const jobs = new Map();
const pending = [];
let running = false;

function positionOf(job) { return pending.indexOf(job) + (running ? 1 : 0); }

async function worker(executablePath) {
  if (running) return;
  const job = pending.shift();
  if (!job) return;
  running = true;
  job.state = 'running';
  try {
    job.report = await scan({
      urls: [job.url], standards: job.standards, platform: job.platform, maxPages: job.maxPages, executablePath,
      onProgress: (m) => console.log(`[${job.id.slice(0, 8)}] ${m}`),
      onPage: ({ current, url }) => { job.current = current; job.max = job.maxPages; job.currentUrl = url; },
    });
    job.building = true;
    if (job.report.summary.pagesWithErrors === job.report.summary.pagesScanned) {
      const first = job.report.pages[0]?.error || '';
      throw new Error(friendlyError(first, job.lang));
    }
    job.state = 'done';
  } catch (e) {
    job.state = 'failed';
    job.error = e.message.split('\n')[0].slice(0, 300);
  } finally {
    job.finished = Date.now();
    running = false;
    setImmediate(() => worker(executablePath));
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [id, j] of jobs) if (j.finished && now - j.finished > JOB_TTL_MS) jobs.delete(id);
}, 10 * 60 * 1000).unref();

function normalizeUrl(raw) {
  let s = String(raw || '').trim();
  if (!s) return { error: 'errUrl' };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.') && u.hostname !== 'localhost') return { error: 'errUrlBad' };
    return { url: u.href };
  } catch { return { error: 'errUrlBad' }; }
}

function readBody(req, raw = false) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e5) req.destroy(); });
    req.on('end', () => resolve(raw ? data : new URLSearchParams(data)));
  });
}

export function startServer({ port = 3000, host = '127.0.0.1', executablePath } = {}) {
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://localhost');
    const lang = u.searchParams.get('lang') === 'fr' ? 'fr' : 'en';
    const send = (code, body, type = 'text/html; charset=utf-8', extra = {}) => {
      res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store', ...extra }); res.end(body);
    };

    if (req.method === 'GET' && u.pathname === '/') return send(200, formPage(lang));
    if (u.pathname === '/health') return send(200, 'ok', 'text/plain');

    if (req.method === 'POST' && u.pathname === '/scan') {
      const p = await readBody(req);
      const l = p.get('lang') === 'fr' ? 'fr' : 'en';
      const t = T[l];
      const values = { url: p.get('url') || '', standards: [...new Set([...p.getAll('standards'), ...p.getAll('profile')])].filter((x) => T.en.profiles[x]), platform: T.en.platforms[p.get('platform')] ? p.get('platform') : 'auto', pages: p.get('pages') || '', reportLang: p.get('reportLang') === 'fr' ? 'fr' : 'en' };
      const errors = {};
      const nu = normalizeUrl(values.url);
      if (nu.error) errors.url = t[nu.error];
      const n = Number(values.pages);
      if (!Number.isInteger(n) || n < 1 || n > MAX_PAGES) errors.pages = t.errPages;
      if (!values.standards.length) errors.standards = t.errStandards;
      if (!Object.keys(errors).length && pending.length >= MAX_QUEUE) errors.busy = t.errBusy;
      if (Object.keys(errors).length) return send(errors.busy ? 503 : 400, formPage(l, values, errors));

      const job = { id: randomUUID(), url: nu.url, standards: values.standards, platform: values.platform, maxPages: n, lang: l, reportLang: values.reportLang, state: 'queued', created: Date.now() };
      jobs.set(job.id, job);
      pending.push(job);
      worker(executablePath);
      return send(303, '', 'text/plain', { location: `/job/${job.id}?lang=${l}` });
    }

    const ask = /^\/api\/ask\/([0-9a-f-]{36})$/.exec(u.pathname);
    if (req.method === 'POST' && ask) {
      const json = (code, obj) => send(code, JSON.stringify(obj), 'application/json');
      let body = {};
      try { body = JSON.parse((await readBody(req, true)) || '{}'); } catch { return json(400, { error: 'Bad request' }); }
      const al = body.lang === 'fr' ? 'fr' : 'en';
      if (!aiEnabled()) return json(503, { error: T[al].aiOff });
      const job = jobs.get(ask[1]);
      if (!job || job.state !== 'done') return json(404, { error: T[al].errNotFound });
      const ref = /^(?:p-(\d+)-(\d+)|s-(\d+))$/.exec(String(body.ref || ''));
      const page = ref && ref[1] !== undefined ? job.report.pages[Number(ref[1])] : null;
      const issue = !ref ? null : ref[3] !== undefined ? job.report.siteIssues[Number(ref[3])] : page?.issues[Number(ref[2])];
      if (!issue) return json(400, { error: 'Unknown problem' });
      const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      if (checkLimits(ip)) return json(429, { error: T[al].aiLimit });
      try {
        const answer = await askAi({ issue, pageUrl: page?.url || job.url, question: String(body.question || ''), lang: al, platform: job.report.platform });
        return json(200, { answer });
      } catch (e) {
        console.error('AI error:', e.message);
        return json(502, { error: aiErrorMessage(e, al) });
      }
    }

    const m = /^\/(job|report|api\/job)\/([0-9a-f-]{36})(\/download)?$/.exec(u.pathname);
    if (m) {
      const job = jobs.get(m[2]);
      if (!job) return send(404, shell(lang, T[lang].errNotFound, `<h1>${T[lang].errNotFound}</h1><p><a class="btn" href="/?lang=${lang}">${T[lang].tryAgain}</a></p>`));
      if (job.state === 'queued') job.position = positionOf(job);

      if (m[1] === 'api/job') {
        return send(200, JSON.stringify({ state: job.state, position: job.position, current: job.current || 0, max: job.max || job.maxPages, currentUrl: job.currentUrl, building: !!job.building, error: job.error }), 'application/json');
      }
      if (m[1] === 'job') {
        if (job.state === 'done') return send(303, '', 'text/plain', { location: `/report/${job.id}` });
        return send(200, progressPage(job.lang, job));
      }
      if (job.state !== 'done') return send(303, '', 'text/plain', { location: `/job/${job.id}?lang=${job.lang}` });
      const rl = ['en', 'fr'].includes(u.searchParams.get('lang')) ? u.searchParams.get('lang') : job.reportLang;
      if (m[3]) {
        const host = new URL(job.url).hostname.replace(/[^a-z0-9.-]/gi, '');
        return send(200, toHtml(job.report, rl), 'text/html; charset=utf-8', { 'content-disposition': `attachment; filename="accessibility-report-${host}.html"` });
      }
      return send(200, toHtml(job.report, rl, { ai: aiEnabled(), aiEndpoint: `/api/ask/${job.id}`, nav: reportNav(job, rl, `${u.protocol === 'https:' ? 'https' : req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`) }));
    }

    send(404, shell(lang, 'Not found', `<h1>${lang === 'fr' ? 'Page introuvable' : 'Page not found'}</h1><p><a href="/?lang=${lang}">${T[lang].name}</a></p>`));
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}
