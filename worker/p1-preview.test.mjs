import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker, { REDIRECTS } from './index.mjs';
import { englishInventory, localizedEntry } from '../site/src/lib/localization.mjs';

const review = JSON.parse(readFileSync(new URL('./p1-migration-fixture.json',import.meta.url),'utf8'));
const ready = review.filter(row => row.decision.startsWith('ready') || row.decision.startsWith('sitemap_'));
const assets = { ASSETS: { fetch: async () => new Response('not found', { status: 404 }) } };

test('reviewed aliases resolve directly in both encoded forms and preserve campaign query', async () => {
  for (const row of ready) {
    const expected = new URL(row.candidate_target); expected.search = '?utm_source=preview';
    for (const method of ['GET','HEAD']) {
      for (const path of [new URL(row.legacy_url).pathname, decodeURI(new URL(row.legacy_url).pathname)]) {
        const response = await worker.fetch(new Request('https://corn-comp.com'+path+'?utm_source=preview', { method }), assets);
        assert.equal(response.status,301,row.legacy_url);
        assert.equal(decodeURI(response.headers.get('location')),decodeURI(expected.href),row.legacy_url);
      }
    }
    const target = new URL(row.candidate_target).pathname;
    assert.equal(REDIRECTS.has(target) || REDIRECTS.has(decodeURI(target)),false,'redirect chain: '+target);
  }
});

test('held content and retired feed/tag routes do not silently redirect to home', async () => {
  for (const row of review.filter(row=>['hold','retain_404_no_change','test_only_no_change'].includes(row.decision))) {
    const response = await worker.fetch(new Request(row.legacy_url),assets);
    assert.equal(response.status,404,row.legacy_url);
  }
});

test('factory area is the owner-confirmed 6800 while total area stays 8000 in all home locales', () => {
  for (const lang of ['en','fr','es','ar','zh','de']) {
    const entry = lang==='en' ? englishInventory().find(item=>item.contentKey==='home') : localizedEntry(lang,'home');
    assert.match(entry.factory.text,/6[, .]?800/,lang);
    assert.match(entry.factory.text,/8[, .]?000/,lang);
    assert.doesNotMatch(JSON.stringify(entry),/6[, .]?000/,lang);
  }
  const about = readFileSync(new URL('../site/src/components/AboutPage.astro',import.meta.url),'utf8');
  assert.ok(about.includes('6,800'));
  assert.ok(!about.includes('6,000'));
});

test('all six regulation drafts cite primary EPR and PFAS sources without blanket material exemption', () => {
  const records=JSON.parse(readFileSync(new URL('../site/src/data/records.json',import.meta.url),'utf8'));
  const english=records.find(row=>row.slug==='us-state-plastic-packaging-laws-explained');
  const bodies=[english.body];
  for (const lang of ['fr','es','ar','zh','de']) {
    const locale=JSON.parse(readFileSync(new URL('../site/src/data/locales/'+lang+'.json',import.meta.url),'utf8'));
    bodies.push(locale.content['post:us-state-plastic-packaging-laws-explained'].bodyHtml);
  }
  for (const body of bodies) {
    assert.ok(body.includes('oregon.gov/deq/recycling/Pages/Producers-of-Covered-Products.aspx'));
    assert.ok(body.includes('ecology.wa.gov'));
    assert.ok(body.includes('2026-10-27'));
    assert.ok(!body.includes('Most of these laws are scoped to plastic packaging specifically'));
    assert.ok(!body.includes('None of these laws ban FSC-certified paper, PLA, or bagasse packaging outright'));
  }
});
