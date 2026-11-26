import test from 'node:test';
import assert from 'node:assert/strict';
import records from '../data/records.json' with {type:'json'};
import {BPI_STRAW_LISTING,strawProcurementRows} from '../data/straw-procurement.mjs';
test('BPI observed list keeps 17 unique official references and stated dimensions',()=>{
 assert.equal(BPI_STRAW_LISTING.items.length,17);assert.equal(new Set(BPI_STRAW_LISTING.items.map(row=>row.sku)).size,17);
 assert.deepEqual(BPI_STRAW_LISTING.items.find(row=>row.sku==='CC6008-7-153i'),{sku:'CC6008-7-153i',diameter:7,length:153});
 assert.deepEqual(BPI_STRAW_LISTING.items.find(row=>row.sku==='CC-12-230'),{sku:'CC-12-230',diameter:12,length:230});
});
test('straw series keep their listed packing, with both sharp-edge formats',()=>{
 const rows=strawProcurementRows(records);
 const grouped=Map.groupBy(rows,row=>row.slug);
 assert.equal(grouped.size,9);
 for(const [slug,group] of grouped){
  if(slug==='sharp-edge')assert.deepEqual(group.map(row=>[row.format,row.perPack,row.packs,row.total]),[['bare',500,10,5000],['wrapped',250,20,5000]]);
  else{assert.equal(group.length,1);assert.deepEqual([group[0].perPack,group[0].packs,group[0].total],[500,10,5000]);}
 }
});
