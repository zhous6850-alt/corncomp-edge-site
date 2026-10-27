import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { routeFor } from './localization.mjs';
import { localizeApplicationHtml, localizeApplicationUrl } from './application-localization.mjs';

test('application translation keeps markup and localizes inquiry context without changing external destinations', () => {
  const result = localizeApplicationHtml('<h1>Packaging for every setting.<br><span>Made for the way you serve.</span></h1>', 'zh');
  assert.equal(result.html, '<h1>覆盖不同经营场景，<br><span>贴合您的供餐方式。</span></h1>');
  const url = new URL(localizeApplicationUrl('/contact/?category=Supermarket&source=%2Fapplications%2Fsupermarket-packaging%2F', 'zh'), 'https://corn-comp.com');
  assert.equal(url.pathname, '/zh/contact/');
  assert.equal(url.searchParams.get('category'), '超市');
  assert.equal(url.searchParams.get('source'), '/zh/applications/supermarket-packaging/');
  assert.equal(localizeApplicationUrl('https://wa.me/6581603123', 'ar'), 'https://wa.me/6581603123');
});

test('every application dictionary covers all approved visible and accessible source strings', async () => {
  const source = JSON.parse(await readFile(new URL('../data/application-source-strings.json', import.meta.url), 'utf8'));
  for (const language of ['fr', 'es', 'ar', 'zh', 'de']) {
    const dictionary = JSON.parse(await readFile(new URL('../data/application-translations-' + language + '.json', import.meta.url), 'utf8'));
    assert.deepEqual(Object.keys(dictionary).sort(), [...source].sort(), language);
    assert.ok(Object.values(dictionary).every((value) => typeof value === 'string' && value.trim()), language);
  }
});

test('every language presents the approved application design with local navigation and inquiry context', async () => {
  for (const language of ['fr', 'es', 'ar', 'zh', 'de']) {
    const overview = routeFor(language, 'architecture:applications');
    const html = await readFile(new URL('../../dist' + overview + 'index.html', import.meta.url), 'utf8');
    assert.match(html, /class="application-hero"/, language);
    assert.doesNotMatch(html.match(/<main>[\s\S]*?<\/main>/)?.[0] || '', /Packaging for every setting\.|Discuss your requirements|Explore this application/);
    for (const slug of ['takeaway-packaging', 'restaurant-packaging', 'fast-food-packaging', 'ice-cream-dessert-packaging', 'supermarket-packaging']) {
      const route = slug === 'supermarket-packaging' ? '/' + language + '/applications/supermarket-packaging/' : routeFor(language, 'architecture:applications/' + slug);
      const page = await readFile(new URL('../../dist' + route + 'index.html', import.meta.url), 'utf8');
      assert.ok(page.includes('href="https://corn-comp.com' + route + '"'), route);
      assert.ok(page.includes('href="' + overview + '"'), route);
      assert.ok(!page.includes('/design-preview/'), route);
      assert.ok(page.includes('href="' + routeFor(language, 'architecture:contact') + '?'), route);
      assert.equal((page.match(/<h1\b/g) || []).length, 1, route);
      assert.ok(page.includes('hreflang="zh-CN"'), route);
      if (language === 'ar') assert.match(page, /dir="rtl"/);
    }
  }
});
