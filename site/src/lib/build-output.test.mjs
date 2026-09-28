import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { validateVisualMedia } from './visual-media.mjs';
import { VISUAL_MEDIA } from '../data/visual-media.mjs';
import { COMPANY_CERTIFICATES } from '../data/certificates.mjs';
import { SUPPORTED_LANGUAGES, allLocalizedEntries, englishInventory, localizedEntry, routeFor, uiFor } from './localization.mjs';
import { assertFactParity } from './product-facts.mjs';
import { canonicalUrl } from './routes.mjs';
import { contentText, localizeInternalLinks, normalizeBodyHeadings } from './content-routes.mjs';
import records from '../data/records.json' with { type: 'json' };
import { PRODUCT_CATEGORIES, PRODUCT_GROUPS, categoryForProduct } from './site-architecture.mjs';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function readBuiltRoute(route) {
  const path = route === '/' ? 'index.html' : `${route.replace(/^\/+|\/+$/g, '')}/index.html`;
  return readFile(new URL(`../../dist/${path}`, import.meta.url), 'utf8');
}

async function builtHtmlFiles(directory = new URL('../../dist/', import.meta.url)) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const location = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
    return entry.isDirectory() ? builtHtmlFiles(location) : entry.name.endsWith('.html') ? [location] : [];
  }));
  return files.flat();
}

function metaContent(html, name) {
  return html.match(new RegExp(`<meta name="${name}" content="([^"]*)">`))?.[1] || '';
}

function structuredData(html) {
  return html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)?.[1] || '';
}

function structuredNodes(html) {
  const value = JSON.parse(structuredData(html));
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) => item?.['@graph'] || item);
}

function visibleH1(html) {
  return contentText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
}

test('visual validation identifies missing required paths, each missing locale, and incomplete company evidence', () => {
  const publicDir = fileURLToPath(new URL('../../public/', import.meta.url));
  const sample = VISUAL_MEDIA.find(({ required, evidence }) => required && evidence !== 'decorative');
  const missingPath = '/media/missing-task-7-image.webp';
  assert.ok(validateVisualMedia({ publicDir, media: [{ ...sample, src: missingPath }], assignments: {}, certificates: [] })
    .some((error) => error.includes(sample.key) && error.includes(missingPath)));
  for (const language of SUPPORTED_LANGUAGES) {
    const alt = { ...sample.alt, [language]: '' };
    assert.ok(validateVisualMedia({ publicDir, media: [{ ...sample, alt }], assignments: {}, certificates: [] })
      .some((error) => error.includes(sample.key) && error.includes(language) && error.includes('alt')));
  }
  for (const field of ['holder', 'certificateNumber', 'scope', 'validUntil']) {
    const certificate = { ...COMPANY_CERTIFICATES[0], [field]: '' };
    assert.ok(validateVisualMedia({ publicDir, certificates: [certificate] })
      .some((error) => error.includes(certificate.key) && error.includes(field)), field);
  }
});

test('Resources closes on Escape and link activation without stealing desktop or outside focus', async () => {
  const html = await readBuiltRoute('/');
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(([, code]) => code)
    .find((code) => code.includes("'[data-site-header]'"));
  assert.ok(script, 'built navigation script');
  const listeners = new Map();
  let focused = 'resources-link';
  let expanded = 'false';
  let mobileOpen = false;
  let mobile = false;
  const summary = { focus() { focused = 'resources-summary'; } };
  const resources = { open: true, querySelector: () => summary };
  const button = {
    addEventListener: (event, handler) => listeners.set(`button:${event}`, handler),
    getAttribute: () => expanded,
    getClientRects: () => mobile ? [{}] : [],
    setAttribute: (_, value) => { expanded = value; },
    focus() { focused = 'menu-toggle'; },
  };
  const nav = {
    addEventListener: (event, handler) => listeners.set(`nav:${event}`, handler),
    querySelectorAll: () => resources.open ? [resources] : [],
    contains: (element) => element === resources,
  };
  const header = {
    querySelector: (selector) => selector === '.menu-toggle' ? button : nav,
    toggleAttribute: (_, value) => { mobileOpen = value; },
  };
  const document = {
    activeElement: { closest: () => resources },
    querySelector: () => header,
    addEventListener: (event, handler) => listeners.set(`document:${event}`, handler),
  };
  vm.runInNewContext(script, { document });
  listeners.get('document:keydown')({ key: 'Tab', preventDefault() { assert.fail('Tab must remain native'); } });
  assert.equal(resources.open, true);
  assert.equal(focused, 'resources-link');
  listeners.get('document:keydown')({ key: 'Escape' });
  assert.equal(resources.open, false, 'Escape closes the desktop disclosure');
  assert.equal(focused, 'resources-summary', 'desktop focus returns to its visible disclosure');
  document.activeElement = { closest: () => null };
  focused = 'outside-link';
  listeners.get('document:keydown')({ key: 'Escape' });
  assert.equal(focused, 'outside-link', 'Escape outside navigation leaves focus alone');
  mobile = true;
  listeners.get('button:click')();
  resources.open = true;
  assert.equal(mobileOpen, true);
  listeners.get('document:keydown')({ key: 'Escape' });
  assert.equal(resources.open, false);
  assert.equal(expanded, 'false');
  assert.equal(focused, 'menu-toggle');
  listeners.get('button:click')();
  resources.open = true;
  listeners.get('nav:click')({ target: { closest: () => ({}) } });
  assert.equal(mobileOpen, false);
  assert.equal(resources.open, false, 'following Guides or Blog also resets its disclosure');
  listeners.get('button:click')();
  resources.open = true;
  document.activeElement = { closest: () => resources };
  mobile = false;
  listeners.get('document:keydown')({ key: 'Escape' });
  assert.equal(focused, 'resources-summary', 'resizing to desktop must not focus the hidden toggle');
});

