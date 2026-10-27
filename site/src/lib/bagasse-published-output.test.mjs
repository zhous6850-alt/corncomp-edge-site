import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {englishInventory,routeFor,SUPPORTED_LANGUAGES} from './localization.mjs';
import {BAGASSE_CATEGORY_PREVIEWS} from '../data/bagasse-category-preview.mjs';
test('published bagasse group and four ranges use localized canonical links without preview content',async()=>{
 for(const language of SUPPORTED_LANGUAGES){
  const group=await readFile(new URL(`../../dist${routeFor(language,'architecture:products/bagasse')}index.html`,import.meta.url),'utf8');
  assert.ok(group.includes('group-preview'),language);
  assert.ok(!group.includes('/design-preview/'));
  assert.ok(!group.includes('DESIGN PREVIEW'));
  for(const [category,config] of Object.entries(BAGASSE_CATEGORY_PREVIEWS)){
   const route=routeFor(language,`architecture:products/bagasse/${category}`);
   assert.ok(group.includes(route));
   const html=await readFile(new URL(`../../dist${route}index.html`,import.meta.url),'utf8');
   assert.ok(html.includes('category-preview'),`${language}:${category}`);
   assert.ok(!html.includes('/design-preview/'));
   assert.ok(!html.includes('DESIGN PREVIEW'));
   assert.ok(!html.includes('undefined'));
   assert.equal((html.match(/<h1\b/g)||[]).length,1);
   for(const slug of config.sections.flatMap(section=>section.slugs)){
    const item=englishInventory().find(item=>item.type==='product'&&item.slug===slug);
    assert.ok(html.includes(routeFor(language,item.contentKey)),`${language}:${slug}`);
    assert.equal(html.split(`src="${item.featuredMedia.localPath}"`).length-1,1);
   }
   if(language==='ar')assert.ok(html.includes('dir="rtl"'));
  }
 }
 const service=await readFile(new URL('../../dist/products/foodservice-supplies/index.html',import.meta.url),'utf8');
 assert.ok(service.includes('group-preview'),'approved foodservice design uses published layout');
});
