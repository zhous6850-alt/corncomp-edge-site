import test from 'node:test';
import assert from 'node:assert/strict';
import { embeddedAssetLocalPath, extractEmbeddedAssets, groupMeta, importRecord, mediaLocalPath, rewriteMediaUrls } from './import-content.mjs';

test('groups WordPress meta rows by numeric object id', () => {
  assert.deepEqual(groupMeta([
    { post_id: '72', meta_key: 'rank_math_title', meta_value: 'Kraft Paper Bowl' },
    { post_id: '72', meta_key: '_cc_material', meta_value: 'Kraft Paper' },
  ]), new Map([[72, {
    rank_math_title: 'Kraft Paper Bowl',
    _cc_material: 'Kraft Paper',
  }]]));
});

test('imports exact content, SEO, product relationships, and media metadata', () => {
  const result = importRecord({
    id: 72,
    type: 'product',
    slug: 'kraft-paper-bowl',
    language: 'en',
    route: '/product/kraft-paper-bowl/',
    title: 'Kraft Paper Bowl',
    body: '<h2>Product details</h2><p>Exact original copy.</p>',
    excerpt: '<p>Original excerpt.</p>',
    featuredMediaId: 261,
    categoryIds: [20],
    seo: { title: '', description: '' },
  }, new Map([[72, {
    rank_math_title: 'Kraft Paper Bowl Manufacturer',
    rank_math_description: 'Original SEO description.',
    rank_math_focus_keyword: 'kraft paper bowl',
    _cc_material: 'Kraft Paper',
  }]]), new Map([[261, {
    id: 261,
    source_url: 'https://corn-comp.com/wp-content/uploads/2026/07/bowl.jpg',
    alt_text: 'Kraft paper bowl',
  }]]));

  assert.equal(result.body, '<h2>Product details</h2><p>Exact original copy.</p>');
  assert.deepEqual(result.categoryIds, [20]);
  assert.deepEqual(result.seo, {
    title: 'Kraft Paper Bowl Manufacturer',
    description: 'Original SEO description.',
    focusKeyword: 'kraft paper bowl',
    canonical: '',
  });
  assert.deepEqual(result.featuredMedia, {
    id: 261,
    sourceUrl: 'https://corn-comp.com/wp-content/uploads/2026/07/bowl.jpg',
    localPath: '/media/wp/261-bowl.jpg',
    alt: 'Kraft paper bowl',
  });
  assert.equal(result.custom._cc_material, 'Kraft Paper');
});

test('maps media URLs to deterministic collision-safe local paths', () => {
  assert.equal(
    mediaLocalPath({ id: 261, source_url: 'https://corn-comp.com/wp-content/uploads/2026/07/Bowl%20Photo.jpg' }),
    '/media/wp/261-bowl-photo.jpg',
  );
});

test('rewrites original and generated WordPress media URLs to the local original', () => {
  const media = {
    id: 261,
    source_url: 'https://corn-comp.com/wp-content/uploads/2026/07/bowl.jpg',
    media_details: { sizes: { medium: { source_url: 'https://corn-comp.com/wp-content/uploads/2026/07/bowl-300x300.jpg' } } },
  };
  const html = '<img src="https://corn-comp.com/wp-content/uploads/2026/07/bowl-300x300.jpg"><a href="https://corn-comp.com/wp-content/uploads/2026/07/bowl.jpg">Open</a>';
  assert.equal(rewriteMediaUrls(html, [media]), '<img src="/media/wp/261-bowl.jpg"><a href="/media/wp/261-bowl.jpg">Open</a>');
});

test('extracts unregistered uploads and assigns stable local paths', () => {
  const url = 'https://corn-comp.com/wp-content/uploads/2026/07/Legacy%20Photo.jpg';
  const assets = extractEmbeddedAssets([{ body: `<img src="${url}">`, excerpt: '' }]);
  assert.equal(assets.length, 1);
  assert.equal(assets[0].source_url, url);
  assert.equal(assets[0].localPath, embeddedAssetLocalPath(url));
  assert.match(assets[0].localPath, /^\/media\/embedded\/[a-f0-9]{8}-legacy-photo\.jpg$/);
});