test('localized long titles and inquiry grids can shrink without clipping the page', async () => {
  const html = await readBuiltRoute(routeFor('ar', 'architecture:contact'));
  const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '';
  const missing = [
    ['inherited wrapping for long localized text', /^body\s*\{[^}]*overflow-wrap:\s*anywhere;/m],
    ['full-width shrinkable inquiry field grid', /\.corncomp-inquiry-form\s*>\s*\.form-grid\s*\{[^}]*grid-column:\s*1\s*\/\s*-1;[^}]*min-width:\s*0;/],
    ['shrinkable form labels', /\.form-grid label\s*\{[^}]*min-width:\s*0;/],
    ['scrollable mobile navigation within the viewport', /@media\s*\(max-width:\s*980px\)\s*\{[^}]*\.site-header nav\s*\{[^}]*max-height:\s*calc\(100dvh - 72px\);[^}]*overflow-y:\s*auto;/],
  ].filter(([, rule]) => !rule.test(css)).map(([name]) => name);
  if (/^body\s*\{[^}]*overflow-x:\s*hidden/m.test(css)) missing.push('page must not hide overflowing content');
  assert.deepEqual(missing, []);
});

test('redesigned media reserves dimensions and loading priority while optional media stays absent', async () => {
  let count = 0;
  for (const file of await builtHtmlFiles()) {
    const html = await readFile(file, 'utf8');
    for (const [image] of html.matchAll(/<img\b[^>]*style="[^"]*object-fit:[^>]*>/g)) {
      count += 1;
      assert.match(image, /\bwidth="[1-9]\d*"/, file.pathname);
      assert.match(image, /\bheight="[1-9]\d*"/, file.pathname);
      assert.match(image, /\bloading="(?:eager|lazy)"/, file.pathname);
      assert.match(image, /\bdecoding="async"/, file.pathname);
      if (image.includes('loading="eager"')) assert.match(image, /fetchpriority="high"/, file.pathname);
      else assert.doesNotMatch(image, /fetchpriority="high"/, file.pathname);
    }
  }
  assert.ok(count > 100, 'exercise the rendered shared media across page families');
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await readBuiltRoute(routeFor(language, 'architecture:quality'));
    const hero = html.match(/<header class="page-hero"[\s\S]*?<\/header>/)?.[0];
    assert.ok(hero);
    assert.doesNotMatch(hero, /<img\b/, `${language}: optional quality hero omitted`);
  }
});

test('all localized homepage product and factory images reserve their actual source dimensions', async () => {
  const dimensions = [
    ['261--2026-07-25-100620.png', 348, 493],
    ['164--2026-07-14-133106.png', 655, 715],
    ['107--2026-07-14-101008.png', 520, 364],
    ['be53f20b-facility-showcase-1.jpg', 2560, 1746],
  ];
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await readBuiltRoute(routeFor(language, 'home'));
    const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([image]) => image);
    for (const [source, width, height] of dimensions) {
      const matching = images.filter((image) => image.includes(source));
      assert.equal(matching.length, 1, `${language}: ${source}`);
      const [image] = matching;
      assert.ok(image.includes(`width="${width}"`), `${language}: ${source} width`);
      assert.ok(image.includes(`height="${height}"`), `${language}: ${source} height`);
      assert.match(image, /\bloading="lazy"/, language);
    }
  }
});

test('RTL, reduced motion and visible keyboard focus hooks survive in built pages', async () => {
  const html = await readBuiltRoute(routeFor('ar', 'architecture:resources'));
  assert.match(html, /<html lang="ar" dir="rtl">/);
  assert.match(html, /\[dir="rtl"\] \.page-hero--split\s*\{\s*direction:\s*rtl;/);
  assert.match(html, /\[dir="rtl"\] \.page-hero__media img[^}]*transform:\s*none;/);
  assert.doesNotMatch(html, /scaleX\(\s*-1\s*\)|row-reverse/);
  assert.match(html, /:focus-visible\s*\{[^}]*outline:\s*3px solid/);
  assert.match(html, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?scroll-behavior:\s*auto\s*!important;[^}]*transition-duration:\s*\.01ms\s*!important;[^}]*animation-duration:\s*\.01ms\s*!important;/);
});

test('the built homepage includes the global site styles', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /\.content-shell\s*\{/);
});

test('the built homepage includes an accessible mobile navigation control', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /<button[^>]+aria-controls="primary-navigation"[^>]+aria-expanded="false"/);
  assert.match(html, /<nav[^>]+id="primary-navigation"/);
});

test('the compact navigation covers tablet widths where desktop labels wrap', async () => {
  const header = await readFile(new URL('../components/Header.astro', import.meta.url), 'utf8');

  assert.match(header, /@media \(max-width: 980px\)/);
});

test('the header renders 16px navigation with a larger responsive brand mark', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');
  const stylesheet = html.match(/<link rel="stylesheet" href="([^"]+\.css)"/)?.[1];
  assert.ok(stylesheet, 'built header stylesheet');
  const css = await readFile(new URL(`../../dist${stylesheet}`, import.meta.url), 'utf8');

  assert.match(css, /\.header-inner[^,{]*\{[^}]*min-height:100px/);
  assert.match(css, /\.brand[^,{]* img[^,{]*\{[^}]*width:116px;height:78px/);
  assert.match(css, /nav[^,{]*\{[^}]*font-size:1rem/);
  assert.match(css, /@media\(max-width:980px\)[\s\S]*?\.brand[^,{]* img[^,{]*\{[^}]*width:88px;height:56px/);
  assert.match(css, /@media\(max-width:980px\)[\s\S]*?nav[^,{]* a[^,{]*\{[^}]*font-size:1rem/);
});

test('the global navigation exposes every migrated primary section and language choice', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  for (const route of ['/products/', '/custom-packaging/', '/applications/', '/resources/', '/quality/', '/about/', '/contact/']) {
    assert.match(html, new RegExp(`href="${route}"`));
  }
  for (const language of ['English', 'Français', 'Español', 'العربية']) assert.match(html, new RegExp(language));
  assert.match(html, /class="[^\"]*product-menu[^\"]*"/);
});

test('Resources is a keyboard-operable disclosure with localized Guides and Blog links', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await readBuiltRoute(routeFor(language, 'home'));
    const header = html.match(/<header\b[^>]*>[\s\S]*?<\/header>/)?.[0] || '';
    const resources = header.match(/<details class="resources-menu"[^>]*>[\s\S]*?<\/details>/)?.[0] || '';
    const guidesRoute = routeFor(language, 'architecture:resources');
    const blogRoute = language === 'en' ? '/blog/' : `/${language}/blog/`;

    assert.match(resources, /<summary\b[^>]*>[^<]+<\/summary>/, `${language}: focusable disclosure summary`);
    assert.match(resources, new RegExp(`href="${escapeRegExp(guidesRoute)}"`), `${language}: Guides link`);
    assert.match(resources, new RegExp(`href="${escapeRegExp(blogRoute)}"`), `${language}: Blog link`);
  }
});

test('the footer includes a direct localized Blog archive link', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await readBuiltRoute(routeFor(language, 'home'));
    const footer = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0] || '';
    const blogRoute = language === 'en' ? '/blog/' : `/${language}/blog/`;

    assert.match(footer, new RegExp(`<a href="${escapeRegExp(blogRoute)}"[^>]*>`), `${language}: direct Blog link`);
  }
});

