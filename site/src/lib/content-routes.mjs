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

const localizedAliases = new Map([
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

export function localizeInternalLinks(html = '') {
  let localized = html.replace(/https?:\/\/(?:www\.)?corn-comp\.com(?=[/'"])/gi, '');
  for (const [source, target] of localizedAliases) localized = localized.replaceAll(source, target);
  return localized;
}

export function contentDescription(record = {}, fallback = '') {
  const value = record.seo?.description || record.excerpt || fallback;
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeBodyHeadings(html = '') {
  return html.replace(/<h1(\b[^>]*)>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');
}
