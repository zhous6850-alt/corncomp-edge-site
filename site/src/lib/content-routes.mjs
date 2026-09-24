import { contentKeyFromRoute, localizedRedirects, normalizeLocalizedRoute, routeFor } from './localization.mjs';

export function contentPath(route) {
  if (route === '/') return null;
  return decodeURI(route.replace(/^\/+|\/+$/g, ''));
}

export function contentTitle(record) {
  return contentText((record.seo?.title || record.title)
    .replaceAll('%sep%', '|')
    .replaceAll('%sitename%', 'Corncomp'));
}

export function categoryLanguage(products) {
  const counts = new Map();
  for (const product of products) counts.set(product.language, (counts.get(product.language) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] || 'en';
}

const legacyAliases = new Map([
  ['/faq/', '/resources/'],
  ['/case-studies/', '/about/'],
  ['/fr/faq/', '/fr/ressources/'],
  ['/es/faq/', '/es/recursos/'],
  ['/ar/faq/', '/ar/%D9%85%D9%88%D8%A7%D8%B1%D8%AF-%D8%B4%D8%B1%D8%A7%D8%A1-%D8%B9%D8%A8%D9%88%D8%A7%D8%AA-%D8%A7%D9%84%D8%B7%D8%B9%D8%A7%D9%85/'],
  ['/es/certifications/', '/es/certificaciones-de-corncomp/'],
  ['/fr/bpi-vs-fsc-certification/', '/fr/quest-ce-que-la-certification-bpi-en-quoi-elle-differe-de-la-certification-fsc/'],
  ['/es/pla-vs-bagasse-vs-fsc-paper/', '/es/pla-vs-bagazo-vs-papel-fsc-como-elegir-el-material-de-envase-compostable-adecuado/'],
]);

export function localizeInternalLinks(html = '', language = null, sourceRoute = '/') {
  const aliases = localizedRedirects();
  return html.replace(/href=(['"])([^'"]+)\1/gi, (attribute, quote, href) => {
    if (/^(?:#|mailto:|tel:|\/\/)/i.test(href)) return attribute;
    let url;
    try { url = new URL(href, new URL(sourceRoute, 'https://corn-comp.com')); } catch { return attribute; }
    if (url.origin !== 'https://corn-comp.com' || url.pathname.startsWith('/media/') || url.pathname.startsWith('/api/')) return attribute;
    const normalized = normalizeLocalizedRoute(url.pathname);
    const canonical = aliases.get(normalized) || legacyAliases.get(normalized) || normalized;
    const contentKey = contentKeyFromRoute(canonical);
    const inferredLanguage = language || canonical.match(/^\/(fr|es|ar)\//)?.[1] || 'en';
    const target = contentKey ? routeFor(inferredLanguage, contentKey) : canonical;
    return `href=${quote}${target}${url.search}${url.hash}${quote}`;
  });
}

export function contentText(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

export function contentDescription(record = {}, fallback = '') {
  return contentText(record.seo?.description || record.excerpt || fallback);
}

export function normalizeBodyHeadings(html = '') {
  return html.replace(/<h1(\b[^>]*)>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');
}
