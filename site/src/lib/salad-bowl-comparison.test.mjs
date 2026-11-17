import test from 'node:test';
import assert from 'node:assert/strict';
import records from '../data/records.json' with { type:'json' };
import { extractProductFacts } from './product-facts.mjs';
import { saladBowlRows, saladLidRows } from '../data/salad-bowl-comparison.mjs';

test('comparison uses confirmed nominal capacities and exact catalogue rows for both bowl finishes', () => {
  const rows=saladBowlRows(records);
  assert.deepEqual(rows.map(row=>row.capacity),[500,750,1000,1100,1300,1500]);
  for(const row of rows) {
    for(const [slug,code] of [['kraft-paper-bowl',row.kraft],['cardboard-bamboo-bowl',row.white]]) {
      const original=extractProductFacts(records.find(record=>record.slug===slug)).tables[0].rows.find(cells=>cells[0]===code);
      assert.deepEqual([row.top,row.bottom,row.height,row.carton].map(String),original.slice(1));
    }
  }
});

test('lid options preserve every catalogue SKU and weight without asserting cross-product fit', () => {
  const lids=saladLidRows(records);
  assert.deepEqual(lids.map(row=>row.slug),['paper-lid','pet-lid','pp-lid','pla-lid']);
  assert.equal(lids.flatMap(row=>row.options).length,12);
  for(const lid of lids) {
    assert.deepEqual(lid.options.map(row=>[row.code,String(row.diameter),String(row.weight)]),extractProductFacts(records.find(record=>record.slug===lid.slug)).tables[0].rows);
  }
});
