import {appendInquiryProduct,hasInquiryProduct,productFromParams,readInquiryProducts,MAX_INQUIRY_PRODUCTS} from './inquiry-products.mjs';

const draftKey='corncomp-inquiry-draft-v1';
const contactFields=['name','email','phone','company','country','message','sourcePath'];
const productFields=['productName','productSku','quantity','category'];

export function initializeInquiryProducts(form) {
  const root=form.querySelector('[data-inquiry-products]');
  if(!root)return null;
  const list=root.querySelector('[data-product-rows]');
  const template=list.firstElementChild.cloneNode(true);
  const add=root.querySelector('[data-add-product]');
  const status=root.querySelector('[data-product-status]');
  const rows=()=>[...list.querySelectorAll('[data-product-row]')];
  const products=()=>rows().map(row=>Object.fromEntries(productFields.map(key=>[key,row.querySelector('[name="'+key+'"]').value])));
  let storage;
  const save=()=>{
    try {
      storage?.setItem(draftKey,JSON.stringify({
        fields:Object.fromEntries(contactFields.map(key=>[key,form.elements[key]?.value||''])),
        products:products(),
      }));
    } catch { /* The form also works when browser storage is unavailable. */ }
  };
  const render=(items)=>{
    list.replaceChildren(...(items.length?items:[{}]).map((product,index)=>{
      const row=template.cloneNode(true);
      row.querySelector('[data-product-number]').textContent=root.dataset.itemLabel+' '+(index+1);
      row.querySelector('[data-remove-product]').setAttribute('aria-label',root.dataset.removeLabel+' '+(index+1));
      for(const key of productFields)row.querySelector('[name="'+key+'"]').value=product[key]||'';
      return row;
    }));
    add.disabled=rows().length>=MAX_INQUIRY_PRODUCTS;
  };
  try {
    storage=window.sessionStorage;
    const draft=JSON.parse(storage.getItem(draftKey)||'null');
    if(draft) {
      const items=readInquiryProducts(draft);
      for(const key of contactFields)if(typeof draft.fields?.[key]==='string'&&form.elements[key])form.elements[key].value=draft.fields[key];
      render(items);
    }
  } catch { /* Ignore unavailable storage or an invalid old draft. */ }
  const controller={
    append(params){
      const before=products();
      try {
        const after=appendInquiryProduct(before,productFromParams(params));
        if(after!==before)render(after);
        save();
      } catch { status.textContent=root.dataset.limitLabel; }
    },
    serialize(){return products().filter(hasInquiryProduct);},
    clear(){render([]);status.textContent='';try{storage?.removeItem(draftKey);}catch{}},
    save,
  };
  add.addEventListener('click',()=>{
    const items=products();
    if(items.length>=MAX_INQUIRY_PRODUCTS){status.textContent=root.dataset.limitLabel;return;}
    render([...items,{}]);save();
    list.lastElementChild.querySelector('[name=productName]').focus();
  });
  list.addEventListener('click',event=>{
    const button=event.target.closest('[data-remove-product]');
    if(!button)return;
    const index=rows().indexOf(button.closest('[data-product-row]'));
    render(products().filter((_,position)=>position!==index));
    status.textContent='';save();
    const remaining=rows();
    remaining[Math.min(index,remaining.length-1)].querySelector('[name=productName]').focus();
  });
  form.addEventListener('input',save);
  form.addEventListener('change',save);
  form.inquiryProducts=controller;
  return controller;
}
