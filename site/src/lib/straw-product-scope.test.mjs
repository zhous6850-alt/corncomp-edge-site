import test from 'node:test';
import assert from 'node:assert/strict';
import records from '../data/records.json' with {type:'json'};
import {localeData} from './localization.mjs';
test('five legacy straw products use the same BPI certificate number and grammage as Quality',()=>{
 for(const id of [98,100,102,104,106]){
  const record=records.find(row=>row.id===id);
  assert.match(record.body,/10529571-1/);assert.match(record.body,/352\s*g\/m/);assert.doesNotMatch(record.body,/152\s*g\/m/);
  for(const language of ['fr','es','ar','zh','de']){
   const scope=localeData(language).content['product:'+record.slug].documentScope;
   assert.ok(scope.includes('10529571-1')&&scope.includes('352'),language+':'+record.slug);assert.doesNotMatch(scope,/152\s*(?:g|克)/);
  }
 }
});
