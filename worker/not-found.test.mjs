import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker, { REDIRECTS } from './index.mjs';

const assets = {
  ASSETS: { fetch: async () => new Response('<h1>Page not found</h1>', { status: 404 }) },
};

test('unknown paths and the 404 url itself return a non-empty 404', async () => {
  for (const path of ['/zzz/', '/404/', '/404.html']) {
    const response = await worker.fetch(new Request('https://corn-comp.com' + path), assets);
    assert.equal(response.status, 404, path);
    assert.ok((await response.text()).length > 0, path);
  }
  const redirect = await worker.fetch(new Request('https://corn-comp.com/resources/'), assets);
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('location'), 'https://corn-comp.com/blog/');
  assert.equal(REDIRECTS.has('/resources/'), true);
});

test('the built 404 page is noindex and has no canonical', () => {
  const html = readFileSync(new URL('../site/dist/404.html', import.meta.url), 'utf8');
  assert.match(html, /Page not found/);
  assert.match(html, /<meta name="robots" content="noindex">/);
  assert.doesNotMatch(html, /rel="canonical"/);
});

test('production and preview assets both serve the built styled 404 page',()=>{
 for(const name of ['wrangler.jsonc','wrangler.preview.jsonc']){
  const config=JSON.parse(readFileSync(new URL('../'+name,import.meta.url),'utf8'));
  assert.equal(config.assets.not_found_handling,'404-page',name);
 }
});
