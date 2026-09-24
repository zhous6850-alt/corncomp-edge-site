import { canonicalUrl } from '../lib/routes.mjs';
import { allLocalizedEntries, normalizeLocalizedRoute } from '../lib/localization.mjs';

export const prerender = true;

const routes = [
  ...allLocalizedEntries().map(({ route }) => normalizeLocalizedRoute(route)),
  '/blog/', '/fr/shop/', '/fr/blog/', '/es/shop/', '/es/blog/', '/ar/shop/', '/ar/blog/',
];
const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export function GET() {
  const urls = [...new Set(routes)].map((route) => `<url><loc>${escapeXml(canonicalUrl(route))}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
