import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { transform } from 'esbuild';
import { isQuoteLink, applyQuoteContext } from './quote-dialog.mjs';

async function setup() {
  const source = await readFile(new URL('../components/QuoteDialog.astro', import.meta.url), 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/import \{ isQuoteLink, applyQuoteContext \}[^;]+;/, '')
    .replace("import('../lib/inquiry-form.mjs'),", 'Promise.resolve({initializeInquiryForm(){}}),');
  const listeners = {};
  const loading = {hidden:false}, error = {hidden:true}, submit = {disabled:false};
  const form = {elements:{sourcePath:{value:''}}, querySelector(selector) {
    if (selector === '[type=submit]') return submit;
    if (selector === '.cf-turnstile') return {dataset:{sitekey:'test'}};
    return {focus(){}};
  }};
  const feedback = {removeAttribute(){}};
  const mount = {hidden:false, replaceChildren(){}, querySelector: selector => selector === 'form' ? form : feedback};
  const anchor = {href:'https://corn-comp.com/contact/',hasAttribute:()=>false};
  const dialog = {dataset:{contactPath:'/contact/'},showModal(){this.open=true;},querySelector(selector) {
    return {'[data-quote-form]':mount,'[data-quote-loading]':loading,'[data-quote-error]':error}[selector] || {addEventListener(){}};
  },addEventListener(){}};
  let requests=0;
  const window = {location:{pathname:'/'},scrollY:0};
  const document = {
    querySelector:()=>dialog, body:{style:{}},documentElement:{style:{}},
    addEventListener:(name,fn)=>{listeners[name]=fn;}, importNode:node=>node,
    createElement:()=>({remove(){}}),head:{append(){}},
  };
  runInNewContext((await transform(script,{loader:'ts',format:'iife'})).code, {
    document,window,location:{origin:'https://corn-comp.com'},URL,URLSearchParams,AbortSignal,
    isQuoteLink,applyQuoteContext,setTimeout:()=>1,clearTimeout(){},
    fetch:async()=>{requests++;return {ok:true,text:async()=>'<form></form>'};},
    DOMParser:class {parseFromString(){return {querySelector:selector=>selector === '.inquiry-panel' ? {} : feedback};}},
  });
  const event = {button:0,target:{closest:()=>anchor},preventDefault(){}};
  const settle = () => new Promise(resolve=>setImmediate(resolve));
  return {listeners,event,loading,mount,error,submit,window,requests:()=>requests,settle};
}

test('first quote click exposes inputs while verification is still loading', async()=>{
  const page=await setup();
  page.listeners.click(page.event);
  await page.settle();
  assert.equal(page.mount.hidden,false,'the verification network must not hide the input fields');
  assert.equal(page.loading.hidden,true);
  assert.equal(page.submit.disabled,true,'submission remains gated while verification initializes');
  page.window.turnstile={render:()=> 'test-widget'};
  page.window.corncompTurnstileLoaded();
  await page.settle();
  assert.equal(page.submit.disabled,false);
});

test('quote intent prepares the form once without loading it on initial page setup', async()=>{
  const page=await setup();
  assert.equal(page.requests(),0);
  page.listeners.pointerover(page.event);
  await page.settle();
  assert.equal(page.requests(),1);
  page.listeners.click(page.event);
  await page.settle();
  assert.equal(page.requests(),1,'click reuses the prepared response');
});
