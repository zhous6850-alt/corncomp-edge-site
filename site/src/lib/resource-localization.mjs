import { parseFragment, serialize } from 'parse5';
import { contentText } from './content-routes.mjs';
import { localizedEntry, routeFor, contentKeyFromRoute, normalizeLocalizedRoute } from './localization.mjs';
import fr from '../data/resource-translations-fr.json' with { type: 'json' };
import es from '../data/resource-translations-es.json' with { type: 'json' };
import ar from '../data/resource-translations-ar.json' with { type: 'json' };
import zh from '../data/resource-translations-zh.json' with { type: 'json' };
import de from '../data/resource-translations-de.json' with { type: 'json' };
import { ABOUT_TRANSLATIONS } from '../data/about-translations.mjs';

export const RESOURCE_KEYS = ['architecture:about','architecture:quality','architecture:resources','architecture:resources/guides/paper-cup-sizes','architecture:resources/guides/food-packaging-certifications'];
const dictionaries = {fr,es,ar,zh,de};
const normalize = value => contentText(value).trim().replace(/\s+/g,' ');
const translations = Object.fromEntries(Object.entries(dictionaries).map(([language,dictionary])=>[language,new Map(Object.entries({...dictionary,...ABOUT_TRANSLATIONS[language]}).map(([source,target])=>[normalize(source),target]))]));
export function resourceText(value, language) {
  return translations[language]?.get(normalize(value)) || value;
}
const contexts = new Map(Object.keys(dictionaries).flatMap(language=>[
  ...RESOURCE_KEYS.map(key=>[normalizeLocalizedRoute(routeFor(language,key)),{language,key,route:routeFor(language,key)}]),
  ['/'+language+'/blog/',{language,key:'blog',route:'/'+language+'/blog/'}],
]));
export function resourceContext(pathname) { return contexts.get(normalizeLocalizedRoute(pathname)) || null; }
export function resourceUrl(value, language) {
  const url = new URL(value,'https://corn-comp.com');
  if(url.origin !== 'https://corn-comp.com') return value;
  const key = contentKeyFromRoute(url.pathname);
  if (url.pathname === '/blog/') url.pathname='/'+language+'/blog/';
  else if(key) url.pathname=routeFor(language,key) || url.pathname;
  for(const name of ['source']) {
    const original=url.searchParams.get(name);
    const sourceKey=original&&contentKeyFromRoute(original);
    if(sourceKey)url.searchParams.set(name,routeFor(language,sourceKey));
  }
  for(const field of ['category','product'])if(url.searchParams.has(field))url.searchParams.set(field,resourceText(url.searchParams.get(field),language));
  return value.startsWith('https://') ? url.href : url.pathname+url.search+url.hash;
}
export function localizeResourceHtml(html, language) {
  const root = parseFragment(html);
  let heading='';
  function visit(node) {
    if(['script','style'].includes(node.tagName))return;
    if(node.nodeName==='#text' && node.value.trim()) {
      const text=resourceText(node.value,language);
      if(text!==node.value)node.value=(node.value.match(/^\s*/)?.[0]||'')+text+(node.value.match(/\s*$/)?.[0]||'');
    }
    for(const attr of node.attrs||[]) {
      if(['alt','aria-label','title','data-title','data-one','data-many'].includes(attr.name)||attr.name.startsWith('data-viewer-'))attr.value=resourceText(attr.value,language);
      if(attr.name==='href'&&!/^(#|mailto:|tel:|\/\/)/.test(attr.value))attr.value=resourceUrl(attr.value,language);
    }
    for(const child of node.childNodes||[])visit(child);
    if(node.tagName==='h1') {
      const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join(' ');
      heading=normalize(text(node));
    }
  }
  visit(root);
  return {html:serialize(root),heading};
}
export function localizeResourceSchema(value, language, heading) {
  if(Array.isArray(value))return value.map(item=>localizeResourceSchema(item,language,heading));
  if(value&&typeof value==='object'&&value['@type']==='ListItem'&&typeof value.item==='string'&&value.item.startsWith('https://corn-comp.com')) {
    const key=contentKeyFromRoute(new URL(value.item).pathname);
    const label=key&&localizedEntry(language,key)?.title;
    return {...value,name:label?contentText(label):resourceText(value.name,language),item:resourceUrl(value.item,language)};
  }
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,
    (key==='headline'&&value['@type']==='Article')||(key==='name'&&['WebPage','CollectionPage'].includes(value['@type']))?heading:localizeResourceSchema(item,language,heading)]));
  if(typeof value!=='string'||value.includes('#organization')||value.startsWith('https://schema.org'))return value;
  return value.startsWith('https://corn-comp.com')?resourceUrl(value,language):resourceText(value,language);
}
