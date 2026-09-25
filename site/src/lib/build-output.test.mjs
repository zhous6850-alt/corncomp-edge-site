import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { SUPPORTED_LANGUAGES, allLocalizedEntries, englishInventory, localizedEntry, routeFor, uiFor } from './localization.mjs';
import { assertFactParity } from './product-facts.mjs';
import { canonicalUrl } from './routes.mjs';
import { contentText } from './content-routes.mjs';

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

test('the global navigation exposes every migrated primary section and language choice', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  for (const route of ['/products/', '/custom-packaging/', '/applications/', '/resources/', '/quality/', '/about/', '/contact/']) {
    assert.match(html, new RegExp(`href="${route}"`));
  }
  for (const language of ['English', 'Français', 'Español', 'العربية']) assert.match(html, new RegExp(language));
  assert.match(html, /class="[^\"]*product-menu[^\"]*"/);
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

  assert.match(html, /<section[^>]+class="content-shell category-archive"[^>]+aria-labelledby="category-title"/);
  assert.match(html, /<h1 id="category-title"/);
  assert.match(html, /Built for B2B sourcing/);
  assert.match(html, /href="\/products\/foodservice-supplies\/disposable-cutlery\/cpla-cutlery\/"/);
});

test('the products hub exposes the three approved product groups', async () => {
  const html = await readFile(new URL('../../dist/products/index.html', import.meta.url), 'utf8');

  assert.match(html, /Paper Food Packaging for Wholesale/);
  assert.equal((html.match(/class="architecture-card product-group-card"/g) || []).length, 3);
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

test('localized blog archives have distinct titles and descriptions from shop archives', async () => {
  for (const language of ['fr', 'es', 'ar']) {
    const blogHtml = await readFile(new URL(`../../dist/${language}/blog/index.html`, import.meta.url), 'utf8');
    const shopHtml = await readFile(new URL(`../../dist/${language}/shop/index.html`, import.meta.url), 'utf8');
    const blogTitle = blogHtml.match(/<title>([^<]*)<\/title>/)?.[1] || '';
    const shopTitle = shopHtml.match(/<title>([^<]*)<\/title>/)?.[1] || '';

    assert.notEqual(blogTitle, shopTitle);
    assert.notEqual(metaContent(blogHtml, 'description'), metaContent(shopHtml, 'description'));
  }
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
