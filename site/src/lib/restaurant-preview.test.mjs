import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('restaurant preview plans service by menu, drinks and accessories',async()=>{
 const html=await readFile(new URL('../../dist/design-preview/applications/restaurant-packaging/index.html',import.meta.url),'utf8');
 for(const text of ['Serve the meal.','Plan the drinks.','Set out the essentials.','AI-generated scene illustration','id="service-check"'])assert.ok(html.includes(text));
 assert.equal((html.match(/class="service-choice"/g)||[]).length,3);
 assert.ok(html.includes('source=%2Fapplications%2Frestaurant-packaging%2F'));
 assert.ok(!html.includes('A coordinated set.'));
});
