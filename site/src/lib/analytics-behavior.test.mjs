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
  const allow = { addEventListener: (_, listener) => listeners.set('allow', listener), focus() {} };
  const decline = { addEventListener: (_, listener) => listeners.set('decline', listener) };
  const settings = { addEventListener: (_, listener) => listeners.set('settings', listener), focus() {} };
  const pageUrl = new URL(href);
  const window = {
    location: { href, search: pageUrl.search, reload() {} },
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
    document, window, localStorage, history: { replaceState() {} }, URL, URLSearchParams, encodeURIComponent,
  });
  return { window, banner, listeners, appendedScripts };
}

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
