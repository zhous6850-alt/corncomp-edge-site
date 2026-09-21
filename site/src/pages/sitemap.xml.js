import categories from '../data/categories.json' with { type: 'json' };
import records from '../data/records.json' with { type: 'json' };

export const prerender = true;

const excluded = new Set(['/cart/', '/checkout/', '/my-account/']);
const routes = ['/', ...records.map((item) => item.route), ...categories.map((item) => item.route), '/fr/shop/', '/es/shop/', '/ar/shop/', '/fr/blog/', '/es/blog/', '/ar/blog/'];
const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export function GET() {
  const urls = [...new Set(routes)].filter((route) => !excluded.has(route)).map((route) => `<url><loc>${escapeXml(new URL(route, 'https://corn-comp.com').href)}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
