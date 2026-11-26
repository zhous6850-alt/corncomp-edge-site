import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {parse} from 'parse5';
import {routeFor} from './localization.mjs';

const languages=['en','fr','es','ar','zh','de'];
const keys=['architecture:custom-packaging','architecture:custom-packaging/custom-printed-paper-cups','architecture:custom-packaging/custom-paper-straws','architecture:about/factory'];
function main(html){const root=parse(html);let found;function visit(n){if(n.tagName==='main'&&!found)found=n;for(const c of n.childNodes||[])visit(c);}visit(root);return found;}
function shape(root){const out=[];function visit(n){if(['h1','h2','h3','img','figure','section'].includes(n.tagName))out.push(n.tagName+(n.tagName==='section'?':'+(n.attrs.find(a=>a.name==='id')?.value||''):''));for(const c of n.childNodes||[])visit(c);}visit(root);return out;}
test('custom services and factory share the English sections, product images and heading structure in every language',async()=>{
 for(const key of keys){
  const english=await readFile(new URL('../../dist'+routeFor('en',key)+'index.html',import.meta.url),'utf8');
  for(const language of languages.slice(1)){
   const route=routeFor(language,key);const html=await readFile(new URL('../../dist'+route+'index.html',import.meta.url),'utf8');
   assert.deepEqual(shape(main(html)),shape(main(english)),route+' structural parity');
   assert.equal((html.match(/<h1\b/g)||[]).length,1,route);
   assert.ok(html.includes('https://corn-comp.com'+route),route+' canonical');
   assert.doesNotMatch(html,/href="\/design-preview\//,route);
  }
 }
});

test('all FAQ languages retain twelve questions, translated answers, localized schema and reciprocal alternates',async()=>{
 const {faqAlternates}=await import('./faq-routes.mjs');
 for(const {language,route}of faqAlternates){
  const html=await readFile(new URL('../../dist'+route+'index.html',import.meta.url),'utf8');
  assert.equal((html.match(/<details id=/g)||[]).length,12,route);
  assert.match(html,new RegExp('lang="'+(language==='zh'?'zh-CN':language)+'"'));
  const schemas=JSON.parse(html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)[1]);
  const faq=schemas.find(node=>node['@type']==='FAQPage');
  assert.equal(faq.mainEntity.length,12,route);
  assert.equal(faq.url,'https://corn-comp.com'+route,route);
  if(language!=='en')assert.notEqual(faq.mainEntity[0].name,'What is your minimum order quantity?',route);
  for(const alt of faqAlternates)assert.ok(html.includes('hreflang="'+(alt.language==='zh'?'zh-CN':alt.language)+'" href="https://corn-comp.com'+alt.route+'"'),route);
 }
});

test('all six articles retain English comparison tables in every locale',async()=>{
 const {englishInventory,localizedEntry}=await import('./localization.mjs');
 for(const source of englishInventory().filter(item=>item.type==='post'))for(const language of languages.slice(1)){
  const count=html=>(html.match(/<table\b/g)||[]).length;
  assert.equal(count(localizedEntry(language,source.contentKey).bodyHtml),count(source.body),language+':'+source.slug);
 }
});

test('shared custom, factory and FAQ templates do not leave untranslated English sentences',async()=>{
 function sentences(root){const texts=[];function visit(node){if(['script','style'].includes(node.tagName))return;if(node.nodeName==='#text'){const text=node.value.trim().replace(/\s+/g,' ');if(text.length>24&&text.split(' ').length>=4&&/[a-z]/i.test(text)&&text!=='Ningbo · Zhejiang · China')texts.push(text);}for(const child of node.childNodes||[])visit(child);}visit(root);return new Set(texts);}
 for(const key of [...keys,'faq']){
  const route=language=>key==='faq'?(language==='en'?'':'/'+language)+'/faq/':routeFor(language,key);
  const source=sentences(main(await readFile(new URL('../../dist'+route('en')+'index.html',import.meta.url),'utf8')));
  for(const language of languages.slice(1)){
   const translated=sentences(main(await readFile(new URL('../../dist'+route(language)+'index.html',import.meta.url),'utf8')));
   assert.deepEqual([...source].filter(text=>translated.has(text)),[],language+':'+key);
  }
 }
});
