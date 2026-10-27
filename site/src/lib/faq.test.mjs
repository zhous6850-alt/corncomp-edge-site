import test from 'node:test';
import assert from 'node:assert/strict';
import { FAQ_GROUPS } from '../data/faq.mjs';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
test('migrated FAQ preserves twelve distinct questions and qualified commercial terms',()=>{
  const items=FAQ_GROUPS.flatMap(group=>group.items);
  assert.equal(items.length,12);
  assert.equal(new Set(items.map(item=>item.id)).size,12);
  assert.ok(items.find(item=>item.id==='minimum-order').answer.includes('30,000'));
  assert.ok(items.find(item=>item.id==='minimum-order').answer.includes('50,000'));
  assert.ok(items.find(item=>item.id==='lead-time').answer.includes('shipping time is additional'));
  assert.ok(items.find(item=>item.id==='certificates').answer.includes('352'));
  assert.ok(items.find(item=>item.id==='compostability').answer.includes('PP or PET'));
  const component=readFileSync(new URL('../components/FaqPage.astro',import.meta.url),'utf8');
  assert.match(component,/FAQPage/);
  assert.match(component,/<details/);
  assert.ok(!component.includes('corncomp-yumi.pages.dev/quality'));
});

test('FAQ deep links open the requested answer on entry and hash changes',()=>{
  const source=readFileSync(new URL('../components/FaqPage.astro',import.meta.url),'utf8');
  const script=source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
  class Details { open=false; }
  const sample=new Details();
  let change;
  const window={location:{hash:'#samples'},addEventListener:(event,fn)=>{assert.equal(event,'hashchange');change=fn;}};
  const document={getElementById:id=>id==='samples'?sample:null};
  vm.runInNewContext(script,{window,document,HTMLDetailsElement:Details});
  assert.equal(sample.open,true);
  sample.open=false;
  change();
  assert.equal(sample.open,true);
  window.location.hash='#not-an-answer';
  assert.doesNotThrow(change);
});
