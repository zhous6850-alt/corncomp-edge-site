import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const { products } = JSON.parse(await readFile(new URL('../docs/qa/2026-10-17-product-image-audit.json', import.meta.url), 'utf8'));
const forestImages = JSON.parse(await readFile(new URL('../docs/qa/2026-10-17-forest-product-images.json', import.meta.url), 'utf8'));
const origin = 'https://corncomp-edge-site-v2-preview.corncomp-edge.workers.dev';
for (let offset = 0; offset < products.length; offset += 5) {
  await Promise.all(products.slice(offset, offset + 5).map(async product => {
    const response = await fetch(`${origin}${product.image}?review=forest-20261017`);
    assert.equal(response.status, 200, product.slug);
    assert.match(response.headers.get('content-type'), /^image\//, product.slug);
    const digest = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
    const expected = forestImages.find(image => image.asset === product.image)?.sha256 ?? product.sha256;
    assert.equal(digest, expected, `Preview asset differs: ${product.slug}`);
  }));
}
console.log('PASS: all 95 preview product images return HTTP 200 and match reviewed SHA-256 content.');
