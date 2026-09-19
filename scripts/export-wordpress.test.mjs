import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchAllPages, normalizeRecord } from './export-wordpress.mjs';

test('normalizes a translated WordPress record without changing its route or content', () => {
  const input = {
    id: 711,
    type: 'post',
    slug: 'pla-%d9%85%d9%82%d8%a7%d8%a8%d9%84-%d8%a7%d9%84%d8%a8%d8%a7%d8%ba%d8%a7%d8%b3',
    link: 'https://corn-comp.com/ar/pla-%d9%85%d9%82%d8%a7%d8%a8%d9%84-%d8%a7%d9%84%d8%a8%d8%a7%d8%ba%d8%a7%d8%b3/',
    title: { rendered: 'PLA مقابل الباغاس' },
    content: { rendered: '<h2>المواد</h2><p>النص الأصلي</p>' },
    excerpt: { rendered: '<p>ملخص</p>' },
    featured_media: 99,
    lang: 'ar',
    meta: {
      rank_math_title: 'PLA مقابل الباغاس',
      rank_math_description: 'وصف الصفحة',
    },
  };

  assert.deepEqual(normalizeRecord(input), {
    id: 711,
    type: 'post',
    slug: input.slug,
    language: 'ar',
    route: '/ar/pla-%d9%85%d9%82%d8%a7%d8%a8%d9%84-%d8%a7%d9%84%d8%a8%d8%a7%d8%ba%d8%a7%d8%b3/',
    title: 'PLA مقابل الباغاس',
    body: '<h2>المواد</h2><p>النص الأصلي</p>',
    excerpt: '<p>ملخص</p>',
    featuredMediaId: 99,
    categoryIds: [],
    seo: {
      title: 'PLA مقابل الباغاس',
      description: 'وصف الصفحة',
    },
  });
});

test('uses the root-relative path and defaults to English', () => {
  const record = normalizeRecord({
    id: 29,
    type: 'page',
    slug: 'home',
    link: 'https://corn-comp.com/',
    title: { rendered: 'Home' },
    content: { rendered: '<p>Original homepage copy</p>' },
    excerpt: { rendered: '' },
    featured_media: 0,
    meta: {},
  });

  assert.equal(record.language, 'en');
  assert.equal(record.route, '/');
  assert.equal(record.body, '<p>Original homepage copy</p>');
});

test('infers a translated language from the preserved route prefix', () => {
  const record = normalizeRecord({
    id: 364,
    type: 'page',
    slug: 'sobre-nosotros',
    link: 'https://corn-comp.com/es/sobre-nosotros/',
    title: { rendered: 'Sobre nosotros' },
    content: { rendered: '<p>Contenido</p>' },
    excerpt: { rendered: '' },
    featured_media: 0,
    meta: {},
  });

  assert.equal(record.language, 'es');
});

test('preserves product category relationships', () => {
  const record = normalizeRecord({
    id: 72,
    type: 'product',
    slug: 'kraft-paper-bowl',
    link: 'https://corn-comp.com/product/kraft-paper-bowl/',
    title: { rendered: 'Kraft Paper Bowl' },
    content: { rendered: '<p>Product copy</p>' },
    excerpt: { rendered: '' },
    featured_media: 261,
    product_cat: [20, 25],
    meta: {},
  });

  assert.deepEqual(record.categoryIds, [20, 25]);
});

test('fetches every REST page exactly once', async () => {
  const calls = [];
  const fakeFetch = async (url) => {
    const page = Number(new URL(url).searchParams.get('page'));
    calls.push(page);
    return {
      ok: true,
      headers: { get: (name) => name === 'x-wp-totalpages' ? '2' : null },
      json: async () => page === 1 ? [{ id: 1 }] : [{ id: 2 }],
    };
  };

  assert.deepEqual(await fetchAllPages('/wp-json/wp/v2/pages', fakeFetch), [{ id: 1 }, { id: 2 }]);
  assert.deepEqual(calls, [1, 2]);
});

test('fails clearly when WordPress REST returns an error', async () => {
  const fakeFetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(() => fetchAllPages('/wp-json/wp/v2/pages', fakeFetch), /WordPress REST 503/);
});
