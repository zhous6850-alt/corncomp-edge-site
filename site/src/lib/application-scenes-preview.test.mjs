import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {APPLICATION_SCENES} from '../data/application-scenes.mjs';
test('five scene previews have unique imagery, contextual enquiries and linked navigation',async()=>{
 const hub=await readFile(new URL('../../dist/design-preview/applications/index.html',import.meta.url),'utf8');
 for(const scene of APPLICATION_SCENES){
  const path='/design-preview/applications/'+scene.slug+'/';
  const html=await readFile(new URL('../../dist'+path+'index.html',import.meta.url),'utf8');
  assert.ok(hub.includes(path));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes('source=%2Fapplications%2F'+scene.slug+'%2F'));
  assert.ok(html.includes('href="/design-preview/applications/"'));
  const main=html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)[0];
  const images=[...main.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.includes('logo'));
  const imageCount=4;
  assert.equal(images.length,imageCount);
  assert.equal(new Set(images).size,imageCount);
  if(scene.slug==='supermarket-packaging'){
   assert.ok(html.includes('AI-generated scene illustration'));
   assert.ok(html.includes('Sushi &amp; small portions'));
   assert.ok(html.includes('filled sample'));
  }
  assert.ok(!html.includes('842-corncomp-menu-box'));
 }
});
