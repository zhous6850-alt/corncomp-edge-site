import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.mjs';

test('multiple products arrive in both email formats with paired quantities and escaped names',async()=>{
  const original=globalThis.fetch;
  let message;
  globalThis.fetch=async(url,options)=>{
    if(url.includes('/siteverify'))return Response.json({success:true});
    message=JSON.parse(options.body);
    return Response.json({id:'test'});
  };
  try {
    const response=await worker.fetch(new Request('https://corn-comp.com/api/inquiry',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      name:'Buyer',email:'buyer@example.com','cf-turnstile-response':'test',
      products:[{productName:'Cup <sample>',productSku:'C1',quantity:'1000'},{productName:'Bowl',productSku:'B1',quantity:'2000'}],
    })}),{RESEND_API_KEY:'test',TURNSTILE_SECRET_KEY:'test'});
    assert.equal(response.status,200);
    assert.match(message.text,/Product 1: Cup <sample>[\s\S]*SKU 1: C1[\s\S]*Quantity 1: 1000[\s\S]*Product 2: Bowl[\s\S]*SKU 2: B1[\s\S]*Quantity 2: 2000/);
    assert.match(message.html,/Cup &lt;sample&gt;/);
    assert.doesNotMatch(message.html,/<sample>/);
    assert.match(message.html,/Quantity 2:[\s\S]*2000/);
  } finally {globalThis.fetch=original;}
});

test('invalid product arrays are rejected before verification or email requests',async()=>{
  const original=globalThis.fetch;
  let calls=0;
  globalThis.fetch=async()=>{calls++;throw Error('Must not send');};
  try {
    for(const products of ['invalid',Array(51).fill({productName:'Cup'}),[{quantity:{bad:true}}]]) {
      const response=await worker.fetch(new Request('https://corn-comp.com/api/inquiry',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Buyer',email:'buyer@example.com',products})}),{});
      assert.equal(response.status,400);
    }
    assert.equal(calls,0);
  } finally {globalThis.fetch=original;}
});
