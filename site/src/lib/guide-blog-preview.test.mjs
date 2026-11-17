import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { englishInventory } from './localization.mjs';

test('blog preview retains all posts and accessible topic controls',async()=>{
  const html=await readFile(new URL('../../dist/design-preview/blog/index.html',import.meta.url),'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  for(const post of englishInventory().filter(post=>post.type==='post'))assert.ok(html.includes('href="'+post.route+'"'));
  const stories=[...html.matchAll(/<article class="story"[^>]*>([\s\S]*?)<\/article>/g)];
  assert.equal(stories.length,englishInventory().filter(post=>post.type==='post').length);
  for(const [,card] of stories) {
    assert.match(card,/<img\b/);
    assert.match(card,/<h3\b/);
    assert.match(card,/class="read-link"/);
  }
  assert.equal((html.match(/data-filter=/g)||[]).length,4);
  assert.ok(html.includes('aria-live="polite"'));
  assert.ok(html.includes('https://corn-comp.com/blog/'));
  const formal=await readFile(new URL('../../dist/blog/index.html',import.meta.url),'utf8');
  assert.match(formal,/class="blog-preview"/);
  assert.doesNotMatch(formal,/DESIGN PREVIEW|href="\/design-preview/);
});
