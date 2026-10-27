import { createHash } from 'node:crypto';
import records from '../data/records.json' with { type: 'json' };
import fr from '../data/locales/fr.json' with { type: 'json' };
import es from '../data/locales/es.json' with { type: 'json' };
import ar from '../data/locales/ar.json' with { type: 'json' };
import zh from '../data/locales/zh.json' with { type: 'json' };
import de from '../data/locales/de.json' with { type: 'json' };
import { ARCHITECTURE_PAGES, PRODUCT_CATEGORY_BY_SLUG, canonicalProductRoute } from './site-architecture.mjs';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'ar', 'zh', 'de'];

const architectureLabels = {
  en: { featuredGuide: 'Featured guide', remainingGuides: 'More buyer guides', latestArticles: 'Latest articles', allArticles: 'View all articles', factoryEvidence: 'Factory and production context' },
  fr: { featuredGuide: 'Guide à la une', remainingGuides: 'Autres guides d’achat', latestArticles: 'Articles récents', allArticles: 'Voir tous les articles', factoryEvidence: 'Usine et contexte de production' },
  es: { featuredGuide: 'Guía destacada', remainingGuides: 'Más guías de compra', latestArticles: 'Artículos recientes', allArticles: 'Ver todos los artículos', factoryEvidence: 'Fábrica y contexto de producción' },
  ar: { featuredGuide: 'الدليل المميز', remainingGuides: 'المزيد من أدلة الشراء', latestArticles: 'أحدث المقالات', allArticles: 'عرض جميع المقالات', factoryEvidence: 'المصنع وسياق الإنتاج' },
  zh: { featuredGuide: '精选指南', remainingGuides: '更多采购指南', latestArticles: '最新文章', allArticles: '查看全部文章', factoryEvidence: '工厂与生产情况' },
  de: { featuredGuide: 'Ausgewählter Leitfaden', remainingGuides: 'Weitere Einkaufsleitfäden', latestArticles: 'Neueste Artikel', allArticles: 'Alle Artikel ansehen', factoryEvidence: 'Fabrik- und Produktionskontext' },
};

export const architectureLabelsFor = (language) => architectureLabels[language];

const blogLabels = {
  en: { featured: 'Featured article', readArticle: 'Read article', moreArticles: 'More articles', contents: 'On this page', related: 'Related articles', breadcrumbs: 'Breadcrumb' },
  fr: { featured: 'Article à la une', readArticle: 'Lire l’article', moreArticles: 'Autres articles', contents: 'Dans cet article', related: 'Articles connexes', breadcrumbs: 'Fil d’Ariane' },
  es: { featured: 'Artículo destacado', readArticle: 'Leer artículo', moreArticles: 'Más artículos', contents: 'En este artículo', related: 'Artículos relacionados', breadcrumbs: 'Ruta de navegación' },
  ar: { featured: 'مقال مميز', readArticle: 'قراءة المقال', moreArticles: 'المزيد من المقالات', contents: 'في هذه الصفحة', related: 'مقالات ذات صلة', breadcrumbs: 'مسار التنقل' },
  zh: { featured: '精选文章', readArticle: '阅读文章', moreArticles: '更多文章', contents: '本页内容', related: '相关文章', breadcrumbs: '面包屑导航' },
  de: { featured: 'Ausgewählter Artikel', readArticle: 'Artikel lesen', moreArticles: 'Weitere Artikel', contents: 'Auf dieser Seite', related: 'Ähnliche Artikel', breadcrumbs: 'Brotkrümelnavigation' },
};

export const blogLabelsFor = (language) => blogLabels[language];