test('the footer preserves company contact, social, copyright and floating inquiry actions', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /No\.2 Building, No\.3 Wanquanhe Road/);
  assert.match(html, /0086-574-86961222/);
  assert.match(html, /\+65 8160 3123/);
  assert.match(html, /\+86 138 0663 2002/);
  assert.match(html, /inquiry@corn-comp\.com/);
  assert.doesNotMatch(html, /inquiry@corncomp\.com/);
  assert.match(html, /facebook\.com\/profile\.php/);
  assert.match(html, /instagram\.com\/zxh_0927/);
  assert.match(html, /linkedin\.com\/in\/sam-zhou-431ab9424/);
  assert.match(html, /Copyright © 2026 Ningbo Corncomp Tech Co\., Ltd\. All rights reserved\./);
  assert.match(html, /class="[^\"]*floating-whatsapp[^\"]*"/);
  assert.match(html, /class="[^\"]*floating-contact[^\"]*"/);
});

test('the homepage publishes the current inquiry address in organization schema', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /"email":"inquiry@corn-comp\.com"/);
});

test('new product pages group the title, image, breadcrumb and contextual quote action', async () => {
  const html = await readFile(
    new URL('../../dist/products/food-boxes-containers/wrap-boxes/cardboard-open-wrap-cup/index.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /<div class="product-lead">/);
  assert.match(html, /class="[^"]*product-summary[^"]*"/);
  assert.match(html, /class="[^"]*product-media[^"]*"/);
  assert.match(html, /href="\/products\/food-boxes-containers\/wrap-boxes\/"/);
  assert.match(html, /href="\/contact\/\?product=/);
  assert.match(html, /"@type":"Product"/);
});

test('every product group and category has a real hero and image-led inventory cards in all languages', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    for (const directory of [...PRODUCT_GROUPS, ...PRODUCT_CATEGORIES]) {
      const key = `architecture:${directory.route.replace(/^\/|\/$/g, '')}`;
      const html = await readBuiltRoute(routeFor(language, key));
      const hero = html.match(/<header class="[^"]*page-hero[^"]*"[\s\S]*?<\/header>/)?.[0] || '';
      assert.match(hero, /<img\b[^>]*alt="[^"]+"[^>]*loading="eager"/, `${language}:${key}:hero`);
      const cards = [...html.matchAll(/<article class="editorial-card">[\s\S]*?<\/article>/g)].map(([card]) => card);
      const expected = directory.group
        ? englishInventory().filter((item) => item.type === 'product' && categoryForProduct(item.slug)?.slug === directory.slug)
        : PRODUCT_CATEGORIES.filter((item) => item.group === directory.slug);
      assert.equal(cards.length, expected.length, `${language}:${key}:inventory`);
      expected.forEach((item, index) => {
        const itemKey = item.contentKey || `architecture:${item.route.replace(/^\/|\/$/g, '')}`;
        assert.ok(cards[index].includes(`href="${routeFor(language, itemKey)}"`), itemKey);
        assert.match(cards[index], /<img\b[^>]*alt="[^"]+"[^>]*loading="lazy"/, itemKey);
      });
    }
  }
});

test('all product primary and related images reserve space and retain localized alt text', async () => {
  for (const product of englishInventory().filter((item) => item.type === 'product')) {
    for (const language of SUPPORTED_LANGUAGES) {
      const html = await readBuiltRoute(routeFor(language, product.contentKey));
      assert.doesNotThrow(() => assertFactParity(product, html), `${language}:${product.slug}:facts`);
      assert.equal((html.match(/<table\b/g) || []).length, (product.body.match(/<table\b/g) || []).length, `${language}:${product.slug}:catalogue tables`);
      const lead = html.match(/<figure class="featured-media product-media">[\s\S]*?<\/figure>/)?.[0] || '';
      const image = lead.match(/<img\b[^>]*>/)?.[0] || '';
      const alt = language === 'en' ? product.featuredMedia.alt : localizedEntry(language, product.contentKey).alt;
      assert.ok(alt?.trim(), `${language}:${product.slug}:source alt`);
      assert.equal(contentText(image.match(/alt="([^"]*)"/)?.[1] || ''), alt, `${language}:${product.slug}:alt`);
      assert.match(image, /width="[1-9]\d*"/, product.slug);
      assert.match(image, /height="[1-9]\d*"/, product.slug);
      assert.match(image, /loading="eager"/);
      const related = html.match(/<section class="related-products"[\s\S]*?<\/section>/)?.[0] || '';
      for (const [relatedImage] of related.matchAll(/<img\b[^>]*>/g)) {
        assert.match(relatedImage, /alt="[^"]+"/);
        assert.match(relatedImage, /width="[1-9]\d*"/);
        assert.match(relatedImage, /loading="lazy"/);
      }
    }
  }
});

test('assigned product context is localized and distinguishes company documents from item certification', async () => {
  const labels = { en: 'Company documents and item scope', fr: 'Documents de l’entreprise et portée par article', es: 'Documentos de la empresa y alcance por artículo', ar: 'وثائق الشركة ونطاق الصنف' };
  for (const [language, heading] of Object.entries(labels)) {
    for (const [slug, asset] of [['kraft-paper-bowl', '239-salad-bowl-real-photo'], ['bendy', '843-corncomp-homepage-hero-drink']]) {
      const html = await readBuiltRoute(routeFor(language, `product:${slug}`));
      const context = html.match(/<section class="product-evidence"[\s\S]*?<\/section>/)?.[0] || '';
      assert.ok(context.includes(heading), `${language}:${slug}:scope heading`);
      assert.ok(context.includes(asset), `${language}:${slug}:assigned context`);
      assert.ok(context.includes('293-facility-photo-new.webp'), `${language}:${slug}:factory context`);
      assert.ok(context.includes(`href="${routeFor(language, 'architecture:quality')}"`));
      assert.equal((context.match(/<figure\b/g) || []).length, 2);
      for (const [image] of context.matchAll(/<img\b[^>]*>/g)) assert.match(image, /alt="[^"]+"[^>]*loading="lazy"/);
      assert.doesNotMatch(context, /all (?:products|items|SKUs) (?:are )?(?:certified|FSC|BPI)|BPI-certified bowl/i);
      if (language !== 'en') assert.ok(context.includes(localizedEntry(language, `product:${slug}`).documentScope));
    }
  }
  const unassigned = await readBuiltRoute('/products/food-boxes-containers/wrap-boxes/cardboard-open-wrap-cup/');
  assert.doesNotMatch(unassigned, /<section class="product-evidence"/);
});

test('mobile product specifications scroll inside a shrinkable content column', async () => {
  const html = await readBuiltRoute('/products/food-boxes-containers/wrap-boxes/cardboard-open-wrap-cup/');

  assert.match(html, /\.product-detail-layout\s*>\s*\.wordpress-content\s*\{\s*min-width:\s*0;/);
  assert.match(html, /\.wordpress-content table\s*\{[^}]*max-width:\s*100%;[^}]*overflow-x:\s*auto;/);
});

test('hidden inquiry honeypots cannot expand RTL page width', async () => {
  const html = await readBuiltRoute('/ar/%D8%A7%D8%AA%D8%B5%D9%84-%D8%A8%D9%86%D8%A7/');

  assert.match(html, /\.honeypot\s*\{[^}]*width:\s*1px;[^}]*height:\s*1px;[^}]*overflow:\s*hidden;[^}]*clip-path:\s*inset\(50%\);/);
  assert.doesNotMatch(html, /\.honeypot\s*\{[^}]*left:\s*-10000px/);
});

