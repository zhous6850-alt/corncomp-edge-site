import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryLanguage, contentDescription, contentPath, contentTitle, localizeInternalLinks, normalizeBodyHeadings } from './content-routes.mjs';
import { localizedRedirects, routeFor } from './localization.mjs';

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

test('localizes relative, root-relative, absolute and reviewed alias links by stable identity', () => {
  const [reviewedAlias, reviewedTarget] = [...localizedRedirects()].find(([source]) => source.startsWith('/fr/'));
  const html = [
    '<a href="/products/">Root</a>',
    '<a href="https://corn-comp.com/resources/guides/paper-cup-sizes/?from=body#sizes">Absolute</a>',
    '<a href="../../../products/cups-bowls/paper-cups/">Relative</a>',
    `<a href="${reviewedAlias}">Alias</a>`,
  ].join('');
  const localized = localizeInternalLinks(html, 'fr', '/resources/guides/food-packaging-certifications/');

  assert.match(localized, new RegExp(`href="${routeFor('fr', 'architecture:products')}"`));
  assert.match(localized, new RegExp(`href="${routeFor('fr', 'architecture:resources/guides/paper-cup-sizes')}\\?from=body#sizes"`));
  assert.match(localized, new RegExp(`href="${routeFor('fr', 'architecture:products/cups-bowls/paper-cups')}"`));
  assert.match(localized, new RegExp(`href="${reviewedTarget}"`));
});

test('does not rewrite assets, APIs, fragments or external and contact destinations', () => {
  const html = '<a href="#section">Fragment</a><a href="/media/file.pdf">Asset</a><a href="/api/inquiry">API</a><a href="mailto:inquiry@corn-comp.com">Mail</a><a href="tel:+8657486961222">Tel</a><a href="https://wa.me/8613806632002">WhatsApp</a><a href="https://example.com/evidence">Evidence</a>';
  assert.equal(localizeInternalLinks(html, 'es', '/es/recursos/'), html);
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
