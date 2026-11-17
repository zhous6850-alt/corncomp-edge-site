import test from 'node:test';
import assert from 'node:assert/strict';
import records from '../data/records.json' with {type:'json'};
import {extractProductFacts} from './product-facts.mjs';
import {soupCupRanges,soupLidRanges} from '../data/soup-cup-comparison.mjs';
test('soup cups use confirmed nominal oz and preserve all 14 catalogue specifications',()=>{
 const ranges=soupCupRanges(records);assert.deepEqual(ranges.map(range=>range.rows.length),[5,5,4]);
 for(const range of ranges){
  const source=extractProductFacts(records.find(record=>record.slug===range.slug)).tables[0].rows;
  for(const [index,row] of range.rows.entries()){
   assert.deepEqual([row.code,row.top,row.bottom,row.height,row.carton],[source[index][0],...source[index].slice(1).map(value=>Number.parseFloat(value))]);
  }
 }
 assert.deepEqual(ranges[0].rows.map(row=>row.capacity),[8,12,16,26,32]);
 assert.deepEqual(ranges[2].rows.map(row=>row.capacity),[8,12,16,26]);
 assert.equal(ranges[0].rows[1].carton,250);assert.equal(ranges[2].rows[1].carton,500);
});
test('soup lids retain six exact references and only the documented PLA weights',()=>{
 const ranges=soupLidRanges(records);assert.equal(ranges.flatMap(range=>range.rows).length,6);
 assert.deepEqual(ranges[2].rows.map(row=>[row.code,row.diameter,row.weight]),[['CC02PLALID96',96,3.8],['CC02PLALID115',115,6.8]]);
 assert.equal(ranges[0].rows[0].weight,null);
});
