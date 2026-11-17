import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeInquiryForm } from './inquiry-form.mjs';
import { runInNewContext } from 'node:vm';

const script = '(' + initializeInquiryForm.toString() + ')(document.querySelector(), document.getElementById())';

function page(fetch, {search='', referrer='',productsController=null,token='valid-token'} = {}) {
  const handlers = {};
  const timers = [];
  const button = { disabled: false, textContent: 'Send inquiry' };
  const message = { textContent: '' };
  const close = { addEventListener: (type, handler) => { handlers.close = handler; } };
  const notice = {
    hidden: true, dataset: { success: 'Sent successfully', error: 'Please retry', sending: 'Sending' },
    querySelector: (selector) => selector === 'button' ? close : message,
    classList: { add() {}, remove() {} }, setAttribute() {},
  };
  let resets = 0;
  let widgetResets = 0;
  let prevented = false;
  const form = {
    elements: Object.fromEntries(['productName','productSku','category','sourcePath'].map(name=>[name,{value:''}])), querySelector: () => button,
    addEventListener: (type, handler) => { handlers[type] = handler; },
    reset: () => { resets++; }, setAttribute() {}, removeAttribute() {},
  };
  const location = { search, pathname: '/contact/', href: 'https://example.com/contact/' };
  runInNewContext(script, {
    URLSearchParams, fetch, initializeInquiryProducts:()=>productsController,
    FormData: class { *[Symbol.iterator]() { yield ['name', 'Buyer']; if(token)yield ['cf-turnstile-response', token]; } },
    setTimeout: (callback, delay) => { timers.push({ callback, delay }); return timers.length; }, clearTimeout() {},
    window: { location, turnstile: { reset: () => { widgetResets++; } }, dispatchEvent() {} },
    CustomEvent: class {},
    document: { referrer, querySelector: () => form, getElementById: () => notice },
  });
  return { handlers, timers, button, message, notice, location, elements:form.elements,
    submit: () => { assert.equal(typeof handlers.submit, 'function'); return handlers.submit({ preventDefault: () => { prevented = true; } }); },
    effects: () => ({ resets, widgetResets, prevented }),
  };
}

test('shared form prefills product context and preserves explicit source before referrer and pathname',()=>{
  const p=page(()=>{}, {search:'?product=Cup&sku=CC01&category=Cups&source=%2Fproducts%2Fcup%2F',referrer:'/previous/'});
  assert.equal(p.elements.productName.value,'Cup');assert.equal(p.elements.productSku.value,'CC01');
  assert.equal(p.elements.category.value,'Cups');assert.equal(p.elements.sourcePath.value,'/products/cup/');
  assert.equal(page(()=>{},{referrer:'/previous/'}).elements.sourcePath.value,'/previous/');
  assert.equal(page(()=>{}).elements.sourcePath.value,'/contact/');
});

test('multi-product requests preserve the list on failure and clear the draft only after success',async()=>{
  const products=[{productName:'Cup',productSku:'C1',quantity:'1000'},{productName:'Bowl',productSku:'B1',quantity:'2000'}];
  let cleared=0;
  const controller={append(){},serialize:()=>products,clear:()=>cleared++};
  let payload;
  const failed=page(async(url,options)=>{payload=JSON.parse(options.body);return {ok:false,json:async()=>({ok:false})};},{productsController:controller});
  await failed.submit();
  assert.deepEqual(payload.products,products);
  assert.equal(cleared,0);
  const success=page(async()=>({ok:true,json:async()=>({ok:true})}),{productsController:controller});
  await success.submit();
  assert.equal(cleared,1);
});

test('sends once in place and shows a dismissible success toast only after confirmation', async () => {
  let finish;
  const calls = [];
  const p = page((url, options) => { calls.push({ url, options }); return new Promise(resolve => { finish = resolve; }); });
  assert.equal(p.notice.hidden, true);
  const pending = p.submit();
  assert.equal(p.button.disabled, true);
  assert.equal(p.notice.hidden, true);
  await p.submit();
  assert.equal(calls.length, 1);
  finish({ ok: true, json: async () => ({ ok: true }) });
  await pending;
  assert.equal(calls[0].url, '/api/inquiry');
  assert.equal(calls[0].options.headers['content-type'], 'application/json');
  assert.equal(JSON.parse(calls[0].options.body)['cf-turnstile-response'], 'valid-token');
  assert.equal(p.location.href, 'https://example.com/contact/');
  assert.equal(p.effects().prevented, true);
  assert.equal(p.notice.hidden, false);
  assert.equal(p.message.textContent, 'Sent successfully');
  assert.equal(p.button.disabled, false);
  assert.equal(p.effects().resets, 1);
  assert.equal(p.effects().widgetResets, 1);
  assert.equal(p.timers.at(-1).delay, 5000);
  p.timers.at(-1).callback();
  assert.equal(p.notice.hidden, true);
  p.notice.hidden = false;
  p.handlers.close();
  assert.equal(p.notice.hidden, true);
});

for (const [name, response] of [
  ['verification failure', async () => ({ ok: false, json: async () => ({ ok: false }) })],
  ['mail failure', async () => ({ ok: false, json: async () => ({ ok: false }) })],
  ['network failure', async () => { throw new Error('offline'); }],
]) test(`${name} preserves input and restores the submit button`, async () => {
  const p = page(response);
  await p.submit();
  assert.equal(p.effects().resets, 0);
  assert.equal(p.button.disabled, false);
  assert.equal(p.message.textContent, 'Please retry');
  assert.equal(p.notice.hidden, false);
  assert.equal(p.timers.length, 0);
});


test('missing verification never posts, resets, or clears a multi-product draft',async()=>{
 let calls=0,clears=0;
 const p=page(async()=>{calls++;return {ok:true,json:async()=>({ok:true})};},{token:'',productsController:{append(){},serialize:()=>[{productName:'Bowl',quantity:'5000'}],clear(){clears++;}}});
 await p.submit();
 assert.equal(calls,0);assert.equal(clears,0);assert.equal(p.effects().resets,0);assert.equal(p.effects().widgetResets,0);assert.equal(p.button.disabled,false);assert.equal(p.notice.hidden,false);assert.match(p.message.textContent,/verification/i);
});
