import test from 'node:test';
import assert from 'node:assert/strict';
import { appendInquiryProduct, readInquiryProducts, productFromParams } from './inquiry-products.mjs';

test('new product requests append without replacing edited quantities or duplicating SKUs',()=>{
  const rows=[{productName:'Buyer edited cup',productSku:'CC01',quantity:'50000',category:'Cups'}];
  assert.deepEqual(appendInquiryProduct(rows,{productName:'Cup',productSku:'cc01'}),rows);
  const added=appendInquiryProduct(rows,{productName:'Bowl',productSku:'CC02'});
  assert.equal(added.length,2);
  assert.equal(added[0].quantity,'50000');
  assert.equal(added[1].productSku,'CC02');
  assert.equal(rows.length,1);
  assert.equal(appendInquiryProduct([{}],{productName:'Cup'}).length,1);
  assert.equal(appendInquiryProduct(rows,{}).length,1);
  assert.equal(appendInquiryProduct([{}],{category:'Cups'})[0].category,'Cups');
  assert.equal(appendInquiryProduct([{category:'Cups'}],{category:'Cups'}).length,1);
});

test('request parsing keeps product, SKU and quantity paired and supports old single-product requests',()=>{
  const products=[{productName:'Cup',productSku:'C1',quantity:'1000'},{productName:'Bowl',productSku:'B1',quantity:'2000'}];
  assert.deepEqual(readInquiryProducts({products}).map(({productSku,quantity})=>[productSku,quantity]),[['C1','1000'],['B1','2000']]);
  assert.equal(readInquiryProducts({productName:'Cup',productSku:'C1'})[0].productSku,'C1');
  assert.deepEqual(readInquiryProducts({products:[{}]}),[]);
  assert.throws(()=>readInquiryProducts({products:'Cup'}));
  assert.throws(()=>readInquiryProducts({products:[{productName:{}}]}));
  assert.throws(()=>readInquiryProducts({products:Array(51).fill({productName:'Cup'})}));
  assert.throws(()=>readInquiryProducts({products:[{productName:'x'.repeat(301)}]}));
  assert.equal(productFromParams(new URLSearchParams('product=Cup&sku=C1')).productSku,'C1');
});
