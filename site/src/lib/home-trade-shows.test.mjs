import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { parse } from 'parse5';
import { SUPPORTED_LANGUAGES, routeFor } from './localization.mjs';

test('six real trade-show photographs appear between certificates and sourcing in every homepage language', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await readFile(new URL(`../../dist/${routeFor(language, 'home').slice(1)}index.html`, import.meta.url), 'utf8');
    const section = html.match(/<section\b[^>]*id="home-trade-shows"[\s\S]*?<\/section>/)?.[0];
    assert.ok(section, language + ': trade-show gallery is present');
    assert.ok(html.indexOf('id="home-certifications"') < html.indexOf(section));
    assert.ok(html.indexOf(section) < html.indexOf('id="sourcing-questions"'));
    const images = [];
    function visit(node) {
      if (node.tagName === 'img') images.push(Object.fromEntries(node.attrs.map(({ name, value }) => [name, value])));
      for (const child of node.childNodes || []) visit(child);
    }
    visit(parse(section));
    assert.equal(images.length, 6);
    assert.equal(new Set(images.map((image) => image.src)).size, 6);
    for (const image of images) {
      assert.ok(image.alt);
      assert.equal(image.loading, 'lazy');
      assert.equal(image.decoding, 'async');
      assert.ok(Number(image.width) > 0 && Number(image.height) > 0);
      assert.ok(image.srcset.includes('400w') && image.srcset.includes('800w'));
      for (const candidate of image.srcset.split(',')) {
        await access(new URL('../../dist' + candidate.trim().split(' ')[0], import.meta.url));
      }
    }
    if (language !== 'en') assert.ok(!section.includes('Trade Show Presence'));
  }
});