export const ENGLISH_HOME = {
  contentKey: 'home',
  type: 'home',
  route: '/',
  title: 'Paper Food Packaging Manufacturer | Corncomp',
  description: 'Corncomp manufactures paper cups, bowls, food boxes, paper straws and foodservice supplies for wholesale and custom packaging programs.',
  hero: {
    imageAlt: 'Corncomp paper food packaging in beverage service',
    eyebrow: 'Paper packaging manufacturer · Ningbo, China',
    heading: 'Biodegradable Paper Food Packaging',
    text: 'Cups, bowls, food boxes and paper straws for distributors and restaurant groups, with custom printing available.',
    primaryLabel: 'Explore products',
    primaryKey: 'architecture:products',
    secondaryLabel: 'Request a quote',
    secondaryKey: 'architecture:contact',
  },
  proof: [
    ['8,000 m²', 'Manufacturing base'],
    ['6,800 m²', 'GMP-standard dust-free workshop'],
    ['60', 'Production lines'],
    ['2.5 billion', 'Annual paper straw capacity'],
  ],
  proofLabel: 'Manufacturing overview',
  productIntro: {
    eyebrow: 'Product architecture',
    heading: 'Find the format first.<br>Specify the order second.',
    text: 'Browse by packaging function, compare real catalogue products, and carry the selected item into a contextual inquiry. No shopping cart—just a clearer path from product research to a usable B2B specification.',
  },
  productPathways: [
    ['architecture:products/cups-bowls', 'Cups & Bowls', 'Paper cups, soup cups, salad bowls and ice cream cups with matching component options.'],
    ['architecture:products/food-boxes-containers', 'Food Boxes & Containers', 'Meal boxes, sandwich and sushi boxes, burger packs, wrap sleeves and fry packaging.'],
    ['architecture:products/foodservice-supplies', 'Foodservice Supplies', 'Paper straws, disposable cutlery and paper plates for distribution and custom programs.'],
  ],
  factory: {
    imageAlt: 'Production machinery inside the Corncomp workshop in Ningbo',
    eyebrow: 'Our Ningbo factory',
    heading: 'Our Ningbo Factory',
    text: 'Founded in 2018, Corncomp manufactures paper straws, cups and bowls in Ningbo, China. Our company premises cover 8,000 m², including 6,800 m² of factory space.',
    bullets: ['Straight, bendable and angled paper straws', 'Paper cups and kraft or white paper bowls', 'Printing, slitting, die-cutting and forming', 'Product wrapping and carton packing'],
    label: 'Explore our factory',
    contentKey: 'architecture:about/factory',
  },
  programs: {
    eyebrow: 'Plan the complete program',
    heading: 'Find what you need',
    cards: [
      ['architecture:custom-packaging', 'Custom printing', 'Explore printed cups, straws and artwork requirements.'],
      ['architecture:applications', 'Packaging by application', 'Find packaging for takeaway, restaurants, desserts and supermarkets.'],
      ['architecture:quality', 'Certificates & reports', 'View certificate images and their product scope.'],
      ['architecture:resources', 'Guides & FAQs', 'Compare cup sizes and get answers about ordering.'],
    ],
  },
  cta: {
    eyebrow: 'Ready to specify?',
    heading: 'Let’s talk about your packaging needs.',
    text: 'Tell us which products you need, your estimated quantity and delivery destination.',
    label: 'Request a quote',
    contentKey: 'architecture:contact',
  },
};

export const ENGLISH_UI = {
  menu: 'Menu',
  allProducts: 'All Products',
  requestQuote: 'Request a quote',
  contactUs: 'Contact Us',
  brandHomeLabel: 'Corncomp home',
  primaryNavigationLabel: 'Primary navigation',
  socialMediaLabel: 'Corncomp social media',
  addressHeading: 'Our Address',
  footerNavigationLabel: 'Footer navigation',
  copyrightLabel: 'Copyright © 2026 Ningbo Corncomp Tech Co., Ltd. All rights reserved.',
  analyticsConsentHeading: 'Optional analytics',
  analyticsConsentBody: 'We use Google Analytics to understand visits and successful inquiries. Analytics stays off until you allow it.',
  analyticsSettings: 'Analytics settings',
  allowAnalytics: 'Allow analytics',
  declineAnalytics: 'Decline',
  productGroup: 'Product group',
  viewProductFamilies: 'View product families',
  relatedProducts: 'Related products',
  specifications: 'Catalogue specifications',
  orderingQuestions: 'Ordering questions',
};