test('localized contact honeypots stay outside the accessibility tree', async () => {
  for (const route of ['/contact/', '/fr/contactez-nous/', '/es/contactenos/', '/ar/%D8%A7%D8%AA%D8%B5%D9%84-%D8%A8%D9%86%D8%A7/']) {
    const html = await readBuiltRoute(route);

    assert.match(html, /<label class="honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"><\/label>/);
  }
});

test('direct editorial images stay inside the localized content column', async () => {
  const html = await readBuiltRoute('/ar/%D8%AA%D9%88%D8%AC%D9%8A%D9%87-%D8%A7%D9%84%D8%A7%D8%AA%D8%AD%D8%A7%D8%AF-%D8%A7%D9%84%D8%A3%D9%88%D8%B1%D9%88%D8%A8%D9%8A-%D8%A8%D8%B4%D8%A3%D9%86-%D8%A7%D9%84%D8%A8%D9%84%D8%A7%D8%B3%D8%AA%D9%8A/');

  assert.match(html, /\.wordpress-content\s*>\s*img\s*\{[^}]*max-width:\s*100%;/);
});

test('product schema publishes readable names and only truthful item identifiers', async () => {
  const singleItemHtml = await readFile(
    new URL('../../dist/products/food-boxes-containers/pizza-slice-boxes/brown-triangle-box-pla-window/index.html', import.meta.url),
    'utf8',
  );
  const multiItemHtml = await readFile(
    new URL('../../dist/products/food-boxes-containers/wrap-boxes/cardboard-open-wrap-cup/index.html', import.meta.url),
    'utf8',
  );
  const singleItemSchema = structuredData(singleItemHtml);
  const multiItemSchema = structuredData(multiItemHtml);

  assert.match(singleItemSchema, /"sku":"CC01TRIWINK"/);
  assert.match(singleItemSchema, /"name":"Item number","value":"CC01TRIWINK"/);
  assert.match(multiItemSchema, /"name":"Kraft Burrito Sleeve – 4 Sizes"/);
  assert.doesNotMatch(multiItemSchema, /&#8211;/);
  for (const itemNumber of ['CC01OWC100K', 'CC01OWC5.5K', 'CC01OWC135K', 'CC01OWC160K']) {
    assert.match(multiItemSchema, new RegExp(`"name":"Item number","value":"${itemNumber.replaceAll('.', '\\.')}"`));
  }
  assert.doesNotMatch(multiItemSchema, /"sku":"CC01OWC/);
});

test('new category pages expose a labelled responsive product archive and buying guidance', async () => {
  const html = await readFile(
    new URL('../../dist/products/foodservice-supplies/disposable-cutlery/index.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /<section[^>]+class="content-shell category-archive"[^>]+aria-label="Disposable Cutlery"/);
  assert.match(html, /<h1>Disposable Cutlery<\/h1>/);
  assert.match(html, /Built for B2B sourcing/);
  assert.match(html, /href="\/products\/foodservice-supplies\/disposable-cutlery\/cpla-cutlery\/"/);
});

test('the products hub exposes the three approved product groups', async () => {
  const html = await readFile(new URL('../../dist/products/index.html', import.meta.url), 'utf8');

  assert.match(html, /Paper Food Packaging for Wholesale/);
  const groups = html.match(/<div class="architecture-grid product-group-grid">([\s\S]*?)<\/div><section/)?.[1] || '';
  assert.equal((groups.match(/class="editorial-card"/g) || []).length, 3);
  for (const route of [
    '/products/cups-bowls/',
    '/products/food-boxes-containers/',
    '/products/foodservice-supplies/',
  ]) assert.match(html, new RegExp(`href="${route}"`));
});

test('the blog restores the English insight archive', async () => {
  const html = await readFile(new URL('../../dist/blog/index.html', import.meta.url), 'utf8');

  assert.match(html, /class="insight-grid"/);
  assert.match(html, /href="\/bpi-vs-fsc-certification\/"/);
  assert.doesNotMatch(html, /href="\/fr\/quest-ce-que/);
});

test('blog articles publish article, breadcrumb and social metadata', async () => {
  const html = await readFile(
    new URL('../../dist/eu-single-use-plastics-directive-explained/index.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /"mainEntityOfPage":"https:\/\/corn-comp\.com\/eu-single-use-plastics-directive-explained\/"/);
  assert.match(html, /"publisher":\{"@id":"https:\/\/corn-comp\.com\/#organization"\}/);
});

test('all legacy blog records remain discoverable through the four featured archives', async () => {
  const legacyPosts = records.filter(({ type }) => type === 'post');
  const posts = englishInventory().filter(({ type }) => type === 'post');
  assert.equal(legacyPosts.length, 19, 'legacy migration inventory');
  assert.equal(posts.length, 5, 'stable shared post keys');
  assert.equal(allLocalizedEntries().filter(({ contentKey }) => contentKey.startsWith('post:')).length, 20, 'synchronized article routes');
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await readBuiltRoute(language === 'en' ? '/blog/' : `/${language}/blog/`);
    const featured = html.match(/<section class="blog-featured"[^>]*>[\s\S]*?<\/section>/)?.[0] || '';
    assert.ok(featured.includes(`href="${routeFor(language, posts[0].contentKey)}"`), `${language}: first source-order article featured`);
    assert.match(featured, /<img[^>]+loading="eager"/, `${language}: featured image priority`);
    const grid = html.match(/<div class="insight-grid">([\s\S]*?)<\/section>/)?.[1] || '';
    assert.equal((grid.match(/class="editorial-card"/g) || []).length, 4, `${language}: remaining image cards`);
    for (const post of posts) {
      assert.ok(html.includes(`href="${routeFor(language, post.contentKey)}"`), `${language}:${post.contentKey}`);
      assert.ok(html.includes(`src="${post.featuredMedia.localPath}"`), `${language}: original featured image`);
    }
  }
});

test('blog articles retain imported content and expose working heading navigation and same-language related cards', async () => {
  const labels = { en: ['On this page', 'Related articles'], fr: ['Dans cet article', 'Articles connexes'], es: ['En este artículo', 'Artículos relacionados'], ar: ['في هذه الصفحة', 'مقالات ذات صلة'] };
  const posts = englishInventory().filter(({ type }) => type === 'post');
  for (const language of SUPPORTED_LANGUAGES) {
    for (const post of posts) {
      const entry = localizedEntry(language, post.contentKey);
      const html = await readBuiltRoute(entry.route);
      const hero = html.match(/<header class="blog-article__hero">[\s\S]*?<\/header>/)?.[0] || '';
      assert.ok(hero.includes(`src="${post.featuredMedia.localPath}"`), `${entry.route}: cover image`);
      const coverImage = hero.match(/<img\b[^>]*>/)?.[0] || '';
      assert.match(coverImage, /width="\d+"/);
      assert.match(coverImage, /height="\d+"/);
      assert.match(coverImage, /loading="eager"/);
      const imageAlt = language === 'en' ? post.featuredMedia.alt : entry.alt;
      assert.ok(contentText(hero.match(/<img[^>]+alt="([^"]*)"/)?.[1]).includes(imageAlt), `${entry.route}: localized cover alt`);
      const original = normalizeBodyHeadings(localizeInternalLinks(language === 'en' ? post.body : entry.bodyHtml, language, entry.route));
      const body = html.match(/<div class="wordpress-content blog-article__body">([\s\S]*?)<\/div>\s*<\/div>/)?.[1] || '';
      assert.equal(contentText(body), contentText(original), `${entry.route}: imported article copy intact`);
      for (const [, href] of original.matchAll(/href="([^"]+)"/g)) assert.ok(body.includes(`href="${href}"`), `${entry.route}: source and internal links intact`);
      const headings = [...body.matchAll(/<h2\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)];
      const navigation = html.match(/<nav class="article-toc"[^>]*>[\s\S]*?<\/nav>/)?.[0] || '';
      assert.equal(headings.length, (original.match(/<h2\b/g) || []).length, `${entry.route}: every section addressable`);
      assert.ok(navigation.includes(labels[language][0]), `${entry.route}: localized contents label`);
      for (const [, id, title] of headings) assert.ok(navigation.includes(`href="#${id}"`) && contentText(navigation).includes(contentText(title)), `${entry.route}: contents link target`);
      const related = html.match(/<section class="blog-related"[^>]*>[\s\S]*?<\/section>/)?.[0] || '';
      assert.ok(related.includes(labels[language][1]));
      const expected = posts.filter(({ contentKey }) => contentKey !== post.contentKey).slice(0, 3).map(({ contentKey }) => routeFor(language, contentKey));
      assert.deepEqual([...related.matchAll(/<a href="([^"]+)"/g)].map(([, href]) => href), expected);
    }
  }
});

test('buyer and company page families render assigned media in every language', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    for (const key of ['products', 'custom-packaging', 'applications', 'resources', 'about']) {
      const html = await readBuiltRoute(routeFor(language, `architecture:${key}`));
      const hero = html.match(/<header class="[^"]*page-hero[^"]*"[\s\S]*?<\/header>/)?.[0] || '';
      assert.match(hero, /<img\b[^>]*loading="eager"/, `${language}:${key} hero`);
      assert.match(html, /class="editorial-card"[\s\S]*?<img\b[^>]*loading="lazy"/, `${language}:${key} cards`);
    }
  }
});

test('application landing pages do not repeat the hero image in their cards', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await readBuiltRoute(routeFor(language, 'architecture:applications'));
    const hero = html.match(/<header class="[^"]*page-hero[^"]*"[\s\S]*?<\/header>/)?.[0] || '';
    const heroSrc = hero.match(/<img\b[^>]*src="([^"]+)"/)?.[1];
    const cards = html.match(/<div class="architecture-grid linked-page-grid editorial-card-grid">([\s\S]*?)<\/div><div class="architecture-grid content-section-grid/)?.[1] || '';
    const cardSources = [...cards.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(([, src]) => src);

    assert.ok(heroSrc, `${language}: application hero image`);
    assert.equal(cardSources.length, 3, `${language}: application card images`);
    assert.equal(new Set([heroSrc, ...cardSources]).size, 4, `${language}: unique application imagery`);
  }
});

test('Quality places its full-width title before certificates, factory evidence, and separate material documents', async () => {
  const html = await readBuiltRoute('/quality/');
  const heading = html.indexOf('<h1>');
  const company = html.indexOf('<section class="company-certificates"');
  const factory = html.indexOf('<section class="quality-factory-evidence"');
  const supply = html.indexOf('<section class="supply-chain-documents"');
  assert.ok(heading > 0 && company > heading && factory > company && supply > factory);
  const hero = html.match(/<header class="[^"]*page-hero[^"]*"[\s\S]*?<\/header>/)?.[0] || '';
  assert.doesNotMatch(hero, /page-hero--split|<img\b/);
  assert.match(html, /\.certificate-gallery__grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/);
});

test('Resources features one guide and links the remaining guides and three localized articles', async () => {
  const labels = { en: ['Featured guide', 'Latest articles'], fr: ['Guide à la une', 'Articles récents'], es: ['Guía destacada', 'Artículos recientes'], ar: ['الدليل المميز', 'أحدث المقالات'] };
  for (const [language, [featured, latest]] of Object.entries(labels)) {
    const html = await readBuiltRoute(routeFor(language, 'architecture:resources'));
    assert.equal((html.match(/class="featured-guide"/g) || []).length, 1);
    assert.ok(html.includes(featured) && html.includes(latest), language);
    const articles = html.match(/<section class="latest-articles"[\s\S]*?<\/section>/)?.[0] || '';
    assert.equal((articles.match(/class="editorial-card"/g) || []).length, 3);
    for (const slug of ['us-state-plastic-packaging-laws-explained', 'how-to-verify-supplier-sustainability-certifications', 'eu-single-use-plastics-directive-explained']) {
      assert.ok(articles.includes(`href="${routeFor(language, `post:${slug}`)}"`), `${language}:${slug}`);
    }
    for (const slug of ['paper-cup-sizes', 'custom-printed-paper-cups', 'food-packaging-certifications']) {
      assert.ok(html.includes(`href="${routeFor(language, `architecture:resources/guides/${slug}`)}"`));
    }
  }
});

test('About alternates real evidence and Contact keeps one image beside the complete inquiry contract', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const about = await readBuiltRoute(routeFor(language, 'architecture:about'));
    assert.match(about, /class="evidence-split evidence-split--reverse"/);
    const contact = await readBuiltRoute(routeFor(language, 'architecture:contact'));
    const panel = contact.match(/<section class="content-shell architecture-page contact-page">[\s\S]*?<\/section>/)?.[0] || '';
    assert.equal((panel.match(/<img\b/g) || []).length, 1, language);
    assert.match(panel, /class="contact-support"/);
    assert.match(panel, /<form[^>]*action="\/api\/inquiry" method="post"/);
    for (const name of ['name', 'email', 'company', 'country', 'phone', 'quantity', 'productName', 'productSku', 'category', 'message', 'sourcePath', 'website']) {
      assert.ok(panel.includes(`name="${name}"`), `${language}:${name}`);
    }
    assert.match(panel, /type="hidden" name="sourcePath"/);
    assert.match(panel, /params.get\('source'\) \|\| document.referrer \|\| window.location.pathname/);
    assert.ok(panel.includes('inquiry@corn-comp.com'));
    if (language === 'ar') assert.match(contact, /<html lang="ar" dir="rtl">/);
  }
});

test('the About hero reserves image space and prioritizes its real factory image', async () => {
  const html = await readBuiltRoute('/about/');
  const hero = html.match(/<header class="[^"]*page-hero[^"]*"[\s\S]*?<\/header>/)?.[0] || '';
  const image = hero.match(/<img\b[^>]*>/)?.[0] || '';
  assert.match(image, /\bwidth="\d+"/);
  assert.match(image, /\bheight="\d+"/);
  assert.match(image, /\bloading="eager"/);
  assert.match(image, /alt="[^"]+"/);
});

test('the Quality page separates certificate evidence from material documents', async () => {
  const html = await readBuiltRoute('/quality/');
  const company = html.match(/<section class="company-certificates"[\s\S]*?<\/section>/)?.[0] || '';
  const supplyChain = html.match(/<section class="supply-chain-documents"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(company, /Ningbo Corncomp Tech Co., Ltd\./);
  assert.match(company, /01526Q60104R001/);
  assert.match(company, /Printed paper straws with maximum grammage 352 g\/m²/);
  assert.match(company, /2027-09-30/);
  const image = company.match(/<img\b[^>]*>/)?.[0] || '';
  assert.match(image, /\bwidth="\d+"/);
  assert.match(image, /\bheight="\d+"/);
  assert.match(image, /\bloading="lazy"/);
  assert.match(supplyChain, /Hangzhou POLYFUL Advanced Material Co., Ltd\./);
  assert.match(supplyChain, /Ningbo Millionpack Co., Ltd\./);
  assert.doesNotMatch(company, /Hangzhou POLYFUL|Ningbo Millionpack/);
  assert.match(supplyChain, /href="\/documents\/certificates\/din-straw-material-7w0517\.pdf"/);
});

test('the Quality page uses lazy decorative cards and omits unassigned media', async () => {
  const html = await readBuiltRoute('/quality/');
  const guideCard = html.match(/<article class="[^"]*editorial-card[^"]*"[\s\S]*?<\/article>/)?.[0] || '';
  const image = guideCard.match(/<img\b[^>]*>/)?.[0] || '';
  assert.match(image, /\balt(?:="")?(?=\s|>)/);
  assert.match(image, /\bloading="lazy"/);
  const documentCard = [...html.matchAll(/<article class="[^"]*editorial-card[^"]*"[\s\S]*?<\/article>/g)].map(([card]) => card).find((card) => card.includes('Request Documents')) || '';
  assert.match(documentCard, /Request Documents/);
  assert.doesNotMatch(documentCard, /<img\b/);
});

test('the Quality editorial cards retain two desktop columns', async () => {
  const html = await readBuiltRoute('/quality/');
  const css = await readFile(new URL('../styles/global.css', import.meta.url), 'utf8');
  assert.match(html, /class="architecture-grid linked-page-grid editorial-card-grid"/);
  const baseRule = css.indexOf('.architecture-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));');
  const cardRule = css.indexOf('.editorial-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr));');
  assert.ok(baseRule >= 0 && cardRule > baseRule, 'the two-column card rule must follow the equally specific architecture grid rule');
});

test('buyer guides publish reviewed evidence tables and official sources', async () => {
  const guides = [
    ['paper-cup-sizes', 'Cup size specification checklist'],
    ['custom-printed-paper-cups', 'Custom print approval checklist'],
    ['food-packaging-certifications', 'Certificate review checklist'],
  ];

  for (const [slug, caption] of guides) {
    const html = await readFile(new URL(`../../dist/resources/guides/${slug}/index.html`, import.meta.url), 'utf8');
    assert.match(html, /Prepared by Corncomp/);
    assert.match(html, /Last reviewed: 23 September 2026/);
    assert.match(html, new RegExp(`<caption>${caption}</caption>`));
    assert.match(html, /class="guide-sources"/);
    assert.match(html, /"dateModified":"2026-09-23"/);
  }
});

test('blog archives publish reciprocal alternates and localized shop archives are not built', async () => {
  const routes = { en: '/blog/', fr: '/fr/blog/', es: '/es/blog/', ar: '/ar/blog/' };
  for (const [language, route] of Object.entries(routes)) {
    const html = await readBuiltRoute(route);
    for (const [alternateLanguage, alternateRoute] of Object.entries(routes)) {
      assert.match(html, new RegExp(`hreflang="${alternateLanguage}" href="${escapeRegExp(canonicalUrl(alternateRoute))}"`), `${language}:${alternateLanguage}`);
    }
    assert.match(html, /hreflang="x-default" href="https:\/\/corn-comp\.com\/blog\/"/);
  }
  for (const language of ['fr', 'es', 'ar']) await assert.rejects(readBuiltRoute(`/${language}/shop/`), { code: 'ENOENT' });
});

test('blog cards stack their image above the title on phones', async () => {
  const css = await readFile(new URL('../styles/global.css', import.meta.url), 'utf8');

  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.insight-card a \{ display: flex; flex-direction: column; \}/);
});

test('the contact page presents the contextual inquiry form in a responsive layout', async () => {
  const html = await readFile(new URL('../../dist/contact/index.html', import.meta.url), 'utf8');

  assert.match(html, /class="[^"]*contact-layout[^"]*"/);
  assert.match(html, /<form[^>]+action="\/api\/inquiry"[^>]+method="post"/);
  for (const name of ['company', 'country', 'productName', 'productSku', 'category', 'sourcePath']) assert.match(html, new RegExp(`name="${name}"`));
  assert.match(html, /URLSearchParams/);
});

test('the homepage presents the manufacturer proof and approved product pathways', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /Paper Food Packaging, Built for Real Service/);
  assert.match(html, /8,000 m²/);
  assert.match(html, /href="\/products\/cups-bowls\/"/);
  assert.match(html, /href="\/about\/factory\/"/);
  assert.match(html, /href="\/contact\/"/);
});

test('localized homepages render localized content and preserve manufacturing proof', async () => {
  for (const language of ['fr', 'es', 'ar']) {
    const content = localizedEntry(language, 'home');
    const html = await readBuiltRoute(routeFor(language, 'home'));

    assert.match(html, new RegExp(`<html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">`));
    assert.match(html, new RegExp(escapeRegExp(content.hero.heading)));
    assert.match(html, new RegExp(escapeRegExp(content.hero.secondaryLabel)));
    assert.match(html, new RegExp(escapeRegExp(content.proof[0][0])));
    assert.match(html, new RegExp(escapeRegExp(content.proof[3][0])));
    assert.doesNotMatch(html, /Explore products/);
  }
});

test('localized shared UI renders the reviewed locale labels', async () => {
  for (const language of ['fr', 'es', 'ar']) {
    const html = await readBuiltRoute(routeFor(language, 'home'));
    const ui = uiFor(language);
    const footer = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0] || '';

    for (const key of ['menu', 'allProducts', 'contactUs', 'analyticsSettings', 'allowAnalytics', 'declineAnalytics']) {
      assert.match(html, new RegExp(escapeRegExp(ui[key])), `${language} homepage is missing ui.${key}`);
    }
    for (const contentKey of ['architecture:products', 'architecture:custom-packaging', 'architecture:applications', 'architecture:quality', 'architecture:resources', 'architecture:about', 'architecture:contact']) {
      assert.match(footer, new RegExp(`href="${escapeRegExp(routeFor(language, contentKey))}"`), `${language} footer is missing ${contentKey}`);
    }
  }
});

