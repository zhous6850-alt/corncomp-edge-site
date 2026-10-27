import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {englishInventory,routeFor} from './localization.mjs';
import {categoryForProduct} from './site-architecture.mjs';
test('bagasse previews cover all ten genuine series once in their correct categories',async()=>{
 const path=new URL('../data/bagasse-category-preview.mjs',import.meta.url);
 assert.ok(existsSync(path),'bagasse preview configuration is missing');
 const {BAGASSE_CATEGORY_PREVIEWS:configs}=await import(path.href);
 assert.equal(Object.keys(configs).length,4);
 const actual=[];
 for(const [category,config] of Object.entries(configs)){
  const products=englishInventory().filter(item=>item.type==='product'&&categoryForProduct(item.slug)?.slug===category);
  const slugs=config.sections.flatMap(section=>section.slugs);
  assert.deepEqual([...slugs].sort(),products.map(item=>item.slug).sort());
  assert.equal(new Set(products.map(item=>item.featuredMedia.localPath)).size,products.length);
  actual.push(...slugs);
 }
 assert.equal(actual.length,10);
 assert.equal(new Set(actual).size,10);
});
test('bagasse preview links reach four complete ranges and leave formal routes unchanged',async()=>{
 const groupPath=new URL('../../dist/design-preview/bagasse/index.html',import.meta.url);
 assert.ok(existsSync(groupPath),'bagasse group preview has not been built');
 const group=await readFile(groupPath,'utf8');
 assert.equal((group.match(/class="range-card"/g)||[]).length,4);
 const {BAGASSE_CATEGORY_PREVIEWS:configs}=await import('../data/bagasse-category-preview.mjs');
 for(const [category,config] of Object.entries(configs)){
  assert.ok(group.includes(`/design-preview/bagasse/${category}/`));
  const html=await readFile(new URL(`../../dist/design-preview/bagasse/${category}/index.html`,import.meta.url),'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes('object-fit: contain'));
  for(const section of config.sections){
   assert.ok(html.includes(`id="${section.id}"`));
   for(const slug of section.slugs){
    const item=englishInventory().find(item=>item.type==='product'&&item.slug===slug);
    assert.ok(html.includes(routeFor('en',item.contentKey)),slug);
    assert.equal(html.split(`src="${item.featuredMedia.localPath}"`).length-1,1,slug);
   }
  }
 }
 const formal=await readFile(new URL('../../dist/products/bagasse/index.html',import.meta.url),'utf8');
 assert.ok(!formal.includes('/design-preview/'));
 assert.ok(formal.includes('group-preview'));
});
