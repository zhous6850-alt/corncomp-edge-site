import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {additions} from './catalogue-additions.mjs';
import {series} from './catalogue-source.mjs';
const load=async path=>JSON.parse(await readFile(path,'utf8'));
const save=(path,data)=>writeFile(path,JSON.stringify(data,null,2)+'\n');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const table=(headers,rows)=>`<table><thead><tr>${headers.map(x=>`<th>${escape(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${escape(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const records=await load('site/src/data/records.json');
const media=await load('site/src/data/media.json');
const coverage=await load('site/src/data/catalogue-coverage.json');
const crops=[];
for(const [index,[slug,data]] of Object.entries(additions).entries()){
 const row=coverage.find(x=>x.productSlug===slug);
 const id=20000+index;
 const path=`/media/catalogue/${slug}.webp`;
 const title=row.sourceName;
 const body=`<p>${escape(title)} from the Corncomp catalogue. Compare the listed options and confirm the selected item for your order.</p><h2>Catalogue specifications</h2>${table(data.headers,data.rows)}<h2>Ordering information</h2><p>Dimensions are in mm unless another unit is shown. Packing expressions indicate pieces per inner pack multiplied by packs per carton. Confirm product suitability, lid fit, packing and required documentation before ordering.</p>${data.notes.length?'<p>Some catalogue details require confirmation before ordering. Please request the current specification for this series.</p>':''}`;
 const record={id,type:'product',slug,language:'en',route:`/product/${slug}/`,title,body,excerpt:`<p>${escape(title)}. Compare catalogue dimensions and item references.</p>`,featuredMediaId:id,categoryIds:[],seo:{title:`${title} | Corncomp`,description:`${title}: compare Corncomp catalogue specifications and request a quote for the selected item.`,focusKeyword:title.toLowerCase(),canonical:''},featuredMedia:{id,sourceUrl:'',localPath:path,alt:title},custom:{_cc_material:row.categorySlug.startsWith('bagasse-')?'Bagasse':'See catalogue series',_cc_moq:'Confirm for the order',_cc_lead_time:'Confirm for the order',_cc_certification:'Item-specific documentation to be confirmed for the order'}};
 const old=records.findIndex(x=>x.id===id);
 if(old<0)records.push(record);else records[old]=record;
 const asset={id,localPath:path,source_url:'',alt_text:title,media_details:{width:1200,height:900},mime_type:'image/webp',filename:slug+'.webp'};
 const oldMedia=media.findIndex(x=>x.id===id);
 if(oldMedia<0)media.push(asset);else media[oldMedia]=asset;
 row.specificationRows=data.rows.length;
 row.unresolved=data.notes;
 crops.push({slug,page:row.pdfPage,crop:data.crop});
}
await save('site/src/data/records.json',records);
await save('site/src/data/media.json',media);
await save('site/src/data/catalogue-coverage.json',coverage);
await mkdir('tmp/catalog-audit',{recursive:true});
await save('tmp/catalog-audit/crops.json',crops);
// Import only after writing the new records: the inventory reads JSON once per process.
const {englishInventory,sourceHash}=await import('../site/src/lib/localization.mjs');
const {extractProductFacts}=await import('../site/src/lib/product-facts.mjs');
const inventory=englishInventory();
const categoryTitles={
 'bagasse':['甘蔗渣餐具','Vaisselle en bagasse','Vajilla de bagazo','أدوات مائدة من تفل قصب السكر','Bagasse-Geschirr'],
 'paper-trays':['纸托盘','Barquettes en papier','Bandejas de papel','صواني ورقية','Papierschalen'],
 'square-food-boxes':['方形食品盒','Boîtes alimentaires carrées','Cajas cuadradas para alimentos','علب طعام مربعة','Quadratische Speiseboxen'],
 'round-food-boxes':['圆底食品盒','Boîtes à fond rond','Cajas de base redonda','علب طعام بقاعدة دائرية','Speiseboxen mit rundem Boden'],
 'menu-boxes':['餐盒','Boîtes repas','Cajas de comida','علب وجبات','Menüboxen'],
 'paper-bags':['纸袋','Sacs en papier','Bolsas de papel','أكياس ورقية','Papiertüten'],
 'compostable-waste-bags':['可堆肥垃圾袋','Sacs à déchets compostables','Bolsas de residuos compostables','أكياس نفايات قابلة للتسميد','Kompostierbare Abfallbeutel'],
 'bagasse-plates':['甘蔗渣圆盘与分格盘','Assiettes rondes et compartimentées en bagasse','Platos redondos y compartimentados de bagazo','أطباق دائرية ومقسمة من تفل قصب السكر','Runde Bagasse-Teller und Teller mit Fächern'],
 'bagasse-bowls':['甘蔗渣碗','Bols en bagasse','Cuencos de bagazo','أوعية من تفل قصب السكر','Bagasse-Schalen'],
 'bagasse-trays':['甘蔗渣托盘与方盘','Plateaux et assiettes carrées en bagasse','Bandejas y platos cuadrados de bagazo','صواني وأطباق مربعة من تفل قصب السكر','Bagasse-Menüschalen und quadratische Teller'],
 'bagasse-clamshells':['甘蔗渣翻盖餐盒','Boîtes à charnière en bagasse','Cajas abatibles de bagazo','علب بغطاء متصل من تفل قصب السكر','Bagasse-Klappboxen'],
};
const languages=['zh','fr','es','ar','de'];
const copy={
 zh:{intro:'查看产品册中的款式、型号与规格，并按所选产品询价。',summary:'以下规格来自 Corncomp 产品册。请根据型号选择尺寸，并在订购前确认适用条件。',spec:'产品册规格',order:'订购信息',docs:'请确认所选材料、涂层及订单适用的食品接触或环保文件。产品册展示不代表所有产品拥有相同认证。',terms:'请提供型号、数量、印刷、包装和目的地要求，以确认报价、最低订量与交期。',note:'本系列的部分产品册信息需进一步确认，请在订购前索取最新规格。'},
 fr:{intro:'Consultez les modèles, références et dimensions du catalogue et demandez un devis pour votre sélection.',summary:'Les caractéristiques ci-dessous proviennent du catalogue Corncomp. Choisissez la référence et confirmez les conditions d’utilisation avant la commande.',spec:'Caractéristiques du catalogue',order:'Informations de commande',docs:'Confirmez les documents de contact alimentaire et environnementaux applicables à la matière et à la commande. Les certifications ne couvrent pas automatiquement tous les articles.',terms:'Indiquez la référence, la quantité, l’impression, le conditionnement et la destination pour confirmer le prix, le minimum et le délai.',note:'Certains détails du catalogue doivent être confirmés. Demandez les caractéristiques actuelles avant de commander.'},
 es:{intro:'Consulte los modelos, referencias y dimensiones del catálogo y solicite presupuesto para su selección.',summary:'Las especificaciones siguientes proceden del catálogo Corncomp. Elija la referencia y confirme las condiciones de uso antes de pedir.',spec:'Especificaciones del catálogo',order:'Información de pedido',docs:'Confirme la documentación alimentaria y ambiental aplicable al material y al pedido. Las certificaciones no cubren automáticamente todos los artículos.',terms:'Indique referencia, cantidad, impresión, embalaje y destino para confirmar precio, pedido mínimo y plazo.',note:'Algunos datos del catálogo requieren confirmación. Solicite las especificaciones actuales antes de pedir.'},
 ar:{intro:'اطلع على الأنواع والأرقام والمقاسات في الكتالوج واطلب عرض سعر للصنف المختار.',summary:'المواصفات أدناه من كتالوج Corncomp. اختر رقم الصنف وأكد ظروف الاستخدام قبل الطلب.',spec:'مواصفات الكتالوج',order:'معلومات الطلب',docs:'أكد وثائق ملامسة الغذاء والوثائق البيئية المناسبة للمادة والطلب. لا تنطبق الشهادات تلقائيًا على جميع الأصناف.',terms:'حدد الصنف والكمية والطباعة والتغليف والوجهة لتأكيد السعر والحد الأدنى ومدة التسليم.',note:'تحتاج بعض تفاصيل الكتالوج إلى تأكيد. اطلب المواصفات الحالية قبل الشراء.'},
 de:{intro:'Vergleichen Sie Modelle, Artikelnummern und Maße aus dem Katalog und fragen Sie Ihre Auswahl an.',summary:'Die folgenden Angaben stammen aus dem Corncomp-Katalog. Wählen Sie die Artikelnummer und bestätigen Sie die Einsatzbedingungen vor der Bestellung.',spec:'Katalogspezifikationen',order:'Bestellinformationen',docs:'Bestätigen Sie die für Material und Bestellung geltenden Lebensmittelkontakt- und Umweltdokumente. Zertifikate gelten nicht automatisch für alle Artikel.',terms:'Nennen Sie Artikel, Menge, Druck, Verpackung und Zielort, um Preis, Mindestmenge und Lieferzeit zu bestätigen.',note:'Einige Katalogangaben müssen bestätigt werden. Fordern Sie vor der Bestellung die aktuellen Spezifikationen an.'},
};
const headers={
 'Item No.':['型号','Référence','Referencia','رقم الصنف','Artikelnummer'],Top:['顶部尺寸（mm）','Haut (mm)','Parte superior (mm)','الأعلى (مم)','Obermaß (mm)'],Bottom:['底部尺寸（mm）','Base (mm)','Base (mm)','القاعدة (مم)','Bodenmaß (mm)'],Height:['高度（mm）','Hauteur (mm)','Altura (mm)','الارتفاع (مم)','Höhe (mm)'],'PCS/CTN':['装箱量','Pièces/carton','Unidades/caja','القطع/الكرتون','Stück/Karton'],Size:['尺寸（mm）','Dimensions (mm)','Dimensiones (mm)','المقاس (مم)','Maße (mm)'],Length:['长度（mm）','Longueur (mm)','Longitud (mm)','الطول (مم)','Länge (mm)'],Width:['宽度（mm）','Largeur (mm)','Anchura (mm)','العرض (مم)','Breite (mm)'],Weight:['重量','Poids','Peso','الوزن','Gewicht'],Material:['材料','Matière','Material','المادة','Material'],Diameter:['直径','Diamètre','Diámetro','القطر','Durchmesser'],Volume:['容量','Volume','Volumen','السعة','Volumen'],'Front/back height':['前/后高度（mm）','Hauteur avant/arrière (mm)','Altura frontal/trasera (mm)','الارتفاع الأمامي/الخلفي (مم)','Höhe vorne/hinten (mm)'],'Diameter x height':['直径 × 高度（mm）','Diamètre × hauteur (mm)','Diámetro × altura (mm)','القطر × الارتفاع (مم)','Durchmesser × Höhe (mm)'],'Lid size':['盖尺寸（mm）','Couvercle (mm)','Tapa (mm)','مقاس الغطاء (مم)','Deckelmaß (mm)'],'Base size':['底盒尺寸（mm）','Fond (mm)','Base (mm)','مقاس القاعدة (مم)','Unterteil (mm)'],'Window size':['窗口尺寸（mm）','Fenêtre (mm)','Ventana (mm)','مقاس النافذة (مم)','Fenstermaß (mm)'],Pattern:['图案','Motif','Diseño','النقش','Muster']};
const patternValues={Stripe:['条纹','Rayures','Rayas','خطوط','Streifen'],'Small dot':['小圆点','Petits pois','Lunares pequeños','نقاط صغيرة','Kleine Punkte'],'Big dot':['大圆点','Gros pois','Lunares grandes','نقاط كبيرة','Große Punkte'],Wave:['波纹','Ondulations','Ondas','تموجات','Wellen']};
for(const [i,language] of languages.entries()){
 const path=`site/src/data/locales/${language}.json`;
 const locale=await load(path),c=copy[language];
 delete locale.content['product:kraft-open-wrap-cup'];
 for(const [header,values] of Object.entries(headers))locale.ui.specificationHeaders[header]=values[i];
 for(const [value,values] of Object.entries(patternValues))locale.ui.specificationValues[value]=values[i];
 for(const source of inventory){
  const data=additions[source.slug];
  const cat=source.type==='architecture'&&categoryTitles[source.route.replace(/\/$/,'').split('/').at(-1)];
  if(data){
   const title=data.titles[i];
   const numbered = source.title.match(/\b[23]\b/g)?.join(' / ');
   locale.content[source.contentKey]={route:`/${language}${source.route}`,title,description:`${title}. ${c.intro}`,sourceHash:sourceHash(source),summary:`${title}${numbered?' ('+numbered+')':''}. ${c.summary}`,specificationHeading:c.spec,comparisonHtml:`<p>${data.notes.length?c.note:c.intro}</p>`,orderingHeading:c.order,faq:`<p>${c.terms}</p>`,documentScope:c.docs,orderTerms:c.terms,alt:title,aliases:[]};
  }else if(cat){
   const title=cat[i];
   const previous=locale.content[source.contentKey];
   locale.content[source.contentKey]={route:previous?.route||`/${language}${source.route}`,title,description:`${title}。 ${c.intro}`,intro:c.intro,sections:[{title:c.spec,text:c.summary},{title:c.order,text:c.terms},{title:c.order,text:c.docs}],links:[],sourceHash:sourceHash(source)};
  }
 }
 await save(path,locale);
}
await save('tmp/catalog-audit/additions.json',additions);
const visual=Object.entries(additions).map(([slug,data])=>({key:`catalogue-${slug}`,src:`/media/catalogue/${slug}.webp`,width:1200,height:900,evidence:'product',alt:{en:coverage.find(x=>x.productSlug===slug).sourceName,...Object.fromEntries(languages.map((lang,i)=>[lang,data.titles[i]]))},fit:'contain',position:'center',source:`Corncomp Catalogue(1).pdf, physical page ${coverage.find(x=>x.productSlug===slug).pdfPage}`,restriction:'Product illustration only; confirm item-specific documentation.',required:true}));
const assignments={};
for(const item of coverage.filter(x=>additions[x.productSlug])){
 const source=inventory.find(x=>x.contentKey===`product:${item.productSlug}`);
 const category=inventory.find(x=>x.type==='architecture'&&x.route.endsWith(`/${item.categorySlug}/`));
 assignments[source.contentKey]=[`catalogue-${item.productSlug}`];
 if(category&&!assignments[category.contentKey])assignments[category.contentKey]=[`catalogue-${item.productSlug}`];
}
assignments['architecture:products/bagasse']=['catalogue-bagasse-round-plate'];
await writeFile('site/src/data/catalogue-media.mjs',`// Generated from audited catalogue crops.\nexport const CATALOGUE_MEDIA = ${JSON.stringify(visual,null,2)};\nexport const CATALOGUE_ASSIGNMENTS = ${JSON.stringify(assignments,null,2)};\n`);
await writeFile('docs/qa/catalogue-unresolved.md','# Catalogue verification issues\n\n'+coverage.filter(x=>x.unresolved.length).map(x=>`- ${x.productSlug} (PDF ${x.pdfPage}): ${x.unresolved.join(' ')}`).join('\n')+'\n');
console.log(`Imported ${Object.keys(additions).length} product families with five localized entries each.`);
