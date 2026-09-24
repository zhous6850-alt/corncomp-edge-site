import {
  DUPLICATE_PRODUCT_ALIASES,
  LEGACY_PAGE_REDIRECTS,
  PRODUCT_CATEGORY_BY_SLUG,
  canonicalProductRoute,
} from '../site/src/lib/site-architecture.mjs';

const RECIPIENT = 'zhous6850@gmail.com';
const SENDER = 'Corncomp <inquiry@corn-comp.com>';
export const REDIRECTS = new Map([
  ['/cart/', '/products/'],
  ['/checkout/', '/products/'],
  ['/my-account/', '/products/'],
  ...Object.entries(LEGACY_PAGE_REDIRECTS),
  ...Object.keys(PRODUCT_CATEGORY_BY_SLUG).map((slug) => [`/product/${slug}/`, canonicalProductRoute(slug)]),
  ...Object.entries(DUPLICATE_PRODUCT_ALIASES).map(([source, target]) => [`/product/${source}/`, canonicalProductRoute(target)]),
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
  ['/fr/faq/', '/fr/faq-corncomp/'],
  ['/es/faq/', '/es/preguntas-frecuentes-corncomp/'],
  ['/ar/faq/', '/ar/%d8%a7%d9%84%d8%a3%d8%b3%d8%a6%d9%84%d8%a9-%d8%a7%d9%84%d8%b4%d8%a7%d8%a6%d8%b9%d8%a9-corncomp/'],
  ['/fr/certifications/', '/fr/certifications-corncomp/'],
  ['/es/certifications/', '/es/certificaciones-de-corncomp/'],
  ['/es/certificaciones/', '/es/certificaciones-de-corncomp/'],
  ['/ar/certifications/', '/ar/%d8%b4%d9%87%d8%a7%d8%af%d8%a7%d8%aa-corncomp/'],
  ['/ar/الشهادات/', '/ar/%d8%b4%d9%87%d8%a7%d8%af%d8%a7%d8%aa-corncomp/'],
  ['/fr/us-state-plastic-packaging-laws-explained/', '/us-state-plastic-packaging-laws-explained/'],
  ['/es/us-state-plastic-packaging-laws-explained/', '/es/leyes-estatales-eeuu-empaques-plasticos/'],
  ['/ar/us-state-plastic-packaging-laws-explained/', '/ar/qwanin-tbyt-lblastyk-alwlayat-almthdt/'],
  ['/fr/how-to-verify-supplier-sustainability-certifications/', '/fr/comment-verifier-lauthenticite-des-certifications-de-durabilite-dun-fournisseur-demballages/'],
  ['/es/how-to-verify-supplier-sustainability-certifications/', '/es/como-verificar-que-las-certificaciones-de-sostenibilidad-de-un-proveedor-de-envases-son-autenticas/'],
  ['/ar/how-to-verify-supplier-sustainability-certifications/', '/ar/%d9%83%d9%8a%d9%81%d9%8a%d8%a9-%d8%a7%d9%84%d8%aa%d8%ad%d9%82%d9%82-%d9%85%d9%86-%d8%b5%d8%ad%d8%a9-%d8%b4%d9%87%d8%a7%d8%af%d8%a7%d8%aa-%d8%a7%d9%84%d8%a7%d8%b3%d8%aa%d8%af%d8%a7%d9%85%d8%a9-%d8%a7/'],
  ['/fr/eu-single-use-plastics-directive-explained/', '/fr/directive-europeenne-sur-les-plastiques-a-usage-unique-ce-quelle-signifie-pour-les-acheteurs-demballages/'],
  ['/es/eu-single-use-plastics-directive-explained/', '/es/directiva-europea-sobre-plasticos-de-un-solo-uso-que-significa-para-los-compradores-de-envases/'],
  ['/ar/eu-single-use-plastics-directive-explained/', '/ar/%d8%aa%d9%88%d8%ac%d9%8a%d9%87-%d8%a7%d9%84%d8%a7%d8%aa%d8%ad%d8%a7%d8%af-%d8%a7%d9%84%d8%a3%d9%88%d8%b1%d9%88%d8%a8%d9%8a-%d8%a8%d8%b4%d8%a3%d9%86-%d8%a7%d9%84%d8%a8%d9%84%d8%a7%d8%b3%d8%aa%d9%8a/'],
  ['/fr/pla-vs-bagasse-vs-fsc-paper/', '/fr/pla-vs-bagasse-vs-papier-fsc-choisir-le-bon-materiau-demballage-compostable/'],
  ['/es/pla-vs-bagasse-vs-fsc-paper/', '/es/pla-vs-bagazo-vs-papel-fsc-como-elegir-el-material-de-envase-compostable-adecuado/'],
  ['/ar/pla-vs-bagasse-vs-fsc-paper/', '/ar/pla-%d9%85%d9%82%d8%a7%d8%a8%d9%84-%d8%a7%d9%84%d8%a8%d8%a7%d8%ba%d8%a7%d8%b3-%d9%85%d9%82%d8%a7%d8%a8%d9%84-%d8%a7%d9%84%d9%88%d8%b1%d9%82-%d8%a7%d9%84%d9%85%d8%b9%d8%aa%d9%85%d8%af-fsc-%d9%83%d9%8a/'],
  ['/fr/bpi-vs-fsc-certification/', '/fr/quest-ce-que-la-certification-bpi-en-quoi-elle-differe-de-la-certification-fsc/'],
  ['/es/bpi-vs-fsc-certification/', '/es/que-es-la-certificacion-bpi-en-que-se-diferencia-de-la-certificacion-fsc/'],
  ['/ar/bpi-vs-fsc-certification/', '/ar/%d9%85%d8%a7-%d9%87%d9%8a-%d8%b4%d9%87%d8%a7%d8%af%d8%a9-bpi%d8%9f-%d9%88%d9%83%d9%8a%d9%81-%d8%aa%d8%ae%d8%aa%d9%84%d9%81-%d8%b9%d9%86-%d8%b4%d9%87%d8%a7%d8%af%d8%a9-fsc/'],
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
    const redirect = REDIRECTS.get(decodedPath);
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
