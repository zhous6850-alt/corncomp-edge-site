const LANGUAGES = new Set(['es', 'fr', 'ar']);

export function languageFromPath(pathname) {
  const prefix = pathname.split('/').filter(Boolean)[0];
  return LANGUAGES.has(prefix) ? prefix : 'en';
}

export function documentDirection(language) {
  return language === 'ar' ? 'rtl' : 'ltr';
}

export function canonicalUrl(pathname) {
  return new URL(pathname, 'https://corn-comp.com').href;
}

