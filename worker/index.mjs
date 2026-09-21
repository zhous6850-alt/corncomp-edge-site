const RECIPIENT = 'zhous6850@gmail.com';
const SENDER = 'inquiry@corn-comp.com';
const REDIRECTS = new Map([
  ['/cart/', '/shop/'],
  ['/checkout/', '/shop/'],
  ['/my-account/', '/shop/'],
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
    let decodedPath = url.pathname;
    try { decodedPath = decodeURI(decodedPath); } catch {}
    const redirect = REDIRECTS.get(decodedPath);
    if (redirect) return Response.redirect(new URL(redirect, url.origin), 301);
    if (url.pathname !== '/api/inquiry') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

    const data = await inquiryData(request);
    if (field(data, 'website')) return json({ ok: true });

    const name = field(data, 'name').slice(0, 200);
    const email = field(data, 'email').slice(0, 320);
    const phone = field(data, 'phone').slice(0, 100);
    const message = field(data, 'message').slice(0, 5000);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Please enter a valid name and email.' }, 400);

    const source = request.headers.get('referer') || 'Unknown page';
    const text = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nPage: ${source}\n\n${message || 'No message provided'}`;
    await env.EMAIL.send({
      to: RECIPIENT,
      from: SENDER,
      replyTo: email,
      subject: `Corncomp inquiry from ${name}`,
      text,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p><p><strong>Page:</strong> ${escapeHtml(source)}</p><p>${escapeHtml(message || 'No message provided').replace(/\n/g, '<br>')}</p>`,
    });
    if ((request.headers.get('content-type') || '').includes('application/json')) return json({ ok: true });
    const page = new URL(source, request.url);
    return new Response(null, { status: 303, headers: { location: `${url.origin}${page.pathname}#inquiry-sent` } });
  },
};
