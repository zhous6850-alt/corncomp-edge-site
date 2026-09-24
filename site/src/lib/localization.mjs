import { createHash } from 'node:crypto';
import records from '../data/records.json' with { type: 'json' };
import fr from '../data/locales/fr.json' with { type: 'json' };
import es from '../data/locales/es.json' with { type: 'json' };
import ar from '../data/locales/ar.json' with { type: 'json' };
import { ARCHITECTURE_PAGES, PRODUCT_CATEGORY_BY_SLUG, canonicalProductRoute } from './site-architecture.mjs';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'ar'];

export const ENGLISH_HOME = {
  contentKey: 'home',
  type: 'home',
  route: '/',
  title: 'Paper Food Packaging Manufacturer | Corncomp',
  description: 'Corncomp manufactures paper cups, bowls, food boxes, paper straws and foodservice supplies for wholesale and custom packaging programs.',
  hero: {
    imageAlt: 'Corncomp paper food packaging in beverage service',
    eyebrow: 'Paper packaging manufacturer · Ningbo, China',
    heading: 'Paper Food Packaging, Built for Real Service',
    text: 'Cups, bowls, food boxes, paper straws and foodservice supplies for distributors, restaurant groups and custom packaging programs.',
    primaryLabel: 'Explore products',
    primaryKey: 'architecture:products',
    secondaryLabel: 'Request a quote',
    secondaryKey: 'architecture:contact',
  },
  proof: [
    ['8,000 m²', 'Manufacturing base'],
    ['6,000 m²', 'GMP-standard dust-free workshop'],
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
    imageAlt: 'Corncomp manufacturing facility',
    eyebrow: 'Manufacturing evidence',
    heading: 'A supplier page should show what buyers need to verify.',
    text: 'Review Corncomp’s factory context, production responsibilities and quality systems. Then confirm which material, production line, certificate or report applies to the exact item you plan to order.',
    bullets: ['Catalogue-based product selection', 'Custom printing and private-label review', 'Specification, sample and packing confirmation', 'Product-specific document scope checks'],
    label: 'See factory & manufacturing',
    contentKey: 'architecture:about/factory',
  },
  programs: {
    eyebrow: 'Plan the complete program',
    heading: 'Products are only one part of the decision.',
    cards: [
      ['architecture:custom-packaging', 'Custom packaging', 'Prepare size, artwork, print, packing and destination requirements before sampling.'],
      ['architecture:applications', 'Application planning', 'Choose packaging around the food, temperature, holding time, display and delivery conditions.'],
      ['architecture:quality', 'Quality & certification', 'Understand company-level certificates, test reports and item-specific document scope.'],
      ['architecture:resources', 'Buyer resources', 'Use practical guides to compare sizes and prepare a more complete sourcing brief.'],
    ],
  },
  cta: {
    eyebrow: 'Ready to specify?',
    heading: 'Send the product, quantity and destination.',
    text: 'Add artwork, packing and document requirements when available. Corncomp will review feasibility before quoting.',
    label: 'Start an inquiry',
    contentKey: 'architecture:contact',
  },
};

export const ENGLISH_UI = {
  menu: 'Menu',
  allProducts: 'All Products',
  requestQuote: 'Request a quote',
  contactUs: 'Contact Us',
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
  .update(JSON.stringify(Object.fromEntries(sourceFields.map((field) => [field, item[field] ?? null]))))
  .digest('hex');

export function normalizeLocalizedRoute(route) {
  return encodeURI(decodeURI(route)).replace(/%[\da-f]{2}/gi, (part) => part.toUpperCase());
}

const localeByLanguage = { fr, es, ar };

export function localeData(language) {
  const locale = localeByLanguage[language];
  if (!locale) throw new Error(`Unsupported locale: ${language}`);
  return locale;
}

export function localizedEntry(language, contentKey) {
  if (language === 'en') return englishInventory().find((item) => item.contentKey === contentKey) || null;
  return localeData(language).content[contentKey] || null;
}

export function routeFor(language, contentKey) {
  return localizedEntry(language, contentKey)?.route || null;
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