test('shared layout labels and Open Graph locales match every language', async () => {
  const ogLocales = { en: 'en_US', fr: 'fr_FR', es: 'es_ES', ar: 'ar_AR' };
  const fields = ['brandHomeLabel', 'primaryNavigationLabel', 'socialMediaLabel', 'addressHeading', 'footerNavigationLabel', 'copyrightLabel', 'analyticsConsentHeading', 'analyticsConsentBody'];
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await readBuiltRoute(routeFor(language, 'home'));
    const ui = uiFor(language);
    for (const field of fields) assert.match(html, new RegExp(escapeRegExp(ui[field])), `${language}:ui.${field}`);
    assert.match(html, new RegExp(`<meta property="og:locale" content="${ogLocales[language]}">`), `${language}:og:locale`);
  }
});

test('every synchronized canonical route has a built page', async () => {
  assert.equal(allLocalizedEntries().length, 340, 'synchronized route count');
  const sources = new Map(englishInventory().map((source) => [source.contentKey, source]));
  for (const { language, contentKey, route } of allLocalizedEntries()) {
    const html = await readBuiltRoute(route);
    assert.match(html, new RegExp(`<html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">`), contentKey);
    assert.match(html, new RegExp(`<link rel="canonical" href="${escapeRegExp(canonicalUrl(route))}">`), `${language}:${contentKey}:canonical`);
    for (const alternateLanguage of SUPPORTED_LANGUAGES) {
      assert.match(html, new RegExp(`hreflang="${alternateLanguage}" href="${escapeRegExp(canonicalUrl(routeFor(alternateLanguage, contentKey)))}"`), `${language}:${contentKey}:${alternateLanguage}`);
    }
    assert.match(html, new RegExp(`hreflang="x-default" href="${escapeRegExp(canonicalUrl(routeFor('en', contentKey)))}"`), `${language}:${contentKey}:x-default`);
    const source = sources.get(contentKey);
    const schemaType = source.type === 'product' ? 'Product'
      : source.type === 'post' || source.kind === 'guide' ? 'Article'
        : source.type === 'architecture' ? (source.kind === 'product-category' ? 'ItemList' : 'WebPage') : null;
    if (schemaType) {
      const schema = structuredNodes(html).find((node) => node?.['@type'] === schemaType);
      assert.ok(schema, `${language}:${contentKey}:${schemaType}`);
      assert.equal(contentText(schema.name || schema.headline), visibleH1(html), `${language}:${contentKey}:schema name`);
    }
  }
});

