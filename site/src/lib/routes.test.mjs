import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalUrl, documentDirection, languageFromPath } from './routes.mjs';

test('keeps English at the root and recognizes translated prefixes', () => {
  assert.equal(languageFromPath('/product/paper-straw/'), 'en');
  assert.equal(languageFromPath('/es/producto/pajita/'), 'es');
  assert.equal(languageFromPath('/fr/produit/paille/'), 'fr');
  assert.equal(languageFromPath('/ar/%d9%85%d9%86%d8%aa%d8%ac/'), 'ar');
});

test('marks only Arabic documents as right-to-left', () => {
  assert.equal(documentDirection('ar'), 'rtl');
  assert.equal(documentDirection('en'), 'ltr');
  assert.equal(documentDirection('es'), 'ltr');
  assert.equal(documentDirection('fr'), 'ltr');
});

test('builds a stable production canonical URL', () => {
  assert.equal(canonicalUrl('/es/contacto/'), 'https://corn-comp.com/es/contacto/');
  assert.equal(canonicalUrl('/'), 'https://corn-comp.com/');
});
