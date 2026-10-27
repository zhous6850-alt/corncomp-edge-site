import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { GET } from '../pages/sitemap.xml.js';
import { allLocalizedEntries, englishInventory, localizedEntry, localizedRedirects, normalizeLocalizedRoute, routeFor } from './localization.mjs';
import { extractProductFacts } from './product-facts.mjs';
import { contentText } from './content-routes.mjs';

test('all canonical pages retain production social URLs, organization email, schema arrays and consent-gated GA4', async () => {
  for (const { route } of allLocalizedEntries()) {
    const html = await readFile(new URL(`../../dist/${route.slice(1)}index.html`, import.meta.url), 'utf8');
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    assert.equal(canonical, `https://corn-comp.com${normalizeLocalizedRoute(route)}`, route);
    assert.doesNotMatch(html, /https?:\/\/(?:www\.)?corncomp\.com(?:[\/"<]|$)/, route);
    const image = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    assert.equal(new URL(image).origin, 'https://corn-comp.com', route);
    assert.equal(html.match(/name="twitter:image" content="([^"]+)"/)?.[1], image, route);
    await access(new URL(`../../dist${new URL(image).pathname}`, import.meta.url));
    const schemas = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)[1]);
    assert.ok(Array.isArray(schemas), route);
    assert.equal(schemas.filter((node) => node['@type'] === 'Organization').length, 1, route);
    assert.equal(schemas[0].email, 'zhous6850@gmail.com', route);
    assert.equal(schemas[0]['@id'], 'https://corn-comp.com/#organization', route);
    assert.ok(html.includes('mailto:zhous6850@gmail.com'), route);
    assert.ok(html.includes('G-R1SHNYEBN8'), route);
    assert.doesNotMatch(html, /<script[^>]+src="https:\/\/www\.googletagmanager\.com/, route);
  }
});

test('all blog article identities, original schema images, canonical URLs and alternates survive the redesign', async () => {
  for (const post of englishInventory().filter(({ type }) => type === 'post')) {
    for (const language of ['en', 'fr', 'es', 'ar', 'zh', 'de']) {
      const entry = localizedEntry(language, post.contentKey);
      const html = await readFile(new URL(`../../dist/${entry.route.slice(1)}index.html`, import.meta.url), 'utf8');
      const schemas = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)[1]);
      const article = schemas.find((node) => node['@type'] === 'Article');
      assert.equal(article.headline, contentText(entry.title));
      assert.equal(article.mainEntityOfPage, `https://corn-comp.com${entry.route}`);
      assert.equal(article.image, `https://corn-comp.com${post.featuredMedia.localPath}`);
      assert.deepEqual(article.author, { '@id': 'https://corn-comp.com/#organization' });
      assert.deepEqual(article.publisher, { '@id': 'https://corn-comp.com/#organization' });
      assert.equal(article.dateModified, entry.dateModified || entry.reviewedDate);
      assert.ok(html.includes(`rel="canonical" href="https://corn-comp.com${normalizeLocalizedRoute(entry.route)}"`));
      for (const alternate of ['en', 'fr', 'es', 'ar', 'zh', 'de']) {
        const hreflang = alternate === 'zh' ? 'zh-CN' : alternate;
        assert.ok(html.includes(`hreflang="${hreflang}" href="https://corn-comp.com${normalizeLocalizedRoute(routeFor(alternate, post.contentKey))}"`));
      }
      assert.ok(html.includes(`hreflang="x-default" href="https://corn-comp.com${post.route}"`));
    }
  }
});

