import {
  DUPLICATE_PRODUCT_ALIASES,
  LEGACY_PAGE_REDIRECTS,
  PRODUCT_CATEGORY_BY_SLUG,
  canonicalProductRoute,
} from '../site/src/lib/site-architecture.mjs';
import { localizedRedirects, normalizeLocalizedRoute } from '../site/src/lib/localization.mjs';

const RECIPIENT = 'zhous6850@gmail.com';
const SENDER = 'Corncomp <inquiry@corn-comp.com>';
export const REDIRECTS = new Map([
  ['/cart/', '/products/'],
  ['/checkout/', '/products/'],
  ['/my-account/', '/products/'],
  ...Object.entries(LEGACY_PAGE_REDIRECTS),
  ...Object.keys(PRODUCT_CATEGORY_BY_SLUG).map((slug) => [`/product/${slug}/`, canonicalProductRoute(slug)]),
  ...Object.entries(DUPLICATE_PRODUCT_ALIASES).map(([source, target]) => [`/product/${source}/`, canonicalProductRoute(target)]),
  ...localizedRedirects(),
  ['/faq/', '/resources/'],
  ['/case-studies/', '/about/'],
  ['/category/company-industry/', '/blog/'],
  ['/category/company-industry-fr/', '/fr/blog/'],
  ['/category/company-industry-es/', '/es/blog/'],
  ['/category/company-industry-ar/', '/ar/blog/'],
  ['/category/compliance-regulations/', '/blog/'],
  ['/category/compliance-regulations-fr/', '/fr/blog/'],
  ['/es/category/compliance-regulations-es/', '/es/blog/'],
  ['/ar/category/compliance-regulations-ar/', '/ar/blog/'],
  ['/category/material-guides/', '/blog/'],
  ['/category/material-guides-fr/', '/fr/blog/'],
  ['/category/material-guides-es/', '/es/blog/'],
  ['/category/material-guides-ar/', '/ar/blog/'],
]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

async function inquiryData(request) {
  if ((request.headers.get('content-type') || '').includes('application/json')) return request.json();
  const form = await request.formData();
  return Object.fromEntries(form);
}

function field(data, name) {
  return String(data[name] ?? data[`your-${name}`] ?? '').trim();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.corn-comp.com') {
      url.hostname = 'corn-comp.com';
      return Response.redirect(url, 301);
    }
    let decodedPath = url.pathname;
    try { decodedPath = decodeURI(decodedPath); } catch {}
    let normalizedPath = url.pathname;
    try { normalizedPath = normalizeLocalizedRoute(url.pathname); } catch {}
    const redirect = REDIRECTS.get(decodedPath) || REDIRECTS.get(normalizedPath);
    if (redirect) {
      const destination = new URL(redirect, url.origin);
      destination.search = url.search;
      return Response.redirect(destination, 301);
    }
    if (url.pathname !== '/api/inquiry') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

    const data = await inquiryData(request);
    if (field(data, 'website')) return json({ ok: true });

    const name = field(data, 'name').slice(0, 200);
    const email = field(data, 'email').slice(0, 320);
    const phone = field(data, 'phone').slice(0, 100);
    const company = field(data, 'company').slice(0, 200);
    const country = field(data, 'country').slice(0, 100);
    const productName = field(data, 'productName').slice(0, 300);
    const productSku = field(data, 'productSku').slice(0, 100);
    const category = field(data, 'category').slice(0, 200);
    const quantity = field(data, 'quantity').slice(0, 100);
    const sourcePath = field(data, 'sourcePath').slice(0, 1000);
    const message = field(data, 'message').slice(0, 5000);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Please enter a valid name and email.' }, 400);

    const source = request.headers.get('referer') || 'Unknown page';
    const context = [
      ['Company', company],
      ['Country', country],
      ['Product', productName],
      ['SKU', productSku],
      ['Category', category],
      ['Quantity', quantity],
      ['Source path', sourcePath],
    ].filter(([, value]) => value);
    const text = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n${context.map(([label, value]) => `${label}: ${value}`).join('\n')}\nPage: ${source}\n\n${message || 'No message provided'}`;
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        to: [RECIPIENT],
        from: SENDER,
        reply_to: email,
        subject: `Corncomp inquiry from ${name}`,
        text,
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>${context.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join('')}<p><strong>Page:</strong> ${escapeHtml(source)}</p><p>${escapeHtml(message || 'No message provided').replace(/\n/g, '<br>')}</p>`,
      }),
    });
    if (!emailResponse.ok) return json({ ok: false, error: 'Unable to send inquiry.' }, 502);
    if ((request.headers.get('content-type') || '').includes('application/json')) return json({ ok: true });
    let pagePath = '/contact/';
    try {
      const page = new URL(source);
      if (page.origin === url.origin) pagePath = page.pathname;
    } catch {}
    const result = new URL(url.origin);
    result.pathname = `/${pagePath.replace(/^\/+/, '')}`;
    result.searchParams.set('sent', '1');
    result.searchParams.set('lead', crypto.randomUUID());
    result.hash = 'inquiry-sent';
    return new Response(null, { status: 303, headers: { location: result.href } });
  },
};
