import test from 'node:test';
import assert from 'node:assert/strict';
import records from '../data/records.json' with {type:'json'};
import {BPI_STRAW_LISTING,strawProcurementRows} from '../data/straw-procurement.mjs';
test('BPI observed list keeps 17 unique official references and stated dimensions',()=>{
 assert.equal(BPI_STRAW_LISTING.items.length,17);assert.equal(new Set(BPI_STRAW_LISTING.items.map(row=>row.sku)).size,17);
 assert.deepEqual(BPI_STRAW_LISTING.items.find(row=>row.sku==='CC6008-7-153i'),{sku:'CC6008-7-153i',diameter:7,length:153});
 assert.deepEqual(BPI_STRAW_LISTING.items.find(row=>row.sku==='CC-12-230'),{sku:'CC-12-230',diameter:12,length:230});
});
test('nine straw series retain their listed 500 by 10 standard packing',()=>{
 const rows=strawProcurementRows(records);assert.equal(rows.length,9);
 for(const row of rows)assert.deepEqual([row.perPack,row.packs,row.total],[500,10,5000]);
});
