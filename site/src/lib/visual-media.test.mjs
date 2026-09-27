import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { mediaFor, mediaListFor, validateVisualMedia } from './visual-media.mjs';
import { companyCertificates, supplyChainDocuments } from '../data/certificates.mjs';
import { CONTENT_MEDIA } from '../data/visual-media.mjs';

const publicDir = fileURLToPath(new URL('../../public/', import.meta.url));

test('resolves localized visual media', () => {
  const english = mediaFor('home');
  const french = mediaFor('home', 'fr');
  assert.ok(english.src.startsWith('/media/wp/'));
  assert.ok(english.width > 0 && english.height > 0);
  assert.notEqual(english.alt, french.alt);
  assert.ok(mediaListFor('architecture:products').length > 1);
  assert.deepEqual(validateVisualMedia({ publicDir }), []);
});

test('reports missing required assets', () => {
  const errors = validateVisualMedia({ publicDir: resolve(publicDir, 'missing-assets') });
  assert.ok(errors.some((error) => error.includes('home-hero') && error.includes('missing')));
});

test('requires all four localized alt values', () => {
  const media = [{
    key: 'sample', src: '/media/wp/example.jpg', width: 100, height: 80,
    alt: { en: 'Sample image', fr: 'Image exemple', es: 'Imagen de ejemplo' },
    fit: 'cover', position: 'center', evidence: 'product', required: false,
  }];
  const errors = validateVisualMedia({ publicDir, media, assignments: {}, certificates: [] });
  assert.ok(errors.some((error) => error.includes('sample') && error.includes('ar')));
});

test('keeps optional media nullable', () => {
  assert.equal(mediaFor('not-a-content-key'), null);
  assert.deepEqual(mediaListFor('not-a-content-key'), []);
});

test('only explicitly assigned products receive supplemental real context with four localized alt values', () => {
  for (const language of ['en', 'fr', 'es', 'ar']) {
    const bowl = mediaListFor('product:kraft-paper-bowl', language);
    const straw = mediaListFor('product:bendy', language);
    assert.deepEqual(bowl.map(({ key }) => key), ['salad-bowls', 'factory-line']);
    assert.deepEqual(straw.map(({ evidence }) => evidence), ['application', 'factory']);
    assert.ok([...bowl, ...straw].every(({ alt }) => alt?.trim()));
  }
  assert.deepEqual(mediaListFor('product:cardboard-open-wrap-cup'), []);
});

test('separates complete company certificates from supply-chain documents', () => {
  const company = companyCertificates();
  const suppliers = supplyChainDocuments();
  assert.deepEqual(company.map(({ certificateNumber, validUntil }) => [certificateNumber, validUntil]), [
    ['01526Q60104R001', '2029-04-27'],
    ['RINA-COC-001953', '2027-09-08'],
    ['10529571-1', '2027-09-30'],
    ['CN24/00006923', '2027-08-05'],
  ]);
  assert.match(company[2].scope, /352 g\/m²/);
  assert.ok(company.every(({ holder, title, standard, scope, image }) =>
    holder === 'Ningbo Corncomp Tech Co., Ltd.' && title && standard && scope && image?.src));
  assert.deepEqual(suppliers.map(({ certificateNumber, holder, validUntil }) => [certificateNumber, holder, validUntil]), [
    ['7W0517', 'Hangzhou POLYFUL Advanced Material Co., Ltd.', '2028-01-31'],
    ['7P1802', 'Ningbo Millionpack Co., Ltd.', '2028-10-31'],
  ]);
  assert.ok(suppliers.every(({ documentUrl }) => documentUrl?.endsWith('.pdf')));
  assert.ok(suppliers.every(({ holder }) => holder !== 'Ningbo Corncomp Tech Co., Ltd.'));
  for (const language of ['fr', 'es', 'ar']) {
    assert.equal(companyCertificates(language).length, 4);
    assert.equal(supplyChainDocuments(language).length, 2);
  }
  const errors = validateVisualMedia({
    publicDir, media: [], assignments: {},
    certificates: [{ key: 'incomplete-certificate', group: 'company', holder: 'Example Holder' }],
  });
  assert.ok(errors.some((error) => error.includes('incomplete-certificate') && error.includes('scope')));
});

test('rejects product media assigned to a company certificate', () => {
  const assignments = { ...CONTENT_MEDIA, 'certificate:iso': ['paper-cups'] };
  const errors = validateVisualMedia({ publicDir, assignments });
  assert.ok(errors.some((error) => error.includes('iso-9001') && error.includes('certificate image')));
});
test('Resources latest articles resolve accurately classified real evidence in every language', () => {
  for (const language of ['en', 'fr', 'es', 'ar']) {
    const legislation = mediaFor('post:us-state-plastic-packaging-laws-explained', language);
    const verification = mediaFor('post:how-to-verify-supplier-sustainability-certifications', language);
    assert.ok(legislation, language);
    assert.match(legislation.src, /602-us-capitol-building/);
    assert.equal(legislation.width, 1080);
    assert.equal(legislation.height, 955);
    assert.equal(legislation.evidence, 'decorative');
    assert.equal(verification?.evidence, 'certificate');
    assert.ok(verification.alt.trim());
  }
});
