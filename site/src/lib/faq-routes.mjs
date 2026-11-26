export const FAQ_LANGUAGES = ['en','fr','es','ar','zh','de'];
export const faqRoute = language => (language==='en'?'':'/'+language)+'/faq/';
export const faqAlternates = FAQ_LANGUAGES.map(language=>({language,route:faqRoute(language)}));
export const isFaqRoute = route => faqAlternates.some(item=>item.route===route);
