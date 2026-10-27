import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { SUPPORTED_LANGUAGES, routeFor } from './localization.mjs';

const home = (language) => readFile(new URL(`../../dist/${routeFor(language, 'home').slice(1)}index.html`, import.meta.url), 'utf8');

test('four sourcing questions follow the certificates and precede shortcuts in every language', async () => {
  for (const language of SUPPORTED_LANGUAGES) {
    const html = await home(language);
    const questions = html.match(/<section[^>]*id="sourcing-questions"[\s\S]*?<\/section>/)?.[0];
    assert.ok(questions, language);
    assert.equal((questions.match(/<article\b/g) || []).length, 4);
    assert.ok(html.indexOf('id="home-certifications"') < html.indexOf(questions));
    assert.ok(html.indexOf(questions) < html.indexOf('id="packaging-enquiry"'));
    assert.equal((questions.match(/<a\b/g) || []).length, 1, 'only the overall FAQ entry remains');
    assert.ok(questions.includes('href="/faq/"'));
    assert.match(questions, /30[,. ]000|30,000/);
    assert.match(questions, /50[,. ]000|50,000/);
    assert.match(questions, /352/);
  }
});

test('homepage navigation switches its solid state on scroll and resets at the top', async () => {
  const html = await home('en');
  const script = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(([, code]) => code).find((code) => code.includes("toggleAttribute('data-scrolled'"));
  assert.ok(script, 'scroll-state behavior is shipped');
  let solid;
  let onScroll;
  let onPageShow;
  const header = { toggleAttribute: (name, state) => { assert.equal(name, 'data-scrolled'); solid = state; } };
  const window = { scrollY: 0, addEventListener: (event, fn, options) => {
    if (event === 'pageshow') { onPageShow = fn; return; }
    assert.equal(event, 'scroll'); assert.equal(options.passive, true); onScroll = fn;
  } };
  vm.runInNewContext(script, { document: { querySelector: () => header }, window });
  assert.equal(solid, undefined, 'do not force layout while parsing the header');
  onPageShow();
  assert.equal(solid, false);
  window.scrollY = 200; onScroll(); assert.equal(solid, true);
  window.scrollY = 0; onScroll(); assert.equal(solid, false);
});
