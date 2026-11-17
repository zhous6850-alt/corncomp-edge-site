import test from 'node:test';
import assert from 'node:assert/strict';
import records from '../data/records.json' with {type:'json'};
import {paperCupSizeRows,SIZE_SOURCE} from '../data/paper-cup-sizes.mjs';
import {extractProductFacts} from './product-facts.mjs';
test('size guide retains seven single-wall catalogue rows without converting SKU labels to volume',()=>{
 const rows=paperCupSizeRows(records.filter(record=>record.language==='en'));
 const table=extractProductFacts(records.find(record=>record.language==='en'&&record.slug===SIZE_SOURCE)).tables.find(table=>table.headers[0]==='Item No.');
 assert.equal(rows.length,7);
 assert.deepEqual(rows,table.rows.map(([code,volume,top,bottom,height])=>({code,volume:parseFloat(volume),top:parseFloat(top),bottom:parseFloat(bottom),height:parseFloat(height)})));
 assert.deepEqual(rows.map(row=>row.volume),[120,180,240,300,360,480,600]);
 assert.deepEqual(rows.find(row=>row.code==='CC01HCUP12'),{code:'CC01HCUP12',volume:360,top:90,bottom:60,height:112});
});
