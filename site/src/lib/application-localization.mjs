import { parseFragment, serialize } from 'parse5';
import { contentKeyFromRoute, englishInventory, localizedEntry, normalizeLocalizedRoute, routeFor, SUPPORTED_LANGUAGES } from './localization.mjs';
import { contentText, localizeInternalLinks } from './content-routes.mjs';
import fr from '../data/application-translations-fr.json' with { type: 'json' };
import es from '../data/application-translations-es.json' with { type: 'json' };
import ar from '../data/application-translations-ar.json' with { type: 'json' };
import zh from '../data/application-translations-zh.json' with { type: 'json' };
import de from '../data/application-translations-de.json' with { type: 'json' };

export const APPLICATION_SCENES = ['takeaway-packaging', 'restaurant-packaging', 'fast-food-packaging', 'ice-cream-dessert-packaging', 'supermarket-packaging'];
const dictionaries = { fr, es, ar, zh, de };
const normalized = (text) => text.trim().replace(/\s+/g, ' ').replaceAll('&amp;', '&');
const translations = Object.fromEntries(Object.entries(dictionaries).map(([language, dictionary]) => [language, new Map(Object.entries(dictionary).map(([key, value]) => [normalized(key), value]))]));
const productKeys = new Map(englishInventory().filter((item) => item.type === 'product').map((item) => [normalized(contentText(item.title)), item.contentKey]));

export function applicationRoute(language, scene = '') {
  return scene === 'supermarket-packaging'
    ? (language === 'en' ? '' : '/' + language) + '/applications/supermarket-packaging/'
    : routeFor(language, 'architecture:applications' + (scene ? '/' + scene : ''));
}

const applicationContexts = new Map(SUPPORTED_LANGUAGES.flatMap((language) => ['', ...APPLICATION_SCENES].map((scene) => {
  const route = applicationRoute(language, scene);
  return [route, { language, scene, route }];
})));

export function applicationContext(pathname) {
  return applicationContexts.get(normalizeLocalizedRoute(pathname)) || null;
}

export function applicationText(text, language) {
  const key = productKeys.get(normalized(text));
  return translations[language]?.get(normalized(text)) || (key && language !== 'en' ? contentText(localizedEntry(language, key).title) : text);
}

export function localizeApplicationUrl(value, language) {
  const url = new URL(value, 'https://corn-comp.com');
  if (url.origin !== 'https://corn-comp.com') return value;
  const application = applicationContext(url.pathname);
  const key = contentKeyFromRoute(url.pathname);
  url.pathname = application ? applicationRoute(language, application.scene) : key ? routeFor(language, key) : url.pathname;
  if (url.searchParams.has('source')) {
    const source = applicationContext(url.searchParams.get('source'));
    if (source) url.searchParams.set('source', applicationRoute(language, source.scene));
  }
  for (const field of ['category', 'product']) {
    if (url.searchParams.has(field)) url.searchParams.set(field, applicationText(url.searchParams.get(field), language));
  }
  return value.startsWith('https://') ? url.href : url.pathname + url.search + url.hash;
}

export function localizeApplicationHtml(html, language) {
  const fragment = parseFragment(localizeInternalLinks(html, language));
  let heading = '';
  function visit(node) {
    if (['script', 'style'].includes(node.tagName)) return;
    if (node.nodeName === '#text' && node.value.trim()) {
      const translated = applicationText(node.value, language);
      if (translated !== node.value) node.value = (node.value.match(/^\s*/)?.[0] || '') + translated + (node.value.match(/\s*$/)?.[0] || '');
    }
    for (const attribute of node.attrs || []) {
      if (['alt', 'aria-label', 'title'].includes(attribute.name)) attribute.value = applicationText(attribute.value, language);
      if (attribute.name === 'href' && !/^(#|mailto:|tel:|\/\/)/.test(attribute.value)) attribute.value = localizeApplicationUrl(attribute.value, language);
    }
    for (const child of node.childNodes || []) visit(child);
    if (node.tagName === 'h1') {
      const text = (n) => n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join(' ');
      heading = normalized(text(node));
    }
  }
  visit(fragment);
  return { html: serialize(fragment), heading };
}

export function localizeApplicationSchema(value, language, heading) {
  if (Array.isArray(value)) return value.map((item) => localizeApplicationSchema(item, language, heading));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
      key === 'name' && value['@type'] === 'WebPage' ? heading : localizeApplicationSchema(item, language, heading)]));
  }
  if (typeof value !== 'string' || value.startsWith('https://schema.org') || value.includes('#organization')) return value;
  return value.startsWith('https://corn-comp.com') ? localizeApplicationUrl(value, language) : applicationText(value, language);
}
