import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {routeFor,SUPPORTED_LANGUAGES} from './localization.mjs';
test('published localized quote pages retain the approved layout, five markers and WhatsApp-only contact panel',async()=>{
 for(const language of SUPPORTED_LANGUAGES){
  const html=await readFile(new URL(`../../dist${routeFor(language,'architecture:contact')}index.html`,import.meta.url),'utf8');
  assert.ok(html.includes('quote-redesign'),language);
  const section=html.match(/<section\b[^>]*quote-redesign[\s\S]*?<script src=/)[0];
  assert.ok(!section.includes('<img'));
  assert.equal((section.match(/<h1\b/g)||[]).length,1);
  assert.equal((section.match(/class="required-mark"/g)||[]).length,5);
  const contacts=section.match(/<div class="direct-options">([\s\S]*?)<div class="next-steps">/)[1];
  assert.equal((contacts.match(/<a\b/g)||[]).length,1);
  assert.ok(contacts.includes('href="https://wa.me/6581603123"'));
  assert.ok(!contacts.includes('mailto:')&&!contacts.includes('tel:'));
  assert.ok(section.includes('action="/api/inquiry" method="post"'));
  assert.ok(!section.includes('undefined'));
  assert.ok(!html.includes('/design-preview/'));
  const nodes=JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
  const contact=nodes.find(node=>node['@type']==='ContactPage');
  const organization=nodes.find(node=>node['@type']==='Organization');
  assert.ok(contact,`${language}: ContactPage`);
  assert.equal(contact.url,`https://corn-comp.com${routeFor(language,'architecture:contact')}`);
  assert.equal(contact['@id'],contact.url+'#webpage');
  assert.equal(contact.inLanguage,language==='zh'?'zh-CN':language);
  assert.equal(contact.mainEntity['@id'],organization['@id']);
  assert.equal(organization.email,'zhous6850@gmail.com');
  assert.ok(html.includes(organization.email));
  assert.equal(contact.breadcrumb['@id'],contact.url+'#breadcrumb');
  const breadcrumb=nodes.find(node=>node['@type']==='BreadcrumbList');
  assert.equal(breadcrumb['@id'],contact.breadcrumb['@id']);
  assert.equal(breadcrumb.itemListElement.at(-1).item,contact.url);
  assert.ok(!nodes.some(node=>['Product','Offer','FAQPage','Review','AggregateRating'].includes(node['@type'])));
  if(language!=='en')assert.ok(!section.includes('Tell us what you need.'));
 }
});
