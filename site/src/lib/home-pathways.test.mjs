import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {englishInventory,localizedEntry} from './localization.mjs';
test('homepage omits redundant shortcuts while retaining destination content',()=>{
  const home=englishInventory().find(item=>item.contentKey==='home');
  assert.equal(home.programs.heading,'Find what you need');
  assert.deepEqual(home.programs.cards.map(card=>card[0]),['architecture:custom-packaging','architecture:applications','architecture:quality','architecture:resources']);
  for(const language of ['zh','fr','es','de','ar'])assert.equal(localizedEntry(language,'home').programs.cards.length,4);
  const source=readFileSync(new URL('../components/HomePage.astro',import.meta.url),'utf8');
  const section=source.match(/<section[^>]*id="quick-links"[\s\S]*?<\/section>/)?.[0];
  assert.equal(section, undefined);
});
