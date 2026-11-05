// Canada-specific checks that axe-core doesn't cover: official languages,
// ACA/AODA publication & feedback obligations, alternate formats, media.

// Runs inside the browser page. Must be self-contained (serialized by Playwright).
export function collectPageSignals() {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
  const short = (path) => {
    // build a reasonably unique CSS selector for reporting
    const parts = [];
    let el = path;
    while (el && el.nodeType === 1 && parts.length < 5) {
      let sel = el.tagName.toLowerCase();
      if (el.id) { parts.unshift(`${sel}#${CSS.escape(el.id)}`); break; }
      const sib = el.parentElement ? [...el.parentElement.children].filter((c) => c.tagName === el.tagName) : [];
      if (sib.length > 1) sel += `:nth-of-type(${sib.indexOf(el) + 1})`;
      parts.unshift(sel);
      el = el.parentElement;
    }
    return parts.join(' > ');
  };

  const links = [...document.querySelectorAll('a[href]')].map((a) => ({
    href: a.href,
    text: norm(a.innerText || a.textContent || a.getAttribute('aria-label')),
    lang: (a.getAttribute('lang') || a.closest('[lang]')?.getAttribute('lang') || '').toLowerCase(),
    ownLang: (a.getAttribute('lang') || '').toLowerCase(),
    hreflang: (a.getAttribute('hreflang') || '').toLowerCase(),
    selector: short(a),
    html: a.outerHTML.slice(0, 250),
  }));

  // Text blocks for language-of-parts detection
  const blocks = [...document.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, td, th, blockquote, figcaption, dd, dt, label, button')]
    .filter((el) => !el.querySelector('p, li, h1, h2, h3, h4, h5, h6, blockquote'))
    .map((el) => ({
      text: norm(el.innerText).slice(0, 600),
      lang: (el.closest('[lang]')?.getAttribute('lang') || '').toLowerCase(),
      selector: short(el),
      html: el.outerHTML.slice(0, 250),
    }))
    .filter((b) => b.text.split(' ').length >= 6);

  const media = [
    ...[...document.querySelectorAll('video')].map((v) => ({
      kind: 'video',
      hasCaptions: !!v.querySelector('track[kind="captions"], track[kind="subtitles"]'),
      hasDescriptions: !!v.querySelector('track[kind="descriptions"]'),
      selector: short(v),
      html: v.outerHTML.slice(0, 250),
    })),
    ...[...document.querySelectorAll('iframe[src]')]
      .filter((f) => /youtube|youtu\.be|vimeo|wistia|brightcove|dailymotion|jwplayer|kaltura/i.test(f.src))
      .map((f) => ({ kind: 'embed', src: f.src, selector: short(f), html: f.outerHTML.slice(0, 250) })),
    ...[...document.querySelectorAll('audio')].map((a) => ({ kind: 'audio', selector: short(a), html: a.outerHTML.slice(0, 250) })),
  ];

  const alternates = [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => ({
    hreflang: l.getAttribute('hreflang').toLowerCase(), href: l.href,
  }));

  return { url: location.href, title: document.title, htmlLang, links, blocks, media, alternates };
}

// ---------- language heuristics ----------
const FR_WORDS = new Set('le la les des du de et est un une pour dans avec sur pas que qui au aux ce cette ces nous vous ils elles sont être avoir par plus ou mais votre vos notre nos leur leurs été fait comme tout tous aussi très'.split(' '));
const EN_WORDS = new Set('the and is are of to in for with on that this be have by from or not your our their it as at was were will can more about which you we they an'.split(' '));

export function guessLanguage(text) {
  const words = text.toLowerCase().replace(/[^a-zàâçéèêëîïôûùüÿœæ'\s-]/g, ' ').split(/[\s']+/).filter(Boolean);
  if (words.length < 6) return null;
  let fr = 0; let en = 0;
  for (const w of words) { if (FR_WORDS.has(w)) fr++; if (EN_WORDS.has(w)) en++; }
  const total = fr + en;
  if (total < 3) return null;
  if (fr / total >= 0.75 && fr >= 3) return 'fr';
  if (en / total >= 0.75 && en >= 3) return 'en';
  return null;
}

const primary = (lang) => (lang || '').split('-')[0];
const TOGGLE_TEXT = /^(français|francais|fr|english|en|version française|english version|en français|in english)$/i;
const A11Y_TEXT = /accessibilit[yé]|accessible|aoda|accessibility (plan|statement|policy)|plan d'accessibilit|déclaration d'accessibilit/i;
const A11Y_HREF = /accessib/i;
const FEEDBACK_TEXT = /contact|feedback|rétroaction|retroaction|nous joindre|joignez|commentaires|écrivez-nous/i;
const DOC_EXT = /\.(pdf|docx?|xlsx?|pptx?|rtf|odt)(\?|#|$)/i;

function issue(id, impact, help, description, wcag, refs, nodes, type = 'violation') {
  return { id, source: 'canada', type, impact, help, description, wcag, canadaRefs: refs, nodes, helpUrl: null };
}

// Per-page checks. Returns { issues, flags } where flags feed site-level checks.
export function evaluatePage(sig) {
  const issues = [];
  const pageLang = primary(sig.htmlLang);

  // 1. Page language should be an official language (when declared)
  if (sig.htmlLang && !['en', 'fr'].includes(pageLang)) {
    issues.push(issue('ca-official-language', 'minor',
      'Page language is not English or French',
      `The page declares lang="${sig.htmlLang}". Federal institutions must publish in both official languages (Official Languages Act); confirm an EN/FR version exists.`,
      ['3.1.1'], ['Official Languages Act, Part IV'],
      [{ target: ['html'], html: `<html lang="${sig.htmlLang}">` }], 'review'));
  }

  // 2. Language toggle to the other official language
  const toggle = sig.links.filter((l) =>
    TOGGLE_TEXT.test(l.text) || ['en', 'fr'].includes(primary(l.hreflang)) && primary(l.hreflang) !== pageLang);
  const hasAltLang = toggle.length > 0 || sig.alternates.some((a) => ['en', 'fr'].includes(primary(a.hreflang)) && primary(a.hreflang) !== pageLang);
  if (!hasAltLang && ['en', 'fr'].includes(pageLang)) {
    issues.push(issue('ca-language-toggle', 'moderate',
      'No link to the other official language version',
      'No English/French language toggle or hreflang alternate was found. Required for federal institutions under the Official Languages Act and expected by the Canada.ca design system; strongly recommended for any Canadian audience.',
      [], ['Official Languages Act, Part IV', 'Canada.ca Content Style Guide'],
      [{ target: ['html'], html: '(no language toggle found)' }], 'review'));
  }

  // 3. Language toggle link text must declare its own language (WCAG 3.1.2)
  for (const l of toggle) {
    const textLang = /fran[cç]ais/i.test(l.text) ? 'fr' : /english/i.test(l.text) ? 'en' : null;
    if (textLang && textLang !== pageLang && primary(l.lang) !== textLang) {
      issues.push(issue('ca-language-toggle-lang', 'moderate',
        'Language toggle text is missing a lang attribute',
        `The link "${l.text}" is written in ${textLang === 'fr' ? 'French' : 'English'} but inherits lang="${l.lang || 'none'}". Screen readers will mispronounce it. Add lang="${textLang}" to the link.`,
        ['3.1.2'], ['Official Languages Act'],
        [{ target: [l.selector], html: l.html, failureSummary: `Add lang="${textLang}" to this element.` }]));
    }
  }

  // 4. Language of parts: French passages on English pages (and vice versa) without lang
  const mismatched = [];
  for (const b of sig.blocks) {
    const g = guessLanguage(b.text);
    const declared = primary(b.lang);
    if (g && declared && ['en', 'fr'].includes(declared) && g !== declared) {
      mismatched.push({ target: [b.selector], html: b.html, failureSummary: `Text appears to be ${g === 'fr' ? 'French' : 'English'} but is marked lang="${b.lang}". Add lang="${g}" to this element.` });
    }
  }
  if (mismatched.length) {
    issues.push(issue('ca-language-of-parts', 'serious',
      'Passages in the other official language are not marked up',
      'Bilingual content must identify language changes so assistive technology switches pronunciation (e.g. <p lang="fr">).',
      ['3.1.2'], ['Official Languages Act'], mismatched.slice(0, 25)));
  }

  // 5. Documents (PDF/Word/etc.) need accessible or alternate formats
  const docs = sig.links.filter((l) => DOC_EXT.test(l.href));
  if (docs.length) {
    issues.push(issue('ca-document-formats', 'moderate',
      'Linked documents must be accessible or offered in an alternate format',
      `${docs.length} link(s) to PDF/Office documents found. Under EN 301 549 clause 10 these must meet WCAG; the Accessible Canada Regulations and AODA (IASR s.12) require accessible formats on request. Prefer HTML versions and indicate file type and size in link text.`,
      [], ['CAN/ASC-EN 301 549 clause 10', 'AODA IASR s.12', 'Accessible Canada Regulations (alternate formats)'],
      docs.slice(0, 25).map((d) => ({ target: [d.selector], html: d.html, failureSummary: 'Manually verify the document is tagged and accessible, or provide an HTML alternative.' })), 'review'));
  }

  // 6. Media: captions & described video
  const media = sig.media;
  if (media.length) {
    const nodes = media.map((m) => ({
      target: [m.selector], html: m.html,
      failureSummary: m.kind === 'video' && !m.hasCaptions
        ? 'No <track kind="captions"> found. Provide captions and described video / transcript.'
        : 'Verify captions (1.2.2), audio description (1.2.5) and a transcript are available.',
    }));
    const missingCaptions = media.some((m) => m.kind === 'video' && !m.hasCaptions);
    issues.push(issue('ca-media-alternatives', missingCaptions ? 'serious' : 'moderate',
      'Audio/video needs captions, described video and transcripts',
      'Canadian standards require captions for prerecorded media (WCAG 1.2.2). ACA/EN 301 549 also requires audio description (1.2.5); AODA exempts 1.2.4 and 1.2.5 but still requires 1.2.2 and 1.2.3.',
      ['1.2.2', '1.2.3', '1.2.5'], ['CAN/ASC-EN 301 549 clause 7', 'CRTC described-video policy'], nodes,
      missingCaptions ? 'violation' : 'review'));
  }

  return {
    issues,
    flags: {
      a11yLink: sig.links.find((l) => A11Y_TEXT.test(l.text) || A11Y_HREF.test(l.href)) || null,
      feedbackLink: sig.links.find((l) => /^(mailto|tel):/i.test(l.href) || FEEDBACK_TEXT.test(l.text)) || null,
    },
  };
}

// Site-level checks across all scanned pages.
export function evaluateSite(pageFlags) {
  const issues = [];
  if (!pageFlags.some((f) => f.a11yLink)) {
    issues.push(issue('ca-accessibility-statement', 'moderate',
      'No accessibility plan / statement link found',
      'The Accessible Canada Act (Part 4) requires regulated entities to publish an accessibility plan and progress reports; AODA (IASR s.3) requires published accessibility policies. Link to them from every page (e.g. footer).',
      [], ['Accessible Canada Act, Part 4 (accessibility plans)', 'Accessible Canada Regulations', 'AODA IASR s.3–4'],
      [{ target: ['site'], html: '(no link containing "accessibility" / "accessibilité" found on scanned pages)' }], 'review'));
  }
  if (!pageFlags.some((f) => f.feedbackLink)) {
    issues.push(issue('ca-feedback-process', 'moderate',
      'No accessibility feedback / contact mechanism found',
      'The Accessible Canada Act (Part 4) requires a published process to receive feedback on accessibility; AODA (IASR s.11) requires an accessible feedback process. Provide email, phone and form options.',
      [], ['Accessible Canada Act, Part 4 (feedback process)', 'AODA IASR s.11'],
      [{ target: ['site'], html: '(no contact/feedback link, mailto: or tel: found)' }], 'review'));
  }
  return issues;
}