test('localized built-page samples render reviewed content, reciprocal SEO and matching schema names', async () => {
  const samples = [
    ['architecture:products/cups-bowls', 'WebPage'],
    ['architecture:products/cups-bowls/paper-cups', 'ItemList'],
    ['product:kraft-paper-bowl', 'Product'],
    ['architecture:resources/guides/paper-cup-sizes', 'Article'],
    ['post:eu-single-use-plastics-directive-explained', 'Article'],
    ['architecture:contact', 'WebPage'],
  ];
  for (const language of SUPPORTED_LANGUAGES) {
    for (const [contentKey, schemaType] of samples) {
      const entry = localizedEntry(language, contentKey);
      const html = await readBuiltRoute(entry.route);
      assert.equal(visibleH1(html), contentText(entry.title), `${language}:${contentKey}:h1`);
      assert.match(html, new RegExp(`<link rel="canonical" href="${escapeRegExp(canonicalUrl(entry.route))}">`));
      for (const alternateLanguage of SUPPORTED_LANGUAGES) {
        assert.match(html, new RegExp(`hreflang="${alternateLanguage}" href="${escapeRegExp(canonicalUrl(routeFor(alternateLanguage, contentKey)))}"`), `${language}:${contentKey}:${alternateLanguage}`);
      }
      assert.match(html, new RegExp(`hreflang="x-default" href="${escapeRegExp(canonicalUrl(routeFor('en', contentKey)))}"`));
      const schema = structuredNodes(html).find((node) => node?.['@type'] === schemaType);
      assert.ok(schema, `${language}:${contentKey}:${schemaType}`);
      assert.equal(contentText(schema.name || schema.headline), visibleH1(html), `${language}:${contentKey}:schema name`);
    }
  }
});

