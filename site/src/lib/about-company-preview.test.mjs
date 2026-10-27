import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'parse5';
import { routeFor } from './localization.mjs';
import { ABOUT_TRANSLATIONS } from '../data/about-translations.mjs';
import vm from 'node:vm';

const nodes = (node) => [node, ...(node.childNodes ?? []).flatMap(nodes)];
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;

test('About team panel keeps the real group photo with one heading and one factual paragraph', () => {
  for (const language of ['en', 'fr', 'es', 'ar', 'zh', 'de']) {
    const route = routeFor(language, 'architecture:about');
    const all = nodes(parse(readFileSync(new URL('../../dist' + route + 'index.html', import.meta.url), 'utf8')));
    const team = all.find((node) => attr(node, 'id') === 'team');
    const siblings = team.parentNode.childNodes.filter((node) => node.tagName === 'section');
    assert.ok(attr(siblings[siblings.indexOf(team) + 1], 'class')?.split(' ').includes('company-contact'), language + ': team leads directly to contact');
    const copy = nodes(team).find((node) => attr(node, 'class') === 'team-copy');
    assert.equal(nodes(copy).filter((node) => node.tagName === 'h2').length, 1);
    assert.equal(nodes(copy).filter((node) => node.tagName === 'p').length, 1, language + ': no repeated eyebrow or mission text');
    assert.equal(nodes(copy).filter((node) => node.tagName === 'blockquote').length, 0);
    assert.ok(nodes(team).some((node) => node.tagName === 'img' && attr(node, 'src')?.endsWith('/corncomp-team-archive.webp')));
    assert.ok(nodes(team).some((node) => node.tagName === 'figcaption'), 'archive context remains clear');
  }
});

test('activating the company video creates the selected privacy-enhanced player only after a click', () => {
  const all = nodes(parse(readFileSync(new URL('../../dist/about/index.html', import.meta.url), 'utf8')));
  const script = all.find((node) => node.tagName === 'script' && node.childNodes?.some((child) => child.value?.includes('youtube-nocookie.com/embed/EqrXHrFuIGc')));
  assert.ok(script);
  let click;
  let created = 0;
  let replaced;
  let focused = false;
  const button = { addEventListener: (event, handler) => { assert.equal(event, 'click'); click = handler; }, getAttribute: () => '播放公司视频（YouTube）', replaceWith: (player) => { replaced = player; } };
  const document = { querySelectorAll: () => [button], createElement: (tag) => { assert.equal(tag, 'iframe'); created++; return { focus: () => { focused = true; } }; } };
  vm.runInNewContext(script.childNodes.map((node) => node.value || '').join(''), { document });
  assert.equal(created, 0);
  click();
  assert.equal(created, 1);
  assert.equal(replaced.src, 'https://www.youtube-nocookie.com/embed/EqrXHrFuIGc?autoplay=1&rel=0');
  assert.equal(replaced.title, '播放公司视频（YouTube）');
  assert.equal(replaced.allowFullscreen, true);
  assert.equal(replaced.referrerPolicy, 'strict-origin-when-cross-origin');
  assert.equal(focused, true);
});

test('About company video stays click-to-load and retains a direct YouTube fallback in all languages', () => {
  for (const language of ['en', 'fr', 'es', 'ar', 'zh', 'de']) {
    const route = routeFor(language, 'architecture:about');
    const all = nodes(parse(readFileSync(new URL('../../dist' + route + 'index.html', import.meta.url), 'utf8')));
    const overview = all.find((node) => attr(node, 'id') === 'company');
    const content = nodes(overview);
    assert.ok(content.some((node) => node.tagName === 'button' && attr(node, 'data-company-video') !== undefined && attr(node, 'aria-label')), language + ': explicit video activation');
    assert.ok(!content.some((node) => node.tagName === 'iframe'), 'no initial third-party player request');
    const poster = content.find((node) => node.tagName === 'img');
    assert.ok(poster && attr(poster, 'src')?.startsWith('/media/'), 'lightweight local poster');
    assert.ok(content.some((node) => node.tagName === 'a' && attr(node, 'href') === 'https://www.youtube.com/watch?v=EqrXHrFuIGc'));
  }
});

test('About previews add the supplied vision wording and company background without turning it into a catalogue', () => {
  for (const language of ['en', 'fr', 'es', 'ar', 'zh', 'de']) {
    const route = routeFor(language, 'architecture:about');
    const all = nodes(parse(readFileSync(new URL('../../dist' + route + 'index.html', import.meta.url), 'utf8')));
    const vision = all.find((node) => attr(node, 'id') === 'vision');
    assert.ok(vision, language + ': vision statement is present');
    const copy = nodes(vision).filter((node) => node.nodeName === '#text').map((node) => node.value.trim()).filter(Boolean);
    for (const line of ['Make Tableware', 'Bio-degradable, Eco-Friendly', 'We Do everything we can to support Green Earth']) assert.ok(copy.includes(line), language + ': preserve supplied wording ' + line);
    const statement = nodes(vision).find((node) => attr(node, 'class') === 'vision-lettering');
    assert.equal(attr(statement, 'lang'), 'en');
    assert.equal(attr(statement, 'dir'), 'ltr');
    const manufacturing = all.find((node) => attr(node, 'id') === 'manufacturing');
    assert.ok(manufacturing, language + ': manufacturing section');
    assert.ok(nodes(manufacturing).some((node) => node.tagName === 'p' && attr(node, 'id') === 'development'), language + ': development is integrated into manufacturing copy');
    const overview = all.find((node) => attr(node, 'id') === 'company');
    assert.ok(nodes(overview).filter((node) => node.tagName === 'p').length >= 2, language + ': expanded company introduction');
    assert.equal(nodes(vision).filter((node) => node.tagName === 'p').length, 2, 'vision contains only the requested statement, without an explanatory paragraph');
  }
});

