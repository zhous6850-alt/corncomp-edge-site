import records from '../data/records.json' with { type: 'json' };
import { PRODUCT_CATEGORY_BY_SLUG, canonicalProductRoute } from './site-architecture.mjs';

export const languageHomes = {
  en: '/',
  fr: '/fr/corncomp-pailles-en-papier-et-emballages-alimentaires-biodegradables/',
  es: '/es/corncomp-pajitas-de-papel-y-envases-de-alimentos-sostenibles/',
  ar: '/ar/corncomp-%d9%85%d8%b5%d8%a7%d8%b5%d8%a7%d8%aa-%d9%88%d8%b1%d9%82%d9%8a%d8%a9-%d9%88%d8%b9%d8%a8%d9%88%d8%a7%d8%aa-%d8%a3%d8%ba%d8%b0%d9%8a%d8%a9-%d9%85%d8%b3%d8%aa%d8%af%d8%a7%d9%85%d8%a9/',
};

const navigation = {
  en: { home: ['Home', '/'], about: ['About', '/about/'], product: ['Products', '/products/'], custom: ['Custom Packaging', '/custom-packaging/'], applications: ['Applications', '/applications/'], resources: ['Resources', '/resources/'], certifications: ['Quality', '/quality/'], cases: ['Case Studies', '/case-studies/'], blog: ['Blog', '/blog/'], faq: ['FAQ', '/faq/'], contact: ['Request a Quote', '/contact/'] },
  fr: { home: ['Accueil', languageHomes.fr], about: ['À propos', '/fr/a-propos-de-corncomp-fabricant-d-emballages-papier-biodegradables/'], product: ['Produits', '/fr/shop/'], certifications: ['Certifications', '/fr/certifications-corncomp/'], cases: ['Études de cas', '/fr/la-confiance-des-grandes-marques-etudes-de-cas-corncomp/'], blog: ['Blog', '/fr/blog/'], faq: ['FAQ', '/fr/faq-corncomp/'], contact: ['Contact', '/fr/contactez-nous/'] },
  es: { home: ['Inicio', languageHomes.es], about: ['Sobre nosotros', '/es/sobre-corncomp-fabricante-de-envases-de-papel-biodegradables/'], product: ['Productos', '/es/shop/'], certifications: ['Certificaciones', '/es/certificaciones-de-corncomp/'], cases: ['Casos de estudio', '/es/la-confianza-de-las-marcas-globales-casos-de-estudio-de-corncomp/'], blog: ['Blog', '/es/blog/'], faq: ['Preguntas frecuentes', '/es/preguntas-frecuentes-corncomp/'], contact: ['Contacto', '/es/contactenos/'] },
  ar: { home: ['الرئيسية', languageHomes.ar], about: ['من نحن', '/ar/%d8%b9%d9%86-corncomp-%d8%a7%d9%84%d8%b4%d8%b1%d9%83%d8%a9/'], product: ['المنتجات', '/ar/shop/'], certifications: ['الشهادات', '/ar/%d8%b4%d9%87%d8%a7%d8%af%d8%a7%d8%aa-corncomp/'], cases: ['دراسات الحالة', '/ar/%d8%af%d8%b1%d8%a7%d8%b3%d8%a7%d8%aa-%d8%ad%d8%a7%d9%84%d8%a9-corncomp/'], blog: ['المدونة', '/ar/blog/'], faq: ['الأسئلة الشائعة', '/ar/%d8%a7%d9%84%d8%a3%d8%b3%d8%a6%d9%84%d8%a9-%d8%a7%d9%84%d8%b4%d8%a7%d8%a6%d8%b9%d8%a9-corncomp/'], contact: ['اتصل بنا', '/ar/%d8%a7%d8%aa%d8%b5%d9%84-%d8%a8%d9%86%d8%a7/'] },
};

export const categoryIdsByLanguage = {
  en: [35, 20, 25, 52, 60, 59, 61, 64, 45],
  fr: [236, 232, 234, 240, 244, 242, 246, 248, 238],
  es: [188, 184, 186, 192, 196, 194, 198, 200, 190],
  ar: [203, 207, 209, 211, 217, 205, 215, 219, 213],
};

export function navigationFor(language = 'en') {
  return navigation[language] || navigation.en;
}

const languageOrder = ['en', 'fr', 'es', 'ar'];

const staticAlternateGroups = [
  ['/', languageHomes.fr, languageHomes.es, languageHomes.ar],
  ['/about/', navigation.fr.about[1], navigation.es.about[1], navigation.ar.about[1]],
  ['/products/', '/fr/shop/', '/es/shop/', '/ar/shop/'],
  ['/quality/', navigation.fr.certifications[1], navigation.es.certifications[1], navigation.ar.certifications[1]],
  ['/case-studies/', navigation.fr.cases[1], navigation.es.cases[1], navigation.ar.cases[1]],
  ['/blog/', '/fr/blog/', '/es/blog/', '/ar/blog/'],
  ['/faq/', navigation.fr.faq[1], navigation.es.faq[1], navigation.ar.faq[1]],
  ['/contact/', navigation.fr.contact[1], navigation.es.contact[1], navigation.ar.contact[1]],
].map((routes) => routes.map((route, index) => ({ language: languageOrder[index], route })));

function verifiedMediaGroups(type) {
  const byMedia = new Map();
  for (const record of records.filter((item) => item.type === type && item.featuredMediaId)) {
    if (!byMedia.has(record.featuredMediaId)) byMedia.set(record.featuredMediaId, []);
    byMedia.get(record.featuredMediaId).push(record);
  }

  return [...byMedia.values()].flatMap((group) => {
    const byLanguage = Object.fromEntries(languageOrder.map((language) => [language, group.filter((item) => item.language === language)]));
    if (!languageOrder.every((language) => byLanguage[language].length === 1)) return [];
    const english = byLanguage.en[0];
    if (type === 'product' && !PRODUCT_CATEGORY_BY_SLUG[english.slug]) return [];
    return [languageOrder.map((language) => ({
      language,
      route: type === 'product' && language === 'en' ? canonicalProductRoute(english.slug) : byLanguage[language][0].route,
    }))];
  });
}

const partialArticleGroups = [[
  { language: 'en', route: '/us-state-plastic-packaging-laws-explained/' },
  { language: 'es', route: '/es/leyes-estatales-eeuu-empaques-plasticos/' },
  { language: 'ar', route: '/ar/qwanin-tbyt-lblastyk-alwlayat-almthdt/' },
]];

const alternateGroups = [
  ...staticAlternateGroups,
  ...verifiedMediaGroups('post'),
  ...verifiedMediaGroups('product'),
  ...partialArticleGroups,
];

export function pageAlternates(pathname) {
  return alternateGroups.find((group) => group.some((item) => item.route === pathname)) || [];
}