test('localized product samples preserve immutable English product facts and translated display values', async () => {
  const source = englishInventory().find(({ contentKey }) => contentKey === 'product:kraft-paper-bowl');
  for (const language of ['fr', 'es', 'ar']) {
    const html = await readBuiltRoute(routeFor(language, source.contentKey));
    assert.doesNotThrow(() => assertFactParity(source, html), language);
    const translatedValue = Object.values(uiFor(language).specificationValues).find((value) => value.includes('300'));
    if (translatedValue) assert.match(html, new RegExp(escapeRegExp(translatedValue)), language);
  }
});

test('all product variants preserve summaries and the approved buying layout', async () => {
  const products = englishInventory().filter(({ type }) => type === 'product');
  let englishExcerpts = 0;
  let detailLayouts = 0;
  let buyingNotes = 0;
  let localizedEnglishExcerpts = 0;

  for (const product of products) {
    for (const language of SUPPORTED_LANGUAGES) {
      const html = await readBuiltRoute(routeFor(language, product.contentKey));
      englishExcerpts += language === 'en' ? (html.match(/class="product-excerpt"/g) || []).length : 0;
      detailLayouts += (html.match(/class="product-detail-layout"/g) || []).length;
      buyingNotes += (html.match(/class="buying-note"/g) || []).length;
      if (language !== 'en' && product.excerpt && html.includes(contentText(product.excerpt))) localizedEnglishExcerpts += 1;
    }
  }

  assert.equal(englishExcerpts, 44);
  assert.equal(detailLayouts, 176);
  assert.equal(buyingNotes, 176);
  assert.equal(localizedEnglishExcerpts, 0);
});

