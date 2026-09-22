import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryLanguage, contentDescription, contentPath, contentTitle, localizeInternalLinks, normalizeBodyHeadings } from './content-routes.mjs';

test('converts a preserved route into an Astro catch-all parameter', () => {
  assert.equal(contentPath('/es/producto/'), 'es/producto');
  assert.equal(contentPath('/ar/%d9%85%d9%86%d8%aa%d8%ac/'), 'ar/منتج');
});

test('excludes the homepage from the catch-all route', () => {
  assert.equal(contentPath('/'), null);
});

test('prefers the stored SEO title and falls back to the visible title', () => {
  assert.equal(contentTitle({ title: 'Visible', seo: { title: 'SEO title' } }), 'SEO title');
  assert.equal(contentTitle({ title: 'Visible', seo: { title: '' } }), 'Visible');
});

test('expands preserved Rank Math title variables for static pages', () => {
  assert.equal(
    contentTitle({ title: 'Visible', seo: { title: 'Contact Us %sep% %sitename%' } }),
    'Contact Us | Corncomp',
  );
});

test('uses the language shared by products in a category', () => {
  assert.equal(categoryLanguage([{ language: 'es' }, { language: 'es' }, { language: 'en' }]), 'es');
  assert.equal(categoryLanguage([]), 'en');
});

test('rewrites Corncomp absolute links to preview-safe internal links', () => {
  const html = '<a href="https://corn-comp.com/shop/">Shop</a><a href="https://example.com/">External</a>';
  assert.equal(localizeInternalLinks(html), '<a href="/shop/">Shop</a><a href="https://example.com/">External</a>');
});

test('rewrites translated English-slug aliases to their actual localized routes', () => {
  const html = '<a href="https://corn-comp.com/es/certifications/">Certificaciones</a><a href="/fr/bpi-vs-fsc-certification/">BPI</a>';
  assert.equal(
    localizeInternalLinks(html),
    '<a href="/es/certificaciones-de-corncomp/">Certificaciones</a><a href="/fr/quest-ce-que-la-certification-bpi-en-quoi-elle-differe-de-la-certification-fsc/">BPI</a>',
  );
});

test('uses a plain-text excerpt when an SEO description is missing', () => {
  assert.equal(
    contentDescription({ seo: { description: '' }, excerpt: '<p>Useful buyer guide &amp; specifications.</p>' }),
    'Useful buyer guide & specifications.',
  );
});

test('demotes imported body H1 headings because the page template owns the H1', () => {
  assert.equal(normalizeBodyHeadings('<h1 class="hero">Title</h1><h2>Section</h2>'), '<h2 class="hero">Title</h2><h2>Section</h2>');
});
