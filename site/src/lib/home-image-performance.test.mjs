import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import sharp from 'sharp';
import { SUPPORTED_LANGUAGES, routeFor } from './localization.mjs';

test('all homepages offer smaller WebP downloads without losing image dimensions or loading priorities', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await readFile(new URL(`../../dist/${routeFor(language, 'home').slice(1)}index.html`, import.meta.url), 'utf8');
    const hero = html.match(/<section\b[^>]*class="home-hero"[^>]*>([\s\S]*?)<\/section>/)[1];
    const catalogue = html.match(/<section[^>]*id="product-ranges"[\s\S]*?<\/section>/)[0];
    const images = [...(hero + catalogue).matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
    assert.equal(images.length, 7);
    for (const [index, image] of images.entries()) {
      const srcset = image.match(/srcset="([^"]+)"/)?.[1];
      assert.ok(srcset, `${language}: image ${index} needs responsive sources`);
      assert.match(image, /sizes="[^"]+"/);
      assert.match(image, index === 0 ? /fetchpriority="high"/ : /loading="lazy"/);
      const candidates = srcset.split(',').map((candidate) => candidate.trim().split(/\s+/));
      assert.ok(candidates.length >= 3);
      for (const [src, descriptor] of candidates) {
        assert.match(src, /^\/media\/optimized\/.+\.[a-f0-9]{12}-\d+\.webp$/);
        const file = new URL(`../../dist${src}`, import.meta.url);
        const metadata = await sharp(await readFile(file)).metadata();
        assert.equal(metadata.format, 'webp');
        assert.equal(metadata.width, Number.parseInt(descriptor));
      }
      const small = new URL(`../../dist${candidates[0][0]}`, import.meta.url);
      const large = new URL(`../../dist${candidates.at(-1)[0]}`, import.meta.url);
      assert.ok((await stat(small)).size < (await stat(large)).size * .6);
    }
  }
});
