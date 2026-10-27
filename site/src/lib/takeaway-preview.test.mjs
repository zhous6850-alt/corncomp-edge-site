import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('takeaway preview follows the packing journey with honest imagery and product enquiries',async()=>{
 const html=await readFile(new URL('../../dist/design-preview/applications/takeaway-packaging/index.html',import.meta.url),'utf8');
 for(const text of ['Pack the meal.','Choose a second format.','Plan the handover.','AI-generated scene illustration'])assert.ok(html.includes(text));
 assert.ok(html.includes('id="packing-journey"'));
 assert.ok(!html.includes('A coordinated set.'));
 assert.ok(html.includes('source=%2Fapplications%2Ftakeaway-packaging%2F'));
 assert.equal((html.match(/class="journey-step"/g)||[]).length,3);
});
