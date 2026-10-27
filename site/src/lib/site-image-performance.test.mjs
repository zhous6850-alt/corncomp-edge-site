import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse } from 'parse5';
import sharp from 'sharp';
import { VISUAL_MEDIA } from '../data/visual-media.mjs';

function images(html) {
  const result = [];
  function visit(node) {
    if (node.tagName === 'img') result.push(Object.fromEntries(node.attrs.map(({ name, value }) => [name, value])));
    for (const child of node.childNodes || []) visit(child);
  }
  visit(parse(html));
  return result;
}
test('product, application, editorial and company pages offer responsive downloads in every language', async () => {
  for (const route of ['products/cups-bowls/paper-cups/', 'applications/takeaway-packaging/', 'resources/', 'resources/guides/paper-cup-sizes/', 'about/']) {
    for (const language of ['', 'zh/', 'de/']) {
      const html = await readFile(new URL(`../../dist/${language}${route}index.html`, import.meta.url), 'utf8');
      const responsive = images(html).filter((image) => image.srcset?.includes('/media/optimized/site/'));
      assert.ok(responsive.length > 0, language + route);
      for (const image of responsive) {
        assert.ok(image.sizes, 'browser needs a rendered-size hint');
        if (image.loading === 'lazy') assert.match(image.sizes, /^auto,/);
        else assert.equal(image.sizes, '100vw', 'wide hero images must not be limited to the content-column width');
        const candidates = image.srcset.split(',').map((candidate) => candidate.trim().split(/\s+/));
        for (const [src, descriptor] of [candidates[0], candidates.at(-1)]) {
          const metadata = await sharp(await readFile(new URL(`../../dist${src}`, import.meta.url))).metadata();
          assert.equal(metadata.format, 'webp');
          assert.equal(metadata.width, Number.parseInt(descriptor), 'width descriptors must match actual downloads');
        }
      }
    }
  }
});
test('certificate originals and enlargement targets stay outside lossy image optimization', async () => {
  const certificates = new Set(VISUAL_MEDIA.filter((media) => media.evidence === 'certificate').map((media) => media.src));
  const html = await readFile(new URL('../../dist/quality/index.html', import.meta.url), 'utf8');
  const protectedImages = images(html).filter((image) => certificates.has(image.src) || /din-.+-overview/.test(image.src || ''));
  assert.ok(protectedImages.length >= 4);
  for (const image of protectedImages) assert.ok(!image.srcset?.includes('/media/optimized/site/'));
});

test('wide scene photographs retain their native resolution below the 1920px ceiling', async () => {
  const html = await readFile(new URL('../../dist/applications/supermarket-packaging/index.html', import.meta.url), 'utf8');
  const image = images(html).find((image) => image.src?.endsWith('/supermarket-retail-scene-preview.png'));
  assert.ok(image);
  assert.match(image.srcset, /-1672\.webp 1672w/);
});
