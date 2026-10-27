import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.mjs';
import {readFileSync}from 'node:fs';
const env={ASSETS:{fetch:async()=>new Response('asset',{status:200})}};
const cases=[
 ['http://corn-comp.com/','https://corn-comp.com/'],
 ['http://corn-comp.com/about/?utm_source=a%2Bb&x=1&x=2','https://corn-comp.com/about/?utm_source=a%2Bb&x=1&x=2'],
 ['http://www.corn-comp.com/product-category/salad-bowl/?q=paper%20bowl','https://corn-comp.com/products/cups-bowls/salad-bowls/?q=paper%20bowl'],
 ['https://www.corn-comp.com/product-category/salad-bowl/','https://corn-comp.com/products/cups-bowls/salad-bowls/'],
 ['http://corn-comp.com/fr/product-category/paille-en-papier/','https://corn-comp.com/fr/produits/fournitures-restauration/pailles-papier/'],
 ['http://corn-comp.com/sitemap_index.xml','https://corn-comp.com/sitemap.xml'],
 ['http://corn-comp.com:8080/a%2Fb/%D8%A7/?x=%2F','https://corn-comp.com/a%2Fb/%D8%A7/?x=%2F'],
 ['http://corn-comp.com//evil.example/a?x=1','https://corn-comp.com//evil.example/a?x=1'],
 ['http://corn-comp.com/hello-world/','https://corn-comp.com/hello-world/'],
];
test('public GET and HEAD combine scheme, www and known legacy mapping in one permanent hop',async()=>{
 for(const [url,expected]of cases)for(const method of ['GET','HEAD']){
  const r=await worker.fetch(new Request(url,{method}),env);assert.equal(r.status,301,url);assert.equal(r.headers.get('location'),expected,url);
 }
});
test('HTTP inquiry upgrades with method-preserving 308 before validation or provider calls',async()=>{
 const r=await worker.fetch(new Request('http://www.corn-comp.com/api/inquiry?source=home',{method:'POST',body:'preview-only'}),env);
 assert.equal(r.status,308);assert.equal(r.headers.get('location'),'https://corn-comp.com/api/inquiry?source=home');
});
test('canonical HTTPS, localhost and unknown hosts are not forcibly redirected to production',async()=>{
 for(const url of ['https://corn-comp.com/','http://127.0.0.1:8777/','http://localhost:8777/','https://example.test/']){
  const r=await worker.fetch(new Request(url),env);assert.equal(r.status,200,url);
 }
});
test('all 34 approved content aliases and sitemap compatibility remain single-hop after scheme or www changes',async()=>{
 const rows=JSON.parse(readFileSync(new URL('./p1-migration-fixture.json',import.meta.url),'utf8'));
 for(const row of rows.filter(r=>r.decision.startsWith('ready')||r.decision.startsWith('sitemap_'))){
  for(const [scheme,hostname]of [['http:','corn-comp.com'],['http:','www.corn-comp.com'],['https:','www.corn-comp.com']]){
   const url=new URL(row.legacy_url);url.protocol=scheme;url.hostname=hostname;url.search='?utm_source=preserve';
   const expected=new URL(row.candidate_target);expected.search=url.search;
   const reply=await worker.fetch(new Request(url),env);assert.equal(reply.status,301,url.href);assert.equal(decodeURI(reply.headers.get('location')),decodeURI(expected.href));
  }
 }
});
