import test from "node:test";
import assert from "node:assert/strict";
import worker, {REDIRECTS} from "./index.mjs";
const old="/product-category/boite-a-hamburger-wrap-sandwich-pizza/";
const target="/fr/produits/boites-contenants-alimentaires/";
test("legacy French mixed food-box category redirects directly to its French replacement",async()=>{
 assert.equal(REDIRECTS.get(old),target);
 assert.equal(REDIRECTS.has(target),false);
 for(const url of ["https://corn-comp.com"+old,"https://corn-comp.com"+old.slice(0,-1),"http://www.corn-comp.com"+old+"?utm_source=legacy"]){
  const r=await worker.fetch(new Request(url),{ASSETS:{fetch(){throw new Error("Must redirect before assets");}}});
  assert.equal(r.status,301);
  assert.equal(r.headers.get("location"),"https://corn-comp.com"+target+new URL(url).search);
 }
});
