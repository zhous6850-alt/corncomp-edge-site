import test from 'node:test';
import assert from 'node:assert/strict';
import { englishInventory, localizedEntry } from './localization.mjs';
import { readFileSync } from 'node:fs';
test('home factory explains actual manufacturing and uses a workshop photograph',()=>{
  const home=englishInventory().find(item=>item.contentKey==='home');
  assert.match(home.factory.heading,/Ningbo/);
  assert.match(home.factory.text,/2018/);
  assert.match(home.factory.text,/8,000/);
  assert.match(home.factory.text,/6,800/);
  assert.doesNotMatch(home.factory.heading,/should show|verify/);
  for(const language of ['zh','fr','es','de','ar']){
    const copy=localizedEntry(language,'home').factory;
    assert.ok(copy.text.includes('2018'),language);
    assert.ok(/6[, .]?800/.test(copy.text),language);
  }
  const source=readFileSync(new URL('../components/HomePage.astro',import.meta.url),'utf8');
  assert.ok(source.includes('/media/wp/293-facility-photo-new.webp'));
});