test('About design preview preserves supplied photographs, certificate links and noindex', () => {
  const preview = parse(readFileSync(new URL('../../dist/design-preview/about/index.html', import.meta.url), 'utf8'));
  const all = nodes(preview);
  const main = all.find((node) => node.tagName === 'main');
  const content = nodes(main);
  for (const name of ['corncomp-team-archive.webp', 'corncomp-straw-packing-archive.webp']) {
    assert.ok(content.some((node) => node.tagName === 'img' && attr(node, 'src')?.endsWith(name)), name);
  }
  const certificates = content.filter((node) => node.tagName === 'a' && attr(node, 'data-company-certificate'));
  assert.equal(certificates.length, 4);
  assert.ok(certificates.every((node) => attr(node, 'href') === '/quality/#documents'));
  for (const id of ['company', 'team']) {
    assert.ok(content.some((node) => attr(node, 'id') === id), 'Existing About anchor missing: ' + id);
  }
  const headers = readFileSync(new URL('../../dist/_headers', import.meta.url), 'utf8');
  assert.match(headers, /\/design-preview\/\*[\r\n ]+X-Robots-Tag: noindex, nofollow/);
});

test('all six About pages publish the approved corporate design with local links and metadata', () => {
  const headings = { en: 'About Corncomp', fr: 'À propos de Corncomp', es: 'Acerca de Corncomp', ar: 'عن كورنكومب', zh: '关于遇米', de: 'Über Corncomp' };
  for (const language of ['en', 'fr', 'es', 'ar', 'zh', 'de']) {
    const route = routeFor(language, 'architecture:about');
    const html = readFileSync(new URL('../../dist' + route + 'index.html', import.meta.url), 'utf8');
    const all = nodes(parse(html));
    const company = all.find((node) => attr(node, 'class')?.split(' ').includes('company-page'));
    assert.ok(company, route);
    const content = nodes(company);
    const h1 = content.find((node) => node.tagName === 'h1');
    assert.equal(nodes(h1).filter((node) => node.nodeName === '#text').map((node) => node.value).join('').trim(), headings[language]);
    assert.ok(content.some((node) => node.tagName === 'a' && attr(node, 'href') === routeFor(language, 'architecture:about/factory')), route);
    assert.equal(content.filter((node) => attr(node, 'data-company-certificate') && attr(node, 'href') === routeFor(language, 'architecture:quality') + '#documents').length, 4);
    assert.ok(content.some((node) => node.tagName === 'a' && attr(node, 'href')?.startsWith(routeFor(language, 'architecture:contact') + '?')), route);
    assert.ok(!content.some((node) => node.tagName === 'a' && attr(node, 'href')?.startsWith('/products/')), route);
    assert.ok(all.some((node) => node.tagName === 'link' && attr(node, 'rel') === 'canonical' && attr(node, 'href') === 'https://corn-comp.com' + route), route);
    assert.doesNotMatch(html, /DESIGN PREVIEW|href="\/design-preview\/|Company Design Preview/);
    assert.ok(html.includes(language === 'ar' ? 'dir="rtl"' : 'dir="ltr"'), route);
    if (language !== 'en') {
      const visible = new Set(content.flatMap((node) => [
        ...(node.nodeName === '#text' ? [node.value.trim().replace(/\s+/g, ' ')] : []),
        ...(node.attrs ?? []).filter((item) => ['alt', 'aria-label', 'title'].includes(item.name)).map((item) => item.value),
      ]));
      for (const [english, translated] of Object.entries(ABOUT_TRANSLATIONS[language])) {
        assert.ok(typeof translated === 'string' && translated.trim(), language + ': ' + english);
        if (translated !== english) assert.ok(!visible.has(english), language + ' has untranslated About copy: ' + english);
      }
    }
  }
});

test('About company content does not send readers into a product catalogue', () => {
  const preview = parse(readFileSync(new URL('../../dist/design-preview/about/index.html', import.meta.url), 'utf8'));
  const company = nodes(preview).find((node) => attr(node, 'class')?.split(' ').includes('company-page'));
  const catalogueLinks = nodes(company).filter((node) => node.tagName === 'a' && attr(node, 'href')?.startsWith('/products/'));
  assert.equal(catalogueLinks.length, 0);
});
