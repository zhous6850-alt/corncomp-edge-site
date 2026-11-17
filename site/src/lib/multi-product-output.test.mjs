import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SUPPORTED_LANGUAGES,routeFor} from './localization.mjs';

test('every contact language exposes one accessible starting product and add/remove controls',async()=>{
  const addLabels={en:'Add another product',zh:'再添加一个产品',fr:'Ajouter un produit',es:'Añadir otro producto',ar:'إضافة منتج آخر',de:'Weiteres Produkt hinzufügen'};
  for(const language of SUPPORTED_LANGUAGES) {
    const html=await readFile(new URL('../../dist'+routeFor(language,'architecture:contact')+'index.html',import.meta.url),'utf8');
    const form=html.match(/<form\b[^>]*corncomp-inquiry-form[\s\S]*?<\/form>/)[0];
    assert.equal((form.match(/data-product-row(?:\s|>)/g)||[]).length,1,language);
    assert.match(form,/<legend\b[^>]*data-product-number/);
    assert.match(form,/<button\b[^>]*type="button"[^>]*data-add-product/);
    assert.match(form,/<button\b[^>]*type="button"[^>]*data-remove-product/);
    assert.ok(form.includes(addLabels[language]),language);
    for(const field of ['productName','productSku','quantity','category'])assert.match(form,new RegExp('name="'+field+'"'));
    assert.match(form,/data-product-status[^>]*role="status"/);
  }
});
