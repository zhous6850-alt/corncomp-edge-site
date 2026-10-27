import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {routeFor,SUPPORTED_LANGUAGES} from './localization.mjs';
test('contact forms visibly mark exactly the five required fields in every language',async()=>{
 for(const language of SUPPORTED_LANGUAGES){
  const html=await readFile(new URL(`../../dist${routeFor(language,'architecture:contact')}index.html`,import.meta.url),'utf8');
  const form=html.match(/<form\b[^>]*corncomp-inquiry-form[\s\S]*?<\/form>/)[0];
  const marked=[];
  for(const [,label] of form.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/g)){
   const field=label.match(/<(?:input|textarea)\b[^>]*name="([^"]+)"/);
   if(!field)continue;
   const required=/<(?:input|textarea)\b[^>]*\brequired(?:\s|>)/.test(label);
   const marker=/<span\b[^>]*class="required-mark"[^>]*>\s*\*\s*<\/span>/.test(label);
   assert.equal(marker,required,`${language}:${field[1]}: visible marker matches validation`);
   if(marker)marked.push(field[1]);
  }
  assert.deepEqual(marked,['name','email','company','country','message']);
  assert.ok(form.includes('required-note'));
 }
});