export const contentKeyForArchitecture = (page) => `architecture:${page.route.replace(/^\/+|\/+$/g, '')}`;
export const contentKeyForRecord = (record) => `${record.type}:${record.slug}`;

export function englishInventory() {
  const architecture = ARCHITECTURE_PAGES.map((page) => ({ ...page, contentKey: contentKeyForArchitecture(page), type: 'architecture' }));
  const products = records
    .filter((record) => record.language === 'en' && record.type === 'product' && PRODUCT_CATEGORY_BY_SLUG[record.slug])
    .map((record) => ({ ...record, contentKey: contentKeyForRecord(record), route: canonicalProductRoute(record.slug) }));
  const posts = records
    .filter((record) => record.language === 'en' && record.type === 'post')
    .map((record) => ({ ...record, contentKey: contentKeyForRecord(record) }));
  return [ENGLISH_HOME, ...architecture, ...products, ...posts];
}

const sourceFields = [
  'contentKey', 'route', 'title', 'description', 'intro', 'body', 'excerpt', 'seo',
  'sections', 'links', 'preparedBy', 'reviewedLabel', 'table', 'sourceIntro', 'sources',
  'hero', 'proof', 'proofLabel', 'productIntro', 'productPathways', 'factory', 'programs', 'cta',
];

export const sourceHash = (item) => createHash('sha256')
  .update(JSON.stringify(Object.fromEntries([
    ...sourceFields.map((field) => [field, item[field] ?? null]),
    ['featuredMediaAlt', item.featuredMedia?.alt ?? null],
  ])))
  .digest('hex');

export function normalizeLocalizedRoute(route) {
  return encodeURI(decodeURI(route)).replace(/%[\da-f]{2}/gi, (part) => part.toUpperCase());
}

const localeByLanguage = { fr, es, ar, zh, de };

export function localeData(language) {
  if (!Object.hasOwn(localeByLanguage, language)) throw new Error(`Unsupported locale: ${language}`);
  return localeByLanguage[language];
}

export function localizedEntry(language, contentKey) {
  if (language === 'en') return englishInventory().find((item) => item.contentKey === contentKey) || null;
  const content = localeData(language).content;
  return Object.hasOwn(content, contentKey) ? content[contentKey] : null;
}

export function routeFor(language, contentKey) {
  return localizedEntry(language, contentKey)?.route || null;
}

export function localizedShopRedirects() {
  return new Map(['fr', 'es', 'ar', 'zh', 'de'].map((language) => [`/${language}/shop/`, routeFor(language, 'architecture:products')]));
}

export function allLocalizedEntries() {
  return SUPPORTED_LANGUAGES.flatMap((language) => englishInventory().flatMap((source) => {
    const entry = localizedEntry(language, source.contentKey);
    return entry ? [{ language, contentKey: source.contentKey, ...entry }] : [];
  }));
}

export function contentKeyFromRoute(route) {
  const normalized = normalizeLocalizedRoute(route);
  return allLocalizedEntries().find((entry) => normalizeLocalizedRoute(entry.route) === normalized)?.contentKey || null;
}

export function alternateGroup(contentKey) {
  return SUPPORTED_LANGUAGES.flatMap((language) => {
    const route = routeFor(language, contentKey);
    return route ? [{ language, route: normalizeLocalizedRoute(route) }] : [];
  });
}

export function localizedRedirects() {
  const redirects = new Map();
  const entries = allLocalizedEntries();
  const canonicals = new Set(entries.map(({ route }) => normalizeLocalizedRoute(route)));
  for (const entry of entries) {
    for (const alias of entry.aliases || []) {
      const source = normalizeLocalizedRoute(alias);
      const target = normalizeLocalizedRoute(entry.route);
      if (canonicals.has(source)) throw new Error(`Alias is canonical: ${source}`);
      if (redirects.has(source)) throw new Error(`Duplicate alias: ${source}`);
      redirects.set(source, target);
    }
  }
  for (const target of redirects.values()) {
    if (redirects.has(target)) throw new Error(`Redirect chain through ${target}`);
  }
  return redirects;
}

export function uiFor(language) {
  return language === 'en' ? ENGLISH_UI : localeData(language).ui;
}
