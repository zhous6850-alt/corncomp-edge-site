import assert from 'node:assert/strict';
import test from 'node:test';
import { navigationFor, pageAlternates } from './site-config.mjs';
import { SUPPORTED_LANGUAGES, allLocalizedEntries, alternateGroup, contentKeyFromRoute, englishInventory, localizedRedirects, normalizeLocalizedRoute } from './localization.mjs';

test('translated navigation stays inside the selected language', () => {
  assert.equal(navigationFor('fr').product[1], '/fr/produits/');
  assert.equal(navigationFor('es').blog[1], '/es/blog/');
  assert.equal(navigationFor('ar').contact[1].startsWith('/ar/'), true);
});

test('known page groups expose four hreflang alternatives', () => {
  assert.deepEqual(pageAlternates('/products/').map((item) => item.language), ['en', 'fr', 'es', 'ar']);
  assert.deepEqual(pageAlternates('/product/paper-lid/'), []);
});

test('Resources exposes exact localized Guides and Blog destinations', () => {
  const expected = {
    en: { label: 'Resources', guides: ['Guides', '/resources/'], blog: ['Blog', '/blog/'] },
    fr: { label: 'Ressources', guides: ['Guides', '/fr/ressources/'], blog: ['Blog', '/fr/blog/'] },
    es: { label: 'Recursos', guides: ['Guías', '/es/recursos/'], blog: ['Blog', '/es/blog/'] },
    ar: { label: 'الموارد', guides: ['الأدلة', '/ar/%D9%85%D9%88%D8%A7%D8%B1%D8%AF-%D8%B4%D8%B1%D8%A7%D8%A1-%D8%B9%D8%A8%D9%88%D8%A7%D8%AA-%D8%A7%D9%84%D8%B7%D8%B9%D8%A7%D9%85/'], blog: ['المدونة', '/ar/blog/'] },
  };

  for (const [language, { label, guides, blog }] of Object.entries(expected)) {
    const resources = navigationFor(language).resources;
    assert.equal(resources[0], label, `${language}: Resources label`);
    assert.deepEqual(resources.children, [guides, blog], `${language}: submenu destinations`);
  }
});

test('blog archives share one reciprocal hreflang identity', () => {
  const expected = [
    { language: 'en', route: '/blog/' },
    { language: 'fr', route: '/fr/blog/' },
    { language: 'es', route: '/es/blog/' },
    { language: 'ar', route: '/ar/blog/' },
  ];
  for (const { route } of expected) assert.deepEqual(pageAlternates(route), expected, route);
});

test('verified translated articles expose reciprocal deep-page alternatives', () => {
  const route = '/eu-single-use-plastics-directive-explained/';
  const alternatives = pageAlternates(route);

  assert.deepEqual(alternatives.map((item) => item.language), ['en', 'fr', 'es', 'ar']);
  assert.equal(alternatives[1].route, '/fr/directive-europeenne-sur-les-plastiques-a-usage-unique-ce-quelle-signifie-pour-les-acheteurs-demballages/');
  assert.match(alternatives[3].route, /%D8/);
  assert.doesNotMatch(alternatives[3].route, /%d8/);
  for (const alternate of alternatives) assert.deepEqual(pageAlternates(alternate.route), alternatives);
});

test('verified translated products use the canonical English architecture route', () => {
  const route = '/products/food-boxes-containers/sushi-boxes/black-white-cardboard-sushi-box-pla-window/';
  const alternatives = pageAlternates(route);

  assert.deepEqual(alternatives.map((item) => item.language), ['en', 'fr', 'es', 'ar']);
  assert.equal(alternatives[0].route, route);
  assert.equal(alternatives[1].route, '/fr/product/boite-a-sushi-noire-blanche-en-carton-fenetre-pla/');
  for (const alternate of alternatives) assert.deepEqual(pageAlternates(alternate.route), alternatives);
});

test('every synchronized page exposes the same reciprocal four-language group', () => {
  for (const source of englishInventory()) {
    const group = alternateGroup(source.contentKey);
    assert.deepEqual(group.map(({ language }) => language), SUPPORTED_LANGUAGES, source.contentKey);
    for (const { route } of group) assert.deepEqual(pageAlternates(route), group, route);
  }
});

test('localized canonical routes are globally unique after normalization', () => {
  const routes = allLocalizedEntries().map(({ route }) => normalizeLocalizedRoute(route));
  assert.equal(new Set(routes).size, routes.length);
});

test('reviewed localized aliases are same-language one-hop redirects to canonicals', () => {
  const canonicals = new Set(allLocalizedEntries().map(({ route }) => normalizeLocalizedRoute(route)));
  const redirects = localizedRedirects();
  for (const [source, target] of redirects) {
    assert.notEqual(source, target, source);
    assert.equal(canonicals.has(source), false, `${source}: alias is canonical`);
    assert.equal(canonicals.has(target), true, `${source}: target is not canonical`);
    assert.equal(redirects.has(target), false, `${source}: redirect chain`);
    assert.equal(source.match(/^\/(fr|es|ar)\//)?.[1], target.match(/^\/(fr|es|ar)\//)?.[1], `${source}: language`);
    assert.ok(contentKeyFromRoute(target), `${source}: target identity`);
  }
});
