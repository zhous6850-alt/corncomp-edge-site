import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { englishInventory } from './localization.mjs';
import { categoryForProduct } from './site-architecture.mjs';
test('service previews include every real series once in its correct category', async()=>{
 const path=new URL('../data/service-category-preview.mjs',import.meta.url);
 assert.ok(existsSync(path),'service preview configuration is missing');
 const {SERVICE_CATEGORY_PREVIEWS:configs}=await import(path.href);
 assert.equal(Object.keys(configs).length,5);
 for(const [category,config] of Object.entries(configs)){
  const slugs=config.sections.flatMap(section=>section.slugs);
  const products=englishInventory().filter(item=>item.type==='product'&&categoryForProduct(item.slug)?.slug===category);
  assert.deepEqual([...slugs].sort(),products.map(item=>item.slug).sort());
  assert.equal(new Set(slugs).size,slugs.length);
  assert.equal(new Set(products.map(item=>item.featuredMedia.localPath)).size,products.length);
 }
});
