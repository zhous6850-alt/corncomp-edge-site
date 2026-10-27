import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
test('certification guide preview retains real document scope and source verification paths',async()=>{
  const html=await readFile(new URL('../../dist/design-preview/certification-guide/index.html',import.meta.url),'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  for(const id of ['document-types','read-certificate','verify','checklist','official','document-viewer'])assert.ok(html.includes('id="'+id+'"'));
  for(const value of ['01526Q60104R001','2029-04-27','Ningbo Corncomp Tech Co., Ltd.','export only','Certificate review checklist','search.fsc.org','products.bpiworld.org','directory.brcgs.com','www.fda.gov','food.ec.europa.eu'])assert.ok(html.includes(value),value);
  assert.equal((html.match(/class="document-type"/g)||[]).length,4);
  assert.ok(html.includes('href="/quality/"'));
  assert.doesNotMatch(html,/href="[^"]*\.pdf/);
  const formal=await readFile(new URL('../../dist/resources/guides/food-packaging-certifications/index.html',import.meta.url),'utf8');
  assert.match(formal,/class="cert-guide"/);
  assert.doesNotMatch(formal,/DESIGN PREVIEW/);
});
