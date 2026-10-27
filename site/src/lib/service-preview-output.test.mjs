import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { englishInventory, routeFor } from './localization.mjs';
import { SERVICE_CATEGORY_PREVIEWS } from '../data/service-category-preview.mjs';
test('service preview navigation reaches all five complete ranges without changing formal pages',async()=>{
 const group=await readFile(new URL('../../dist/design-preview/foodservice-supplies/index.html',import.meta.url),'utf8');
 assert.equal((group.match(/class="range-card"/g)||[]).length,5);
 const inventory=englishInventory();
 for(const [category,config] of Object.entries(SERVICE_CATEGORY_PREVIEWS)){
  assert.ok(group.includes(`/design-preview/service/${category}/`));
  const html=await readFile(new URL(`../../dist/design-preview/service/${category}/index.html`,import.meta.url),'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  for(const section of config.sections){
   assert.ok(html.includes(`id="${section.id}"`));
   for(const slug of section.slugs){
    const item=inventory.find(item=>item.type==='product'&&item.slug===slug);
    assert.ok(html.includes(routeFor('en',item.contentKey)),slug);
    assert.equal(html.split(`src="${item.featuredMedia.localPath}"`).length-1,1,slug);
   }
  }
  assert.ok(html.includes('object-fit: contain'));
 }
 const formal=await readFile(new URL('../../dist/products/foodservice-supplies/index.html',import.meta.url),'utf8');
 assert.ok(!formal.includes('/design-preview/'));
 assert.ok(formal.includes('service-preview'));
});
