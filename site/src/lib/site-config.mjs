import { alternateGroup, contentKeyFromRoute, normalizeLocalizedRoute, routeFor } from './localization.mjs';

export const languageHomes = {
  en: '/',
  fr: '/fr/corncomp-pailles-en-papier-et-emballages-alimentaires-biodegradables/',
  es: '/es/corncomp-pajitas-de-papel-y-envases-de-alimentos-sostenibles/',
  ar: '/ar/corncomp-%d9%85%d8%b5%d8%a7%d8%b5%d8%a7%d8%aa-%d9%88%d8%b1%d9%82%d9%8a%d8%a9-%d9%88%d8%b9%d8%a8%d9%88%d8%a7%d8%aa-%d8%a3%d8%ba%d8%b0%d9%8a%d8%a9-%d9%85%d8%b3%d8%aa%d8%af%d8%a7%d9%85%d8%a9/',
};

export const blogArchives = [
  { language: 'en', route: '/blog/' },
  { language: 'fr', route: '/fr/blog/' },
  { language: 'es', route: '/es/blog/' },
  { language: 'ar', route: '/ar/blog/' },
];

const navigation = {
  en: { home: ['Home', '/'], about: ['About', '/about/'], product: ['Products', '/products/'], custom: ['Custom Packaging', '/custom-packaging/'], applications: ['Applications', '/applications/'], resources: ['Resources', '/resources/'], certifications: ['Quality', '/quality/'], cases: ['Case Studies', '/case-studies/'], blog: ['Blog', '/blog/'], faq: ['FAQ', '/faq/'], contact: ['Request a Quote', '/contact/'] },
  fr: { home: ['Accueil', languageHomes.fr], about: ['À propos', '/fr/a-propos-de-corncomp-fabricant-d-emballages-papier-biodegradables/'], product: ['Produits', '/fr/produits/'], certifications: ['Certifications', '/fr/certifications-corncomp/'], cases: ['Études de cas', '/fr/la-confiance-des-grandes-marques-etudes-de-cas-corncomp/'], blog: ['Blog', '/fr/blog/'], faq: ['FAQ', '/fr/faq-corncomp/'], contact: ['Contact', '/fr/contactez-nous/'] },
  es: { home: ['Inicio', languageHomes.es], about: ['Sobre nosotros', '/es/sobre-corncomp-fabricante-de-envases-de-papel-biodegradables/'], product: ['Productos', '/es/productos/'], certifications: ['Certificaciones', '/es/certificaciones-de-corncomp/'], cases: ['Casos de estudio', '/es/la-confianza-de-las-marcas-globales-casos-de-estudio-de-corncomp/'], blog: ['Blog', '/es/blog/'], faq: ['Preguntas frecuentes', '/es/preguntas-frecuentes-corncomp/'], contact: ['Contacto', '/es/contactenos/'] },
  ar: { home: ['الرئيسية', languageHomes.ar], about: ['من نحن', '/ar/%d8%b9%d9%86-corncomp-%d8%a7%d9%84%d8%b4%d8%b1%d9%83%d8%a9/'], product: ['المنتجات', '/ar/%D8%B9%D8%A8%D9%88%D8%A7%D8%AA-%D8%BA%D8%B0%D8%A7%D8%A6%D9%8A%D8%A9-%D9%88%D8%B1%D9%82%D9%8A%D8%A9-%D9%84%D9%84%D8%AC%D9%85%D9%84%D8%A9-%D9%88%D8%A7%D9%84%D8%AA%D8%B5%D9%86%D9%8A%D8%B9-%D8%AD%D8%B3%D8%A8-%D8%A7%D9%84%D8%B7%D9%84%D8%A8/'], certifications: ['الشهادات', '/ar/%d8%b4%d9%87%d8%a7%d8%af%d8%a7%d8%aa-corncomp/'], cases: ['دراسات الحالة', '/ar/%d8%af%d8%b1%d8%a7%d8%b3%d8%a7%d8%aa-%d8%ad%d8%a7%d9%84%d8%a9-corncomp/'], blog: ['المدونة', '/ar/blog/'], faq: ['الأسئلة الشائعة', '/ar/%d8%a7%d9%84%d8%a3%d8%b3%d8%a6%d9%84%d8%a9-%d8%a7%d9%84%d8%b4%d8%a7%d8%a6%d8%b9%d8%a9-corncomp/'], contact: ['اتصل بنا', '/ar/%d8%a7%d8%aa%d8%b5%d9%84-%d8%a8%d9%86%d8%a7/'] },
};

const resourceLabels = {
  en: ['Resources', 'Guides'],
  fr: ['Ressources', 'Guides'],
  es: ['Recursos', 'Guías'],
  ar: ['الموارد', 'الأدلة'],
};

for (const [language, [label, guidesLabel]] of Object.entries(resourceLabels)) {
  const route = routeFor(language, 'architecture:resources');
  const resources = navigation[language].resources || [label, route];
  resources.children = [[guidesLabel, route], navigation[language].blog];
  navigation[language].resources = resources;
}

export const categoryIdsByLanguage = {
  en: [35, 20, 25, 52, 60, 59, 61, 64, 45],
  fr: [236, 232, 234, 240, 244, 242, 246, 248, 238],
  es: [188, 184, 186, 192, 196, 194, 198, 200, 190],
  ar: [203, 207, 209, 211, 217, 205, 215, 219, 213],
};

export function navigationFor(language = 'en') {
  return navigation[language] || navigation.en;
}

export function pageAlternates(pathname) {
  const normalized = normalizeLocalizedRoute(pathname);
  if (blogArchives.some(({ route }) => route === normalized)) return blogArchives;
  const contentKey = contentKeyFromRoute(normalized);
  return contentKey ? alternateGroup(contentKey) : [];
}
