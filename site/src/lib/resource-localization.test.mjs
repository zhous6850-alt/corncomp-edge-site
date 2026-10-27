import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {resourceText,resourceUrl,localizeResourceHtml,localizeResourceSchema,RESOURCE_KEYS} from './resource-localization.mjs';
import {routeFor} from './localization.mjs';
import catalog from '../data/resource-localization-source.json' with {type:'json'};
test('all resource translation dictionaries cover the complete reviewed string catalog',async()=>{
  for(const language of ['fr','es','ar','zh','de']){
    const dictionary=JSON.parse(await readFile(new URL('../data/resource-translations-'+language+'.json',import.meta.url),'utf8'));
    assert.deepEqual(Object.keys(dictionary).sort(),[...catalog].sort());
    assert.ok(Object.values(dictionary).every(value=>typeof value==='string'&&value.trim()));
    assert.equal(resourceText('01526Q60104R001',language),'01526Q60104R001');
    assert.equal(resourceText('FSC',language),'FSC');
    assert.equal(resourceText('/',language),'/');
    for(const key of RESOURCE_KEYS)assert.ok(routeFor(language,key));
    assert.equal(resourceUrl('/blog/',language),'/'+language+'/blog/');
    const result=localizeResourceHtml('<h1>Read the scope.<br><span>Match the product.</span></h1><a href="/quality/">Close</a>',language);
    assert.ok(result.html.includes('href="'+routeFor(language,'architecture:quality')+'"'));
    assert.ok(!result.html.includes('>Close<'));
    assert.equal(localizeResourceSchema({'@type':'Article',headline:'Read the scope. Match the product.'},language,result.heading).headline,result.heading);
  }
});
test('all thirty published resource-family pages use the approved layouts and localized destinations',async()=>{
  const paths = [
    ['architecture:quality','quality-preview'],
    ['architecture:resources','resources-preview'],
    ['architecture:resources/guides/paper-cup-sizes','size-guide'],
    ['architecture:resources/guides/food-packaging-certifications','cert-guide'],
    ['blog','blog-preview'],
  ];
  for(const language of ['en','fr','es','ar','zh','de'])for(const [key,marker] of paths){
    const route=key==='blog'?(language==='en'?'/blog/':'/'+language+'/blog/'):routeFor(language,key);
    const html=await readFile(new URL('../../dist'+route+'index.html',import.meta.url),'utf8');
    assert.ok(html.includes('class="'+marker+'"'),route);
    assert.doesNotMatch(html,/DESIGN PREVIEW|href="\/design-preview/);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,route);
    if(language!=='en'){
      const main=html.match(/<main>[\s\S]*?<\/main>/)[0];
      assert.doesNotMatch(main,/>Close<|>Zoom in<|>Read the article</,route);
      assert.doesNotMatch(main,/href="\/(?:quality|resources|blog)\//,route);
      assert.ok(html.includes('dir="'+(language==='ar'?'rtl':'ltr')+'"'),route);
      if(language==='zh')assert.doesNotMatch(main,/食品联系我们|与文章对应|标题和中心/);
    }
    if(key==='architecture:quality')assert.doesNotMatch(html,/href="[^"]*\.pdf/);
  }
});
