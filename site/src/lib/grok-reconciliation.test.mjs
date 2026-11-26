import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {englishInventory,localizedEntry,routeFor} from './localization.mjs';
import {REDIRECTS} from '../../../worker/index.mjs';

test('reconciliation retains the approved burrito logo and food-fit guidance',()=>{
 const product=englishInventory().find(item=>item.slug==='cardboard-open-wrap-cup');
 assert.match(product.body,/Can Corncomp print my logo/);
 assert.match(product.body,/60mm bottom measurement alone does not establish/);
 assert.match(product.body,/available print area and method/);
});

test('all four salad lid ordering answers avoid generic printed-product MOQ claims in all six languages',()=>{
 for(const slug of ['paper-lid','pet-lid','pp-lid','pla-lid'])for(const language of ['en','fr','es','ar','zh','de']){
  const entry=localizedEntry(language,'product:'+slug);
  const answer=language==='en'?entry.body:entry.faq;
  assert.doesNotMatch(answer,/30[,. ]?000|50[,. ]?000/,language+':'+slug);
  assert.ok(answer.length>200,language+':'+slug);
  if(language==='en')assert.match(answer,/Lids are generally supplied without printing/);
 }
});

test('restored salad size navigation is available in each language',async()=>{
 for(const language of ['en','fr','es','ar','zh','de']){
  const route=routeFor(language,'architecture:products/cups-bowls/salad-bowls');
  const html=await readFile(new URL('../../dist'+route+'index.html',import.meta.url),'utf8');
  assert.ok(html.includes('href="#salad-specifications"'),route);
  assert.ok(html.includes('id="salad-specifications"'),route);
 }
 assert.equal(REDIRECTS.get('/resources/guides/paper-cup-sizes/'),'/products/cups-bowls/paper-cups/#paper-cup-sizes');
});
