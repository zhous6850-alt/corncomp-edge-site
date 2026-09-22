import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the built homepage includes the global site styles', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /\.content-shell\s*\{/);
});

test('the built homepage includes an accessible mobile navigation control', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  assert.match(html, /<button[^>]+aria-controls="primary-navigation"[^>]+aria-expanded="false"/);
  assert.match(html, /<nav[^>]+id="primary-navigation"/);
});

test('the global navigation exposes every migrated primary section and language choice', async () => {
  const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');

  for (const route of ['/shop/', '/case-studies/', '/blog/', '/faq/', '/contact-us/']) {
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

test('product pages group the title and image in a responsive lead', async () => {
  const html = await readFile(
    new URL('../../dist/product/cardboard-open-wrap-cup/index.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /<div class="product-lead">/);
  assert.match(html, /class="[^"]*product-summary[^"]*"/);
  assert.match(html, /class="[^"]*product-media[^"]*"/);
});

test('category pages expose a labelled responsive product archive', async () => {
  const html = await readFile(
    new URL('../../dist/product-category/cutlery/index.html', import.meta.url),
    'utf8',
  );

  assert.match(html, /<section[^>]+class="content-shell category-archive"[^>]+aria-labelledby="category-title"/);
  assert.match(html, /<h1 id="category-title"/);
});

test('the shop restores the nine English product categories', async () => {
  const html = await readFile(new URL('../../dist/shop/index.html', import.meta.url), 'utf8');

  assert.match(html, /class="[^"]*shop-archive[^"]*"/);
  assert.match(html, /Browse our full range by category below\./);
  assert.equal((html.match(/class="shop-category-card"/g) || []).length, 9);
  for (const route of [
    '/product-category/paper-straw/',
    '/product-category/salad-bowl/',
    '/product-category/soup-cup-bowl/',
    '/product-category/salad-box/',
    '/product-category/cutlery/',
    '/product-category/paper-cup/',
    '/product-category/hamburger-box-wrap-box-sandwich-box-pizza-slice/',
    '/product-category/paper-plate/',
    '/product-category/menu-box/',
  ]) assert.match(html, new RegExp(`href="${route}"`));
});

test('the blog restores the English insight archive', async () => {
  const html = await readFile(new URL('../../dist/blog/index.html', import.meta.url), 'utf8');

  assert.match(html, /class="insight-grid"/);
  assert.match(html, /href="\/bpi-vs-fsc-certification\/"/);
  assert.doesNotMatch(html, /href="\/fr\/quest-ce-que/);
});

test('blog cards stack their image above the title on phones', async () => {
  const css = await readFile(new URL('../styles/global.css', import.meta.url), 'utf8');

  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.insight-card a \{ display: flex; flex-direction: column; \}/);
});

test('the contact page presents the migrated inquiry form in a responsive layout', async () => {
  const html = await readFile(new URL('../../dist/contact-us/index.html', import.meta.url), 'utf8');

  assert.match(html, /class="contact-layout"/);
  assert.match(html, /<form[^>]+action="\/api\/inquiry"[^>]+method="post"/);
});
