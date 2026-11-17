export const RETIRED_GUIDE_KEYS = new Set([
  'architecture:resources',
  'architecture:resources/guides/paper-cup-sizes',
  'architecture:resources/guides/custom-printed-paper-cups',
  'architecture:resources/guides/food-packaging-certifications',
]);

// Keep historical translations for route recognition, but do not publish these pages.
export function removeRetiredGuideLinks(html, routes) {
  return html.replace(/<a\b[^>]*href=(["'])([^"']+)\1[^>]*>[\s\S]*?<\/a>/gi, (anchor, quote, href) => {
    try {
      const url = new URL(href, 'https://corn-comp.com');
      return url.origin === 'https://corn-comp.com' && routes.has(url.pathname) ? '' : anchor;
    } catch { return anchor; }
  });
}
