import test from 'node:test';
import assert from 'node:assert/strict';
import records from '../data/records.json' with {type:'json'};
import {extractProductFacts} from './product-facts.mjs';
import {paperCupSeries,paperCupLids,paperCupSleeves} from '../data/paper-cup-comparison.mjs';
test('paper cup comparisons use per-series listed volumes and do not invent bagasse capacity',()=>{
 const series=paperCupSeries(records);assert.equal(series.length,9);
 for(const row of series){
  const table=extractProductFacts(records.find(record=>record.slug===row.slug)).tables.find(table=>table.headers[0]==='Item No.');
  assert.equal(row.count,table.rows.length);
  const volume=table.headers.findIndex(header=>header==='Volume');
  assert.deepEqual(row.capacities,volume<0?[]:[...new Set(table.rows.map(cells=>Number.parseFloat(cells[volume])))]);
 }
 assert.deepEqual(series.find(row=>row.slug==='single-wall-bagasse-paper-cup').capacities,[]);
 assert.deepEqual(series.find(row=>row.slug==='single-wall-white-cardboard-paper-cup').capacities,[120,180,240,300,360,480,600]);
});
test('lid comparison keeps all exact references and sleeve groups without a volume-based fit claim',()=>{
 const lids=paperCupLids(records);assert.deepEqual(lids.map(row=>row.diameter),[63,75,80,90]);
 assert.equal(lids[3].white,'CC02HCLID10-20W');assert.equal(lids[3].black,'CC02HCLID10-20');
 const sleeves=paperCupSleeves(records);assert.deepEqual(sleeves.map(row=>row.code),['CC01CUPSL8','CC02CUPSL16']);assert.equal(sleeves[1].group,'12/16/20oz');
});
