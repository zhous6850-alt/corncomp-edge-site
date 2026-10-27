import {readFile,writeFile,readdir} from 'node:fs/promises';
import {series} from './catalogue-source.mjs';
import {englishInventory,allLocalizedEntries} from '../site/src/lib/localization.mjs';
import {extractProductFacts} from '../site/src/lib/product-facts.mjs';
const inventory=englishInventory();
const baselineSlugs=new Set(JSON.parse(await readFile('docs/qa/catalogue-route-baseline.json','utf8')).products.map(x=>x.slug));
const coverage=series.map(([pdfPage,printedPage,categorySlug,productSlug,sourceName])=>{
 const record=inventory.find(x=>x.type==='product'&&x.slug===productSlug);
 return {seriesKey:productSlug,sourceName,pdfPage,printedPages:[printedPage],categorySlug,productSlug,status:baselineSlugs.has(productSlug)?'existing':'new',specificationRows:record?extractProductFacts(record).tables.reduce((n,t)=>n+t.rows.length,0):0,imageSource:`Corncomp Catalogue(1).pdf, physical page ${pdfPage}`,unresolved:baselineSlugs.has(productSlug)?['Recheck existing specifications against this catalogue edition.']:['Specification transcription pending visual verification.']};
});
await writeFile('site/src/data/catalogue-coverage.json',JSON.stringify(coverage,null,2)+'\n');
const baselinePath='docs/qa/catalogue-route-baseline.json';
try{await readFile(baselinePath)}catch{
 const html=await readdir('site/dist',{recursive:true});
 await writeFile(baselinePath,JSON.stringify({routes:html.filter(p=>p.endsWith('.html')).map(p=>'/'+p.replaceAll('\\','/').replace(/index\.html$/,'')),entries:allLocalizedEntries().map(x=>({language:x.language,contentKey:x.contentKey,route:x.route})),products:inventory.filter(x=>x.type==='product').map(x=>({slug:x.slug,route:x.route}))},null,2)+'\n');
}
console.log({series:coverage.length,existing:coverage.filter(x=>x.status==='existing').length,new:coverage.filter(x=>x.status==='new').length});
