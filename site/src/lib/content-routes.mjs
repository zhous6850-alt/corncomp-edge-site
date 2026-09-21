export function contentPath(route) {
  if (route === '/') return null;
  return decodeURI(route.replace(/^\/+|\/+$/g, ''));
}

export function contentTitle(record) {
  return (record.seo?.title || record.title)
    .replaceAll('%sep%', '|')
    .replaceAll('%sitename%', 'Corncomp');
}

export function categoryLanguage(products) {
  const counts = new Map();
  for (const product of products) counts.set(product.language, (counts.get(product.language) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] || 'en';
}
