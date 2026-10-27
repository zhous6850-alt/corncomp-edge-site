import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('fast food preview links menu items to fit and complete-order checks',async()=>{
 const html=await readFile(new URL('../../dist/design-preview/applications/fast-food-packaging/index.html',import.meta.url),'utf8');
 for(const text of ['Fit the burger.','Frame the wrap.','Size the side.','AI-generated scene illustration','id="order-check"'])assert.ok(html.includes(text));
 assert.ok(html.includes('source=%2Fapplications%2Ffast-food-packaging%2F'));
 assert.ok(!html.includes('A coordinated set.'));
});
