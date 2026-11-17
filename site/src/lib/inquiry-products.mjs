export const MAX_INQUIRY_PRODUCTS = 50;
const limits = {productName:300,productSku:100,quantity:100,category:200};
export const hasInquiryProduct = product => Object.keys(limits).some(key=>product[key]?.trim());

export function productFromParams(params) {
  return {productName:params.get('product')||'',productSku:params.get('sku')||'',quantity:params.get('quantity')||'',category:params.get('category')||''};
}

export function readInquiryProducts(data) {
  const rows = data.products === undefined ? [data] : data.products;
  if(!Array.isArray(rows)||rows.length>MAX_INQUIRY_PRODUCTS)throw new Error('Invalid product list');
  return rows.map(row=>{
    if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('Invalid product');
    return Object.fromEntries(Object.entries(limits).map(([key,max])=>{
      const value=row[key]??'';
      if(typeof value!=='string'||value.length>max)throw new Error('Invalid product field');
      return [key,value.trim()];
    }));
  }).filter(hasInquiryProduct);
}

export function appendInquiryProduct(rows, product) {
  if(!hasInquiryProduct(product))return rows;
  const normalized=value=>(value||'').trim().toLowerCase();
  const exists=rows.some(row=>product.productSku && row.productSku
    ? normalized(product.productSku)===normalized(row.productSku)
    : !product.productSku && !row.productSku && (product.productName
      ? normalized(product.productName)===normalized(row.productName)
      : !row.productName && product.category && normalized(product.category)===normalized(row.category)));
  if(exists)return rows;
  const empty=rows.findIndex(row=>!hasInquiryProduct(row));
  if(empty>=0)return rows.map((row,index)=>index===empty?product:row);
  if(rows.length>=MAX_INQUIRY_PRODUCTS)throw new Error('Product list full');
  return [...rows,product];
}
