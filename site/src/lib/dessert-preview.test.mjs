import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('dessert preview separates serving portions, lid fit and spoon selection',async()=>{
 const html=await readFile(new URL('../../dist/design-preview/applications/ice-cream-dessert-packaging/index.html',import.meta.url),'utf8');
 for(const text of ['Choose the serving.','Leave room for the lid.','Pick the spoon.','Served at the counter','Taken away with a lid','AI-generated scene illustration'])assert.ok(html.includes(text));
 assert.ok(html.includes('source=%2Fapplications%2Fice-cream-dessert-packaging%2F'));
 assert.ok(html.includes('<table'));
 assert.ok(!html.includes('A coordinated set.'));
});
