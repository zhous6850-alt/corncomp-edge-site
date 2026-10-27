// Mechanical fixture updates for the approved 51 products and 11 architecture pages.
import {readFile,writeFile} from 'node:fs/promises';
let p='site/src/lib/localization.test.mjs',s=await readFile(p,'utf8');
s=s.replaceAll('exactly 85','exactly 147').replaceAll(', 85',', 147').replace('architecture: 35, product: 44','architecture: 46, product: 95').replace('slice(1, 36)','slice(1, 47)').replace('slice(36, 80)','slice(47, 142)').replace('slice(80)','slice(142)').replace('length, 510','length, 882').replaceAll("source === 'PLA'","source === 'PLA' || source === 'MYPLABAG'");
await writeFile(p,s);
p='site/src/lib/product-facts.test.mjs';s=await readFile(p,'utf8');
s=s.replace("'bendy', 'sharp-edge',","'bendy', 'big-dot-paper-straws', 'printed-stripe-paper-straws', 'sharp-edge', 'small-dot-paper-straws',").replace("'stripe-colors-2',","'stripe-colors-2', 'wave-paper-straws',");
await writeFile(p,s);
