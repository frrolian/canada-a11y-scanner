import { FRAMEWORKS } from './standards.js';
import { guidanceFor, WHERE, IMPACT_PLAIN } from './fixes.js';
import { PLATFORMS, platformName } from './platform.js';

const T = {
  en: {
    title: 'Accessibility Report', subtitle: 'Website accessibility check with Canadian rules',
    profile: 'Standards', pages: 'Pages checked', violations: 'Problems to fix', instances: 'Places affected',
    review: 'Need a human check', score: 'Automated score', frameworks: 'Canadian rules',
    pass: 'No automated failures', fail: 'Problems found', failing: 'Rules not met (WCAG criteria)',
    site: 'Whole-site findings', pagesH: 'Page by page', error: 'Could not check this page', none: 'No problems found by the automated check on this page.',
    learn: 'Learn more', elements: 'Affected elements', refs: 'Canadian references',
    impact: { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' },
    type: { violation: 'Problem', review: 'Check by hand' },
    disclaimer: 'Automated tools find only about 30 to 40% of accessibility barriers. A clean result does not prove compliance with the Accessible Canada Act, AODA or any other law. Also test with a keyboard, a screen reader, and people with disabilities. This report is not legal advice.',
    generated: 'Generated',
    howToFix: 'How to fix it', why: 'Why it matters', seriousness: 'How serious', whereH: 'Where it is',
    onPlatform: (p) => `How to fix it on ${p}`, copySnippet: 'Copy snippet', copied: 'Copied!',
    promptH: 'Copy a fix prompt', promptHelp: 'Paste this into ChatGPT, Claude or your AI builder (Lovable, Bolt, Cursor…) to get help or have it make the fix.',
    copyPrompt: 'Copy fix prompt', showPrompt: 'See the prompt',
    dev: 'For developers (technical details)', rule: 'Rule', code: 'Code example',
    askTitle: 'Ask AI about this problem', askLabel: 'Your question (optional)', askPlaceholder: 'How do I fix this on my site?',
    askBtn: 'Ask AI how to fix this', asking: 'Asking the AI…', askNote: 'AI answers can be wrong. Check the advice before changing your site.',
    builtWith: 'Built with', detected: 'detected automatically', chosen: 'chosen by you', unknownPlatform: 'We could not tell which tool built this site, so the steps are general.',
    menusNote: '',
    planH: 'Your to-do list', planIntro: (p) => `Problems grouped by where you fix them${p ? ` on ${p}` : ''}. Click one to see the steps.`,
    planEmpty: 'Nothing to fix from the automated check. Still test by hand.',
    more: (n) => `and ${n} more`, onPages: (n) => (n === 1 ? '1 page' : `${n} pages`), places: (n) => (n === 1 ? '1 place' : `${n} places`),
    reviewH: 'Also check by hand', reviewIntro: 'The scanner could not decide these. Look at them yourself.',
  },
  fr: {
    title: "Rapport d'accessibilité", subtitle: "Vérification de l'accessibilité d'un site selon les règles canadiennes",
    profile: 'Normes', pages: 'Pages vérifiées', violations: 'Problèmes à corriger', instances: 'Endroits touchés',
    review: 'À vérifier à la main', score: 'Score automatisé', frameworks: 'Règles canadiennes',
    pass: 'Aucun échec automatisé', fail: 'Problèmes détectés', failing: 'Règles non respectées (critères WCAG)',
    site: "Constats pour tout le site", pagesH: 'Page par page', error: "Impossible de vérifier cette page", none: 'Aucun problème détecté automatiquement sur cette page.',
    learn: 'En savoir plus', elements: 'Éléments touchés', refs: 'Références canadiennes',
    impact: { critical: 'Critique', serious: 'Grave', moderate: 'Modéré', minor: 'Mineur' },
    type: { violation: 'Problème', review: 'À vérifier à la main' },
    disclaimer: "Les outils automatisés ne détectent qu'environ 30 à 40 % des obstacles. Un résultat sans erreur ne prouve pas la conformité à la Loi canadienne sur l'accessibilité, à la LAPHO ou à toute autre loi. Testez aussi avec un clavier, un lecteur d'écran et des personnes en situation de handicap. Ce rapport ne constitue pas un avis juridique.",
    generated: 'Généré le',
    howToFix: 'Comment corriger', why: 'Pourquoi c\'est important', seriousness: 'Gravité', whereH: 'Où se trouve le problème',
    onPlatform: (p) => `Comment corriger sur ${p}`, copySnippet: "Copier l'extrait", copied: 'Copié!',
    promptH: 'Copier une requête de correction', promptHelp: 'Collez-la dans ChatGPT, Claude ou votre outil IA (Lovable, Bolt, Cursor…) pour obtenir de l\'aide ou faire faire la correction.',
    copyPrompt: 'Copier la requête', showPrompt: 'Voir la requête',
    dev: 'Pour les développeurs (détails techniques)', rule: 'Règle', code: 'Exemple de code',
    askTitle: "Demander à l'IA", askLabel: 'Votre question (facultatif)', askPlaceholder: 'Comment corriger ce problème sur mon site?',
    askBtn: "Demander à l'IA comment corriger", asking: "Question envoyée à l'IA…", askNote: "Les réponses de l'IA peuvent contenir des erreurs. Vérifiez les conseils avant de modifier votre site.",
    builtWith: 'Créé avec', detected: 'détecté automatiquement', chosen: 'choisi par vous', unknownPlatform: "Nous n'avons pas pu déterminer l'outil utilisé pour créer ce site; les étapes sont donc générales.",
    menusNote: "Les noms de menus sont indiqués tels qu'ils apparaissent dans l'interface anglaise de la plateforme.",
    planH: 'Votre liste de tâches', planIntro: (p) => `Problèmes regroupés selon l'endroit où les corriger${p ? ` dans ${p}` : ''}. Cliquez sur un problème pour voir les étapes.`,
    planEmpty: "Rien à corriger selon la vérification automatisée. Testez quand même à la main.",
    more: (n) => `et ${n} autres`, onPages: (n) => (n === 1 ? '1 page' : `${n} pages`), places: (n) => (n === 1 ? '1 endroit' : `${n} endroits`),
    reviewH: 'À vérifier aussi à la main', reviewIntro: "L'outil n'a pas pu trancher pour ces éléments. Vérifiez-les vous-même.",
  },
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const KIND = {
  en: { image: 'The image', iconlink: 'An icon link', link: 'The link', button: 'The button', field: 'A form field', dropdown: 'A dropdown menu', heading: 'The heading', video: 'A video', audio: 'An audio player', embed: 'An embedded frame', page: 'The whole page', list: 'A list', form: 'A form', text: 'The text', element: 'A part of the page' },
  fr: { image: "L'image", iconlink: 'Un lien-icône', link: 'Le lien', button: 'Le bouton', field: 'Un champ de formulaire', dropdown: 'Un menu déroulant', heading: 'Le titre', video: 'Une vidéo', audio: 'Un lecteur audio', embed: 'Un cadre intégré', page: 'La page entière', list: 'Une liste', form: 'Un formulaire', text: 'Le texte', element: 'Une partie de la page' },
};
const AREA = {
  en: { header: 'in the header', nav: 'in the menu', footer: 'in the footer', main: 'in the main content', aside: 'in a sidebar', form: 'in a form', dialog: 'in a pop-up' },
  fr: { header: "dans l'en-tête", nav: 'dans le menu', footer: 'dans le pied de page', main: 'dans le contenu principal', aside: 'dans une barre latérale', form: 'dans un formulaire', dialog: 'dans une fenêtre surgissante' },
};
const SQS_BLOCK = { image: 'Image', button: 'Button', form: 'Form', video: 'Video', gallery: 'Gallery', socialaccountlinks: 'Social Links', 'socialaccountlinks-v2': 'Social Links', code: 'Code', html: 'Text', newsletter: 'Newsletter', summary: 'Summary', 'summary-v2': 'Summary', embed: 'Embed', map: 'Map', quote: 'Quote', menu: 'Menu', audio: 'Audio', accordion: 'Accordion', 'website-component': 'Content', product: 'Product' };

export function describeWhere(w, lang = 'en') {
  if (!w) return '';
  const fr = lang === 'fr';
  const parts = [];
  let first = KIND[lang][w.kind] || KIND[lang].element;
  if (w.label) first += w.kind === 'embed' ? (fr ? ` de ${w.label}` : ` from ${w.label}`) : w.kind === 'field' || w.kind === 'dropdown' ? ` (« ${w.label} »)`.replace(/« (.*) »/, fr ? '« $1 »' : '“$1”') : fr ? ` « ${w.label} »` : ` “${w.label}”`;
  parts.push(first);
  if (w.sqsBlock && SQS_BLOCK[w.sqsBlock]) parts.push(fr ? `dans le bloc ${SQS_BLOCK[w.sqsBlock]}` : `in the ${SQS_BLOCK[w.sqsBlock]} block`);
  if (w.area && AREA[lang][w.area] && !(w.area === 'main' && w.section)) parts.push(AREA[lang][w.area]);
  if (w.section) parts.push(fr ? `section ${w.section} de la page` : `section ${w.section} of the page`);
  if (w.near && w.kind !== 'heading') parts.push(fr ? `près du titre « ${w.near} »` : `near the heading “${w.near}”`);
  return parts.join(', ');
}

function platformLabel(report, lang) {
  const p = report.platform || { id: 'unknown' };
  if (!p.id || p.id === 'unknown') return null;
  return `${platformName(p.id, lang)}${p.version ? ` ${p.version}` : ''}`;
}

function buildPrompt(i, g, page, report, lang) {
  const fr = lang === 'fr';
  const p = report.platform || { id: 'unknown' };
  const plat = platformLabel(report, lang);
  const nocode = PLATFORMS[p.id]?.nocode;
  const lines = [];
  lines.push(fr ? `Aide-moi à corriger ce problème d'accessibilité sur mon site Web${plat ? ` (créé avec ${plat})` : ''}.` : `Help me fix this accessibility problem on my website${plat ? ` (built with ${plat})` : ''}.`);
  if (page?.url) lines.push(`${fr ? 'Page' : 'Page'}: ${page.url}`);
  lines.push(`${fr ? 'Problème' : 'Problem'}: ${g.title} (${i.id}${i.wcag?.length ? `, WCAG ${i.wcag.join(', ')}` : ''})`);
  if (g.why) lines.push(`${fr ? 'Pourquoi' : 'Why it matters'}: ${g.why}`);
  const nodes = i.nodes.slice(0, 5);
  if (nodes.length && nodes[0].html && !/^\(/.test(nodes[0].html)) {
    lines.push(fr ? 'Éléments touchés :' : 'Affected elements:');
    for (const n of nodes) lines.push(`- ${describeWhere(n.where, lang) || [].concat(n.target).join(' ')}\n  HTML: ${String(n.html).slice(0, 300)}`);
  }
  lines.push(nocode
    ? (fr ? `Donne-moi des étapes simples, en langage clair, pour corriger cela dans l'éditeur de ${plat || 'mon site'}, sans coder si possible. Si du code est nécessaire, donne l'extrait exact et où le coller.` : `Give me simple, plain-language steps to fix this in the ${plat || 'site'} editor, without code if possible. If code is needed, give the exact snippet and where to paste it.`)
    : (fr ? "Modifie le code pour corriger ce problème sans changer l'apparence du site. Explique en une phrase ce que tu as changé." : "Change the code to fix this without changing how the site looks. Explain in one sentence what you changed."));
  return lines.join('\n');
}

function issueHtml(i, t, lang = 'en', ctx = {}) {
  const report = ctx.report;
  const platformId = report?.platform?.id || 'unknown';
  const inCode = i.nodes.some((n) => n.where?.inCode);
  const g = guidanceFor(i, platformId, lang, { inCode });
  const plat = report ? platformLabel(report, lang) : null;
  const id = `i-${ctx.ref}`;
  const whereTag = WHERE[g.where] ? WHERE[g.where][lang] : '';
  const fw = Object.keys(i.frameworks || {}).map((k) => `<span class="chip">${esc(FRAMEWORKS[k].short)}</span>`).join('');
  const wcag = (i.wcag || []).map((sc) => `<span class="chip sc">WCAG ${esc(sc)}</span>`).join('');
  const refs = (i.canadaRefs || []).map((r) => `<li>${esc(r)}</li>`).join('');

  const places = i.nodes.filter((n) => n.where || n.shot).slice(0, 6).map((n) => `<li>${n.shot ? `<img class="shot" src="${n.shot}" alt="">` : ''}<span>${esc(describeWhere(n.where, lang))}</span></li>`).join('');
  const morePlaces = i.nodes.length > 6 ? `<p class="muted">${esc(t.more(i.nodes.length - 6))}</p>` : '';

  const steps = g.steps.length ? `<ol>${g.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : `<p>${esc(i.description)}</p>`;
  const snippet = g.snippet ? `<div class="snippet"><pre>${esc(g.snippet)}</pre><button type="button" class="btn secondary copy" data-copy="${esc(g.snippet)}">${t.copySnippet}</button></div>` : '';
  const prompt = buildPrompt(i, g, ctx.page, report || {}, lang);

  const devNodes = i.nodes.map((n) => `<li><code class="sel">${esc([].concat(n.target).join(' '))}</code>
      <pre>${esc(n.html)}</pre>${n.failureSummary ? `<p class="fix">${esc(n.failureSummary)}</p>` : ''}</li>`).join('');

  return `<details class="issue ${esc(i.impact)} ${esc(i.type)}" id="${esc(id)}">
    <summary><span class="badge ${esc(i.impact)}">${esc(t.impact[i.impact] || i.impact)}</span>
      ${i.type === 'review' ? `<span class="badge type">${esc(t.type.review)}</span>` : ''}
      <strong>${esc(g.title)}</strong> <span class="muted">(${esc(t.places(i.nodes.length))})</span>
      ${whereTag ? `<span class="where-chip">${esc(whereTag)}</span>` : ''}</summary>
    <div class="body">
      ${g.why ? `<p><span class="h">${t.why}:</span> ${esc(g.why)}</p>` : ''}
      <p><span class="h">${t.seriousness}:</span> ${esc(IMPACT_PLAIN[i.impact]?.[lang] || '')}</p>
      ${places ? `<p class="h">${t.whereH}</p><ul class="places">${places}</ul>${morePlaces}` : ''}
      <div class="howto"><p class="h">${plat && g.plain ? esc(t.onPlatform(plat)) : t.howToFix}</p>${steps}${snippet}</div>
      <div class="prompt"><p class="h">${t.promptH}</p><p class="muted">${t.promptHelp}</p>
        <p><button type="button" class="btn secondary copy" data-copy="${esc(prompt)}">${t.copyPrompt}</button></p>
        <details><summary>${t.showPrompt}</summary><pre>${esc(prompt)}</pre></details></div>
      ${ctx.ai ? `<div class="ai" data-ref="${esc(ctx.ref)}"><p class="h">${t.askTitle}</p>
        <label for="q-${esc(ctx.ref)}">${t.askLabel}</label>
        <textarea id="q-${esc(ctx.ref)}" rows="2" maxlength="500" placeholder="${esc(t.askPlaceholder)}"></textarea>
        <p><button type="button" class="btn ai-ask">${t.askBtn}</button></p>
        <div class="ai-answer" aria-live="polite"></div><p class="note">${t.askNote}</p></div>` : ''}
      <details class="dev"><summary>${t.dev}</summary>
        <p><span class="h">${t.rule}:</span> <code>${esc(i.id)}</code>: ${esc(i.help)}</p>
        <p>${esc(i.description)}</p>
        <p>${wcag}${fw}</p>
        ${refs ? `<p class="h">${t.refs}</p><ul>${refs}</ul>` : ''}
        ${g.code ? `<p class="h">${t.code}</p><pre>${esc(g.code)}</pre>` : ''}
        ${i.helpUrl ? `<p><a href="${esc(i.helpUrl)}" target="_blank" rel="noopener">${t.learn}<span class="visually-hidden"> (${esc(i.id)})</span></a></p>` : ''}
        <p class="h">${t.elements}</p><ol class="nodes">${devNodes}</ol>
      </details>
    </div></details>`;
}

function planHtml(report, t, lang, refs) {
  const platformId = report.platform?.id || 'unknown';
  const groups = new Map();
  for (const { i, ref, page } of refs) {
    if (i.type !== 'violation' && i.source !== 'canada') continue;
    const g = guidanceFor(i, platformId, lang, { inCode: i.nodes.some((n) => n.where?.inCode) });
    const key = g.where in WHERE ? g.where : 'developer';
    if (!groups.has(key)) groups.set(key, new Map());
    const items = groups.get(key);
    const k = i.id;
    if (!items.has(k)) items.set(k, { title: g.title, ref, impact: i.impact, places: 0, pages: new Set() });
    const it = items.get(k);
    it.places += i.nodes.length; if (page) it.pages.add(page.url);
  }
  if (!groups.size) return `<p>${t.planEmpty}</p>`;
  const order = ['critical', 'serious', 'moderate', 'minor'];
  return [...groups.entries()].sort((a, b) => WHERE[a[0]].order - WHERE[b[0]].order).map(([key, items]) => `
    <div class="plan-group ${key === 'platform' ? 'muted-group' : ''}"><h3>${esc(WHERE[key][lang])} <span class="count">${items.size}</span></h3><ul>
    ${[...items.values()].sort((a, b) => order.indexOf(a.impact) - order.indexOf(b.impact)).map((it) => `<li><a href="#i-${esc(it.ref)}" class="plan-link">${esc(it.title)}</a>
      <span class="muted">(${esc(t.places(it.places))}${it.pages.size > 1 ? `, ${esc(t.onPages(it.pages.size))}` : ''})</span></li>`).join('')}
    </ul></div>`).join('');
}

export function toHtml(report, lang = 'en', opts = {}) {
  const t = T[lang] || T.en;
  const s = report.summary;
  const plat = platformLabel(report, lang);
  const p = report.platform || {};
  const refs = [
    ...report.siteIssues.map((i, k) => ({ i, ref: `s-${k}`, page: null })),
    ...report.pages.flatMap((pg, n) => pg.issues.map((i, k) => ({ i, ref: `p-${n}-${k}`, page: pg }))),
  ];
  const fw = report.frameworks.map((f) => `<li class="fw ${f.status === 'fail' ? 'bad' : 'good'} ${report.frameworks.length === 1 ? 'primary' : ''}">
      <h3>${esc(f.short)}</h3><p class="muted">${esc(f.name)}</p><p class="muted">${esc(f.jurisdiction)}</p>
      <p><strong>${f.status === 'fail' ? `✗ ${t.fail}` : f.status === 'not-scanned' ? '-' : `✓ ${t.pass}`}</strong></p>
      ${f.failingCriteria.length ? `<details><summary>${t.failing} (${f.failingCriteria.length})</summary><ul>${f.failingCriteria.map((c) => `<li>${esc(c.sc)} ${esc(c.name)} (${esc(c.level)})${c.clause && f.id === 'aca' ? `, EN 301 549 ${esc(c.clause)}` : ''}</li>`).join('')}</ul></details>` : ''}
    </li>`).join('');
  const ctxFor = (ref, page) => ({ ai: opts.ai, ref, page, report });
  const pageIssues = (pg, n, type) => pg.issues.map((i, k) => ({ i, k })).filter(({ i }) => (type === 'violation' ? i.type === 'violation' || i.source === 'canada' : i.type === 'review' && i.source !== 'canada'));
  const pages = report.pages.map((pg, n) => {
    const main = pageIssues(pg, n, 'violation'); const rev = pageIssues(pg, n, 'review');
    return `<section class="page" aria-labelledby="p${n} u${n}">
      <h3 id="p${n}">${esc(pg.title || pg.url)}</h3><p><a id="u${n}" href="${esc(pg.url)}">${esc(pg.url)}</a></p>
      ${pg.error ? `<p class="err">${t.error}: ${esc(pg.error)}</p>` : main.length ? main.map(({ i, k }) => issueHtml(i, t, lang, ctxFor(`p-${n}-${k}`, pg))).join('') : `<p>${t.none}</p>`}
      ${rev.length ? `<details class="review-group"><summary>${t.reviewH} (${rev.length})</summary><p class="muted">${t.reviewIntro}</p>${rev.map(({ i, k }) => issueHtml(i, t, lang, ctxFor(`p-${n}-${k}`, pg))).join('')}</details>` : ''}
    </section>`;
  }).join('');

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
.where-chip{display:inline-block;font-size:.8rem;font-weight:600;border:1px solid var(--accent);color:var(--accent);border-radius:12px;padding:0 8px;margin-left:4px}
.body .h{font-weight:700}.places{list-style:none;padding:0;display:grid;gap:10px}
.places li{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}.places span{flex:1 1 220px;min-width:0}
.shot{max-width:min(320px,100%);max-height:160px;border:1px solid var(--line);border-radius:4px;background:#fff}
.snippet{margin:8px 0}.snippet pre{margin-bottom:6px}
.prompt{border:1px dashed var(--line);border-radius:8px;padding:8px 12px;margin:12px 0}.prompt p{margin:4px 0}
.dev{margin-top:12px;border-top:1px solid var(--line);padding-top:8px}.dev>summary{cursor:pointer;font-weight:600;color:var(--muted)}
.platform{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 16px;margin:12px 0;font-size:1.05rem}
.plan{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
.plan-group{background:var(--card);border:1px solid var(--line);border-left:6px solid var(--accent);border-radius:8px;padding:8px 16px}
.plan-group.muted-group{border-left-color:var(--line)}.plan-group h3{margin:4px 0 8px;font-size:1.05rem}
.plan-group ul{margin:0 0 8px;padding-left:1.2em}.plan-group li{margin:4px 0}.count{display:inline-block;min-width:1.6em;text-align:center;border-radius:10px;background:var(--accent);color:var(--bg);font-size:.85rem;padding:0 6px}
.review-group{margin-top:16px}.review-group>summary{cursor:pointer;font-weight:600}
@media print{.prompt,.copy{display:none}.dev{display:block}}
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
</ul>
<p class="platform">${plat ? `${t.builtWith} <strong>${esc(plat)}</strong>${p.builder ? ` (${esc(p.builder)})` : ''} <span class="muted">(${p.source === 'chosen' ? t.chosen : t.detected})</span>` : esc(t.unknownPlatform)}${t.menusNote && plat ? `<br><span class="muted">${t.menusNote}</span>` : ''}</p>
<h2>${t.planH}</h2><p class="muted">${esc(t.planIntro(plat))}</p><div class="plan">${planHtml(report, t, lang, refs)}</div>
<p class="disclaimer">${t.disclaimer}</p>
<h2>${t.frameworks}</h2><ul class="fws">${fw}</ul>
${report.siteIssues.length ? `<h2>${t.site}</h2>${report.siteIssues.map((i, k) => issueHtml(i, t, lang, ctxFor(`s-${k}`, null))).join('')}` : ''}
<h2>${t.pagesH}</h2>${pages}
</main>${copyScript(t)}${opts.ai ? aiScript(lang, t, opts.aiEndpoint) : ''}</body></html>`;
}

function copyScript(t) {
  return `<script>
(function(){
  // Open the matching problem when a to-do item is clicked
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a.plan-link'); if(!a)return;
    var d=document.getElementById(a.getAttribute('href').slice(1)); if(!d)return;
    var p=d.parentElement&&d.parentElement.closest('details'); if(p)p.open=true; d.open=true;
  });
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.copy'); if(!b)return;
    var text=b.getAttribute('data-copy'), label=b.textContent;
    function done(){ b.textContent=${JSON.stringify(t.copied)}; setTimeout(function(){ b.textContent=label; },1800); }
    function fallback(){ var ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); done(); }catch(x){} document.body.removeChild(ta); }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done,fallback); } else fallback();
  });
})();
</script>`;
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
  const plat = platformLabel(report, 'en');
  if (plat) md += `Built with **${plat}**. Download the HTML report for step-by-step ${plat} fixes.\n\n`;
  md += `| Score | Pages | Violations | Failing elements | Needs review | Critical | Serious | Moderate | Minor |\n|---|---|---|---|---|---|---|---|---|\n`;
  md += `| **${s.score ?? '-'}** | ${s.pagesScanned} | ${s.violationRules} | ${s.violationInstances} | ${s.needsReview} | ${s.byImpact.critical} | ${s.byImpact.serious} | ${s.byImpact.moderate} | ${s.byImpact.minor} |\n\n`;
  md += `### Canadian frameworks\n\n| Framework | Standard | Result | Failing criteria |\n|---|---|---|---|\n`;
  for (const f of report.frameworks) {
    md += `| ${f.short} | ${f.wcag} | ${f.status === 'fail' ? '❌ fail' : f.status === 'not-scanned' ? 'not scanned' : '✅ no automated failures'} | ${f.failingCriteria.map((c) => c.sc).join(', ') || '-'} |\n`;
  }
  const rows = [];
  for (const p of report.pages) {
    for (const i of p.issues.filter((x) => x.type === 'violation')) {
      const g = guidanceFor(i, report.platform?.id, 'en');
      rows.push(`| ${icon[i.impact] || ''} ${i.impact} | ${g.title.replace(/\|/g, '\\|')} | ${WHERE[g.where]?.en || '-'} | ${i.wcag.join(', ') || '-'} | ${i.nodes.length} | ${p.url} |`);
    }
  }
  if (rows.length) md += `\n### Violations\n\n| Impact | Problem | Where to fix | WCAG | Count | Page |\n|---|---|---|---|---|---|\n${rows.slice(0, 100).join('\n')}\n`;
  if (rows.length > 100) md += `\n_…and ${rows.length - 100} more. See the HTML report artifact._\n`;
  const review = [...report.siteIssues, ...report.pages.flatMap((p) => p.issues.filter((i) => i.source === 'canada' && i.type === 'review'))];
  const uniq = [...new Map(review.map((i) => [i.id, i])).values()];
  if (uniq.length) md += `\n### Canada-specific items to review\n\n${uniq.map((i) => `- **${guidanceFor(i, report.platform?.id, 'en').title}**: ${i.description}`).join('\n')}\n`;
  md += `\n> Automated testing finds only part of accessibility barriers; manual testing is still required. Not legal advice.\n`;
  return md;
}
