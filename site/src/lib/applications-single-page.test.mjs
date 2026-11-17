import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SUPPORTED_LANGUAGES, routeFor } from './localization.mjs';
test('all application scenes share one localized page with unique anchors and complete content', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const route = routeFor(language, 'architecture:applications');
    const html = await readFile(new URL('../../dist' + route + 'index.html', import.meta.url), 'utf8');
    let previous = -1;
    for (const id of ['takeaway','restaurant','fast-food','dessert','supermarket']) {
      const position = html.indexOf('id="' + id + '"');
      assert.ok(position > previous, language + ':' + id);
      previous = position;
      assert.ok(html.includes('href="' + route + '#' + id + '"'), language + ': menu target');
    }
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, language + ': duplicate IDs');
    assert.equal((html.match(/data-application-scene=/g) || []).length, 5);
    assert.ok((html.match(/source=/g) || []).length >= 5, 'scene inquiry context retained');
  }
});
