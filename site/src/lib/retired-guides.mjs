export const RETIRED_GUIDE_KEYS = new Set([
  'architecture:resources',
  'architecture:resources/guides/paper-cup-sizes',
  'architecture:resources/guides/custom-printed-paper-cups',
  'architecture:resources/guides/food-packaging-certifications',
]);

export const RETIRED_GUIDE_SUCCESSORS = {
  'architecture:resources': null,
  'architecture:resources/guides/paper-cup-sizes': 'architecture:products/cups-bowls/paper-cups',
  'architecture:resources/guides/custom-printed-paper-cups': 'architecture:custom-packaging/custom-printed-paper-cups',
  'architecture:resources/guides/food-packaging-certifications': 'architecture:quality',
};

// Keep historical translations for route recognition, but do not publish these pages.
export function removeRetiredGuideLinks(html, routes) {
  return html.replace(/<a\b[^>]*href=(["'])([^"']+)\1[^>]*>[\s\S]*?<\/a>/gi, (anchor, quote, href) => {
    try {
      const url = new URL(href, 'https://corn-comp.com');
      return url.origin === 'https://corn-comp.com' && routes.has(url.pathname) ? '' : anchor;
    } catch { return anchor; }
  });
}
