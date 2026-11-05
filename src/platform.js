// Detect which website builder a page was made with, and describe page elements in plain language.

export const PLATFORMS = {
  squarespace: { name: 'Squarespace', nocode: true },
  wix: { name: 'Wix', nocode: true },
  wordpress: { name: 'WordPress', nocode: true },
  shopify: { name: 'Shopify', nocode: true },
  webflow: { name: 'Webflow', nocode: true },
  framer: { name: 'Framer', nocode: true },
  godaddy: { name: 'GoDaddy Website Builder', nocode: true },
  weebly: { name: 'Weebly / Square Online', nocode: true },
  ai: { name: { en: 'an AI app builder (Lovable, Bolt, v0, etc.)', fr: "un outil de création par IA (Lovable, Bolt, v0, etc.)" }, nocode: false },
  custom: { name: { en: 'custom code', fr: 'du code sur mesure' }, nocode: false },
  unknown: { name: { en: 'an unknown platform', fr: 'une plateforme inconnue' }, nocode: false },
};

export function platformName(id, lang = 'en') {
  const n = PLATFORMS[id]?.name ?? PLATFORMS.unknown.name;
  return typeof n === 'string' ? n : n[lang] || n.en;
}

// Runs inside the browser page.
export function detectPlatformInPage() {
  const html = document.documentElement.outerHTML.slice(0, 400000);
  const gen = (document.querySelector('meta[name="generator"]')?.content || '').toLowerCase();
  const has = (re) => re.test(html);
  const out = { id: 'unknown', version: null, builder: null };

  if (window.Static?.SQUARESPACE_CONTEXT || gen.includes('squarespace') || has(/static1\.squarespace\.com|assets\.squarespace\.com/)) {
    out.id = 'squarespace';
    const ctx = window.Static?.SQUARESPACE_CONTEXT || {};
    const v = String(ctx.templateVersion || ctx.website?.templateVersion || '');
    if (v.startsWith('7.1')) out.version = '7.1';
    else if (v.startsWith('7')) out.version = '7.0';
    else if (document.querySelector('.fluid-engine, [data-fluid-engine], section.page-section .content-wrapper')) out.version = '7.1';
    if (document.querySelector('.fluid-engine, [data-fluid-engine]')) out.builder = 'Fluid Engine';
  } else if (gen.includes('wix') || window.wixBiSession || has(/static\.wixstatic\.com|static\.parastorage\.com/)) {
    out.id = 'wix';
  } else if (gen.includes('wordpress') || has(/\/wp-content\/|\/wp-includes\//)) {
    out.id = 'wordpress';
    const m = /wordpress\s*([\d.]+)/.exec(gen); if (m) out.version = m[1];
    if (document.querySelector('[class*="elementor"]')) out.builder = 'Elementor';
    else if (document.querySelector('[class*="et_pb_"]')) out.builder = 'Divi';
    else if (document.querySelector('.wp-block-group, .wp-block-image, [class*="wp-block-"]')) out.builder = 'Block editor';
  } else if (window.Shopify || has(/cdn\.shopify\.com/)) {
    out.id = 'shopify';
  } else if (document.documentElement.hasAttribute('data-wf-site') || gen.includes('webflow')) {
    out.id = 'webflow';
  } else if (gen.includes('framer') || has(/framerusercontent\.com/)) {
    out.id = 'framer';
  } else if (gen.includes('go daddy') || gen.includes('godaddy') || has(/img1\.wsimg\.com/)) {
    out.id = 'godaddy';
  } else if (gen.includes('weebly') || has(/weebly\.com|editmysite\.com/)) {
    out.id = 'weebly';
  } else if (has(/cdn\.gpteng\.co|lovable\.(app|dev)|bolt\.new|v0\.dev|replit\.(app|dev)/) || gen.includes('lovable')) {
    out.id = 'ai';
  } else if (document.querySelector('#__next, #root, #app, [data-reactroot], [ng-version], #__nuxt') || gen.includes('next.js')) {
    out.id = 'custom';
  }
  return out;
}

// Runs inside the browser page: describe elements (by CSS selector) in plain language.
export function describeElementsInPage(selectors) {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const short = (s, n = 60) => { s = norm(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const sections = [...document.querySelectorAll('main section, section.page-section, [data-section-id], main > div > section')];
  const result = {};
  for (const sel of selectors) {
    let el = null;
    try { el = document.querySelector(sel); } catch { /* invalid selector */ }
    if (!el) { result[sel] = null; continue; }
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute('role');
    let kind = 'element';
    if (tag === 'img' || role === 'img' || tag === 'svg') kind = 'image';
    else if (tag === 'a') kind = el.querySelector('img,svg') && !norm(el.innerText) ? 'iconlink' : 'link';
    else if (tag === 'button' || role === 'button' || (tag === 'input' && /^(submit|button|reset|image)$/.test(el.type))) kind = 'button';
    else if (tag === 'input' || tag === 'textarea') kind = 'field';
    else if (tag === 'select') kind = 'dropdown';
    else if (/^h[1-6]$/.test(tag)) kind = 'heading';
    else if (tag === 'video') kind = 'video';
    else if (tag === 'audio') kind = 'audio';
    else if (tag === 'iframe') kind = 'embed';
    else if (tag === 'html') kind = 'page';
    else if (tag === 'ul' || tag === 'ol' || tag === 'li') kind = 'list';
    else if (tag === 'form') kind = 'form';
    else if (norm(el.innerText).length) kind = 'text';

    let label = '';
    if (kind === 'image') label = el.getAttribute('alt') || (el.currentSrc || el.src || el.getAttribute('data-src') || '').split('/').pop().split('?')[0];
    else if (kind === 'field' || kind === 'dropdown') label = el.getAttribute('placeholder') || el.getAttribute('name') || el.getAttribute('aria-label') || el.type || '';
    else if (kind === 'embed') label = (() => { try { return new URL(el.src).hostname.replace(/^www\./, ''); } catch { return ''; } })();
    else if (kind === 'iconlink') { const img = el.querySelector('img'); label = (img && (img.alt || (img.src || '').split('/').pop().split('?')[0])) || (() => { try { return new URL(el.href).hostname.replace(/^www\./, ''); } catch { return ''; } })(); }
    else label = el.innerText || el.value || el.getAttribute('aria-label') || '';
    label = short(label);

    const areaEl = el.closest('header, nav, main, footer, aside, form, dialog, [role="banner"], [role="navigation"], [role="contentinfo"], [role="dialog"]');
    let area = areaEl ? (areaEl.getAttribute('role') || areaEl.tagName.toLowerCase()) : '';
    area = { banner: 'header', navigation: 'nav', contentinfo: 'footer' }[area] || area;
    if (kind === 'page') area = '';

    // nearest heading before the element
    let near = '';
    const heads = [...document.querySelectorAll('h1,h2,h3,h4')];
    for (const h of heads) {
      if (h === el || h.contains(el)) continue;
      if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) near = h; else break;
    }
    near = near ? short(near.innerText, 50) : '';

    // Squarespace block type and section number
    const block = el.closest('.sqs-block');
    let sqsBlock = null;
    if (block) {
      const m = /sqs-block-([a-z-]+)/.exec([...block.classList].filter((c) => c !== 'sqs-block-content').join(' '));
      sqsBlock = m ? m[1] : null;
    }
    const sectionEl = sections.find((s) => s.contains(el));
    const section = sectionEl ? sections.filter((s) => !s.parentElement?.closest('section')).indexOf(sectionEl) + 1 : 0;

    const inCode = !!el.closest('.sqs-block-code, .sqs-block-embed, .sqs-block-html .code-block, wix-iframe, [data-testid="htmlEmbedRoot"], .wp-block-html, .elementor-widget-html');
    const platformChrome = !!el.closest('.sqs-cookie-banner-v2, .sqs-announcement-bar, #siteWrapper > header, header.header, .header-menu, .sqs-widget, #SITE_HEADER, #WIX_ADS, [id^="comp-"][data-testid="linkBar"]');

    result[sel] = { kind, label, area, near, sqsBlock, section, inCode, platformChrome };
  }
  return result;
}
