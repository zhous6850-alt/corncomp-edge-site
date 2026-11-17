import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {routeFor} from './localization.mjs';
import {COMPANY_CLAIMS} from '../data/company-claims.mjs';
test('company pages retain confirmed figures and qualified GMP terminology without asserting a GMP certificate or actual annual output',()=>{
 for(const language of ['en','fr','es','ar','zh','de']){
  const t=COMPANY_CLAIMS[language];
  for(const key of ['home','architecture:about','architecture:about/factory']){
   const route=routeFor(language,key),html=readFileSync(new URL('../../dist'+route+'index.html',import.meta.url),'utf8');
   const text=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
   assert.match(text,/6[, .]?800/,route);assert.match(text,/8[, .]?000/,route);assert.ok(text.includes('GMP'),route);
   assert.ok(text.includes(t.source),route+': dated company-provided context');
   assert.doesNotMatch(text,/GMP-certified|GMP certification awarded|GMP认证证书|GMP-zertifiziert/i,route);
  }
 }
 assert.equal(COMPANY_CLAIMS.zh.capacity,'25亿根');
 assert.equal(COMPANY_CLAIMS.en.capacity,'2.5 billion');
});
