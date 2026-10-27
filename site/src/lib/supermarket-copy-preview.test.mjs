import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('supermarket copy leads with food choices and keeps one suitability note',async()=>{
 const html=await readFile(new URL('../../dist/design-preview/applications/supermarket-packaging/index.html',import.meta.url),'utf8');
 assert.ok(!html.includes('Catalogue reference:'));
 assert.ok(!html.includes('listed items'));
 assert.ok(html.includes('Choose by the food you sell.'));
 assert.equal((html.match(/class="suitability-note"/g)||[]).length,1);
 assert.ok(html.includes('AI-generated scene illustration'));
 assert.ok(html.includes('Shelf life, leak resistance and storage suitability'));
});
