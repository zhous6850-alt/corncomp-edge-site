import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {englishInventory,routeFor,SUPPORTED_LANGUAGES} from './localization.mjs';
import {SERVICE_CATEGORY_PREVIEWS} from '../data/service-category-preview.mjs';
test('published service group and five ranges retain every product and localized canonical navigation',async()=>{
 for(const language of SUPPORTED_LANGUAGES){
  const group=await readFile(new URL(`../../dist${routeFor(language,'architecture:products/foodservice-supplies')}index.html`,import.meta.url),'utf8');
  assert.ok(group.includes('group-preview'),language);
  assert.equal((group.match(/class="range-card"/g)||[]).length,5);
  assert.ok(!group.includes('/design-preview/'));
  for(const [category,config] of Object.entries(SERVICE_CATEGORY_PREVIEWS)){
   const route=routeFor(language,`architecture:products/foodservice-supplies/${category}`);
   assert.ok(group.includes(route));
   const html=await readFile(new URL(`../../dist${route}index.html`,import.meta.url),'utf8');
   assert.ok(html.includes('category-preview'));
   assert.ok(!html.includes('/design-preview/'));
   assert.ok(!html.includes('DESIGN PREVIEW'));
   assert.ok(!html.includes('undefined'));
   assert.equal((html.match(/<h1\b/g)||[]).length,1);
   for(const section of config.sections){
    assert.ok(html.includes(`id="${section.id}"`));
    for(const slug of section.slugs){
     const item=englishInventory().find(item=>item.type==='product'&&item.slug===slug);
     assert.ok(html.includes(routeFor(language,item.contentKey)));
     assert.equal(html.split(`src="${item.featuredMedia.localPath}"`).length-1,1);
    }
   }
   if(language==='ar')assert.ok(html.includes('dir="rtl"'));
  }
 }
});
