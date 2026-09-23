import categories from '../data/categories.json' with { type: 'json' };
import records from '../data/records.json' with { type: 'json' };
import { canonicalUrl } from '../lib/routes.mjs';
import { ARCHITECTURE_PAGES, LEGACY_PAGE_REDIRECTS, PRODUCT_CATEGORY_BY_SLUG, canonicalProductRoute } from '../lib/site-architecture.mjs';

export const prerender = true;

const excluded = new Set(['/cart/', '/checkout/', '/my-account/', ...Object.keys(LEGACY_PAGE_REDIRECTS)]);
const preservedRecords = records.filter((item) => item.language !== 'en' || (item.type !== 'product' && !excluded.has(item.route))).map((item) => item.route);
const preservedCategories = categories.filter((item) => /^\/(fr|es|ar)\//.test(item.route)).map((item) => item.route);
const canonicalProducts = records.filter((item) => item.type === 'product' && item.language === 'en' && PRODUCT_CATEGORY_BY_SLUG[item.slug]).map((item) => canonicalProductRoute(item.slug));
const routes = ['/', ...ARCHITECTURE_PAGES.map((item) => item.route), ...canonicalProducts, ...preservedRecords, ...preservedCategories, '/fr/shop/', '/es/shop/', '/ar/shop/', '/fr/blog/', '/es/blog/', '/ar/blog/'];
const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export function GET() {
  const urls = [...new Set(routes)].filter((route) => !excluded.has(route)).map((route) => `<url><loc>${escapeXml(canonicalUrl(route))}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
