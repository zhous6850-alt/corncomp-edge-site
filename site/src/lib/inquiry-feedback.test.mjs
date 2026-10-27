import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeInquiryForm } from './inquiry-form.mjs';
import { runInNewContext } from 'node:vm';

const script = '(' + initializeInquiryForm.toString() + ')(document.querySelector(), document.getElementById())';

function page(fetch, {search='', referrer=''} = {}) {
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
    URLSearchParams, fetch,
    FormData: class { *[Symbol.iterator]() { yield ['name', 'Buyer']; yield ['cf-turnstile-response', 'valid-token']; } },
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