test('visible main content never double-escapes WordPress numeric entities', async () => {
  const failures = [];
  for (const file of await builtHtmlFiles()) {
    const html = await readFile(file, 'utf8');
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
    if (/&amp;#(?:x[\da-f]+|\d+);/i.test(main)) failures.push(file.pathname);
  }
  assert.deepEqual(failures, []);
});

test('localized contact pages preserve field names and localize visible form labels', async () => {
  const visibleName = { fr: 'Nom', es: 'Nombre', ar: 'الاسم' };
  for (const language of ['fr', 'es', 'ar']) {
    const html = await readBuiltRoute(routeFor(language, 'architecture:contact'));
    for (const name of ['name', 'email', 'company', 'country', 'phone', 'quantity', 'productName', 'productSku', 'category', 'message', 'sourcePath']) {
      assert.match(html, new RegExp(`name="${name}"`), `${language}:${name}`);
    }
    assert.match(html, new RegExp(`>${escapeRegExp(visibleName[language])}<input name="name"`));
    assert.doesNotMatch(html, />Business email<input/);
  }
});

test('analytics remains disabled until the visitor makes a consent choice', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /G-R1SHNYEBN8/);
  assert.match(html, /data-analytics-consent/);
  assert.match(html, /Allow analytics/);
  assert.match(html, /Decline/);
  assert.match(html, /corncomp-analytics-consent/);
  assert.match(html, /createElement\(['"]script['"]\)/);
  assert.doesNotMatch(html, /<script[^>]+src="https:\/\/www\.googletagmanager\.com\/gtag\/js/);
});

test('analytics can be reopened and records each successful inquiry once', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /data-analytics-settings/);
  assert.match(html, /generate_lead/);
  assert.match(html, /corncomp-reported-leads/);
  assert.match(html, /history\.replaceState/);
});

test('revoking prior consent unloads analytics from the current page', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /analyticsLoaded[\s\S]*?window\.location\.reload\(\)/);
});
