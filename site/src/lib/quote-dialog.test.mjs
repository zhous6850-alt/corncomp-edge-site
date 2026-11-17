import test from 'node:test';
import assert from 'node:assert/strict';
import { isQuoteLink, applyQuoteContext } from './quote-dialog.mjs';

test('quote and contact links open the dialog while the fallback still opens the contact page',()=>{
  const context={origin:'https://corn-comp.com',contactPath:'/zh/contact/',quoteLabel:'获取报价'};
  assert.equal(isQuoteLink({href:'/zh/contact/',text:'获取报价 →'},context),true);
  assert.equal(isQuoteLink({href:'/zh/contact/?product=Cup&sku=CC01',text:'询盘',primary:true},context),true);
  assert.equal(isQuoteLink({href:'/zh/contact/',text:'联系我们'},context),true);
  assert.equal(isQuoteLink({href:'/zh/contact/',bypass:true},context),false);
  assert.equal(isQuoteLink({href:'https://other.example/zh/contact/',text:'获取报价'},context),false);
  assert.equal(isQuoteLink({href:'/products/',text:'获取报价'},context),false);
});

test('product quote actions append through the shared controller instead of overwriting fields',()=>{
  const calls=[];
  let saves=0;
  const form={elements:{sourcePath:{value:''}},inquiryProducts:{append:params=>calls.push(params.get('sku')),save:()=>saves++}};
  applyQuoteContext(form,new URLSearchParams('product=Cup&sku=C1'),'/cup/');
  applyQuoteContext(form,new URLSearchParams('product=Bowl&sku=B1'),'/bowl/');
  assert.deepEqual(calls,['C1','B1']);
  assert.equal(form.elements.sourcePath.value,'/bowl/');
  assert.equal(saves,2);
});
test('quote context carries product information but reopening a general quote preserves input',()=>{
  const fields=Object.fromEntries(['productName','productSku','category','sourcePath'].map(name=>[name,{value:''}]));
  applyQuoteContext(fields,new URLSearchParams('product=Cup&sku=CC01&category=Cups'),'/products/cup/');
  assert.equal(fields.productName.value,'Cup');assert.equal(fields.productSku.value,'CC01');
  fields.productName.value='Buyer edited cup';
  applyQuoteContext(fields,new URLSearchParams(),'/');
  assert.equal(fields.productName.value,'Buyer edited cup');
  assert.equal(fields.sourcePath.value,'/');
});
