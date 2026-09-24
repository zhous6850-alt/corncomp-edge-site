import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

function metaContent(html, name) {
  return html.match(new RegExp(`<meta name="${name}" content="([^"]*)">`))?.[1] || '';
}

function structuredData(html) {
  return html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)?.[1] || '';
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