test('sitemap includes localized archives and excludes retired commerce pages', async () => {
  const xml = await (await GET()).text();
  assert.equal(await readFile(new URL('../../dist/sitemap.xml', import.meta.url), 'utf8'), xml, 'built sitemap matches canonical inventory');
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedRoutes = [
    ...allLocalizedEntries().map(({ route }) => normalizeLocalizedRoute(route)),
    '/blog/', '/fr/blog/', '/es/blog/', '/ar/blog/', '/zh/blog/',
    '/applications/supermarket-packaging/',
    '/faq/',
    ...['fr', 'es', 'ar', 'zh', 'de'].map((language) => '/' + language + '/applications/supermarket-packaging/'),
  ];
  assert.equal(locations.length, expectedRoutes.length);
  assert.equal(new Set(locations).size, locations.length);
  for (const route of expectedRoutes) assert.ok(locations.includes(`https://corn-comp.com${route}`), route);
  for (const alias of localizedRedirects().keys()) assert.ok(!locations.includes(`https://corn-comp.com${alias}`), alias);
  assert.match(xml, /https:\/\/corn-comp\.com\/products\/cups-bowls\/paper-cups\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/products\/cups-bowls\/paper-cups\/single-wall-white-cardboard-paper-cup\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/applications\/fast-food-packaging\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/resources\/guides\/paper-cup-sizes\//);
  for (const language of ['fr', 'es', 'ar', 'zh', 'de']) assert.doesNotMatch(xml, new RegExp(`https://corn-comp\\.com/${language}/shop/`));
  assert.match(xml, /https:\/\/corn-comp\.com\/es\/blog\//);
  assert.match(xml, /https:\/\/corn-comp\.com\/ar\/%D[89]/);
  assert.doesNotMatch(xml, /%[0-9a-f]*[a-f][0-9a-f]*/);
  assert.doesNotMatch(xml, /\/cart\//);
  assert.doesNotMatch(xml, /\/checkout\//);
  assert.doesNotMatch(xml, /\/my-account\//);
  assert.doesNotMatch(xml, /https:\/\/corn-comp\.com\/shop\//);
  assert.doesNotMatch(xml, /https:\/\/corn-comp\.com\/product\//);
  assert.doesNotMatch(xml, /https:\/\/corn-comp\.com\/product-category\//);
  assert.doesNotMatch(xml, /https:\/\/corn-comp\.com\/contact-us\//);
});

test('robots advertises the production sitemap', async () => {
  const robots = await readFile(new URL('../../public/robots.txt', import.meta.url), 'utf8');
  assert.match(robots, /Sitemap: https:\/\/corn-comp\.com\/sitemap\.xml/);
});

test('visual product pages preserve all item identifiers, original schema images and contextual quote parameters', async () => {
  for (const product of englishInventory().filter((item) => item.type === 'product')) {
    const { itemCodes } = extractProductFacts(product);
    for (const language of ['en', 'fr', 'es', 'ar', 'zh', 'de']) {
      const route = routeFor(language, product.contentKey);
      const html = await readFile(new URL(`../../dist/${route.slice(1)}index.html`, import.meta.url), 'utf8');
      const schemas = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)[1]);
      const schema = schemas.find((node) => node['@type'] === 'Product');
      assert.equal(schema.url, `https://corn-comp.com${route}`);
      assert.equal(schema.image, `https://corn-comp.com${product.featuredMedia.localPath}`);
      assert.equal(schema.sku, itemCodes.length === 1 ? itemCodes[0] : undefined);
      assert.deepEqual(schema.additionalProperty.map(({ value }) => value), itemCodes);
      assert.equal(schema.hasCertification, undefined);
      const quote = html.match(/<a class="button-primary" href="([^"]+\?product=[^"]+)"/)?.[1];
      const url = new URL(contentText(quote), 'https://corn-comp.com');
      assert.equal(url.pathname, routeFor(language, 'architecture:contact'));
      assert.equal(url.searchParams.get('source'), route);
      assert.equal(url.searchParams.get('sku'), itemCodes.length === 1 ? itemCodes[0] : '');
      assert.ok(url.searchParams.get('category'));
      assert.equal(url.searchParams.get('product'), contentText(localizedEntry(language, product.contentKey).title));
    }
  }
});
