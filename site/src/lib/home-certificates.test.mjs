import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse } from 'parse5';
import { SUPPORTED_LANGUAGES, routeFor } from './localization.mjs';

test('all homepages show four real certificates between manufacturing and shortcuts, linked to localized quality', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const route = routeFor(language, 'home');
    const html = await readFile(new URL(`../../dist/${route.slice(1)}index.html`, import.meta.url), 'utf8');
    const section = html.match(/<section\b[^>]*id="home-certifications"[\s\S]*?<\/section>/)?.[0];
    assert.ok(section, language + ': homepage certificate showcase');
    assert.ok(html.indexOf('id="our-factory"') < html.indexOf('id="home-certifications"'));
    assert.ok(html.indexOf('id="home-certifications"') < html.indexOf('id="sourcing-questions"'));
    const images = [];
    const links = [];
    function visit(node) {
      const attrs = Object.fromEntries((node.attrs || []).map(({ name, value }) => [name, value]));
      if (node.tagName === 'img') images.push(attrs);
      if (node.tagName === 'a') links.push(attrs.href);
      for (const child of node.childNodes || []) visit(child);
    }
    visit(parse(section));
    assert.equal(images.length, 4);
    for (const name of ['315-corncomp-brc-certificate.webp', '290-certificate-fsc-scaled.webp', '289-certificate-1.webp', '291-certificate-3.webp']) {
      const image = images.find((image) => image.src.includes(name));
      assert.ok(image, name);
      assert.ok(image.alt);
      assert.equal(image.loading, 'lazy');
      assert.ok(image.srcset?.includes('400w'), 'lightweight thumbnails, not four full-size documents');
    }
    assert.ok(links.every((link) => link === routeFor(language, 'architecture:quality') + '#documents'));
    assert.ok(section.includes('BRCGS') && section.includes('FSC') && section.includes('ISO 9001') && section.includes('BPI'));
    assert.ok(section.includes('352'), 'BPI product scope remains explicit');
    assert.doesNotMatch(section, /\.pdf|all products are certified/i);
  }
});
