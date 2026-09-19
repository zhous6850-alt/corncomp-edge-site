export function contentPath(route) {
  if (route === '/') return null;
  return decodeURI(route.replace(/^\/+|\/+$/g, ''));
}

export function contentTitle(record) {
  return record.seo?.title || record.title;
}
