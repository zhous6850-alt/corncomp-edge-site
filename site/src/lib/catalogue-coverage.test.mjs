import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PRODUCT_CATEGORIES, PRODUCT_GROUPS, canonicalProductRoute } from './site-architecture.mjs';
import records from '../data/records.json' with {type:'json'};
import {extractProductFacts} from './product-facts.mjs';
import {englishInventory,localizedEntry,SUPPORTED_LANGUAGES,uiFor} from './localization.mjs';
import {localizedProductBody} from './product-facts.mjs';

test('CC01TRAY6 top dimensions match printed catalogue page 16', () => {
 const tray = records.find(x=>x.language==='en'&&x.slug==='kraft-paper-tray');
 const row = extractProductFacts(tray).tables.flatMap(t=>t.rows).find(r=>r[0]==='CC01TRAY6');
 assert.equal(row[1], '224 x 140');
});

test('catalogue series retain traceable unique identities', async () => {
  const file = new URL('../data/catalogue-coverage.json', import.meta.url);
  const coverage = JSON.parse(await readFile(file, 'utf8').catch(() => '[]'));
  assert.ok(coverage.length > 44, 'the full catalogue includes series missing from the old 44 products');
  assert.equal(new Set(coverage.map(x => x.seriesKey)).size, coverage.length);
  for (const row of coverage) {
    assert.ok(row.pdfPage >= 2 && row.pdfPage <= 25, row.seriesKey);
    assert.ok(row.printedPages.length && row.sourceName && row.categorySlug, row.seriesKey);
    assert.ok(row.productSlug || row.unresolved.length, row.seriesKey);
    assert.ok(['existing', 'new', 'unresolved'].includes(row.status), row.seriesKey);
  }
});

test('each catalogue series has a real product with specification rows', async()=>{
 const coverage=JSON.parse(await readFile(new URL('../data/catalogue-coverage.json',import.meta.url),'utf8'));
 for(const row of coverage){
  const record=records.find(x=>x.language==='en'&&x.type==='product'&&x.slug===row.productSlug);
  assert.ok(record,row.productSlug);
  assert.ok(extractProductFacts(record).tables.some(t=>t.rows.length),row.productSlug);
  assert.ok(record.featuredMedia?.localPath,row.productSlug);
 }
});

test('catalogue categories cover trays, bags and bagasse without moving old product routes', async () => {
  assert.equal(PRODUCT_GROUPS.length, 4);
  for (const slug of ['paper-trays','square-food-boxes','round-food-boxes','menu-boxes','paper-bags','compostable-waste-bags','bagasse-plates','bagasse-bowls','bagasse-trays','bagasse-clamshells']) {
    assert.ok(PRODUCT_CATEGORIES.some(x=>x.slug===slug),slug);
  }
  const baseline=JSON.parse(await readFile(new URL('../../../docs/qa/catalogue-route-baseline.json',import.meta.url),'utf8'));
  for(const {slug,route} of baseline.products) assert.equal(canonicalProductRoute(slug),route,slug);
});

test('waste bag catalogue reference is preserved as an item code',()=>{
 const record=records.find(x=>x.slug==='compostable-waste-bag');
 assert.deepEqual(extractProductFacts(record).itemCodes,['MYPLABAG']);
});

test('new products retain every structured specification row across all six languages',async()=>{
 const coverage=JSON.parse(await readFile(new URL('../data/catalogue-coverage.json',import.meta.url),'utf8'));
 for(const row of coverage.filter(x=>x.status==='new')){
  const source=englishInventory().find(x=>x.contentKey===`product:${row.productSlug}`);
  const facts=extractProductFacts(source);
  assert.equal(facts.tables.reduce((n,t)=>n+t.rows.length,0),row.specificationRows,row.seriesKey);
  for(const language of SUPPORTED_LANGUAGES){
   const entry=localizedEntry(language,source.contentKey);
   assert.ok(entry?.title&&entry.route,`${language}:${row.seriesKey}`);
   if(language==='en')continue;
   const ui=uiFor(language);
   const translated={tables:facts.tables.map(t=>({headers:t.headers,rows:t.rows.map(r=>r.map(cell=>ui.specificationValues?.[cell]||cell))}))};
   const html=localizedProductBody(entry,translated,ui);
   const actual=extractProductFacts({slug:source.slug,body:html});
   assert.deepEqual(actual.tables.map(t=>t.rows),translated.tables.map(t=>t.rows),`${language}:${row.seriesKey}`);
   assert.deepEqual(actual.itemCodes,facts.itemCodes,`${language}:${row.seriesKey}`);
  }
 }
});

test('every pre-expansion canonical URL still has a built page',async()=>{
 const baseline=JSON.parse(await readFile(new URL('../../../docs/qa/catalogue-route-baseline.json',import.meta.url),'utf8'));
 for(const entry of baseline.entries){
  assert.equal(localizedEntry(entry.language,entry.contentKey)?.route,entry.route,entry.contentKey);
  assert.ok((await readFile(new URL(`../../dist/${entry.route.slice(1)}index.html`,import.meta.url),'utf8')).includes('<html'),entry.route);
 }
});
