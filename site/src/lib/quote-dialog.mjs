export function isQuoteLink({href,bypass=false}, {origin,contactPath}) {
  const url=new URL(href,origin);
  return !bypass && url.origin===origin && url.pathname.replace(/\/$/,'')===contactPath.replace(/\/$/,'');
}
export function applyQuoteContext(form,params,sourcePath) {
  const elements=form.elements||form;
  if(form.inquiryProducts)form.inquiryProducts.append(params);
  for(const [field,key] of [['productName','product'],['productSku','sku'],['category','category']]) {
    const value=params.get(key);
    if(value && !form.inquiryProducts && elements[field])elements[field].value=value;
  }
  if(elements.sourcePath)elements.sourcePath.value=params.get('source')||sourcePath;
  form.inquiryProducts?.save();
}
