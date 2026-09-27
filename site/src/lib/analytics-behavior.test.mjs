import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const html = await readFile(new URL('../../dist/index.html', import.meta.url), 'utf8');
const analyticsScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((script) => script.includes('corncomp-analytics-consent'));

function runAnalyticsPage({ href, storage }) {
  const listeners = new Map();
  const appendedScripts = [];
  const banner = { hidden: true };
  const effects = { focus: null, reloads: 0, replacements: [] };
  const allow = { addEventListener: (_, listener) => listeners.set('allow', listener), focus() { effects.focus = 'allow'; } };
  const decline = { addEventListener: (_, listener) => listeners.set('decline', listener) };
  const settings = { addEventListener: (_, listener) => listeners.set('settings', listener), focus() { effects.focus = 'settings'; } };
  const pageUrl = new URL(href);
  const window = {
    location: { href, search: pageUrl.search, reload() { effects.reloads += 1; } },
    dataLayer: [],
  };
  const document = {
    querySelector(selector) {
      return {
        '[data-analytics-consent]': banner,
        '[data-analytics-allow]': allow,
        '[data-analytics-decline]': decline,
        '[data-analytics-settings]': settings,
      }[selector];
    },
    createElement: () => ({}),
    head: { append: (script) => appendedScripts.push(script) },
  };
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  vm.runInNewContext(analyticsScript, {
    document, window, localStorage, history: { replaceState: (_, __, url) => effects.replacements.push(url) }, URL, URLSearchParams, encodeURIComponent,
  });
  return { window, banner, listeners, appendedScripts, effects };
}

test('pending inquiries wait for consent and send only the production GA4 event without lead identifiers', () => {
  const storage = new Map();
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/fr/contactez-nous/?sent=1&lead=private-token&category=cups#inquiry-sent', storage });
  assert.equal(page.window.dataLayer.length, 0);
  assert.equal(storage.has('corncomp-reported-leads'), false);
  page.listeners.get('allow')();
  page.listeners.get('allow')();
  assert.equal(page.appendedScripts.length, 1);
  assert.equal(page.appendedScripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-R1SHNYEBN8');
  const events = page.window.dataLayer.map((entry) => Array.from(entry)).filter((entry) => entry[0] === 'event');
  assert.deepEqual(events, [['event', 'generate_lead']]);
  assert.ok(page.effects.replacements.every((url) => url === '/fr/contactez-nous/?category=cups#inquiry-sent'));
});

test('denied consent clears inquiry markers without loading analytics or reporting a lead', () => {
  const storage = new Map([['corncomp-analytics-consent', 'denied']]);
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/contact/?sent=1&lead=declined#inquiry-sent', storage });
  assert.equal(page.appendedScripts.length, 0);
  assert.equal(page.window.dataLayer.length, 0);
  assert.equal(storage.has('corncomp-reported-leads'), false);
  assert.deepEqual(page.effects.replacements, ['/contact/#inquiry-sent']);
});

test('reopening and revoking consent returns keyboard focus and reloads the loaded tracker', () => {
  const storage = new Map([['corncomp-analytics-consent', 'granted']]);
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/ar/blog/', storage });
  page.listeners.get('settings')();
  assert.equal(page.banner.hidden, false);
  assert.equal(page.effects.focus, 'allow');
  page.listeners.get('decline')();
  assert.equal(page.banner.hidden, true);
  assert.equal(page.effects.focus, 'settings');
  assert.equal(page.effects.reloads, 1);
  assert.equal(storage.get('corncomp-analytics-consent'), 'denied');
});

test('does not load Google Analytics before a visitor allows it', () => {
  const page = runAnalyticsPage({ href: 'https://corn-comp.com/', storage: new Map() });

  assert.equal(page.appendedScripts.length, 0);
  assert.equal(page.banner.hidden, false);
  page.listeners.get('allow')();
  assert.equal(page.appendedScripts.length, 1);
  assert.match(page.appendedScripts[0].src, /G-R1SHNYEBN8/);
});

test('reports each successful inquiry token only once across later page loads', () => {
  const storage = new Map([['corncomp-analytics-consent', 'granted']]);
  const pages = ['lead-a', 'lead-b', 'lead-a'].map((lead) => runAnalyticsPage({
    href: `https://corn-comp.com/contact/?sent=1&lead=${lead}#inquiry-sent`,
    storage,
  }));
  const leadEvents = pages.flatMap(({ window }) => window.dataLayer)
    .filter((entry) => entry[0] === 'event' && entry[1] === 'generate_lead');

  assert.equal(leadEvents.length, 2);
});
