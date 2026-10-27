export function isQuoteLink({href,bypass=false}, {origin,contactPath}) {
  const url=new URL(href,origin);
  return !bypass && url.origin===origin && url.pathname.replace(/\/$/,'')===contactPath.replace(/\/$/,'');
}
export function applyQuoteContext(elements,params,sourcePath) {
  for(const [field,key] of [['productName','product'],['productSku','sku'],['category','category']]) {
    const value=params.get(key);
    if(value && elements[field])elements[field].value=value;
  }
  if(elements.sourcePath)elements.sourcePath.value=params.get('source')||sourcePath;
}
