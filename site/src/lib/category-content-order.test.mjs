import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {englishInventory,allLocalizedEntries} from './localization.mjs';

test('product category and group pages show their product cards before comparison tables in every language',async()=>{
  const keys=new Set(englishInventory().filter(page=>page.type==='architecture'&&['product-category','product-group','products'].includes(page.kind)).map(page=>page.contentKey));
  const misplaced=[];
  for(const entry of allLocalizedEntries().filter(entry=>keys.has(entry.contentKey))) {
    const html=await readFile(new URL('../../dist'+entry.route+'index.html',import.meta.url),'utf8');
    const table=html.indexOf('<table');
    if(table<0)continue;
    const cards=[...html.matchAll(/<article\b[^>]*class="[^"]*(?:series-card|range-card|editorial-card|directory-category)/g)];
    if(!cards.length||cards.at(-1).index>table)misplaced.push(entry.route);
  }
  assert.deepEqual(misplaced,[]);
});
